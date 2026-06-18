import { Link } from 'react-router-dom';
import {
  Alert,
  Card,
  CardContent,
  LoadingSpinner,
} from '@solvera/pace-core/components';
import { usePageCan } from '@solvera/pace-core/rbac';
import { PlanningStatusBadge } from '@/features/planning/components/PlanningStatusBadge';
import {
  useAccommodationList,
  useActivityList,
  useTransportList,
} from '@/features/planning/hooks/useLogisticsList';
import type { LogisticsResourceKind } from '@/features/planning/types';
import { isTracStatus, type TracStatus } from '@/features/planning/enums';

interface DayPlanningItem {
  id: string;
  kind: LogisticsResourceKind;
  label: string;
  whenLabel: string;
  dayKey: string;
  dayHeading: string;
  status: TracStatus | null;
  assignmentsHref: string;
}

function formatDayHeading(dayKey: string): string {
  const parsed = new Date(`${dayKey}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dayKey;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function toDayKey(iso: string): string | null {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function PlanningByDayView() {
  const transport = useTransportList();
  const accommodation = useAccommodationList();
  const activity = useActivityList();
  const { can: canCreate } = usePageCan('planning', 'create');

  const isLoading = transport.isLoading || accommodation.isLoading || activity.isLoading;
  const isError = transport.isError || accommodation.isError || activity.isError;
  const error =
    (transport.error as Error | null) ??
    (accommodation.error as Error | null) ??
    (activity.error as Error | null);

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <Alert variant="destructive">
        {error instanceof Error ? error.message : 'Failed to load planning items'}
      </Alert>
    );
  }

  const items: DayPlanningItem[] = [];

  for (const row of transport.items) {
    const dayKey = toDayKey(row.departure_time);
    if (dayKey == null) continue;
    items.push({
      id: row.id,
      kind: 'transport',
      label: `${row.mode}${row.transport_number ? ` — ${row.transport_number}` : ''}`,
      whenLabel: `${formatWhen(row.departure_time)} → ${formatWhen(row.arrival_time)}`,
      dayKey,
      dayHeading: formatDayHeading(dayKey),
      status: isTracStatus(row.status) ? row.status : null,
      assignmentsHref: `/assignments?kind=transport&resourceId=${row.id}`,
    });
  }

  for (const row of accommodation.items) {
    const dayKey = toDayKey(row.check_in_time);
    if (dayKey == null) continue;
    items.push({
      id: row.id,
      kind: 'accommodation',
      label: row.name,
      whenLabel: `${formatWhen(row.check_in_time)} → ${formatWhen(row.check_out_time)}`,
      dayKey,
      dayHeading: formatDayHeading(dayKey),
      status: isTracStatus(row.status) ? row.status : null,
      assignmentsHref: `/assignments?kind=accommodation&resourceId=${row.id}`,
    });
  }

  for (const row of activity.items) {
    const dayKey = toDayKey(row.start_time);
    if (dayKey == null) continue;
    items.push({
      id: row.id,
      kind: 'activity',
      label: row.name,
      whenLabel: formatWhen(row.start_time),
      dayKey,
      dayHeading: formatDayHeading(dayKey),
      status: isTracStatus(row.status) ? row.status : null,
      assignmentsHref: `/assignments?kind=activity&resourceId=${row.id}`,
    });
  }

  items.sort((a, b) => a.dayKey.localeCompare(b.dayKey));

  const dayKeys = [...new Set(items.map((item) => item.dayKey))];

  if (dayKeys.length === 0) {
    return (
      <Card>
        <CardContent>
          <p>No planning items with valid dates yet. Add transport, accommodation, or activities.</p>
          {canCreate ? (
            <p>Use Add item in the header or switch to By type to create your first row.</p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-6">
      {dayKeys.map((dayKey) => {
        const dayItems = items.filter((item) => item.dayKey === dayKey);
        const heading = dayItems[0]?.dayHeading ?? formatDayHeading(dayKey);
        return (
          <section key={dayKey} className="grid gap-3">
            <h2>{heading}</h2>
            <ul className="grid gap-3">
              {dayItems.map((item) => (
                <li key={`${item.kind}:${item.id}`}>
                  <Card>
                    <CardContent className="grid gap-2">
                      <h3>{item.label}</h3>
                      <PlanningStatusBadge status={item.status} />
                      <p>{item.whenLabel}</p>
                      <Link to={item.assignmentsHref}>Open assignments</Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
