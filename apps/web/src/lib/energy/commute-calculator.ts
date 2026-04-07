import type { CommuteCostInput, CommuteCostResult } from "@ozpulse/shared";

const AU_STANDARD_WORK_WEEK_HOURS = 38;
const WEEKS_PER_MONTH = 4.33;
const WEEKS_PER_YEAR = 52;

export function calculateCommuteCost(
  input: CommuteCostInput,
  priceCentsPerLitre: number
): CommuteCostResult {
  const { distanceKm, fuelType, efficiencyLPer100km, daysPerWeek, hourlyWage } = input;

  // Round trip distance
  const dailyKm = distanceKm * 2;
  const dailyLitres = (dailyKm * efficiencyLPer100km) / 100;
  const pricePerLitreAUD = priceCentsPerLitre / 100;

  const dailyCostAUD = dailyLitres * pricePerLitreAUD;
  const weeklyCostAUD = dailyCostAUD * daysPerWeek;
  const monthlyCostAUD = weeklyCostAUD * WEEKS_PER_MONTH;
  const annualCostAUD = weeklyCostAUD * WEEKS_PER_YEAR;

  const weeklyGrossWage = (hourlyWage ?? 45) * AU_STANDARD_WORK_WEEK_HOURS;
  const percentOfGrossWeeklyWage = weeklyGrossWage > 0
    ? (weeklyCostAUD / weeklyGrossWage) * 100
    : 0;

  // Minutes of work needed per km of commute
  const minutelyWage = (hourlyWage ?? 45) / 60;
  const costPerKm = (efficiencyLPer100km / 100) * pricePerLitreAUD;
  const valueOfWorkRatio = minutelyWage > 0 ? costPerKm / minutelyWage : 0;

  return {
    distanceKm,
    fuelType,
    efficiencyLPer100km,
    pricePerLitreCents: priceCentsPerLitre,
    dailyCostAUD: round2(dailyCostAUD),
    weeklyCostAUD: round2(weeklyCostAUD),
    monthlyCostAUD: round2(monthlyCostAUD),
    annualCostAUD: round2(annualCostAUD),
    percentOfGrossWeeklyWage: round2(percentOfGrossWeeklyWage),
    valueOfWorkRatio: round2(valueOfWorkRatio),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
