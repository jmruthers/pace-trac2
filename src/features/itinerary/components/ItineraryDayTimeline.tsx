import { useMemo, useState } from 'react';
import { EmptyState } from '@solvera/pace-core/components';
import type { ItineraryDayGroup, ItineraryVisibleDateRange } from '@solvera/pace-core/itinerary';
import { getEntryDisplay } from '@/features/itinerary/build-itinerary-model';
import { collectMapDataForDay } from '@/features/itinerary/collect-map-points';
import { ItineraryDayHeader } from '@/features/itinerary/components/ItineraryDayHeader';
import { ItineraryDayNavigator } from '@/features/itinerary/components/ItineraryDayNavigator';
import { ItineraryEntryRow } from '@/features/itinerary/components/ItineraryEntryRow';
import { ItineraryMapPanel } from '@/features/itinerary/components/ItineraryMapPanel';
import { resourceKey } from '@/features/itinerary/map-logistics-to-itinerary-input';
import {
  dayIndexInRange,
  resolveDefaultItineraryDayKey,
  todayDayKey,
} from '@/features/itinerary/resolve-itinerary-day-navigation';
import type { ItineraryResourceDisplay } from '@/features/itinerary/types';

interface ItineraryDayTimelineProps {
  dayGroups: ItineraryDayGroup[];
  visibleDateRange: ItineraryVisibleDateRange | null;
  timezoneIana?: string | null;
  displayByResourceKey: Record<string, ItineraryResourceDisplay>;
  notesByResourceKey: Record<string, string>;
  participantView: boolean;
  canLinkToPlanning: boolean;
  sectionTitle: string;
}

function ItineraryEntryList({
  entries,
  dayKey,
  displayByResourceKey,
  notesByResourceKey,
  participantView,
  canLinkToPlanning,
}: {
  entries: ItineraryDayGroup['entries'];
  dayKey: string;
  displayByResourceKey: Record<string, ItineraryResourceDisplay>;
  notesByResourceKey: Record<string, string>;
  participantView: boolean;
  canLinkToPlanning: boolean;
}) {
  return (
    <ul className="grid w-full min-w-0 list-none gap-4 self-start">
      {entries.map((entry) => {
        const key = resourceKey(entry.resourceType, entry.resourceId);
        return (
          <ItineraryEntryRow
            key={`${entry.resourceType}:${entry.resourceId}:${entry.entryKind}:${dayKey}`}
            entry={entry}
            display={getEntryDisplay(entry, displayByResourceKey)}
            participantView={participantView}
            canLinkToPlanning={canLinkToPlanning}
            assignmentNote={notesByResourceKey[key] ?? null}
          />
        );
      })}
    </ul>
  );
}

function ItineraryDayTimelineBody({
  dayGroups,
  visibleDateRange,
  displayByResourceKey,
  notesByResourceKey,
  participantView,
  canLinkToPlanning,
  sectionTitle,
  defaultDayKey,
}: ItineraryDayTimelineProps & { defaultDayKey: string; visibleDateRange: ItineraryVisibleDateRange }) {
  const [selectedDayKey, setSelectedDayKey] = useState(defaultDayKey);

  const selectedGroup =
    dayGroups.find((group) => group.dayKey === selectedDayKey) ?? {
      dayKey: selectedDayKey,
      entries: [],
    };
  const dayIndex = dayIndexInRange(selectedDayKey, visibleDateRange);

  return (
    <section className="grid gap-4">
      <h2>{sectionTitle}</h2>
      <ItineraryDayNavigator
        range={visibleDateRange}
        selectedDayKey={selectedDayKey}
        onDayKeyChange={setSelectedDayKey}
      />
      <article>
        {dayIndex >= 0 ? (
          <ItineraryDayHeader dayIndex={dayIndex} itemCount={selectedGroup.entries.length} />
        ) : null}
        <section className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-start">
          {selectedGroup.entries.length === 0 ? (
            <EmptyState title="No items scheduled for this day." compact />
          ) : (
            <ItineraryEntryList
              entries={selectedGroup.entries}
              dayKey={selectedGroup.dayKey}
              displayByResourceKey={displayByResourceKey}
              notesByResourceKey={notesByResourceKey}
              participantView={participantView}
              canLinkToPlanning={canLinkToPlanning}
            />
          )}
          <ItineraryMapPanel
            mapData={collectMapDataForDay(selectedGroup, displayByResourceKey)}
          />
        </section>
      </article>
    </section>
  );
}

export function ItineraryDayTimeline({
  dayGroups,
  visibleDateRange,
  timezoneIana,
  displayByResourceKey,
  notesByResourceKey,
  participantView,
  canLinkToPlanning,
  sectionTitle,
}: ItineraryDayTimelineProps) {
  const todayKey = useMemo(() => todayDayKey(timezoneIana), [timezoneIana]);
  const navigationScopeKey =
    visibleDateRange != null
      ? `${visibleDateRange.startDayKey}:${visibleDateRange.endDayKey}:${dayGroups.map((group) => group.dayKey).join(',')}`
      : 'empty';

  const defaultDayKey =
    visibleDateRange != null
      ? resolveDefaultItineraryDayKey({ range: visibleDateRange, todayKey })
      : null;

  if (visibleDateRange == null || defaultDayKey == null) {
    return (
      <section>
        <h2>{sectionTitle}</h2>
        <EmptyState title="No itinerary entries to show for this view yet." compact />
      </section>
    );
  }

  return (
    <ItineraryDayTimelineBody
      key={navigationScopeKey}
      dayGroups={dayGroups}
      visibleDateRange={visibleDateRange}
      timezoneIana={timezoneIana}
      displayByResourceKey={displayByResourceKey}
      notesByResourceKey={notesByResourceKey}
      participantView={participantView}
      canLinkToPlanning={canLinkToPlanning}
      sectionTitle={sectionTitle}
      defaultDayKey={defaultDayKey}
    />
  );
}
