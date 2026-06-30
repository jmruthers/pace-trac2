import type { DerivedItineraryDayEntry } from '@solvera/pace-core/itinerary';
import { formatCostAmount } from '@/features/costs/currency-format';
import {
  formatEntryInstantForCard,
  formatEntryKind,
  formatEntryTimeShort,
  formatEntryTimezoneLabel,
  entryInstantsSpanDifferentLocalDays,
  getAccommodationCardTitle,
  isSameLocalDay,
} from '@/features/itinerary/format-entry-kind';
import type { ItineraryResourceDisplay } from '@/features/itinerary/types';
import { formatCapacity } from '@/features/planning/planning-format';

export type EntryDetailLine = { id: string; kind: 'text'; text: string };

export interface EntryTimeColumn {
  startTime: string;
  startTimezoneLabel: string;
  endTime: string | null;
  endTimezoneLabel: string | null;
}

function resolveStartTimezone(
  entry: DerivedItineraryDayEntry,
  display: ItineraryResourceDisplay
): string | undefined {
  return display.startTimezone ?? entry.timezone;
}

function resolveEndTimezone(display: ItineraryResourceDisplay): string | undefined {
  return display.endTimezone ?? display.startTimezone ?? undefined;
}

function resolveSecondaryTimeIso(
  entry: DerivedItineraryDayEntry,
  display: ItineraryResourceDisplay
): string | null {
  if (entry.entryKind === 'arrival' || entry.entryKind === 'finish') {
    return null;
  }

  if (display.resourceType === 'accommodation') {
    if (
      entry.entryKind === 'check-in' &&
      display.checkInTime != null &&
      display.checkOutTime != null &&
      isSameLocalDay(display.checkInTime, display.checkOutTime, entry.timezone)
    ) {
      return display.checkOutTime;
    }
    return null;
  }

  return display.endTime ?? null;
}

/** Single-row start/end time label for the entry card time column. */
export function formatEntryTimeRange(
  entry: DerivedItineraryDayEntry,
  display: ItineraryResourceDisplay
): string {
  const primary = formatEntryTimeShort(
    entry.orderingTimestamp,
    resolveStartTimezone(entry, display)
  );

  if (display.resourceType === 'accommodation' && entry.entryKind === 'occupied') {
    return '—';
  }

  const secondaryIso = resolveSecondaryTimeIso(entry, display);
  if (secondaryIso != null) {
    const endZone =
      display.resourceType === 'transport' || display.resourceType === 'activity'
        ? resolveEndTimezone(display)
        : entry.timezone;
    const secondary = formatEntryTimeShort(secondaryIso, endZone);
    if (primary !== '' && secondary !== '') {
      return `${primary}–${secondary}`;
    }
  }

  if (display.resourceType === 'accommodation' && entry.entryKind !== 'occupied') {
    const kindLabel = formatEntryKind(entry.entryKind);
    if (primary !== '') {
      return `${primary} (${kindLabel})`;
    }
    return kindLabel;
  }

  return primary !== '' ? primary : '—';
}

/** Start/end time column with a timezone label per instant (transport, activity, same-day accommodation). */
export function buildEntryTimeColumn(
  entry: DerivedItineraryDayEntry,
  display: ItineraryResourceDisplay
): EntryTimeColumn {
  const startZone = resolveStartTimezone(entry, display);

  if (display.resourceType === 'accommodation' && entry.entryKind === 'occupied') {
    return {
      startTime: '—',
      startTimezoneLabel: '',
      endTime: null,
      endTimezoneLabel: null,
    };
  }

  const startTime = formatEntryTimeShort(entry.orderingTimestamp, startZone);
  const startTimezoneLabel = formatEntryTimezoneLabel(startZone);

  const secondaryIso = resolveSecondaryTimeIso(entry, display);
  if (secondaryIso == null) {
    if (display.resourceType === 'accommodation' && entry.entryKind !== 'occupied') {
      const kindLabel = formatEntryKind(entry.entryKind);
      return {
        startTime: startTime !== '' ? `${startTime} (${kindLabel})` : kindLabel,
        startTimezoneLabel,
        endTime: null,
        endTimezoneLabel: null,
      };
    }

    return {
      startTime: startTime !== '' ? startTime : '—',
      startTimezoneLabel,
      endTime: null,
      endTimezoneLabel: null,
    };
  }

  const endZone = resolveEndTimezone(display);
  const crossDay =
    entry.orderingTimestamp != null &&
    entryInstantsSpanDifferentLocalDays(
      entry.orderingTimestamp,
      secondaryIso,
      startZone,
      endZone
    );
  const startTimeFormatted = formatEntryInstantForCard(
    entry.orderingTimestamp,
    startZone,
    crossDay
  );
  const endTimeFormatted = formatEntryInstantForCard(secondaryIso, endZone, crossDay);
  const endTimezoneLabel = formatEntryTimezoneLabel(endZone);

  return {
    startTime: startTimeFormatted !== '' ? startTimeFormatted : '—',
    startTimezoneLabel,
    endTime: endTimeFormatted !== '' ? endTimeFormatted : null,
    endTimezoneLabel: endTimeFormatted !== '' ? endTimezoneLabel : null,
  };
}

