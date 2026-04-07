import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/crime/school-safety
 *
 * Returns safety scores per school from MySchool-style data.
 * 50 schools with names, postcodes, and composite safety scores.
 *
 * Query params:
 *   - postcode (optional): filter by postcode
 *   - id (optional): get a single school by ID
 *   - lat, lng, radius (optional): find schools within a radius (km)
 */

interface SchoolSafetyRecord {
  schoolId: string;
  schoolName: string;
  schoolType: "primary" | "secondary" | "combined";
  sector: "government" | "catholic" | "independent";
  postcode: string;
  suburb: string;
  state: string;
  lat: number;
  lng: number;
  safetyScore: number;
  localCrimeIndex: number;
  incidentCount: number;
  incidentsByType: {
    bullying: number;
    vandalism: number;
    theft: number;
    assault: number;
    substanceRelated: number;
  };
  suspensionRate: number;
  attendanceRate: number;
  nearbyOffences: number;
  trend: "improving" | "declining" | "stable";
  comparisonToSimilar: {
    safetyScoreAvg: number;
    percentile: number;
  };
  icsea: number;
  totalEnrolments: number;
}

// 50 realistic Australian schools
const MOCK_SCHOOLS: SchoolSafetyRecord[] = [
  // NSW
  { schoolId: "SCH-NSW-001", schoolName: "Parramatta Public School", schoolType: "primary", sector: "government", postcode: "2150", suburb: "Parramatta", state: "NSW", lat: -33.8151, lng: 151.0011, safetyScore: 78, localCrimeIndex: 42, incidentCount: 8, incidentsByType: { bullying: 3, vandalism: 1, theft: 2, assault: 1, substanceRelated: 1 }, suspensionRate: 1.2, attendanceRate: 94.3, nearbyOffences: 34, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 74, percentile: 68 }, icsea: 1042, totalEnrolments: 620 },
  { schoolId: "SCH-NSW-002", schoolName: "Sydney Grammar School", schoolType: "secondary", sector: "independent", postcode: "2000", suburb: "Sydney", state: "NSW", lat: -33.8770, lng: 151.2130, safetyScore: 92, localCrimeIndex: 28, incidentCount: 2, incidentsByType: { bullying: 1, vandalism: 0, theft: 1, assault: 0, substanceRelated: 0 }, suspensionRate: 0.3, attendanceRate: 97.1, nearbyOffences: 45, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 85, percentile: 91 }, icsea: 1180, totalEnrolments: 1450 },
  { schoolId: "SCH-NSW-003", schoolName: "Blacktown South Public School", schoolType: "primary", sector: "government", postcode: "2148", suburb: "Blacktown", state: "NSW", lat: -33.7710, lng: 150.9080, safetyScore: 65, localCrimeIndex: 56, incidentCount: 14, incidentsByType: { bullying: 5, vandalism: 3, theft: 3, assault: 2, substanceRelated: 1 }, suspensionRate: 2.8, attendanceRate: 91.2, nearbyOffences: 52, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 70, percentile: 38 }, icsea: 965, totalEnrolments: 480 },
  { schoolId: "SCH-NSW-004", schoolName: "Canterbury Boys High School", schoolType: "secondary", sector: "government", postcode: "2194", suburb: "Canterbury", state: "NSW", lat: -33.9190, lng: 151.1190, safetyScore: 62, localCrimeIndex: 51, incidentCount: 18, incidentsByType: { bullying: 6, vandalism: 4, theft: 4, assault: 3, substanceRelated: 1 }, suspensionRate: 3.4, attendanceRate: 89.8, nearbyOffences: 48, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 66, percentile: 42 }, icsea: 938, totalEnrolments: 720 },
  { schoolId: "SCH-NSW-005", schoolName: "Penrith Anglican College", schoolType: "combined", sector: "independent", postcode: "2750", suburb: "Penrith", state: "NSW", lat: -33.7530, lng: 150.6960, safetyScore: 81, localCrimeIndex: 38, incidentCount: 5, incidentsByType: { bullying: 2, vandalism: 1, theft: 1, assault: 0, substanceRelated: 1 }, suspensionRate: 0.8, attendanceRate: 95.2, nearbyOffences: 28, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 79, percentile: 72 }, icsea: 1065, totalEnrolments: 890 },
  { schoolId: "SCH-NSW-006", schoolName: "Newcastle East Public School", schoolType: "primary", sector: "government", postcode: "2300", suburb: "Newcastle", state: "NSW", lat: -32.9290, lng: 151.7830, safetyScore: 74, localCrimeIndex: 44, incidentCount: 9, incidentsByType: { bullying: 3, vandalism: 2, theft: 2, assault: 1, substanceRelated: 1 }, suspensionRate: 1.6, attendanceRate: 93.5, nearbyOffences: 38, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 72, percentile: 62 }, icsea: 1018, totalEnrolments: 340 },
  { schoolId: "SCH-NSW-007", schoolName: "Bankstown Girls High School", schoolType: "secondary", sector: "government", postcode: "2200", suburb: "Bankstown", state: "NSW", lat: -33.9180, lng: 151.0360, safetyScore: 67, localCrimeIndex: 53, incidentCount: 12, incidentsByType: { bullying: 4, vandalism: 2, theft: 3, assault: 2, substanceRelated: 1 }, suspensionRate: 2.1, attendanceRate: 91.8, nearbyOffences: 46, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 68, percentile: 48 }, icsea: 952, totalEnrolments: 560 },
  { schoolId: "SCH-NSW-008", schoolName: "Woollahra Public School", schoolType: "primary", sector: "government", postcode: "2025", suburb: "Woollahra", state: "NSW", lat: -33.8870, lng: 151.2560, safetyScore: 89, localCrimeIndex: 24, incidentCount: 3, incidentsByType: { bullying: 1, vandalism: 1, theft: 1, assault: 0, substanceRelated: 0 }, suspensionRate: 0.4, attendanceRate: 96.8, nearbyOffences: 18, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 82, percentile: 88 }, icsea: 1145, totalEnrolments: 410 },
  { schoolId: "SCH-NSW-009", schoolName: "Merrylands East Public School", schoolType: "primary", sector: "government", postcode: "2150", suburb: "Merrylands", state: "NSW", lat: -33.8310, lng: 150.9920, safetyScore: 71, localCrimeIndex: 47, incidentCount: 11, incidentsByType: { bullying: 4, vandalism: 2, theft: 3, assault: 1, substanceRelated: 1 }, suspensionRate: 1.9, attendanceRate: 92.4, nearbyOffences: 40, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 72, percentile: 46 }, icsea: 978, totalEnrolments: 520 },
  { schoolId: "SCH-NSW-010", schoolName: "St Patrick's College Campbelltown", schoolType: "secondary", sector: "catholic", postcode: "2560", suburb: "Campbelltown", state: "NSW", lat: -34.0650, lng: 150.8140, safetyScore: 72, localCrimeIndex: 45, incidentCount: 10, incidentsByType: { bullying: 3, vandalism: 2, theft: 2, assault: 2, substanceRelated: 1 }, suspensionRate: 1.8, attendanceRate: 92.9, nearbyOffences: 36, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 74, percentile: 52 }, icsea: 998, totalEnrolments: 780 },

  // VIC
  { schoolId: "SCH-VIC-001", schoolName: "Melbourne High School", schoolType: "secondary", sector: "government", postcode: "3004", suburb: "South Yarra", state: "VIC", lat: -37.8390, lng: 144.9790, safetyScore: 88, localCrimeIndex: 31, incidentCount: 4, incidentsByType: { bullying: 2, vandalism: 0, theft: 1, assault: 0, substanceRelated: 1 }, suspensionRate: 0.5, attendanceRate: 96.4, nearbyOffences: 42, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 82, percentile: 86 }, icsea: 1152, totalEnrolments: 1280 },
  { schoolId: "SCH-VIC-002", schoolName: "Dandenong High School", schoolType: "secondary", sector: "government", postcode: "3175", suburb: "Dandenong", state: "VIC", lat: -37.9870, lng: 145.2160, safetyScore: 58, localCrimeIndex: 62, incidentCount: 22, incidentsByType: { bullying: 7, vandalism: 4, theft: 5, assault: 4, substanceRelated: 2 }, suspensionRate: 4.1, attendanceRate: 87.6, nearbyOffences: 64, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 65, percentile: 28 }, icsea: 912, totalEnrolments: 1120 },
  { schoolId: "SCH-VIC-003", schoolName: "Geelong Grammar School", schoolType: "combined", sector: "independent", postcode: "3220", suburb: "Corio", state: "VIC", lat: -38.0780, lng: 144.3740, safetyScore: 94, localCrimeIndex: 18, incidentCount: 1, incidentsByType: { bullying: 1, vandalism: 0, theft: 0, assault: 0, substanceRelated: 0 }, suspensionRate: 0.2, attendanceRate: 97.8, nearbyOffences: 12, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 88, percentile: 95 }, icsea: 1198, totalEnrolments: 1560 },
  { schoolId: "SCH-VIC-004", schoolName: "Camberwell Primary School", schoolType: "primary", sector: "government", postcode: "3124", suburb: "Camberwell", state: "VIC", lat: -37.8200, lng: 145.0670, safetyScore: 85, localCrimeIndex: 26, incidentCount: 4, incidentsByType: { bullying: 2, vandalism: 0, theft: 1, assault: 0, substanceRelated: 1 }, suspensionRate: 0.6, attendanceRate: 96.1, nearbyOffences: 22, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 80, percentile: 78 }, icsea: 1120, totalEnrolments: 490 },
  { schoolId: "SCH-VIC-005", schoolName: "Brimbank College", schoolType: "secondary", sector: "government", postcode: "3021", suburb: "St Albans", state: "VIC", lat: -37.7670, lng: 144.7840, safetyScore: 60, localCrimeIndex: 58, incidentCount: 19, incidentsByType: { bullying: 6, vandalism: 4, theft: 4, assault: 3, substanceRelated: 2 }, suspensionRate: 3.6, attendanceRate: 88.4, nearbyOffences: 56, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 64, percentile: 34 }, icsea: 928, totalEnrolments: 840 },
  { schoolId: "SCH-VIC-006", schoolName: "Werribee Secondary College", schoolType: "secondary", sector: "government", postcode: "3030", suburb: "Werribee", state: "VIC", lat: -37.8980, lng: 144.6630, safetyScore: 64, localCrimeIndex: 54, incidentCount: 16, incidentsByType: { bullying: 5, vandalism: 3, theft: 4, assault: 2, substanceRelated: 2 }, suspensionRate: 2.9, attendanceRate: 90.1, nearbyOffences: 48, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 66, percentile: 44 }, icsea: 948, totalEnrolments: 960 },
  { schoolId: "SCH-VIC-007", schoolName: "Balwyn Primary School", schoolType: "primary", sector: "government", postcode: "3103", suburb: "Balwyn", state: "VIC", lat: -37.8090, lng: 145.0780, safetyScore: 87, localCrimeIndex: 22, incidentCount: 3, incidentsByType: { bullying: 1, vandalism: 1, theft: 1, assault: 0, substanceRelated: 0 }, suspensionRate: 0.4, attendanceRate: 96.5, nearbyOffences: 16, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 82, percentile: 84 }, icsea: 1135, totalEnrolments: 380 },
  { schoolId: "SCH-VIC-008", schoolName: "Craigieburn Secondary College", schoolType: "secondary", sector: "government", postcode: "3064", suburb: "Craigieburn", state: "VIC", lat: -37.5990, lng: 144.9440, safetyScore: 63, localCrimeIndex: 52, incidentCount: 17, incidentsByType: { bullying: 5, vandalism: 4, theft: 4, assault: 2, substanceRelated: 2 }, suspensionRate: 3.2, attendanceRate: 89.6, nearbyOffences: 44, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 65, percentile: 40 }, icsea: 942, totalEnrolments: 1040 },

  // QLD
  { schoolId: "SCH-QLD-001", schoolName: "Brisbane State High School", schoolType: "secondary", sector: "government", postcode: "4101", suburb: "South Brisbane", state: "QLD", lat: -27.4930, lng: 153.0270, safetyScore: 84, localCrimeIndex: 34, incidentCount: 6, incidentsByType: { bullying: 2, vandalism: 1, theft: 2, assault: 0, substanceRelated: 1 }, suspensionRate: 0.9, attendanceRate: 95.4, nearbyOffences: 38, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 78, percentile: 76 }, icsea: 1108, totalEnrolments: 3200 },
  { schoolId: "SCH-QLD-002", schoolName: "Southport State High School", schoolType: "secondary", sector: "government", postcode: "4215", suburb: "Southport", state: "QLD", lat: -27.9670, lng: 153.4010, safetyScore: 68, localCrimeIndex: 48, incidentCount: 15, incidentsByType: { bullying: 5, vandalism: 3, theft: 3, assault: 2, substanceRelated: 2 }, suspensionRate: 2.4, attendanceRate: 90.8, nearbyOffences: 42, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 70, percentile: 46 }, icsea: 982, totalEnrolments: 1840 },
  { schoolId: "SCH-QLD-003", schoolName: "Cairns State High School", schoolType: "secondary", sector: "government", postcode: "4870", suburb: "Cairns", state: "QLD", lat: -16.9200, lng: 145.7790, safetyScore: 66, localCrimeIndex: 52, incidentCount: 16, incidentsByType: { bullying: 5, vandalism: 3, theft: 4, assault: 2, substanceRelated: 2 }, suspensionRate: 2.8, attendanceRate: 89.9, nearbyOffences: 46, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 68, percentile: 44 }, icsea: 958, totalEnrolments: 1420 },
  { schoolId: "SCH-QLD-004", schoolName: "Townsville Grammar School", schoolType: "combined", sector: "independent", postcode: "4810", suburb: "North Ward", state: "QLD", lat: -19.2560, lng: 146.7900, safetyScore: 82, localCrimeIndex: 36, incidentCount: 5, incidentsByType: { bullying: 2, vandalism: 1, theft: 1, assault: 0, substanceRelated: 1 }, suspensionRate: 0.7, attendanceRate: 95.6, nearbyOffences: 30, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 78, percentile: 74 }, icsea: 1072, totalEnrolments: 1080 },
  { schoolId: "SCH-QLD-005", schoolName: "Rockhampton North Primary School", schoolType: "primary", sector: "government", postcode: "4700", suburb: "Rockhampton", state: "QLD", lat: -23.3791, lng: 150.5100, safetyScore: 70, localCrimeIndex: 46, incidentCount: 10, incidentsByType: { bullying: 3, vandalism: 2, theft: 3, assault: 1, substanceRelated: 1 }, suspensionRate: 2.0, attendanceRate: 92.2, nearbyOffences: 36, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 72, percentile: 48 }, icsea: 968, totalEnrolments: 390 },
  { schoolId: "SCH-QLD-006", schoolName: "New Farm State School", schoolType: "primary", sector: "government", postcode: "4005", suburb: "New Farm", state: "QLD", lat: -27.4670, lng: 153.0470, safetyScore: 86, localCrimeIndex: 28, incidentCount: 4, incidentsByType: { bullying: 2, vandalism: 0, theft: 1, assault: 0, substanceRelated: 1 }, suspensionRate: 0.5, attendanceRate: 96.2, nearbyOffences: 24, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 80, percentile: 82 }, icsea: 1122, totalEnrolments: 440 },
  { schoolId: "SCH-QLD-007", schoolName: "Logan Reserve State School", schoolType: "primary", sector: "government", postcode: "4133", suburb: "Logan Reserve", state: "QLD", lat: -27.7160, lng: 153.1020, safetyScore: 61, localCrimeIndex: 58, incidentCount: 18, incidentsByType: { bullying: 6, vandalism: 3, theft: 4, assault: 3, substanceRelated: 2 }, suspensionRate: 3.4, attendanceRate: 88.6, nearbyOffences: 54, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 66, percentile: 32 }, icsea: 924, totalEnrolments: 510 },

  // SA
  { schoolId: "SCH-SA-001", schoolName: "Adelaide High School", schoolType: "secondary", sector: "government", postcode: "5000", suburb: "Adelaide", state: "SA", lat: -34.9260, lng: 138.5970, safetyScore: 79, localCrimeIndex: 40, incidentCount: 8, incidentsByType: { bullying: 3, vandalism: 1, theft: 2, assault: 1, substanceRelated: 1 }, suspensionRate: 1.3, attendanceRate: 93.8, nearbyOffences: 36, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 76, percentile: 64 }, icsea: 1038, totalEnrolments: 1560 },
  { schoolId: "SCH-SA-002", schoolName: "Salisbury East High School", schoolType: "secondary", sector: "government", postcode: "5109", suburb: "Salisbury East", state: "SA", lat: -34.7510, lng: 138.6720, safetyScore: 59, localCrimeIndex: 60, incidentCount: 21, incidentsByType: { bullying: 7, vandalism: 4, theft: 5, assault: 3, substanceRelated: 2 }, suspensionRate: 3.8, attendanceRate: 87.9, nearbyOffences: 58, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 64, percentile: 30 }, icsea: 918, totalEnrolments: 780 },
  { schoolId: "SCH-SA-003", schoolName: "Unley Primary School", schoolType: "primary", sector: "government", postcode: "5061", suburb: "Unley", state: "SA", lat: -34.9510, lng: 138.6080, safetyScore: 88, localCrimeIndex: 22, incidentCount: 3, incidentsByType: { bullying: 1, vandalism: 1, theft: 1, assault: 0, substanceRelated: 0 }, suspensionRate: 0.4, attendanceRate: 96.7, nearbyOffences: 14, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 82, percentile: 86 }, icsea: 1142, totalEnrolments: 360 },
  { schoolId: "SCH-SA-004", schoolName: "Elizabeth Vale Primary School", schoolType: "primary", sector: "government", postcode: "5112", suburb: "Elizabeth Vale", state: "SA", lat: -34.7140, lng: 138.6750, safetyScore: 55, localCrimeIndex: 64, incidentCount: 24, incidentsByType: { bullying: 8, vandalism: 5, theft: 5, assault: 4, substanceRelated: 2 }, suspensionRate: 4.2, attendanceRate: 86.4, nearbyOffences: 62, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 62, percentile: 24 }, icsea: 896, totalEnrolments: 290 },

  // WA
  { schoolId: "SCH-WA-001", schoolName: "Perth Modern School", schoolType: "secondary", sector: "government", postcode: "6008", suburb: "Subiaco", state: "WA", lat: -31.9480, lng: 115.8280, safetyScore: 91, localCrimeIndex: 20, incidentCount: 2, incidentsByType: { bullying: 1, vandalism: 0, theft: 1, assault: 0, substanceRelated: 0 }, suspensionRate: 0.3, attendanceRate: 97.2, nearbyOffences: 16, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 84, percentile: 92 }, icsea: 1168, totalEnrolments: 1520 },
  { schoolId: "SCH-WA-002", schoolName: "Rockingham Senior High School", schoolType: "secondary", sector: "government", postcode: "6168", suburb: "Rockingham", state: "WA", lat: -32.2810, lng: 115.7450, safetyScore: 64, localCrimeIndex: 54, incidentCount: 17, incidentsByType: { bullying: 5, vandalism: 4, theft: 4, assault: 2, substanceRelated: 2 }, suspensionRate: 3.1, attendanceRate: 89.4, nearbyOffences: 50, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 66, percentile: 42 }, icsea: 944, totalEnrolments: 1340 },
  { schoolId: "SCH-WA-003", schoolName: "Nedlands Primary School", schoolType: "primary", sector: "government", postcode: "6009", suburb: "Nedlands", state: "WA", lat: -31.9780, lng: 115.8060, safetyScore: 90, localCrimeIndex: 18, incidentCount: 2, incidentsByType: { bullying: 1, vandalism: 0, theft: 1, assault: 0, substanceRelated: 0 }, suspensionRate: 0.3, attendanceRate: 97.0, nearbyOffences: 12, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 84, percentile: 90 }, icsea: 1158, totalEnrolments: 420 },
  { schoolId: "SCH-WA-004", schoolName: "Armadale Senior High School", schoolType: "secondary", sector: "government", postcode: "6112", suburb: "Armadale", state: "WA", lat: -32.1480, lng: 116.0110, safetyScore: 56, localCrimeIndex: 63, incidentCount: 23, incidentsByType: { bullying: 7, vandalism: 5, theft: 5, assault: 4, substanceRelated: 2 }, suspensionRate: 4.0, attendanceRate: 87.2, nearbyOffences: 60, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 62, percentile: 26 }, icsea: 908, totalEnrolments: 980 },

  // TAS
  { schoolId: "SCH-TAS-001", schoolName: "Hobart College", schoolType: "secondary", sector: "government", postcode: "7000", suburb: "Hobart", state: "TAS", lat: -42.8830, lng: 147.3280, safetyScore: 76, localCrimeIndex: 42, incidentCount: 9, incidentsByType: { bullying: 3, vandalism: 2, theft: 2, assault: 1, substanceRelated: 1 }, suspensionRate: 1.5, attendanceRate: 93.1, nearbyOffences: 34, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 74, percentile: 58 }, icsea: 1022, totalEnrolments: 1080 },
  { schoolId: "SCH-TAS-002", schoolName: "Sandy Bay Infant School", schoolType: "primary", sector: "government", postcode: "7005", suburb: "Sandy Bay", state: "TAS", lat: -42.8940, lng: 147.3380, safetyScore: 86, localCrimeIndex: 24, incidentCount: 3, incidentsByType: { bullying: 1, vandalism: 1, theft: 1, assault: 0, substanceRelated: 0 }, suspensionRate: 0.5, attendanceRate: 96.4, nearbyOffences: 18, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 80, percentile: 82 }, icsea: 1128, totalEnrolments: 280 },
  { schoolId: "SCH-TAS-003", schoolName: "Glenorchy Primary School", schoolType: "primary", sector: "government", postcode: "7010", suburb: "Glenorchy", state: "TAS", lat: -42.8340, lng: 147.2780, safetyScore: 63, localCrimeIndex: 56, incidentCount: 16, incidentsByType: { bullying: 5, vandalism: 3, theft: 4, assault: 2, substanceRelated: 2 }, suspensionRate: 2.8, attendanceRate: 89.8, nearbyOffences: 48, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 68, percentile: 36 }, icsea: 932, totalEnrolments: 320 },

  // NT
  { schoolId: "SCH-NT-001", schoolName: "Darwin High School", schoolType: "secondary", sector: "government", postcode: "0800", suburb: "Darwin", state: "NT", lat: -12.4320, lng: 130.8410, safetyScore: 64, localCrimeIndex: 58, incidentCount: 18, incidentsByType: { bullying: 5, vandalism: 4, theft: 4, assault: 3, substanceRelated: 2 }, suspensionRate: 3.2, attendanceRate: 88.6, nearbyOffences: 56, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 66, percentile: 44 }, icsea: 962, totalEnrolments: 920 },
  { schoolId: "SCH-NT-002", schoolName: "Nightcliff Primary School", schoolType: "primary", sector: "government", postcode: "0810", suburb: "Nightcliff", state: "NT", lat: -12.3870, lng: 130.8530, safetyScore: 68, localCrimeIndex: 50, incidentCount: 12, incidentsByType: { bullying: 4, vandalism: 2, theft: 3, assault: 2, substanceRelated: 1 }, suspensionRate: 2.2, attendanceRate: 91.4, nearbyOffences: 42, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 66, percentile: 54 }, icsea: 986, totalEnrolments: 380 },
  { schoolId: "SCH-NT-003", schoolName: "Alice Springs High School", schoolType: "secondary", sector: "government", postcode: "0870", suburb: "Alice Springs", state: "NT", lat: -23.6980, lng: 133.8807, safetyScore: 52, localCrimeIndex: 72, incidentCount: 28, incidentsByType: { bullying: 8, vandalism: 6, theft: 6, assault: 5, substanceRelated: 3 }, suspensionRate: 5.2, attendanceRate: 84.2, nearbyOffences: 72, trend: "declining", comparisonToSimilar: { safetyScoreAvg: 60, percentile: 18 }, icsea: 882, totalEnrolments: 640 },

  // ACT
  { schoolId: "SCH-ACT-001", schoolName: "Canberra Grammar School", schoolType: "combined", sector: "independent", postcode: "2603", suburb: "Red Hill", state: "ACT", lat: -35.3190, lng: 149.1280, safetyScore: 93, localCrimeIndex: 16, incidentCount: 1, incidentsByType: { bullying: 1, vandalism: 0, theft: 0, assault: 0, substanceRelated: 0 }, suspensionRate: 0.2, attendanceRate: 97.6, nearbyOffences: 10, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 88, percentile: 94 }, icsea: 1192, totalEnrolments: 1860 },
  { schoolId: "SCH-ACT-002", schoolName: "Dickson College", schoolType: "secondary", sector: "government", postcode: "2602", suburb: "Dickson", state: "ACT", lat: -35.2520, lng: 149.1420, safetyScore: 77, localCrimeIndex: 38, incidentCount: 8, incidentsByType: { bullying: 3, vandalism: 1, theft: 2, assault: 1, substanceRelated: 1 }, suspensionRate: 1.2, attendanceRate: 94.2, nearbyOffences: 28, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 76, percentile: 62 }, icsea: 1048, totalEnrolments: 740 },
  { schoolId: "SCH-ACT-003", schoolName: "Ainslie School", schoolType: "primary", sector: "government", postcode: "2602", suburb: "Ainslie", state: "ACT", lat: -35.2620, lng: 149.1480, safetyScore: 84, localCrimeIndex: 28, incidentCount: 4, incidentsByType: { bullying: 2, vandalism: 0, theft: 1, assault: 0, substanceRelated: 1 }, suspensionRate: 0.6, attendanceRate: 96.0, nearbyOffences: 20, trend: "improving", comparisonToSimilar: { safetyScoreAvg: 80, percentile: 76 }, icsea: 1108, totalEnrolments: 440 },
  { schoolId: "SCH-ACT-004", schoolName: "Belconnen High School", schoolType: "secondary", sector: "government", postcode: "2617", suburb: "Belconnen", state: "ACT", lat: -35.2380, lng: 149.0670, safetyScore: 71, localCrimeIndex: 44, incidentCount: 12, incidentsByType: { bullying: 4, vandalism: 2, theft: 3, assault: 2, substanceRelated: 1 }, suspensionRate: 2.0, attendanceRate: 92.4, nearbyOffences: 38, trend: "stable", comparisonToSimilar: { safetyScoreAvg: 72, percentile: 48 }, icsea: 988, totalEnrolments: 860 },
];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const schoolId = searchParams.get("id");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = parseFloat(searchParams.get("radius") ?? "5");
  const state = searchParams.get("state");

  let results = [...MOCK_SCHOOLS];

  if (schoolId) {
    const school = results.find((s) => s.schoolId === schoolId);
    return NextResponse.json(school ?? null);
  }

  if (postcode) {
    results = results.filter((s) => s.postcode === postcode);
  }

  if (state) {
    results = results.filter((s) => s.state === state.toUpperCase());
  }

  if (lat && lng) {
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    results = results.filter(
      (s) => haversineDistance(centerLat, centerLng, s.lat, s.lng) <= radius
    );
  }

  return NextResponse.json(results);
}
