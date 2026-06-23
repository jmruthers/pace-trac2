import { isTracStatus } from '@/features/planning/enums';
import {
  formatDayHeading,
  toDayKey,
  UNDATED_DAY_KEY,
} from '@/features/planning/planning-format';
import type { TracStatus } from '@/features/planning/enums';
import type {
  AccommodationRow,
  ActivityRow,
  LogisticsResourceKind,
  TransportRow,
} from '@/features/planning/types';

export type PlanningTableRow = {
  id: string;
  kind: LogisticsResourceKind;
  name: string;
  startTime: string;
  endTime: string | null;
  startDayKey: string;
  startDayLabel: string;
  status: TracStatus | null;
  capacity: number | null;
  locationSummary: string;
  sourceRow: TransportRow | AccommodationRow | ActivityRow;
};

export type PlanningKindFilter = 'all' | LogisticsResourceKind;

export const PLANNING_KIND_LABELS: Record<LogisticsResourceKind, string> = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activity: 'Activity',
};

function placeLabel(displayName: string | null, shortAddress: string | null): string {
  return displayName ?? shortAddress ?? '—';
}

function buildDayFields(startIso: string): Pick<PlanningTableRow, 'startDayKey' | 'startDayLabel'> {
  const dayKey = toDayKey(startIso);
  if (dayKey == null) {
    return { startDayKey: UNDATED_DAY_KEY, startDayLabel: formatDayHeading(UNDATED_DAY_KEY) };
  }
  return { startDayKey: dayKey, startDayLabel: formatDayHeading(dayKey) };
}

function mapTransportRow(row: TransportRow): PlanningTableRow {
  const name = `${row.mode}${row.transport_number ? ` — ${row.transport_number}` : ''}`;
  const locationSummary = `${placeLabel(row.departure_display_name, row.departure_short_address)} → ${placeLabel(row.arrival_display_name, row.arrival_short_address)}`;
  return {
    id: row.id,
    kind: 'transport',
    name,
    startTime: row.departure_time,
    endTime: row.arrival_time,
    ...buildDayFields(row.departure_time),
    status: isTracStatus(row.status) ? row.status : null,
    capacity: row.capacity,
    locationSummary,
    sourceRow: row,
  };
}

function mapAccommodationRow(row: AccommodationRow): PlanningTableRow {
  return {
    id: row.id,
    kind: 'accommodation',
    name: row.name,
    startTime: row.check_in_time,
    endTime: row.check_out_time,
    ...buildDayFields(row.check_in_time),
    status: isTracStatus(row.status) ? row.status : null,
    capacity: row.capacity,
    locationSummary: placeLabel(row.location_display_name, row.location_short_address),
    sourceRow: row,
  };
}

function mapActivityRow(row: ActivityRow): PlanningTableRow {
  const locationSummary = `${placeLabel(row.start_location_display_name, row.start_location_short_address)} → ${placeLabel(row.finish_location_display_name, row.finish_location_short_address)}`;
  return {
    id: row.id,
    kind: 'activity',
    name: row.name,
    startTime: row.start_time,
    endTime: row.finish_time,
    ...buildDayFields(row.start_time),
    status: isTracStatus(row.status) ? row.status : null,
    capacity: row.capacity,
    locationSummary,
    sourceRow: row,
  };
}

function comparePlanningRows(a: PlanningTableRow, b: PlanningTableRow): number {
  if (a.startDayKey === UNDATED_DAY_KEY && b.startDayKey !== UNDATED_DAY_KEY) return 1;
  if (a.startDayKey !== UNDATED_DAY_KEY && b.startDayKey === UNDATED_DAY_KEY) return -1;
  const dayCompare = a.startDayKey.localeCompare(b.startDayKey);
  if (dayCompare !== 0) return dayCompare;
  return a.startTime.localeCompare(b.startTime);
}

export function buildPlanningTableRows(input: {
  transport: TransportRow[];
  accommodation: AccommodationRow[];
  activity: ActivityRow[];
}): PlanningTableRow[] {
  const rows: PlanningTableRow[] = [
    ...input.transport.map(mapTransportRow),
    ...input.accommodation.map(mapAccommodationRow),
    ...input.activity.map(mapActivityRow),
  ];
  rows.sort(comparePlanningRows);
  return rows;
}

export function filterPlanningTableRows(
  rows: PlanningTableRow[],
  kindFilter: PlanningKindFilter
): PlanningTableRow[] {
  if (kindFilter === 'all') return rows;
  return rows.filter((row) => row.kind === kindFilter);
}

export function countPlanningRowsByKind(rows: PlanningTableRow[]): Record<PlanningKindFilter, number> {
  const counts: Record<PlanningKindFilter, number> = {
    all: rows.length,
    transport: 0,
    accommodation: 0,
    activity: 0,
  };
  for (const row of rows) {
    counts[row.kind] += 1;
  }
  return counts;
}
