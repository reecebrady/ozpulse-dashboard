import { useQuery } from "@tanstack/react-query";
import type {
  PropertyListing,
  SuburbStats,
  PriceHeatmapPoint,
  ComparableSale,
  PriceIndexSeries,
  TestimonySummary,
  ValuationEstimate,
  PropertyType,
} from "@ozpulse/shared";
import { REAL_ESTATE_REFRESH_MS } from "../lib/constants";

// --- Heatmap (national) ---

interface HeatmapResponse {
  points: PriceHeatmapPoint[];
  lastUpdated: string;
}

export function useHeatmapData(enabled = true) {
  return useQuery<HeatmapResponse>({
    queryKey: ["real-estate", "heatmap"],
    queryFn: async () => {
      const res = await fetch("/api/real-estate/heatmap");
      if (!res.ok) throw new Error("Failed to fetch heatmap data");
      return res.json();
    },
    enabled,
    refetchInterval: REAL_ESTATE_REFRESH_MS,
    staleTime: REAL_ESTATE_REFRESH_MS / 2,
  });
}

// --- Listings ---

interface ListingsParams {
  postcode: string;
  propertyType?: PropertyType;
  bedrooms?: number;
  limit?: number;
}

interface ListingsResponse {
  listings: PropertyListing[];
  total: number;
  postcode: string;
  lastUpdated: string;
}

export function useListings(params: ListingsParams, enabled = true) {
  const { postcode, propertyType, bedrooms, limit } = params;

  return useQuery<ListingsResponse>({
    queryKey: ["real-estate", "listings", postcode, propertyType, bedrooms, limit],
    queryFn: async () => {
      const sp = new URLSearchParams({ postcode });
      if (propertyType) sp.set("type", propertyType);
      if (bedrooms !== undefined) sp.set("bedrooms", String(bedrooms));
      if (limit !== undefined) sp.set("limit", String(limit));

      const res = await fetch(`/api/real-estate/listings?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      return res.json();
    },
    enabled: enabled && /^\d{4}$/.test(postcode),
    refetchInterval: REAL_ESTATE_REFRESH_MS,
    staleTime: REAL_ESTATE_REFRESH_MS / 2,
  });
}

// --- Suburb Detail ---

interface SuburbResponse {
  stats: SuburbStats;
  comparables: ComparableSale[];
  testimonies: TestimonySummary[];
  valuation: ValuationEstimate;
  lastUpdated: string;
}

export function useSuburbDetail(postcode: string, enabled = true) {
  return useQuery<SuburbResponse>({
    queryKey: ["real-estate", "suburb", postcode],
    queryFn: async () => {
      const res = await fetch(`/api/real-estate/suburbs?postcode=${postcode}`);
      if (!res.ok) throw new Error("Failed to fetch suburb data");
      return res.json();
    },
    enabled: enabled && /^\d{4}$/.test(postcode),
    refetchInterval: REAL_ESTATE_REFRESH_MS,
    staleTime: REAL_ESTATE_REFRESH_MS / 2,
  });
}

// --- Price Index ---

interface PriceIndexResponse {
  suburb: PriceIndexSeries;
  national: PriceIndexSeries;
  lastUpdated: string;
}

export function usePriceIndex(postcode: string, enabled = true) {
  return useQuery<PriceIndexResponse>({
    queryKey: ["real-estate", "price-index", postcode],
    queryFn: async () => {
      const res = await fetch(`/api/real-estate/price-index?postcode=${postcode}`);
      if (!res.ok) throw new Error("Failed to fetch price index");
      return res.json();
    },
    enabled: enabled && /^\d{4}$/.test(postcode),
    refetchInterval: REAL_ESTATE_REFRESH_MS,
    staleTime: REAL_ESTATE_REFRESH_MS / 2,
  });
}

// --- Valuation ---

interface ValuationResponse {
  valuation: ValuationEstimate;
  lastUpdated: string;
}

export function useValuation(postcode: string, address?: string, enabled = true) {
  return useQuery<ValuationResponse>({
    queryKey: ["real-estate", "valuation", postcode, address],
    queryFn: async () => {
      const sp = new URLSearchParams({ postcode });
      if (address) sp.set("address", address);
      const res = await fetch(`/api/real-estate/valuation?${sp}`);
      if (!res.ok) throw new Error("Failed to fetch valuation");
      return res.json();
    },
    enabled: enabled && /^\d{4}$/.test(postcode),
    staleTime: REAL_ESTATE_REFRESH_MS,
  });
}
