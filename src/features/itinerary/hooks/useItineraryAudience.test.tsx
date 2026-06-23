import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useItineraryAudience } from '@/features/itinerary/hooks/useItineraryAudience';

const mockUsePageCan = vi.fn();
const mockUseViewerApplication = vi.fn();
const mockUsePlanningScope = vi.fn();

vi.mock('@solvera/pace-core/rbac', () => ({
  usePageCan: (...args: unknown[]) => mockUsePageCan(...args),
}));

vi.mock('@/features/planning/hooks/usePlanningScope', () => ({
  usePlanningScope: () => mockUsePlanningScope(),
}));

vi.mock('@/features/itinerary/hooks/useViewerApplication', () => ({
  useViewerApplication: () => mockUseViewerApplication(),
}));

describe('useItineraryAudience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlanningScope.mockReturnValue({ organisationId: 'org-1' });
    mockUsePageCan.mockReturnValue({ can: false, isLoading: true });
    mockUseViewerApplication.mockReturnValue({
      application: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('does not block audience while planning permission loads without organisation scope', () => {
    mockUsePlanningScope.mockReturnValue({ organisationId: null });

    const { result } = renderHook(() => useItineraryAudience());

    expect(result.current.isAudiencePending).toBe(false);
    expect(result.current.isPlanningPermissionPending).toBe(false);
    expect(result.current.mode).toBe('day_visitor');
  });

  it('blocks audience for non-planners until planning permission and application resolve', () => {
    mockUsePageCan.mockReturnValue({ can: false, isLoading: true });
    mockUseViewerApplication.mockReturnValue({
      application: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useItineraryAudience());

    expect(result.current.isAudiencePending).toBe(true);
  });

  it('does not block audience for planners while viewer application still loads', () => {
    mockUsePageCan.mockReturnValue({ can: true, isLoading: false });
    mockUseViewerApplication.mockReturnValue({
      application: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useItineraryAudience());

    expect(result.current.isAudiencePending).toBe(false);
    expect(result.current.mode).toBe('planner');
  });
});
