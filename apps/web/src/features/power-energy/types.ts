import { z } from "zod";

// === Fuel Types ===
export const FUEL_TYPES = [
  "coal",
  "gas",
  "wind",
  "solar",
  "hydro",
  "battery",
  "other",
] as const;

export type FuelType = (typeof FUEL_TYPES)[number];

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  coal: "Coal",
  gas: "Gas (CCGT/OCGT)",
  wind: "Wind",
  solar: "Solar",
  hydro: "Hydro",
  battery: "Battery Storage",
  other: "Other (Biomass/Diesel)",
};

export const FUEL_TYPE_COLORS: Record<FuelType, string> = {
  coal: "#1a1a1a",
  gas: "#3b82f6",
  wind: "#22c55e",
  solar: "#eab308",
  hydro: "#8b5cf6",
  battery: "#f97316",
  other: "#6b7280",
};

export const FUEL_TYPE_ICONS: Record<FuelType, string> = {
  coal: "\u26AB",
  gas: "\uD83D\uDD35",
  wind: "\uD83C\uDF2C\uFE0F",
  solar: "\u2600\uFE0F",
  hydro: "\uD83D\uDCA7",
  battery: "\uD83D\uDD0B",
  other: "\u2699\uFE0F",
};

// === Australian States ===
export type AustralianState =
  | "NSW"
  | "VIC"
  | "QLD"
  | "WA"
  | "SA"
  | "TAS"
  | "NT"
  | "ACT";

// === Generator Site Schemas ===
export const GeneratorSiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  fuelType: z.enum(FUEL_TYPES),
  lng: z.number(),
  lat: z.number(),
  capacityMW: z.number().min(0),
  currentOutputMW: z.number().min(0),
  owner: z.string(),
  state: z.string(),
  region: z.string().optional(),
  commissionDate: z.string(),
  expectedClosure: z.string().nullable(),
  dispatchType: z.enum(["scheduled", "semi-scheduled", "non-scheduled"]).optional(),
  emissionsIntensity: z.number().min(0).optional(), // tCO2/MWh
});

export type GeneratorSite = z.infer<typeof GeneratorSiteSchema>;

// === NEM Region Output ===
export const NEMRegionOutputSchema = z.object({
  regionId: z.string(),
  state: z.string(),
  totalCapacityMW: z.number(),
  totalOutputMW: z.number(),
  demandMW: z.number(),
  renewableSharePct: z.number(),
  pricePerMWh: z.number(),
  timestamp: z.string(),
  byFuelType: z.record(
    z.enum(FUEL_TYPES),
    z.object({
      capacityMW: z.number(),
      outputMW: z.number(),
      generatorCount: z.number(),
    })
  ),
});

export type NEMRegionOutput = z.infer<typeof NEMRegionOutputSchema>;

// === Fuel Price Schemas ===
export const FuelPriceSchema = z.object({
  id: z.string(),
  postcode: z.string(),
  suburb: z.string(),
  state: z.string(),
  fuelType: z.enum(["unleaded91", "unleaded95", "unleaded98", "diesel", "lpg", "e10"]),
  pricePerLitre: z.number().min(0),
  station: z.string(),
  brand: z.string(),
  lng: z.number(),
  lat: z.number(),
  updatedAt: z.string(),
});

export type FuelPrice = z.infer<typeof FuelPriceSchema>;

export type RetailFuelType = "unleaded91" | "unleaded95" | "unleaded98" | "diesel" | "lpg" | "e10";

export const RETAIL_FUEL_LABELS: Record<RetailFuelType, string> = {
  unleaded91: "Unleaded 91",
  unleaded95: "Unleaded 95",
  unleaded98: "Unleaded 98",
  diesel: "Diesel",
  lpg: "LPG",
  e10: "E10",
};

// === State Consumption ===
export const StateConsumptionSchema = z.object({
  state: z.string(),
  demandGW: z.number(),
  population: z.number(),
  perCapitaKW: z.number(),
  lat: z.number(),
  lng: z.number(),
});

export type StateConsumption = z.infer<typeof StateConsumptionSchema>;

// === Weekly Commute Cost ===
export const CommuteCostInputSchema = z.object({
  distanceKm: z.number().min(0),
  daysPerWeek: z.number().min(1).max(7),
  fuelType: z.enum(["unleaded91", "unleaded95", "unleaded98", "diesel", "lpg", "e10"]),
  litresPer100km: z.number().min(0).max(50),
  postcode: z.string().regex(/^\d{4}$/),
});

export type CommuteCostInput = z.infer<typeof CommuteCostInputSchema>;

export interface CommuteCostResult {
  weeklyLitres: number;
  weeklyCostAUD: number;
  monthlyCostAUD: number;
  yearlyCostAUD: number;
  avgPricePerLitre: number;
  fuelType: RetailFuelType;
  priceRange: { min: number; max: number };
}

// === Energy Alert Config ===
export interface EnergyAlertConfig {
  coalGasShareFloor: number; // percentage below which alerts fire
  fuelPriceThreshold: number; // cents per litre
  renewableShareCeiling: number; // alert if renewables exceed this (grid stability)
}

// === NEM Dispatch Interval (5-minute) ===
export const DispatchIntervalSchema = z.object({
  settlementDate: z.string(),
  regionId: z.string(),
  totalDemand: z.number(),
  rrp: z.number(), // regional reference price $/MWh
  dispatchByFuel: z.record(z.enum(FUEL_TYPES), z.number()),
});

export type DispatchInterval = z.infer<typeof DispatchIntervalSchema>;
