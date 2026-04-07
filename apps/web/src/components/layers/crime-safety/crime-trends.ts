/**
 * Crime Trends — 12-month rolling time-series data
 *
 * Month-on-month change with seasonal patterns.
 * Generates realistic mock time series for key postcodes.
 */

import type { OffenceCategory } from "@/features/crime-safety/types";

export interface MonthlyTrendPoint {
  period: string; // YYYY-MM
  totalCount: number;
  totalRate: number; // per 100k
  changePercent: number; // vs previous month
  byCategory: Record<
    OffenceCategory,
    {
      count: number;
      rate: number;
      changePercent: number;
    }
  >;
}

export interface PostcodeTrendSeries {
  postcode: string;
  suburb: string;
  state: string;
  population: number;
  months: MonthlyTrendPoint[];
}

// Deterministic pseudo-random
function sr(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const v = Math.sin(hash) * 10000;
  const r = v - Math.floor(v);
  return r < 0 ? r + 1 : r;
}

const BASE_RATES: Record<OffenceCategory, number> = {
  violent: 340,
  property: 1850,
  drug: 420,
  "public-order": 380,
  traffic: 720,
};

const CATEGORIES: OffenceCategory[] = [
  "violent",
  "property",
  "drug",
  "public-order",
  "traffic",
];

// Key postcodes with suburb info
const KEY_POSTCODES: {
  postcode: string;
  suburb: string;
  state: string;
  population: number;
}[] = [
  { postcode: "2000", suburb: "Sydney CBD", state: "NSW", population: 36120 },
  { postcode: "2148", suburb: "Blacktown", state: "NSW", population: 47280 },
  { postcode: "2150", suburb: "Parramatta", state: "NSW", population: 32420 },
  { postcode: "2170", suburb: "Liverpool", state: "NSW", population: 27450 },
  { postcode: "2200", suburb: "Bankstown", state: "NSW", population: 31260 },
  { postcode: "2560", suburb: "Campbelltown", state: "NSW", population: 28670 },
  { postcode: "3000", suburb: "Melbourne CBD", state: "VIC", population: 47340 },
  { postcode: "3175", suburb: "Dandenong", state: "VIC", population: 30480 },
  { postcode: "3021", suburb: "St Albans", state: "VIC", population: 38960 },
  { postcode: "4000", suburb: "Brisbane City", state: "QLD", population: 11230 },
  { postcode: "4217", suburb: "Surfers Paradise", state: "QLD", population: 23260 },
  { postcode: "4870", suburb: "Cairns", state: "QLD", population: 18230 },
  { postcode: "5000", suburb: "Adelaide CBD", state: "SA", population: 14350 },
  { postcode: "5108", suburb: "Salisbury", state: "SA", population: 25640 },
  { postcode: "6000", suburb: "Perth CBD", state: "WA", population: 9780 },
  { postcode: "6168", suburb: "Rockingham", state: "WA", population: 14890 },
  { postcode: "7000", suburb: "Hobart", state: "TAS", population: 15230 },
  { postcode: "0800", suburb: "Darwin CBD", state: "NT", population: 10420 },
  { postcode: "2601", suburb: "Canberra City", state: "ACT", population: 6420 },
  { postcode: "2166", suburb: "Cabramatta", state: "NSW", population: 21680 },
];

function generatePeriods(months: number): string[] {
  const periods: string[] = [];
  const now = new Date(2026, 2, 1); // March 2026
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return periods;
}

/**
 * Generate a 12-month rolling trend series for a given postcode.
 */
export function generateTrendSeries(
  postcode: string,
  months: number = 12
): PostcodeTrendSeries {
  const info = KEY_POSTCODES.find((kp) => kp.postcode === postcode) ?? {
    postcode,
    suburb: `Suburb ${postcode}`,
    state: postcode.startsWith("2")
      ? "NSW"
      : postcode.startsWith("3")
        ? "VIC"
        : postcode.startsWith("4")
          ? "QLD"
          : postcode.startsWith("5")
            ? "SA"
            : postcode.startsWith("6")
              ? "WA"
              : postcode.startsWith("7")
                ? "TAS"
                : "ACT",
    population: 20000,
  };

  const periods = generatePeriods(months);
  const trendPoints: MonthlyTrendPoint[] = [];
  let previousTotal = 0;
  const previousByCat: Record<string, number> = {};

  for (const period of periods) {
    const month = parseInt(period.split("-")[1]!, 10);

    // Seasonal factor: crime peaks in summer (Dec-Feb in Australia), dips in winter (Jun-Aug)
    const seasonalFactor =
      1 + 0.12 * Math.sin(((month - 1) * Math.PI) / 6 + Math.PI / 3);

    const byCategory = {} as MonthlyTrendPoint["byCategory"];
    let totalCount = 0;
    let totalRate = 0;

    for (const cat of CATEGORIES) {
      const regionSeed = sr(`${postcode}-${cat}`);
      const baseRate = BASE_RATES[cat] * (0.6 + regionSeed * 0.8);
      const noise = 0.9 + sr(`${postcode}-${cat}-${period}`) * 0.2;
      const rate = Math.round(baseRate * seasonalFactor * noise * 10) / 10;
      const count = Math.round((rate * info.population) / 100000);
      const prevCount = previousByCat[cat] ?? count;
      const changePercent =
        prevCount > 0
          ? Math.round(((count - prevCount) / prevCount) * 1000) / 10
          : 0;

      byCategory[cat] = { count, rate, changePercent };
      totalCount += count;
      totalRate += rate;
      previousByCat[cat] = count;
    }

    const totalChangePercent =
      previousTotal > 0
        ? Math.round(((totalCount - previousTotal) / previousTotal) * 1000) / 10
        : 0;

    trendPoints.push({
      period,
      totalCount,
      totalRate: Math.round(totalRate * 10) / 10,
      changePercent: totalChangePercent,
      byCategory,
    });

    previousTotal = totalCount;
  }

  return {
    postcode: info.postcode,
    suburb: info.suburb,
    state: info.state,
    population: info.population,
    months: trendPoints,
  };
}

/**
 * Generate trend series for all key postcodes.
 */
export function generateAllTrends(
  months: number = 12
): PostcodeTrendSeries[] {
  return KEY_POSTCODES.map((kp) => generateTrendSeries(kp.postcode, months));
}

/**
 * Detect postcodes with significant upward trends (3-month rolling average).
 */
export function detectSurges(
  trends: PostcodeTrendSeries[],
  thresholdPercent: number = 10
): {
  postcode: string;
  suburb: string;
  surgePercent: number;
  category: OffenceCategory;
}[] {
  const surges: {
    postcode: string;
    suburb: string;
    surgePercent: number;
    category: OffenceCategory;
  }[] = [];

  for (const series of trends) {
    const months = series.months;
    if (months.length < 6) continue;

    for (const cat of CATEGORIES) {
      const recent = months.slice(-3).map((m) => m.byCategory[cat].rate);
      const earlier = months.slice(-6, -3).map((m) => m.byCategory[cat].rate);

      const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
      const earlierAvg = earlier.reduce((s, v) => s + v, 0) / earlier.length;

      if (earlierAvg > 0) {
        const change =
          Math.round(((recentAvg - earlierAvg) / earlierAvg) * 1000) / 10;
        if (change >= thresholdPercent) {
          surges.push({
            postcode: series.postcode,
            suburb: series.suburb,
            surgePercent: change,
            category: cat,
          });
        }
      }
    }
  }

  return surges.sort((a, b) => b.surgePercent - a.surgePercent);
}
