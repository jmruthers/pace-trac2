import type { EventStub } from '@solvera/pace-core/types';
import { isEventVisible, readEventDate } from '@/app/pages/landing/lib/event-tile-helpers';

export const TRAC_LANDING_DEFAULT_VISIBLE_COUNT = 4;

export function orderTracLandingEvents(events: readonly EventStub[]): EventStub[] {
  return events
    .filter(isEventVisible)
    .slice()
    .sort((a, b) => {
      const aDate = readEventDate(a);
      const bDate = readEventDate(b);
      if (aDate == null && bDate == null) return 0;
      if (aDate == null) return 1;
      if (bDate == null) return -1;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });
}

export function shouldShowTracEventsToggle(count: number): boolean {
  return count > TRAC_LANDING_DEFAULT_VISIBLE_COUNT;
}

export function sliceVisibleTracEvents(events: readonly EventStub[], showAll: boolean): EventStub[] {
  if (showAll) return [...events];
  return events.slice(0, TRAC_LANDING_DEFAULT_VISIBLE_COUNT);
}
