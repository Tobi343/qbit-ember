import { Injectable, signal } from '@angular/core';

// Optional integration. Cleanuparr is proxied by nginx at /cleanuparr/, which
// also injects the API key. Everything here degrades to "not there": if the
// proxy is absent (dev server), the host unreachable or the key wrong, the UI
// simply never shows Cleanuparr.

export interface CleanuparrJob { name: string; totalRuns: number; failed: number; }

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
const SEEN_KEY = 'cleanuparr-seen';
// How long a past sighting keeps counting as "configured". Long enough that an
// outage over a weekend is still reported, short enough that removing
// Cleanuparr for good stops nagging on its own.
const SEEN_TTL_MS = 7 * 24 * 3600_000;

@Injectable({ providedIn: 'root' })
export class CleanuparrService {
  readonly stats = signal<CleanuparrStats | null>(null);
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
        this.configured.set(true);
        localStorage.setItem(SEEN_KEY, String(Date.now()));
      } else {
        this.reachable.set(false);
      }
    } catch {
      this.reachable.set(false);
    }
    // Back off when Cleanuparr was never there — otherwise every minute burns
    // a proxy timeout and a line of nginx error log for nothing.
    const next = this.reachable() || this.configured() ? POLL_MS : IDLE_MS;
    this.timer = setTimeout(() => void this.poll(), next);
  }
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
