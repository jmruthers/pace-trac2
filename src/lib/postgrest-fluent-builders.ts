import type { DeleteResult, LooseSingleResult, SupabaseError } from '@/lib/postgrest-result-types';

/** Insert → select → single. */
export type PostgrestInsertSingleBuilder = {
  insert: (
    row: Record<string, unknown> | Record<string, unknown>[]
  ) => {
    select: (columns?: string) => {
      single: () => LooseSingleResult;
    };
  };
};

/** Update → eq → select → single (one scope column). */
export type PostgrestUpdateSingleScopedBuilder = {
  update: (row: Record<string, unknown>) => {
    eq: (column: string, value: string) => {
      select: (columns?: string) => {
        single: () => LooseSingleResult;
      };
    };
  };
};

/** Update → eq → eq → select → single (event-scoped mutations). */
export type PostgrestUpdateDoubleScopedBuilder = {
  update: (row: Record<string, unknown>) => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => {
        select: (columns?: string) => {
          single: () => LooseSingleResult;
        };
      };
    };
  };
};

/** Delete → eq (single scope). */
export type PostgrestDeleteSingleScopedBuilder = {
  delete: () => {
    eq: (column: string, value: string) => DeleteResult;
  };
};

/** Delete → eq → eq (event-scoped). */
export type PostgrestDeleteDoubleScopedBuilder = {
  delete: () => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => DeleteResult;
    };
  };
};

/** Upsert with onConflict. */
export type PostgrestUpsertBuilder = {
  upsert: (
    row: Record<string, unknown>,
    options: { onConflict: string }
  ) => Promise<{ error: SupabaseError | null }>;
};
