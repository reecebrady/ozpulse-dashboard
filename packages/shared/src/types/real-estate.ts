import { z } from "zod";

// --- Property Listing ---

export const PropertyTypeSchema = z.enum([
  "house",
  "apartment",
  "townhouse",
  "unit",
  "land",
  "villa",
]);
export type PropertyType = z.infer<typeof PropertyTypeSchema>;

export const PropertyListingSchema = z.object({
  id: z.string(),
  address: z.string(),
  suburb: z.string(),
  postcode: z.string().regex(/^\d{4}$/),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  priceAud: z.number().nonnegative(),
  pricePerSqm: z.number().nonnegative().optional(),
  landAreaSqm: z.number().positive().optional(),
  floorAreaSqm: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  carSpaces: z.number().int().nonnegative().optional(),
  propertyType: PropertyTypeSchema,
  listingType: z.enum(["sale", "auction", "rent"]),
  daysOnMarket: z.number().int().nonnegative(),
  rentalYieldPercent: z.number().optional(),
  auctionDate: z.string().optional(),
  soldDate: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  agentName: z.string().optional(),
  description: z.string().optional(),
});
export type PropertyListing = z.infer<typeof PropertyListingSchema>;

// --- Suburb Stats ---

export const SuburbStatsSchema = z.object({
  suburb: z.string(),
  postcode: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  medianPriceHouse: z.number().optional(),
  medianPriceApartment: z.number().optional(),
  medianPricePerSqm: z.number().optional(),
  medianDaysOnMarket: z.number().optional(),
  auctionClearanceRate: z.number().min(0).max(100).optional(),
  totalListings: z.number().int().nonnegative(),
  totalSales12Months: z.number().int().nonnegative(),
  rentalYieldMedian: z.number().optional(),
  priceChangePercent12m: z.number().optional(),
  priceChangePercent5y: z.number().optional(),
  population: z.number().optional(),
});
export type SuburbStats = z.infer<typeof SuburbStatsSchema>;

// --- Price Heatmap Point ---

export const PriceHeatmapPointSchema = z.object({
  postcode: z.string(),
  suburb: z.string(),
  lat: z.number(),
  lng: z.number(),
  medianPricePerSqm: z.number(),
  medianPrice: z.number(),
  sampleSize: z.number().int(),
  propertyType: PropertyTypeSchema.optional(),
});
export type PriceHeatmapPoint = z.infer<typeof PriceHeatmapPointSchema>;

// --- Comparable Sale ---

export const ComparableSaleSchema = z.object({
  id: z.string(),
  address: z.string(),
  suburb: z.string(),
  postcode: z.string(),
  lat: z.number(),
  lng: z.number(),
  soldPriceAud: z.number(),
  soldDate: z.string(),
  pricePerSqm: z.number().optional(),
  bedrooms: z.number().int(),
  bathrooms: z.number().int(),
  propertyType: PropertyTypeSchema,
  landAreaSqm: z.number().optional(),
  distanceKm: z.number().optional(),
});
export type ComparableSale = z.infer<typeof ComparableSaleSchema>;

// --- Mortgage Calculator ---

export const MortgageInputSchema = z.object({
  propertyValue: z.number().positive(),
  loanRemaining: z.number().nonnegative(),
  remainingTermYears: z.number().min(1).max(30),
  interestRate: z.number().min(0).max(20),
  netWorth: z.number().default(550000),
});
export type MortgageInput = z.infer<typeof MortgageInputSchema>;

export interface MortgageCalculation {
  currentEquity: number;
  currentLtv: number;
  monthlyRepayment: number;
  totalInterest: number;
  equityAfterPriceChange: (changePercent: number) => number;
  ltvAfterPriceChange: (changePercent: number) => number;
  refinanceCapacity: number;
  stampDutyEstimate: number;
}

// --- Price Index ---

export const PriceIndexPointSchema = z.object({
  period: z.string(), // YYYY-MM
  medianPrice: z.number(),
  pricePerSqm: z.number().optional(),
  indexValue: z.number(), // 100 = baseline
  volume: z.number().int().optional(),
});
export type PriceIndexPoint = z.infer<typeof PriceIndexPointSchema>;

export interface PriceIndexSeries {
  region: string;
  propertyType: PropertyType | "all";
  dataPoints: PriceIndexPoint[];
  baselinePeriod: string;
}

// --- Testimony/Forum Summary ---

export interface TestimonySummary {
  suburb: string;
  postcode: string;
  sentiment: "positive" | "neutral" | "negative";
  themes: string[];
  sampleQuotes: string[];
  sourcesCount: number;
  lastUpdated: string;
}

// --- Valuation Estimate ---

export interface ValuationEstimate {
  address: string;
  postcode: string;
  estimatedValueAud: number;
  confidenceLow: number;
  confidenceHigh: number;
  lastSoldPrice: number | null;
  lastSoldDate: string | null;
  comparablesUsed: number;
  methodology: string;
}

// --- Stamp Duty by State ---

export const AU_STATES = [
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "ACT",
  "NT",
] as const;
export type AuState = (typeof AU_STATES)[number];

// --- API Response Wrappers ---

export interface RealEstateLayerData {
  heatmapPoints: PriceHeatmapPoint[];
  suburbStats: SuburbStats[];
  listings: PropertyListing[];
  lastUpdated: string;
}

export interface SuburbDetailData {
  stats: SuburbStats;
  listings: PropertyListing[];
  comparables: ComparableSale[];
  priceHistory: PriceIndexSeries;
  testimonies: TestimonySummary[];
  valuation: ValuationEstimate | null;
}
