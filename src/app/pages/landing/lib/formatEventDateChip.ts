import type { EventTileDateChip } from '@solvera/pace-core/components';

/**
 * Maps an event ISO date to pace-core {@link EventTile} `dateChip` slots.
 */
export function formatEventDateChip(isoDate: string | null | undefined): EventTileDateChip | undefined {
  if (isoDate == null) return undefined;
  const trimmed = String(isoDate).trim();
  if (trimmed === '') return undefined;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return undefined;
  return {
    m: date.toLocaleString(undefined, { month: 'short' }),
    d: String(date.getDate()),
  };
}
