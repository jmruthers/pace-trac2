import { describe, expect, it, vi } from 'vitest';
import { summarizePlanningStatusCounts } from '@/features/dashboard/planning-status-summary';

describe('summarizePlanningStatusCounts', () => {
  it('counts confirmed vs total for valid trac_status values', () => {
    const result = summarizePlanningStatusCounts([
      { status: 'confirmed' },
      { status: 'planned' },
      { status: 'confirmed' },
      { status: null },
    ]);
    expect(result).toEqual({ confirmed: 2, total: 4 });
  });

  it('treats invalid enum as non-confirmed but includes in total', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = summarizePlanningStatusCounts([
      { status: 'confirmed' },
      { status: 'not-a-trac-status' },
    ]);

    expect(result).toEqual({ confirmed: 1, total: 2 });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('returns zeros for empty input', () => {
    expect(summarizePlanningStatusCounts([])).toEqual({ confirmed: 0, total: 0 });
  });
});
