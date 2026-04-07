"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LayerId } from "@ozpulse/shared";
import { MapContext } from "@/hooks/use-map";
import { LayerManagerImpl } from "./layer-manager";
import { useMapStore } from "@/stores/map-store";

// Free open-source tile style -- works offline-ready via tile-cache
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const AUSTRALIA_CENTER: [number, number] = [133.7751, -25.2744];
const AUSTRALIA_ZOOM = 4;

interface MapContainerProps {
  activeLayers: Set<LayerId>;
  onFeatureClick: (feature: unknown) => void;
  children?: ReactNode;
}

export function MapContainer({
  activeLayers,
  onFeatureClick,
  children,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const layerManagerRef = useRef<LayerManagerImpl | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { sidebarOpen, setView } = useMapStore();

  // Initialize MapLibre
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: AUSTRALIA_CENTER,
      zoom: AUSTRALIA_ZOOM,
      minZoom: 2,
      maxZoom: 18,
      attributionControl: true,
      antialias: true,
      fadeDuration: 200,
      maxTileCacheSize: 256,
      pixelRatio: Math.min(window.devicePixelRatio, 2), // cap for performance on retina
    });

    // Navigation controls (zoom + compass) -- top-right
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: true }),
      "top-right"
    );

    // Scale bar -- bottom-left
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 150, unit: "metric" }),
      "bottom-left"
    );

    // Geolocation button -- top-right, below nav controls
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: false },
        trackUserLocation: false,
        showUserHeading: false,
      }),
      "top-right"
    );

    // Fullscreen toggle -- top-right
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    // Create the layer manager
    const lm = new LayerManagerImpl();

    map.on("load", () => {
      lm.setMap(map);
      mapInstanceRef.current = map;
      layerManagerRef.current = lm;
      setMapReady(true);
    });

    // Sync map view state back to store on move
    map.on("moveend", () => {
      const center = map.getCenter();
      setView({
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
      });
    });

    // Handle generic feature clicks for layers
    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length > 0) {
        const feature = features[0];
        onFeatureClick({
          layerId: feature.layer?.id,
          sourceId: feature.source,
          properties: feature.properties,
          geometry: feature.geometry,
          lngLat: e.lngLat,
        });
      }
    });

    // Set pointer cursor on hoverable features
    map.on("mousemove", (e) => {
      const features = map.queryRenderedFeatures(e.point);
      map.getCanvas().style.cursor = features.length > 0 ? "pointer" : "";
    });

    return () => {
      lm.destroy();
      map.remove();
      mapInstanceRef.current = null;
      layerManagerRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle sidebar resize -- trigger map resize after transition
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // Wait for CSS transition (200ms from sidebar) then resize
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = setTimeout(() => {
      mapInstanceRef.current?.resize();
    }, 220);
    return () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [sidebarOpen]);

  // Sync active layers with the layer manager
  useEffect(() => {
    if (!layerManagerRef.current) return;
    const lm = layerManagerRef.current;
    const all = lm.getAll();
    for (const layer of all) {
      const shouldBeVisible = activeLayers.has(layer.id as LayerId);
      if (shouldBeVisible && !layer.visible) {
        lm.show(layer.id);
      } else if (!shouldBeVisible && layer.visible) {
        lm.hide(layer.id);
      }
    }
  }, [activeLayers]);

  const getMap = useCallback(() => mapInstanceRef.current, []);
  const getLayerManager = useCallback(() => layerManagerRef.current, []);

  return (
    <MapContext.Provider
      value={{ getMap, getLayerManager, ready: mapReady }}
    >
      <div
        ref={containerRef}
        className="relative h-full w-full bg-[#0d1117]"
      >
        {/* Children (popups, tool overlays, etc.) render on top of the map */}
        {mapReady && children}
      </div>
    </MapContext.Provider>
  );
}
