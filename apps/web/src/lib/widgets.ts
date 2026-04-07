/**
 * Top-bar widget calculation functions.
 * These are pure functions -- no side effects, easy to test.
 */

// ── Mortgage Health ────────────────────────────────────────

export interface MortgageHealth {
  /** Dollar equity = valuation - remaining */
  equity: number;
  /** Equity as percent change vs mortgage value */
  equityChange: number;
  /** Loan-to-value ratio as a percentage */
  ltv: number;
}

/**
 * Calculate mortgage health metrics.
 *
 * @param mortgageValue - Original mortgage/purchase price in AUD
 * @param mortgageRemaining - Outstanding balance in AUD
 * @param propertyValuation - Current estimated property value in AUD
 */
export function calculateMortgageHealth(
  mortgageValue: number,
  mortgageRemaining: number,
  propertyValuation: number
): MortgageHealth {
  const equity = propertyValuation - mortgageRemaining;
  const equityChange =
    mortgageValue > 0
      ? ((equity - (mortgageValue - mortgageRemaining)) / mortgageValue) * 100
      : 0;
  const ltv =
    propertyValuation > 0 ? (mortgageRemaining / propertyValuation) * 100 : 0;

  return {
    equity: Math.round(equity * 100) / 100,
    equityChange: Math.round(equityChange * 100) / 100,
    ltv: Math.round(ltv * 100) / 100,
  };
}

// ── Weekly Fuel Cost ───────────────────────────────────────

export interface WeeklyFuel {
  /** Weekly fuel cost in AUD */
  costAud: number;
  /** Percent change from a baseline (previous period) */
  changePercent: number;
  /** How many hours of work this fuel cost equates to */
  hoursOfWageEquivalent: number;
}

/**
 * Calculate weekly commute fuel cost.
 *
 * @param fuelPricePerLitre - Current fuel price $/L
 * @param vehicleEfficiency - Litres per 100km
 * @param commuteDistanceKm - One-way commute distance in km
 * @param hourlyWage - User's hourly wage in AUD
 * @param previousFuelPrice - Optional previous fuel price for change calc
 * @param tripsPerWeek - Round trips per week (default 5)
 */
export function calculateWeeklyFuel(
  fuelPricePerLitre: number,
  vehicleEfficiency: number,
  commuteDistanceKm: number,
  hourlyWage: number,
  previousFuelPrice?: number,
  tripsPerWeek = 5
): WeeklyFuel {
  // Round trip km per week
  const weeklyKm = commuteDistanceKm * 2 * tripsPerWeek;
  // Litres consumed per week
  const litresPerWeek = (weeklyKm / 100) * vehicleEfficiency;
  // Cost
  const costAud = litresPerWeek * fuelPricePerLitre;

  // Change from previous price
  let changePercent = 0;
  if (previousFuelPrice && previousFuelPrice > 0) {
    changePercent =
      ((fuelPricePerLitre - previousFuelPrice) / previousFuelPrice) * 100;
  }

  // Hours of wage equivalent
  const hoursOfWageEquivalent = hourlyWage > 0 ? costAud / hourlyWage : 0;

  return {
    costAud: Math.round(costAud * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    hoursOfWageEquivalent: Math.round(hoursOfWageEquivalent * 100) / 100,
  };
}

// ── Neighbourhood Risk Score ───────────────────────────────

export interface NeighbourhoodRisk {
  /** Composite score 0-100 (lower is safer) */
  score: number;
  /** Overall trend direction */
  trend: "improving" | "stable" | "worsening";
  /** Primary concern area */
  topConcern: string;
}

/**
 * Calculate a composite neighbourhood risk score.
 *
 * @param crimeIndex - Crime index value (0-100 scale)
 * @param demographicChange - Demographic change percentage (-100 to +100)
 * @param propertyTrend - Property value trend percentage (positive = growth)
 */
export function calculateNeighbourhoodRisk(
  crimeIndex: number,
  demographicChange: number,
  propertyTrend: number
): NeighbourhoodRisk {
  // Weighted composite: crime is dominant factor
  const crimeWeight = 0.5;
  const demoWeight = 0.3;
  const propertyWeight = 0.2;

  // Normalize each input to a 0-100 "risk" scale
  const crimeRisk = Math.min(100, Math.max(0, crimeIndex));
  // Large demographic shifts (either direction) increase risk/instability
  const demoRisk = Math.min(100, Math.abs(demographicChange) * 5);
  // Declining property values increase risk
  const propertyRisk = Math.min(
    100,
    Math.max(0, propertyTrend < 0 ? Math.abs(propertyTrend) * 10 : 0)
  );

  const score = Math.round(
    crimeRisk * crimeWeight + demoRisk * demoWeight + propertyRisk * propertyWeight
  );

  // Determine trend
  let trend: NeighbourhoodRisk["trend"] = "stable";
  const netDirection = -crimeIndex * 0.5 + propertyTrend * 0.3 - Math.abs(demographicChange) * 0.2;
  if (netDirection > 2) trend = "improving";
  else if (netDirection < -2) trend = "worsening";

  // Top concern
  const concerns: [string, number][] = [
    ["Crime & safety", crimeRisk * crimeWeight],
    ["Demographic instability", demoRisk * demoWeight],
    ["Property value decline", propertyRisk * propertyWeight],
  ];
  concerns.sort((a, b) => b[1] - a[1]);
  const topConcern = concerns[0][1] > 0 ? concerns[0][0] : "None";

  return { score, trend, topConcern };
}
