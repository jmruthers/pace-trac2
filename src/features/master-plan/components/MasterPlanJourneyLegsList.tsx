import { Link } from 'react-router-dom';
import { Card, CardContent } from '@solvera/pace-core/components';
import { PlanningStatusBadge } from '@/features/planning/components/PlanningStatusBadge';
import { useTransportList } from '@/features/planning/hooks/useLogisticsList';
import type { TransportRow } from '@/features/planning/types';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

function formatLegLabel(row: TransportRow): string {
  const number = row.transport_number?.trim();
  return number ? `${row.mode} ${number}` : row.mode;
}

function formatPlaceLine(row: TransportRow): string {
  const from = row.departure_display_name ?? row.departure_short_address ?? '—';
  const to = row.arrival_display_name ?? row.arrival_short_address ?? '—';
  return `${from} → ${to}`;
}

export function MasterPlanJourneyLegsList() {
  const { items, isLoading, isError, error } = useTransportList();

  if (isLoading) {
    return <p>Loading journey legs…</p>;
  }

  if (isError) {
    return (
      <p>{error instanceof Error ? error.message : 'Failed to load transport legs'}</p>
    );
  }

  if (items.length === 0) {
    return <p>No transport legs planned yet.</p>;
  }

  return (
    <ul className="grid gap-3">
      {items.map((row) => (
        <li key={row.id}>
          <Card>
            <CardContent className="grid gap-1">
              <h3>
                <Link to={`/assignments?kind=transport&resourceId=${row.id}`}>
                  {formatLegLabel(row)}
                </Link>
              </h3>
              <p>{formatPlaceLine(row)}</p>
              <p>
                {formatWhen(row.departure_time)} → {formatWhen(row.arrival_time)}
              </p>
              <PlanningStatusBadge status={row.status} />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
