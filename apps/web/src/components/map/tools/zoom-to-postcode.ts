/**
 * Zoom-to-Postcode Tool -- search an Australian postcode and fly to it.
 *
 * Uses a local lookup table of postcode centroids (loaded lazily).
 * Falls back to Nominatim geocoding for unknown postcodes.
 */

import type maplibregl from "maplibre-gl";

// --- Australian postcode centroid data ---
// Subset of major postcodes for instant lookup. Covers all capital cities and
// major regional centres. Full dataset can be loaded from API.

const POSTCODE_CENTROIDS: Record<string, [number, number]> = {
  // Sydney CBD and surrounds
  "2000": [151.2093, -33.8688],
  "2010": [151.2155, -33.8785],
  "2020": [151.2005, -33.9020],
  "2040": [151.1571, -33.8688],
  "2060": [151.2082, -33.8339],
  "2100": [151.2356, -33.7688],
  "2150": [150.9885, -33.8148],
  "2170": [150.9263, -33.9162],
  "2200": [151.1018, -33.9344],
  "2250": [151.3435, -33.4245],
  // Melbourne
  "3000": [144.9631, -37.8136],
  "3004": [144.9767, -37.8379],
  "3053": [144.9665, -37.8000],
  "3121": [145.0036, -37.8226],
  "3141": [145.0198, -37.8506],
  "3182": [144.9849, -37.8649],
  // Brisbane
  "4000": [153.0260, -27.4698],
  "4005": [153.0451, -27.4525],
  "4059": [152.9927, -27.4433],
  "4101": [153.0154, -27.4816],
  "4170": [153.0906, -27.4627],
  // Perth
  "6000": [115.8613, -31.9505],
  "6005": [115.8369, -31.9479],
  "6050": [115.8684, -31.9191],
  "6100": [115.8940, -31.9697],
  "6150": [115.8468, -32.0421],
  // Adelaide
  "5000": [138.6007, -34.9285],
  "5006": [138.5882, -34.9192],
  "5031": [138.5524, -34.9207],
  "5063": [138.6240, -34.9434],
  // Hobart
  "7000": [147.3272, -42.8821],
  "7004": [147.3262, -42.8966],
  "7005": [147.3369, -42.8960],
  // Canberra
  "2600": [149.1300, -35.2809],
  "2601": [149.1244, -35.2777],
  "2602": [149.1333, -35.2529],
  "2604": [149.1399, -35.3076],
  "2612": [149.1403, -35.2581],
  "2615": [149.0607, -35.2354],
  // Darwin
  "0800": [130.8456, -12.4634],
  "0810": [130.8765, -12.4284],
  "0820": [130.9065, -12.4119],
  // Gold Coast
  "4217": [153.4254, -28.0031],
  "4218": [153.4367, -28.0300],
  // Sunshine Coast
  "4551": [153.1144, -26.6897],
  "4556": [153.0738, -26.6633],
  // Newcastle
  "2300": [151.7817, -32.9267],
  "2305": [151.7578, -32.9120],
  // Wollongong
  "2500": [150.8931, -34.4278],
  // Geelong
  "3220": [144.3518, -38.1477],
  // Cairns
  "4870": [145.7781, -16.9186],
  // Townsville
  "4810": [146.7888, -19.2589],
  // Alice Springs
  "0870": [133.8807, -23.6980],
  // Broome
  "6725": [122.2364, -17.9614],
  // Broken Hill
  "2880": [141.4529, -31.9505],
  // Kalgoorlie
  "6430": [121.4736, -30.7489],
  // Mount Isa
  "4825": [139.4927, -20.7264],
};

export interface ZoomToPostcodeOptions {
  /** Zoom level to fly to (default 13) */
  zoom?: number;
  /** Animation duration in ms (default 2000) */
  duration?: number;
  /** Pitch angle (default 0) */
  pitch?: number;
  /** Callback with the resolved coordinates */
  onResolved?: (postcode: string, lngLat: [number, number]) => void;
  /** Callback if postcode not found */
  onNotFound?: (postcode: string) => void;
}

/**
 * Fly to an Australian postcode on the map.
 * First checks the local lookup table, then falls back to Nominatim geocoding.
 */
export async function zoomToPostcode(
  map: maplibregl.Map,
  postcode: string,
  options: ZoomToPostcodeOptions = {}
): Promise<boolean> {
  const {
    zoom = 13,
    duration = 2000,
    pitch = 0,
    onResolved,
    onNotFound,
  } = options;

  const normalized = postcode.trim().padStart(4, "0");

  // Check local lookup first
  const local = POSTCODE_CENTROIDS[normalized];
  if (local) {
    map.flyTo({
      center: local,
      zoom,
      pitch,
      duration,
      essential: true,
    });
    onResolved?.(normalized, local);
    return true;
  }

  // Fallback: Nominatim geocoding
  try {
    const lngLat = await geocodePostcode(normalized);
    if (lngLat) {
      map.flyTo({
        center: lngLat,
        zoom,
        pitch,
        duration,
        essential: true,
      });
      onResolved?.(normalized, lngLat);
      return true;
    }
  } catch {
    // Geocoding failed, fall through
  }

  onNotFound?.(normalized);
  return false;
}

/**
 * Geocode an Australian postcode using Nominatim (OpenStreetMap).
 * Rate limited: do not call in rapid succession.
 */
async function geocodePostcode(
  postcode: string
): Promise<[number, number] | null> {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&country=Australia&format=json&limit=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "OzPulse-Dashboard/0.1" },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const { lon, lat } = data[0];
  return [parseFloat(lon), parseFloat(lat)];
}

/**
 * Get the centroid for a postcode from the local lookup.
 * Returns null if not in the local table.
 */
export function getPostcodeCentroid(
  postcode: string
): [number, number] | null {
  const normalized = postcode.trim().padStart(4, "0");
  return POSTCODE_CENTROIDS[normalized] ?? null;
}

/**
 * Check if a string is a valid 4-digit Australian postcode format.
 */
export function isValidPostcode(value: string): boolean {
  return /^\d{4}$/.test(value.trim());
}
