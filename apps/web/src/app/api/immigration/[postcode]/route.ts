import { NextRequest, NextResponse } from "next/server";
import type { PostcodeMigrationSummary, VisaCategory } from "@/src/features/immigration-demographics/types";

const CACHE_TTL = 86400;
const cache = new Map<string, { data: unknown; expiry: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postcode: string }> }
) {
  const { postcode } = await params;
  const { searchParams } = new URL(request.url);
  const wantTrends = searchParams.get("trends") === "true";
  const quarters = parseInt(searchParams.get("quarters") ?? "8", 10);

  if (!/^\d{4}$/.test(postcode)) {
    return NextResponse.json(
      { error: "Invalid postcode format" },
      { status: 400 }
    );
  }

  try {
    if (wantTrends) {
      return NextResponse.json(generateTrends(postcode, quarters));
    }

    const cacheKey = `immigration-${postcode}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return NextResponse.json(cached.data);
    }

    const data = generateMockMigrationSummary(postcode);
    cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL * 1000 });
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Immigration API error for ${postcode}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch immigration data" },
      { status: 500 }
    );
  }
}

const POSTCODE_INFO: Record<
  string,
  { sa4: string; lat: number; lng: number }
> = {
  "2000": { sa4: "Sydney - City and Inner South", lat: -33.8688, lng: 151.2093 },
  "2145": { sa4: "Sydney - Parramatta", lat: -33.7963, lng: 150.9637 },
  "2170": { sa4: "Sydney - South West", lat: -33.9177, lng: 150.9318 },
  "2200": { sa4: "Sydney - Inner South West", lat: -33.9212, lng: 151.0299 },
  "2770": { sa4: "Sydney - Blacktown", lat: -33.7447, lng: 150.8165 },
  "3000": { sa4: "Melbourne - Inner", lat: -37.8136, lng: 144.9631 },
  "3175": { sa4: "Melbourne - South East", lat: -37.9553, lng: 145.2149 },
  "4000": { sa4: "Brisbane - Inner City", lat: -27.4698, lng: 153.0251 },
  "5000": { sa4: "Adelaide - Central and Hills", lat: -34.9285, lng: 138.6007 },
  "6000": { sa4: "Perth - Inner", lat: -31.9505, lng: 115.8605 },
};

function generateMockMigrationSummary(
  postcode: string
): PostcodeMigrationSummary {
  const info = POSTCODE_INFO[postcode] ?? {
    sa4: `SA4-${postcode}`,
    lat: -33.8688,
    lng: 151.2093,
  };

  const seed = parseInt(postcode, 10);
  const rng = (offset: number) =>
    ((Math.sin(seed + offset) * 10000) % 1 + 1) % 1;

  const visaCategories: VisaCategory[] = [
    "skilled",
    "family",
    "student",
    "humanitarian",
    "working-holiday",
    "business",
    "other",
  ];

  const byVisaCategory: PostcodeMigrationSummary["byVisaCategory"] = {};
  let totalArrivals = 0;
  let totalDepartures = 0;

  for (let i = 0; i < visaCategories.length; i++) {
    const arrivals = Math.round(rng(i * 100 + 1) * 2000 + 100);
    const departures = Math.round(rng(i * 100 + 2) * arrivals * 0.6);
    totalArrivals += arrivals;
    totalDepartures += departures;
    byVisaCategory[visaCategories[i]!] = {
      arrivals,
      departures,
      net: arrivals - departures,
    };
  }

  const countries = [
    "India", "China", "Philippines", "United Kingdom", "Nepal",
    "Vietnam", "New Zealand", "South Korea", "Sri Lanka", "Pakistan",
    "Malaysia", "South Africa", "Indonesia", "Bangladesh", "Lebanon",
  ];

  const topSourceCountries = countries
    .map((country, i) => {
      const arrivals = Math.round(rng(i * 50 + 10) * totalArrivals * 0.15);
      return {
        country,
        arrivals,
        percentage:
          Math.round((arrivals / Math.max(totalArrivals, 1)) * 1000) / 10,
      };
    })
    .sort((a, b) => b.arrivals - a.arrivals)
    .slice(0, 10);

  const netMigration = totalArrivals - totalDepartures;
  const changePercent = Math.round((rng(777) - 0.4) * 10 * 10) / 10;

  const state = postcode.startsWith("2")
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
              : postcode.startsWith("0")
                ? "NT"
                : "ACT";

  const trends = generateTrends(postcode, 8);

  return {
    postcode,
    sa4Code: info.sa4,
    sa4Name: info.sa4,
    state,
    lat: info.lat,
    lng: info.lng,
    totalArrivals,
    totalDepartures,
    netMigration,
    netMigrationChangePercent: changePercent,
    byVisaCategory,
    topSourceCountries,
    trends,
  };
}

function generateTrends(postcode: string, quarters: number) {
  const seed = parseInt(postcode, 10);
  const rng = (offset: number) =>
    ((Math.sin(seed + offset) * 10000) % 1 + 1) % 1;

  const now = new Date();
  return Array.from({ length: quarters }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (quarters - 1 - i) * 3);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const period = `${year}-Q${quarter}`;

    const arrivals = Math.round(rng(i * 30 + 1) * 3000 + 500);
    const departures = Math.round(rng(i * 30 + 2) * arrivals * 0.55);

    return {
      period,
      arrivals,
      departures,
      net: arrivals - departures,
    };
  });
}
