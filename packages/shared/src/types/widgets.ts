/**
 * Dashboard top-bar widget data types.
 * Computed by the personalisation engine based on user profile + layer data.
 */

export interface MortgageHealthWidget {
  /** Current equity = property value - loan remaining */
  equity: number;
  /** Loan-to-value ratio as decimal (0-1) */
  ltv: number;
  /** Monthly repayment amount AUD */
  monthlyRepayment: number;
  /** Trend direction based on recent property value changes */
  trend: "up" | "stable" | "down";
}

export interface WeeklyFuelBurnWidget {
  /** Weekly fuel cost in AUD */
  weeklyCostAud: number;
  /** Cost as percentage of weekly wage */
  percentOfWage: number;
  /** Current fuel price per litre used in calculation */
  fuelPricePerLitre: number;
  /** Whether the cost exceeds the user's alert threshold */
  exceedsThreshold: boolean;
}

export interface NeighbourhoodRiskWidget {
  /** Composite score 0-100, lower is safer */
  score: number;
  /** Human-readable label */
  label: "low" | "moderate" | "elevated" | "high";
  /** Contributing factors with their individual scores */
  factors: {
    crime: number;
    demographicChange: number;
    propertyTrend: number;
  };
}

export interface DashboardWidgets {
  mortgageHealth: MortgageHealthWidget | null;
  weeklyFuelBurn: WeeklyFuelBurnWidget | null;
  neighbourhoodRisk: NeighbourhoodRiskWidget | null;
  lastUpdated: string;
}
