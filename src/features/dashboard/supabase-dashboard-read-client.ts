import type { RBACSupabaseClient, SecureSupabaseClient } from '@solvera/pace-core/rbac';
import type { LooseSingleResult, SupabaseError } from '@/lib/postgrest-result-types';

export type DashboardReadSupabaseClient = {
  from: (table: string) => DashboardReadQueryBuilder;
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: SupabaseError | null }>;
};

type DashboardReadAfterEq = {
  maybeSingle: () => LooseSingleResult;
};

type DashboardReadQueryBuilder = {
  select: (columns?: string) => {
    eq: (column: string, value: string) => DashboardReadAfterEq;
  };
};

export function asDashboardReadClient(
  client: RBACSupabaseClient | SecureSupabaseClient | null
): DashboardReadSupabaseClient | null {
  if (client == null) return null;
  return client as unknown as DashboardReadSupabaseClient;
}
