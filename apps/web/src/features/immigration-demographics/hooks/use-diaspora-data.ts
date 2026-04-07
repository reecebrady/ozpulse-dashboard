"use client";

import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@ozpulse/shared";
import { fetchDiasporaByPostcode, fetchDiasporaHeatmap, fetchWorkforceShifts } from "../api";

export function useDiasporaByPostcode(postcode: string | undefined) {
  return useQuery({
    queryKey: ["diaspora", "postcode", postcode],
    queryFn: () => fetchDiasporaByPostcode(postcode!),
    enabled: !!postcode,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
  });
}

export function useDiasporaHeatmap(state?: string) {
  return useQuery({
    queryKey: ["diaspora", "heatmap", state],
    queryFn: () => fetchDiasporaHeatmap(state),
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
  });
}

export function useWorkforceShifts(
  sa4Code?: string,
  governmentOnly?: boolean
) {
  return useQuery({
    queryKey: ["workforce", "shifts", sa4Code, governmentOnly],
    queryFn: () => fetchWorkforceShifts(sa4Code, governmentOnly),
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
  });
}
