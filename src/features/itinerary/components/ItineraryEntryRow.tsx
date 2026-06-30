import { useMemo } from 'react';
import type { DerivedItineraryDayEntry } from '@solvera/pace-core/itinerary';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
} from '@solvera/pace-core/components';
import { SquarePen } from '@solvera/pace-core/icons';
import { useNavigate } from 'react-router-dom';
import {
  buildEntryDetailLines,
  buildEntryTimeColumn,
  buildEntryTitle,
} from '@/features/itinerary/build-entry-card-details';
import { ItineraryEntryMapPanel } from '@/features/itinerary/components/ItineraryEntryMapPanel';
import { ItineraryResourceMark } from '@/features/itinerary/components/ItineraryResourceMark';
import { hasDistinctMapEndpoints } from '@/features/itinerary/has-distinct-map-endpoints';
import { PlanningStatusBadge } from '@/features/planning/components/PlanningStatusBadge';
import type { ItineraryResourceDisplay } from '@/features/itinerary/types';

interface ItineraryEntryRowProps {
  entry: DerivedItineraryDayEntry;
  display: ItineraryResourceDisplay;
  participantView: boolean;
  canLinkToPlanning: boolean;
  assignmentNote?: string | null;
  showRouteMap?: boolean;
  /** When true, entry maps reuse a parent {@link GoogleMapsPlanningProvider}. */
  embeddedMaps?: boolean;
}

function EntryTimeLine({
  time,
  timezoneLabel,
}: {
  time: string;
  timezoneLabel: string | null;
}) {
  if (timezoneLabel == null || timezoneLabel === '') {
    return <p>{time}</p>;
  }

  return (
    <p>
      {time}
      <small> {timezoneLabel}</small>
    </p>
  );
}

export function ItineraryEntryRow({
  entry,
  display,
  participantView,
  canLinkToPlanning,
  assignmentNote,
  showRouteMap = false,
  embeddedMaps = false,
}: ItineraryEntryRowProps) {
  const navigate = useNavigate();
  const cardTitle = buildEntryTitle(entry, display, participantView);
  const timeColumn = buildEntryTimeColumn(entry, display);
  const detailLines = useMemo(
    () => buildEntryDetailLines(entry, display),
    [entry, display]
  );
  const showMap =
    showRouteMap &&
    entry.entryKind !== 'arrival' &&
    entry.entryKind !== 'finish' &&
    hasDistinctMapEndpoints(display);
  const hasTextBody =
    detailLines.length > 0 || (assignmentNote != null && assignmentNote !== '');
  const hasBody = hasTextBody || showMap;

  const handleEdit = () => {
    navigate(
      `/planning?kind=${entry.resourceType}&resourceId=${entry.resourceId}&edit=1`
    );
  };

  return (
    <li className="min-w-0">
      <Card>
        <CardHeader className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
          <ItineraryResourceMark
            resourceType={display.resourceType}
            transportMode={display.transportMode}
          />
          <article className="min-w-0">
            <h5 className="min-w-0 break-words">{cardTitle}</h5>
            <EntryTimeLine
              time={timeColumn.startTime}
              timezoneLabel={
                timeColumn.startTimezoneLabel !== '' ? timeColumn.startTimezoneLabel : null
              }
            />
            {timeColumn.endTime != null ? (
              <EntryTimeLine
                time={timeColumn.endTime}
                timezoneLabel={timeColumn.endTimezoneLabel}
              />
            ) : null}
          </article>
          <aside className="grid auto-cols-max grid-flow-col items-center justify-end gap-2">
            <PlanningStatusBadge status={display.status} />
            {canLinkToPlanning ? (
              <Button
                type="button"
                variant="outline"
                aria-label="Edit"
                onClick={handleEdit}
              >
                <SquarePen className="size-4" aria-hidden />
              </Button>
            ) : null}
          </aside>
        </CardHeader>
        {hasBody ? (
          <CardContent
            className={
              showMap && hasTextBody
                ? 'grid min-w-0 gap-2 pt-0 lg:grid-cols-2 lg:items-stretch'
                : 'grid min-w-0 gap-2 pt-0'
            }
          >
            {hasTextBody ? (
              <section className="min-w-0 self-start">
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
              </section>
            ) : null}
            {showMap ? (
              <ItineraryEntryMapPanel display={display} embedded={embeddedMaps} />
            ) : null}
          </CardContent>
        ) : null}
      </Card>
    </li>
  );
}
