import { describe, it, expect } from 'vitest';
import { formatEventDateRange } from '@/features/master-plan/format-event-date-range';

describe('formatEventDateRange', () => {
  it('formats a single-day event', () => {
    const label = formatEventDateRange('2026-06-01T00:00:00.000Z', '2026-06-01T12:00:00.000Z');
    expect(label).not.toBe('—');
    expect(label).not.toContain('–');
  });

  it('formats a multi-day range in the same month', () => {
    const label = formatEventDateRange('2026-06-01T00:00:00.000Z', '2026-06-10T00:00:00.000Z');
    expect(label).toContain('–');
  });

  it('returns em dash when start is missing', () => {
    expect(formatEventDateRange(null, null)).toBe('—');
  });
});
