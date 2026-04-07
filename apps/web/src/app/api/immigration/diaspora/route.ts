import { NextRequest, NextResponse } from "next/server";
import type { DiasporaConcentration } from "@/src/features/immigration-demographics/types";

const CACHE_TTL = 86400;
const cache = new Map<string, { data: unknown; expiry: number }>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const state = searchParams.get("state");

  try {
    if (postcode) {
      return handleByPostcode(postcode);
    }
    return handleDiasporaMap(state);
  } catch (error) {
    console.error("Diaspora API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch diaspora data" },
      { status: 500 }
    );
  }
}

async function handleByPostcode(postcode: string) {
  const cacheKey = `diaspora-${postcode}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.json(cached.data);
  }

  const data = generateMockDiaspora(postcode);
  cache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL * 1000 });
  return NextResponse.json(data);
}

async function handleDiasporaMap(state: string | null) {
  const postcodes = state
    ? Object.keys(POSTCODE_SUBURBS).filter((pc) => {
        const s = pc.startsWith("2") ? "NSW"
          : pc.startsWith("3") ? "VIC"
          : pc.startsWith("4") ? "QLD"
          : pc.startsWith("5") ? "SA"
          : pc.startsWith("6") ? "WA"
          : "OTHER";
        return s === state;
      })
    : Object.keys(POSTCODE_SUBURBS);

  const data = postcodes.map((pc) => generateMockDiaspora(pc));
  return NextResponse.json(data);
}

const POSTCODE_SUBURBS: Record<
  string,
  { suburb: string; lat: number; lng: number; population: number }
> = {
  "2170": { suburb: "Liverpool", lat: -33.9177, lng: 150.9318, population: 32000 },
  "2200": { suburb: "Bankstown", lat: -33.9212, lng: 151.0299, population: 35000 },
  "2145": { suburb: "Westmead", lat: -33.7963, lng: 150.9637, population: 28000 },
  "2770": { suburb: "Mount Druitt", lat: -33.7447, lng: 150.8165, population: 30000 },
  "2166": { suburb: "Cabramatta", lat: -33.8941, lng: 150.9347, population: 22000 },
  "3175": { suburb: "Dandenong", lat: -37.9553, lng: 145.2149, population: 30000 },
  "3029": { suburb: "Hoppers Crossing", lat: -37.7735, lng: 144.6605, population: 35000 },
  "3064": { suburb: "Craigieburn", lat: -37.5847, lng: 144.9327, population: 32000 },
  "4101": { suburb: "South Brisbane", lat: -27.4818, lng: 153.0166, population: 18000 },
  "4215": { suburb: "Southport", lat: -27.9778, lng: 153.3943, population: 25000 },
};

function generateMockDiaspora(postcode: string): DiasporaConcentration {
  const info = POSTCODE_SUBURBS[postcode] ?? {
    suburb: `Suburb ${postcode}`,
    lat: -33.8688,
    lng: 151.2093,
    population: 25000,
  };

  const seed = parseInt(postcode, 10);
  const rng = (offset: number) =>
    ((Math.sin(seed + offset) * 10000) % 1 + 1) % 1;

  const ancestries = [
    "Chinese", "Indian", "Vietnamese", "Filipino", "Lebanese",
    "Greek", "Italian", "Korean", "Bangladeshi", "Sri Lankan",
    "Pakistani", "Nepalese", "Indonesian", "Thai", "Iraqi",
    "South African", "English", "Irish", "New Zealand Maori", "Samoan",
  ];

  const topAncestries = ancestries
    .map((country, i) => {
      const percentage = rng(i * 10 + 1) * 12;
      return {
        country,
        count: Math.round((percentage / 100) * info.population),
        percentage: Math.round(percentage * 10) / 10,
        yearOnYearChange: Math.round((rng(i * 10 + 2) - 0.4) * 4 * 10) / 10,
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 15);

  const languages = [
    "Mandarin", "Vietnamese", "Arabic", "Cantonese", "Hindi",
    "Filipino/Tagalog", "Greek", "Italian", "Korean", "Punjabi",
    "Bengali", "Nepali", "Indonesian", "Tamil", "Spanish",
  ];

  const languagesSpokenAtHome = languages
    .map((language, i) => {
      const percentage = rng(i * 20 + 5) * 8;
      return {
        language,
        count: Math.round((percentage / 100) * info.population),
        percentage: Math.round(percentage * 10) / 10,
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  const overseasBornPercent = Math.round(
    topAncestries.reduce((sum, a) => sum + a.percentage, 0)
  );
  const englishOnly = Math.round(100 - overseasBornPercent * 0.7);

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
            : "OTHER";

  return {
    postcode,
    suburb: info.suburb,
    state,
    lat: info.lat,
    lng: info.lng,
    totalPopulation: info.population,
    overseasBornPercent: Math.min(75, overseasBornPercent),
    topAncestries,
    languagesSpokenAtHome,
    englishProficiency: {
      speaksOnlyEnglish: Math.max(20, englishOnly),
      speaksOtherVeryWell: Math.round(rng(500) * 30 + 20),
      speaksOtherNotWell: Math.round(rng(501) * 10 + 2),
      notStated: Math.round(rng(502) * 5 + 1),
    },
  };
}
