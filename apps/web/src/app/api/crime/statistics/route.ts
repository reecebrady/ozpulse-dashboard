import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/crime/statistics
 *
 * Returns CrimeRecord[] for a region. Mock data based on ABS Recorded Crime
 * structure: offence categories, counts by SA3/postcode, 12-month rolling periods.
 *
 * Query params:
 *   - postcode (optional): filter to a specific postcode
 *   - state (optional): filter to an Australian state
 *   - sa3 (optional): filter to a specific SA3 region
 *   - format (optional): "heatmap" returns lat/lng/value array
 */

interface CrimeStatRecord {
  id: string;
  postcode: string;
  sa3Code: string;
  sa3Name: string;
  state: string;
  category: "violent" | "property" | "drug" | "public-order" | "traffic";
  offenceType: string;
  count: number;
  rate: number;
  population: number;
  period: string;
  changeFromPrevMonth: number;
  lat: number;
  lng: number;
}

// Real SA3 regions with realistic coordinates and populations
const SA3_REGIONS = [
  { sa3Code: "11703", sa3Name: "Parramatta", state: "NSW", postcode: "2150", lat: -33.8151, lng: 151.0011, population: 192340 },
  { sa3Code: "11501", sa3Name: "Sydney Inner City", state: "NSW", postcode: "2000", lat: -33.8688, lng: 151.2093, population: 231740 },
  { sa3Code: "11704", sa3Name: "Blacktown", state: "NSW", postcode: "2148", lat: -33.7690, lng: 150.9063, population: 165280 },
  { sa3Code: "11602", sa3Name: "Canterbury", state: "NSW", postcode: "2194", lat: -33.9181, lng: 151.1180, population: 143120 },
  { sa3Code: "11802", sa3Name: "Penrith", state: "NSW", postcode: "2750", lat: -33.7511, lng: 150.6942, population: 128760 },
  { sa3Code: "11901", sa3Name: "Newcastle", state: "NSW", postcode: "2300", lat: -32.9283, lng: 151.7817, population: 159830 },
  { sa3Code: "20604", sa3Name: "Melbourne City", state: "VIC", postcode: "3000", lat: -37.8136, lng: 144.9631, population: 178450 },
  { sa3Code: "20801", sa3Name: "Dandenong", state: "VIC", postcode: "3175", lat: -37.9863, lng: 145.2150, population: 156780 },
  { sa3Code: "20702", sa3Name: "Geelong", state: "VIC", postcode: "3220", lat: -38.1499, lng: 144.3617, population: 134920 },
  { sa3Code: "20603", sa3Name: "Boroondara", state: "VIC", postcode: "3124", lat: -37.8186, lng: 145.0658, population: 142560 },
  { sa3Code: "30101", sa3Name: "Brisbane Inner", state: "QLD", postcode: "4000", lat: -27.4698, lng: 153.0251, population: 198620 },
  { sa3Code: "30301", sa3Name: "Gold Coast North", state: "QLD", postcode: "4217", lat: -27.9706, lng: 153.4000, population: 147350 },
  { sa3Code: "30201", sa3Name: "Cairns", state: "QLD", postcode: "4870", lat: -16.9186, lng: 145.7781, population: 98430 },
  { sa3Code: "30501", sa3Name: "Townsville", state: "QLD", postcode: "4810", lat: -19.2590, lng: 146.8169, population: 112890 },
  { sa3Code: "40101", sa3Name: "Adelaide City", state: "SA", postcode: "5000", lat: -34.9285, lng: 138.6007, population: 145280 },
  { sa3Code: "40201", sa3Name: "Salisbury", state: "SA", postcode: "5108", lat: -34.7639, lng: 138.6466, population: 118960 },
  { sa3Code: "50101", sa3Name: "Perth Inner", state: "WA", postcode: "6000", lat: -31.9505, lng: 115.8605, population: 167540 },
  { sa3Code: "50301", sa3Name: "Rockingham", state: "WA", postcode: "6168", lat: -32.2797, lng: 115.7439, population: 132450 },
  { sa3Code: "60101", sa3Name: "Hobart Inner", state: "TAS", postcode: "7000", lat: -42.8821, lng: 147.3272, population: 78920 },
  { sa3Code: "70101", sa3Name: "Darwin City", state: "NT", postcode: "0800", lat: -12.4634, lng: 130.8456, population: 82450 },
  { sa3Code: "80101", sa3Name: "Canberra Central", state: "ACT", postcode: "2601", lat: -35.2809, lng: 149.1300, population: 112380 },
  { sa3Code: "11502", sa3Name: "Eastern Suburbs", state: "NSW", postcode: "2025", lat: -33.8860, lng: 151.2544, population: 108520 },
  { sa3Code: "20605", sa3Name: "Brimbank", state: "VIC", postcode: "3021", lat: -37.7663, lng: 144.7834, population: 145830 },
  { sa3Code: "30102", sa3Name: "Brisbane South", state: "QLD", postcode: "4101", lat: -27.4975, lng: 153.0137, population: 138470 },
  { sa3Code: "11701", sa3Name: "Bankstown", state: "NSW", postcode: "2200", lat: -33.9175, lng: 151.0356, population: 152610 },
] as const;

