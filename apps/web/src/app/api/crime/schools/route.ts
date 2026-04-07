import { NextRequest, NextResponse } from "next/server";
import type { SchoolSafety } from "@/src/features/crime-safety/types";

const CACHE_TTL = 86400;
const cache = new Map<string, { data: unknown; expiry: number }>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const schoolId = searchParams.get("id");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");

  try {
    if (schoolId) {
      return handleSchoolById(schoolId);
    }

    if (lat && lng) {
      return handleSchoolsByRadius(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseFloat(radius) : 5
      );
    }

    if (postcode) {
      return handleSchoolsByPostcode(postcode);
    }

    return NextResponse.json(
      { error: "Provide postcode, id, or lat/lng parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Schools API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school data" },
      { status: 500 }
    );
  }
}

async function handleSchoolsByPostcode(
  postcode: string
): Promise<NextResponse> {
  const cacheKey = `schools-${postcode}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.json(cached.data);
  }

  // Try MySchool ACARA API
  const acaraData = await fetchMySchoolData(postcode);
  if (acaraData && acaraData.length > 0) {
    cache.set(cacheKey, {
      data: acaraData,
      expiry: Date.now() + CACHE_TTL * 1000,
    });
    return NextResponse.json(acaraData);
  }

  // Fallback mock data
  const mockData = generateMockSchools(postcode);
  cache.set(cacheKey, {
    data: mockData,
    expiry: Date.now() + CACHE_TTL * 1000,
  });
  return NextResponse.json(mockData);
}

async function handleSchoolById(schoolId: string): Promise<NextResponse> {
  const mock = generateMockSchoolById(schoolId);
  return NextResponse.json(mock ? [mock] : []);
}

async function handleSchoolsByRadius(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<NextResponse> {
  // In production: PostGIS ST_DWithin query
  const mockData = generateMockSchoolsNearby(lat, lng, radiusKm);
  return NextResponse.json(mockData);
}

async function fetchMySchoolData(
  postcode: string
): Promise<SchoolSafety[] | null> {
  // MySchool API integration point
  // https://www.myschool.edu.au/
  try {
    const res = await fetch(
      `https://www.myschool.edu.au/api/schools?postcode=${postcode}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return null;
    return null; // Real parsing would go here
  } catch {
    return null;
  }
}

function generateMockSchools(postcode: string): SchoolSafety[] {
  const seed = parseInt(postcode, 10);
  const rng = (offset: number) =>
    ((Math.sin(seed + offset) * 10000) % 1 + 1) % 1;

  const schoolTypes: SchoolSafety["schoolType"][] = [
    "primary",
    "primary",
    "secondary",
    "combined",
  ];

  return Array.from({ length: 3 + Math.floor(rng(1) * 4) }, (_, i) => {
    const safetyScore = Math.round(rng(i * 100 + 1) * 50 + 40);
    const crimeIndex = Math.round(rng(i * 100 + 2) * 60 + 15);

    return {
      schoolId: `ACARA-${postcode}-${i}`,
      schoolName: `${postcode} ${schoolTypes[i % schoolTypes.length]!.charAt(0).toUpperCase() + schoolTypes[i % schoolTypes.length]!.slice(1)} School ${i + 1}`,
      schoolType: schoolTypes[i % schoolTypes.length]!,
      postcode,
      suburb: `Suburb ${postcode}`,
      state: postcode.startsWith("2") ? "NSW" : postcode.startsWith("3") ? "VIC" : "QLD",
      lat: -33.8688 + (rng(i * 10) - 0.5) * 0.05,
      lng: 151.2093 + (rng(i * 20) - 0.5) * 0.05,
      safetyScore,
      localCrimeIndex: crimeIndex,
      incidentCount: Math.floor(rng(i * 30) * 5),
      suspensionRate: Math.round(rng(i * 40) * 8 * 10) / 10,
      attendanceRate: Math.round((85 + rng(i * 50) * 12) * 10) / 10,
      nearbyOffences: Math.floor(rng(i * 60) * 30),
      trend:
        rng(i * 70) > 0.6
          ? "improving"
          : rng(i * 70) < 0.3
            ? "declining"
            : "stable",
    };
  });
}

function generateMockSchoolById(schoolId: string): SchoolSafety | null {
  return {
    schoolId,
    schoolName: `School ${schoolId}`,
    schoolType: "combined",
    postcode: "2000",
    suburb: "Sydney",
    state: "NSW",
    lat: -33.8688,
    lng: 151.2093,
    safetyScore: 72,
    localCrimeIndex: 35,
    incidentCount: 2,
    suspensionRate: 3.2,
    attendanceRate: 92.5,
    nearbyOffences: 15,
    trend: "stable",
  };
}

function generateMockSchoolsNearby(
  lat: number,
  lng: number,
  radiusKm: number
): SchoolSafety[] {
  return generateMockSchools("2000").map((s, i) => ({
    ...s,
    lat: lat + (Math.random() - 0.5) * (radiusKm / 111),
    lng: lng + (Math.random() - 0.5) * (radiusKm / 111),
  }));
}
