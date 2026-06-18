import { describe, it, expect } from 'vitest';
import { TRAC_PRIMARY_NAV_DEFINITIONS } from '@/app/navigation/trac-nav-definitions';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import {
  TRAC_ROUTE_PERMISSIONS,
  TRAC_PAGE_ID_MAPPING,
  TRAC_SECONDARY_ROUTE_PAGE_IDS,
  getTracRoutePermissionForPath,
  tracNavPermissionForPage,
  withTracNavPermissions,
} from '@/app/navigation/trac-route-permissions';

const PASCAL_PAGE_RE = /^[A-Z][a-zA-Z0-9]*Page$/;

/** Canonical TRAC v1 page keys — must match rbac_app_pages for app TRAC on dev-db. */
export const TRAC_CANONICAL_PAGE_NAMES = [
  TRAC_PAGE_NAMES.contacts,
  TRAC_PAGE_NAMES.costs,
  TRAC_PAGE_NAMES.currencyRates,
  TRAC_PAGE_NAMES.dashboard,
  TRAC_PAGE_NAMES.itinerary,
  TRAC_PAGE_NAMES.journal,
  TRAC_PAGE_NAMES.masterplan,
  TRAC_PAGE_NAMES.planning,
  TRAC_PAGE_NAMES.risks,
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
      pageName: TRAC_PAGE_NAMES.planning,
      operation: 'read',
    });
    expect(tracNavPermissionForPage(TRAC_PAGE_NAMES.planning)).toBe(
      `read:page.${TRAC_PAGE_NAMES.planning}`,
    );
  });

  it('exposes pageId mapping for RBAC registration', () => {
    expect(TRAC_PAGE_ID_MAPPING.planning).toBe(TRAC_PAGE_NAMES.planning);
    expect(TRAC_PAGE_ID_MAPPING.assignments).toBe(TRAC_PAGE_NAMES.planning);
  });

  it('uses only PascalCase page keys across nav, secondary routes, and route permissions', () => {
    for (const pageName of collectAppPageNames()) {
      expect(pageName, `page key "${pageName}" must be PascalCase`).toMatch(PASCAL_PAGE_RE);
    }
  });

  it('registers all routable page keys as a subset of the canonical catalogue', () => {
    const uniquePageNames = [...new Set(collectAppPageNames())].sort();
    const routableCanonical = [...TRAC_CANONICAL_PAGE_NAMES].sort();
    expect(uniquePageNames).toEqual(routableCanonical);
  });

  it('defines nine canonical TRAC page keys matching rbac_app_pages', () => {
    expect(TRAC_CANONICAL_PAGE_NAMES).toHaveLength(9);
    for (const pageName of TRAC_CANONICAL_PAGE_NAMES) {
      expect(pageName).toMatch(PASCAL_PAGE_RE);
    }
  });

  it('resolves route path permissions for IA routes', () => {
    expect(getTracRoutePermissionForPath('/planning')).toEqual({
      pageName: TRAC_PAGE_NAMES.planning,
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/journal')).toEqual({
      pageName: TRAC_PAGE_NAMES.journal,
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/risks')).toEqual({
      pageName: TRAC_PAGE_NAMES.risks,
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/itinerary')).toEqual({
      pageName: TRAC_PAGE_NAMES.itinerary,
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/costs')).toEqual({
      pageName: TRAC_PAGE_NAMES.costs,
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/currency-rates')).toEqual({
      pageName: TRAC_PAGE_NAMES.currencyRates,
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/masterplan')).toEqual({
      pageName: TRAC_PAGE_NAMES.masterplan,
      operation: 'read',
    });
    expect(getTracRoutePermissionForPath('/')).toBeUndefined();
    expect(getTracRoutePermissionForPath('/dashboard')).toEqual({
      pageName: TRAC_PAGE_NAMES.dashboard,
      operation: 'read',
    });
  });

  it('attaches permissions to enabled nav items', () => {
    const items = withTracNavPermissions([
      { id: 'planning', label: 'Planning', href: '/planning', pageId: TRAC_PAGE_NAMES.planning },
    ]);
    expect(items[0]?.permissions).toEqual([`read:page.${TRAC_PAGE_NAMES.planning}`]);
  });
});
