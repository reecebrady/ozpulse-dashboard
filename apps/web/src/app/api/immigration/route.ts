import { NextRequest, NextResponse } from "next/server";

const ABS_MIGRATION_API =
  process.env.ABS_MIGRATION_API_URL ??
  "https://api.data.abs.gov.au/data/ABS,OVERSEAS_ARRIVALS_DEPARTURES";

const CACHE_TTL = 86400;
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiry) {
    if (entry) cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL * 1000 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const format = searchParams.get("format");

  try {
    if (format === "heatmap") return handleHeatmap();
    if (format === "flows") return handleFlows();
    if (format === "settlement") return handleSettlement(state);
    if (state) return handleByState(state);
    return handleNationalSummary();
  } catch (error) {
    console.error("Immigration API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch immigration data" },
      { status: 500 }
    );
  }
}

async function handleHeatmap() {
  const cacheKey = "immigration-heatmap";
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = generateMockMigrationHeatmap();
  setCache(cacheKey, data);
  return NextResponse.json(data);
}

async function handleFlows() {
  const cacheKey = "immigration-flows";
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = generateMockFlows();
  setCache(cacheKey, data);
  return NextResponse.json(data);
}

async function handleSettlement(state: string | null) {
  const cacheKey = `immigration-settlement-${state ?? "all"}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data = generateMockSettlement(state);
  setCache(cacheKey, data);
  return NextResponse.json(data);
}

async function handleByState(state: string) {
  const cacheKey = `immigration-state-${state}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const data: unknown[] = [];
  setCache(cacheKey, data);
  return NextResponse.json(data);
}

async function handleNationalSummary() {
  const cacheKey = "immigration-national";
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const summary = {
    lastUpdated: new Date().toISOString(),
    totalNetMigration: 518_000,
    byVisa: {
      skilled: { arrivals: 142_000, departures: 38_000, net: 104_000 },
      family: { arrivals: 78_000, departures: 22_000, net: 56_000 },
      student: { arrivals: 215_000, departures: 98_000, net: 117_000 },
      humanitarian: { arrivals: 18_000, departures: 2_000, net: 16_000 },
      "working-holiday": { arrivals: 85_000, departures: 62_000, net: 23_000 },
      business: { arrivals: 32_000, departures: 18_000, net: 14_000 },
      other: { arrivals: 45_000, departures: 33_000, net: 12_000 },
    },
    topSourceCountries: [
      { country: "India", arrivals: 128_000, percentage: 20.8 },
      { country: "China", arrivals: 85_000, percentage: 13.8 },
      { country: "Philippines", arrivals: 52_000, percentage: 8.4 },
      { country: "United Kingdom", arrivals: 42_000, percentage: 6.8 },
      { country: "Nepal", arrivals: 38_000, percentage: 6.2 },
      { country: "Vietnam", arrivals: 28_000, percentage: 4.5 },
      { country: "New Zealand", arrivals: 25_000, percentage: 4.1 },
      { country: "South Korea", arrivals: 22_000, percentage: 3.6 },
      { country: "Sri Lanka", arrivals: 18_000, percentage: 2.9 },
      { country: "Pakistan", arrivals: 16_000, percentage: 2.6 },
    ],
  };

  setCache(cacheKey, summary);
  return NextResponse.json(summary);
}

