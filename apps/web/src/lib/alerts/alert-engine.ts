/**
 * Alert Engine -- pure functions that evaluate conditions and produce alerts.
 *
 * Each condition function is (data, thresholds) => Alert | null.
 * They contain zero side-effects and are trivially unit-testable.
 */

import type { AlertThresholdsJson, AlertRow, AlertSeverity, AlertType } from "@ozpulse/database";

// ─── Input data shapes ───

export interface FuelPriceData {
  /** Current average fuel price AUD per litre in the user's postcode */
  averagePricePerLitre: number;
  /** User's hourly wage AUD (derived from profile or a default) */
  hourlyWage: number;
  /** Vehicle efficiency in L/100km */
  vehicleEfficiency: number;
  /** One-way commute distance in km */
  commuteKm: number;
}

export interface CrimeIndexData {
  /** Current crime index for the postcode (normalised 0-100) */
  currentIndex: number;
  /** Previous period crime index */
  previousIndex: number;
}

export interface DemographicData {
  /** Current period population count / demographic metric */
  currentValue: number;
  /** Previous period value */
  previousValue: number;
}

export interface EnergyMixData {
  /** Current coal + gas share as a percentage of total generation (0-100) */
  coalGasSharePercent: number;
}

// ─── Alert factory helper ───

function makeAlert(
  userId: string,
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  postcode: string | null,
): Omit<AlertRow, "id" | "created_at"> {
  return {
    user_id: userId,
    type,
    severity,
    title,
    message,
    postcode,
    read: false,
  };
}

// ─── Condition: Fuel price exceeds value-of-work ratio ───

/**
 * Fires when the cost of a daily commute in fuel exceeds
 * `thresholds.fuel_value_of_work_ratio` hours of wages.
 *
 * Daily fuel cost = (vehicleEfficiency / 100) * commuteKm * 2 * pricePerLitre
 * Ratio = dailyFuelCost / hourlyWage
 */
export function checkFuelPriceRatio(
  userId: string,
  data: FuelPriceData,
  thresholds: AlertThresholdsJson,
  postcode: string | null,
): Omit<AlertRow, "id" | "created_at"> | null {
  if (thresholds.fuel_value_of_work_ratio == null) return null;
  if (data.hourlyWage <= 0) return null;

  const dailyFuelCost =
    (data.vehicleEfficiency / 100) * data.commuteKm * 2 * data.averagePricePerLitre;
  const ratio = dailyFuelCost / data.hourlyWage;

  if (ratio <= thresholds.fuel_value_of_work_ratio) return null;

  const severity: AlertSeverity = ratio > thresholds.fuel_value_of_work_ratio * 1.5
    ? "critical"
    : "warning";

  return makeAlert(
    userId,
    "fuel-price",
    severity,
    "Fuel costs exceed work-value threshold",
    `Your daily commute fuel cost ($${dailyFuelCost.toFixed(2)}) represents ${ratio.toFixed(
      2,
    )} hours of wages, exceeding your threshold of ${thresholds.fuel_value_of_work_ratio} hours.`,
    postcode,
  );
}

// ─── Condition: Crime index rise above threshold ───

/**
 * Fires when the crime index increases by more than
 * `thresholds.crime_index_rise` percent month-over-month.
 */
export function checkCrimeIndexRise(
  userId: string,
  data: CrimeIndexData,
  thresholds: AlertThresholdsJson,
  postcode: string | null,
): Omit<AlertRow, "id" | "created_at"> | null {
  if (thresholds.crime_index_rise == null) return null;
  if (data.previousIndex <= 0) return null;

  const changePercent =
    ((data.currentIndex - data.previousIndex) / data.previousIndex) * 100;

  if (changePercent <= thresholds.crime_index_rise) return null;

  const severity: AlertSeverity = changePercent > thresholds.crime_index_rise * 2
    ? "critical"
    : "warning";

  return makeAlert(
    userId,
    "crime-index",
    severity,
    "Crime index rising in your area",
    `Crime index increased by ${changePercent.toFixed(1)}% (from ${data.previousIndex.toFixed(
      1,
    )} to ${data.currentIndex.toFixed(1)}), exceeding your ${thresholds.crime_index_rise}% threshold.`,
    postcode,
  );
}

