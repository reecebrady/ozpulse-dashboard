import { NextRequest, NextResponse } from "next/server";
import { generateValuation } from "@/features/real-estate/lib/mock-data";

/**
 * GET /api/real-estate/valuation?postcode=2150&address=42+Smith+St
 * Returns automated valuation estimate for a specific property.
 * In production, this would use CoreLogic AVM or similar.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const postcode = searchParams.get("postcode");
  const address = searchParams.get("address") ?? undefined;

  if (!postcode || !/^\d{4}$/.test(postcode)) {
    return NextResponse.json(
      { error: "Valid 4-digit Australian postcode required" },
      { status: 400 }
    );
  }

  // TODO: Replace with real CoreLogic AVM
  const valuation = generateValuation(postcode, address);

  return NextResponse.json({
    valuation,
    lastUpdated: new Date().toISOString(),
  });
}
