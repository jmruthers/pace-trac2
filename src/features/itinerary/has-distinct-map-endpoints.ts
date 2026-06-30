import type { ItineraryResourceDisplay } from '@/features/itinerary/types';

/** True when display has two coordinates that are not the same point. */
export function hasDistinctMapEndpoints(display: ItineraryResourceDisplay): boolean {
  if (display.coords.length < 2) return false;
  const from = display.coords[0]!.coordinates;
  const to = display.coords[1]!.coordinates;
  return from.lat !== to.lat || from.lng !== to.lng;
}
