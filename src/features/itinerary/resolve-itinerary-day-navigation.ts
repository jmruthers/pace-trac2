import type { ItineraryVisibleDateRange } from '@solvera/pace-core/itinerary';
import { formatInTimeZone, getUserTimeZone } from '@solvera/pace-core/utils';

function parseDayKey(dayKey: string): Date {
  return new Date(`${dayKey}T12:00:00.000Z`);
}

function formatDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Local calendar day as yyyy-MM-dd in the given IANA timezone (or browser default). */
export function todayDayKey(timezone?: string | null): string {
  const tz = timezone != null && timezone.trim() !== '' ? timezone : getUserTimeZone();
  return formatInTimeZone(new Date(), tz, 'yyyy-MM-dd');
}

export function enumerateDayKeysInRange(range: ItineraryVisibleDateRange): string[] {
  const keys: string[] = [];
  let cursor = parseDayKey(range.startDayKey);
  const end = parseDayKey(range.endDayKey);

  while (cursor.getTime() <= end.getTime()) {
    keys.push(formatDayKey(cursor));
    cursor = new Date(cursor.getTime() + 86_400_000);
  }

  return keys;
}

export function clampDayKey(
  dayKey: string,
  range: ItineraryVisibleDateRange
): string {
  if (dayKey < range.startDayKey) return range.startDayKey;
  if (dayKey > range.endDayKey) return range.endDayKey;
  return dayKey;
}

export function resolveDefaultItineraryDayKey(input: {
  range: ItineraryVisibleDateRange;
  todayKey: string;
}): string {
  const { range, todayKey } = input;
  const preferred = todayKey > range.startDayKey ? todayKey : range.startDayKey;
  return clampDayKey(preferred, range);
}

export function shiftDayKey(dayKey: string, delta: -1 | 1): string {
  const shifted = new Date(parseDayKey(dayKey).getTime() + delta * 86_400_000);
  return formatDayKey(shifted);
}

export function dayIndexInRange(
  dayKey: string,
  range: ItineraryVisibleDateRange
): number {
  return enumerateDayKeysInRange(range).indexOf(dayKey);
}
