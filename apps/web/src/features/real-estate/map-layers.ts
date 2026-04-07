/**
 * Map layer definitions for the Real Estate module.
 * These are consumed by the LayerManager (Agent 3) to render overlays on MapLibre.
 */
import type { PriceHeatmapPoint, PropertyListing } from "@ozpulse/shared";
import { PRICE_HEATMAP_COLORS } from "./lib/constants";

/**
 * Convert heatmap points to a GeoJSON FeatureCollection for the price $/m² choropleth.
 */
export function heatmapToGeoJSON(points: PriceHeatmapPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.lng, p.lat],
      },
      properties: {
        postcode: p.postcode,
        suburb: p.suburb,
        medianPricePerSqm: p.medianPricePerSqm,
        medianPrice: p.medianPrice,
        sampleSize: p.sampleSize,
        color: priceToColor(p.medianPricePerSqm),
      },
    })),
  };
}

/**
 * Convert listings to GeoJSON pins.
 */
export function listingsToGeoJSON(listings: PropertyListing[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: listings.map((l) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [l.lng, l.lat],
      },
      properties: {
        id: l.id,
        address: l.address,
        suburb: l.suburb,
        postcode: l.postcode,
        priceAud: l.priceAud,
        propertyType: l.propertyType,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        daysOnMarket: l.daysOnMarket,
        listingType: l.listingType,
      },
    })),
  };
}

/**
 * Map price per sqm to a color for the heatmap.
 */
function priceToColor(pricePerSqm: number): string {
  if (pricePerSqm < 400) return PRICE_HEATMAP_COLORS.veryLow;
  if (pricePerSqm < 600) return PRICE_HEATMAP_COLORS.low;
  if (pricePerSqm < 900) return PRICE_HEATMAP_COLORS.medium;
  if (pricePerSqm < 1200) return PRICE_HEATMAP_COLORS.high;
  return PRICE_HEATMAP_COLORS.veryHigh;
}

/**
 * MapLibre source definitions for the real estate layer.
 */
export function getMapSources(
  heatmapPoints: PriceHeatmapPoint[],
  listings: PropertyListing[]
) {
  return {
    "real-estate-heatmap": {
      type: "geojson" as const,
      data: heatmapToGeoJSON(heatmapPoints),
    },
    "real-estate-listings": {
      type: "geojson" as const,
      data: listingsToGeoJSON(listings),
    },
  };
}

/**
 * MapLibre layer style definitions for the real estate layer.
 * These follow the MapLibre Style Spec.
 */
export function getMapLayers() {
  return [
    // Price heatmap circles (suburb-level)
    {
      id: "real-estate-heatmap-circles",
      type: "circle",
      source: "real-estate-heatmap",
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4, 6,
          8, 12,
          12, 20,
        ],
        "circle-color": ["get", "color"],
        "circle-opacity": 0.7,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    },
    // Price labels on heatmap
    {
      id: "real-estate-heatmap-labels",
      type: "symbol",
      source: "real-estate-heatmap",
      minzoom: 8,
      layout: {
        "text-field": [
          "concat",
          "$",
          ["to-string", ["get", "medianPricePerSqm"]],
          "/m²",
        ],
        "text-size": 10,
        "text-offset": [0, 1.5],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#374151",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1,
      },
    },
    // Individual listing pins (visible at higher zoom)
    {
      id: "real-estate-listing-pins",
      type: "circle",
      source: "real-estate-listings",
      minzoom: 10,
      paint: {
        "circle-radius": 5,
        "circle-color": "#22c55e",
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
      },
    },
    // Listing price labels
    {
      id: "real-estate-listing-labels",
      type: "symbol",
      source: "real-estate-listings",
      minzoom: 13,
      layout: {
        "text-field": [
          "concat",
          "$",
          [
            "to-string",
            [
              "round",
              ["/", ["get", "priceAud"], 1000],
            ],
          ],
          "k",
        ],
        "text-size": 10,
        "text-offset": [0, 1.2],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#166534",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1,
      },
    },
  ];
}
