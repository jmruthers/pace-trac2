import type { ItineraryEntryKind } from '@solvera/pace-core/itinerary';

const ENTRY_KIND_LABELS: Record<ItineraryEntryKind, string> = {
  departure: 'Departure',
  arrival: 'Arrival',
  start: 'Start',
  finish: 'Finish',
  'check-in': 'Check-in',
  'check-out': 'Check-out',
  occupied: 'Stay',
};

export function formatEntryKind(kind: ItineraryEntryKind): string {
  return ENTRY_KIND_LABELS[kind] ?? kind;
}

export function formatOrderingTime(iso: string | null, timeZone?: string): string {
  if (iso == null) return '';
  const instant = new Date(iso);
  if (timeZone != null && timeZone.length > 0) {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(instant);
  }
  return instant.toLocaleString();
}

/** Local calendar day key (YYYY-MM-DD) for an instant in a timezone. */
export function localDayKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export function isSameLocalDay(isoA: string, isoB: string, timeZone: string): boolean {
  return localDayKey(isoA, timeZone) === localDayKey(isoB, timeZone);
}
