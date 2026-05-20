/**
 * Protected routing: unauthenticated redirect, requireEvent fallback (TR01).
 */
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { TracNoEventFallback } from '@/app/shell/TracNoEventFallback';

const mockUseUnifiedAuthContext = vi.fn();
const mockUseOptionalEvents = vi.fn();

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

  return {
    ...actual,
    ProtectedRoute: TestProtectedRoute,
  };
});

import { ProtectedRoute } from '@solvera/pace-core/components';

function authState(authenticated: boolean) {
  return {
    isAuthenticated: authenticated,
    sessionRestoration: { isRestoring: false },
    authLoading: false,
  };
}

describe('protected-route integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOptionalEvents.mockReturnValue({
      events: [],
      selectedEvent: null,
      isLoading: false,
    });
  });

  afterEach(cleanup);

  it('auth failure: unauthenticated user is redirected to login', () => {
    mockUseUnifiedAuthContext.mockReturnValue(authState(false));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<p>TRAC login</p>} />
          <Route element={<ProtectedRoute loginPath="/login" />}>
            <Route path="/" element={<p>Shell content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('TRAC login')).toBeInTheDocument();
    expect(screen.queryByText('Shell content')).not.toBeInTheDocument();
  });

  it('authenticated without event shows shared TRAC no-event fallback', () => {
    mockUseUnifiedAuthContext.mockReturnValue(authState(true));

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            element={
              <ProtectedRoute
                loginPath="/login"
                requireEvent
                noEventsFallback={<TracNoEventFallback />}
              />
            }
          >
            <Route index element={<p>Home content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Select an event')).toBeInTheDocument();
    expect(screen.getByText(/event required/i)).toBeInTheDocument();
    expect(screen.queryByText('Home content')).not.toBeInTheDocument();
  });

  it('authenticated with selected event renders protected outlet', () => {
    mockUseUnifiedAuthContext.mockReturnValue(authState(true));
    mockUseOptionalEvents.mockReturnValue({
      events: [{ id: 'ev-1' }],
      selectedEvent: { id: 'ev-1' },
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute loginPath="/login" requireEvent />}>
            <Route index element={<p>Home content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home content')).toBeInTheDocument();
  });
});
