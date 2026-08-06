import { Component, computed, effect, inject, signal } from '@angular/core';
import { QbitApiService, STATE_COLOR, STATE_LABEL, Torrent, UiState } from './qbit-api.service';
import { fmtBytes, fmtDate, fmtEta, fmtRatio, fmtSpeed, techLine } from './format';

type Filter = 'active' | 'all' | 'down' | 'done' | 'paused' | 'seeding' | 'completed' | 'stalled' | 'error';
type Sort = 'status' | 'name' | 'size' | 'progress';
export type Theme = 'light' | 'dark' | 'auto';

const FILTER_LABEL: Record<Filter, string> = {
  active: 'Aktiv', all: 'Alle', down: 'Lädt', done: 'Fertig', paused: 'Wartet',
  seeding: 'Verteilt', completed: 'Fertig', stalled: 'Stockt', error: 'Fehler',
};
const SORT_LABEL: Record<Sort, string> = {
  status: 'Status', name: 'Name', size: 'Größe', progress: 'Fortschritt',
};

const FILTER_FN: Record<Filter, (t: Torrent) => boolean> = {
  all: () => true,
  active: t => t.dlspeed > 0 || t.upspeed > 0 || t.state === 'downloading',
  down: t => t.state === 'downloading' || t.state === 'stalled',
  done: t => t.state === 'completed' || t.state === 'seeding',
  paused: t => t.state === 'queued' || t.state === 'paused',
  seeding: t => t.state === 'seeding',
  completed: t => t.state === 'completed',
  stalled: t => t.state === 'stalled',
  error: t => t.state === 'error',
};

// sidebar state-dot colour per filter (design §7)
const FILTER_DOT: Record<Filter, string> = {
  all: '--t3', active: '--dl', down: '--dl', done: '--ok', paused: '--t3',
  seeding: '--ok', completed: '--ok', stalled: '--warn', error: '--bad',
};

// ponytail: fixed rank stands in for the prototype's "curated server order"
const STATE_RANK: Record<UiState, number> = {
  error: 0, downloading: 1, stalled: 2, queued: 3, paused: 4, seeding: 5, completed: 6,
};

