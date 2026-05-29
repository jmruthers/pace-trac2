import { describe, it, expect } from 'vitest';
import { TRAC_PRIMARY_NAV_DEFINITIONS } from '@/app/navigation/trac-nav-definitions';
import {
  TRAC_ROUTE_PERMISSIONS,
  TRAC_PAGE_ID_MAPPING,
  TRAC_SECONDARY_ROUTE_PAGE_IDS,
  getTracRoutePermissionForPath,
  tracNavPermissionForPage,
  withTracNavPermissions,
} from '@/app/navigation/trac-route-permissions';

const KEBAB_PAGE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Canonical TRAC v1 page keys — must match rbac_app_pages for app TRAC on dev-db. */
export const TRAC_CANONICAL_PAGE_NAMES = [
  'contacts',
  'costs',
  'currency-rates',
  'dashboard',
  'itinerary',
  'journal',
  'masterplan',
  'planning',
  'risks',
] as const;

function collectAppPageNames(): string[] {
  const fromNav = TRAC_PRIMARY_NAV_DEFINITIONS.map((item) => item.pageId).filter(
    (pageId): pageId is string => pageId != null
  );
  const fromSecondary = Object.values(TRAC_SECONDARY_ROUTE_PAGE_IDS);
  const fromRoutePermissions = Object.values(TRAC_ROUTE_PERMISSIONS).map((config) => config.pageName);
  return [...fromNav, ...fromSecondary, ...fromRoutePermissions];
}

describe('trac-route-permissions', () => {
  it('maps nav ids to read page permissions', () => {
    expect(TRAC_ROUTE_PERMISSIONS.planning).toEqual({
      pageName: 'planning',
      operation: 'read',
    });
    expect(tracNavPermissionForPage('planning')).toBe('read:page.planning');
  });

  it('exposes pageId mapping for RBAC registration', () => {
    expect(TRAC_PAGE_ID_MAPPING.planning).toBe('planning');
    expect(TRAC_PAGE_ID_MAPPING.assignments).toBe('planning');
  });

  it('uses only kebab-case page keys across nav, secondary routes, and route permissions', () => {
    for (const pageName of collectAppPageNames()) {
      expect(pageName, `page key "${pageName}" must be kebab-case`).toMatch(KEBAB_PAGE_RE);
    }
  });

  it('registers all routable page keys as a subset of the canonical catalogue', () => {
    const uniquePageNames = [...new Set(collectAppPageNames())].sort();
    const routableCanonical = TRAC_CANONICAL_PAGE_NAMES.filter((pageName) => pageName !== 'dashboard').sort();
    expect(uniquePageNames).toEqual(routableCanonical);
  });

  it('defines nine canonical TRAC page keys matching rbac_app_pages', () => {
    expect(TRAC_CANONICAL_PAGE_NAMES).toHaveLength(9);
    for (const pageName of TRAC_CANONICAL_PAGE_NAMES) {
      expect(pageName).toMatch(KEBAB_PAGE_RE);
    }
  });

  it('resolves route path permissions for IA routes', () => {
    expect(getTracRoutePermissionForPath('/planning')).toEqual({
      pageName: 'planning',
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/journal')).toEqual({
      pageName: 'journal',
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/risks')).toEqual({
      pageName: 'risks',
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/itinerary')).toEqual({
      pageName: 'itinerary',
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/costs')).toEqual({
      pageName: 'costs',
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/currency-rates')).toEqual({
      pageName: 'currency-rates',
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/masterplan')).toEqual({
      pageName: 'masterplan',
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/')).toBeUndefined();
    expect(getTracRoutePermissionForPath('/dashboard')).toBeUndefined();
  });

  it('attaches permissions to enabled nav items', () => {
    const items = withTracNavPermissions([
      { id: 'planning', label: 'Planning', href: '/planning', pageId: 'planning' },
    ]);
    expect(items[0]?.permissions).toEqual(['read:page.planning']);
  });
});
