/**
 * SLICE-10 master plan integration tests (TR10 testing requirements).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { MasterPlanContent } from '@/features/master-plan/MasterPlanContent';

const mockUsePageCan = vi.fn();

vi.mock('@/app/shell/use-trac-event-breadcrumbs', () => ({
  useTracEventBreadcrumbs: () => [],
}));

vi.mock('@solvera/pace-core/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/components')>();
  return {
    ...actual,
    DataTable: ({ data }: { data: Array<{ first_name: string; surname: string }> }) => (
      <table>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.first_name}-${row.surname}`}>
              <td>{row.first_name}</td>
              <td>{row.surname}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  };
});

vi.mock('@solvera/pace-core/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/hooks')>();
  return {
    ...actual,
    usePaceMain: vi.fn(),
    useFileDisplay: () => ({ url: null }),
    useOptionalEvents: () => ({
      selectedEvent: { id: 'event-1', organisation_id: 'org-1', event_code: 'WSJ27' },
      isLoading: false,
    }),
    useEvents: () => ({
      selectedEvent: { id: 'event-1', organisation_id: 'org-1', event_code: 'WSJ27' },
      isLoading: false,
    }),
  };
});

vi.mock('@solvera/pace-core/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/rbac')>();
  return {
    ...actual,
    usePageCan: (...args: unknown[]) => mockUsePageCan(...args),
    useSecureSupabase: () => null,
    useResolvedScope: () => ({
      eventId: 'event-1',
      organisationId: 'org-1',
      isLoading: false,
    }),
  };
});

const mockHeader = {
  eventId: 'event-1',
  eventCode: 'WSJ27',
  title: 'World Scout Jamboree',
  tagline: 'Plan the journey',
  logoFileReference: null,
  dateRangeLabel: '1 Jun – 10 Jun 2026',
  organisationName: 'Scouts Australia',
  approvedParticipantCount: 12,
  baseCurrency: 'AUD',
};

vi.mock('@/features/master-plan/hooks/useMasterPlanEventHeader', () => ({
  useMasterPlanEventHeader: () => ({
    header: mockHeader,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/itinerary/components/ItineraryMapPanel', () => ({
  ItineraryMapPanel: () => <section aria-label="Journey map panel">Map</section>,
}));

vi.mock('@/features/master-plan/hooks/useMasterPlanViewModel', () => ({
  useMasterPlanViewModel: () => ({
    mapData: {
      points: [{ lat: -33.86, lng: 151.21, label: 'Sydney' }],
      transportLegs: [
        {
          resourceId: 'transport-1',
          from: { lat: -33.86, lng: 151.21 },
          to: { lat: 51.47, lng: -0.45 },
        },
      ],
    },
    itineraryModel: {
      dayGroups: [
        {
          dayKey: '2026-06-01',
          entries: [],
        },
      ],
      visibleDateRange: { startDayKey: '2026-06-01', endDayKey: '2026-06-01' },
      displayByResourceKey: {},
      skippedResources: [],
      notesByResourceKey: {},
    },
    timezoneIana: 'Europe/London',
    isLoading: false,
    isLogisticsLoading: false,
    isError: false,
    error: null,
    transportItems: [],
  }),
}));

vi.mock('@/features/contacts/hooks/use-contacts', () => ({
  useContacts: () => ({
    contacts: [
      {
        id: 'contact-1',
        event_id: 'event-1',
        organisation_id: 'org-1',
        first_name: 'Sam',
        surname: 'Coordinator',
        role: 'Lead',
        phone_number: '0400 000 000',
        email_address: 'sam@example.com',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        created_by: null,
        updated_by: null,
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

const costMock = vi.hoisted(() => ({
  rollup: {
    baseCurrency: 'AUD',
    eventTotalBase: 1000,
    approvedParticipantCount: 12,
    participantsWithAllocation: 8,
    participantTotalsByApplicationId: {},
    rowBreakdowns: [
      {
        resourceType: 'transport' as const,
        resourceId: 't1',
        assignedCount: 2,
        rowTotalBase: 400,
        rowTotalNative: 400,
        currency: 'AUD',
        hasUnallocatedGroupCost: false,
        missingRate: false,
      },
      {
        resourceType: 'accommodation' as const,
        resourceId: 'a1',
        assignedCount: 2,
        rowTotalBase: 600,
        rowTotalNative: 600,
        currency: 'AUD',
        hasUnallocatedGroupCost: false,
        missingRate: false,
      },
    ],
  },
  isLoading: false,
  isError: false,
  error: null as string | null,
}));

vi.mock('@/features/costs/hooks/useCostRollupData', () => ({
  useCostRollupData: () => ({
    rollup: costMock.rollup,
    baseCurrency: 'AUD',
    isLoading: costMock.isLoading,
    isError: costMock.isError,
    error: costMock.error,
    refetch: vi.fn(),
  }),
}));

describe('MasterPlanContent integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePageCan.mockReturnValue({ can: true, isLoading: false });
    costMock.isError = false;
    costMock.error = null;
  });

  afterEach(cleanup);

  it('happy path: renders header, journey map, contacts, costs, and itinerary sections', async () => {
    render(
      <MemoryRouter>
        <MasterPlanContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Master plan' })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'World Scout Jamboree' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Journey map' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact list' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cost summary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Itinerary' })).toBeInTheDocument();
    expect(screen.getByLabelText('Journey map panel')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Back to itinerary' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Print master plan' })).not.toBeInTheDocument();
  });

  it('partial failure: costs error still leaves other sections visible', async () => {
    costMock.isError = true;
    costMock.error = 'Costs unavailable';

    render(
      <MemoryRouter>
        <MasterPlanContent />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Costs unavailable/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Journey map' })).toBeInTheDocument();
  });

  it('auth failure: masterplan read denied via page guard consumer', () => {
    mockUsePageCan.mockImplementation((pageName: string) => ({
      can: pageName !== TRAC_PAGE_NAMES.masterplan,
      isLoading: false,
    }));

    expect(mockUsePageCan(TRAC_PAGE_NAMES.masterplan, 'read').can).toBe(false);
  });
});
