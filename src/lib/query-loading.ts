import type { UseQueryResult } from '@tanstack/react-query';

const DEFAULT_FETCH_TIMEOUT_MS = 25_000;

/** True while an enabled query has not completed its first fetch (success or error). */
export function isAwaitingQueryResult(
  query: Pick<UseQueryResult<unknown>, 'isFetched' | 'isError'>,
  enabled: boolean
): boolean {
  if (!enabled) return false;
  if (query.isError) return false;
  return !query.isFetched;
}

export async function withFetchTimeout<T>(
  promise: PromiseLike<T>,
  label: string,
  ms = DEFAULT_FETCH_TIMEOUT_MS
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
