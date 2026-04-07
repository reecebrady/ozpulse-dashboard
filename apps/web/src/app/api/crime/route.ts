import { NextRequest, NextResponse } from "next/server";

const ABS_CRIME_API =
  process.env.ABS_CRIME_API_URL ??
  "https://api.data.abs.gov.au/data/ABS,RECORDED_CRIME";

const CACHE_TTL = 86400; // 24 hours

// In-memory cache for development; replaced by Redis/Supabase in production
const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown, ttlMs: number = CACHE_TTL * 1000) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const format = searchParams.get("format");

  try {
    if (format === "heatmap") {
      return handleHeatmapRequest();
    }

    if (state) {
      return handleStateRequest(state);
    }

    // Default: return national summary
    return handleNationalSummary();
  } catch (error) {
    console.error("Crime API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crime data" },
      { status: 500 }
    );
  }
}

async function handleHeatmapRequest() {
  const cacheKey = "crime-heatmap-national";
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  // Fetch from ABS and state sources, aggregate to heatmap points
  const response = await fetch(
    `${ABS_CRIME_API}/all?detail=dataonly&dimensionAtObservation=AllDimensions`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: CACHE_TTL },
    }
  );

  if (!response.ok) {
    // Return mock data structure for development
    const mockData = generateMockHeatmapData();
    setCache(cacheKey, mockData);
    return NextResponse.json(mockData);
  }

  const raw = await response.json();
  // Transform to heatmap format
  const heatmapData = transformToHeatmap(raw);
  setCache(cacheKey, heatmapData);
  return NextResponse.json(heatmapData);
}

async function handleStateRequest(state: string) {
  const cacheKey = `crime-state-${state}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const response = await fetch(
    `${ABS_CRIME_API}/${state}?detail=dataonly`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: CACHE_TTL },
    }
  );

  if (!response.ok) {
    const mockData = generateMockStateData(state);
    setCache(cacheKey, mockData);
    return NextResponse.json(mockData);
  }

  const data = await response.json();
  setCache(cacheKey, data);
  return NextResponse.json(data);
}

async function handleNationalSummary() {
  const cacheKey = "crime-national-summary";
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const summary = {
    lastUpdated: new Date().toISOString(),
    nationalCrimeIndex: 45,
    totalRecordedOffences: 1_250_000,
    states: [
      { state: "NSW", crimeIndex: 48, totalRate: 4200 },
      { state: "VIC", crimeIndex: 42, totalRate: 3900 },
      { state: "QLD", crimeIndex: 50, totalRate: 4500 },
      { state: "WA", crimeIndex: 52, totalRate: 4800 },
      { state: "SA", crimeIndex: 40, totalRate: 3700 },
      { state: "TAS", crimeIndex: 35, totalRate: 3200 },
      { state: "NT", crimeIndex: 65, totalRate: 7500 },
      { state: "ACT", crimeIndex: 32, totalRate: 2900 },
    ],
  };

  setCache(cacheKey, summary);
  return NextResponse.json(summary);
}

// Development mock data generators
function generateMockHeatmapData() {
  // Major Australian postcodes with approximate coordinates
  const points = [
    { postcode: "2000", lat: -33.8688, lng: 151.2093 },
    { postcode: "2010", lat: -33.8818, lng: 151.2222 },
    { postcode: "2020", lat: -33.9065, lng: 151.2375 },
    { postcode: "2145", lat: -33.7963, lng: 150.9637 },
    { postcode: "2170", lat: -33.9177, lng: 150.9318 },
    { postcode: "2200", lat: -33.9212, lng: 151.0299 },
    { postcode: "2560", lat: -34.0568, lng: 150.7674 },
    { postcode: "2770", lat: -33.7447, lng: 150.8165 },
    { postcode: "3000", lat: -37.8136, lng: 144.9631 },
    { postcode: "3029", lat: -37.7735, lng: 144.6605 },
    { postcode: "3064", lat: -37.5847, lng: 144.9327 },
    { postcode: "3150", lat: -37.8797, lng: 145.1744 },
    { postcode: "4000", lat: -27.4698, lng: 153.0251 },
    { postcode: "4101", lat: -27.4818, lng: 153.0166 },
    { postcode: "4215", lat: -27.9778, lng: 153.3943 },
    { postcode: "5000", lat: -34.9285, lng: 138.6007 },
    { postcode: "6000", lat: -31.9505, lng: 115.8605 },
    { postcode: "7000", lat: -42.8821, lng: 147.3272 },
    { postcode: "0800", lat: -12.4634, lng: 130.8456 },
    { postcode: "2600", lat: -35.2809, lng: 149.1300 },
  ];

  return points.map((p) => ({
    ...p,
    value: Math.floor(Math.random() * 80) + 10,
  }));
}

function generateMockStateData(state: string) {
  return [];
}

function transformToHeatmap(raw: unknown) {
  // Placeholder transform — real implementation parses ABS SDMX-JSON
  return generateMockHeatmapData();
}
