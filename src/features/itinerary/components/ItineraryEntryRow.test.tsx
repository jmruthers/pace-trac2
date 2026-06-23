import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { setupUser } from '@test-utils';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
import type { DerivedItineraryDayEntry } from '@solvera/pace-core/itinerary';
import { ItineraryEntryRow } from '@/features/itinerary/components/ItineraryEntryRow';
import type { ItineraryResourceDisplay } from '@/features/itinerary/types';

const entry: DerivedItineraryDayEntry = {
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
};

const display: ItineraryResourceDisplay = {
  resourceType: 'transport',
  resourceId: 'transport-1',
  title: 'Flight — TR100',
  subtitle: 'Sydney → London',
  coords: [],
  status: 'confirmed',
  notes: null,
  bookingReference: 'ABC123',
  currency: 'USD',
  individualCost: 120,
  groupCost: null,
  capacity: 40,
  transportMode: 'Flight',
  transportNumber: 'TR100',
  departureLabel: 'Sydney',
  arrivalLabel: 'London',
  endTime: '2026-06-02T14:00:00.000Z',
};

describe('ItineraryEntryRow', () => {
  it('renders title, detail lines, and assignment note in participant view', () => {
    render(
      <MemoryRouter>
        <ul>
          <ItineraryEntryRow
            entry={entry}
            display={display}
            participantView
            canLinkToPlanning={false}
            assignmentNote="Window seat requested"
          />
        </ul>
      </MemoryRouter>
    );

    expect(screen.queryByText('Transport')).not.toBeInTheDocument();
    expect(screen.getByText('Your Flight — TR100')).toBeInTheDocument();
    expect(screen.getByText('Sydney → London')).toBeInTheDocument();
    expect(screen.queryByText(/arrive/i)).not.toBeInTheDocument();
    expect(screen.getByText('Booking reference: ABC123')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Window seat requested')).toBeInTheDocument();
  });

  it('renders edit button for planners and navigates to planning deep link', async () => {
    const user = setupUser();

    render(
      <MemoryRouter>
        <ul>
          <ItineraryEntryRow
            entry={entry}
            display={display}
            participantView={false}
            canLinkToPlanning
          />
        </ul>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/planning?kind=transport&resourceId=transport-1&edit=1'
    );
  });
});
