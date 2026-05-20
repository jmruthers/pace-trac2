import type { RBACSupabaseClient, SecureSupabaseClient } from '@solvera/pace-core/rbac';
import type {
  PostgrestDeleteSingleScopedBuilder,
  PostgrestInsertSingleBuilder,
  PostgrestUpdateSingleScopedBuilder,
  PostgrestUpsertBuilder,
} from '@/lib/postgrest-fluent-builders';
import type { LooseListResult, LooseSingleResult } from '@/lib/postgrest-result-types';

/** Loosely typed supabase query builder for TRAC planning (secure client wraps Supabase). */
export type PlanningStorageClient = {
  from: (bucket: string) => {
    upload: (path: string, file: File) => Promise<{ error: { message: string } | null }>;
    remove: (paths: string[]) => Promise<{ error: { message: string } | null }>;
  };
};

export type PlanningFunctionsClient = {
  invoke: (
    name: string,
    options?: { body?: Record<string, unknown> }
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export type PlanningSupabaseClient = {
  from: (table: string) => PlanningQueryBuilder;
  storage: PlanningStorageClient;
  functions: PlanningFunctionsClient;
};

type PlanningReadBuilder = {
  select: (columns?: string) => PlanningReadBuilder;
  eq: (column: string, value: string) => PlanningReadBuilder;
  order: (column: string, options: { ascending: boolean }) => LooseListResult;
  maybeSingle: () => LooseSingleResult;
};

export type PlanningQueryBuilder = PlanningReadBuilder &
  PostgrestInsertSingleBuilder &
  PostgrestUpdateSingleScopedBuilder &
  PostgrestDeleteSingleScopedBuilder &
  PostgrestUpsertBuilder;

export function asPlanningClient(
  client: RBACSupabaseClient | SecureSupabaseClient | null
): PlanningSupabaseClient | null {
  if (client == null) return null;
  return client as unknown as PlanningSupabaseClient;
}
