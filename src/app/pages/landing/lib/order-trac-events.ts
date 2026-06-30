import {
  LANDING_DEFAULT_TILE_COUNT,
  orderEventsForLanding,
  shouldShowLandingEventToggle,
  sliceLandingEventTiles,
} from '@/shared/lib/events/order-events-for-landing';
import type { EventStub } from '@solvera/pace-core/types';
import { isEventVisible } from '@/app/pages/landing/lib/event-tile-helpers';

export const TRAC_LANDING_DEFAULT_VISIBLE_COUNT = LANDING_DEFAULT_TILE_COUNT;

/** Visible events in CR08 landing order (upcoming asc, then past desc). */
export function orderTracLandingEvents(events: readonly EventStub[]): EventStub[] {
  return orderEventsForLanding(events.filter(isEventVisible));
}

export function shouldShowTracEventsToggle(count: number): boolean {
  return shouldShowLandingEventToggle(count, TRAC_LANDING_DEFAULT_VISIBLE_COUNT);
}

export function sliceVisibleTracEvents(events: readonly EventStub[], showAll: boolean): EventStub[] {
  return sliceLandingEventTiles(events, showAll, TRAC_LANDING_DEFAULT_VISIBLE_COUNT);
}
