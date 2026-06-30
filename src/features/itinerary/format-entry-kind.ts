import type { ItineraryEntryKind } from '@solvera/pace-core/itinerary';
import {
  formatDateTime,
  formatInTimeZone,
  formatTimezoneLabel,
  getUserTimeZone,
} from '@solvera/pace-core/utils';

const ENTRY_KIND_LABELS: Record<ItineraryEntryKind, string> = {
  departure: 'Departure',
  arrival: 'Arrival',
  start: 'Start',
  finish: 'Finish',
  'check-in': 'Check-in',
  'check-out': 'Check-out',
  occupied: 'Staying at',
};

export function formatEntryKind(kind: ItineraryEntryKind): string {
  return ENTRY_KIND_LABELS[kind] ?? kind;
}

export function getAccommodationCardTitle(
  entryKind: ItineraryEntryKind,
  venueTitle: string
): string {
  switch (entryKind) {
    case 'check-in':
      return `Check in at ${venueTitle}`;
    case 'check-out':
      return `Check out from ${venueTitle}`;
    case 'occupied':
      return `Staying at ${venueTitle}`;
    default:
      return venueTitle;
  }
}

export function formatOrderingTime(iso: string | null, timeZone?: string): string {
  if (iso == null) return '';
  if (timeZone != null && timeZone.length > 0) {
    return formatInTimeZone(iso, timeZone, 'dd/MM/yyyy HH:mm');
  }
  return formatDateTime(iso);
}

/** Resolves row snapshot timezone or user timezone for display. */
export function resolveEntryTimeZone(timeZone?: string): string {
  return timeZone != null && timeZone.length > 0 ? timeZone : getUserTimeZone();
}

/** Time-only label for entry row primary/secondary columns. */
export function formatEntryTimeShort(iso: string | null, timeZone?: string): string {
  if (iso == null) return '';
  return formatInTimeZone(iso, resolveEntryTimeZone(timeZone), 'HH:mm');
}

/** Card instant label — full local datetime when a journey spans calendar days. */
export function formatEntryInstantForCard(
  iso: string | null,
  timeZone: string | undefined,
  showFullDateTime: boolean
): string {
  if (iso == null) return '';
  if (showFullDateTime) {
    return formatOrderingTime(iso, timeZone);
  }
  return formatEntryTimeShort(iso, timeZone);
}

export function entryInstantsSpanDifferentLocalDays(
  startIso: string,
  endIso: string,
  startTimeZone?: string,
  endTimeZone?: string
): boolean {
  return (
    localDayKey(startIso, resolveEntryTimeZone(startTimeZone)) !==
    localDayKey(endIso, resolveEntryTimeZone(endTimeZone))
  );
}

/** Human-readable timezone caption for entry row time column. */
export function formatEntryTimezoneLabel(timeZone?: string): string {
  const zone = resolveEntryTimeZone(timeZone);
  return formatTimezoneLabel(zone);
}

/** Local calendar day key (YYYY-MM-DD) for an instant in a timezone. */
export function localDayKey(iso: string, timeZone: string): string {
  return formatInTimeZone(iso, timeZone, 'yyyy-MM-dd');
}

export function isSameLocalDay(isoA: string, isoB: string, timeZone: string): boolean {
  return localDayKey(isoA, timeZone) === localDayKey(isoB, timeZone);
}
