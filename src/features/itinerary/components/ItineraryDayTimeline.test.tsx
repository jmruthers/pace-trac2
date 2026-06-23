import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { setupUser } from '@test-utils';
import { MemoryRouter } from 'react-router-dom';
import type { ItineraryDayGroup } from '@solvera/pace-core/itinerary';
import { ItineraryDayTimeline } from '@/features/itinerary/components/ItineraryDayTimeline';
import { formatDayHeading } from '@/features/planning/planning-format';

vi.mock('@/features/itinerary/components/ItineraryMapPanel', () => ({
  ItineraryMapPanel: () => <section aria-label="Day map mock" />,
}));

vi.mock('@/features/itinerary/resolve-itinerary-day-navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/itinerary/resolve-itinerary-day-navigation')>();
  return {
    ...actual,
    todayDayKey: () => '2026-06-01',
  };
});

const dayGroups: ItineraryDayGroup[] = [
  {
    dayKey: '2026-06-01',
    entries: [
      {
        dayKey: '2026-06-01',
        localDate: '2026-06-01',
        resourceType: 'transport',
        resourceId: 'transport-1',
        entryKind: 'departure',
        orderingTimestamp: '2026-06-01T08:00:00.000Z',
        orderingEpochMs: 0,
        sortCategory: 'timestamp',
        timezone: 'Australia/Sydney',
        timezoneSource: 'departure_timezone',
      },
    ],
  },
  {
    dayKey: '2026-06-02',
    entries: [
      {
        dayKey: '2026-06-02',
        localDate: '2026-06-02',
        resourceType: 'activity',
        resourceId: 'activity-1',
        entryKind: 'start',
        orderingTimestamp: '2026-06-02T10:00:00.000Z',
        orderingEpochMs: 0,
        sortCategory: 'timestamp',
        timezone: 'Europe/London',
        timezoneSource: 'start_timezone',
      },
    ],
  },
];

const visibleDateRange = { startDayKey: '2026-06-01', endDayKey: '2026-06-02' };

const displayByResourceKey = {
  'transport:transport-1': {
    resourceType: 'transport' as const,
    resourceId: 'transport-1',
    title: 'Flight — TR100',
    subtitle: 'Sydney → London',
    coords: [],
    status: null,
    notes: null,
    bookingReference: null,
    currency: null,
    individualCost: null,
    groupCost: null,
    capacity: null,
    departureLabel: 'Sydney',
    arrivalLabel: 'London',
  },
  'activity:activity-1': {
    resourceType: 'activity' as const,
    resourceId: 'activity-1',
    title: 'Opening session',
    subtitle: 'Main hall',
    coords: [],
    status: null,
    notes: null,
    bookingReference: null,
    currency: null,
    individualCost: null,
    groupCost: null,
    capacity: null,
    startLocationLabel: 'Main hall',
    finishLocationLabel: 'Main hall',
  },
};

function renderTimeline(props: {
  dayGroups: ItineraryDayGroup[];
  visibleDateRange: typeof visibleDateRange | null;
  displayByResourceKey: typeof displayByResourceKey;
  notesByResourceKey: Record<string, string>;
  participantView: boolean;
  canLinkToPlanning: boolean;
  sectionTitle: string;
}) {
  return render(
    <MemoryRouter>
      <ItineraryDayTimeline {...props} />
    </MemoryRouter>
  );
}

describe('ItineraryDayTimeline', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows navigator and only the default day entries at a time', async () => {
    const user = setupUser();

    renderTimeline({
      dayGroups,
      visibleDateRange,
      displayByResourceKey,
      notesByResourceKey: {},
      participantView: false,
      canLinkToPlanning: false,
      sectionTitle: 'Event itinerary',
    });

    expect(screen.getByLabelText('Itinerary day')).toBeInTheDocument();
    expect(screen.getByText(formatDayHeading('2026-06-01'))).toBeInTheDocument();
    expect(screen.getByText('Flight — TR100')).toBeInTheDocument();
    expect(screen.queryByText('Opening session')).not.toBeInTheDocument();
    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Day map mock')).toBeInTheDocument();

    await user.click(within(screen.getByLabelText('Itinerary day')).getByRole('button', { name: 'Next day' }));

    expect(screen.getByText(formatDayHeading('2026-06-02'))).toBeInTheDocument();
    expect(screen.getByText('Opening session')).toBeInTheDocument();
    expect(screen.queryByText('Flight — TR100')).not.toBeInTheDocument();
    expect(screen.getByText('Day 2')).toBeInTheDocument();
  });

  it('shows EmptyState for a day with no entries inside the range', async () => {
    const user = setupUser();

    renderTimeline({
      dayGroups: [dayGroups[0]!],
      visibleDateRange: { startDayKey: '2026-06-01', endDayKey: '2026-06-03' },
      displayByResourceKey,
      notesByResourceKey: {},
      participantView: false,
      canLinkToPlanning: false,
      sectionTitle: 'Event itinerary',
    });

    await user.click(within(screen.getByLabelText('Itinerary day')).getByRole('button', { name: 'Next day' }));
    await user.click(within(screen.getByLabelText('Itinerary day')).getByRole('button', { name: 'Next day' }));

    expect(screen.getByText('No items scheduled for this day.')).toBeInTheDocument();
    expect(screen.getByText('Day 3')).toBeInTheDocument();
  });

  it('shows EmptyState when there is no visible date range', () => {
    renderTimeline({
      dayGroups: [],
      visibleDateRange: null,
      displayByResourceKey,
      notesByResourceKey: {},
      participantView: false,
      canLinkToPlanning: false,
      sectionTitle: 'Event itinerary',
    });

    expect(screen.queryByLabelText('Itinerary day')).not.toBeInTheDocument();
    expect(screen.getByText('No itinerary entries to show for this view yet.')).toBeInTheDocument();
  });
});
