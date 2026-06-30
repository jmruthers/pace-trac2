import type { ItineraryMapData } from '@/features/itinerary/collect-map-points';
import { ItineraryMapPanel } from '@/features/itinerary/components/ItineraryMapPanel';
import { hasDistinctMapEndpoints } from '@/features/itinerary/has-distinct-map-endpoints';
import type { ItineraryResourceDisplay } from '@/features/itinerary/types';

interface ItineraryEntryMapPanelProps {
  display: ItineraryResourceDisplay;
  embedded?: boolean;
}

export function ItineraryEntryMapPanel({ display, embedded = false }: ItineraryEntryMapPanelProps) {
  if (!hasDistinctMapEndpoints(display)) {
    return null;
  }

  const mapData: ItineraryMapData = {
    points: display.coords,
    transportLegs: [
      {
        resourceId: display.resourceId,
        from: display.coords[0]!,
        to: display.coords[1]!,
      },
    ],
  };

  return (
    <ItineraryMapPanel
      mapData={mapData}
      embedded={embedded}
      className="h-full min-h-40 w-full overflow-hidden rounded-2xl border border-main-300"
    />
  );
}
