import { describe, expect, it } from 'vitest';
import { formatDateTime } from '@solvera/pace-core/utils';
import {
  formatDayHeading,
  formatWhen,
  UNDATED_DAY_KEY,
} from '@/features/planning/planning-format';

describe('planning-format', () => {
  it('formatWhen delegates to pace-core formatDateTime', () => {
    const iso = '2026-05-21T14:30:00.000Z';
    expect(formatWhen(iso)).toBe(formatDateTime(iso));
  });

  it('formatDayHeading returns Undated for undated key', () => {
    expect(formatDayHeading(UNDATED_DAY_KEY)).toBe('Undated');
  });

  it('formatDayHeading includes weekday in en-GB long form', () => {
    const heading = formatDayHeading('2026-05-21');
    expect(heading).toMatch(/Thursday/);
    expect(heading).toMatch(/May/);
    expect(heading).toMatch(/2026/);
  });
});
