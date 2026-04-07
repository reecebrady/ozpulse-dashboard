import { NextRequest, NextResponse } from "next/server";
import { generateListings } from "@/features/real-estate/lib/mock-data";

/**
 * GET /api/real-estate/listings?postcode=2150&type=house&bedrooms=3&limit=20
 * Returns property listings for a given postcode with optional filters.
 * In production, this would query Domain API listings endpoint.
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

  const propertyType = searchParams.get("type") ?? undefined;
  const bedrooms = searchParams.get("bedrooms")
    ? parseInt(searchParams.get("bedrooms")!, 10)
    : undefined;
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "20", 10),
    100
  );

  // TODO: Replace with real Domain API
  let listings = generateListings(postcode, 50);

  if (propertyType) {
    listings = listings.filter((l) => l.propertyType === propertyType);
  }
  if (bedrooms !== undefined) {
    listings = listings.filter((l) => l.bedrooms === bedrooms);
  }

  return NextResponse.json({
    listings: listings.slice(0, limit),
    total: listings.length,
    postcode,
    lastUpdated: new Date().toISOString(),
  });
}
