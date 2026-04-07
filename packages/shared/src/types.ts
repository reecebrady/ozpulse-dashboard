export interface UserProfile {
  id: string;
  postcode: string;
  mortgageValue: number;
  mortgageRemaining: number;
  netWorth: number;
  vehicleEfficiencyLPer100km: number;
  commuteRouteKm: number;
  schoolPostcode?: string;
  workplacePostcode?: string;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  fuelValueOfWorkRatio: number; // cost per hour of wage earned
  crimeIndexRise: number; // percentage threshold
  demographicShiftPercent: number; // default 3%
  coalGasShareFloor: number; // percentage below which alerts fire
}

export interface MapLayer {
  id: string;
  name: string;
  category: LayerCategory;
  enabled: boolean;
  component: string; // lazy-loaded component path
  refreshIntervalMs: number;
}

export type LayerCategory =
  | "power-energy"
  | "real-estate"
  | "crime-safety"
  | "immigration-demographics"
  | "infrastructure"
  | "mining-resources"
  | "leisure-lifestyle"
  | "global-index";

export interface GeneratorSite {
  id: string;
  name: string;
  fuelType: "coal" | "gas" | "wind" | "solar" | "hydro" | "battery" | "other";
  lat: number;
  lng: number;
  capacityMW: number;
  currentOutputMW: number;
  owner: string;
  commissionedDate: string;
  expectedClosureDate?: string;
}

export interface PropertyListing {
  id: string;
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  priceAUD: number;
  pricePerSqm: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: "house" | "apartment" | "townhouse" | "land";
  daysOnMarket: number;
  rentalYieldPercent?: number;
}

export interface CrimeRecord {
  postcode: string;
  sa3Code: string;
  offenceType: "violent" | "property" | "drug" | "public-order" | "traffic";
  count: number;
  period: string; // YYYY-MM
  changeFromPrevMonth: number;
}

export interface MigrationData {
  sa4Code: string;
  postcode?: string;
  visaCategory: string;
  sourceCountry: string;
  netArrivals: number;
  period: string;
}

export interface InfraProject {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sector: string;
  stage: "planning" | "approved" | "construction" | "completed";
  budgetAUD: number;
  expectedJobs: number;
  completionDate?: string;
}

export interface MineSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  commodity: string;
  productionTonnes: number;
  exportValueAUD: number;
  operator: string;
}

export interface Alert {
  id: string;
  type: LayerCategory;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: string;
  postcode?: string;
}