export function buildEntryTitle(
  entry: DerivedItineraryDayEntry,
  display: ItineraryResourceDisplay,
  participantView: boolean
): string {
  const headingPrefix = participantView ? 'Your ' : '';

  if (display.resourceType === 'accommodation') {
    return `${headingPrefix}${getAccommodationCardTitle(entry.entryKind, display.title)}`;
  }

  return `${headingPrefix}${display.title}`;
}

function accommodationTitleIncludesVenue(
  entry: DerivedItineraryDayEntry,
  display: ItineraryResourceDisplay
): boolean {
  if (display.resourceType !== 'accommodation') return false;
  const title = getAccommodationCardTitle(entry.entryKind, display.title);
  return title.includes(display.title);
}

function buildRouteLine(display: ItineraryResourceDisplay): string | null {
  if (display.resourceType === 'transport') {
    const dep = display.departureLabel;
    const arr = display.arrivalLabel;
    if (dep == null || dep === '' || arr == null || arr === '') return null;
    return `${dep} → ${arr}`;
  }

  if (display.resourceType === 'activity') {
    const start = display.startLocationLabel;
    const finish = display.finishLocationLabel;
    if (start == null || start === '') return null;
    if (finish == null || finish === '' || start === finish) return start;
    return `${start} → ${finish}`;
  }

  if (display.subtitle == null || display.subtitle === '') return null;
  return display.subtitle;
}

function buildCostLine(display: ItineraryResourceDisplay): string | null {
  const currency = display.currency?.trim();
  if (currency == null || currency === '') return null;

  const hasIndividual =
    display.individualCost != null && display.individualCost !== 0;
  const hasGroup = display.groupCost != null && display.groupCost !== 0;

  if (hasIndividual) {
    return `Per person: ${formatCostAmount(display.individualCost!, currency)}`;
  }
  if (hasGroup) {
    return `Group cost: ${formatCostAmount(display.groupCost!, currency)}`;
  }
  return null;
}

function buildCapacityLine(display: ItineraryResourceDisplay): string | null {
  if (display.capacity == null) return null;
  return `Capacity: ${formatCapacity(display.capacity)}`;
}

/** Ordered card body lines — each planning snapshot field at most once. */
export function buildEntryDetailLines(
  entry: DerivedItineraryDayEntry,
  display: ItineraryResourceDisplay
): EntryDetailLine[] {
  if (entry.entryKind === 'arrival' || entry.entryKind === 'finish') {
    return [];
  }

  const lines: EntryDetailLine[] = [];

  const route = buildRouteLine(display);
  if (route != null && !accommodationTitleIncludesVenue(entry, display)) {
    lines.push({ id: 'route', kind: 'text', text: route });
  }

  if (display.bookingReference != null && display.bookingReference.trim() !== '') {
    lines.push({
      id: 'booking-reference',
      kind: 'text',
      text: `Booking reference: ${display.bookingReference.trim()}`,
    });
  }

  const costLine = buildCostLine(display);
  if (costLine != null) {
    lines.push({ id: 'cost', kind: 'text', text: costLine });
  }

  const capacityLine = buildCapacityLine(display);
  if (capacityLine != null) {
    lines.push({ id: 'capacity', kind: 'text', text: capacityLine });
  }

  if (display.notes != null && display.notes.trim() !== '') {
    lines.push({ id: 'notes', kind: 'text', text: display.notes.trim() });
  }

  return lines;
}