const OFFENCE_TYPES: Record<string, { category: CrimeStatRecord["category"]; subtypes: string[] }> = {
  violent: {
    category: "violent",
    subtypes: [
      "Assault",
      "Sexual Assault",
      "Robbery",
      "Homicide",
      "Abduction/Kidnapping",
      "Blackmail/Extortion",
    ],
  },
  property: {
    category: "property",
    subtypes: [
      "Break and Enter",
      "Motor Vehicle Theft",
      "Theft (excl. Motor Vehicle)",
      "Fraud",
      "Arson",
      "Property Damage",
    ],
  },
  drug: {
    category: "drug",
    subtypes: [
      "Drug Possession",
      "Drug Dealing/Trafficking",
      "Drug Manufacturing",
      "Drug Use",
    ],
  },
  "public-order": {
    category: "public-order",
    subtypes: [
      "Disorderly Conduct",
      "Offensive Language/Behaviour",
      "Trespassing",
      "Weapons Offences",
      "Liquor Offences",
    ],
  },
  traffic: {
    category: "traffic",
    subtypes: [
      "Dangerous/Negligent Driving",
      "Driving Under Influence",
      "Licence Offences",
      "Speeding",
    ],
  },
};

// Deterministic pseudo-random based on seed string
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

// Per-capita rate base ranges by category (per 100,000 population)
const RATE_BASES: Record<string, { min: number; max: number }> = {
  violent: { min: 120, max: 680 },
  property: { min: 800, max: 3200 },
  drug: { min: 180, max: 920 },
  "public-order": { min: 200, max: 750 },
  traffic: { min: 350, max: 1400 },
};

function generatePeriods(months: number = 12): string[] {
  const periods: string[] = [];
  const now = new Date(2026, 2, 1); // March 2026
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

function generateRecords(
  region: (typeof SA3_REGIONS)[number],
  periods: string[]
): CrimeStatRecord[] {
  const records: CrimeStatRecord[] = [];

  for (const [catKey, catDef] of Object.entries(OFFENCE_TYPES)) {
    const baseRange = RATE_BASES[catKey]!;

    for (const subtype of catDef.subtypes) {
      const subtypeWeight = seededRandom(`${region.sa3Code}-${subtype}`);
      const baseRate = baseRange.min + (baseRange.max - baseRange.min) * subtypeWeight;

      let previousCount = 0;
      for (const period of periods) {
        const seasonalFactor = 1 + 0.15 * Math.sin(
          (parseInt(period.split("-")[1]!) - 1) * Math.PI / 6
        );
        const noise = 0.85 + seededRandom(`${region.sa3Code}-${subtype}-${period}`) * 0.3;
        const rate = baseRate * seasonalFactor * noise / catDef.subtypes.length;
        const count = Math.round(rate * region.population / 100000);
        const change = previousCount > 0
          ? Math.round(((count - previousCount) / previousCount) * 1000) / 10
          : 0;

        records.push({
          id: `${region.sa3Code}-${catKey}-${subtype.replace(/\s+/g, "-").toLowerCase()}-${period}`,
          postcode: region.postcode,
          sa3Code: region.sa3Code,
          sa3Name: region.sa3Name,
          state: region.state,
          category: catDef.category,
          offenceType: subtype,
          count,
          rate: Math.round(rate * 10) / 10,
          population: region.population,
          period,
          changeFromPrevMonth: change,
          lat: region.lat,
          lng: region.lng,
        });

        previousCount = count;
      }
    }
  }

  return records;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const state = searchParams.get("state");
  const sa3 = searchParams.get("sa3");
  const format = searchParams.get("format");

  const periods = generatePeriods(12);

  let filteredRegions = [...SA3_REGIONS];

  if (postcode) {
    filteredRegions = filteredRegions.filter((r) => r.postcode === postcode);
  }
  if (state) {
    filteredRegions = filteredRegions.filter((r) => r.state === state.toUpperCase());
  }
  if (sa3) {
    filteredRegions = filteredRegions.filter((r) => r.sa3Code === sa3);
  }

  const allRecords = filteredRegions.flatMap((region) =>
    generateRecords(region, periods)
  );

  if (format === "heatmap") {
    // Aggregate to heatmap points: latest period, total per-capita rate per region
    const latestPeriod = periods[periods.length - 1]!;
    const heatmapData = filteredRegions.map((region) => {
      const regionRecords = allRecords.filter(
        (r) => r.sa3Code === region.sa3Code && r.period === latestPeriod
      );
      const totalRate = regionRecords.reduce((sum, r) => sum + r.rate, 0);
      return {
        lat: region.lat,
        lng: region.lng,
        value: Math.round(totalRate),
        postcode: region.postcode,
        sa3Name: region.sa3Name,
      };
    });
    return NextResponse.json(heatmapData);
  }

  // Default: return latest period only (unless requesting full history)
  const latestOnly = searchParams.get("history") !== "true";
  const result = latestOnly
    ? allRecords.filter((r) => r.period === periods[periods.length - 1])
    : allRecords;

  return NextResponse.json(result);
}
