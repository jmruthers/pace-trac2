import { describe, it, expect } from 'vitest';
import {
  getEnabledTracNavItems,
  SLICE_01_REGISTERED_ROUTE_PATHS,
  TRAC_PRIMARY_NAV_DEFINITIONS,
} from '@/app/navigation/trac-nav';

describe('trac-nav', () => {
  it('defines primary nav in IA order', () => {
    const labels = TRAC_PRIMARY_NAV_DEFINITIONS.map((item) => item.label);
    expect(labels).toEqual([
      'Planning',
      'Assignments',
      'Itinerary',
      'Contacts',
      'Costs',
      'Journal',
      'Master Plan',
      'Risks',
    ]);
  });

  it('SLICE-01 exposes no nav links until domain routes register', () => {
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/planning')).toBe(false);
    expect(getEnabledTracNavItems()).toEqual([]);
  });
});
