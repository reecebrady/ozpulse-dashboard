import { z } from "zod";

// === Visa Categories ===
export const VISA_CATEGORIES = [
  "skilled",
  "family",
  "student",
  "humanitarian",
  "working-holiday",
  "business",
  "other",
] as const;

export type VisaCategory = (typeof VISA_CATEGORIES)[number];

export const VISA_CATEGORY_LABELS: Record<VisaCategory, string> = {
  skilled: "Skilled Migration",
  family: "Family Stream",
  student: "Student Visa",
  humanitarian: "Humanitarian",
  "working-holiday": "Working Holiday",
  business: "Business/Investment",
  other: "Other",
};

export const VISA_CATEGORY_COLORS: Record<VisaCategory, string> = {
  skilled: "#3b82f6",
  family: "#10b981",
  student: "#f59e0b",
  humanitarian: "#ef4444",
  "working-holiday": "#8b5cf6",
  business: "#06b6d4",
  other: "#6b7280",
};

// === Top Source Countries ===
export const TOP_SOURCE_COUNTRIES = [
  "India",
  "China",
  "United Kingdom",
  "Philippines",
  "New Zealand",
  "Vietnam",
  "Nepal",
  "South Korea",
  "Sri Lanka",
  "Pakistan",
  "Malaysia",
  "South Africa",
  "Indonesia",
  "Bangladesh",
  "Lebanon",
  "Thailand",
  "United States",
  "Ireland",
  "Colombia",
  "Brazil",
] as const;

export type SourceCountry = (typeof TOP_SOURCE_COUNTRIES)[number];

// === Migration Data Schemas ===
export const MigrationRecordSchema = z.object({
  id: z.string(),
  sa4Code: z.string(),
  sa4Name: z.string(),
  postcode: z.string().optional(),
  state: z.string(),
  period: z.string(), // YYYY-Q[1-4]
  visaCategory: z.enum(VISA_CATEGORIES),
  sourceCountry: z.string(),
  arrivals: z.number().int().min(0),
  departures: z.number().int().min(0),
  netMovement: z.number().int(),
  lat: z.number(),
  lng: z.number(),
});

export type MigrationRecord = z.infer<typeof MigrationRecordSchema>;

export const PostcodeMigrationSummarySchema = z.object({
  postcode: z.string(),
  sa4Code: z.string(),
  sa4Name: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  totalArrivals: z.number().int(),
  totalDepartures: z.number().int(),
  netMigration: z.number().int(),
  netMigrationChangePercent: z.number(), // vs previous period
  byVisaCategory: z.record(
    z.enum(VISA_CATEGORIES),
    z.object({
      arrivals: z.number().int(),
      departures: z.number().int(),
      net: z.number().int(),
    })
  ),
  topSourceCountries: z.array(
    z.object({
      country: z.string(),
      arrivals: z.number().int(),
      percentage: z.number(),
    })
  ),
  trends: z.array(
    z.object({
      period: z.string(),
      arrivals: z.number().int(),
      departures: z.number().int(),
      net: z.number().int(),
    })
  ),
});

export type PostcodeMigrationSummary = z.infer<
  typeof PostcodeMigrationSummarySchema
>;

// === Diaspora Data ===
export const DiasporaConcentrationSchema = z.object({
  postcode: z.string(),
  suburb: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  totalPopulation: z.number().int(),
  overseasBornPercent: z.number(),
  topAncestries: z.array(
    z.object({
      country: z.string(),
      count: z.number().int(),
      percentage: z.number(),
      yearOnYearChange: z.number(),
    })
  ),
  languagesSpokenAtHome: z.array(
    z.object({
      language: z.string(),
      count: z.number().int(),
      percentage: z.number(),
    })
  ),
  englishProficiency: z.object({
    speaksOnlyEnglish: z.number(),
    speaksOtherVeryWell: z.number(),
    speaksOtherNotWell: z.number(),
    notStated: z.number(),
  }),
});

export type DiasporaConcentration = z.infer<
  typeof DiasporaConcentrationSchema
>;

// === Workforce Composition ===
export const WorkforceShiftSchema = z.object({
  sa4Code: z.string(),
  sa4Name: z.string(),
  state: z.string(),
  industry: z.string(),
  totalWorkers: z.number().int(),
  australianBornPercent: z.number(),
  overseasBornPercent: z.number(),
  yearOnYearChange: z.number(),
  topOverseasCountries: z.array(
    z.object({
      country: z.string(),
      count: z.number().int(),
      percentage: z.number(),
    })
  ),
  governmentSector: z.boolean(),
});

export type WorkforceShift = z.infer<typeof WorkforceShiftSchema>;

// === Global Migration Flow ===
export interface MigrationFlowLine {
  sourceCountry: string;
  sourceLat: number;
  sourceLng: number;
  destinationSA4: string;
  destinationLat: number;
  destinationLng: number;
  arrivals: number;
  visaCategory: VisaCategory;
}

// === Settlement Patterns ===
export const SettlementPatternSchema = z.object({
  region: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  recentArrivals: z.number().int(),
  settlerRetentionRate: z.number(), // % who stay after 5 years
  housingPressureIndex: z.number().min(0).max(100),
  medianRent: z.number(),
  rentChangePercent: z.number(),
  vacancyRate: z.number(),
});

export type SettlementPattern = z.infer<typeof SettlementPatternSchema>;

// === Demographic Alert Config ===
export interface DemographicAlertConfig {
  postcode: string;
  lgaCode: string;
  shiftThresholdPercent: number; // default 3%
  workplaceCatchmentPostcodes: string[];
  enablePush: boolean;
}

// === Country Coordinates (for global flow arrows) ===
export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> =
  {
    India: { lat: 20.5937, lng: 78.9629 },
    China: { lat: 35.8617, lng: 104.1954 },
    "United Kingdom": { lat: 55.3781, lng: -3.436 },
    Philippines: { lat: 12.8797, lng: 121.774 },
    "New Zealand": { lat: -40.9006, lng: 174.886 },
    Vietnam: { lat: 14.0583, lng: 108.2772 },
    Nepal: { lat: 28.3949, lng: 84.124 },
    "South Korea": { lat: 35.9078, lng: 127.7669 },
    "Sri Lanka": { lat: 7.8731, lng: 80.7718 },
    Pakistan: { lat: 30.3753, lng: 69.3451 },
    Malaysia: { lat: 4.2105, lng: 101.9758 },
    "South Africa": { lat: -30.5595, lng: 22.9375 },
    Indonesia: { lat: -0.7893, lng: 113.9213 },
    Bangladesh: { lat: 23.685, lng: 90.3563 },
    Lebanon: { lat: 33.8547, lng: 35.8623 },
    Thailand: { lat: 15.87, lng: 100.9925 },
    "United States": { lat: 37.0902, lng: -95.7129 },
    Ireland: { lat: 53.1424, lng: -7.6921 },
    Colombia: { lat: 4.5709, lng: -74.2973 },
    Brazil: { lat: -14.235, lng: -51.9253 },
  };

// === Australian State Info ===
export type AustralianState =
  | "NSW"
  | "VIC"
  | "QLD"
  | "WA"
  | "SA"
  | "TAS"
  | "NT"
  | "ACT";
