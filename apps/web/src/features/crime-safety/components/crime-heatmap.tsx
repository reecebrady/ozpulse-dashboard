"use client";

import { useEffect, useRef } from "react";
import { useCrimeHeatmap } from "../hooks";
import {
  OFFENCE_CATEGORY_COLORS,
  OFFENCE_CATEGORY_LABELS,
  type OffenceCategory,
} from "../types";
import { riskColor, riskLevel } from "../utils/crime-calculations";

interface CrimeHeatmapProps {
  map: maplibregl.Map | null;
  visible: boolean;
  selectedCategory?: OffenceCategory;
  onFeatureClick?: (feature: {
    postcode: string;
    crimeIndex: number;
    lat: number;
    lng: number;
  }) => void;
}

const HEATMAP_SOURCE_ID = "crime-heatmap-source";
const HEATMAP_LAYER_ID = "crime-heatmap-layer";
const CIRCLE_LAYER_ID = "crime-circles-layer";

export function CrimeHeatmap({
  map,
  visible,
  selectedCategory,
  onFeatureClick,
}: CrimeHeatmapProps) {
  const { data: heatmapData, isLoading } = useCrimeHeatmap();
  const layersAddedRef = useRef(false);

  useEffect(() => {
    if (!map || !heatmapData || heatmapData.length === 0) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: heatmapData.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
        properties: {
          value: point.value,
          postcode: point.postcode,
          riskLevel: riskLevel(point.value),
        },
      })),
    };

    if (map.getSource(HEATMAP_SOURCE_ID)) {
      (map.getSource(HEATMAP_SOURCE_ID) as maplibregl.GeoJSONSource).setData(
        geojson
      );
    } else {
      map.addSource(HEATMAP_SOURCE_ID, {
        type: "geojson",
        data: geojson,
      });
    }

    if (!layersAddedRef.current) {
      map.addLayer({
        id: HEATMAP_LAYER_ID,
        type: "heatmap",
        source: HEATMAP_SOURCE_ID,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            0, 0,
            100, 1,
          ],
          "heatmap-intensity": 1,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(34, 197, 94, 0)",
            0.2, "rgba(34, 197, 94, 0.4)",
            0.4, "rgba(250, 204, 21, 0.6)",
            0.6, "rgba(245, 158, 11, 0.7)",
            0.8, "rgba(239, 68, 68, 0.8)",
            1, "rgba(153, 27, 27, 0.9)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            4, 15,
            8, 30,
            12, 50,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 0.8,
            12, 0.4,
          ],
        },
      });

      map.addLayer({
        id: CIRCLE_LAYER_ID,
        type: "circle",
        source: HEATMAP_SOURCE_ID,
        minzoom: 10,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            0, 4,
            50, 8,
            100, 14,
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            0, "#22c55e",
            30, "#facc15",
            60, "#f59e0b",
            100, "#ef4444",
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
          "circle-opacity": 0.8,
        },
      });

      map.on("click", CIRCLE_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        if (feature && onFeatureClick) {
          const coords = (feature.geometry as GeoJSON.Point).coordinates;
          onFeatureClick({
            postcode: feature.properties?.postcode ?? "",
            crimeIndex: feature.properties?.value ?? 0,
            lat: coords[1]!,
            lng: coords[0]!,
          });
        }
      });

      map.on("mouseenter", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", CIRCLE_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      layersAddedRef.current = true;
    }

    return () => {
      // Cleanup on unmount only, not on re-render
    };
  }, [map, heatmapData, onFeatureClick]);

  // Toggle visibility
  useEffect(() => {
    if (!map || !layersAddedRef.current) return;
    const vis = visible ? "visible" : "none";
    if (map.getLayer(HEATMAP_LAYER_ID)) {
      map.setLayoutProperty(HEATMAP_LAYER_ID, "visibility", vis);
    }
    if (map.getLayer(CIRCLE_LAYER_ID)) {
      map.setLayoutProperty(CIRCLE_LAYER_ID, "visibility", vis);
    }
  }, [map, visible]);

  if (isLoading) {
    return (
      <div className="absolute bottom-20 left-4 rounded bg-card px-3 py-2 text-xs text-muted-foreground shadow">
        Loading crime data...
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className="absolute bottom-20 left-4 rounded bg-card p-3 shadow">
      <h4 className="mb-2 text-xs font-semibold">Crime Index</h4>
      <div className="flex items-center gap-1 text-[10px]">
        <span className="h-2 w-6 rounded" style={{ background: "#22c55e" }} />
        <span>Low</span>
        <span className="h-2 w-6 rounded" style={{ background: "#facc15" }} />
        <span>Med</span>
        <span className="h-2 w-6 rounded" style={{ background: "#ef4444" }} />
        <span>High</span>
      </div>
    </div>
  );
}
