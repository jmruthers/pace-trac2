import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  CardGrid,
  CardGridItem,
  EmptyState,
  LoadingSpinner,
  PageHeader,
} from '@solvera/pace-core/components';
import { ChevronDown, ArrowUp, Calendar } from '@solvera/pace-core/icons';
import { useOptionalEvents } from '@solvera/pace-core/hooks';
import type { EventStub } from '@solvera/pace-core/types';
import { TracEventTile } from '@/app/pages/landing/components/TracEventTile';
import { TracLandingAttentionSection } from '@/app/pages/landing/components/TracLandingAttentionSection';
import { useTracLandingOpenRisks } from '@/app/pages/landing/hooks/useTracLandingOpenRisks';
import {
  orderTracLandingEvents,
  shouldShowTracEventsToggle,
  sliceVisibleTracEvents,
} from '@/app/pages/landing/lib/order-trac-events';
import { useTracLandingBreadcrumbs } from '@/app/pages/landing/lib/use-trac-landing-breadcrumbs';

export function TracEventsLandingSection() {
  const navigate = useNavigate();
  const breadcrumbItems = useTracLandingBreadcrumbs();
  const { events, isLoading: eventsLoading, setSelectedEvent } = useOptionalEvents();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setSelectedEvent(null);
  }, [setSelectedEvent]);

  const orderedEvents = useMemo(() => orderTracLandingEvents(events), [events]);
  const visibleEvents = useMemo(
    () => sliceVisibleTracEvents(orderedEvents, showAll),
    [orderedEvents, showAll]
  );
  const showToggle = shouldShowTracEventsToggle(orderedEvents.length);
  const eventIds = useMemo(() => orderedEvents.map((event) => event.id), [orderedEvents]);

  const {
    data: openRiskCountByEventId = new Map<string, number>(),
    isLoading: risksLoading,
    error: risksError,
  } = useTracLandingOpenRisks(eventIds);

  const handleSelectEvent = useCallback(
    (event: EventStub) => {
      setSelectedEvent(event);
      navigate('/dashboard');
    },
    [navigate, setSelectedEvent]
  );

  const handleAttentionSelect = useCallback(
    (event: EventStub) => {
      setSelectedEvent(event);
      navigate('/risks');
    },
    [navigate, setSelectedEvent]
  );

  if (eventsLoading || risksLoading) {
    return (
      <section className="grid min-h-[12rem] place-items-center" aria-busy="true">
        <LoadingSpinner label="Loading events…" />
      </section>
    );
  }

  if (risksError != null) {
    return (
      <p>
        {risksError instanceof Error
          ? risksError.message
          : 'Unable to load cross-event risk summary.'}
      </p>
    );
  }

  return (
    <section className="grid gap-4">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Choose an event"
        subtitle={
          <>
            You plan the trip logistics for <strong>{orderedEvents.length}</strong> events. Pick one
            to manage its transport, accommodation, activities, itinerary, costs and risks.
          </>
        }
      />

      {orderedEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Events created in the operator app will appear here to plan."
        />
      ) : (
        <>
          <CardGrid columns={{ md: 2, lg: 4 }}>
            {visibleEvents.map((event) => (
              <CardGridItem key={event.id}>
                <TracEventTile event={event} onSelect={handleSelectEvent} />
              </CardGridItem>
            ))}
          </CardGrid>

          {showToggle ? (
            <section className="grid place-items-center">
              <Button type="button" variant="outline" onClick={() => setShowAll((value) => !value)}>
                {showAll ? (
                  <>
                    <ArrowUp className="size-4" aria-hidden />
                    Show fewer
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4" aria-hidden />
                    Show all ({orderedEvents.length})
                  </>
                )}
              </Button>
            </section>
          ) : null}

          <TracLandingAttentionSection
            events={orderedEvents}
            openRiskCountByEventId={openRiskCountByEventId}
            onSelectEventAndNavigateRisks={handleAttentionSelect}
          />
        </>
      )}
    </section>
  );
}
