"use client";

import { useEffect, useRef } from "react";
import { useMigrationHeatmap } from "../hooks";
import { migrationIntensityColor } from "../utils/demographic-calculations";

interface MigrationHeatmapProps {
  map: maplibregl.Map | null;
  visible: boolean;
  onFeatureClick?: (feature: {
    postcode: string;
    netMigration: number;
    lat: number;
    lng: number;
  }) => void;
}

const SOURCE_ID = "migration-heatmap-source";
const HEATMAP_LAYER_ID = "migration-heatmap-layer";
const CIRCLE_LAYER_ID = "migration-circles-layer";

export function MigrationHeatmap({
  map,
  visible,
  onFeatureClick,
}: MigrationHeatmapProps) {
  const { data: heatmapData, isLoading } = useMigrationHeatmap();
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
          color: migrationIntensityColor(point.value),
        },
      })),
    };

    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(SOURCE_ID, { type: "geojson", data: geojson });
    }

    if (!layersAddedRef.current) {
      map.addLayer({
        id: HEATMAP_LAYER_ID,
        type: "heatmap",
        source: SOURCE_ID,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            -500, 0.5,
            0, 0,
            500, 0.5,
          ],
          "heatmap-intensity": 0.8,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(229, 231, 235, 0)",
            0.2, "rgba(147, 197, 253, 0.4)",
            0.4, "rgba(59, 130, 246, 0.6)",
            0.6, "rgba(37, 99, 235, 0.7)",
            0.8, "rgba(30, 64, 175, 0.8)",
            1, "rgba(30, 58, 138, 0.9)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            4, 20,
            8, 35,
            12, 55,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 0.7,
            12, 0.3,
          ],
        },
      });

      map.addLayer({
        id: CIRCLE_LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        minzoom: 9,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["abs", ["get", "value"]],
            0, 3,
            200, 7,
            500, 12,
          ],
          "circle-color": ["get", "color"],
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
            netMigration: feature.properties?.value ?? 0,
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
  }, [map, heatmapData, onFeatureClick]);

  useEffect(() => {
    if (!map || !layersAddedRef.current) return;
    const vis = visible ? "visible" : "none";
    if (map.getLayer(HEATMAP_LAYER_ID))
      map.setLayoutProperty(HEATMAP_LAYER_ID, "visibility", vis);
    if (map.getLayer(CIRCLE_LAYER_ID))
      map.setLayoutProperty(CIRCLE_LAYER_ID, "visibility", vis);
  }, [map, visible]);

  if (isLoading) {
    return (
      <div className="absolute bottom-20 left-4 rounded bg-card px-3 py-2 text-xs text-muted-foreground shadow">
        Loading migration data...
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className="absolute bottom-20 left-4 rounded bg-card p-3 shadow">
      <h4 className="mb-2 text-xs font-semibold">Net Migration</h4>
      <div className="flex items-center gap-1 text-[10px]">
        <span className="h-2 w-6 rounded" style={{ background: "#991b1b" }} />
        <span>Outflow</span>
        <span className="h-2 w-6 rounded" style={{ background: "#e5e7eb" }} />
        <span>Neutral</span>
        <span className="h-2 w-6 rounded" style={{ background: "#1e40af" }} />
        <span>Inflow</span>
      </div>
    </div>
  );
}
