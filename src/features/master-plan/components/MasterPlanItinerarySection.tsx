import { Alert } from '@solvera/pace-core/components';
import { formatDate } from '@solvera/pace-core/utils';
import { getEntryDisplay } from '@/features/itinerary/build-itinerary-model';
import { ItineraryEntryRow } from '@/features/itinerary/components/ItineraryEntryRow';
import { filterConsolidatedItineraryEntries } from '@/features/itinerary/filter-consolidated-itinerary-entries';
import type { ItineraryModel } from '@/features/itinerary/types';
import { MasterPlanSectionShell } from '@/features/master-plan/components/MasterPlanSectionShell';

interface ItineraryTimezoneNoticeProps {
  timezoneIana?: string | null;
}

export function ItineraryTimezoneNotice({ timezoneIana }: ItineraryTimezoneNoticeProps) {
  const label = timezoneIana?.trim() || 'the event timezone';
  return (
    <Alert>
      <p>Itinerary times are shown in {label}. Confirm local times with your coordinator before travel.</p>
    </Alert>
  );
}

interface MasterPlanItinerarySectionProps {
  model: ItineraryModel | null;
  timezoneIana?: string | null;
  canLinkToPlanning?: boolean;
  embeddedMaps?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
}

function formatDayHeading(dayKey: string): string {
  return formatDate(`${dayKey}T12:00:00.000Z`);
}

export function MasterPlanItinerarySection({
  model,
  timezoneIana,
  canLinkToPlanning = false,
  embeddedMaps = false,
  isLoading,
  isError,
  errorMessage,
}: MasterPlanItinerarySectionProps) {
  const dayCount = model?.dayGroups.filter((group) => group.entries.length > 0).length ?? 0;
  const timezoneLabel = timezoneIana?.trim() || 'event timezone';

  return (
    <MasterPlanSectionShell
      title="Itinerary"
      countLabel={`${dayCount} days · all times ${timezoneLabel}`}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      className="grid gap-4"
    >
      <ItineraryTimezoneNotice timezoneIana={timezoneIana} />
      {model == null || dayCount === 0 ? (
        <p>No itinerary entries are scheduled for this event yet.</p>
      ) : (
        model.dayGroups
          .filter((group) => group.entries.length > 0)
          .map((group, index) => (
            <article key={group.dayKey} className="grid gap-3">
              <header>
                <h3>
                  Day {index + 1} · {formatDayHeading(group.dayKey)}
                </h3>
              </header>
              <ul className="grid list-none gap-3">
                {filterConsolidatedItineraryEntries(group.entries).map((entry) => {
                  const display = getEntryDisplay(entry, model.displayByResourceKey);
                  return (
                    <ItineraryEntryRow
                      key={`${entry.resourceType}:${entry.resourceId}:${entry.entryKind}:${group.dayKey}`}
                      entry={entry}
                      display={display}
                      participantView={false}
                      canLinkToPlanning={canLinkToPlanning}
                      showRouteMap
                      embeddedMaps={embeddedMaps}
                    />
                  );
                })}
              </ul>
            </article>
          ))
      )}
    </MasterPlanSectionShell>
  );
}
