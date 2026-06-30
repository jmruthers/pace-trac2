/**
 * SLICE-02 dashboard integration tests (TR02 testing requirements).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { computeCostRollup } from '@/features/costs/cost-rollup';
import { summarizePlanningStatusCounts } from '@/features/dashboard/planning-status-summary';
import type { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import type { DashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import type { DashboardEventHeader } from '@/features/dashboard/types';

type DashboardSummaryState = ReturnType<typeof useDashboardSummary>;

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
    PagePermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useSecureSupabase: () => null,
    usePageCan: () => ({ can: true, isLoading: false }),
    useResolvedScope: () => ({
      eventId: 'event-1',
      organisationId: 'org-1',
      isLoading: false,
    }),
  };
});

const mockHeader: DashboardEventHeader = {
  eventId: 'event-1',
  title: 'Summit 2026',
  tagline: 'Plan the journey',
  logoFileReference: null,
};

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

const mockSummary: DashboardSummary = {
  planning: {
    transport: { confirmed: 1, total: 2 },
    accommodation: { confirmed: 0, total: 1 },
    activity: { confirmed: 2, total: 2 },
  },
  visibleDateRange: { startDayKey: '2026-05-01', endDayKey: '2026-05-04' },
  rollup: mockRollup,
  openRisks: 0,
  contactsCount: 3,
  eventId: 'event-1',
};

const mockUseDashboardSummary = vi.fn((): DashboardSummaryState => ({
  summary: mockSummary,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
}));

vi.mock('@/features/dashboard/hooks/useDashboardSummary', () => ({
  useDashboardSummary: () => mockUseDashboardSummary(),
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

import { DashboardPage } from '@/app/pages/DashboardPage';

describe('dashboard integration (TR02)', () => {
  beforeEach(() => {
    mockUseDashboardSummary.mockReturnValue({
      summary: mockSummary,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(cleanup);

  it('happy path: planner sees KPIs, launcher cards, and links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('heading', { name: 'Summit 2026' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plan the journey').length).toBeGreaterThan(0);
    expect(screen.getByText(/3 confirmed of 5/)).toBeInTheDocument();
    expect(screen.getByText(/2026-05-01 – 2026-05-04/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Event cost' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contacts' })).toBeInTheDocument();
    expect(screen.getByText('3', { selector: 'strong' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Open planning' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View itinerary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /logistics to confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open contacts' })).toHaveAttribute('href', '/contacts');
    expect(screen.getByRole('link', { name: 'Open assignments' })).toHaveAttribute(
      'href',
      '/assignments'
    );
    expect(screen.getByRole('link', { name: 'Open master plan' })).toHaveAttribute(
      'href',
      '/masterplan'
    );
  });

  it('validation / domain failure: invalid trac_status does not crash dashboard', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    summarizePlanningStatusCounts([{ status: 'not-a-trac-status' }]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('heading', { name: 'Summit 2026' }).length).toBeGreaterThan(0);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('partial failure: planning aggregate error does not blank sibling launcher cards (AC7)', () => {
    mockUseDashboardSummary.mockReturnValue({
      summary: {
        ...mockSummary,
        planning: {
          transport: { confirmed: 0, total: 0 },
          accommodation: { confirmed: 0, total: 0 },
          activity: { confirmed: 0, total: 0 },
        },
      },
      isLoading: false,
      isError: true,
      error: 'Planning load failed',
      refetch: vi.fn(),
    } satisfies DashboardSummaryState);

    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('heading', { name: 'Summit 2026' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Contacts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open contacts' })).toHaveAttribute('href', '/contacts');
    expect(screen.getByRole('link', { name: 'Open assignments' })).toHaveAttribute(
      'href',
      '/assignments'
    );
  });

  it('attention queue: shows empty state when nothing needs action', () => {
    mockUseDashboardSummary.mockReturnValue({
      summary: {
        ...mockSummary,
        planning: {
          transport: { confirmed: 2, total: 2 },
          accommodation: { confirmed: 1, total: 1 },
          activity: { confirmed: 2, total: 2 },
        },
        openRisks: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();
    expect(screen.getByText('Nothing needs attention')).toBeInTheDocument();
    expect(
      screen.getByText('You are all caught up — nothing to action right now.')
    ).toBeInTheDocument();
  });
});
