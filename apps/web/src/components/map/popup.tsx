"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import { createRoot, type Root } from "react-dom/client";
import { useMapContext } from "@/hooks/use-map";

// --- Types ---

export interface PopupContentProps {
  layerId: string;
  properties: Record<string, unknown>;
  lngLat: { lng: number; lat: number };
  onViewDetails: () => void;
  onClose: () => void;
}

export type PopupContentRenderer = (props: PopupContentProps) => React.ReactNode;

/**
 * Registry of popup content renderers by layer ID prefix.
 * Each layer agent registers its own renderer.
 */
const popupRenderers = new Map<string, PopupContentRenderer>();

export function registerPopupRenderer(
  layerIdPrefix: string,
  renderer: PopupContentRenderer
): void {
  popupRenderers.set(layerIdPrefix, renderer);
}

export function unregisterPopupRenderer(layerIdPrefix: string): void {
  popupRenderers.delete(layerIdPrefix);
}

// --- Default popup content ---

function DefaultPopupContent({
  layerId,
  properties,
  onViewDetails,
  onClose,
}: PopupContentProps) {
  // Filter out internal/unhelpful properties
  const displayProps = Object.entries(properties).filter(
    ([key]) => !key.startsWith("_") && key !== "id"
  );

  return (
    <div className="ozpulse-popup" style={{ minWidth: 180, maxWidth: 280, fontFamily: "system-ui, sans-serif", fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>
          {properties.name as string ?? properties.title as string ?? layerId}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            padding: "0 2px",
          }}
        >
          x
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {displayProps.slice(0, 6).map(([key, value]) => (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>
              {key.replace(/[_-]/g, " ")}
            </span>
            <span style={{ fontWeight: 500, color: "#e2e8f0", textAlign: "right" }}>
              {formatValue(value)}
            </span>
          </div>
        ))}
        {displayProps.length > 6 && (
          <span style={{ color: "#64748b", fontSize: 11 }}>
            +{displayProps.length - 6} more fields
          </span>
        )}
      </div>
      <button
        onClick={onViewDetails}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "6px 0",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          color: "#60a5fa",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        View details
      </button>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value == null) return "--";
  if (typeof value === "number") {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toFixed(2);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// --- MapPopup Component ---

interface MapPopupProps {
  onViewDetails?: (layerId: string, properties: Record<string, unknown>) => void;
}

/**
 * MapPopup -- listens to map click events and shows a React-rendered popup.
 * Each layer can register its own popup content renderer via `registerPopupRenderer()`.
 * Renders the "View details" button that opens the right detail panel.
 */
export function MapPopup({ onViewDetails }: MapPopupProps) {
  const { getMap, ready } = useMapContext();
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const rootRef = useRef<Root | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setPopupKey] = useState(0); // Force re-renders if needed

  const closePopup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    if (rootRef.current) {
      // Defer unmount to avoid React warnings
      const root = rootRef.current;
      rootRef.current = null;
      setTimeout(() => root.unmount(), 0);
    }
    containerRef.current = null;
  }, []);

  const showPopup = useCallback(
    (
      lngLat: { lng: number; lat: number },
      layerId: string,
      properties: Record<string, unknown>
    ) => {
      const map = getMap();
      if (!map) return;

      closePopup();

      // Create DOM container for React
      const container = document.createElement("div");
      containerRef.current = container;

      // Find the appropriate renderer
      let Renderer: PopupContentRenderer = DefaultPopupContent;
      for (const [prefix, renderer] of popupRenderers) {
        if (layerId.startsWith(prefix)) {
          Renderer = renderer;
          break;
        }
      }

      // Mount React content
      const root = createRoot(container);
      rootRef.current = root;

      root.render(
        <Renderer
          layerId={layerId}
          properties={properties}
          lngLat={lngLat}
          onViewDetails={() => {
            onViewDetails?.(layerId, properties);
            closePopup();
          }}
          onClose={closePopup}
        />
      );

      // Create MapLibre popup
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: true,
        maxWidth: "300px",
        className: "ozpulse-map-popup",
        offset: 12,
      })
        .setLngLat([lngLat.lng, lngLat.lat])
        .setDOMContent(container)
        .addTo(map);

      popup.on("close", () => {
        closePopup();
      });

      popupRef.current = popup;
      setPopupKey((k) => k + 1);
    },
    [getMap, closePopup, onViewDetails]
  );

  // Listen to map clicks
  useEffect(() => {
    const map = getMap();
    if (!map || !ready) return;

    const handler = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point);

      // Filter to only features from managed layers (exclude base map)
      const managedFeature = features.find(
        (f) =>
          f.layer &&
          f.properties &&
          !f.layer.id.startsWith("background") &&
          !f.layer.id.startsWith("water") &&
          !f.layer.id.startsWith("land") &&
          !f.layer.id.startsWith("boundary")
      );

      if (managedFeature) {
        showPopup(
          e.lngLat,
          managedFeature.layer.id,
          managedFeature.properties as Record<string, unknown>
        );
      } else {
        closePopup();
      }
    };

    map.on("click", handler);

    return () => {
      map.off("click", handler);
      closePopup();
    };
  }, [ready, getMap, showPopup, closePopup]);

  return null;
}
