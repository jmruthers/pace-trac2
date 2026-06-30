import { formatDate } from '@solvera/pace-core/utils';

function parseEventDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats event start/end for master plan header KV (single day vs range). */
export function formatEventDateRange(startIso: string | null, endIso: string | null): string {
  if (startIso == null || startIso.trim() === '') return '—';
  const start = parseEventDate(startIso);
  if (start == null) return startIso;

  if (endIso == null || endIso.trim() === '') {
    return formatDate(start);
  }

  const end = parseEventDate(endIso);
  if (end == null) return formatDate(start);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) return formatDate(start);

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${formatDate(start)} – ${end.getDate()}`;
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
}
