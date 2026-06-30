import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useViewerApplication } from '@/features/itinerary/hooks/useViewerApplication';

const mockUseSecureSupabase = vi.fn();
const mockUseUnifiedAuthContext = vi.fn();
const mockUseItineraryScope = vi.fn();

vi.mock('@solvera/pace-core', () => ({
  useUnifiedAuthContext: () => mockUseUnifiedAuthContext(),
}));

vi.mock('@solvera/pace-core/rbac', () => ({
  useSecureSupabase: () => mockUseSecureSupabase(),
}));

vi.mock('@/features/itinerary/hooks/useItineraryScope', () => ({
  useItineraryScope: () => mockUseItineraryScope(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useViewerApplication', () => {
  const rpcMock = vi.fn();
  const orderMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUnifiedAuthContext.mockReturnValue({ user: { id: 'user-1' } });
    mockUseItineraryScope.mockReturnValue({
      eventId: 'event-1',
      isReady: true,
    });
    rpcMock.mockResolvedValue({
      data: [{ id: 'app-dual', event_id: 'event-1', status: 'approved' }],
      error: null,
    });
    orderMock.mockResolvedValue({
      data: [{ id: 'app-participant', event_id: 'event-1', status: 'approved' }],
      error: null,
    });
    mockUseSecureSupabase.mockReturnValue({
      rpc: rpcMock,
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: orderMock,
          })),
        })),
      })),
    });
  });

  it('participant path uses RLS-scoped base_application select (no RPC)', async () => {
    const { result } = renderHook(() => useViewerApplication({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.application?.id).toBe('app-participant');
    });

    expect(orderMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('dual-role planner path uses session-bound base_application_for_viewer RPC', async () => {
    const { result } = renderHook(
      () => useViewerApplication({ enabled: true, nonBlocking: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.application?.id).toBe('app-dual');
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('base_application_for_viewer', {
      p_event_id: 'event-1',
    });
    expect(orderMock).not.toHaveBeenCalled();
  });

  it('does not run the query when enabled is false', async () => {
    renderHook(() => useViewerApplication({ enabled: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(rpcMock).not.toHaveBeenCalled();
      expect(orderMock).not.toHaveBeenCalled();
    });
  });

  it('does not surface loading when nonBlocking is true', () => {
    mockUseSecureSupabase.mockReturnValue(null);

    const { result } = renderHook(
      () => useViewerApplication({ enabled: true, nonBlocking: true }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
  });
});
