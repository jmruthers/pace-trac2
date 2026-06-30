import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { CurrencyRatesContent } from '@/features/costs/CurrencyRatesContent';

/** SLICE-07 — currency rate management at `/currency-rates`. */
export function CurrencyRatesPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.currencyRates}
      operation="read"
      fallback={<AccessDenied />}
    >
      <CurrencyRatesContent />
    </PagePermissionGuard>
  );
}
