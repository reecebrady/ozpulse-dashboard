"use client";

import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@ozpulse/shared";
import {
  fetchMigrationByPostcode,
  fetchNationalMigrationHeatmap,
  fetchMigrationFlows,
  fetchMigrationTrends,
} from "../api";

export function useMigrationByPostcode(postcode: string | undefined) {
  return useQuery({
    queryKey: ["immigration", "postcode", postcode],
    queryFn: () => fetchMigrationByPostcode(postcode!),
    enabled: !!postcode,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
    refetchInterval: REFRESH_INTERVALS.DEMOGRAPHICS,
  });
}

export function useMigrationHeatmap() {
  return useQuery({
    queryKey: ["immigration", "heatmap"],
    queryFn: fetchNationalMigrationHeatmap,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
    refetchInterval: REFRESH_INTERVALS.DEMOGRAPHICS,
  });
}

export function useMigrationFlows() {
  return useQuery({
    queryKey: ["immigration", "flows"],
    queryFn: fetchMigrationFlows,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
  });
}

export function useMigrationTrends(
  postcode: string | undefined,
  quarters: number = 8
) {
  return useQuery({
    queryKey: ["immigration", "trends", postcode, quarters],
    queryFn: () => fetchMigrationTrends(postcode!, quarters),
    enabled: !!postcode,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
  });
}
