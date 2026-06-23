import { err, ok, type ApiResult } from '@solvera/pace-core/types';
import type { asPlanningClient } from '@/features/planning/supabase-helpers';

const MAPS_SCRIPT_ID = 'trac-google-maps-script';

type PlanningClient = NonNullable<ReturnType<typeof asPlanningClient>>;

type BootstrapSnapshot = {
  promise: Promise<ApiResult<string | null>> | null;
  apiKey: string | null;
};

const bootstrapSnapshot: BootstrapSnapshot = {
  promise: null,
  apiKey: null,
};

export function isGoogleMapsApiReady(): boolean {
  const candidate = (globalThis as { google?: { maps?: unknown } }).google;
  return candidate?.maps != null;
}

function parseApiKey(data: unknown): string | null {
  return typeof data === 'object' &&
    data != null &&
    'key' in data &&
    typeof (data as { key?: string }).key === 'string'
    ? (data as { key: string }).key
    : null;
}

function parseScriptUrl(data: unknown): string | null {
  if (typeof data === 'string') return data;
  return typeof data === 'object' &&
    data != null &&
    'url' in data &&
    typeof (data as { url?: string }).url === 'string'
    ? (data as { url: string }).url
    : null;
}

export function loadGoogleMapsScript(src: string): Promise<ApiResult<null>> {
  return new Promise((resolve) => {
    if (isGoogleMapsApiReady()) {
      resolve(ok(null));
      return;
    }

    const existing = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing != null) {
      if (existing.dataset.loaded === 'true' || isGoogleMapsApiReady()) {
        existing.dataset.loaded = 'true';
        resolve(ok(null));
        return;
      }
      existing.addEventListener(
        'load',
        () => {
          resolve(ok(null));
        },
        { once: true }
      );
      existing.addEventListener(
        'error',
        () => {
          resolve(
            err({
              code: 'GOOGLE_MAPS_SCRIPT_FAILED',
              message: 'Maps script failed',
            })
          );
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = MAPS_SCRIPT_ID;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve(ok(null));
    };
    script.onerror = () => {
      resolve(
        err({
          code: 'GOOGLE_MAPS_SCRIPT_FAILED',
          message: 'Maps script failed',
        })
      );
    };
    document.head.appendChild(script);
  });
}

/** Loads Google Maps JS once per session and reuses the result across providers. */
export async function ensureGoogleMapsRuntime(
  client: PlanningClient
): Promise<ApiResult<string | null>> {
  if (isGoogleMapsApiReady()) {
    return ok(bootstrapSnapshot.apiKey);
  }

  if (bootstrapSnapshot.promise != null) {
    return bootstrapSnapshot.promise;
  }

  bootstrapSnapshot.promise = (async (): Promise<ApiResult<string | null>> => {
    const [keyResult, scriptResult] = await Promise.all([
      client.functions.invoke('google-api-key'),
      client.functions.invoke('google-maps-script'),
    ]);

    const key = parseApiKey(keyResult.data);
    if (key == null) {
      bootstrapSnapshot.promise = null;
      return err({
        code: 'GOOGLE_MAPS_KEY_UNAVAILABLE',
        message: 'Google Maps API key unavailable',
      });
    }

    bootstrapSnapshot.apiKey = key;

    const scriptUrl = parseScriptUrl(scriptResult.data);
    const loadResult = await loadGoogleMapsScript(
      scriptUrl ??
        `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`
    );
    if (!loadResult.ok) {
      bootstrapSnapshot.promise = null;
      return loadResult;
    }

    return ok(key);
  })();

  return bootstrapSnapshot.promise;
}

/** Test helper — reset module cache between unit tests. */
export function resetGoogleMapsBootstrapForTests(): void {
  bootstrapSnapshot.promise = null;
  bootstrapSnapshot.apiKey = null;
}
