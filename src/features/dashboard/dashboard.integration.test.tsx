/**
 * SLICE-02 dashboard integration tests (TR02 testing requirements).
 */
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { computeCostRollup } from '@/features/costs/cost-rollup';
import { summarizePlanningStatusCounts } from '@/features/dashboard/planning-status-summary';
import type { DashboardPlanningCountsState } from '@/features/dashboard/hooks/useDashboardPlanningCounts';
import type { DashboardEventHeader } from '@/features/dashboard/types';

const mockUsePageCan = vi.fn();

const mockHeader: DashboardEventHeader = {
  eventId: 'event-1',
  title: 'Summit 2026',
  tagline: 'Plan the journey',
  logoFileReference: null,
};

vi.mock('@solvera/pace-core/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/hooks')>();
  return {
    ...actual,
    usePaceMain: vi.fn(),
    useOptionalEvents: () => ({
      selectedEvent: { id: 'event-1', organisation_id: 'org-1', name: 'Summit 2026' },
      isLoading: false,
    }),
    useEvents: () => ({
      selectedEvent: { id: 'event-1', organisation_id: 'org-1', name: 'Summit 2026' },
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
    PagePermissionGuard: ({
      children,
      fallback,
    }: {
      children: ReactNode;
      fallback?: ReactNode;
    }) => {
      const { can, isLoading } = mockUsePageCan();
      if (isLoading) return null;
      if (!can) return fallback ?? null;
      return children;
    },
  };
});

vi.mock('@/features/dashboard/hooks/useDashboardEventHeader', () => ({
  useDashboardEventHeader: () => ({
    header: mockHeader,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const mockRollup = computeCostRollup({
  baseCurrency: 'USD',
  approvedParticipantCount: 2,
  rates: [{ currency_code: 'USD', exchange_rate: 1 }],
  assignments: [],
  lines: [
    {
      resourceType: 'transport',
      resourceId: 't1',
      currency: 'USD',
      individual_cost: 100,
      group_cost: 0,
      label: 'Flight',
    },
  ],
});

vi.mock('@/features/costs/hooks/useCostRollupData', () => ({
  useCostRollupData: () => ({
    rollup: mockRollup,
    baseCurrency: 'USD',
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/dashboard/hooks/useDashboardItineraryRange', () => ({
  useDashboardItineraryRange: () => ({
    visibleDateRange: { startDayKey: '2026-05-01', endDayKey: '2026-05-04' },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/dashboard/hooks/useDashboardContactsCount', () => ({
  useDashboardContactsCount: () => ({
    count: 3,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const mockPlanningCounts = vi.fn((): DashboardPlanningCountsState => ({
  transport: { confirmed: 1, total: 2 },
  accommodation: { confirmed: 0, total: 1 },
  activity: { confirmed: 2, total: 2 },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
}));

vi.mock('@/features/dashboard/hooks/useDashboardPlanningCounts', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/features/dashboard/hooks/useDashboardPlanningCounts')
  >();
  return {
    ...actual,
    useDashboardPlanningCounts: () => mockPlanningCounts(),
  };
});

import { DashboardPage } from '@/app/pages/DashboardPage';

describe('dashboard integration (TR02)', () => {
  beforeEach(() => {
    mockUsePageCan.mockReturnValue({ can: true, isLoading: false });
    mockPlanningCounts.mockReturnValue({
      transport: { confirmed: 1, total: 2 },
      accommodation: { confirmed: 0, total: 1 },
      activity: { confirmed: 2, total: 2 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(cleanup);

  it('happy path: planner sees summary cards with counts and links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Summit 2026' })).toBeInTheDocument();
    expect(screen.getByText('Plan the journey')).toBeInTheDocument();
    expect(screen.getByText(/Transport: 1 confirmed of 2/)).toBeInTheDocument();
    expect(screen.getByText(/Visible dates:/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contacts' })).toBeInTheDocument();
    expect(screen.getByText('3', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/Event total:/)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Open planning' })).toHaveAttribute('href', '/planning');
    expect(screen.getByRole('link', { name: 'Open itinerary' })).toHaveAttribute('href', '/itinerary');
    expect(screen.getByRole('link', { name: 'Open costs' })).toHaveAttribute('href', '/costs');
    expect(screen.getByRole('link', { name: 'Open contacts' })).toHaveAttribute('href', '/contacts');
    expect(screen.getByRole('link', { name: 'Open assignments' })).toHaveAttribute(
      'href',
      '/assignments'
    );
  });

  it('validation / domain failure: invalid trac_status does not crash dashboard', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockPlanningCounts.mockReturnValue({
      transport: { confirmed: 0, total: 1 },
      accommodation: { confirmed: 0, total: 0 },
      activity: { confirmed: 0, total: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    summarizePlanningStatusCounts([{ status: 'not-a-trac-status' }]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Summit 2026' })).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('partial failure: one card error does not blank sibling cards (AC7)', () => {
    mockPlanningCounts.mockReturnValue({
      transport: { confirmed: 0, total: 0 },
      accommodation: { confirmed: 0, total: 0 },
      activity: { confirmed: 0, total: 0 },
      isLoading: false,
      isError: true,
      error: new Error('Planning load failed'),
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Summit 2026' })).toBeInTheDocument();
    expect(screen.getByText(/Planning load failed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Itinerary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Costs' })).toBeInTheDocument();
    expect(screen.getByText(/Visible dates:/)).toBeInTheDocument();
    expect(screen.getByText(/Event total:/)).toBeInTheDocument();
  });

  it('auth / permission failure: user without dashboard read sees denial', () => {
    mockUsePageCan.mockReturnValue({ can: false, isLoading: false });

    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/do not have permission to view this page/i)).toBeInTheDocument();
  });
});
