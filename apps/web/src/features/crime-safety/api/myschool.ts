import type { SchoolSafety } from "../types";

export async function fetchSchoolSafety(
  postcode: string
): Promise<SchoolSafety[]> {
  const res = await fetch(`/api/crime/schools?postcode=${postcode}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSchoolSafetyById(
  schoolId: string
): Promise<SchoolSafety | null> {
  const res = await fetch(`/api/crime/schools?id=${schoolId}`);
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function fetchSchoolsByRadius(
  lat: number,
  lng: number,
  radiusKm: number = 5
): Promise<SchoolSafety[]> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radiusKm.toString(),
  });
  const res = await fetch(`/api/crime/schools?${params}`);
  if (!res.ok) return [];
  return res.json();
}

// Server-side: parse MySchool ACARA data
export interface MySchoolRawRecord {
  acara_id: string;
  school_name: string;
  school_type: string;
  school_sector: string;
  postcode: string;
  suburb: string;
  state: string;
  latitude: number;
  longitude: number;
  icsea_value: number; // Index of Community Socio-Educational Advantage
  total_enrolments: number;
  attendance_rate: number;
  teaching_staff: number;
}

export function calculateSchoolSafetyScore(
  school: MySchoolRawRecord,
  localCrimeIndex: number,
  nearbyOffences: number,
  incidentCount: number,
  suspensionRate: number
): SchoolSafety {
  // Composite safety score: higher is safer
  // Weights: crime index (40%), nearby offences (25%), incidents (20%), suspension rate (15%)
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

  const schoolType =
    school.school_type.toLowerCase().includes("primary")
      ? "primary"
      : school.school_type.toLowerCase().includes("secondary")
        ? "secondary"
        : "combined";

  return {
    schoolId: school.acara_id,
    schoolName: school.school_name,
    schoolType,
    postcode: school.postcode,
    suburb: school.suburb,
    state: school.state,
    lat: school.latitude,
    lng: school.longitude,
    safetyScore,
    localCrimeIndex,
    incidentCount,
    suspensionRate,
    attendanceRate: school.attendance_rate,
    nearbyOffences,
    trend: "stable", // determined by comparing previous period
  };
}
