import type { TransportRow } from '@/features/planning/types';
import { TRAC_STATUS_LABELS } from '@/features/planning/enums';

export interface MasterPlanTransportLeg {
  resourceId: string;
  mode: TransportRow['mode'];
  title: string;
  transportNumber: string | null;
  fromLabel: string;
  toLabel: string;
  departureTime: string;
  arrivalTime: string;
  status: TransportRow['status'];
}

function transportTitle(row: TransportRow): string {
  const from = row.departure_display_name?.trim();
  const to = row.arrival_display_name?.trim();
  if (from && to) return `${from} → ${to}`;
  return from ?? to ?? 'Transport';
}

/** Active transport rows sorted by departure for journey map list (TR10). */
export function collectTransportJourneyMapData(
  transportItems: readonly TransportRow[]
): MasterPlanTransportLeg[] {
  const active = transportItems.filter((row) => row.status !== 'dropped' && row.status !== 'cancelled');

  return [...active]
    .sort((a, b) => a.departure_time.localeCompare(b.departure_time))
    .map((row) => ({
      resourceId: row.id,
      mode: row.mode,
      title: transportTitle(row),
      transportNumber: row.transport_number,
      fromLabel: row.departure_display_name?.trim() || '—',
      toLabel: row.arrival_display_name?.trim() || '—',
      departureTime: row.departure_time,
      arrivalTime: row.arrival_time,
      status: row.status,
    }));
}

export function formatTransportLegStatus(status: TransportRow['status']): string {
  if (status == null) return 'Unknown';
  return TRAC_STATUS_LABELS[status] ?? status;
}
