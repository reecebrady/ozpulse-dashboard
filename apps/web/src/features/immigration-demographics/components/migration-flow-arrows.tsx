"use client";

import { useEffect, useRef } from "react";
import { useMigrationFlows } from "../hooks";
import { VISA_CATEGORY_COLORS, COUNTRY_COORDINATES, type VisaCategory } from "../types";

interface MigrationFlowArrowsProps {
  map: maplibregl.Map | null;
  visible: boolean;
  selectedVisa?: VisaCategory;
}

const FLOW_SOURCE = "migration-flow-source";
const FLOW_LAYER = "migration-flow-layer";
const FLOW_ARROW_LAYER = "migration-flow-arrow-layer";
const ORIGIN_SOURCE = "migration-origin-source";
const ORIGIN_LAYER = "migration-origin-layer";

// Curved line between two points (great circle approximation)
function createArcCoordinates(
  start: [number, number],
  end: [number, number],
  numPoints: number = 50
): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lng = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;
    // Add curve height proportional to distance
    const dist = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
    );
    const curveHeight = dist * 0.15;
    const arcOffset = Math.sin(t * Math.PI) * curveHeight;
    coords.push([lng, lat + arcOffset]);
  }
  return coords;
}

export function MigrationFlowArrows({
  map,
  visible,
  selectedVisa,
}: MigrationFlowArrowsProps) {
  const { data: flows, isLoading } = useMigrationFlows();
  const layersAddedRef = useRef(false);

  useEffect(() => {
    if (!map || !flows || flows.length === 0) return;

    const filteredFlows = selectedVisa
      ? flows.filter((f) => f.visaCategory === selectedVisa)
      : flows;

    // Flow line features
    const flowFeatures: GeoJSON.Feature[] = filteredFlows.map((flow) => {
      const sourceCoord = COUNTRY_COORDINATES[flow.sourceCountry];
      const start: [number, number] = sourceCoord
        ? [sourceCoord.lng, sourceCoord.lat]
        : [flow.sourceLng, flow.sourceLat];
      const end: [number, number] = [flow.destinationLng, flow.destinationLat];

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: createArcCoordinates(start, end),
        },
        properties: {
          arrivals: flow.arrivals,
          country: flow.sourceCountry,
          visa: flow.visaCategory,
          color: VISA_CATEGORY_COLORS[flow.visaCategory],
          width: Math.max(1, Math.min(6, flow.arrivals / 500)),
        },
      };
    });

    const flowGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: flowFeatures,
    };

    // Origin country points
    const originMap = new Map<string, number>();
    for (const flow of filteredFlows) {
      originMap.set(
        flow.sourceCountry,
        (originMap.get(flow.sourceCountry) ?? 0) + flow.arrivals
      );
    }

    const originGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: Array.from(originMap.entries())
        .filter(([country]) => COUNTRY_COORDINATES[country])
        .map(([country, arrivals]) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              COUNTRY_COORDINATES[country]!.lng,
              COUNTRY_COORDINATES[country]!.lat,
            ],
          },
          properties: {
            country,
            arrivals,
            radius: Math.max(4, Math.min(16, Math.sqrt(arrivals) / 10)),
          },
        })),
    };

    // Update or create sources
    if (map.getSource(FLOW_SOURCE)) {
      (map.getSource(FLOW_SOURCE) as maplibregl.GeoJSONSource).setData(
        flowGeoJSON
      );
    } else {
      map.addSource(FLOW_SOURCE, { type: "geojson", data: flowGeoJSON });
    }

    if (map.getSource(ORIGIN_SOURCE)) {
      (map.getSource(ORIGIN_SOURCE) as maplibregl.GeoJSONSource).setData(
        originGeoJSON
      );
    } else {
      map.addSource(ORIGIN_SOURCE, { type: "geojson", data: originGeoJSON });
    }

    if (!layersAddedRef.current) {
      map.addLayer({
        id: FLOW_LAYER,
        type: "line",
        source: FLOW_SOURCE,
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-opacity": 0.6,
        },
      });

      map.addLayer({
        id: ORIGIN_LAYER,
        type: "circle",
        source: ORIGIN_SOURCE,
        paint: {
          "circle-radius": ["get", "radius"],
          "circle-color": "#3b82f6",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.7,
        },
      });

      // Tooltip on hover
      map.on("mouseenter", ORIGIN_LAYER, (e) => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", ORIGIN_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });

      layersAddedRef.current = true;
    }
  }, [map, flows, selectedVisa]);

  useEffect(() => {
    if (!map || !layersAddedRef.current) return;
    const vis = visible ? "visible" : "none";
    for (const id of [FLOW_LAYER, ORIGIN_LAYER]) {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    }
  }, [map, visible]);

  if (!visible) return null;
  return null; // Purely map-rendered layer
}
