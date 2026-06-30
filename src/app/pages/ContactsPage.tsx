import { AccessDenied, PagePermissionGuard } from '@solvera/pace-core/rbac';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { ContactsContent } from '@/features/contacts/ContactsContent';

/** SLICE-06 — event contacts CRUD at `/contacts`. */
export function ContactsPage() {
  return (
    <PagePermissionGuard
      pageName={TRAC_PAGE_NAMES.contacts}
      operation="read"
      fallback={<AccessDenied />}
    >
      <ContactsContent />
    </PagePermissionGuard>
  );
}
