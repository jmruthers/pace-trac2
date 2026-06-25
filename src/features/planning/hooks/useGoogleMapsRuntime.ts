import { useCallback, useEffect, useRef, useState } from 'react';
import { isErr } from '@solvera/pace-core/types';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import {
  ensureGoogleMapsRuntime,
  isGoogleMapsApiReady,
} from '@/features/planning/google-maps-bootstrap';
import { asPlanningClient } from '@/features/planning/supabase-helpers';

export function useGoogleMapsRuntime() {
  const secureSupabase = asPlanningClient(useSecureSupabase());
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [asyncLoaded, setAsyncLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const mountedRef = useRef(true);
  const isLoaded = isGoogleMapsApiReady() || asyncLoaded;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!secureSupabase) return;

    if (isGoogleMapsApiReady()) {
      return;
    }

    let cancelled = false;

    void ensureGoogleMapsRuntime(secureSupabase).then((result) => {
      if (cancelled || !mountedRef.current) return;
      if (isErr(result)) {
        setIsError(true);
        return;
      }
      setApiKey(result.data);
      setAsyncLoaded(true);
      setIsError(false);
    });

    return () => {
      cancelled = true;
    };
  }, [secureSupabase]);

  const getTimezone = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      if (!secureSupabase) return null;
      const { data, error } = await secureSupabase.functions.invoke('google-timezone', {
        body: { lat, lng, timestamp: Math.floor(Date.now() / 1000) },
      });
      if (error || data == null || typeof data !== 'object') return null;
      const timeZoneId = (data as { timeZoneId?: string }).timeZoneId;
      return typeof timeZoneId === 'string' ? timeZoneId : null;
    },
    [secureSupabase]
  );

  return { apiKey, isLoaded, isError, getTimezone };
}
