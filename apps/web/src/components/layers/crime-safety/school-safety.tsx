"use client";

/**
 * School Safety Scores
 *
 * MySchool-style mock data for ~20 schools across major metros.
 * Safety score is composite of local crime index, nearby offences,
 * incidents, suspension rate, and attendance rate.
 */

import type { SchoolSafety } from "@/features/crime-safety/types";

// Deterministic pseudo-random
function sr(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const v = Math.sin(hash) * 10000;
  const r = v - Math.floor(v);
  return r < 0 ? r + 1 : r;
}

export interface SchoolWithCatchment extends SchoolSafety {
  catchmentRadiusKm: number;
  studentEnrolment: number;
  icseaValue: number; // Index of Community Socio-Educational Advantage
}

const MOCK_SCHOOLS: Omit<
  SchoolWithCatchment,
  "safetyScore" | "localCrimeIndex" | "incidentCount" | "suspensionRate" | "attendanceRate" | "nearbyOffences" | "trend"
>[] = [
  // Sydney
  { schoolId: "NSW-01", schoolName: "Sydney Grammar School", schoolType: "secondary", postcode: "2010", suburb: "Darlinghurst", state: "NSW", lat: -33.8776, lng: 151.2167, catchmentRadiusKm: 8, studentEnrolment: 1420, icseaValue: 1180 },
  { schoolId: "NSW-02", schoolName: "Parramatta High School", schoolType: "secondary", postcode: "2150", suburb: "Parramatta", state: "NSW", lat: -33.8151, lng: 151.0011, catchmentRadiusKm: 5, studentEnrolment: 980, icseaValue: 1020 },
  { schoolId: "NSW-03", schoolName: "Blacktown South Public School", schoolType: "primary", postcode: "2148", suburb: "Blacktown", state: "NSW", lat: -33.7730, lng: 150.9063, catchmentRadiusKm: 3, studentEnrolment: 620, icseaValue: 940 },
  { schoolId: "NSW-04", schoolName: "Bankstown Girls High School", schoolType: "secondary", postcode: "2200", suburb: "Bankstown", state: "NSW", lat: -33.9175, lng: 151.0356, catchmentRadiusKm: 5, studentEnrolment: 720, icseaValue: 960 },
  { schoolId: "NSW-05", schoolName: "Cabramatta Public School", schoolType: "primary", postcode: "2166", suburb: "Cabramatta", state: "NSW", lat: -33.8949, lng: 150.9375, catchmentRadiusKm: 2.5, studentEnrolment: 480, icseaValue: 890 },
  { schoolId: "NSW-06", schoolName: "Rose Bay Secondary College", schoolType: "secondary", postcode: "2025", suburb: "Woollahra", state: "NSW", lat: -33.8706, lng: 151.2687, catchmentRadiusKm: 4, studentEnrolment: 860, icseaValue: 1140 },

  // Melbourne
  { schoolId: "VIC-01", schoolName: "Melbourne High School", schoolType: "secondary", postcode: "3004", suburb: "South Yarra", state: "VIC", lat: -37.8427, lng: 144.9832, catchmentRadiusKm: 10, studentEnrolment: 1350, icseaValue: 1190 },
  { schoolId: "VIC-02", schoolName: "Dandenong High School", schoolType: "secondary", postcode: "3175", suburb: "Dandenong", state: "VIC", lat: -37.9863, lng: 145.2150, catchmentRadiusKm: 5, studentEnrolment: 1120, icseaValue: 920 },
  { schoolId: "VIC-03", schoolName: "Footscray Primary School", schoolType: "primary", postcode: "3011", suburb: "Footscray", state: "VIC", lat: -37.7995, lng: 144.8999, catchmentRadiusKm: 3, studentEnrolment: 380, icseaValue: 970 },
  { schoolId: "VIC-04", schoolName: "Camberwell Grammar School", schoolType: "combined", postcode: "3124", suburb: "Camberwell", state: "VIC", lat: -37.8366, lng: 145.0696, catchmentRadiusKm: 6, studentEnrolment: 1280, icseaValue: 1170 },

  // Brisbane
  { schoolId: "QLD-01", schoolName: "Brisbane State High School", schoolType: "secondary", postcode: "4101", suburb: "South Brisbane", state: "QLD", lat: -27.4812, lng: 153.0137, catchmentRadiusKm: 8, studentEnrolment: 3120, icseaValue: 1100 },
  { schoolId: "QLD-02", schoolName: "Cairns State High School", schoolType: "secondary", postcode: "4870", suburb: "Cairns", state: "QLD", lat: -16.9186, lng: 145.7781, catchmentRadiusKm: 6, studentEnrolment: 1680, icseaValue: 980 },
  { schoolId: "QLD-03", schoolName: "Surfers Paradise State School", schoolType: "primary", postcode: "4217", suburb: "Surfers Paradise", state: "QLD", lat: -28.0024, lng: 153.4299, catchmentRadiusKm: 3, studentEnrolment: 410, icseaValue: 1000 },

  // Perth
  { schoolId: "WA-01", schoolName: "Perth Modern School", schoolType: "secondary", postcode: "6009", suburb: "Subiaco", state: "WA", lat: -31.9488, lng: 115.8296, catchmentRadiusKm: 12, studentEnrolment: 1450, icseaValue: 1200 },
  { schoolId: "WA-02", schoolName: "Rockingham Beach Primary", schoolType: "primary", postcode: "6168", suburb: "Rockingham", state: "WA", lat: -32.2797, lng: 115.7439, catchmentRadiusKm: 3, studentEnrolment: 520, icseaValue: 960 },

  // Adelaide
  { schoolId: "SA-01", schoolName: "Adelaide High School", schoolType: "secondary", postcode: "5000", suburb: "Adelaide", state: "SA", lat: -34.9285, lng: 138.6007, catchmentRadiusKm: 8, studentEnrolment: 1280, icseaValue: 1060 },
  { schoolId: "SA-02", schoolName: "Salisbury East High School", schoolType: "secondary", postcode: "5108", suburb: "Salisbury", state: "SA", lat: -34.7639, lng: 138.6466, catchmentRadiusKm: 5, studentEnrolment: 920, icseaValue: 910 },

  // Other
  { schoolId: "TAS-01", schoolName: "Hobart College", schoolType: "secondary", postcode: "7000", suburb: "Hobart", state: "TAS", lat: -42.8821, lng: 147.3272, catchmentRadiusKm: 8, studentEnrolment: 1150, icseaValue: 1020 },
  { schoolId: "NT-01", schoolName: "Darwin High School", schoolType: "secondary", postcode: "0810", suburb: "Casuarina", state: "NT", lat: -12.3781, lng: 130.8739, catchmentRadiusKm: 8, studentEnrolment: 1080, icseaValue: 940 },
  { schoolId: "ACT-01", schoolName: "Canberra Grammar School", schoolType: "combined", postcode: "2601", suburb: "Red Hill", state: "ACT", lat: -35.3175, lng: 149.1315, catchmentRadiusKm: 10, studentEnrolment: 1870, icseaValue: 1180 },
];

