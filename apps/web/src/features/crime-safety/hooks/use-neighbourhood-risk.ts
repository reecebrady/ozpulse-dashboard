"use client";

import { useMemo } from "react";
import { useCrimeByPostcode } from "./use-crime-data";
import { useSchoolSafety } from "./use-school-safety";
import type { DashboardWidgets } from "@ozpulse/shared";

/**
 * Computes the neighbourhood risk score for the top-bar widget.
 * Score 0-100: lower is safer.
 * Weights: crime index (60%), school safety inverse (20%), trend momentum (20%).
 */
export function useNeighbourhoodRisk(
  postcode: string | undefined,
  schoolPostcodes: string[]
): {
  data: DashboardWidgets["neighbourhoodRisk"] | null;
  isLoading: boolean;
} {
  const crimeQuery = useCrimeByPostcode(postcode);
  const schoolQuery = useSchoolSafety(
    schoolPostcodes.length > 0 ? schoolPostcodes[0] : undefined
  );

  const data = useMemo(() => {
    if (!crimeQuery.data) return null;

    const crimeIndex = crimeQuery.data.crimeIndex;

    // Average school safety (inverted: high safety = low risk contribution)
    const schoolScores = schoolQuery.data?.map((s) => s.safetyScore) ?? [];
    const avgSchoolSafety =
      schoolScores.length > 0
        ? schoolScores.reduce((a, b) => a + b, 0) / schoolScores.length
        : 50;
    const schoolRisk = 100 - avgSchoolSafety;

    // Trend momentum: positive change = increasing risk
    const trendMomentum = Math.max(
      0,
      Math.min(100, 50 + crimeQuery.data.trendChangePercent * 2)
    );

    const score = Math.round(
      crimeIndex * 0.6 + schoolRisk * 0.2 + trendMomentum * 0.2
    );

    // Determine top concern from category with highest upward trend
    const categories = Object.entries(crimeQuery.data.byCategory);
    const topConcern = categories.reduce(
      (worst, [cat, data]) => {
        if (data.changePercent > worst.change) {
          return { category: cat, change: data.changePercent };
        }
        return worst;
      },
      { category: "stable", change: -Infinity }
    );

    return {
      score: Math.min(100, Math.max(0, score)),
      trend: crimeQuery.data.trend,
      topConcern:
        topConcern.change > 0
          ? `${topConcern.category} +${topConcern.change}%`
          : "All categories stable",
    };
  }, [crimeQuery.data, schoolQuery.data]);

  return {
    data,
    isLoading: crimeQuery.isLoading,
  };
}
