import type { AuState } from "@ozpulse/shared";

/** Major Australian suburbs with coordinates for mock data and heatmap seeding */
export const MAJOR_SUBURBS = [
  // Sydney
  { suburb: "Parramatta", postcode: "2150", state: "NSW" as AuState, lat: -33.8151, lng: 151.0011 },
  { suburb: "Penrith", postcode: "2750", state: "NSW" as AuState, lat: -33.7507, lng: 150.6944 },
  { suburb: "Liverpool", postcode: "2170", state: "NSW" as AuState, lat: -33.9209, lng: 150.9235 },
  { suburb: "Blacktown", postcode: "2148", state: "NSW" as AuState, lat: -33.7688, lng: 150.9065 },
  { suburb: "Campbelltown", postcode: "2560", state: "NSW" as AuState, lat: -34.0654, lng: 150.8141 },
  { suburb: "Bankstown", postcode: "2200", state: "NSW" as AuState, lat: -33.9175, lng: 151.0346 },
  { suburb: "Castle Hill", postcode: "2154", state: "NSW" as AuState, lat: -33.7310, lng: 151.0036 },
  { suburb: "Hornsby", postcode: "2077", state: "NSW" as AuState, lat: -33.7028, lng: 151.0986 },
  { suburb: "Chatswood", postcode: "2067", state: "NSW" as AuState, lat: -33.7969, lng: 151.1811 },
  { suburb: "Sydney CBD", postcode: "2000", state: "NSW" as AuState, lat: -33.8688, lng: 151.2093 },
  { suburb: "Bondi", postcode: "2026", state: "NSW" as AuState, lat: -33.8914, lng: 151.2743 },
  { suburb: "Manly", postcode: "2095", state: "NSW" as AuState, lat: -33.7969, lng: 151.2844 },
  { suburb: "Cronulla", postcode: "2230", state: "NSW" as AuState, lat: -34.0553, lng: 151.1518 },
  // Melbourne
  { suburb: "Melbourne CBD", postcode: "3000", state: "VIC" as AuState, lat: -37.8136, lng: 144.9631 },
  { suburb: "Footscray", postcode: "3011", state: "VIC" as AuState, lat: -37.7994, lng: 144.8995 },
  { suburb: "Dandenong", postcode: "3175", state: "VIC" as AuState, lat: -37.9871, lng: 145.2150 },
  { suburb: "Werribee", postcode: "3030", state: "VIC" as AuState, lat: -37.9000, lng: 144.6613 },
  { suburb: "Frankston", postcode: "3199", state: "VIC" as AuState, lat: -38.1453, lng: 145.1267 },
  { suburb: "Box Hill", postcode: "3128", state: "VIC" as AuState, lat: -37.8190, lng: 145.1218 },
  { suburb: "Ringwood", postcode: "3134", state: "VIC" as AuState, lat: -37.8131, lng: 145.2288 },
  { suburb: "St Kilda", postcode: "3182", state: "VIC" as AuState, lat: -37.8676, lng: 144.9809 },
  // Brisbane
  { suburb: "Brisbane CBD", postcode: "4000", state: "QLD" as AuState, lat: -27.4698, lng: 153.0251 },
  { suburb: "Ipswich", postcode: "4305", state: "QLD" as AuState, lat: -27.6170, lng: 152.7607 },
  { suburb: "Logan", postcode: "4114", state: "QLD" as AuState, lat: -27.6389, lng: 153.1094 },
  { suburb: "Gold Coast", postcode: "4217", state: "QLD" as AuState, lat: -28.0167, lng: 153.4000 },
  { suburb: "Caboolture", postcode: "4510", state: "QLD" as AuState, lat: -27.0849, lng: 152.9517 },
  { suburb: "Toowoomba", postcode: "4350", state: "QLD" as AuState, lat: -27.5598, lng: 151.9507 },
  // Perth
  { suburb: "Perth CBD", postcode: "6000", state: "WA" as AuState, lat: -31.9505, lng: 115.8605 },
  { suburb: "Fremantle", postcode: "6160", state: "WA" as AuState, lat: -32.0569, lng: 115.7484 },
  { suburb: "Joondalup", postcode: "6027", state: "WA" as AuState, lat: -31.7445, lng: 115.7669 },
  { suburb: "Rockingham", postcode: "6168", state: "WA" as AuState, lat: -32.2768, lng: 115.7340 },
  // Adelaide
  { suburb: "Adelaide CBD", postcode: "5000", state: "SA" as AuState, lat: -34.9285, lng: 138.6007 },
  { suburb: "Elizabeth", postcode: "5112", state: "SA" as AuState, lat: -34.7257, lng: 138.6707 },
  { suburb: "Glenelg", postcode: "5045", state: "SA" as AuState, lat: -34.9814, lng: 138.5147 },
  // Hobart
  { suburb: "Hobart CBD", postcode: "7000", state: "TAS" as AuState, lat: -42.8821, lng: 147.3272 },
  // Canberra
  { suburb: "Canberra", postcode: "2601", state: "ACT" as AuState, lat: -35.2809, lng: 149.1300 },
  { suburb: "Belconnen", postcode: "2617", state: "ACT" as AuState, lat: -35.2386, lng: 149.0650 },
  // Darwin
  { suburb: "Darwin CBD", postcode: "0800", state: "NT" as AuState, lat: -12.4634, lng: 130.8456 },
] as const;

