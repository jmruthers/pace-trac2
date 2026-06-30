import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useItineraryAudience } from '@/features/itinerary/hooks/useItineraryAudience';

const mockUseViewerApplication = vi.fn();

vi.mock('@/features/itinerary/hooks/useViewerApplication', () => ({
  useViewerApplication: () => mockUseViewerApplication(),
}));

function defaultViewerApplicationReturn() {
  return {
    application: null,
    isLoading: false,
    isError: false,
    error: null,
  };
}

describe('useItineraryAudience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseViewerApplication.mockReturnValue(defaultViewerApplicationReturn());
  });

  it('returns day_visitor when viewer has no application', () => {
    const { result } = renderHook(() => useItineraryAudience());

    expect(result.current.mode).toBe('day_visitor');
    expect(result.current.participantApplicationId).toBeNull();
    expect(result.current.isAudiencePending).toBe(false);
  });

  it('returns participant when viewer application exists', () => {
    mockUseViewerApplication.mockReturnValue({
      application: { id: 'app-1', event_id: 'event-1', status: 'approved' },
      isLoading: false,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useItineraryAudience());

    expect(result.current.mode).toBe('participant');
    expect(result.current.participantApplicationId).toBe('app-1');
  });

  it('blocks audience while viewer application loads', () => {
    mockUseViewerApplication.mockReturnValue({
      application: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const { result } = renderHook(() => useItineraryAudience());

    expect(result.current.isAudiencePending).toBe(true);
  });
});
