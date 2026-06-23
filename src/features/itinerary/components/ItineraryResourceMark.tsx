import type { ComponentType } from 'react';
import {
  Building2,
  Bus,
  Calendar,
  Car,
  Footprints,
  Plane,
  Ship,
  TrainFront,
} from '@solvera/pace-core/icons';
import type { LogisticsResourceKind } from '@/features/planning/types';
import type { TransportMode } from '@/features/planning/enums';

const TRANSPORT_MODE_ICONS: Record<TransportMode, ComponentType<{ 'aria-hidden'?: boolean; className?: string }>> = {
  Flight: Plane,
  Bus,
  Coach: Bus,
  Train: TrainFront,
  Car,
  Ferry: Ship,
  Shuttle: Bus,
  Walk: Footprints,
};

const RESOURCE_TYPE_ICONS: Record<
  Exclude<LogisticsResourceKind, 'transport'>,
  ComponentType<{ 'aria-hidden'?: boolean; className?: string }>
> = {
  accommodation: Building2,
  activity: Calendar,
};

interface ItineraryResourceMarkProps {
  resourceType: LogisticsResourceKind;
  transportMode?: TransportMode | null;
}

export function ItineraryResourceMark({ resourceType, transportMode }: ItineraryResourceMarkProps) {
  const Icon =
    resourceType === 'transport'
      ? transportMode != null
        ? TRANSPORT_MODE_ICONS[transportMode]
        : Bus
      : RESOURCE_TYPE_ICONS[resourceType];

  return (
    <figure
      className="m-0 grid size-14 place-items-center rounded-md border border-sec-200 bg-main-100 text-main-800"
      aria-hidden
    >
      <Icon className="size-7" aria-hidden />
    </figure>
  );
}
