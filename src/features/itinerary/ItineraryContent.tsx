import {
  Alert,
  EmptyState,
  LoadingSpinner,
  PageHeader,
} from '@solvera/pace-core/components';
import { usePaceMain } from '@solvera/pace-core/hooks';
import { usePageCan, useResolvedScope } from '@solvera/pace-core/rbac';
import { useTracEventBreadcrumbs } from '@/app/shell/use-trac-event-breadcrumbs';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { ItineraryDayTimeline } from '@/features/itinerary/components/ItineraryDayTimeline';
import { ItineraryDayVisitorState } from '@/features/itinerary/components/ItineraryDayVisitorState';
import { useItineraryEventTimezone } from '@/features/itinerary/hooks/useItineraryEventTimezone';
import { useEventAssignments } from '@/features/itinerary/hooks/useEventAssignments';
import { useItineraryViewModel } from '@/features/itinerary/hooks/useItineraryViewModel';

const PERSONAL_SUBTITLE =
  'One participant personal schedule — only assigned transport, accommodation, and activities.';

function formatItineraryLoadError(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return 'Failed to load itinerary';
}

function formatScopeLoadError(resilienceErrors: { message?: string }[] | undefined): string {
  const first = (resilienceErrors ?? []).find((entry) => entry.message?.trim() !== '');
  if (first?.message != null && first.message.trim() !== '') {
    return first.message;
  }
  return 'Event or organisation context could not be loaded. Refresh the page or select the event again.';
}

function hasItineraryEntries(
  dayGroups: { entries: unknown[] }[],
  visibleDateRange: unknown
): boolean {
  if (visibleDateRange == null) return false;
  return dayGroups.some((group) => group.entries.length > 0);
}

export function ItineraryContent() {
  usePaceMain({ printTitle: 'Itinerary' });
  const breadcrumbItems = useTracEventBreadcrumbs('Itinerary');
  const resolvedScope = useResolvedScope();
  const { ianaTimezone } = useItineraryEventTimezone();
  const eventAssignments = useEventAssignments();
  const { can: canReadPlanning } = usePageCan(TRAC_PAGE_NAMES.planning, 'read');

  const { audience, model, isLoading, isLogisticsLoading, isError, error } = useItineraryViewModel({
    eventDefaultTimezone: ianaTimezone,
    eventAssignments,
  });

  const scopeLoadFailed =
    !resolvedScope.isLoading && (resolvedScope.resilienceErrors?.length ?? 0) > 0;

  if (scopeLoadFailed) {
    return (
      <Alert variant="destructive" role="alert">
        <p>{formatScopeLoadError(resolvedScope.resilienceErrors)}</p>
      </Alert>
    );
  }

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
        <p>{formatItineraryLoadError(error)}</p>
      </Alert>
    );
  }

  if (audience.mode === 'day_visitor') {
    return (
      <section className="grid gap-4">
        <PageHeader breadcrumbItems={breadcrumbItems} title="Itinerary" subtitle={PERSONAL_SUBTITLE} />
        <ItineraryDayVisitorState />
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <PageHeader breadcrumbItems={breadcrumbItems} title="Itinerary" subtitle={PERSONAL_SUBTITLE} />

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

      {model == null && isLogisticsLoading ? (
        <section className="grid min-h-[20vh] place-items-center" aria-busy="true">
          <LoadingSpinner label="Loading itinerary…" />
        </section>
      ) : model == null || !hasItineraryEntries(model.dayGroups, model.visibleDateRange) ? (
        <EmptyState title="No itinerary entries to show for this view yet." compact />
      ) : (
        <ItineraryDayTimeline
          dayGroups={model.dayGroups}
          visibleDateRange={model.visibleDateRange}
          timezoneIana={ianaTimezone}
          displayByResourceKey={model.displayByResourceKey}
          notesByResourceKey={model.notesByResourceKey}
          participantView
          canLinkToPlanning={canReadPlanning}
          sectionTitle="Your itinerary"
        />
      )}
    </section>
  );
}
