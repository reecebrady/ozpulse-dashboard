import type {
  EconomicMultiplierInput,
  EconomicMultiplierResult,
  InfraSector,
} from "@ozpulse/shared";

// ABS Input-Output Tables (Cat. No. 5209.0) Type II multipliers by sector
// These are employment multipliers per $1M of output
const SECTOR_MULTIPLIERS: Record<InfraSector, { typeII: number; jobsPer1M: number }> = {
  road:               { typeII: 2.81, jobsPer1M: 7.2 },
  rail:               { typeII: 2.67, jobsPer1M: 6.8 },
  port:               { typeII: 2.54, jobsPer1M: 6.1 },
  airport:            { typeII: 2.73, jobsPer1M: 7.0 },
  water:              { typeII: 2.73, jobsPer1M: 6.5 },
  energy:             { typeII: 2.45, jobsPer1M: 5.8 },
  telecommunications: { typeII: 2.31, jobsPer1M: 5.2 },
  social:             { typeII: 2.54, jobsPer1M: 8.1 },
  mixed_use:          { typeII: 2.60, jobsPer1M: 7.0 },
  other:              { typeII: 2.50, jobsPer1M: 6.5 },
};

// Direct employment is roughly 40% of total for construction
const DIRECT_RATIO = 0.40;
const INDIRECT_RATIO = 0.35;
const INDUCED_RATIO = 0.25;

export function calculateMultiplier(input: EconomicMultiplierInput): EconomicMultiplierResult {
  const { projectCostAUD, sector, constructionYears } = input;

  const costMillions = projectCostAUD / 1_000_000;
  const annualSpend = costMillions / Math.max(constructionYears, 1);
  const { typeII, jobsPer1M } = SECTOR_MULTIPLIERS[sector] ?? SECTOR_MULTIPLIERS.other;

  const totalJobs = Math.round(annualSpend * jobsPer1M);
  const directJobs = Math.round(totalJobs * DIRECT_RATIO);
  const indirectJobs = Math.round(totalJobs * INDIRECT_RATIO);
  const inducedJobs = totalJobs - directJobs - indirectJobs;

  const gdpContributionAUD = projectCostAUD * typeII;

  return {
    directJobs,
    indirectJobs,
    inducedJobs,
    totalJobs,
    gdpContributionAUD: Math.round(gdpContributionAUD),
    multiplier: typeII,
    methodology: `ABS Type II IO multiplier (${typeII}x) applied to annual construction spend of $${annualSpend.toFixed(0)}M over ${constructionYears} year(s). Employment estimated at ${jobsPer1M} FTE per $1M for ${sector} sector.`,
    confidence: costMillions > 100 ? "high" : costMillions > 10 ? "medium" : "low",
    source: "ABS Cat. No. 5209.0 Australian National Accounts: Input-Output Tables",
  };
}