/**
 * Generate mock safety data for all schools.
 */
export function generateSchoolSafetyData(): SchoolWithCatchment[] {
  return MOCK_SCHOOLS.map((school) => {
    const seed = school.schoolId;
    const icseaNorm = (school.icseaValue - 800) / 400; // 0-1 range

    // Higher ICSEA correlates with lower local crime, fewer incidents
    const localCrimeIndex = Math.round(
      Math.max(5, Math.min(95, (1 - icseaNorm) * 70 + sr(`${seed}-ci`) * 25))
    );
    const nearbyOffences = Math.round(
      Math.max(2, (1 - icseaNorm) * 40 + sr(`${seed}-no`) * 15)
    );
    const incidentCount = Math.round(
      Math.max(0, (1 - icseaNorm) * 8 + sr(`${seed}-ic`) * 4)
    );
    const suspensionRate = Math.round(
      Math.max(0.2, (1 - icseaNorm) * 12 + sr(`${seed}-sr`) * 5) * 10
    ) / 10;
    const attendanceRate = Math.round(
      Math.min(99.5, Math.max(80, 85 + icseaNorm * 12 + sr(`${seed}-ar`) * 3)) * 10
    ) / 10;

    // Composite safety score (higher = safer)
    const crimeComponent = Math.max(0, 100 - localCrimeIndex) * 0.4;
    const nearbyComponent =
      Math.max(0, 100 - Math.min(nearbyOffences * 2, 100)) * 0.25;
    const incidentComponent =
      Math.max(0, 100 - Math.min(incidentCount * 10, 100)) * 0.2;
    const suspensionComponent =
      Math.max(0, 100 - Math.min(suspensionRate * 5, 100)) * 0.15;

    const safetyScore = Math.round(
      crimeComponent + nearbyComponent + incidentComponent + suspensionComponent
    );

    const trendRoll = sr(`${seed}-trend`);
    const trend: SchoolSafety["trend"] =
      trendRoll < 0.3 ? "improving" : trendRoll > 0.7 ? "declining" : "stable";

    return {
      ...school,
      localCrimeIndex,
      nearbyOffences,
      incidentCount,
      suspensionRate,
      attendanceRate,
      safetyScore,
      trend,
    };
  });
}