const RING_C = 87.96; // 2π·14 — 34px ring, 3px stroke (design/README.md)
const NO_CAT = '__none__';
const NO_TAG = '__none__';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly api = inject(QbitApiService);

  // re-exported for the template
  readonly STATE_LABEL = STATE_LABEL;
  readonly STATE_COLOR = STATE_COLOR;
  readonly FILTER_LABEL = FILTER_LABEL;
  readonly SORT_LABEL = SORT_LABEL;
  readonly FILTER_DOT = FILTER_DOT;
  readonly RING_C = RING_C;
  readonly NO_CAT = NO_CAT;
  readonly NO_TAG = NO_TAG;
  readonly filters: Filter[] = ['active', 'all', 'down', 'done', 'paused'];
  readonly sideFilters: Filter[] = ['all', 'down', 'seeding', 'completed', 'paused', 'stalled', 'error'];
  readonly sorts: Sort[] = ['status', 'name', 'size', 'progress'];
  readonly fmtBytes = fmtBytes;
  readonly fmtSpeed = fmtSpeed;
  readonly fmtRatio = fmtRatio;
  readonly fmtEta = fmtEta;
  readonly fmtDate = fmtDate;
  readonly host = location.host;

  // ── State (design/README.md "State") ─────────────────────
  readonly filter = signal<Filter>('active');
  readonly sideFilter = signal<Filter>('all');
  readonly catFilter = signal<string | null>(null);   // desktop sidebar
  readonly tagFilter = signal<string | null>(null);
  readonly sort = signal<Sort>('status');
  readonly dir = signal<1 | -1>(1);
  readonly menu = signal<null | 'filter' | 'sort' | 'sort-desktop'>(null);
  readonly q = signal('');
  readonly sel = signal<string | null>(null);
  readonly sheet = signal<null | 'del'>(null);
  readonly delTarget = signal<Torrent | null>(null);
  readonly delFiles = signal(false);
  readonly open = signal<string | null>(null);   // swipe-open row hash
  readonly dragX = signal(0);                    // live drag offset of drag target
  readonly dragging = signal<string | null>(null);
  readonly toastMsg = signal('');
  readonly theme = signal<Theme>((localStorage.getItem('theme') as Theme) ?? 'auto');
  readonly isDesktop = signal(matchMedia('(min-width: 900px)').matches);

  readonly loginUser = signal('');
  readonly loginPass = signal('');

  readonly counts = computed(() => {
    const list = this.api.torrents();
    const out = {} as Record<Filter, number>;
    for (const f of Object.keys(FILTER_FN) as Filter[]) out[f] = list.filter(FILTER_FN[f]).length;
    return out;
  });

  readonly catCounts = computed(() => {
    const m = new Map<string, number>();
    for (const c of this.api.categories()) m.set(c, 0);
    let none = 0;
    for (const t of this.api.torrents()) {
      if (t.category) m.set(t.category, (m.get(t.category) ?? 0) + 1);
      else none++;
    }
    return { cats: [...m.entries()], none };
  });

  readonly tagCounts = computed(() => {
    const m = new Map<string, number>();
    let none = 0;
    for (const t of this.api.torrents()) {
      const tags = t.tags.split(',').map(s => s.trim()).filter(Boolean);
      if (!tags.length) none++;
      for (const tag of tags) m.set(tag, (m.get(tag) ?? 0) + 1);
    }
    return { tags: [...m.entries()], none };
  });

  readonly visible = computed(() => {
    const q = this.q().trim().toLowerCase();
    const desktop = this.isDesktop();
    let list = this.api.torrents().filter(FILTER_FN[desktop ? this.sideFilter() : this.filter()]);
    if (desktop) {
      const cat = this.catFilter();
      if (cat !== null) list = list.filter(t => (cat === NO_CAT ? !t.category : t.category === cat));
      const tag = this.tagFilter();
      if (tag !== null) {
        list = list.filter(t => {
          const tags = t.tags.split(',').map(s => s.trim()).filter(Boolean);
          return tag === NO_TAG ? !tags.length : tags.includes(tag);
        });
      }
    }
    if (q) list = list.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    const s = this.sort();
    list = [...list].sort((a, b) =>
      s === 'name' ? a.name.localeCompare(b.name, 'de')
      : s === 'size' ? b.size - a.size
      : s === 'progress' ? b.progress - a.progress
      : STATE_RANK[a.state] - STATE_RANK[b.state] || a.name.localeCompare(b.name, 'de'));
    return this.dir() === -1 ? list.reverse() : list;
  });

  readonly selected = computed(() => {
    const hash = this.sel();
    const list = this.visible();
    return list.find(t => t.hash === hash) ?? list[0] ?? null;
  });

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private mql = matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    effect(() => this.applyTheme(this.theme()));
    this.mql.addEventListener('change', () => this.applyTheme(this.theme()));
    const dq = matchMedia('(min-width: 900px)');
    dq.addEventListener('change', e => this.isDesktop.set(e.matches));
  }

  private applyTheme(t: Theme): void {
    localStorage.setItem('theme', t);
    const dark = t === 'dark' || (t === 'auto' && this.mql.matches);
    document.documentElement.dataset['theme'] = dark ? 'dark' : 'light';
  }

  toast(msg: string): void {
    this.toastMsg.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMsg.set(''), 1800);
  }

  techLine(t: Torrent): string { return techLine(t.name, t.size, t.category); }

  pct(t: Torrent): string { return `${Math.round(t.progress * 100)} %`; }

  trackerHost(t: Torrent): string {
    try { return new URL(t.tracker).hostname; } catch { return t.tracker || '–'; }
  }

  statusDetail(t: Torrent): string {
    switch (t.state) {
      case 'downloading':
        return `${Math.round(t.progress * 100)} % · ↓ ${fmtSpeed(t.dlspeed)} · noch ${fmtEta(t.eta)}`;
      case 'seeding': return `↑ ${fmtSpeed(t.upspeed)} · ${t.peers} Peers`;
      case 'completed': return `Verhältnis ${fmtRatio(t.ratio)}`;
      case 'queued': return 'In Warteschlange';
      case 'stalled': return 'Keine Verbindung zu Peers';
      case 'paused': return `${fmtBytes(t.completed)} geladen`;
      case 'error': return 'Fehler';
    }
  }

  // ── Swipe (open −152, threshold −70, max −176, <5px = tap) ──
  private startX = 0;
  private startY = 0;
  private baseX = 0;
  private moved = false;
  private horizontal: boolean | null = null;

  onPointerDown(ev: PointerEvent, t: Torrent): void {
    this.menu.set(null);
    this.startX = ev.clientX;
    this.startY = ev.clientY;
    this.baseX = this.open() === t.hash ? -152 : 0;
    this.moved = false;
    this.horizontal = null;
    this.dragging.set(t.hash);
    this.dragX.set(this.baseX);
  }

  onPointerMove(ev: PointerEvent, t: Torrent): void {
    if (this.dragging() !== t.hash) return;
    const dx = ev.clientX - this.startX;
    const dy = ev.clientY - this.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this.moved = true;
    if (this.horizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      this.horizontal = Math.abs(dx) > Math.abs(dy);
      if (this.horizontal) (ev.target as Element).setPointerCapture?.(ev.pointerId);
    }
    if (!this.horizontal) return;
    this.dragX.set(Math.min(0, Math.max(-176, this.baseX + dx)));
  }

  onPointerUp(t: Torrent): void {
    if (this.dragging() !== t.hash) return;
    this.dragging.set(null);
    if (!this.moved) {
      // tap: open row closes it, otherwise navigate to detail
      if (this.open()) { this.open.set(null); return; }
      this.openDetail(t);
      return;
    }
    this.open.set(this.dragX() < -70 ? t.hash : null);
  }

  rowOffset(t: Torrent): number {
    if (this.dragging() === t.hash && this.horizontal) return this.dragX();
    return this.open() === t.hash ? -152 : 0;
  }

  openDetail(t: Torrent): void {
    // Screen 2 (Detail) kommt als Nächstes
    this.sel.set(t.hash);
  }

  async togglePause(t: Torrent): Promise<void> {
    this.open.set(null);
    if (t.state === 'paused') {
      await this.api.resume(t.hash);
      this.toast('Fortgesetzt');
    } else {
      await this.api.pause(t.hash);
      this.toast('Pausiert');
    }
  }

  async reannounce(t: Torrent): Promise<void> {
    await this.api.reannounce(t.hash);
    this.toast('Neu gemeldet');
  }

  askDelete(t: Torrent): void {
    this.open.set(null);
    this.delTarget.set(t);
    this.delFiles.set(false);
    this.sheet.set('del');
  }

  async confirmDelete(): Promise<void> {
    const t = this.delTarget();
    if (!t) return;
    const withFiles = this.delFiles();
    await this.api.delete(t.hash, withFiles);
    this.sheet.set(null);
    this.delTarget.set(null);
    if (this.sel() === t.hash) this.sel.set(null);
    this.toast(withFiles ? 'Torrent und Dateien gelöscht' : 'Torrent entfernt');
  }

  toggleMenu(which: 'filter' | 'sort' | 'sort-desktop'): void {
    this.menu.set(this.menu() === which ? null : which);
  }

  pickFilter(f: Filter): void { this.filter.set(f); this.menu.set(null); }
  pickSort(s: Sort): void { this.sort.set(s); this.menu.set(null); }
  flipDir(): void { this.dir.set(this.dir() === 1 ? -1 : 1); }

  pickSideFilter(f: Filter): void { this.sideFilter.set(f); }
  pickCat(c: string | null): void { this.catFilter.set(this.catFilter() === c ? null : c); }
  pickTag(t: string | null): void { this.tagFilter.set(this.tagFilter() === t ? null : t); }

  async submitLogin(): Promise<void> {
    await this.api.login(this.loginUser(), this.loginPass());
  }
}
