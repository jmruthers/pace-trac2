import type { NavigationItem } from '@solvera/pace-core/components';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';

/** Primary nav order per trac-architecture IA v1 (routes register as slices ship). */
export const TRAC_PRIMARY_NAV_DEFINITIONS: readonly NavigationItem[] = [
  { id: 'planning', label: 'Planning', href: '/planning', pageId: TRAC_PAGE_NAMES.planning },
  { id: 'assignments', label: 'Assignments', href: '/assignments', pageId: TRAC_PAGE_NAMES.planning },
  { id: 'itinerary', label: 'Itinerary', href: '/itinerary', pageId: TRAC_PAGE_NAMES.itinerary },
  { id: 'contacts', label: 'Contacts', href: '/contacts', pageId: TRAC_PAGE_NAMES.contacts },
  { id: 'costs', label: 'Costs', href: '/costs', pageId: TRAC_PAGE_NAMES.costs },
  { id: 'journal', label: 'Journal', href: '/journal', pageId: TRAC_PAGE_NAMES.journal },
  { id: 'masterplan', label: 'Master Plan', href: '/masterplan', pageId: TRAC_PAGE_NAMES.masterplan },
  { id: 'risks', label: 'Risks', href: '/risks', pageId: TRAC_PAGE_NAMES.risks },
] as const;
