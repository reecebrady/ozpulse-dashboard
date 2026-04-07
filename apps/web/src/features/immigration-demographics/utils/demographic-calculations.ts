import type {
  DiasporaConcentration,
  PostcodeMigrationSummary,
  WorkforceShift,
  SettlementPattern,
} from "../types";

export function calculateNetMigrationChange(
  current: PostcodeMigrationSummary,
  previous?: PostcodeMigrationSummary
): number {
  if (!previous || previous.netMigration === 0) return 0;
  return (
    Math.round(
      ((current.netMigration - previous.netMigration) /
        Math.abs(previous.netMigration)) *
        1000
    ) / 10
  );
}

export function calculateDemographicShiftPercent(
  current: DiasporaConcentration,
  previous: DiasporaConcentration
): {
  country: string;
  currentPercent: number;
  previousPercent: number;
  shiftPercent: number;
}[] {
  const shifts: {
    country: string;
    currentPercent: number;
    previousPercent: number;
    shiftPercent: number;
  }[] = [];

  for (const currentEntry of current.topAncestries) {
    const prevEntry = previous.topAncestries.find(
      (p) => p.country === currentEntry.country
    );
    const previousPercent = prevEntry?.percentage ?? 0;
    const shiftPercent =
      Math.round((currentEntry.percentage - previousPercent) * 100) / 100;

    shifts.push({
      country: currentEntry.country,
      currentPercent: currentEntry.percentage,
      previousPercent,
      shiftPercent,
    });
  }

  return shifts.sort(
    (a, b) => Math.abs(b.shiftPercent) - Math.abs(a.shiftPercent)
  );
}

export function detectSignificantShifts(
  shifts: { country: string; shiftPercent: number }[],
  thresholdPercent: number = 3
): { country: string; shiftPercent: number }[] {
  return shifts.filter((s) => Math.abs(s.shiftPercent) >= thresholdPercent);
}

export function calculateWorkforceCompositionScore(
  shifts: WorkforceShift[]
): {
  industry: string;
  diversityIndex: number; // 0-1 Simpson's diversity index
  yearOnYearChange: number;
  governmentSector: boolean;
}[] {
  return shifts.map((s) => {
    // Simpson's diversity index based on country composition
    const total = s.totalWorkers;
    const countryCounts = s.topOverseasCountries.map((c) => c.count);
    const australianCount = Math.round(
      (s.australianBornPercent / 100) * total
    );
    const allCounts = [australianCount, ...countryCounts];

    let sumSquares = 0;
    for (const count of allCounts) {
      const proportion = total > 0 ? count / total : 0;
      sumSquares += proportion * proportion;
    }
    const diversityIndex =
      Math.round((1 - sumSquares) * 1000) / 1000;

    return {
      industry: s.industry,
      diversityIndex,
      yearOnYearChange: s.yearOnYearChange,
      governmentSector: s.governmentSector,
    };
  });
}

export function calculateHousingPressureIndex(
  settlement: SettlementPattern
): number {
  // Composite 0-100: vacancy rate (inverse, 40%), rent change (30%), arrival density (30%)
  const vacancyComponent = Math.max(
    0,
    Math.min(100, (1 - settlement.vacancyRate / 5) * 100)
  ) * 0.4;

  const rentComponent = Math.max(
    0,
    Math.min(100, settlement.rentChangePercent * 5)
  ) * 0.3;

  const arrivalDensity = Math.min(
    100,
    (settlement.recentArrivals / 1000) * 100
  );
  const arrivalComponent = arrivalDensity * 0.3;

  return Math.round(vacancyComponent + rentComponent + arrivalComponent);
}

export function migrationIntensityColor(netMigration: number): string {
  if (netMigration > 500) return "#1e40af"; // deep blue - high inflow
  if (netMigration > 200) return "#3b82f6";
  if (netMigration > 50) return "#93c5fd";
  if (netMigration > -50) return "#e5e7eb"; // grey - neutral
  if (netMigration > -200) return "#fca5a5";
  if (netMigration > -500) return "#ef4444";
  return "#991b1b"; // deep red - high outflow
}

export function diasporaConcentrationLevel(
  percentage: number
): "low" | "moderate" | "high" | "very-high" {
  if (percentage < 5) return "low";
  if (percentage < 15) return "moderate";
  if (percentage < 30) return "high";
  return "very-high";
}
