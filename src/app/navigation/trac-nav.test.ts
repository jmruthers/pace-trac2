import { describe, it, expect } from 'vitest';
import {
  getEnabledTracNavItems,
  getTracLandingNavItems,
  getTracNavigationItemsForShell,
  SLICE_01_REGISTERED_ROUTE_PATHS,
  TRAC_PRIMARY_NAV_DEFINITIONS,
} from '@/app/navigation/trac-nav';

describe('trac-nav', () => {
  it('defines primary nav in IA order (max five items)', () => {
    const labels = TRAC_PRIMARY_NAV_DEFINITIONS.map((item) => item.label);
    expect(labels).toEqual(['Overview', 'Planning', 'Itinerary', 'Costs', 'Risks']);
    expect(TRAC_PRIMARY_NAV_DEFINITIONS.length).toBeLessThanOrEqual(5);
  });

  it('enables nav links only for registered route paths', () => {
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/planning')).toBe(true);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/assignments')).toBe(true);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/contacts')).toBe(true);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/journal')).toBe(true);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/itinerary')).toBe(true);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/risks')).toBe(true);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/costs')).toBe(true);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/currency-rates')).toBe(false);
    expect(SLICE_01_REGISTERED_ROUTE_PATHS.has('/masterplan')).toBe(true);
    const labels = getEnabledTracNavItems().map((item) => item.label);
    expect(labels).toEqual(['Overview', 'Planning', 'Itinerary', 'Costs', 'Risks']);
    expect(labels).not.toContain('Master plan');
  });

  it('shows landing nav when no event is selected', () => {
    const labels = getTracNavigationItemsForShell(false).map((item) => item.label);
    expect(labels).toEqual(['Events']);
  });

  it('shows lifecycle nav when an event is selected', () => {
    const labels = getTracNavigationItemsForShell(true).map((item) => item.label);
    expect(labels).toEqual(['Overview', 'Planning', 'Itinerary', 'Costs', 'Risks']);
  });

  it('landing nav item points to authenticated home', () => {
    expect(getTracLandingNavItems()[0]?.href).toBe('/');
  });
});
