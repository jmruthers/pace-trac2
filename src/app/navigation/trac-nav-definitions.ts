import type { NavigationItem } from '@solvera/pace-core/components';

/** Primary nav order per trac-architecture IA v1 (routes register as slices ship). */
export const TRAC_PRIMARY_NAV_DEFINITIONS: readonly NavigationItem[] = [
  { id: 'planning', label: 'Planning', href: '/planning', pageId: 'planning' },
  { id: 'assignments', label: 'Assignments', href: '/assignments', pageId: 'planning' },
  { id: 'itinerary', label: 'Itinerary', href: '/itinerary', pageId: 'itinerary' },
  { id: 'contacts', label: 'Contacts', href: '/contacts', pageId: 'contacts' },
  { id: 'costs', label: 'Costs', href: '/costs', pageId: 'costs' },
  { id: 'journal', label: 'Journal', href: '/journal', pageId: 'journal' },
  { id: 'masterplan', label: 'Master Plan', href: '/masterplan', pageId: 'masterplan' },
  { id: 'risks', label: 'Risks', href: '/risks', pageId: 'risks' },
] as const;
