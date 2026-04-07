import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/demographics/migration
 *
 * Returns MigrationData[] with realistic ABS-style data:
 * net arrivals by visa category (skilled, family, student, humanitarian)
 * and top 20 source countries. Mock for major SA4 regions.
 *
 * Query params:
 *   - sa4 (optional): filter to a specific SA4 region
 *   - postcode (optional): resolve to SA4 and return data
 *   - state (optional): filter by state
 *   - format (optional): "heatmap" for map overlay, "flows" for flow arrows
 *   - period (optional): specific quarter (e.g., "2025-Q4")
 */

interface MigrationRecord {
  id: string;
  sa4Code: string;
  sa4Name: string;
  postcode: string;
  state: string;
  period: string;
  visaCategory: "skilled" | "family" | "student" | "humanitarian" | "working-holiday" | "business" | "other";
  sourceCountry: string;
  arrivals: number;
  departures: number;
  netMovement: number;
  lat: number;
  lng: number;
}

interface MigrationSummary {
  sa4Code: string;
  sa4Name: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
  totalArrivals: number;
  totalDepartures: number;
  netMigration: number;
  netMigrationChangePercent: number;
  byVisaCategory: Record<string, { arrivals: number; departures: number; net: number }>;
  topSourceCountries: { country: string; arrivals: number; percentage: number }[];
  trends: { period: string; arrivals: number; departures: number; net: number }[];
}

const SA4_REGIONS = [
  { sa4Code: "117", sa4Name: "Sydney - Parramatta", state: "NSW", postcode: "2150", lat: -33.8151, lng: 151.0011 },
  { sa4Code: "115", sa4Name: "Sydney - City and Inner South", state: "NSW", postcode: "2000", lat: -33.8688, lng: 151.2093 },
  { sa4Code: "116", sa4Name: "Sydney - Inner South West", state: "NSW", postcode: "2194", lat: -33.9181, lng: 151.1180 },
  { sa4Code: "118", sa4Name: "Sydney - Outer West", state: "NSW", postcode: "2148", lat: -33.7690, lng: 150.9063 },
  { sa4Code: "110", sa4Name: "Newcastle and Lake Macquarie", state: "NSW", postcode: "2300", lat: -32.9283, lng: 151.7817 },
  { sa4Code: "206", sa4Name: "Melbourne - Inner", state: "VIC", postcode: "3000", lat: -37.8136, lng: 144.9631 },
  { sa4Code: "208", sa4Name: "Melbourne - South East", state: "VIC", postcode: "3175", lat: -37.9863, lng: 145.2150 },
  { sa4Code: "207", sa4Name: "Melbourne - West", state: "VIC", postcode: "3021", lat: -37.7663, lng: 144.7834 },
  { sa4Code: "210", sa4Name: "Geelong", state: "VIC", postcode: "3220", lat: -38.1499, lng: 144.3617 },
  { sa4Code: "301", sa4Name: "Brisbane - Inner City", state: "QLD", postcode: "4000", lat: -27.4698, lng: 153.0251 },
  { sa4Code: "303", sa4Name: "Gold Coast", state: "QLD", postcode: "4217", lat: -27.9706, lng: 153.4000 },
  { sa4Code: "306", sa4Name: "Cairns", state: "QLD", postcode: "4870", lat: -16.9186, lng: 145.7781 },
  { sa4Code: "309", sa4Name: "Townsville", state: "QLD", postcode: "4810", lat: -19.2590, lng: 146.8169 },
  { sa4Code: "401", sa4Name: "Adelaide - Central", state: "SA", postcode: "5000", lat: -34.9285, lng: 138.6007 },
  { sa4Code: "402", sa4Name: "Adelaide - North", state: "SA", postcode: "5108", lat: -34.7639, lng: 138.6466 },
  { sa4Code: "501", sa4Name: "Perth - Inner", state: "WA", postcode: "6000", lat: -31.9505, lng: 115.8605 },
  { sa4Code: "503", sa4Name: "Perth - South West", state: "WA", postcode: "6168", lat: -32.2797, lng: 115.7439 },
  { sa4Code: "601", sa4Name: "Hobart", state: "TAS", postcode: "7000", lat: -42.8821, lng: 147.3272 },
  { sa4Code: "701", sa4Name: "Darwin", state: "NT", postcode: "0800", lat: -12.4634, lng: 130.8456 },
  { sa4Code: "801", sa4Name: "Australian Capital Territory", state: "ACT", postcode: "2601", lat: -35.2809, lng: 149.1300 },
] as const;

const VISA_CATEGORIES = ["skilled", "family", "student", "humanitarian", "working-holiday", "business", "other"] as const;

const TOP_SOURCE_COUNTRIES = [
  "India", "China", "United Kingdom", "Philippines", "New Zealand",
  "Vietnam", "Nepal", "South Korea", "Sri Lanka", "Pakistan",
  "Malaysia", "South Africa", "Indonesia", "Bangladesh", "Lebanon",
  "Thailand", "United States", "Ireland", "Colombia", "Brazil",
] as const;

