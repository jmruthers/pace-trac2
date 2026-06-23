import {
  formatDateTime,
  formatInTimeZone,
  getUserTimeZone,
} from '@solvera/pace-core/utils';

export const UNDATED_DAY_KEY = 'undated';

export function formatWhen(iso: string): string {
  return formatDateTime(iso);
}

export function toDayKey(iso: string): string | null {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function formatDayHeading(dayKey: string): string {
  if (dayKey === UNDATED_DAY_KEY) return 'Undated';
  const parsed = new Date(`${dayKey}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dayKey;
  return formatInTimeZone(parsed, getUserTimeZone(), 'EEEE, d MMMM yyyy');
}

export function formatCapacity(capacity: number | null): string {
  return capacity != null ? String(capacity) : 'Uncapped';
}