// ─── Condition: Demographic shift exceeds threshold (default 3%) ───

/**
 * Fires when demographic change exceeds `thresholds.demographic_shift_percent`.
 */
export function checkDemographicShift(
  userId: string,
  data: DemographicData,
  thresholds: AlertThresholdsJson,
  postcode: string | null,
): Omit<AlertRow, "id" | "created_at"> | null {
  const threshold = thresholds.demographic_shift_percent ?? 3;
  if (data.previousValue <= 0) return null;

  const shiftPercent =
    Math.abs((data.currentValue - data.previousValue) / data.previousValue) * 100;

  if (shiftPercent <= threshold) return null;

  const direction = data.currentValue > data.previousValue ? "increase" : "decrease";
  const severity: AlertSeverity = shiftPercent > threshold * 2 ? "warning" : "info";

  return makeAlert(
    userId,
    "demographic-shift",
    severity,
    "Significant demographic shift detected",
    `Population ${direction} of ${shiftPercent.toFixed(1)}% in your area exceeds the ${threshold}% threshold.`,
    postcode,
  );
}

// ─── Condition: Coal/gas share below floor ───

/**
 * Fires when coal + gas share of the energy mix drops below
 * `thresholds.coal_gas_share_floor` percent.
 * This may indicate grid instability risks or energy transition milestones.
 */
export function checkCoalGasShareFloor(
  userId: string,
  data: EnergyMixData,
  thresholds: AlertThresholdsJson,
  postcode: string | null,
): Omit<AlertRow, "id" | "created_at"> | null {
  if (thresholds.coal_gas_share_floor == null) return null;

  if (data.coalGasSharePercent >= thresholds.coal_gas_share_floor) return null;

  const severity: AlertSeverity =
    data.coalGasSharePercent < thresholds.coal_gas_share_floor * 0.5
      ? "critical"
      : "warning";

  return makeAlert(
    userId,
    "coal-gas-share",
    severity,
    "Coal & gas generation share below threshold",
    `Coal and gas now account for ${data.coalGasSharePercent.toFixed(
      1,
    )}% of generation, below your ${thresholds.coal_gas_share_floor}% floor.`,
    postcode,
  );
}

// ─── Run all conditions ───

export interface AlertEngineInput {
  userId: string;
  postcode: string | null;
  thresholds: AlertThresholdsJson;
  fuelPrice?: FuelPriceData;
  crimeIndex?: CrimeIndexData;
  demographic?: DemographicData;
  energyMix?: EnergyMixData;
}

/**
 * Evaluates all alert conditions and returns any that fire.
 */
export function evaluateAlertConditions(
  input: AlertEngineInput,
): Array<Omit<AlertRow, "id" | "created_at">> {
  const results: Array<Omit<AlertRow, "id" | "created_at">> = [];
  const { userId, postcode, thresholds } = input;

  if (input.fuelPrice) {
    const alert = checkFuelPriceRatio(userId, input.fuelPrice, thresholds, postcode);
    if (alert) results.push(alert);
  }

  if (input.crimeIndex) {
    const alert = checkCrimeIndexRise(userId, input.crimeIndex, thresholds, postcode);
    if (alert) results.push(alert);
  }

  if (input.demographic) {
    const alert = checkDemographicShift(userId, input.demographic, thresholds, postcode);
    if (alert) results.push(alert);
  }

  if (input.energyMix) {
    const alert = checkCoalGasShareFloor(userId, input.energyMix, thresholds, postcode);
    if (alert) results.push(alert);
  }

  return results;
}
