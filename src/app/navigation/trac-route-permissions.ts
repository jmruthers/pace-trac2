import type { NavigationItem } from '@solvera/pace-core/components';
import { TRAC_PRIMARY_NAV_DEFINITIONS } from '@/app/navigation/trac-nav-definitions';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';

export type TracRoutePermissionOperation = 'read';

export interface TracRoutePermissionConfig {
  pageName: string;
  operation: TracRoutePermissionOperation;
}

/** RBAC permission string for a TRAC page id (e.g. `read:page.PlanningPage`). */
export function tracNavPermissionForPage(pageId: string): string {
  return `read:page.${pageId}`;
}

/** Nav `id` → page permission config (from `pageId`). */
export const TRAC_ROUTE_PERMISSIONS: Record<string, TracRoutePermissionConfig> = Object.fromEntries(
  TRAC_PRIMARY_NAV_DEFINITIONS.map((item) => [
    item.id,
    {
      pageName: item.pageId ?? item.id,
      operation: 'read' as const,
    },
  ])
);

/** Secondary / deep-link routes (not in primary nav) → RBAC page id. */
export const TRAC_SECONDARY_ROUTE_PAGE_IDS: Record<string, string> = {
  '/assignments': TRAC_PAGE_NAMES.planning,
  '/contacts': TRAC_PAGE_NAMES.contacts,
  '/costs': TRAC_PAGE_NAMES.costs,
  '/journal': TRAC_PAGE_NAMES.journal,
  '/masterplan': TRAC_PAGE_NAMES.masterplan,
  '/currency-rates': TRAC_PAGE_NAMES.currencyRates,
};

/** Route path → read operation for shell route checks (excludes `/` and `/dashboard`). */
export const TRAC_ROUTE_PATH_PERMISSIONS: Record<string, TracRoutePermissionOperation> = {
  ...Object.fromEntries(
    TRAC_PRIMARY_NAV_DEFINITIONS.filter((item) => item.href != null).map((item) => [item.href!, 'read'])
  ),
  ...Object.fromEntries(
    Object.keys(TRAC_SECONDARY_ROUTE_PAGE_IDS).map((path) => [path, 'read' as const])
  ),
};

/** Nav `id` → RBAC `pageId` for registration alignment. */
export const TRAC_PAGE_ID_MAPPING: Record<string, string> = {
  ...Object.fromEntries(
    TRAC_PRIMARY_NAV_DEFINITIONS.filter((item) => item.pageId != null).map((item) => [item.id, item.pageId!])
  ),
  assignments: TRAC_PAGE_NAMES.planning,
};

/** Permission config for the current pathname, if the route is in the IA map. */
export function getTracRoutePermissionForPath(pathname: string): TracRoutePermissionConfig | undefined {
  const operation = TRAC_ROUTE_PATH_PERMISSIONS[pathname];
  if (operation == null) return undefined;

  const secondaryPageId = TRAC_SECONDARY_ROUTE_PAGE_IDS[pathname];
  if (secondaryPageId != null) {
    return { pageName: secondaryPageId, operation };
  }

  const navItem = TRAC_PRIMARY_NAV_DEFINITIONS.find((item) => item.href === pathname);
  if (navItem?.pageId == null) return undefined;
  return { pageName: navItem.pageId, operation };
}

/** Attach `permissions` to nav items for layout/menu enforcement when links are enabled. */
export function withTracNavPermissions(items: readonly NavigationItem[]): NavigationItem[] {
  return items.map((item) => {
    if (item.pageId == null) return { ...item };
    return {
      ...item,
      permissions: [tracNavPermissionForPage(item.pageId)],
    };
  });
}
