import type {
  CrimeRecord,
  OffenceCategory,
  PostcodeCrimeSummary,
  CrimeTrendPoint,
  OFFENCE_CATEGORIES,
} from "../types";

// Crime index: composite score 0-100 based on weighted offence rates
const CATEGORY_WEIGHTS: Record<OffenceCategory, number> = {
  violent: 0.35,
  property: 0.25,
  drug: 0.15,
  "public-order": 0.15,
  traffic: 0.1,
};

// National baseline rates per 100k (ABS 2024 approximate averages)
const NATIONAL_BASELINE_RATES: Record<OffenceCategory, number> = {
  violent: 900,
  property: 3500,
  drug: 500,
  "public-order": 800,
  traffic: 1200,
};

export function calculateCrimeIndex(
  byCategory: Record<OffenceCategory, { rate: number }>
): number {
  let weightedScore = 0;

  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const cat = category as OffenceCategory;
    const rate = byCategory[cat]?.rate ?? 0;
    const baseline = NATIONAL_BASELINE_RATES[cat];
    // Normalise to 0-100: rate at baseline = 50, double baseline = 100, zero = 0
    const normalised = Math.min(100, (rate / baseline) * 50);
    weightedScore += normalised * weight;
  }

  return Math.round(weightedScore);
}

export function determineTrend(
  values: number[]
): { trend: "up" | "down" | "stable"; changePercent: number } {
  if (values.length < 2) return { trend: "stable", changePercent: 0 };

  const recent = values.slice(-3);
  const previous = values.slice(-6, -3);

  if (recent.length === 0 || previous.length === 0) {
    return { trend: "stable", changePercent: 0 };
  }

  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const previousAvg = previous.reduce((s, v) => s + v, 0) / previous.length;

  if (previousAvg === 0) return { trend: "stable", changePercent: 0 };

  const changePercent =
    Math.round(((recentAvg - previousAvg) / previousAvg) * 1000) / 10;

  return {
    trend:
      changePercent > 2 ? "up" : changePercent < -2 ? "down" : "stable",
    changePercent,
  };
}

export function aggregateRecordsToSummary(
  records: CrimeRecord[],
  postcode: string
): PostcodeCrimeSummary | null {
  const postcodeRecords = records.filter((r) => r.postcode === postcode);
  if (postcodeRecords.length === 0) return null;

  const first = postcodeRecords[0]!;
  const categories: OffenceCategory[] = [
    "violent",
    "property",
    "drug",
    "public-order",
    "traffic",
  ];

  const byCategory: PostcodeCrimeSummary["byCategory"] = {};

  for (const cat of categories) {
    const catRecords = postcodeRecords.filter((r) => r.category === cat);
    const totalCount = catRecords.reduce((s, r) => s + r.count, 0);
    const avgRate =
      catRecords.length > 0
        ? catRecords.reduce((s, r) => s + r.rate, 0) / catRecords.length
        : 0;

    const monthlyRates = catRecords
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((r) => r.rate);

    const trendInfo = determineTrend(monthlyRates);

    byCategory[cat] = {
      count: totalCount,
      rate: Math.round(avgRate * 10) / 10,
      trend: trendInfo.trend,
      changePercent: trendInfo.changePercent,
    };
  }

  const totalOffences = postcodeRecords.reduce((s, r) => s + r.count, 0);
  const totalRate =
    postcodeRecords.reduce((s, r) => s + r.rate, 0) / postcodeRecords.length;

  const crimeIndex = calculateCrimeIndex(
    byCategory as Record<OffenceCategory, { rate: number }>
  );

  const monthlyTotals = new Map<string, { count: number; rate: number }>();
  for (const r of postcodeRecords) {
    const existing = monthlyTotals.get(r.period) ?? { count: 0, rate: 0 };
    existing.count += r.count;
    existing.rate += r.rate;
    monthlyTotals.set(r.period, existing);
  }

  const trends: CrimeTrendPoint[] = Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data], i, arr) => {
      const prev = i > 0 ? arr[i - 1]![1] : data;
      const changePercent =
        prev.count > 0
          ? Math.round(
              ((data.count - prev.count) / prev.count) * 1000
            ) / 10
          : 0;
      return { period, count: data.count, rate: data.rate, changePercent };
    });

  const allRates = trends.map((t) => t.rate);
  const overallTrend = determineTrend(allRates);

  return {
    postcode,
    sa3Code: first.sa3Code,
    sa3Name: first.sa3Name,
    state: first.state,
    lat: first.lat,
    lng: first.lng,
    totalOffences,
    totalRate: Math.round(totalRate * 10) / 10,
    crimeIndex,
    trend: overallTrend.trend,
    trendChangePercent: overallTrend.changePercent,
    byCategory,
    trends,
  };
}

export function calculatePercentileRank(
  userIndex: number,
  allIndices: number[]
): number {
  if (allIndices.length === 0) return 50;
  const sorted = [...allIndices].sort((a, b) => a - b);
  const belowCount = sorted.filter((idx) => idx < userIndex).length;
  // Invert: lower crime index = higher percentile (safer)
  return Math.round((1 - belowCount / sorted.length) * 100);
}

export function riskLevel(crimeIndex: number): "low" | "medium" | "high" {
  if (crimeIndex < 30) return "low";
  if (crimeIndex < 60) return "medium";
  return "high";
}

export function riskColor(level: "low" | "medium" | "high"): string {
  return { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" }[level];
}
