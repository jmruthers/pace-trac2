import type { DerivedItineraryDayEntry } from '@solvera/pace-core/itinerary';

/**
 * Cross-day transport and activity resources produce a departure/start row on the first
 * local day and an arrival/finish row on the last. The consolidated entry row shows the
 * full journey on the first day, so secondary-day rows are omitted from the UI.
 */
export function shouldShowConsolidatedItineraryEntry(entry: DerivedItineraryDayEntry): boolean {
  if (entry.resourceType === 'transport' && entry.entryKind === 'arrival') {
    return false;
  }
  if (entry.resourceType === 'activity' && entry.entryKind === 'finish') {
    return false;
  }
  return true;
}

export function filterConsolidatedItineraryEntries(
  entries: ReadonlyArray<DerivedItineraryDayEntry>
): DerivedItineraryDayEntry[] {
  return entries.filter(shouldShowConsolidatedItineraryEntry);
}
