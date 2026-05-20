import type { Coordinates } from '@/features/planning/types';

export async function readGeometryFromGoogle(placeId: string) {
  const places = (
    globalThis as unknown as {
      google?: { maps?: { places?: { PlacesService: new (el: HTMLElement) => unknown } } };
    }
  ).google?.maps?.places;
  if (places == null) return undefined;

  return new Promise<Coordinates | undefined>((resolve) => {
    const service = new places.PlacesService(document.createElement('div')) as {
      getDetails: (
        request: { placeId: string; fields: string[] },
        callback: (
          place: { geometry?: { location?: { lat: () => number; lng: () => number } } } | null,
          status: string
        ) => void
      ) => void;
    };
    service.getDetails(
      { placeId, fields: ['geometry', 'formatted_address', 'name', 'place_id'] },
      (place, status) => {
        if (status !== 'OK' || place?.geometry?.location == null) {
          resolve(undefined);
          return;
        }
        resolve({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    );
  });
}
