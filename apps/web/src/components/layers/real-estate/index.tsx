"use client";

/**
 * Real Estate & Housing Layer
 * Agent 5 — Plugs into the LayerManager and dashboard layout.
 */

import { useEffect, useMemo } from "react";
import type { LayerId } from "@ozpulse/shared";
import { useLayerManager } from "@/components/map/LayerManager";
import { useUserProfileStore } from "@/stores/user-profile";
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
  userPostcode?: string;
}

export default function RealEstateLayerComponent({
  enabled,
  userPostcode,
}: RealEstateLayerProps) {
  const { registerOverlay, removeOverlay } = useLayerManager();
  const profile = useUserProfileStore((s) => s.profile);
  const hasProfile = useUserProfileStore((s) => s.hasProfile);
  const { setDetailPanel, addAlert } = useMapStore();

  const postcode = userPostcode || (hasProfile ? profile.postcode : "") || "2150";

  // Mortgage defaults from user profile
  const mortgageInput: MortgageInput | null = useMemo(() => {
    if (!hasProfile || profile.mortgageValue <= 0) return null;
    return {
      propertyValue: profile.mortgageValue,
      loanRemaining: profile.loanRemaining,
      remainingTermYears: profile.remainingTermYears,
      interestRate: profile.interestRate,
      netWorth: profile.mortgageValue - profile.loanRemaining,
    };
  }, [hasProfile, profile]);

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
      state={postcode.startsWith("2") ? "NSW" : postcode.startsWith("3") ? "VIC" : postcode.startsWith("4") ? "QLD" : postcode.startsWith("5") ? "SA" : postcode.startsWith("6") ? "WA" : postcode.startsWith("7") ? "TAS" : "NSW"}
      onListingClick={handleListingClick}
    />
  );
}
