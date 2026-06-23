import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, LoadingSpinner } from '@solvera/pace-core/components';
import { useGoogleMapsPlanning } from '@/features/planning/context/GoogleMapsPlanningContext';
import type { ItineraryMapData } from '@/features/itinerary/collect-map-points';

interface ItineraryMapPanelProps {
  mapData: ItineraryMapData;
}

type LatLngLiteral = { lat: number; lng: number };

type MapsMapOptions = {
  mapTypeControl: boolean;
  streetViewControl: boolean;
  fullscreenControl: boolean;
};

type MapsMapInstance = {
  fitBounds: (bounds: unknown) => void;
  getDiv?: () => HTMLElement;
};

type MapsEventApi = {
  clearInstanceListeners: (instance: unknown) => void;
};

type MapsLatLngBounds = {
  extend: (coords: LatLngLiteral) => void;
};

type MapsMarkerOptions = {
  map: unknown;
  position: LatLngLiteral;
  title: string;
};

type MapsPolylineOptions = {
  map: unknown;
  path: LatLngLiteral[];
};

type GoogleMapsNamespace = {
  Map: new (element: HTMLElement, options: MapsMapOptions) => MapsMapInstance;
  LatLngBounds: new () => MapsLatLngBounds;
  Marker: new (options: MapsMarkerOptions) => unknown;
  Polyline: new (options: MapsPolylineOptions) => unknown;
};

type MapsApi = {
  maps: GoogleMapsNamespace;
};

function getMapsApi(): MapsApi | null {
  const candidate = (globalThis as { google?: MapsApi }).google;
  return candidate?.maps != null ? candidate : null;
}

function clearMapOverlays(markers: unknown[], polylines: unknown[]) {
  for (const marker of markers) {
    if (
      marker != null &&
      typeof marker === 'object' &&
      'setMap' in marker &&
      typeof (marker as { setMap: (value: null) => void }).setMap === 'function'
    ) {
      (marker as { setMap: (value: null) => void }).setMap(null);
    }
  }
  for (const line of polylines) {
    if (
      line != null &&
      typeof line === 'object' &&
      'setMap' in line &&
      typeof (line as { setMap: (value: null) => void }).setMap === 'function'
    ) {
      (line as { setMap: (value: null) => void }).setMap(null);
    }
  }
}

function clearMapListeners(map: unknown): void {
  const mapsEvent = (globalThis as { google?: { maps?: { event?: MapsEventApi } } }).google?.maps
    ?.event;
  if (map != null && mapsEvent?.clearInstanceListeners != null) {
    mapsEvent.clearInstanceListeners(map);
  }
}

function destroyMapState(
  mapRef: { current: unknown },
  markersRef: { current: unknown[] },
  polylinesRef: { current: unknown[] }
): void {
  clearMapOverlays(markersRef.current, polylinesRef.current);
  markersRef.current = [];
  polylinesRef.current = [];
  if (mapRef.current != null) {
    clearMapListeners(mapRef.current);
    mapRef.current = null;
  }
}

function mapNeedsRecreate(map: unknown, container: HTMLElement | null): boolean {
  if (map == null || container == null) return true;
  const existingMap = map as MapsMapInstance;
  return existingMap.getDiv?.() !== container;
}

export function ItineraryMapPanel({ mapData }: ItineraryMapPanelProps) {
  const { isLoaded, isError } = useGoogleMapsPlanning();
  const [containerNode, setContainerNode] = useState<HTMLElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const polylinesRef = useRef<unknown[]>([]);

  const assignContainerRef = useCallback((node: HTMLElement | null) => {
    setContainerNode(node);
  }, []);

  const { points, transportLegs } = mapData;
  const hasMapContent = points.length > 0 || transportLegs.length > 0;

  const mapOverlaySignature = useMemo(
    () =>
      [
        points.length,
        transportLegs.length,
        ...points.map((point) => `${point.coordinates.lat},${point.coordinates.lng},${point.label}`),
        ...transportLegs.map(
          (leg) =>
            `${leg.from.coordinates.lat},${leg.from.coordinates.lng},${leg.to.coordinates.lat},${leg.to.coordinates.lng}`
        ),
      ].join('|'),
    [points, transportLegs]
  );

  useEffect(() => {
    if (!isLoaded || !hasMapContent) {
      return () => {
        destroyMapState(mapRef, markersRef, polylinesRef);
      };
    }

    if (containerNode == null) {
      return;
    }

    const mapsApi = getMapsApi();
    if (mapsApi == null) {
      return () => {
        destroyMapState(mapRef, markersRef, polylinesRef);
      };
    }

    if (mapNeedsRecreate(mapRef.current, containerNode)) {
      destroyMapState(mapRef, markersRef, polylinesRef);
      mapRef.current = new mapsApi.maps.Map(containerNode, {
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    return () => {
      destroyMapState(mapRef, markersRef, polylinesRef);
    };
  }, [containerNode, hasMapContent, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !hasMapContent || mapRef.current == null) return;

    const mapsApi = getMapsApi();
    if (mapsApi == null) return;

    clearMapOverlays(markersRef.current, polylinesRef.current);
    markersRef.current = [];
    polylinesRef.current = [];

    const bounds = new mapsApi.maps.LatLngBounds();
    for (const point of points) {
      bounds.extend(point.coordinates);
    }
    for (const leg of transportLegs) {
      bounds.extend(leg.from.coordinates);
      bounds.extend(leg.to.coordinates);
    }

    const map = mapRef.current;
    (map as MapsMapInstance).fitBounds(bounds);

    for (const point of points) {
      markersRef.current.push(
        new mapsApi.maps.Marker({
          map,
          position: point.coordinates,
          title: point.label,
        })
      );
    }

    for (const leg of transportLegs) {
      polylinesRef.current.push(
        new mapsApi.maps.Polyline({
          map,
          path: [leg.from.coordinates, leg.to.coordinates],
        })
      );
    }

    return () => {
      clearMapOverlays(markersRef.current, polylinesRef.current);
      markersRef.current = [];
      polylinesRef.current = [];
    };
  }, [isLoaded, hasMapContent, mapOverlaySignature, points, transportLegs]);

  if (!hasMapContent) {
    return null;
  }

  if (isError) {
    return (
      <section aria-label="Itinerary map">
        <Alert>
          <p>Map could not be loaded. Use the day-by-day list for schedule details.</p>
        </Alert>
      </section>
    );
  }

  return (
    <section aria-label="Itinerary map" className="self-start w-full">
      <article
        ref={assignContainerRef}
        className="grid min-h-64 w-full overflow-hidden rounded-2xl border border-main-300"
        aria-busy={!isLoaded}
      >
        {!isLoaded ? (
          <LoadingSpinner label="Loading map…" />
        ) : null}
      </article>
    </section>
  );
}
