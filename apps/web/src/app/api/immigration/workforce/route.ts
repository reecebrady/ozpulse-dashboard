import { NextRequest, NextResponse } from "next/server";
import type { WorkforceShift } from "@/src/features/immigration-demographics/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sa4 = searchParams.get("sa4");
  const governmentOnly = searchParams.get("government") === "true";

  try {
    const data = generateMockWorkforceData(sa4, governmentOnly);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Workforce API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch workforce data" },
      { status: 500 }
    );
  }
}

const INDUSTRIES = [
  { name: "Public Administration", government: true },
  { name: "Education and Training", government: true },
  { name: "Health Care and Social Assistance", government: true },
  { name: "Transport, Postal and Warehousing", government: true },
  { name: "Defence", government: true },
  { name: "Construction", government: false },
  { name: "Information Technology", government: false },
  { name: "Hospitality and Tourism", government: false },
  { name: "Retail Trade", government: false },
  { name: "Manufacturing", government: false },
  { name: "Professional Services", government: false },
  { name: "Agriculture", government: false },
  { name: "Mining", government: false },
  { name: "Financial Services", government: false },
];

function generateMockWorkforceData(
  sa4Code: string | null,
  governmentOnly: boolean
): WorkforceShift[] {
  const seed = sa4Code ? parseInt(sa4Code, 10) || 42 : 42;
  const rng = (offset: number) =>
    ((Math.sin(seed + offset) * 10000) % 1 + 1) % 1;

  let industries = INDUSTRIES;
  if (governmentOnly) {
    industries = industries.filter((i) => i.government);
  }

  return industries.map((industry, i) => {
    const totalWorkers = Math.round(rng(i * 100 + 1) * 50000 + 5000);
    const overseasPercent = Math.round(rng(i * 100 + 2) * 35 + 10);
    const yearOnYearChange = Math.round((rng(i * 100 + 3) - 0.4) * 6 * 10) / 10;

    const countries = [
      "India", "China", "Philippines", "United Kingdom", "New Zealand",
      "Vietnam", "Nepal",
    ];

    const topOverseasCountries = countries
      .slice(0, 5)
      .map((country, j) => {
        const pct = rng(i * 50 + j * 10 + 5) * overseasPercent * 0.4;
        return {
          country,
          count: Math.round((pct / 100) * totalWorkers),
          percentage: Math.round(pct * 10) / 10,
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      sa4Code: sa4Code ?? "National",
      sa4Name: sa4Code ?? "National",
      state: "ALL",
      industry: industry.name,
      totalWorkers,
      australianBornPercent: 100 - overseasPercent,
      overseasBornPercent: overseasPercent,
      yearOnYearChange,
      topOverseasCountries,
      governmentSector: industry.government,
    };
  });
}
