import type { FuelGroup } from "@ozpulse/shared";

export const FUEL_GROUP_COLORS: Record<FuelGroup, string> = {
  coal: "#1a1a1a",
  gas: "#3b82f6",
  wind: "#22c55e",
  solar: "#eab308",
  hydro: "#a855f7",
  battery: "#f97316",
  biomass: "#84cc16",
  other: "#6b7280",
};

export const FUEL_GROUP_LABELS: Record<FuelGroup, string> = {
  coal: "Coal",
  gas: "Gas",
  wind: "Wind",
  solar: "Solar",
  hydro: "Hydro/Pumped",
  battery: "Battery",
  biomass: "Biomass",
  other: "Other",
};
