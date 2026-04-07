/**
 * Re-export all real estate types from shared package for convenience.
 * Feature-local types that don't belong in the shared package go here.
 */
export type {
  PropertyListing,
  PropertyType,
  SuburbStats,
  PriceHeatmapPoint,
  ComparableSale,
  MortgageInput,
  MortgageCalculation,
  PriceIndexPoint,
  PriceIndexSeries,
  TestimonySummary,
  ValuationEstimate,
  AuState,
  RealEstateLayerData,
  SuburbDetailData,
} from "@ozpulse/shared";
