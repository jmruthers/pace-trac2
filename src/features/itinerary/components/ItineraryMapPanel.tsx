import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, LoadingSpinner } from '@solvera/pace-core/components';
import {
  GoogleMapsPlanningProvider,
  useGoogleMapsPlanning,
} from '@/features/planning/context/GoogleMapsPlanningContext';
import type { ItineraryMapData } from '@/features/itinerary/collect-map-points';

interface ItineraryMapPanelProps {
  mapData: ItineraryMapData;
  /** Parent supplies {@link GoogleMapsPlanningProvider} — use on pages with many entry maps. */
  embedded?: boolean;
  className?: string;
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

function triggerMapResize(map: unknown): void {
  const mapsEvent = (globalThis as { google?: { maps?: { event?: { trigger: (instance: unknown, event: string) => void } } } })
    .google?.maps?.event;
  if (map != null && mapsEvent?.trigger != null) {
    mapsEvent.trigger(map, 'resize');
  }
}

function ItineraryMapPanelInner({ mapData, className }: ItineraryMapPanelProps) {
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

    const { points: overlayPoints, transportLegs: overlayLegs } = mapData;

    clearMapOverlays(markersRef.current, polylinesRef.current);
    markersRef.current = [];
    polylinesRef.current = [];

    const bounds = new mapsApi.maps.LatLngBounds();
    for (const point of overlayPoints) {
      bounds.extend(point.coordinates);
    }
    for (const leg of overlayLegs) {
      bounds.extend(leg.from.coordinates);
      bounds.extend(leg.to.coordinates);
    }

    const map = mapRef.current;
    (map as MapsMapInstance).fitBounds(bounds);

    for (const point of overlayPoints) {
      markersRef.current.push(
        new mapsApi.maps.Marker({
          map,
          position: point.coordinates,
          title: point.label,
        })
      );
    }

    for (const leg of overlayLegs) {
      polylinesRef.current.push(
        new mapsApi.maps.Polyline({
          map,
          path: [leg.from.coordinates, leg.to.coordinates],
        })
      );
    }

    const resizeFrame = requestAnimationFrame(() => {
      triggerMapResize(map);
      (map as MapsMapInstance).fitBounds(bounds);
    });

    return () => {
      cancelAnimationFrame(resizeFrame);
      clearMapOverlays(markersRef.current, polylinesRef.current);
      markersRef.current = [];
      polylinesRef.current = [];
    };
  }, [isLoaded, hasMapContent, mapData]);

  if (isError) {
    return (
      <section aria-label="Itinerary map">
        <Alert>
          <p>Map could not be loaded. Use the day-by-day list for schedule details.</p>
        </Alert>
      </section>
    );
  }

  const mapSurfaceClassName =
    className ?? 'min-h-40 w-full overflow-hidden rounded-2xl border border-main-300';

  return (
    <section aria-label="Itinerary map" className="h-full min-h-40 w-full min-w-0 self-stretch">
      <article ref={assignContainerRef} className={mapSurfaceClassName} aria-busy={!isLoaded}>
        {!isLoaded ? <LoadingSpinner label="Loading map…" /> : null}
      </article>
    </section>
  );
}

/** Map panel with lazy Google Maps bootstrap — provider mounts only when coordinates exist. */
export function ItineraryMapPanel({ mapData, embedded = false, className }: ItineraryMapPanelProps) {
  const hasMapContent = mapData.points.length > 0 || mapData.transportLegs.length > 0;

  if (!hasMapContent) {
    return null;
  }

  const inner = <ItineraryMapPanelInner mapData={mapData} className={className} />;

  if (embedded) {
    return inner;
  }

  return <GoogleMapsPlanningProvider>{inner}</GoogleMapsPlanningProvider>;
}
