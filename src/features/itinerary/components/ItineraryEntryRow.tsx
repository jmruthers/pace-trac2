import { useMemo } from 'react';
import type { DerivedItineraryDayEntry } from '@solvera/pace-core/itinerary';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@solvera/pace-core/components';
import { SquarePen } from '@solvera/pace-core/icons';
import { useNavigate } from 'react-router-dom';
import {
  buildEntryDetailLines,
  buildEntryTitle,
  formatEntryTimeRange,
} from '@/features/itinerary/build-entry-card-details';
import { ItineraryResourceMark } from '@/features/itinerary/components/ItineraryResourceMark';
import { formatEntryTimezoneLabel } from '@/features/itinerary/format-entry-kind';
import { PlanningStatusBadge } from '@/features/planning/components/PlanningStatusBadge';
import type { ItineraryResourceDisplay } from '@/features/itinerary/types';

interface ItineraryEntryRowProps {
  entry: DerivedItineraryDayEntry;
  display: ItineraryResourceDisplay;
  participantView: boolean;
  canLinkToPlanning: boolean;
  assignmentNote?: string | null;
}

export function ItineraryEntryRow({
  entry,
  display,
  participantView,
  canLinkToPlanning,
  assignmentNote,
}: ItineraryEntryRowProps) {
  const navigate = useNavigate();
  const cardTitle = buildEntryTitle(entry, display, participantView);
  const timeRange = formatEntryTimeRange(entry, display);
  const timezoneLabel = formatEntryTimezoneLabel(entry.timezone);
  const detailLines = useMemo(
    () => buildEntryDetailLines(entry, display),
    [entry, display]
  );
  const hasBody =
    detailLines.length > 0 ||
    (assignmentNote != null && assignmentNote !== '');

  const handleEdit = () => {
    navigate(
      `/planning?kind=${entry.resourceType}&resourceId=${entry.resourceId}&edit=1`
    );
  };

  return (
    <li className="min-w-0">
      <Card>
        <CardHeader className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
          <ItineraryResourceMark
            resourceType={display.resourceType}
            transportMode={display.transportMode}
          />
          <article className="grid min-w-0 grid-cols-[minmax(4rem,5rem)_minmax(0,1fr)] items-start gap-3">
            <aside className="min-w-0">
              <p>{timeRange}</p>
              {timezoneLabel !== '' ? <small>{timezoneLabel}</small> : null}
            </aside>
            <header className="min-w-0">
              <h5 className="min-w-0 break-words">{cardTitle}</h5>
            </header>
          </article>
          <aside>
            <PlanningStatusBadge status={display.status} />
          </aside>
        </CardHeader>
        {hasBody ? (
          <CardContent className="grid min-w-0 gap-1 pt-0">
            {detailLines.map((line) => (
              <p key={line.id} className="min-w-0 break-words break-all">
                {line.text}
              </p>
            ))}
            {assignmentNote != null && assignmentNote !== '' ? (
              <p className="min-w-0 break-words break-all">
                <Badge variant="soft-main-muted">{assignmentNote}</Badge>
              </p>
            ) : null}
          </CardContent>
        ) : null}
        {canLinkToPlanning ? (
          <CardFooter className="text-right pt-0">
            <Button
              type="button"
              variant="outline"
              aria-label="Edit"
              onClick={handleEdit}
            >
              <SquarePen className="size-4" aria-hidden />
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </li>
  );
}
