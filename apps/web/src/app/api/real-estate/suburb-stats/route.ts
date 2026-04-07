import { NextRequest, NextResponse } from "next/server";
import type { SuburbStats } from "@ozpulse/shared";
import { MAJOR_SUBURBS } from "@/features/real-estate/lib/constants";

/**
 * GET /api/real-estate/suburb-stats?postcode=2150
 * GET /api/real-estate/suburb-stats (returns all ~50 major suburbs)
 *
 * Returns suburb-level aggregates: median price, days on market,
 * rental yield, auction clearance rate, price index vs national average.
 */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function baseMedian(postcode: string): number {
  const code = parseInt(postcode, 10);
  if (code >= 2000 && code <= 2100) return 1_200_000 + (hashCode(postcode) % 400_000);
  if (code >= 2100 && code <= 2800) return 650_000 + (hashCode(postcode) % 350_000);
  if (code >= 3000 && code <= 3100) return 950_000 + (hashCode(postcode) % 350_000);
  if (code >= 3100 && code <= 3999) return 550_000 + (hashCode(postcode) % 300_000);
  if (code >= 4000 && code <= 4500) return 500_000 + (hashCode(postcode) % 250_000);
  if (code >= 5000 && code <= 5200) return 450_000 + (hashCode(postcode) % 200_000);
  if (code >= 6000 && code <= 6300) return 500_000 + (hashCode(postcode) % 250_000);
  if (code >= 7000 && code <= 7300) return 450_000 + (hashCode(postcode) % 150_000);
  if (code >= 2600 && code <= 2620) return 750_000 + (hashCode(postcode) % 250_000);
  return 400_000 + (hashCode(postcode) % 200_000);
}

// National average for comparison (approximate 2025-26 median)
const NATIONAL_MEDIAN = 810_000;
const NATIONAL_DAYS_ON_MARKET = 34;
const NATIONAL_RENTAL_YIELD = 3.8;
const NATIONAL_CLEARANCE_RATE = 62;

function generateSuburbStats(postcode: string, suburb: string, state: string, lat: number, lng: number): SuburbStats {
  const rand = seededRandom(hashCode(postcode + "suburb-stats"));
  const median = baseMedian(postcode);

  const medianHouse = Math.round(median * (0.9 + rand() * 0.3));
  const medianApt = Math.round(median * (0.5 + rand() * 0.2));
  const medianPerSqm = Math.round(median / (120 + rand() * 60));
  const daysOnMarket = Math.floor(18 + rand() * 55);
  const clearanceRate = +(50 + rand() * 35).toFixed(1);
  const totalListings = Math.floor(40 + rand() * 250);
  const totalSales = Math.floor(80 + rand() * 500);
  const rentalYield = +(2.5 + rand() * 3.5).toFixed(1);
  const priceChange12m = +(-8 + rand() * 20).toFixed(1);
  const priceChange5y = +(5 + rand() * 50).toFixed(1);
  const population = Math.floor(5000 + rand() * 40000);

  return {
    suburb,
    postcode,
    state,
    lat,
    lng,
    medianPriceHouse: medianHouse,
    medianPriceApartment: medianApt,
    medianPricePerSqm: medianPerSqm,
    medianDaysOnMarket: daysOnMarket,
    auctionClearanceRate: clearanceRate,
    totalListings,
    totalSales12Months: totalSales,
    rentalYieldMedian: rentalYield,
    priceChangePercent12m: priceChange12m,
    priceChangePercent5y: priceChange5y,
    population,
  };
}

const ALL_SUBURB_STATS: SuburbStats[] = MAJOR_SUBURBS.map((s) =>
  generateSuburbStats(s.postcode, s.suburb, s.state, s.lat, s.lng),
);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const postcode = searchParams.get("postcode");

  if (postcode) {
    if (!/^\d{4}$/.test(postcode)) {
      return NextResponse.json(
        { error: "Valid 4-digit Australian postcode required" },
        { status: 400 },
      );
    }

    const stats = ALL_SUBURB_STATS.find((s) => s.postcode === postcode);
    if (!stats) {
      // Generate on-the-fly for postcodes not in MAJOR_SUBURBS
      const generated = generateSuburbStats(
        postcode,
        `Suburb ${postcode}`,
        "NSW",
        -33.87 + (hashCode(postcode) % 100) * 0.01,
        151.21 + (hashCode(postcode) % 100) * 0.01,
      );
      return NextResponse.json({
        stats: generated,
        nationalComparison: {
          medianPriceIndex: +((generated.medianPriceHouse! / NATIONAL_MEDIAN) * 100).toFixed(1),
          daysOnMarketIndex: +((generated.medianDaysOnMarket! / NATIONAL_DAYS_ON_MARKET) * 100).toFixed(1),
          rentalYieldIndex: +((generated.rentalYieldMedian! / NATIONAL_RENTAL_YIELD) * 100).toFixed(1),
          clearanceRateIndex: +((generated.auctionClearanceRate! / NATIONAL_CLEARANCE_RATE) * 100).toFixed(1),
        },
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      stats,
      nationalComparison: {
        medianPriceIndex: +((stats.medianPriceHouse! / NATIONAL_MEDIAN) * 100).toFixed(1),
        daysOnMarketIndex: +((stats.medianDaysOnMarket! / NATIONAL_DAYS_ON_MARKET) * 100).toFixed(1),
        rentalYieldIndex: +((stats.rentalYieldMedian! / NATIONAL_RENTAL_YIELD) * 100).toFixed(1),
        clearanceRateIndex: +((stats.auctionClearanceRate! / NATIONAL_CLEARANCE_RATE) * 100).toFixed(1),
      },
      lastUpdated: new Date().toISOString(),
    });
  }

  // Return all suburb stats (for heatmap data)
  return NextResponse.json({
    suburbs: ALL_SUBURB_STATS,
    national: {
      medianPrice: NATIONAL_MEDIAN,
      daysOnMarket: NATIONAL_DAYS_ON_MARKET,
      rentalYield: NATIONAL_RENTAL_YIELD,
      clearanceRate: NATIONAL_CLEARANCE_RATE,
    },
    total: ALL_SUBURB_STATS.length,
    lastUpdated: new Date().toISOString(),
  });
}
