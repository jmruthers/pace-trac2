import { useContacts } from '@/features/contacts/hooks/use-contacts';
import type { Contact } from '@/features/contacts/types';
import { MasterPlanSectionShell } from '@/features/master-plan/components/MasterPlanSectionShell';

export function MasterPlanContactsList() {
  const { contacts, isLoading, error } = useContacts();

  const errorMessage = error;

  return (
    <MasterPlanSectionShell
      title={`Contacts (${contacts.length})`}
      isLoading={isLoading}
      isError={error != null}
      error={errorMessage}
      className="break-after-page"
    >
      {contacts.length === 0 ? (
        <p>No contacts recorded for this event yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact: Contact) => (
              <tr key={contact.id}>
                <td>{[contact.first_name, contact.surname].filter(Boolean).join(' ')}</td>
                <td>{contact.role ?? '—'}</td>
                <td>{contact.phone_number ?? '—'}</td>
                <td>{contact.email_address ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MasterPlanSectionShell>
  );
}
