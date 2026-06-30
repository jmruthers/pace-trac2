import type { ItineraryMapData } from '@/features/itinerary/collect-map-points';
import { ItineraryMapPanel } from '@/features/itinerary/components/ItineraryMapPanel';
import { MasterPlanSectionShell } from '@/features/master-plan/components/MasterPlanSectionShell';

interface MasterPlanJourneyMapProps {
  mapData: ItineraryMapData;
  embeddedMaps?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
}

function journeyMapCountLabel(mapData: ItineraryMapData): string {
  if (mapData.transportLegs.length > 0) {
    return `${mapData.transportLegs.length} transport legs`;
  }
  if (mapData.points.length > 0) {
    return `${mapData.points.length} stops`;
  }
  return '0 transport legs';
}

export function MasterPlanJourneyMap({
  mapData,
  embeddedMaps = false,
  isLoading,
  isError,
  errorMessage,
}: MasterPlanJourneyMapProps) {
  const hasMapContent = mapData.points.length > 0 || mapData.transportLegs.length > 0;

  return (
    <MasterPlanSectionShell
      title="Journey map"
      countLabel={journeyMapCountLabel(mapData)}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    >
      {hasMapContent ? (
        <ItineraryMapPanel mapData={mapData} embedded={embeddedMaps} />
      ) : (
        <p>No transport legs with route details are available yet.</p>
      )}
    </MasterPlanSectionShell>
  );
}
