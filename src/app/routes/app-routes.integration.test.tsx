/**
 * App route wiring: unknown path renders NotFound inside authenticated shell (TR01 AC4).
 */
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Navigate, Outlet } from 'react-router-dom';
import { AppRoutes } from '@/app/routes/app-routes';

const mockUseUnifiedAuthContext = vi.fn();
const mockUseOptionalEvents = vi.fn();

vi.mock('@solvera/pace-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core')>();
  return {
    ...actual,
    useUnifiedAuthContext: () => mockUseUnifiedAuthContext(),
  };
});

vi.mock('@solvera/pace-core/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/hooks')>();
  return {
    ...actual,
    useContextTheme: () => undefined,
    useOptionalEvents: () => mockUseOptionalEvents(),
    useUnifiedAuth: () => ({
      organisations: [],
      selectedOrganisation: null,
      switchOrganisation: vi.fn(),
      events: [{ id: 'ev-1' }],
      selectedEvent: { id: 'ev-1' },
      setSelectedEvent: vi.fn(),
      refreshOrganisations: vi.fn(),
      refreshEvents: vi.fn(),
      organisationLoading: false,
      eventLoading: false,
      error: null,
      eventError: null,
      resilienceStatus: 'success' as const,
      resilienceErrors: [],
    }),
  };
});

vi.mock('@solvera/pace-core/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/rbac')>();
  return {
    ...actual,
    usePageCan: () => ({ can: true, isLoading: false }),
  };
});

vi.mock('@solvera/pace-core/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/components')>();

  function TestProtectedRoute({
    loginPath = '/login',
    requireEvent = false,
    noEventsFallback,
    loadingFallback = null,
  }: {
    loginPath?: string;
    requireEvent?: boolean;
    noEventsFallback?: ReactNode;
    loadingFallback?: ReactNode;
  }) {
    const { isAuthenticated, sessionRestoration, authLoading } = mockUseUnifiedAuthContext();
    const { events, selectedEvent, isLoading: eventLoading } = mockUseOptionalEvents();
    const isRestoring = sessionRestoration.isRestoring || authLoading;
    const waitingForEvent = requireEvent && eventLoading;

    if (isRestoring || waitingForEvent) {
      return <>{loadingFallback}</>;
    }
    if (!isAuthenticated) {
      return <Navigate to={loginPath} replace />;
    }
    if (requireEvent && (events.length === 0 || !selectedEvent)) {
      return <>{noEventsFallback ?? <p>Access denied</p>}</>;
    }
    return <Outlet />;
  }

  function TestPaceAppLayout({ children }: { children: ReactNode }) {
    return <main>{children}</main>;
  }

  return {
    ...actual,
    ProtectedRoute: TestProtectedRoute,
    PaceAppLayout: TestPaceAppLayout,
  };
});

function authenticatedContext() {
  mockUseUnifiedAuthContext.mockReturnValue({
    isAuthenticated: true,
    sessionRestoration: { isRestoring: false },
    authLoading: false,
    user: { email: 'planner@example.com', user_metadata: { full_name: 'Planner' } },
    signOut: vi.fn(),
    updatePassword: vi.fn().mockResolvedValue({}),
  });
  mockUseOptionalEvents.mockReturnValue({
    events: [{ id: 'ev-1' }],
    selectedEvent: { id: 'ev-1' },
    isLoading: false,
  });
}

describe('app-routes integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authenticatedContext();
  });

  afterEach(cleanup);

  it('renders NotFound for unknown authenticated paths', () => {
    render(
      <MemoryRouter initialEntries={['/not-a-real-page']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText('Back to events')).toBeInTheDocument();
  });
});