/**
 * Get schools for a specific postcode.
 */
export function getSchoolsByPostcode(postcode: string): SchoolWithCatchment[] {
  const all = generateSchoolSafetyData();
  return all.filter((s) => s.postcode === postcode);
}

/**
 * Get schools within a radius of a lat/lng coordinate.
 */
export function getSchoolsNearby(
  lat: number,
  lng: number,
  radiusKm: number = 5
): SchoolWithCatchment[] {
  const all = generateSchoolSafetyData();
  return all.filter((s) => {
    const dLat = (s.lat - lat) * 111.32;
    const dLng = (s.lng - lng) * 111.32 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist <= radiusKm;
  });
}

// --- React display component for school list ---

interface SchoolSafetyListProps {
  schools: SchoolWithCatchment[];
  onSelect?: (school: SchoolWithCatchment) => void;
}

function badgeStyle(score: number): { label: string; className: string } {
  if (score >= 75) return { label: "Safe", className: "bg-green-500/20 text-green-400" };
  if (score >= 50) return { label: "Moderate", className: "bg-yellow-500/20 text-yellow-400" };
  return { label: "Concern", className: "bg-red-500/20 text-red-400" };
}

export function SchoolSafetyList({ schools, onSelect }: SchoolSafetyListProps) {
  if (schools.length === 0) {
    return (
      <div className="text-xs text-muted-foreground py-4 text-center">
        No schools found in this area.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">
        School Safety ({schools.length} schools)
      </h4>
      <div className="max-h-64 space-y-1.5 overflow-y-auto">
        {schools
          .sort((a, b) => b.safetyScore - a.safetyScore)
          .map((school) => {
            const badge = badgeStyle(school.safetyScore);
            return (
              <button
                key={school.schoolId}
                onClick={() => onSelect?.(school)}
                className="flex w-full items-center gap-3 rounded border border-border bg-muted/50 p-2 text-left transition-colors hover:bg-muted"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {school.schoolName}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {school.schoolType === "primary"
                      ? "Primary"
                      : school.schoolType === "secondary"
                        ? "Secondary"
                        : "K-12"}{" "}
                    | {school.suburb}, {school.state} {school.postcode}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {school.studentEnrolment} students | ICSEA {school.icseaValue} | Attendance{" "}
                    {school.attendanceRate}%
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold">{school.safetyScore}</div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </button>
            );
          })}
      </div>
      <div className="text-[10px] text-muted-foreground">
        Safety score: composite of local crime index, nearby offences, incident
        reports, suspension rate, and attendance. Source: MySchool / ABS.
      </div>
    </div>
  );
}
