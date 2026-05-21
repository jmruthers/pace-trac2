import { useContacts } from '@/features/contacts/hooks/use-contacts';

export function useDashboardContactsCount() {
  const { contacts, isLoading, error, refreshContacts } = useContacts();

  return {
    count: contacts.length,
    isLoading,
    isError: error != null,
    error: error != null ? new Error(error) : null,
    refetch: refreshContacts,
  };
}
