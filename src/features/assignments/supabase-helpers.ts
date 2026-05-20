import type { RBACSupabaseClient, SecureSupabaseClient } from '@solvera/pace-core/rbac';
import type {
  PostgrestDeleteDoubleScopedBuilder,
  PostgrestInsertSingleBuilder,
  PostgrestUpdateDoubleScopedBuilder,
} from '@/lib/postgrest-fluent-builders';
import type { LooseListResult } from '@/lib/postgrest-result-types';

export type AssignmentsSupabaseClient = {
  from: (table: string) => AssignmentsQueryBuilder;
};

type AssignmentsReadBuilder = {
  select: (columns?: string) => AssignmentsReadBuilder;
  eq: (column: string, value: string) => AssignmentsReadBuilder;
  order: (column: string, options: { ascending: boolean }) => LooseListResult;
};

export type AssignmentsQueryBuilder = AssignmentsReadBuilder &
  PostgrestInsertSingleBuilder &
  PostgrestUpdateDoubleScopedBuilder &
  PostgrestDeleteDoubleScopedBuilder;

export function asAssignmentsClient(
  client: RBACSupabaseClient | SecureSupabaseClient | null
): AssignmentsSupabaseClient | null {
  if (client == null) return null;
  return client as unknown as AssignmentsSupabaseClient;
}
