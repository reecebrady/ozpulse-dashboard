// ─── Fuel Technology Types ───

export type FuelTech =
  | "black_coal" | "brown_coal"
  | "gas_ccgt" | "gas_ocgt" | "gas_steam" | "gas_recip"
  | "wind" | "solar_utility" | "solar_rooftop"
  | "hydro" | "pumps"
  | "battery_charging" | "battery_discharging"
  | "biomass" | "distillate" | "other";

export type FuelGroup = "coal" | "gas" | "wind" | "solar" | "hydro" | "battery" | "biomass" | "other";

export type NEMRegion = "NSW1" | "QLD1" | "VIC1" | "SA1" | "TAS1";

export type AUState = "NSW" | "VIC" | "QLD" | "SA" | "WA" | "TAS" | "NT" | "ACT";

export type FuelType = "U91" | "U95" | "U98" | "diesel" | "LPG" | "E10" | "E85";

// ─── Generator ───

export interface Generator {
  duid: string;
  stationName: string;
  participantName: string;
  fuelTech: FuelTech;
  fuelGroup: FuelGroup;
  regionId: NEMRegion;
  state: AUState;
  latitude: number;
  longitude: number;
  maxCapacityMW: number;
  registeredCapacityMW: number;
  currentOutputMW?: number;
  dispatchType: "scheduled" | "semi-scheduled" | "non-scheduled";
  status: "operating" | "committed" | "commissioning" | "retired";
  commissionedYear?: number;
  expectedClosureYear?: number;
}

// ─── Dispatch (SCADA) ───

export interface DispatchData {
  duid: string;
  settlementDate: string;
  scadaMW: number;
  targetMW?: number;
}

export interface RegionalDispatch {
  regionId: NEMRegion;
  timestamp: string;
  totalDemandMW: number;
  totalGenerationMW: number;
  priceAUDPerMWh: number;
  byFuelGroup: Record<FuelGroup, number>;
  renewablePercent: number;
}

// ─── Energy Mix ───

export interface EnergyMixEntry {
  fuelGroup: FuelGroup;
  mw: number;
  percent: number;
}

// ─── Fuel Prices ───

export interface FuelStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  suburb: string;
  state: AUState;
  postcode: string;
  latitude: number;
  longitude: number;
  prices: FuelPriceEntry[];
  lastUpdated: string;
}

export interface FuelPriceEntry {
  fuelType: FuelType;
  priceCentsPerLitre: number;
  lastUpdated: string;
}

export interface FuelPriceRegional {
  state: AUState;
  postcode?: string;
  suburb?: string;
  averagePrices: Partial<Record<FuelType, number>>;
  minPrice: Partial<Record<FuelType, number>>;
  maxPrice: Partial<Record<FuelType, number>>;
  stationCount: number;
  asOf: string;
}

// ─── Commute Cost ───

export interface CommuteCostInput {
  distanceKm: number;
  fuelType: FuelType;
  efficiencyLPer100km: number;
  daysPerWeek: number;
  hourlyWage?: number;
  postcode?: string;
}

export interface CommuteCostResult {
  distanceKm: number;
  fuelType: FuelType;
  efficiencyLPer100km: number;
  pricePerLitreCents: number;
  dailyCostAUD: number;
  weeklyCostAUD: number;
  monthlyCostAUD: number;
  annualCostAUD: number;
  percentOfGrossWeeklyWage: number;
  valueOfWorkRatio: number;
}

// ─── Transmission Lines ───

export interface TransmissionLine {
  id: string;
  name: string;
  fromSubstation: string;
  toSubstation: string;
  voltageKV: number;
  lengthKm: number;
  coordinates: [number, number][];
}

// ─── Energy Alerts ───

export interface EnergyAlert {
  id: string;
  type: "price_spike" | "renewable_record" | "generator_trip" | "demand_peak" | "fuel_price_jump" | "coal_gas_floor";
  regionId?: NEMRegion;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}
