/** PostgREST result shapes shared by TRAC table clients. */

export type SupabaseError = { message: string; code?: string };

export type SingleResult<T> = Promise<{ data: T | null; error: SupabaseError | null }>;

export type ListResult<T> = Promise<{ data: T[] | null; error: SupabaseError | null }>;

export type DeleteResult = Promise<{ error: SupabaseError | null }>;

export type LooseSingleResult = SingleResult<Record<string, unknown>>;

export type LooseListResult = ListResult<Record<string, unknown>>;
