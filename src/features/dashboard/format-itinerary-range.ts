import type { ItineraryVisibleDateRange } from '@solvera/pace-core/itinerary';

/** Display label for dashboard itinerary card, or null when no visible range. */
export function formatItineraryDateRangeLabel(
  range: ItineraryVisibleDateRange | null | undefined
): string | null {
  if (range == null) return null;
  const { startDayKey, endDayKey } = range;
  if (startDayKey.trim() === '' || endDayKey.trim() === '') return null;
  if (startDayKey === endDayKey) return startDayKey;
  return `${startDayKey} – ${endDayKey}`;
}
