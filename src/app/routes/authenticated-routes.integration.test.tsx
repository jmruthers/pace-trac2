/**
 * AuthenticatedRoutes: shell routeAccessDenied blocks page mount (TR01).
 */
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Navigate, Outlet } from 'react-router-dom';
import { AppRoutes } from '@/app/routes/app-routes';

const mockUseUnifiedAuthContext = vi.fn();
const mockUseOptionalEvents = vi.fn();
let pageCanResult = { can: true, isLoading: false };

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
  };
});

vi.mock('@/app/pages/DashboardPage', () => ({
  DashboardPage: () => <h1>Dashboard</h1>,
}));

vi.mock('@solvera/pace-core/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/rbac')>();
  return {
    ...actual,
    usePageCan: () => pageCanResult,
    AccessDenied: () => <p>You do not have permission to access this page.</p>,
  };
});

vi.mock('@solvera/pace-core/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@solvera/pace-core/components')>();

  function TestProtectedRoute({
    loginPath = '/login',
    loadingFallback = null,
  }: {
    loginPath?: string;
    loadingFallback?: ReactNode;
  }) {
    const { isAuthenticated, sessionRestoration, authLoading } = mockUseUnifiedAuthContext();
    const isRestoring = sessionRestoration.isRestoring || authLoading;

    if (isRestoring) {
      return <>{loadingFallback}</>;
    }
    if (!isAuthenticated) {
      return <Navigate to={loginPath} replace />;
    }
    return <Outlet />;
  }

  function TestPaceAppLayout({
    children,
    routeAccessDenied,
    permissionFallback,
  }: {
    children?: ReactNode;
    routeAccessDenied?: boolean;
    permissionFallback?: ReactNode;
  }) {
    if (routeAccessDenied === true) {
      return <>{permissionFallback}</>;
    }
    return <main data-testid="trac-shell">{children}</main>;
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
    user: { email: 'user@example.com', user_metadata: { full_name: 'Test User' } },
    signOut: vi.fn(),
    updatePassword: vi.fn(),
    supabase: {},
  });
  mockUseOptionalEvents.mockReturnValue({
    events: [{ event_id: 'evt-1', organisation_id: 'org-1', event_name: 'Test Event' }],
    selectedEvent: { event_id: 'evt-1', organisation_id: 'org-1', event_name: 'Test Event' },
    setSelectedEvent: vi.fn(),
    isLoading: false,
  });
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('AuthenticatedRoutes shell denial', () => {
  beforeEach(() => {
    pageCanResult = { can: true, isLoading: false };
    authenticatedContext();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders AccessDenied when shell route permission is denied', async () => {
    pageCanResult = { can: false, isLoading: false };
    renderAt('/dashboard');
    expect(await screen.findByText(/do not have permission/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('renders dashboard content when shell route permission is allowed', async () => {
    renderAt('/dashboard');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByTestId('trac-shell')).toBeInTheDocument();
  });
});
