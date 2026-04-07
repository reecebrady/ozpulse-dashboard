"use client";

import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@ozpulse/shared";
import { fetchSchoolSafety, fetchSchoolsByRadius } from "../api";

export function useSchoolSafety(postcode: string | undefined) {
  return useQuery({
    queryKey: ["crime", "schools", postcode],
    queryFn: () => fetchSchoolSafety(postcode!),
    enabled: !!postcode,
    staleTime: REFRESH_INTERVALS.CRIME,
  });
}

export function useSchoolsByRadius(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm: number = 5
) {
  return useQuery({
    queryKey: ["crime", "schools", "radius", lat, lng, radiusKm],
    queryFn: () => fetchSchoolsByRadius(lat!, lng!, radiusKm),
    enabled: lat != null && lng != null,
    staleTime: REFRESH_INTERVALS.CRIME,
  });
}
