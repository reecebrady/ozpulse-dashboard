/**
 * Real Estate & Housing Layer - Agent 5
 *
 * Self-contained module that provides:
 * - Price $/m² heatmap (national, by suburb)
 * - Property listings with filters
 * - Comparable recent sales
 * - Mortgage impact calculator ($550k net worth default)
 * - Community sentiment/testimony summaries
 * - Automated property valuation estimates
 * - Price index trend charts (suburb vs national)
 * - Top-bar equity widget integration
 * - MapLibre layer registration (GeoJSON sources + styles)
 *
 * Data sources (in production):
 * - Domain API for listings, sales, suburb stats
 * - CoreLogic for valuations, price index
 * - ABS for demographic/population context
 *
 * Currently uses mock data generators for development.
 */

// Components
export { RealEstateLayerPanel } from "./components/real-estate-layer-panel";
export { MortgageCalculator } from "./components/mortgage-calculator";
export { PriceIndexChart } from "./components/price-index-chart";
export { SuburbStatsCard } from "./components/suburb-stats-card";
export { ListingCard } from "./components/listing-card";
export { ComparableSaleCard } from "./components/comparable-sale-card";
export { TestimonyPanel } from "./components/testimony-panel";
export { ValuationCard } from "./components/valuation-card";
export { PriceHeatmapLegend } from "./components/price-heatmap-legend";
export { EquityWidget } from "./components/equity-widget";

// Hooks
export {
  useHeatmapData,
  useSuburbDetail,
  useListings,
  usePriceIndex,
  useValuation,
} from "./hooks/use-real-estate-data";
export { useEquityWidget } from "./hooks/use-equity-widget";

// Map integration
export {
  getMapSources,
  getMapLayers,
  heatmapToGeoJSON,
  listingsToGeoJSON,
} from "./map-layers";

// Utilities
export { calculateMortgage, calculateStampDuty, formatAud, formatPercent } from "./lib/mortgage-math";
export { REAL_ESTATE_REFRESH_MS, MAJOR_SUBURBS, PRICE_HEATMAP_COLORS } from "./lib/constants";