/** Stamp duty calculation brackets by state (simplified 2024 rates for owner-occupiers) */
export const STAMP_DUTY_BRACKETS: Record<AuState, { threshold: number; rate: number; base: number }[]> = {
  NSW: [
    { threshold: 0, rate: 0.0125, base: 0 },
    { threshold: 16000, rate: 0.015, base: 200 },
    { threshold: 35000, rate: 0.0175, base: 485 },
    { threshold: 93000, rate: 0.035, base: 1500 },
    { threshold: 351000, rate: 0.045, base: 10530 },
    { threshold: 1168000, rate: 0.055, base: 47295 },
    { threshold: 3505000, rate: 0.07, base: 175855 },
  ],
  VIC: [
    { threshold: 0, rate: 0.014, base: 0 },
    { threshold: 25000, rate: 0.024, base: 350 },
    { threshold: 130000, rate: 0.05, base: 2870 },
    { threshold: 960000, rate: 0.055, base: 44370 },
    { threshold: 2000000, rate: 0.065, base: 110000 },
  ],
  QLD: [
    { threshold: 0, rate: 0.01, base: 0 },
    { threshold: 75000, rate: 0.015, base: 750 },
    { threshold: 150000, rate: 0.02, base: 1875 },
    { threshold: 350000, rate: 0.035, base: 5875 },
    { threshold: 585000, rate: 0.045, base: 14100 },
    { threshold: 980000, rate: 0.0575, base: 31875 },
  ],
  WA: [
    { threshold: 0, rate: 0.019, base: 0 },
    { threshold: 120000, rate: 0.0285, base: 2280 },
    { threshold: 150000, rate: 0.038, base: 3135 },
    { threshold: 360000, rate: 0.0475, base: 11115 },
    { threshold: 725000, rate: 0.0515, base: 28453 },
  ],
  SA: [
    { threshold: 0, rate: 0.01, base: 0 },
    { threshold: 12000, rate: 0.02, base: 120 },
    { threshold: 50000, rate: 0.03, base: 880 },
    { threshold: 100000, rate: 0.035, base: 2380 },
    { threshold: 200000, rate: 0.04, base: 5880 },
    { threshold: 250000, rate: 0.045, base: 7880 },
    { threshold: 300000, rate: 0.05, base: 10130 },
    { threshold: 500000, rate: 0.055, base: 20130 },
  ],
  TAS: [
    { threshold: 0, rate: 0.0175, base: 50 },
    { threshold: 25000, rate: 0.0225, base: 488 },
    { threshold: 75000, rate: 0.035, base: 1613 },
    { threshold: 200000, rate: 0.04, base: 5988 },
    { threshold: 375000, rate: 0.0425, base: 12988 },
    { threshold: 725000, rate: 0.045, base: 27863 },
  ],
  ACT: [
    { threshold: 0, rate: 0.006, base: 0 },
    { threshold: 200000, rate: 0.023, base: 1200 },
    { threshold: 300000, rate: 0.04, base: 3500 },
    { threshold: 500000, rate: 0.055, base: 11500 },
    { threshold: 750000, rate: 0.045, base: 25250 },
    { threshold: 1000000, rate: 0.055, base: 36500 },
    { threshold: 1455000, rate: 0.07, base: 61525 },
  ],
  NT: [
    { threshold: 0, rate: 0.0, base: 0 },
    { threshold: 525000, rate: 0.0495, base: 0 },
  ],
};

/** Refresh interval for real estate data (1 hour) */
export const REAL_ESTATE_REFRESH_MS = 3_600_000;

/** Colors for the price heatmap */
export const PRICE_HEATMAP_COLORS = {
  veryLow: "#22c55e",   // green - under $400/sqm
  low: "#84cc16",       // lime - $400-600
  medium: "#eab308",    // yellow - $600-900
  high: "#f97316",      // orange - $900-1200
  veryHigh: "#ef4444",  // red - $1200+
} as const;
