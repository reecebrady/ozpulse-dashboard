import { NextRequest, NextResponse } from "next/server";
import {
  generatePriceIndex,
  generateNationalPriceIndex,
} from "@/features/real-estate/lib/mock-data";

/**
 * GET /api/real-estate/price-index?postcode=2150
 * Returns price index time series for a postcode plus national benchmark.
 * In production, this would pull from CoreLogic Home Value Index or ABS data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const postcode = searchParams.get("postcode");

  if (!postcode || !/^\d{4}$/.test(postcode)) {
    return NextResponse.json(
      { error: "Valid 4-digit Australian postcode required" },
      { status: 400 }
    );
  }

  // TODO: Replace with real CoreLogic / ABS feeds
  const suburbIndex = generatePriceIndex(postcode);
  const nationalIndex = generateNationalPriceIndex();

  return NextResponse.json({
    suburb: suburbIndex,
    national: nationalIndex,
    lastUpdated: new Date().toISOString(),
  });
}
