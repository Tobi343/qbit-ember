import { Injectable, signal } from '@angular/core';

// Optional integration. Cleanuparr is proxied by nginx at /cleanuparr/, which
// also injects the API key. Everything here degrades to "not there": if the
// proxy is absent (dev server), the host unreachable or the key wrong, the UI
// simply never shows Cleanuparr.

export interface CleanuparrJob { name: string; totalRuns: number; failed: number; }

/** Latest Cleanuparr event that names a specific torrent, keyed by hash. */
export interface CleanuparrItem {
  hash: string;
  strikes: number | null;
  eventType: string;
  message: string;
  reason: string;
  at: string;
  severity: string;
}

export interface CleanuparrStats {
  events: number;
  strikes: number;
  itemsRemoved: number;
  jobs: CleanuparrJob[];
  failedJobs: number;
}

const POLL_MS = 60_000;   // ponytail: cleanup stats move slowly, no need for the 1.1s torrent cadence
const IDLE_MS = 600_000;  // never configured: back off hard so an absent Cleanuparr costs nothing
const WINDOW_H = 24;
const EVENT_PAGE = 200;
const SEEN_KEY = 'cleanuparr-seen';
// How long a past sighting keeps counting as "configured". Long enough that an
// outage over a weekend is still reported, short enough that removing
// Cleanuparr for good stops nagging on its own.
const SEEN_TTL_MS = 7 * 24 * 3600_000;

@Injectable({ providedIn: 'root' })
export class CleanuparrService {
  /** 'unknown' until the first answer. 'unauthorized' means Cleanuparr is
   *  there but rejected the key — worth telling apart from "not set up". */
  readonly status = signal<'unknown' | 'ok' | 'unauthorized' | 'unreachable'>('unknown');
  readonly stats = signal<CleanuparrStats | null>(null);
  /** hash (lowercase) → most recent event naming that torrent */
  readonly items = signal<Map<string, CleanuparrItem>>(new Map());
  readonly reachable = signal(false);
  /** True once Cleanuparr has answered at least once — persisted, so a restart
   *  while it is down still counts as "configured but silent" rather than
   *  "never set up". Without this the outage would go unreported. */
  readonly configured = signal(seenRecently());

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() { this.start(); }

  start(): void {
    if (this.timer) return;
    void this.poll();
  }

  private async poll(): Promise<void> {
    try {
      const r = await fetch(`/cleanuparr/api/stats?hours=${WINDOW_H}`);
      if (r.ok) {
        this.stats.set(parse(await r.json()));
        this.reachable.set(true);
        this.status.set('ok');
        void this.fetchEvents();
        this.markSeen();
      } else if (r.status === 401 || r.status === 403) {
        // Cleanuparr answered, so it is configured — the key is simply wrong.
        this.reachable.set(false);
        this.status.set('unauthorized');
        this.markSeen();
      } else {
        this.reachable.set(false);
        this.status.set('unreachable');
      }
    } catch {
      this.reachable.set(false);
      this.status.set('unreachable');
    }
    // Back off when Cleanuparr was never there — otherwise every minute burns
    // a proxy timeout and a line of nginx error log for nothing.
    const next = this.configured() ? POLL_MS : IDLE_MS;
    this.timer = setTimeout(() => void this.poll(), next);
  }

  private markSeen(): void {
    this.configured.set(true);
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  }

  /** Events carry the torrent hash, which is what makes the per-torrent
   *  context possible. Failure here only costs that context, never the rest. */
  private async fetchEvents(): Promise<void> {
    try {
      const r = await fetch(`/cleanuparr/api/events?pageSize=${EVENT_PAGE}`);
      if (!r.ok) return;
      const body = await r.json();
      const list: any[] = Array.isArray(body) ? body : body?.items ?? [];
      const map = new Map<string, CleanuparrItem>();
      for (const e of list) {
        const hash = String(e?.itemHash ?? '').toLowerCase();
        if (!hash) continue;
        // the API returns newest first, so the first hit per hash wins
        if (map.has(hash)) continue;
        map.set(hash, {
          hash,
          strikes: typeof e?.strikeCount === 'number' ? e.strikeCount : null,
          eventType: humanize(e?.eventType ?? ''),
          message: e?.message ?? '',
          reason: reasonOf(e),
          at: e?.timestamp ?? '',
          severity: e?.severity ?? 'Information',
        });
      }
      this.items.set(map);
    } catch {
      // leave the previous map in place
    }
  }
}

function humanize(type: string): string {
  const words = type.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return words.charAt(0) + words.slice(1).toLowerCase();
}

function reasonOf(e: any): string {
  const failed = Array.isArray(e?.failedImportReasons) ? e.failedImportReasons : [];
  return e?.deleteReason ?? e?.cleanReason ?? (failed.length ? failed.join(', ') : '');
}

function seenRecently(): boolean {
  const at = Number(localStorage.getItem(SEEN_KEY));
  if (!at) return false;
  if (Date.now() - at > SEEN_TTL_MS) {
    localStorage.removeItem(SEEN_KEY);
    return false;
  }
  return true;
}

function parse(d: any): CleanuparrStats {
  const byType = d?.jobs?.byType ?? {};
  const jobs: CleanuparrJob[] = Object.entries(byType).map(([name, j]: [string, any]) => ({
    name,
    totalRuns: j?.totalRuns ?? 0,
    failed: j?.failed ?? 0,
  }));
  return {
    events: d?.events?.totalCount ?? 0,
    strikes: d?.strikes?.totalCount ?? 0,
    itemsRemoved: d?.strikes?.itemsRemoved ?? 0,
    jobs,
    failedJobs: jobs.reduce((n, j) => n + j.failed, 0),
  };
}
