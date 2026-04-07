import { z } from "zod";

// === Offence Categories ===
export const OFFENCE_CATEGORIES = [
  "violent",
  "property",
  "drug",
  "public-order",
  "traffic",
] as const;

export type OffenceCategory = (typeof OFFENCE_CATEGORIES)[number];

export const OFFENCE_CATEGORY_LABELS: Record<OffenceCategory, string> = {
  violent: "Violent (Assault, Robbery)",
  property: "Property (Theft, Burglary)",
  drug: "Drug-Related",
  "public-order": "Public Order",
  traffic: "Traffic",
};

export const OFFENCE_CATEGORY_COLORS: Record<OffenceCategory, string> = {
  violent: "#ef4444",
  property: "#f59e0b",
  drug: "#8b5cf6",
  "public-order": "#3b82f6",
  traffic: "#6b7280",
};

// === Crime Data Schemas ===
export const CrimeRecordSchema = z.object({
  id: z.string(),
  postcode: z.string(),
  sa3Code: z.string(),
  sa3Name: z.string(),
  state: z.string(),
  category: z.enum(OFFENCE_CATEGORIES),
  offenceType: z.string(),
  count: z.number().int().min(0),
  rate: z.number().min(0), // per 100,000 population
  period: z.string(), // YYYY-MM
  lat: z.number(),
  lng: z.number(),
});

export type CrimeRecord = z.infer<typeof CrimeRecordSchema>;

export const CrimeTrendPointSchema = z.object({
  period: z.string(),
  count: z.number().int().min(0),
  rate: z.number().min(0),
  changePercent: z.number(),
});

export type CrimeTrendPoint = z.infer<typeof CrimeTrendPointSchema>;

export const PostcodeCrimeSummarySchema = z.object({
  postcode: z.string(),
  sa3Code: z.string(),
  sa3Name: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  totalOffences: z.number().int(),
  totalRate: z.number(),
  crimeIndex: z.number(), // 0-100 composite score
  trend: z.enum(["up", "down", "stable"]),
  trendChangePercent: z.number(),
  byCategory: z.record(
    z.enum(OFFENCE_CATEGORIES),
    z.object({
      count: z.number().int(),
      rate: z.number(),
      trend: z.enum(["up", "down", "stable"]),
      changePercent: z.number(),
    })
  ),
  trends: z.array(CrimeTrendPointSchema),
});

export type PostcodeCrimeSummary = z.infer<typeof PostcodeCrimeSummarySchema>;

// === School Safety ===
export const SchoolSafetySchema = z.object({
  schoolId: z.string(),
  schoolName: z.string(),
  schoolType: z.enum(["primary", "secondary", "combined"]),
  postcode: z.string(),
  suburb: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  safetyScore: z.number().min(0).max(100),
  localCrimeIndex: z.number().min(0).max(100),
  incidentCount: z.number().int().min(0),
  suspensionRate: z.number().min(0),
  attendanceRate: z.number().min(0).max(100),
  nearbyOffences: z.number().int().min(0), // within 1km radius
  trend: z.enum(["improving", "declining", "stable"]),
});

export type SchoolSafety = z.infer<typeof SchoolSafetySchema>;

// === Safe Corridor ===
export const CorridorPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const SafeCorridorRequestSchema = z.object({
  points: z.array(CorridorPointSchema).min(2),
  radiusKm: z.number().min(0.1).max(10).default(1),
});

export type SafeCorridorRequest = z.infer<typeof SafeCorridorRequestSchema>;

export interface SafeCorridorResult {
  corridor: GeoJSON.Feature<GeoJSON.Polygon>;
  segments: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    riskLevel: "low" | "medium" | "high";
    crimeIndex: number;
    dominantCategory: OffenceCategory;
  }[];
  overallRisk: "low" | "medium" | "high";
  averageCrimeIndex: number;
  hotspots: {
    lat: number;
    lng: number;
    category: OffenceCategory;
    count: number;
  }[];
}

// === State Police Sources ===
export type AustralianState =
  | "NSW"
  | "VIC"
  | "QLD"
  | "WA"
  | "SA"
  | "TAS"
  | "NT"
  | "ACT";

export const STATE_POLICE_SOURCES: Record<
  AustralianState,
  { name: string; baseUrl: string; format: string }
> = {
  NSW: {
    name: "NSW Bureau of Crime Statistics",
    baseUrl: "https://www.bocsar.nsw.gov.au/api",
    format: "json",
  },
  VIC: {
    name: "Crime Statistics Agency Victoria",
    baseUrl: "https://www.crimestatistics.vic.gov.au/api",
    format: "json",
  },
  QLD: {
    name: "Queensland Police Service",
    baseUrl: "https://www.police.qld.gov.au/api/open-data",
    format: "csv",
  },
  WA: {
    name: "Western Australia Police Force",
    baseUrl: "https://www.police.wa.gov.au/api/crime-statistics",
    format: "json",
  },
  SA: {
    name: "South Australia Police",
    baseUrl: "https://data.sa.gov.au/api/crime",
    format: "json",
  },
  TAS: {
    name: "Tasmania Police",
    baseUrl: "https://www.police.tas.gov.au/api/statistics",
    format: "csv",
  },
  NT: {
    name: "Northern Territory Police",
    baseUrl: "https://pfes.nt.gov.au/api/police/statistics",
    format: "json",
  },
  ACT: {
    name: "ACT Policing",
    baseUrl: "https://www.policenews.act.gov.au/api/statistics",
    format: "json",
  },
};

// === Crime Alert Config ===
export interface CrimeAlertConfig {
  postcode: string;
  crimeIndexThreshold: number; // fire alert if crime index exceeds this
  schoolPostcodes: string[];
  enablePush: boolean;
}

// === National Comparison ===
export interface NationalComparison {
  userPostcode: PostcodeCrimeSummary;
  stateAverage: {
    state: AustralianState;
    crimeIndex: number;
    totalRate: number;
    byCategory: Record<OffenceCategory, number>;
  };
  nationalAverage: {
    crimeIndex: number;
    totalRate: number;
    byCategory: Record<OffenceCategory, number>;
  };
  percentileRank: number; // 0-100, where 100 is safest
}
