import type { NavigationItem } from '@solvera/pace-core/components';
import { TRAC_PRIMARY_NAV_DEFINITIONS } from '@/app/navigation/trac-nav-definitions';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { withTracNavPermissions } from '@/app/navigation/trac-route-permissions';

export { TRAC_PRIMARY_NAV_DEFINITIONS } from '@/app/navigation/trac-nav-definitions';

/** Landing-only primary nav (prototype: single Events item). */
export const TRAC_LANDING_NAV_ITEM: NavigationItem = {
  id: 'events',
  label: 'Events',
  href: '/',
  pageId: TRAC_PAGE_NAMES.dashboard,
};

/** Route paths registered in the current app build (expand as feature slices land). */
export const TRAC_REGISTERED_ROUTE_PATHS = new Set<string>([
  '/',
  '/dashboard',
  '/planning',
  '/assignments',
  '/itinerary',
  '/contacts',
  '/costs',
  '/journal',
  '/masterplan',
  '/risks',
]);

/** @deprecated Use {@link TRAC_REGISTERED_ROUTE_PATHS}. Kept for SLICE-01 test references. */
export const SLICE_01_REGISTERED_ROUTE_PATHS = TRAC_REGISTERED_ROUTE_PATHS;

export function getTracLandingNavItems(): NavigationItem[] {
  return withTracNavPermissions([TRAC_LANDING_NAV_ITEM]);
}

/**
 * Nav items whose href is registered in the current app build.
 */
export function getEnabledTracNavItems(
  registeredPaths: ReadonlySet<string> = TRAC_REGISTERED_ROUTE_PATHS
): NavigationItem[] {
  const enabled = TRAC_PRIMARY_NAV_DEFINITIONS.filter(
    (item) => item.href != null && registeredPaths.has(item.href)
  );
  return withTracNavPermissions(enabled);
}

/** Shell nav: landing strip when no event selected; full IA when event is active. */
export function getTracNavigationItemsForShell(hasSelectedEvent: boolean): NavigationItem[] {
  if (!hasSelectedEvent) {
    return getTracLandingNavItems();
  }
  return getEnabledTracNavItems();
}
