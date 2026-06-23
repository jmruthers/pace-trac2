import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LoadingSpinner,
  PageHeader,
} from '@solvera/pace-core/components';
import { usePaceMain } from '@solvera/pace-core/hooks';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import { useApprovedApplications } from '@/features/assignments/hooks/useApprovedApplications';
import { formatParticipantLabel } from '@/features/assignments/participant-label';
import { ItineraryDayTimeline } from '@/features/itinerary/components/ItineraryDayTimeline';
import { ItineraryDayVisitorState } from '@/features/itinerary/components/ItineraryDayVisitorState';
import { ItineraryParticipantBanner } from '@/features/itinerary/components/ItineraryParticipantBanner';
import { ItineraryViewSwitcher } from '@/features/itinerary/components/ItineraryViewSwitcher';
import { useItineraryEventTimezone } from '@/features/itinerary/hooks/useItineraryEventTimezone';
import {
  buildItineraryParticipantOptions,
  resolveDefaultParticipantId,
} from '@/features/itinerary/itinerary-participant-options';
import { useItineraryViewModel } from '@/features/itinerary/hooks/useItineraryViewModel';
import type { ItineraryViewMode } from '@/features/itinerary/types';

function subtitleForViewMode(viewMode: ItineraryViewMode): string {
  if (viewMode === 'participant') {
    return 'One participant personal schedule — only assigned transport, accommodation, and activities.';
  }
  return 'The full event schedule, grouped by day.';
}

export function ItineraryContent() {
  usePaceMain({ printTitle: 'Itinerary' });
  const breadcrumbItems = useTracEventBreadcrumbs('Itinerary');
  const { ianaTimezone } = useItineraryEventTimezone();
  const { applications } = useApprovedApplications();

  const [viewMode, setViewMode] = useState<ItineraryViewMode>('planner');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const {
    audience,
    model,
    effectiveViewMode,
    effectiveParticipantId,
    assignments,
    isLoading,
    isError,
    error,
  } = useItineraryViewModel({
    viewMode,
    participantApplicationId: selectedParticipantId,
    eventDefaultTimezone: ianaTimezone,
  });

  const participantOptions = useMemo(
    () => buildItineraryParticipantOptions(applications, assignments),
    [applications, assignments]
  );

  useEffect(() => {
    setSelectedParticipantId((current) =>
      resolveDefaultParticipantId(participantOptions, current)
    );
  }, [participantOptions]);

  useEffect(() => {
    if (audience.mode === 'participant') {
      setViewMode('participant');
    }
  }, [audience.mode]);

  const participantName = useMemo(() => {
    if (effectiveParticipantId == null) return null;
    const app = applications.find((row) => row.id === effectiveParticipantId);
    return app != null ? formatParticipantLabel(app) : null;
  }, [applications, effectiveParticipantId]);

  const showParticipantPicker =
    effectiveViewMode === 'participant' &&
    audience.canReadPlanning &&
    participantOptions.length > 0;

  const participantView = effectiveViewMode === 'participant';
  const sectionTitle = participantView ? 'Your itinerary' : 'Event itinerary';

  if (isLoading || audience.isAudiencePending) {
    return (
      <section className="grid min-h-[40vh] place-items-center" aria-busy="true">
        <LoadingSpinner label="Loading itinerary…" />
      </section>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" role="alert">
        <p>{error instanceof Error ? error.message : 'Failed to load itinerary'}</p>
      </Alert>
    );
  }

  if (audience.mode === 'day_visitor') {
    return (
      <section className="grid gap-4">
        <PageHeader breadcrumbItems={breadcrumbItems} title="Itinerary" subtitle={subtitleForViewMode('participant')} />
        <ItineraryDayVisitorState />
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Itinerary"
        subtitle={subtitleForViewMode(viewMode)}
      />

      <ItineraryViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />

      {participantView ? (
        <ItineraryParticipantBanner
          participantName={participantName}
          options={participantOptions}
          selectedParticipantId={effectiveParticipantId}
          onSelectParticipantId={setSelectedParticipantId}
          showPicker={showParticipantPicker}
        />
      ) : null}

      {model != null && model.skippedResources.length > 0 ? (
        <Alert variant="destructive" role="alert">
          <p>
            Some logistics rows could not be included in the schedule because required dates or
            times are missing or invalid. Fix the row in Planning to restore it.
          </p>
          <ul>
            {model.skippedResources.map((issue) => (
              <li key={`${issue.resourceType}:${issue.resourceId}`}>
                {issue.resourceType} {issue.resourceId.slice(0, 8)}: {issue.message}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {model == null ? (
        <p>No itinerary data available.</p>
      ) : (
        <ItineraryDayTimeline
          dayGroups={model.dayGroups}
          visibleDateRange={model.visibleDateRange}
          timezoneIana={ianaTimezone}
          displayByResourceKey={model.displayByResourceKey}
          notesByResourceKey={model.notesByResourceKey}
          participantView={participantView}
          canLinkToPlanning={audience.canReadPlanning}
          sectionTitle={sectionTitle}
        />
      )}
    </section>
  );
}