const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  India: { lat: 20.5937, lng: 78.9629 },
  China: { lat: 35.8617, lng: 104.1954 },
  "United Kingdom": { lat: 55.3781, lng: -3.436 },
  Philippines: { lat: 12.8797, lng: 121.774 },
  "New Zealand": { lat: -40.9006, lng: 174.886 },
  Vietnam: { lat: 14.0583, lng: 108.2772 },
  Nepal: { lat: 28.3949, lng: 84.124 },
  "South Korea": { lat: 35.9078, lng: 127.7669 },
  "Sri Lanka": { lat: 7.8731, lng: 80.7718 },
  Pakistan: { lat: 30.3753, lng: 69.3451 },
  Malaysia: { lat: 4.2105, lng: 101.9758 },
  "South Africa": { lat: -30.5595, lng: 22.9375 },
  Indonesia: { lat: -0.7893, lng: 113.9213 },
  Bangladesh: { lat: 23.685, lng: 90.3563 },
  Lebanon: { lat: 33.8547, lng: 35.8623 },
  Thailand: { lat: 15.87, lng: 100.9925 },
  "United States": { lat: 37.0902, lng: -95.7129 },
  Ireland: { lat: 53.1424, lng: -7.6921 },
  Colombia: { lat: 4.5709, lng: -74.2973 },
  Brazil: { lat: -14.235, lng: -51.9253 },
};

// Visa category weights by region type (city vs regional)
const VISA_WEIGHTS: Record<string, Record<string, number>> = {
  city: { skilled: 0.35, student: 0.28, family: 0.18, "working-holiday": 0.08, business: 0.05, humanitarian: 0.04, other: 0.02 },
  regional: { skilled: 0.22, student: 0.12, family: 0.24, "working-holiday": 0.15, business: 0.03, humanitarian: 0.18, other: 0.06 },
};

// Country weights — probability distribution for arrivals by country
const COUNTRY_WEIGHTS: Record<string, number> = {
  India: 0.22, China: 0.14, "United Kingdom": 0.08, Philippines: 0.07, "New Zealand": 0.06,
  Vietnam: 0.05, Nepal: 0.05, "South Korea": 0.04, "Sri Lanka": 0.04, Pakistan: 0.03,
  Malaysia: 0.03, "South Africa": 0.03, Indonesia: 0.03, Bangladesh: 0.03, Lebanon: 0.02,
  Thailand: 0.02, "United States": 0.02, Ireland: 0.01, Colombia: 0.01, Brazil: 0.01,
};

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

function generateQuarters(count: number = 8): string[] {
  const quarters: string[] = [];
  // Work back from 2026-Q1
  let year = 2026;
  let q = 1;
  for (let i = 0; i < count; i++) {
    quarters.unshift(`${year}-Q${q}`);
    q--;
    if (q < 1) { q = 4; year--; }
  }
  return quarters;
}

function isCity(sa4Code: string): boolean {
  const cityCodes = new Set(["117", "115", "116", "118", "206", "208", "207", "301", "401", "501", "801"]);
  return cityCodes.has(sa4Code);
}

function generateRegionSummary(
  region: (typeof SA4_REGIONS)[number],
  quarters: string[]
): MigrationSummary {
  const regionType = isCity(region.sa4Code) ? "city" : "regional";
  const weights = VISA_WEIGHTS[regionType]!;

  // Base annual arrivals per region (varies by size/attractiveness)
  const baseAnnualArrivals = Math.round(
    (isCity(region.sa4Code) ? 8000 : 2000) *
    (0.6 + seededRandom(region.sa4Code) * 0.8)
  );

  const trends: MigrationSummary["trends"] = [];
  const byVisaCategory: MigrationSummary["byVisaCategory"] = {};
  const countryArrivals: Record<string, number> = {};

  for (const quarter of quarters) {
    const yearFactor = 1 + 0.03 * (quarters.indexOf(quarter) - quarters.length / 2);
    const seasonalFactor = quarter.endsWith("Q1") ? 1.15
      : quarter.endsWith("Q2") ? 0.85
      : quarter.endsWith("Q3") ? 0.95
      : 1.05;
    const noise = 0.9 + seededRandom(`${region.sa4Code}-${quarter}`) * 0.2;

    const quarterArrivals = Math.round(baseAnnualArrivals / 4 * yearFactor * seasonalFactor * noise);
    const departureRatio = 0.3 + seededRandom(`dep-${region.sa4Code}-${quarter}`) * 0.25;
    const quarterDepartures = Math.round(quarterArrivals * departureRatio);

    trends.push({
      period: quarter,
      arrivals: quarterArrivals,
      departures: quarterDepartures,
      net: quarterArrivals - quarterDepartures,
    });
  }

  const latestQuarter = quarters[quarters.length - 1]!;
  const latestTrend = trends[trends.length - 1]!;
  const prevTrend = trends[trends.length - 2];
  const netChange = prevTrend
    ? Math.round(((latestTrend.net - prevTrend.net) / Math.abs(prevTrend.net || 1)) * 1000) / 10
    : 0;

  // Build visa category breakdown from latest quarter
  for (const visa of VISA_CATEGORIES) {
    const weight = weights[visa] ?? 0.02;
    const visaArrivals = Math.round(latestTrend.arrivals * weight);
    const visaDepartures = Math.round(latestTrend.departures * weight);
    byVisaCategory[visa] = {
      arrivals: visaArrivals,
      departures: visaDepartures,
      net: visaArrivals - visaDepartures,
    };
  }

  // Build source country ranking from latest quarter
  for (const country of TOP_SOURCE_COUNTRIES) {
    const countryWeight = COUNTRY_WEIGHTS[country] ?? 0.01;
    const regionBias = seededRandom(`${region.sa4Code}-${country}`);
    countryArrivals[country] = Math.round(
      latestTrend.arrivals * countryWeight * (0.5 + regionBias)
    );
  }

  const totalCountryArrivals = Object.values(countryArrivals).reduce((a, b) => a + b, 0);
  const topSourceCountries = Object.entries(countryArrivals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([country, arrivals]) => ({
      country,
      arrivals,
      percentage: Math.round((arrivals / totalCountryArrivals) * 1000) / 10,
    }));

  return {
    sa4Code: region.sa4Code,
    sa4Name: region.sa4Name,
    state: region.state,
    postcode: region.postcode,
    lat: region.lat,
    lng: region.lng,
    totalArrivals: latestTrend.arrivals,
    totalDepartures: latestTrend.departures,
    netMigration: latestTrend.net,
    netMigrationChangePercent: netChange,
    byVisaCategory,
    topSourceCountries,
    trends,
  };
}

