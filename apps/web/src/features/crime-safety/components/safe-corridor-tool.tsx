"use client";

import { useState, useCallback } from "react";
import { useCrimeHeatmap } from "../hooks";
import { riskLevel, riskColor } from "../utils/crime-calculations";
import type { SafeCorridorResult, OffenceCategory } from "../types";
import {
  OFFENCE_CATEGORY_LABELS,
  OFFENCE_CATEGORY_COLORS,
} from "../types";

interface SafeCorridorToolProps {
  map: maplibregl.Map | null;
  visible: boolean;
  onClose?: () => void;
}

const CORRIDOR_SOURCE = "safe-corridor-source";
const CORRIDOR_LAYER = "safe-corridor-layer";
const CORRIDOR_LINE_LAYER = "safe-corridor-line-layer";
const HOTSPOT_SOURCE = "corridor-hotspot-source";
const HOTSPOT_LAYER = "corridor-hotspot-layer";

export function SafeCorridorTool({
  map,
  visible,
  onClose,
}: SafeCorridorToolProps) {
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [radius, setRadius] = useState(1);
  const [result, setResult] = useState<SafeCorridorResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyseCorridorFn = useCallback(
    async (corridorPoints: { lat: number; lng: number }[]) => {
      if (corridorPoints.length < 2) return;
      setLoading(true);
      try {
        const res = await fetch("/api/crime/corridor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points: corridorPoints,
            radiusKm: radius,
          }),
        });
        if (res.ok) {
          const data: SafeCorridorResult = await res.json();
          setResult(data);
          renderCorridor(data);
        }
      } finally {
        setLoading(false);
      }
    },
    [map, radius]
  );

  function renderCorridor(data: SafeCorridorResult) {
    if (!map) return;

    // Corridor polygon
    if (map.getSource(CORRIDOR_SOURCE)) {
      (map.getSource(CORRIDOR_SOURCE) as maplibregl.GeoJSONSource).setData(
        data.corridor as GeoJSON.Feature
      );
    } else {
      map.addSource(CORRIDOR_SOURCE, {
        type: "geojson",
        data: data.corridor as GeoJSON.Feature,
      });
      map.addLayer({
        id: CORRIDOR_LAYER,
        type: "fill",
        source: CORRIDOR_SOURCE,
        paint: {
          "fill-color": riskColor(data.overallRisk),
          "fill-opacity": 0.15,
        },
      });
      map.addLayer({
        id: CORRIDOR_LINE_LAYER,
        type: "line",
        source: CORRIDOR_SOURCE,
        paint: {
          "line-color": riskColor(data.overallRisk),
          "line-width": 2,
        },
      });
    }

    // Hotspot pins
    const hotspotGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: data.hotspots.map((h, i) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [h.lng, h.lat] },
        properties: {
          category: h.category,
          count: h.count,
          color: OFFENCE_CATEGORY_COLORS[h.category],
        },
      })),
    };

    if (map.getSource(HOTSPOT_SOURCE)) {
      (map.getSource(HOTSPOT_SOURCE) as maplibregl.GeoJSONSource).setData(
        hotspotGeoJSON
      );
    } else {
      map.addSource(HOTSPOT_SOURCE, {
        type: "geojson",
        data: hotspotGeoJSON,
      });
      map.addLayer({
        id: HOTSPOT_LAYER,
        type: "circle",
        source: HOTSPOT_SOURCE,
        paint: {
          "circle-radius": 6,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1,
        },
      });
    }
  }

  function startDrawing() {
    if (!map) return;
    setDrawing(true);
    setPoints([]);
    setResult(null);
    map.getCanvas().style.cursor = "crosshair";

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const newPoint = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      setPoints((prev) => [...prev, newPoint]);
    };

    const handleDblClick = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      map.getCanvas().style.cursor = "";
      setDrawing(false);
      map.off("click", handleClick);
      map.off("dblclick", handleDblClick);
      setPoints((prev) => {
        analyseCorridorFn(prev);
        return prev;
      });
    };

    map.on("click", handleClick);
    map.on("dblclick", handleDblClick);
  }

  function clearCorridor() {
    if (!map) return;
    setResult(null);
    setPoints([]);
    for (const layerId of [CORRIDOR_LAYER, CORRIDOR_LINE_LAYER, HOTSPOT_LAYER]) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    }
    for (const sourceId of [CORRIDOR_SOURCE, HOTSPOT_SOURCE]) {
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
  }

  if (!visible) return null;

  return (
    <div className="absolute right-4 top-20 w-72 rounded-lg bg-card p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Where You Should Be</h4>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          x
        </button>
      </div>

      <p className="mb-3 text-[10px] text-muted-foreground">
        Draw a commute corridor or school radius to highlight risk zones vs safe areas.
      </p>

      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs">Radius (km):</label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs">{radius}km</span>
      </div>

      <div className="flex gap-2">
        {!drawing && !result && (
          <button
            onClick={startDrawing}
            className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Draw Route
          </button>
        )}
        {drawing && (
          <span className="flex-1 text-center text-xs text-blue-400">
            Click to add points, double-click to finish
          </span>
        )}
        {result && (
          <button
            onClick={clearCorridor}
            className="flex-1 rounded bg-muted px-3 py-1.5 text-xs hover:bg-muted/80"
          >
            Clear
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Analysing corridor...
        </div>
      )}

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Overall Risk:</span>
            <span
              className="rounded px-2 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: riskColor(result.overallRisk) + "20",
                color: riskColor(result.overallRisk),
              }}
            >
              {result.overallRisk.toUpperCase()} ({result.averageCrimeIndex})
            </span>
          </div>

          <div className="space-y-1">
            {result.segments.map((seg, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[10px]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: riskColor(seg.riskLevel) }}
                />
                <span>
                  Segment {i + 1}: {seg.riskLevel} (
                  {OFFENCE_CATEGORY_LABELS[seg.dominantCategory]})
                </span>
              </div>
            ))}
          </div>

          {result.hotspots.length > 0 && (
            <div className="text-[10px] text-muted-foreground">
              {result.hotspots.length} hotspot{result.hotspots.length !== 1 ? "s" : ""} in corridor
            </div>
          )}
        </div>
      )}
    </div>
  );
}
