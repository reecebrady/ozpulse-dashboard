"use client";

import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@ozpulse/shared";
import {
  fetchABSCrimeByPostcode,
  fetchNationalCrimeHeatmap,
  fetchCrimeTrends,
  fetchCrimeComparison,
} from "../api";

export function useCrimeByPostcode(postcode: string | undefined) {
  return useQuery({
    queryKey: ["crime", "postcode", postcode],
    queryFn: () => fetchABSCrimeByPostcode(postcode!),
    enabled: !!postcode,
    staleTime: REFRESH_INTERVALS.CRIME,
    refetchInterval: REFRESH_INTERVALS.CRIME,
  });
}

export function useCrimeHeatmap() {
  return useQuery({
    queryKey: ["crime", "heatmap"],
    queryFn: fetchNationalCrimeHeatmap,
    staleTime: REFRESH_INTERVALS.CRIME,
    refetchInterval: REFRESH_INTERVALS.CRIME,
  });
}

export function useCrimeTrends(
  postcode: string | undefined,
  months: number = 12
) {
  return useQuery({
    queryKey: ["crime", "trends", postcode, months],
    queryFn: () => fetchCrimeTrends(postcode!, months),
    enabled: !!postcode,
    staleTime: REFRESH_INTERVALS.CRIME,
  });
}

export function useCrimeComparison(postcode: string | undefined) {
  return useQuery({
    queryKey: ["crime", "comparison", postcode],
    queryFn: () => fetchCrimeComparison(postcode!),
    enabled: !!postcode,
    staleTime: REFRESH_INTERVALS.CRIME,
  });
}
