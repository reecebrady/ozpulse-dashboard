import { NextRequest, NextResponse } from "next/server";
import {
  generateSuburbStats,
  generateComparables,
  generateTestimonies,
  generateValuation,
} from "@/features/real-estate/lib/mock-data";

/**
 * GET /api/real-estate/suburbs?postcode=2150
 * Returns detailed suburb statistics, comparables, testimonies, and valuation.
 * In production, this would aggregate Domain API, CoreLogic, and ABS data.
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

  // TODO: Replace with real API calls
  const stats = generateSuburbStats(postcode);
  const comparables = generateComparables(postcode);
  const testimonies = generateTestimonies(postcode);
  const valuation = generateValuation(postcode);

  return NextResponse.json({
    stats,
    comparables,
    testimonies,
    valuation,
    lastUpdated: new Date().toISOString(),
  });
}
