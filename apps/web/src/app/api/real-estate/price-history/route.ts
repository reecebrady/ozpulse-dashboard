import { NextRequest, NextResponse } from "next/server";
import type { PriceIndexPoint } from "@ozpulse/shared";

/**
 * GET /api/real-estate/price-history?postcode=2150&type=house
 *
 * Returns 12-month price trend for a given postcode.
 * Returns monthly data points including median price, volume, and index value.
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

interface PriceHistoryResponse {
  postcode: string;
  propertyType: string;
  dataPoints: PriceIndexPoint[];
  summary: {
    startPrice: number;
    endPrice: number;
    changePercent: number;
    peakPrice: number;
    troughPrice: number;
    averageVolume: number;
  };
  lastUpdated: string;
}

function generateMonthlyHistory(
  postcode: string,
  propertyType: string,
): PriceHistoryResponse {
  const rand = seededRandom(hashCode(postcode + propertyType + "history"));
  const median = baseMedian(postcode);

  // Adjust base for property type
  const typeMultiplier =
    propertyType === "apartment" || propertyType === "unit"
      ? 0.55
      : propertyType === "townhouse"
        ? 0.8
        : 1.0;

  const adjustedMedian = median * typeMultiplier;
  const dataPoints: PriceIndexPoint[] = [];
  let indexValue = 100;
  let peakPrice = 0;
  let troughPrice = Infinity;

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    // Random walk with slight upward drift typical of Aus market 2025-26
    const monthlyShift = (rand() - 0.42) * 2.5;
    indexValue = Math.max(85, Math.min(125, indexValue + monthlyShift));

    const monthlyMedian = Math.round(adjustedMedian * (indexValue / 100));
    const monthlyPerSqm = Math.round((adjustedMedian / 130) * (indexValue / 100));
    const volume = Math.floor(20 + rand() * 120);

    if (monthlyMedian > peakPrice) peakPrice = monthlyMedian;
    if (monthlyMedian < troughPrice) troughPrice = monthlyMedian;

    dataPoints.push({
      period,
      medianPrice: monthlyMedian,
      pricePerSqm: monthlyPerSqm,
      indexValue: +indexValue.toFixed(1),
      volume,
    });
  }

  const startPrice = dataPoints[0].medianPrice;
  const endPrice = dataPoints[dataPoints.length - 1].medianPrice;
  const changePercent = +((endPrice - startPrice) / startPrice * 100).toFixed(1);
  const totalVolume = dataPoints.reduce((sum, dp) => sum + (dp.volume ?? 0), 0);

  return {
    postcode,
    propertyType,
    dataPoints,
    summary: {
      startPrice,
      endPrice,
      changePercent,
      peakPrice,
      troughPrice,
      averageVolume: Math.round(totalVolume / dataPoints.length),
    },
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const postcode = searchParams.get("postcode");
  const propertyType = searchParams.get("type") ?? "all";

  if (!postcode || !/^\d{4}$/.test(postcode)) {
    return NextResponse.json(
      { error: "Valid 4-digit Australian postcode required" },
      { status: 400 },
    );
  }

  const history = generateMonthlyHistory(postcode, propertyType);

  return NextResponse.json(history);
}
