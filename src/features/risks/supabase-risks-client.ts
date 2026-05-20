import type { RBACSupabaseClient } from '@solvera/pace-core/rbac';
import type { Risk, RiskFormData } from '@/features/risks/types';
import type { DeleteResult, ListResult, SingleResult } from '@/lib/postgrest-result-types';

type RiskInsertRow = Record<string, unknown> & {
  event_id: string;
  organisation_id: string;
};

type RisksSelectBuilder = {
  select(columns: string): {
    eq(column: string, value: string): {
      order(column: string, options: { ascending: boolean }): ListResult<Risk>;
    };
  };
};

type RisksInsertBuilder = {
  insert(rows: RiskInsertRow[]): {
    select(): { single(): SingleResult<Risk> };
  };
};

type RisksUpdateBuilder = {
  update(payload: Record<string, unknown>): {
    eq(column: string, value: string): {
      eq(column: string, value: string): {
        select(): { single(): SingleResult<Risk> };
      };
    };
  };
};

type RisksDeleteBuilder = {
  delete(): {
    eq(column: string, value: string): {
      eq(column: string, value: string): DeleteResult;
    };
  };
};

type RisksTableClient = RisksSelectBuilder &
  RisksInsertBuilder &
  RisksUpdateBuilder &
  RisksDeleteBuilder;

export function risksTable(client: RBACSupabaseClient): RisksTableClient {
  return client.from('trac_risks') as RisksTableClient;
}

export type { RiskFormData };
