import { useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@solvera/pace-core/components';
import { TRAC_PAGE_NAMES } from '@/app/navigation/trac-page-names';
import { MASTER_PLAN_CONTACTS_TABLE_FEATURES } from '@/features/contacts/contacts-table-config';
import type { Contact } from '@/features/contacts/types';
import { MasterPlanSectionShell } from '@/features/master-plan/components/MasterPlanSectionShell';

interface MasterPlanContactsListProps {
  contacts: Contact[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
}

export function MasterPlanContactsList({
  contacts,
  isLoading,
  isError,
  errorMessage,
}: MasterPlanContactsListProps) {
  const columns: DataTableColumn<Contact>[] = useMemo(
    () => [
      {
        accessorKey: 'first_name',
        header: 'First Name',
        sortable: false,
      },
      {
        accessorKey: 'surname',
        header: 'Surname',
        sortable: false,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        sortable: false,
      },
      {
        accessorKey: 'phone_number',
        header: 'Phone',
        sortable: false,
      },
      {
        accessorKey: 'email_address',
        header: 'Email',
        sortable: false,
      },
    ],
    []
  );

  return (
    <MasterPlanSectionShell
      title="Contact list"
      countLabel={`${contacts.length} contacts`}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    >
      {contacts.length === 0 ? (
        <p>No contacts recorded for this event.</p>
      ) : (
        <DataTable
          columns={columns}
          data={contacts}
          rbac={{ pageName: TRAC_PAGE_NAMES.masterplan }}
          features={MASTER_PLAN_CONTACTS_TABLE_FEATURES}
          getRowId={(row) => String(row.id)}
        />
      )}
    </MasterPlanSectionShell>
  );
}
