import { getLocalDayStartMs } from '@/shared/lib/events/get-local-day-start-ms';
import { readEventDateMs, readEventSortId } from '@/shared/lib/events/read-event-date-ms';

export const LANDING_DEFAULT_TILE_COUNT = 4;

export type OrderEventsForLandingOptions = {
  /** Reference instant for local-day cutoff; defaults to now. */
  referenceDate?: Date;
};

export type EventLandingSortInput = Record<string, unknown>;

function isUpcomingForLanding(event: EventLandingSortInput, cutoff: number): boolean {
  const timestamp = readEventDateMs(event);
  return timestamp == null || timestamp >= cutoff;
}

function sortUpcomingForLanding(upcoming: EventLandingSortInput[]): EventLandingSortInput[] {
  return upcoming.sort((left, right) => {
    const leftTs = readEventDateMs(left) ?? Number.MAX_SAFE_INTEGER;
    const rightTs = readEventDateMs(right) ?? Number.MAX_SAFE_INTEGER;
    if (leftTs !== rightTs) return leftTs - rightTs;
    return readEventSortId(left).localeCompare(readEventSortId(right));
  });
}

function sortPastForLanding(past: EventLandingSortInput[]): EventLandingSortInput[] {
  return past.sort((left, right) => {
    const leftTs = readEventDateMs(left) ?? Number.MIN_SAFE_INTEGER;
    const rightTs = readEventDateMs(right) ?? Number.MIN_SAFE_INTEGER;
    if (rightTs !== leftTs) return rightTs - leftTs;
    return readEventSortId(left).localeCompare(readEventSortId(right));
  });
}

/**
 * Landing tile order: upcoming (on/after local today) ascending, then past descending.
 * Events with null/unparseable dates are treated as upcoming and sort last within that bucket.
 */
export function orderEventsForLanding<T extends EventLandingSortInput>(
  events: ReadonlyArray<T>,
  options: OrderEventsForLandingOptions = {}
): T[] {
  const cutoff = getLocalDayStartMs(options.referenceDate);

  const upcoming: T[] = [];
  const past: T[] = [];

  for (const event of events) {
    if (isUpcomingForLanding(event, cutoff)) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  return [...sortUpcomingForLanding(upcoming), ...sortPastForLanding(past)] as T[];
}

export function sliceLandingEventTiles<T>(
  ordered: ReadonlyArray<T>,
  showAll: boolean,
  count = LANDING_DEFAULT_TILE_COUNT
): T[] {
  return showAll ? [...ordered] : ordered.slice(0, count);
}

export function shouldShowLandingEventToggle(
  orderedLength: number,
  count = LANDING_DEFAULT_TILE_COUNT
): boolean {
  return orderedLength > count;
}
