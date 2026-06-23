import type { NavigationItem } from '@solvera/pace-core/components';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';

/** Primary nav order per TR01 / prototype IA (max five items; deep-link routes excluded). */
export const TRAC_PRIMARY_NAV_DEFINITIONS: readonly NavigationItem[] = [
  { id: 'overview', label: 'Overview', href: '/dashboard', pageId: TRAC_PAGE_NAMES.dashboard },
  { id: 'planning', label: 'Planning', href: '/planning', pageId: TRAC_PAGE_NAMES.planning },
  { id: 'itinerary', label: 'Itinerary', href: '/itinerary', pageId: TRAC_PAGE_NAMES.itinerary },
  { id: 'costs', label: 'Costs', href: '/costs', pageId: TRAC_PAGE_NAMES.costs },
  { id: 'risks', label: 'Risks', href: '/risks', pageId: TRAC_PAGE_NAMES.risks },
] as const;
