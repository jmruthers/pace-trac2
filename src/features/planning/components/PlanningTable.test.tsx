import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { setupUser } from '@test-utils';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlanningTable } from '@/features/planning/components/PlanningTable';
import type { TransportRow } from '@/features/planning/types';

const mockUsePageCan = vi.fn(() => ({ can: true, isLoading: false }));

vi.mock('@solvera/pace-core/rbac', () => ({
  usePageCan: () => mockUsePageCan(),
  useSecureSupabase: () => null,
}));

const transportRow: TransportRow = {
  id: 't-1',
  event_id: 'evt-1',
  organisation_id: 'org-1',
  mode: 'Flight',
  transport_number: 'QF1',
  departure_time: '2026-06-10T08:00:00Z',
  arrival_time: '2026-06-10T12:00:00Z',
  departure_place_id: null,
  departure_display_name: 'Sydney',
  departure_short_address: null,
  departure_coords: null,
  departure_timezone: null,
  arrival_place_id: null,
  arrival_display_name: 'Melbourne',
  arrival_short_address: null,
  arrival_coords: null,
  arrival_timezone: null,
  status: 'planned',
  notes: null,
  booking_reference: null,
  currency: null,
  individual_cost: null,
  group_cost: null,
  capacity: 10,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  created_by: null,
  updated_by: null,
};

vi.mock('@/features/planning/hooks/useLogisticsList', () => ({
  useTransportList: () => ({
    items: [transportRow],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAccommodationList: () => ({
    items: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useActivityList: () => ({
    items: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/planning/hooks/useLogisticsMutations', () => ({
  useTransportMutations: () => ({
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    isSaving: false,
  }),
  useAccommodationMutations: () => ({
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    isSaving: false,
  }),
  useActivityMutations: () => ({
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    isSaving: false,
  }),
}));

vi.mock('@/features/planning/context/GoogleMapsPlanningContext', () => ({
  useGoogleMapsPlanning: () => ({
    apiKey: null,
    isLoaded: false,
    isError: true,
    getTimezone: async () => null,
  }),
}));

vi.mock('@/features/planning/components/PlanningPlaceField', () => ({
  PlanningPlaceField: () => <p>Place field mock</p>,
}));

vi.mock('@/features/planning/components/PlanningItemDialog', () => ({
  PlanningItemDialog: ({ open }: { open: boolean }) =>
    open ? (
      <dialog open>
        <h2>Add planning item</h2>
        <span role="tab">Transport</span>
      </dialog>
    ) : null,
}));

vi.mock('@solvera/pace-core/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/components')>();
  const { Button } = actual;
  return {
    ...actual,
    DataTable: ({ onCreateClick }: { onCreateClick?: () => void }) => (
      <section>
        <Button type="button" onClick={onCreateClick}>
          Create
        </Button>
      </section>
    ),
  };
});

function renderPlanningTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PlanningTable />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('PlanningTable', () => {
  afterEach(() => {
    cleanup();
    mockUsePageCan.mockReset();
    mockUsePageCan.mockReturnValue({ can: true, isLoading: false });
  });

  it('renders type filter buttons with counts', () => {
    renderPlanningTable();
    expect(screen.getByRole('button', { name: 'All (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Transport (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accommodation (0)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activity (0)' })).toBeInTheDocument();
  });

  it('opens unified create dialog from DataTable create action', async () => {
    const user = setupUser();
    renderPlanningTable();
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add planning item' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Transport' })).toBeInTheDocument();
  });

  it('opens edit dialog when deep-linked from itinerary', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/planning?kind=transport&resourceId=t-1&edit=1']}>
          <PlanningTable />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
