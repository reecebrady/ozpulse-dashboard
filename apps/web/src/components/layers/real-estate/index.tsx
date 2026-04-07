"use client";

/**
 * Real Estate & Housing Layer
 * Agent 5 — Plugs into the LayerManager and dashboard layout.
 *
 * Follows the layer template pattern:
 * 1. Exports LayerPanel for sidebar/detail content
 * 2. Exports getMapSources() for GeoJSON data
 * 3. Exports getMapLayers() for MapLibre style definitions
 * 4. Uses TanStack Query for data fetching
 * 5. Registers equity alerts via shared alert system
 */

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LayerId } from "@ozpulse/shared";
import { useLayerManager } from "@/components/map/LayerManager";
import { useUserProfile } from "@/stores/user-profile";
import { useMapStore } from "@/stores/map-store";
import {
  RealEstateLayerPanel,
  useHeatmapData,
  useEquityWidget,
  getMapSources,
  getMapLayers,
} from "@/features/real-estate";
import type { MortgageInput, PropertyListing } from "@ozpulse/shared";

export const LAYER_ID: LayerId = "real-estate";

export interface RealEstateLayerProps {
  enabled: boolean;
  userPostcode: string;
}

export default function RealEstateLayer({
  enabled,
  userPostcode,
}: RealEstateLayerProps) {
  const { registerOverlay, removeOverlay } = useLayerManager();
  const profile = useUserProfile((s) => s.profile);
  const { setDetailPanel, addAlert } = useMapStore();

  const postcode = userPostcode || profile?.postcode || "2150";

  // Mortgage defaults from user profile
  const mortgageInput: MortgageInput | null = useMemo(() => {
    if (!profile?.mortgageDetails) return null;
    return {
      propertyValue: profile.mortgageDetails.propertyValue,
      loanRemaining: profile.mortgageDetails.loanRemaining,
      remainingTermYears: profile.mortgageDetails.remainingTermYears,
      interestRate: profile.mortgageDetails.interestRate,
      netWorth: profile.mortgageDetails.netWorth ?? 550000,
    };
  }, [profile]);

  // Equity widget for top bar
  const equityWidget = useEquityWidget(mortgageInput, postcode);

  // Heatmap data
  const { data: heatmapData } = useHeatmapData(enabled);

  // Register map overlays when layer is enabled
  useEffect(() => {
    if (!enabled) {
      removeOverlay("real-estate-heatmap");
      removeOverlay("real-estate-listings");
      return;
    }

    if (heatmapData?.points) {
      const sources = getMapSources(heatmapData.points, []);
      registerOverlay({
        id: "real-estate-heatmap",
        type: "geojson",
        data: {
          sources,
          layers: getMapLayers(),
        },
        visible: true,
        zIndex: 10,
      });
    }
  }, [enabled, heatmapData, registerOverlay, removeOverlay]);

  // Fire alert if suburb underperforms significantly
  useEffect(() => {
    if (!enabled || equityWidget.isLoading || equityWidget.trend !== "down") return;

    addAlert({
      id: `real-estate-equity-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: "warning",
      category: "property",
      title: "Property values declining",
      message: `Your postcode ${postcode} has seen ${equityWidget.equityChange} property value change in the last 12 months.`,
      postcode,
      layerId: LAYER_ID,
      dismissed: false,
    });
  }, [enabled, equityWidget.trend]);

  if (!enabled) return null;

  function handleListingClick(listing: PropertyListing) {
    setDetailPanel({
      title: listing.address,
      layerId: LAYER_ID,
      content: {
        type: "listing",
        ...listing,
      },
    });
  }

  return (
    <RealEstateLayerPanel
      postcode={postcode}
      enabled={enabled}
      mortgageDefaults={
        mortgageInput ?? {
          propertyValue: 750000,
          loanRemaining: 450000,
          remainingTermYears: 15,
          interestRate: 6.5,
          netWorth: 550000,
        }
      }
      state={(profile?.pinnedLocations?.home?.postcode?.startsWith("2") ? "NSW" : "VIC") as any}
      onListingClick={handleListingClick}
    />
  );
}
