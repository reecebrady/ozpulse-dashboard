// ─── User Profile ───
export interface UserProfile {
  id: string;
  postcode: string;
  mortgageDetails: MortgageDetails | null;
  vehicleEfficiency: VehicleEfficiency | null;
  commuteRoute: CommuteRoute | null;
  pinnedLocations: PinnedLocation[];
  alertThresholds: AlertThresholds;
}

export interface MortgageDetails {
  propertyPostcode: string;
  currentValue: number;
  loanRemaining: number;
  remainingTermYears: number;
  interestRate: number;
  netWorth: number;
}

export interface VehicleEfficiency {
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  litresPer100km: number;
  tankSizeLitres: number;
}

export interface CommuteRoute {
  from: [number, number]; // [lng, lat]
  to: [number, number];
  distanceKm: number;
  daysPerWeek: number;
}

export interface PinnedLocation {
  id: string;
  label: string;
  type: "home" | "work" | "school" | "custom";
  coordinates: [number, number]; // [lng, lat]
  postcode: string;
}

export interface AlertThresholds {
  fuelPriceMax: number | null;
  crimeIndexMax: number | null;
  demographicShiftPct: number;
  coalGasShareMin: number | null;
}

// ─── Map Layer System ───
export type LayerId =
  | "power-energy"
  | "real-estate"
  | "crime-safety"
  | "immigration-demographics"
  | "infrastructure"
  | "mining-resources"
  | "leisure-lifestyle"
  | "education"
  | "government"
  | "traffic-commute"
  | "health"
  | "media-sentiment";

export interface MapLayer {
  id: LayerId;
  name: string;
  description: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
}

export interface MapLayerConfig {
  id: LayerId;
  name: string;
  description: string;
  defaultVisible: boolean;
  component: string; // lazy-loaded component path
  dataSources: string[];
}

// ─── Alerts ───
export interface Alert {
  id: string;
  layerId: LayerId;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  postcode: string | null;
  timestamp: string;
  read: boolean;
}

// ─── Power & Energy ───
export interface GeneratorSite {
  id: string;
  name: string;
  fuelType: "coal" | "gas" | "wind" | "solar" | "hydro" | "battery" | "other";
  coordinates: [number, number];
  capacityMW: number;
  currentOutputMW: number;
  owner: string;
  commissionDate: string;
  expectedClosure: string | null;
  state: string;
}

export interface FuelPrice {
  postcode: string;
  fuelType: string;
  pricePerLitre: number;
  station: string;
  coordinates: [number, number];
  updatedAt: string;
}

// ─── Real Estate ───
export interface PropertyListing {
  id: string;
  address: string;
  postcode: string;
  coordinates: [number, number];
  priceAUD: number;
  pricePerSqm: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: "house" | "apartment" | "townhouse" | "land";
  daysOnMarket: number;
  listingUrl: string;
}

export interface SuburbStats {
  postcode: string;
  suburbName: string;
  medianPrice: number;
  medianPricePerSqm: number;
  medianDaysOnMarket: number;
  rentalYieldPct: number;
  auctionClearanceRate: number;
  priceChangePct12m: number;
}

// ─── Crime ───
export interface CrimeStats {
  regionId: string;
  regionName: string;
  postcode: string;
  offenceType: "violent" | "property" | "drug" | "public-order" | "traffic";
  count: number;
  ratePer100k: number;
  monthOnMonthChangePct: number;
  period: string;
}

// ─── Immigration ───
export interface MigrationData {
  regionId: string;
  visaCategory: string;
  sourceCountry: string;
  netArrivals: number;
  period: string;
  yearOnYearChangePct: number;
}

// ─── Infrastructure ───
export interface InfraProject {
  id: string;
  name: string;
  sector: string;
  coordinates: [number, number];
  stage: "planning" | "approved" | "construction" | "completed";
  budgetAUD: number;
  expectedJobs: number;
  completionDate: string | null;
  description: string;
}

// ─── Mining ───
export interface MineSite {
  id: string;
  name: string;
  commodity: string;
  coordinates: [number, number];
  productionTonnes: number;
  exportValueAUD: number;
  owner: string;
  state: string;
}

// ─── Leisure ───
export interface LeisureVenue {
  id: string;
  name: string;
  type: "park" | "beach" | "trail" | "sport" | "event" | "market" | "other";
  coordinates: [number, number];
  postcode: string;
  costRating: "free" | "under20" | "paid";
  familyFriendly: boolean;
  description: string;
}
