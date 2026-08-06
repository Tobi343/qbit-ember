// Number and unit formatting (en-US).

const num = (n: number, digits: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function fmtBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  let v = bytes;
  while (v >= 1000 && i < units.length - 1) { v /= 1024; i++; }
  const digits = i === 0 ? 0 : units[i] === 'TB' ? 2 : 1;
  return `${num(v, digits)} ${units[i]}`;
}

export function fmtSpeed(bytesPerSec: number): string {
  if (!bytesPerSec || bytesPerSec <= 0) return '0 KB/s';
  const kb = bytesPerSec / 1024;
  if (kb < 1000) return `${num(kb, 1)} KB/s`;
  return `${num(kb / 1024, 1)} MB/s`;
}

// qBittorrent uses 8640000 as "infinity"
export function fmtEta(seconds: number): string {
  if (!seconds || seconds < 0 || seconds >= 8640000) return '∞';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(m, 1)}m`;
}

export function fmtRatio(ratio: number): string {
  return num(ratio ?? 0, 2);
}

export function fmtPercent(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

export function fmtDate(unixSeconds: number): string {
  if (!unixSeconds) return '–';
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    + ', ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Tech line for a torrent row: "1080p · BluRay · x265 · 35.6 GB · tv-sonarr"
export function techLine(name: string, size: number, category: string): string {
  const parts: string[] = [];
  const res = name.match(/\b(2160p|1080p|720p|480p|4K)\b/i);
  if (res) parts.push(res[1]);
  const src = name.match(/\b(Blu-?Ray|BDRip|WEB-?DL|WEBRip|WEB|HDTV|DVDRip|Remux)\b/i);
  if (src) parts.push(src[1]);
  const codec = name.match(/\b(x265|x264|H\.?26[45]|HEVC|AV1)\b/i);
  if (codec) parts.push(codec[1]);
  parts.push(fmtBytes(size));
  if (category) parts.push(category);
  return parts.join(' · ');
}
