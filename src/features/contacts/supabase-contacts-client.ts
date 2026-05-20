import type { RBACSupabaseClient } from '@solvera/pace-core/rbac';
import type { Contact, ContactFormData } from '@/features/contacts/types';
import type { DeleteResult, ListResult, SingleResult } from '@/lib/postgrest-result-types';

type ContactsSelectBuilder = {
  select(columns: string): {
    eq(column: string, value: string): {
      order(column: string, options: { ascending: boolean }): ListResult<Contact>;
    };
  };
};

type ContactsInsertBuilder = {
  insert(rows: Array<ContactFormData & { event_id: string; organisation_id: string }>): {
    select(): { single(): SingleResult<Contact> };
  };
};

type ContactsUpdateBuilder = {
  update(payload: ContactFormData): {
    eq(column: string, value: string): {
      eq(column: string, value: string): {
        select(): { single(): SingleResult<Contact> };
      };
    };
  };
};

type ContactsDeleteBuilder = {
  delete(): {
    eq(column: string, value: string): {
      eq(column: string, value: string): DeleteResult;
    };
  };
};

type ContactsTableClient = ContactsSelectBuilder &
  ContactsInsertBuilder &
  ContactsUpdateBuilder &
  ContactsDeleteBuilder;

export function contactsTable(client: RBACSupabaseClient): ContactsTableClient {
  return client.from('trac_contacts') as ContactsTableClient;
}
