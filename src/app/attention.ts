import { fmtBytes } from './format';

// One line above the list that answers "does anything need me?".
// It is absent when the answer is no — a banner that is always there and
// always green stops being read after a day.

export type AttentionLevel = 'none' | 'info' | 'warn';

export interface Attention {
  level: AttentionLevel;
  text: string;
  /** where a tap should go: the problem torrents, or the settings screen */
  action: 'torrents' | 'settings' | null;
}

export interface AttentionInput {
  errors: number;
  stalled: number;
  freeSpace: number;
  cleanuparr: {
    configured: boolean;
    reachable: boolean;
    failedJobs: number;
    itemsRemoved: number;
  } | null;
}

// ponytail: fixed floor, not a percentage — free space alone doesn't tell us
// the disk size. Make it a setting if the number ever feels wrong.
const LOW_DISK = 50 * 1024 ** 3;

const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

export function buildAttention(input: AttentionInput): Attention {
  const { errors, stalled, freeSpace, cleanuparr } = input;
  const torrentParts: string[] = [];
  const systemParts: string[] = [];

  if (errors > 0) torrentParts.push(plural(errors, 'error'));

  // Stalled downloads are Cleanuparr's job. Only nag about them when nothing
  // is watching them — otherwise the line would be permanently lit.
  if (stalled > 0 && !cleanuparr?.configured) torrentParts.push(`${stalled} stalled`);

  if (freeSpace > 0 && freeSpace < LOW_DISK) systemParts.push(`only ${fmtBytes(freeSpace)} free`);

  if (cleanuparr?.configured && !cleanuparr.reachable) {
    systemParts.push('Cleanuparr unreachable');
  } else if (cleanuparr?.reachable && cleanuparr.failedJobs > 0) {
    systemParts.push(`${plural(cleanuparr.failedJobs, 'Cleanuparr job')} failed`);
  }

  const parts = [...torrentParts, ...systemParts];
  if (parts.length) {
    return {
      level: 'warn',
      text: parts.join(' · '),
      action: torrentParts.length ? 'torrents' : 'settings',
    };
  }

  if (cleanuparr?.reachable && cleanuparr.itemsRemoved > 0) {
    return {
      level: 'info',
      text: `Cleanuparr removed ${plural(cleanuparr.itemsRemoved, 'download')}`,
      action: 'settings',
    };
  }

  return { level: 'none', text: '', action: null };
}
