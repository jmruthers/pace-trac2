import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { setupUser } from '@test-utils';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { EventStub } from '@solvera/pace-core/types';
import { TracEventsLandingPage } from '@/app/pages/landing/TracEventsLandingPage';

const mockNavigate = vi.fn();
const mockSetSelectedEvent = vi.fn();

function createMockSecureSupabase(openRiskEventIds: string[]) {
  return {
    from: (table: string) => {
      if (table === 'trac_risks') {
        return {
          select: () => ({
            neq: () =>
              Promise.resolve({
                data: openRiskEventIds.map((eventId) => ({ event_id: eventId })),
                error: null,
              }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    },
  };
}

function createEvent(index: number, date: string): EventStub {
  return {
    id: `evt-${index}`,
    organisation_id: 'org-1',
    event_name: `Event ${index}`,
    event_date: date,
    event_days: 3,
    event_venue: `Venue ${index}`,
    event_code: `e${index}`,
    expected_participants: 20 + index,
  };
}

const fiveEvents = [
  createEvent(1, '2026-08-01'),
  createEvent(2, '2026-09-01'),
  createEvent(3, '2026-10-01'),
  createEvent(4, '2026-11-01'),
  createEvent(5, '2026-12-01'),
];

const mockUseOptionalEvents = vi.fn();
let mockSecureSupabase = createMockSecureSupabase([]);

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@solvera/pace-core/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/rbac')>();
  return {
    ...actual,
    PagePermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AccessDenied: () => <p>Access denied</p>,
    useSecureSupabase: () => mockSecureSupabase,
  };
});

vi.mock('@solvera/pace-core/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/hooks')>();
  return {
    ...actual,
    useOptionalEvents: () => mockUseOptionalEvents(),
  };
});

function renderLandingPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <TracEventsLandingPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TracEventsLandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSecureSupabase = createMockSecureSupabase([]);
    mockUseOptionalEvents.mockReturnValue({
      events: fiveEvents,
      isLoading: false,
      setSelectedEvent: mockSetSelectedEvent,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders event picker header and default tile grid', async () => {
    renderLandingPage();

    expect(await screen.findByRole('heading', { name: 'Choose an event' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Event 1', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Event 4', level: 3 })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Event 5', level: 3 })).not.toBeInTheDocument();
  });

  it('expands to show all events and selects event for dashboard', async () => {
    const user = setupUser();
    renderLandingPage();

    await screen.findByRole('heading', { name: 'Choose an event' });
    await user.click(screen.getByRole('button', { name: /show all \(5\)/i }));
    expect(screen.getByRole('heading', { name: 'Event 5', level: 3 })).toBeInTheDocument();

    const tileHeading = screen.getAllByRole('heading', { name: 'Event 1', level: 3 })[0];
    const tile = tileHeading.closest('button');
    expect(tile).not.toBeNull();
    await user.click(tile!);
    expect(mockSetSelectedEvent).toHaveBeenCalledWith(fiveEvents[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows cross-event attention items for open risks', async () => {
    mockSecureSupabase = createMockSecureSupabase(['evt-5']);
    renderLandingPage();

    expect(await screen.findByText(/1 open risk to treat/i)).toBeInTheDocument();
    expect(screen.getByText('Event 5')).toBeInTheDocument();
  });

  it('shows empty state when no events are available', async () => {
    mockUseOptionalEvents.mockReturnValue({
      events: [],
      isLoading: false,
      setSelectedEvent: mockSetSelectedEvent,
    });

    renderLandingPage();

    expect(await screen.findByText('No events yet')).toBeInTheDocument();
  });
});
