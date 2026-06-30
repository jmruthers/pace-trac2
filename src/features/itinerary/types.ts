import type {
  DerivedItineraryDayEntry,
  ItineraryDayGroup,
  ItineraryVisibleDateRange,
} from '@solvera/pace-core/itinerary';
import type { Coordinates, LogisticsResourceKind } from '@/features/planning/types';
import type { TracStatus, TransportMode } from '@/features/planning/enums';

export type ItineraryAudienceMode = 'participant' | 'day_visitor';

export interface ViewerApplication {
  id: string;
  event_id: string;
  status: string;
}

export interface ItineraryTransportLeg {
  resourceId: string;
  from: ItineraryMapPoint;
  to: ItineraryMapPoint;
}

export interface ItineraryResourceDisplay {
  resourceType: LogisticsResourceKind;
  resourceId: string;
  title: string;
  subtitle: string | null;
  coords: ItineraryMapPoint[];
  status: TracStatus | null;
  notes: string | null;
  bookingReference: string | null;
  currency: string | null;
  individualCost: number | null;
  groupCost: number | null;
  capacity: number | null;
  /** Transport mode when resourceType is transport. */
  transportMode?: TransportMode | null;
  transportNumber?: string | null;
  departureLabel?: string | null;
  arrivalLabel?: string | null;
  startLocationLabel?: string | null;
  finishLocationLabel?: string | null;
  /** End instant for time range column (transport arrival, activity finish). */
  endTime?: string | null;
  /** IANA zone for the start/departure/check-in instant. */
  startTimezone?: string | null;
  /** IANA zone for the end/arrival/finish instant. */
  endTimezone?: string | null;
  /** Set for accommodation rows — used for same-local-day check-in/out copy. */
  checkInTime?: string;
  checkOutTime?: string;
}

export interface ItineraryMapPoint {
  label: string;
  coordinates: Coordinates;
}

export interface ItineraryBuildIssue {
  resourceType: LogisticsResourceKind;
  resourceId: string;
  message: string;
}

export interface ItineraryModel {
  dayGroups: ItineraryDayGroup[];
  visibleDateRange: ItineraryVisibleDateRange | null;
  displayByResourceKey: Record<string, ItineraryResourceDisplay>;
  skippedResources: ItineraryBuildIssue[];
  /** Assignment notes keyed by resourceType:resourceId for the active participant scope. */
  notesByResourceKey: Record<string, string>;
}

export interface ItineraryEntryView extends DerivedItineraryDayEntry {
  display: ItineraryResourceDisplay;
}