function generateFlowLines(
  regions: typeof SA4_REGIONS,
  quarters: string[]
): {
  sourceCountry: string;
  sourceLat: number;
  sourceLng: number;
  destinationSA4: string;
  destinationLat: number;
  destinationLng: number;
  arrivals: number;
  visaCategory: string;
}[] {
  const flows: {
    sourceCountry: string;
    sourceLat: number;
    sourceLng: number;
    destinationSA4: string;
    destinationLat: number;
    destinationLng: number;
    arrivals: number;
    visaCategory: string;
  }[] = [];

  // Top 5 destination cities, top 5 source countries = 25 flow lines
  const topDestinations = regions.filter((r) => isCity(r.sa4Code)).slice(0, 5);
  const topCountries = TOP_SOURCE_COUNTRIES.slice(0, 5);

  for (const dest of topDestinations) {
    for (const country of topCountries) {
      const coords = COUNTRY_COORDINATES[country]!;
      const arrivals = Math.round(
        1000 * (COUNTRY_WEIGHTS[country] ?? 0.01) *
        (0.5 + seededRandom(`flow-${dest.sa4Code}-${country}`) * 1.5)
      );

      const visaIdx = Math.floor(seededRandom(`visa-${dest.sa4Code}-${country}`) * 3);
      const visas: (typeof VISA_CATEGORIES)[number][] = ["skilled", "student", "family"];

      flows.push({
        sourceCountry: country,
        sourceLat: coords.lat,
        sourceLng: coords.lng,
        destinationSA4: dest.sa4Name,
        destinationLat: dest.lat,
        destinationLng: dest.lng,
        arrivals,
        visaCategory: visas[visaIdx]!,
      });
    }
  }

  return flows.sort((a, b) => b.arrivals - a.arrivals);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sa4Filter = searchParams.get("sa4");
  const postcodeFilter = searchParams.get("postcode");
  const stateFilter = searchParams.get("state");
  const format = searchParams.get("format");
  const quartersParam = parseInt(searchParams.get("quarters") ?? "8", 10);

  const quarters = generateQuarters(Math.min(quartersParam, 16));

  let filteredRegions = [...SA4_REGIONS];

  if (sa4Filter) {
    filteredRegions = filteredRegions.filter((r) => r.sa4Code === sa4Filter);
  }
  if (postcodeFilter) {
    filteredRegions = filteredRegions.filter((r) => r.postcode === postcodeFilter);
  }
  if (stateFilter) {
    filteredRegions = filteredRegions.filter((r) => r.state === stateFilter.toUpperCase());
  }

  if (format === "heatmap") {
    const heatmapData = filteredRegions.map((region) => {
      const summary = generateRegionSummary(region, quarters);
      return {
        lat: region.lat,
        lng: region.lng,
        value: summary.netMigration,
        postcode: region.postcode,
        sa4Name: region.sa4Name,
      };
    });
    return NextResponse.json(heatmapData);
  }

  if (format === "flows") {
    const flows = generateFlowLines(filteredRegions as unknown as typeof SA4_REGIONS, quarters);
    return NextResponse.json(flows);
  }

  const summaries = filteredRegions.map((region) =>
    generateRegionSummary(region, quarters)
  );

  if (postcodeFilter || sa4Filter) {
    return NextResponse.json(summaries[0] ?? null);
  }

  return NextResponse.json(summaries);
}
