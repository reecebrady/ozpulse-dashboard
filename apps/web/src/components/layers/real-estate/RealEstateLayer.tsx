"use client";

/**
 * RealEstateLayer -- Main layer component for the Real Estate & Housing module.
 *
 * When enabled:
 * - Renders a $/m2 heatmap across Australian postcodes via LayerManager
 * - Colour gradient: green (cheap) -> yellow (median) -> red (expensive)
 * - Marker clusters for individual listings at higher zoom levels
 * - Populates the detail panel with SuburbStatsPanel content
 */

import { useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLayerManager } from "@/components/map/LayerManager";
import { useMapStore } from "@/stores/map-store";
import { useUserProfileStore } from "@/stores/user-profile";
import { SuburbStatsCard } from "@/features/real-estate/components/suburb-stats-card";
import { MortgageCalculator } from "@/features/real-estate/components/mortgage-calculator";
import type { PriceHeatmapPoint, PropertyListing } from "@ozpulse/shared";

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

/** Maps a price-per-sqm value to a colour on the green-yellow-red gradient */
function priceToColor(pricePerSqm: number): string {
  // Under $4,000/sqm = green, ~$8,000 = yellow, $12,000+ = red
  const MIN = 3_000;
  const MID = 8_000;
  const MAX = 14_000;

  const clamped = Math.max(MIN, Math.min(MAX, pricePerSqm));

  if (clamped <= MID) {
    // Green to yellow
    const t = (clamped - MIN) / (MID - MIN);
    const r = Math.round(34 + t * (234 - 34));
    const g = Math.round(197 + t * (179 - 197));
    const b = Math.round(94 + t * (8 - 94));
    return `rgb(${r},${g},${b})`;
  }
  // Yellow to red
  const t = (clamped - MID) / (MAX - MID);
  const r = Math.round(234 + t * (239 - 234));
  const g = Math.round(179 - t * 179);
  const b = Math.round(8 - t * 8);
  return `rgb(${r},${g},${b})`;
}

function priceToRadius(sampleSize: number): number {
  return Math.max(6, Math.min(20, 6 + Math.sqrt(sampleSize) * 1.5));
}

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

interface HeatmapResponse {
  points: PriceHeatmapPoint[];
  lastUpdated: string;
}

interface ListingsResponse {
  listings: PropertyListing[];
  total: number;
  lastUpdated: string;
}

function useHeatmap(enabled: boolean) {
  return useQuery<HeatmapResponse>({
    queryKey: ["real-estate", "heatmap"],
    queryFn: async () => {
      const res = await fetch("/api/real-estate/heatmap");
      if (!res.ok) throw new Error("Failed to fetch heatmap");
      return res.json();
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour for stats
    refetchInterval: 60 * 60 * 1000,
  });
}

function useListingsForRegion(postcode: string, enabled: boolean) {
  return useQuery<ListingsResponse>({
    queryKey: ["real-estate", "listings", postcode],
    queryFn: async () => {
      const res = await fetch(`/api/real-estate/listings?postcode=${postcode}&limit=50`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
    enabled: enabled && /^\d{4}$/.test(postcode),
    staleTime: 5 * 60 * 1000, // 5 min for listings
    refetchInterval: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface RealEstateLayerProps {
  enabled: boolean;
}

export default function RealEstateLayer({ enabled }: RealEstateLayerProps) {
  const { registerOverlay, removeOverlay } = useLayerManager();
  const zoom = useMapStore((s) => s.view.zoom);
  const profile = useUserProfileStore((s: { profile: { postcode: string } }) => s.profile);
  const userPostcode = profile?.postcode ?? "2000";

  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmap(enabled);
  const { data: listingsData, isLoading: listingsLoading } = useListingsForRegion(
    userPostcode,
    enabled && zoom >= 10,
  );

  // Build GeoJSON for heatmap overlay
  const heatmapGeoJson = useMemo(() => {
    if (!heatmapData?.points) return null;

    return {
      type: "FeatureCollection" as const,
      features: heatmapData.points.map((point) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [point.lng, point.lat],
        },
        properties: {
          postcode: point.postcode,
          suburb: point.suburb,
          medianPricePerSqm: point.medianPricePerSqm,
          medianPrice: point.medianPrice,
          sampleSize: point.sampleSize,
          color: priceToColor(point.medianPricePerSqm),
          radius: priceToRadius(point.sampleSize),
        },
      })),
    };
  }, [heatmapData]);

  // Build GeoJSON for listing markers
  const listingsGeoJson = useMemo(() => {
    if (!listingsData?.listings) return null;

    return {
      type: "FeatureCollection" as const,
      features: listingsData.listings.map((listing) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [listing.lng, listing.lat],
        },
        properties: {
          id: listing.id,
          address: listing.address,
          priceAud: listing.priceAud,
          pricePerSqm: listing.pricePerSqm,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          propertyType: listing.propertyType,
          daysOnMarket: listing.daysOnMarket,
          suburb: listing.suburb,
        },
      })),
    };
  }, [listingsData]);

  // Register/update the heatmap overlay
  useEffect(() => {
    if (!enabled) {
      removeOverlay("real-estate-heatmap");
      removeOverlay("real-estate-listings");
      return;
    }

    if (heatmapGeoJson) {
      registerOverlay({
        id: "real-estate-heatmap",
        type: "geojson",
        data: heatmapGeoJson,
        visible: true,
        zIndex: 20,
      });
    }

    return () => {
      removeOverlay("real-estate-heatmap");
    };
  }, [enabled, heatmapGeoJson, registerOverlay, removeOverlay]);

  // Register listing markers at higher zoom
  useEffect(() => {
    if (!enabled || zoom < 10) {
      removeOverlay("real-estate-listings");
      return;
    }

    if (listingsGeoJson) {
      registerOverlay({
        id: "real-estate-listings",
        type: "markers",
        data: listingsGeoJson,
        visible: true,
        zIndex: 25,
      });
    }

    return () => {
      removeOverlay("real-estate-listings");
    };
  }, [enabled, zoom, listingsGeoJson, registerOverlay, removeOverlay]);

  if (!enabled) return null;

  return (
    <div className="space-y-4 p-3">
      {/* Layer title */}
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <h3 className="text-sm font-semibold">Real Estate & Housing</h3>
      </div>

      {/* Loading state */}
      {(heatmapLoading || listingsLoading) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading property data...
        </div>
      )}

      {/* Heatmap legend */}
      <div className="rounded-md border border-border bg-muted/50 p-2">
        <p className="mb-1 text-xs font-medium text-muted-foreground">$/m2 Heatmap</p>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">$3k</span>
          <div
            className="h-2 flex-1 rounded-sm"
            style={{
              background: "linear-gradient(to right, #22c55e, #eab308, #ef4444)",
            }}
          />
          <span className="text-[10px] text-muted-foreground">$14k+</span>
        </div>
      </div>

      {/* Stats count */}
      {heatmapData && (
        <p className="text-xs text-muted-foreground">
          {heatmapData.points.length} suburbs tracked
          {listingsData && zoom >= 10 && ` | ${listingsData.total} listings near ${userPostcode}`}
        </p>
      )}

      {/* Mortgage Calculator */}
      <MortgageCalculator />
    </div>
  );
}
