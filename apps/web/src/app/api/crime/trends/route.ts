import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/crime/trends
 *
 * Returns 12-month rolling trend for a postcode, with month-on-month change.
 *
 * Query params:
 *   - postcode (required): the postcode to get trends for
 *   - months (optional, default 12): how many months of data
 *   - category (optional): filter to a specific offence category
 */

interface TrendPoint {
  period: string;
  totalCount: number;
  totalRate: number;
  changePercent: number;
  byCategory: Record<string, { count: number; rate: number; changePercent: number }>;
}

// Postcode-to-SA3 mapping for lookup consistency
const POSTCODE_SA3_MAP: Record<string, { sa3Name: string; state: string; population: number }> = {
  "2150": { sa3Name: "Parramatta", state: "NSW", population: 192340 },
  "2000": { sa3Name: "Sydney Inner City", state: "NSW", population: 231740 },
  "2148": { sa3Name: "Blacktown", state: "NSW", population: 165280 },
  "2194": { sa3Name: "Canterbury", state: "NSW", population: 143120 },
  "2750": { sa3Name: "Penrith", state: "NSW", population: 128760 },
  "2300": { sa3Name: "Newcastle", state: "NSW", population: 159830 },
  "3000": { sa3Name: "Melbourne City", state: "VIC", population: 178450 },
  "3175": { sa3Name: "Dandenong", state: "VIC", population: 156780 },
  "3220": { sa3Name: "Geelong", state: "VIC", population: 134920 },
  "3124": { sa3Name: "Boroondara", state: "VIC", population: 142560 },
  "4000": { sa3Name: "Brisbane Inner", state: "QLD", population: 198620 },
  "4217": { sa3Name: "Gold Coast North", state: "QLD", population: 147350 },
  "4870": { sa3Name: "Cairns", state: "QLD", population: 98430 },
  "4810": { sa3Name: "Townsville", state: "QLD", population: 112890 },
  "5000": { sa3Name: "Adelaide City", state: "SA", population: 145280 },
  "5108": { sa3Name: "Salisbury", state: "SA", population: 118960 },
  "6000": { sa3Name: "Perth Inner", state: "WA", population: 167540 },
  "6168": { sa3Name: "Rockingham", state: "WA", population: 132450 },
  "7000": { sa3Name: "Hobart Inner", state: "TAS", population: 78920 },
  "0800": { sa3Name: "Darwin City", state: "NT", population: 82450 },
  "2601": { sa3Name: "Canberra Central", state: "ACT", population: 112380 },
  "2025": { sa3Name: "Eastern Suburbs", state: "NSW", population: 108520 },
  "3021": { sa3Name: "Brimbank", state: "VIC", population: 145830 },
  "4101": { sa3Name: "Brisbane South", state: "QLD", population: 138470 },
  "2200": { sa3Name: "Bankstown", state: "NSW", population: 152610 },
};

const CATEGORIES = ["violent", "property", "drug", "public-order", "traffic"] as const;

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

// Base rates per 100,000 by category
const BASE_RATES: Record<string, number> = {
  violent: 340,
  property: 1850,
  drug: 420,
  "public-order": 380,
  traffic: 720,
};

function generatePeriods(months: number): string[] {
  const periods: string[] = [];
  const now = new Date(2026, 2, 1);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const months = Math.min(parseInt(searchParams.get("months") ?? "12", 10), 24);
  const categoryFilter = searchParams.get("category");

  if (!postcode) {
    return NextResponse.json(
      { error: "postcode query parameter is required" },
      { status: 400 }
    );
  }

  // If postcode is not in our map, generate plausible data anyway
  const regionInfo = POSTCODE_SA3_MAP[postcode] ?? {
    sa3Name: `Region ${postcode}`,
    state: postcode.startsWith("2") ? "NSW"
      : postcode.startsWith("3") ? "VIC"
      : postcode.startsWith("4") ? "QLD"
      : postcode.startsWith("5") ? "SA"
      : postcode.startsWith("6") ? "WA"
      : postcode.startsWith("7") ? "TAS"
      : postcode.startsWith("08") ? "NT"
      : "ACT",
    population: 120000,
  };

  const periods = generatePeriods(months);
  const trends: TrendPoint[] = [];

  let previousTotal = 0;
  const previousByCat: Record<string, number> = {};

  for (const period of periods) {
    const byCategory: TrendPoint["byCategory"] = {};
    let totalCount = 0;
    let totalRate = 0;

    const categories = categoryFilter
      ? CATEGORIES.filter((c) => c === categoryFilter)
      : [...CATEGORIES];

    for (const cat of categories) {
      const regionSeed = seededRandom(`${postcode}-${cat}`);
      const baseRate = BASE_RATES[cat]! * (0.6 + regionSeed * 0.8);
      const seasonalFactor = 1 + 0.12 * Math.sin(
        (parseInt(period.split("-")[1]!) - 1) * Math.PI / 6
      );
      const noise = 0.9 + seededRandom(`${postcode}-${cat}-${period}`) * 0.2;
      const rate = baseRate * seasonalFactor * noise;
      const count = Math.round(rate * regionInfo.population / 100000);

      const prevCount = previousByCat[cat] ?? count;
      const changePercent = prevCount > 0
        ? Math.round(((count - prevCount) / prevCount) * 1000) / 10
        : 0;

      byCategory[cat] = {
        count,
        rate: Math.round(rate * 10) / 10,
        changePercent,
      };

      totalCount += count;
      totalRate += rate;
      previousByCat[cat] = count;
    }

    const totalChangePercent = previousTotal > 0
      ? Math.round(((totalCount - previousTotal) / previousTotal) * 1000) / 10
      : 0;

    trends.push({
      period,
      totalCount,
      totalRate: Math.round(totalRate * 10) / 10,
      changePercent: totalChangePercent,
      byCategory,
    });

    previousTotal = totalCount;
  }

  return NextResponse.json({
    postcode,
    sa3Name: regionInfo.sa3Name,
    state: regionInfo.state,
    population: regionInfo.population,
    months,
    trends,
  });
}
