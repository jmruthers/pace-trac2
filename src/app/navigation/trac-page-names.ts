/** PascalCase RBAC catalogue keys for TRAC — must match `rbac_app_pages.page_name`. */
export const TRAC_PAGE_NAMES = {
  dashboard: 'DashboardPage',
  planning: 'PlanningPage',
  itinerary: 'ItineraryPage',
  contacts: 'ContactsPage',
  costs: 'CostsPage',
  journal: 'JournalPage',
  risks: 'RisksPage',
  currencyRates: 'CurrencyRatesPage',
  masterplan: 'MasterplanPage',
} as const;

export type TracPageName = (typeof TRAC_PAGE_NAMES)[keyof typeof TRAC_PAGE_NAMES];
