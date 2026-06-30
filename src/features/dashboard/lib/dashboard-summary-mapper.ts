import type { ItineraryVisibleDateRange } from '@solvera/pace-core/itinerary';
import { computeCostRollup } from '@/features/costs/cost-rollup';
import { toCostLogisticsLine } from '@/features/costs/cost-logistics-lines';
import type { CostAssignmentRef, CurrencyRate } from '@/features/costs/types';
import type { DashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { buildItineraryModel } from '@/features/itinerary/build-itinerary-model';
import {
  mapAccommodationToItineraryInput,
  mapActivityToItineraryInput,
  mapTransportToItineraryInput,
} from '@/features/itinerary/map-logistics-to-itinerary-input';
import type {
  AccommodationRow,
  ActivityRow,
  LogisticsResourceKind,
  TransportRow,
} from '@/features/planning/types';

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function mapPlanningSlice(raw: unknown): { confirmed: number; total: number } {
  const source = raw != null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    confirmed: toNumber(source.confirmed),
    total: toNumber(source.total),
  };
}

function mapCostLines(raw: unknown, kind: LogisticsResourceKind) {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => toCostLogisticsLine(row as Record<string, unknown>, kind));
}

function buildVisibleDateRange(
  transportRows: TransportRow[],
  accommodationRows: AccommodationRow[],
  activityRows: ActivityRow[],
  assignmentRows: Array<{ resource_type: string; resource_id: string; application_id: string }>
): ItineraryVisibleDateRange | null {
  const resources = [
    ...transportRows.map(mapTransportToItineraryInput),
    ...accommodationRows.map(mapAccommodationToItineraryInput),
    ...activityRows.map(mapActivityToItineraryInput),
  ];
  const assignments = assignmentRows.map((row) => ({
    resourceType: row.resource_type as LogisticsResourceKind,
    resourceId: row.resource_id,
    participantApplicationId: row.application_id,
  }));
  const model = buildItineraryModel({
    resources,
    assignments,
    scope: { mode: 'all' },
    eventDefaultTimezone: null,
    displayByResourceKey: {},
  });
  return model.visibleDateRange;
}

export function mapTracDashboardSummary(raw: unknown, eventId: string): DashboardSummary {
  const source = raw != null && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const planning =
    source.planning != null && typeof source.planning === 'object'
      ? (source.planning as Record<string, unknown>)
      : {};

  const costLinesSource =
    source.cost_lines != null && typeof source.cost_lines === 'object'
      ? (source.cost_lines as Record<string, unknown>)
      : {};
  const itinerarySource =
    source.itinerary != null && typeof source.itinerary === 'object'
      ? (source.itinerary as Record<string, unknown>)
      : {};

  const transportItinerary = (itinerarySource.transport ?? []) as TransportRow[];
  const accommodationItinerary = (itinerarySource.accommodation ?? []) as AccommodationRow[];
  const activityItinerary = (itinerarySource.activity ?? []) as ActivityRow[];

  const assignmentRows = Array.isArray(source.assignments)
    ? (source.assignments as Array<{ resource_type: string; resource_id: string; application_id: string }>)
    : [];

  const lines = [
    ...mapCostLines(costLinesSource.transport, 'transport'),
    ...mapCostLines(costLinesSource.accommodation, 'accommodation'),
    ...mapCostLines(costLinesSource.activity, 'activity'),
  ];

  const rates = (Array.isArray(source.currency_rates) ? source.currency_rates : []).map(
    (row): CurrencyRate => {
      const item = row != null && typeof row === 'object' ? (row as Record<string, unknown>) : {};
      return {
        currency_code: String(item.currency_code ?? ''),
        exchange_rate: toNumber(item.exchange_rate),
      };
    }
  );

  const assignments = assignmentRows.map(
    (row): CostAssignmentRef => ({
      resource_type: row.resource_type as CostAssignmentRef['resource_type'],
      resource_id: String(row.resource_id),
      application_id: String(row.application_id),
    })
  );

  const baseCurrency =
    typeof source.base_currency === 'string' && source.base_currency.trim() !== ''
      ? source.base_currency.trim().toUpperCase()
      : 'AUD';

  const approvedParticipantCount = toNumber(source.approved_participant_count);

  const rollup = computeCostRollup({
    lines,
    assignments,
    rates,
    baseCurrency,
    approvedParticipantCount,
  });

  return {
    eventId: typeof source.event_id === 'string' ? source.event_id : eventId,
    planning: {
      transport: mapPlanningSlice(planning.transport),
      accommodation: mapPlanningSlice(planning.accommodation),
      activity: mapPlanningSlice(planning.activity),
    },
    visibleDateRange: buildVisibleDateRange(
      transportItinerary,
      accommodationItinerary,
      activityItinerary,
      assignmentRows
    ),
    rollup,
    openRisks: toNumber(source.open_risks),
    contactsCount: toNumber(source.contacts_count),
  };
}
