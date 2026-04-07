import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@ozpulse/db";
import { getCachedData } from "@ozpulse/db";
import { generateSuburbComparisonHtml } from "@/lib/pdf-export";

/**
 * POST /api/export
 * Generate a suburb comparison report as downloadable HTML (PDF-ready).
 * Body: { postcodes: string[] }
 *
 * Uses server-side HTML generation. The client can print-to-PDF or
 * a headless browser can convert to actual PDF if needed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postcodes } = body;

    if (
      !Array.isArray(postcodes) ||
      postcodes.length < 1 ||
      postcodes.length > 5
    ) {
      return NextResponse.json(
        { error: "Provide 1-5 postcodes for comparison" },
        { status: 400 }
      );
    }

    // Validate postcodes
    for (const pc of postcodes) {
      if (!/^\d{4}$/.test(pc)) {
        return NextResponse.json(
          { error: `Invalid postcode: ${pc}` },
          { status: 400 }
        );
      }
    }

    const client = createClient();

    // Gather data for each postcode from cached layer data
    const layerIds = [
      "power-energy",
      "real-estate",
      "crime-safety",
      "immigration-demographics",
      "infrastructure",
      "mining-resources",
    ];

    const suburbData: Record<string, Record<string, unknown>> = {};

    for (const postcode of postcodes) {
      suburbData[postcode] = {};
      for (const layerId of layerIds) {
        const cached = await getCachedData(
          client,
          layerId,
          `postcode:${postcode}`
        );
        if (cached) {
          suburbData[postcode][layerId] = cached;
        }
      }
    }

    const html = generateSuburbComparisonHtml(postcodes, suburbData);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="ozpulse-comparison-${postcodes.join("-")}.html"`,
      },
    });
  } catch (error) {
    console.error("POST /api/export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
