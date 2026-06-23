import { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Input, Label } from '@solvera/pace-core/components';
import {
  createGoogleMapsJsAddressProviderAdapter,
  parseGooglePlaceDetailsToAddressValue,
} from '@solvera/pace-core/forms';
import { useAddressFieldSessionToken } from '@solvera/pace-core/hooks';
import { useSecureSupabase } from '@solvera/pace-core/rbac';
import { isOk } from '@solvera/pace-core/types';
import { readLocationCache } from '@/features/planning/location-cache';
import { useGoogleMapsPlanning } from '@/features/planning/context/GoogleMapsPlanningContext';
import { readGeometryFromGoogle } from '@/features/planning/google-place-geometry';
import { asPlanningClient } from '@/features/planning/supabase-helpers';
import type { PlanningPlaceValue } from '@/features/planning/types';

interface PlanningPlaceFieldProps {
  label: string;
  value: PlanningPlaceValue | null;
  onChange: (value: PlanningPlaceValue | null) => void;
  required?: boolean;
}

export function PlanningPlaceField({
  label,
  value,
  onChange,
  required = false,
}: PlanningPlaceFieldProps) {
  const { isLoaded, isError, getTimezone } = useGoogleMapsPlanning();
  const secureSupabase = asPlanningClient(useSecureSupabase());
  const { getSessionToken } = useAddressFieldSessionToken();
  const [query, setQuery] = useState(value?.displayName ?? '');
  const [predictions, setPredictions] = useState<Array<{ placeId: string; description: string }>>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const provider = useMemo(() => {
    if (!isLoaded) return null;
    return createGoogleMapsJsAddressProviderAdapter();
  }, [isLoaded]);

  const applyPlace = useCallback(
    async (place: PlanningPlaceValue) => {
      let next = place;
      if (secureSupabase && place.placeId) {
        const cacheResult = await readLocationCache(secureSupabase, place.placeId);
        if (isOk(cacheResult) && cacheResult.data != null) {
          const cached = cacheResult.data;
          next = { ...next, ...cached, displayName: next.displayName || cached.displayName };
        }
      }
      if (next.coordinates) {
        const tz = await getTimezone(next.coordinates.lat, next.coordinates.lng);
        if (tz) next = { ...next, timezone: tz };
      }
      onChange(next);
      setQuery(next.displayName);
      setPredictions([]);
    },
    [getTimezone, onChange, secureSupabase]
  );

  const runSearch = useCallback(
    async (text: string) => {
      setQuery(text);
      if (!provider || text.trim().length < 2) {
        setPredictions([]);
        return;
      }
      const result = await provider.searchPredictions(text, { sessionToken: getSessionToken() });
      if (!result.ok) {
        setSearchError(result.error.message);
        setPredictions([]);
        return;
      }
      setSearchError(null);
      setPredictions(result.data);
    },
    [getSessionToken, provider]
  );

  const selectPrediction = useCallback(
    async (placeId: string, description: string) => {
      if (!provider) return;
      const detailsResult = await provider.getPlaceDetails(placeId, {
        sessionToken: getSessionToken(),
        fields: ['geometry', 'formatted_address', 'place_id', 'address_components', 'name'],
      });
      if (!detailsResult.ok) {
        setSearchError(detailsResult.error.message);
        return;
      }
      const address = parseGooglePlaceDetailsToAddressValue(detailsResult.data);
      const geometry = await readGeometryFromGoogle(placeId);
      await applyPlace({
        placeId: address.placeId ?? placeId,
        displayName: address.formattedAddress || description,
        shortAddress: address.line1,
        coordinates: geometry,
      });
    },
    [applyPlace, getSessionToken, provider]
  );

  if (isError) {
    return (
      <Alert variant="destructive">
        Maps could not be loaded. Enter a location label manually; coordinates may be omitted until
        maps are available.
        <Label>
          {label}
          <Input
            value={query}
            onChange={(text) => {
              setQuery(text);
              onChange(text.trim() ? { placeId: '', displayName: text } : null);
            }}
          />
        </Label>
      </Alert>
    );
  }

  return (
    <section className="grid gap-2">
      <Label>
        {label}
        {required ? ' *' : ''}
        <Input
          value={query}
          onChange={(text) => void runSearch(text)}
          placeholder={isLoaded ? 'Search for a place' : 'Loading maps…'}
          disabled={!isLoaded}
        />
      </Label>
      {searchError ? <Alert variant="destructive">{searchError}</Alert> : null}
      {predictions.length > 0 ? (
        <ul>
          {predictions.map((item) => (
            <li key={item.placeId}>
              <Button
                type="button"
                variant="outline"
                onClick={() => void selectPrediction(item.placeId, item.description)}
              >
                {item.description}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
