import { NextResponse } from "next/server";
import { generateHeatmapPoints } from "@/features/real-estate/lib/mock-data";

/**
 * GET /api/real-estate/heatmap
 * Returns national price-per-sqm heatmap data for all tracked suburbs.
 * In production, this would pull from Domain API / CoreLogic feeds.
 */
export async function GET() {
  // TODO: Replace with real Domain API / CoreLogic integration
  // const DOMAIN_API_KEY = process.env.DOMAIN_API_KEY;
  const data = generateHeatmapPoints();

  return NextResponse.json({
    points: data,
    lastUpdated: new Date().toISOString(),
  });
}
