"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@ozpulse/shared";
import { REFRESH_INTERVALS } from "@ozpulse/shared";
import { fetchABSCrimeByPostcode } from "../api";
import type { CrimeAlertConfig, PostcodeCrimeSummary } from "../types";

export function useCrimeAlerts(config: CrimeAlertConfig | undefined) {
  const previousIndexRef = useRef<number | null>(null);

  const postcodeQuery = useQuery({
    queryKey: ["crime", "alerts", config?.postcode],
    queryFn: () => fetchABSCrimeByPostcode(config!.postcode),
    enabled: !!config?.postcode,
    staleTime: REFRESH_INTERVALS.CRIME,
    refetchInterval: REFRESH_INTERVALS.CRIME,
  });

  const schoolQueries = useQuery({
    queryKey: ["crime", "alerts", "schools", config?.schoolPostcodes],
    queryFn: async () => {
      if (!config?.schoolPostcodes.length) return [];
      const results = await Promise.all(
        config.schoolPostcodes.map(fetchABSCrimeByPostcode)
      );
      return results.filter(Boolean) as PostcodeCrimeSummary[];
    },
    enabled: !!config?.schoolPostcodes.length,
    staleTime: REFRESH_INTERVALS.CRIME,
    refetchInterval: REFRESH_INTERVALS.CRIME,
  });

  const alerts: Alert[] = [];

  if (postcodeQuery.data && config) {
    const { crimeIndex, trend, trendChangePercent, byCategory } =
      postcodeQuery.data;

    if (crimeIndex > config.crimeIndexThreshold) {
      const categories = Object.entries(byCategory)
        .filter(([, v]) => v.trend === "up")
        .map(([k]) => k);

      alerts.push({
        id: `crime-threshold-${config.postcode}`,
        layerId: "crime-safety",
        severity: crimeIndex > config.crimeIndexThreshold + 15 ? "critical" : "warning",
        title: `Crime index above threshold in ${config.postcode}`,
        message: `Crime index at ${crimeIndex} (threshold: ${config.crimeIndexThreshold}). ${
          categories.length > 0
            ? `Rising categories: ${categories.join(", ")}.`
            : ""
        } Overall trend: ${trend} (${trendChangePercent > 0 ? "+" : ""}${trendChangePercent}%).`,
        postcode: config.postcode,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (
      previousIndexRef.current !== null &&
      crimeIndex > previousIndexRef.current + 5
    ) {
      alerts.push({
        id: `crime-spike-${config.postcode}-${Date.now()}`,
        layerId: "crime-safety",
        severity: "warning",
        title: `Crime index spike in ${config.postcode}`,
        message: `Crime index jumped from ${previousIndexRef.current} to ${crimeIndex}.`,
        postcode: config.postcode,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
    previousIndexRef.current = crimeIndex;
  }

  if (schoolQueries.data && config) {
    for (const schoolData of schoolQueries.data) {
      if (schoolData.crimeIndex > config.crimeIndexThreshold) {
        alerts.push({
          id: `crime-school-${schoolData.postcode}`,
          layerId: "crime-safety",
          severity: "warning",
          title: `High crime near school catchment ${schoolData.postcode}`,
          message: `Crime index ${schoolData.crimeIndex} in school catchment area ${schoolData.sa3Name}.`,
          postcode: schoolData.postcode,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }
  }

  return {
    alerts,
    isLoading: postcodeQuery.isLoading || schoolQueries.isLoading,
    error: postcodeQuery.error || schoolQueries.error,
  };
}