function generateMockMigrationHeatmap() {
  const points = [
    { postcode: "2000", lat: -33.8688, lng: 151.2093 },
    { postcode: "2145", lat: -33.7963, lng: 150.9637 },
    { postcode: "2170", lat: -33.9177, lng: 150.9318 },
    { postcode: "2200", lat: -33.9212, lng: 151.0299 },
    { postcode: "2770", lat: -33.7447, lng: 150.8165 },
    { postcode: "3000", lat: -37.8136, lng: 144.9631 },
    { postcode: "3029", lat: -37.7735, lng: 144.6605 },
    { postcode: "3064", lat: -37.5847, lng: 144.9327 },
    { postcode: "3150", lat: -37.8797, lng: 145.1744 },
    { postcode: "3175", lat: -37.9553, lng: 145.2149 },
    { postcode: "4000", lat: -27.4698, lng: 153.0251 },
    { postcode: "4101", lat: -27.4818, lng: 153.0166 },
    { postcode: "4215", lat: -27.9778, lng: 153.3943 },
    { postcode: "5000", lat: -34.9285, lng: 138.6007 },
    { postcode: "6000", lat: -31.9505, lng: 115.8605 },
    { postcode: "7000", lat: -42.8821, lng: 147.3272 },
    { postcode: "0800", lat: -12.4634, lng: 130.8456 },
    { postcode: "2600", lat: -35.2809, lng: 149.1300 },
  ];

  const seed = 42;
  return points.map((p, i) => ({
    ...p,
    value: Math.round(Math.sin(seed + i * 7) * 300 + 150),
  }));
}

function generateMockFlows() {
  const destinations = [
    { sa4: "Sydney - City and Inner South", lat: -33.8688, lng: 151.2093 },
    { sa4: "Melbourne - Inner", lat: -37.8136, lng: 144.9631 },
    { sa4: "Brisbane - Inner City", lat: -27.4698, lng: 153.0251 },
    { sa4: "Perth - Inner", lat: -31.9505, lng: 115.8605 },
    { sa4: "Adelaide - Central and Hills", lat: -34.9285, lng: 138.6007 },
  ];

  const sources = [
    { country: "India", lat: 20.5937, lng: 78.9629 },
    { country: "China", lat: 35.8617, lng: 104.1954 },
    { country: "United Kingdom", lat: 55.3781, lng: -3.436 },
    { country: "Philippines", lat: 12.8797, lng: 121.774 },
    { country: "Nepal", lat: 28.3949, lng: 84.124 },
    { country: "Vietnam", lat: 14.0583, lng: 108.2772 },
    { country: "New Zealand", lat: -40.9006, lng: 174.886 },
    { country: "South Korea", lat: 35.9078, lng: 127.7669 },
  ];

  const visaCategories = [
    "skilled",
    "student",
    "family",
    "working-holiday",
  ] as const;

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

  for (const src of sources) {
    for (const dest of destinations) {
      const visa =
        visaCategories[Math.floor(Math.random() * visaCategories.length)]!;
      flows.push({
        sourceCountry: src.country,
        sourceLat: src.lat,
        sourceLng: src.lng,
        destinationSA4: dest.sa4,
        destinationLat: dest.lat,
        destinationLng: dest.lng,
        arrivals: Math.round(Math.random() * 5000 + 500),
        visaCategory: visa,
      });
    }
  }

  return flows;
}

function generateMockSettlement(state: string | null) {
  const regions = [
    { region: "Sydney - South West", state: "NSW", lat: -33.92, lng: 150.87 },
    { region: "Melbourne - West", state: "VIC", lat: -37.77, lng: 144.66 },
    { region: "Brisbane - South", state: "QLD", lat: -27.55, lng: 153.04 },
    { region: "Perth - South East", state: "WA", lat: -32.05, lng: 115.94 },
    { region: "Adelaide - North", state: "SA", lat: -34.83, lng: 138.63 },
  ];

  const filtered = state
    ? regions.filter((r) => r.state === state)
    : regions;

  return filtered.map((r) => ({
    ...r,
    recentArrivals: Math.round(Math.random() * 8000 + 2000),
    settlerRetentionRate: Math.round((70 + Math.random() * 25) * 10) / 10,
    housingPressureIndex: Math.round(Math.random() * 60 + 30),
    medianRent: Math.round(Math.random() * 200 + 350),
    rentChangePercent: Math.round((Math.random() - 0.3) * 15 * 10) / 10,
    vacancyRate: Math.round(Math.random() * 3 * 100) / 100,
  }));
}
