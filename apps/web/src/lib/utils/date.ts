const MIN = 60;
const HOUR = 3_600;
const DAY = 86_400;
const WEEK = 604_800;
const MONTH = 2_628_000;
const YEAR = 31_536_000;

export function formatDistanceToNow(date: Date): string {
  const diff = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (diff < MIN) return `${diff}s`;
  if (diff < HOUR) return `${Math.round(diff / MIN)}m`;
  if (diff < DAY) return `${Math.round(diff / HOUR)}h`;
  if (diff < WEEK) return `${Math.round(diff / DAY)}d`;
  if (diff < MONTH) return `${Math.round(diff / WEEK)}w`;
  if (diff < YEAR) return `${Math.round(diff / MONTH)}mo`;
  return `${Math.round(diff / YEAR)}y`;
}
