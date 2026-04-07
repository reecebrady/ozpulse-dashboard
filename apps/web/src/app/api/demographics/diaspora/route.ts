import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/demographics/diaspora
 *
 * Concentration data by suburb: percentage of residents born in specific countries,
 * language spoken at home. Uses real ABS Census-style structure.
 *
 * Query params:
 *   - postcode (optional): filter by postcode
 *   - suburb (optional): filter by suburb name
 *   - state (optional): filter by state
 *   - country (optional): filter to show concentration of a specific country of origin
 */

interface DiasporaRecord {
  postcode: string;
  suburb: string;
  state: string;
  lat: number;
  lng: number;
  totalPopulation: number;
  overseasBornPercent: number;
  topAncestries: {
    country: string;
    count: number;
    percentage: number;
    yearOnYearChange: number;
  }[];
  languagesSpokenAtHome: {
    language: string;
    count: number;
    percentage: number;
  }[];
  englishProficiency: {
    speaksOnlyEnglish: number;
    speaksOtherVeryWell: number;
    speaksOtherNotWell: number;
    notStated: number;
  };
}

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

// Ancestry profiles: different suburbs have different compositions
interface SuburbProfile {
  postcode: string;
  suburb: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  overseasBornPct: number;
  dominantAncestries: { country: string; basePct: number }[];
  dominantLanguages: { language: string; basePct: number }[];
}

const SUBURB_PROFILES: SuburbProfile[] = [
  // High Chinese concentration
  { postcode: "2135", suburb: "Strathfield", state: "NSW", lat: -33.8770, lng: 151.0940, population: 42180, overseasBornPct: 58.2,
    dominantAncestries: [{ country: "China", basePct: 24.8 }, { country: "South Korea", basePct: 12.1 }, { country: "India", basePct: 8.4 }, { country: "Lebanon", basePct: 4.2 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 22.1 }, { language: "Korean", basePct: 10.8 }, { language: "Cantonese", basePct: 8.4 }, { language: "Hindi", basePct: 4.2 }] },
  // High Indian concentration
  { postcode: "2150", suburb: "Parramatta", state: "NSW", lat: -33.8151, lng: 151.0011, population: 38420, overseasBornPct: 62.4,
    dominantAncestries: [{ country: "India", basePct: 28.6 }, { country: "China", basePct: 11.2 }, { country: "Sri Lanka", basePct: 6.8 }, { country: "Philippines", basePct: 5.1 }],
    dominantLanguages: [{ language: "Hindi", basePct: 14.2 }, { language: "Tamil", basePct: 8.6 }, { language: "Mandarin", basePct: 9.8 }, { language: "Gujarati", basePct: 4.1 }] },
  // High Vietnamese concentration
  { postcode: "2166", suburb: "Cabramatta", state: "NSW", lat: -33.8947, lng: 150.9370, population: 24680, overseasBornPct: 72.1,
    dominantAncestries: [{ country: "Vietnam", basePct: 38.4 }, { country: "China", basePct: 14.6 }, { country: "Philippines", basePct: 5.2 }, { country: "Cambodia", basePct: 4.8 }],
    dominantLanguages: [{ language: "Vietnamese", basePct: 35.2 }, { language: "Cantonese", basePct: 12.4 }, { language: "Mandarin", basePct: 6.8 }, { language: "Khmer", basePct: 3.9 }] },
  // High Lebanese/Arabic concentration
  { postcode: "2200", suburb: "Bankstown", state: "NSW", lat: -33.9175, lng: 151.0356, population: 32140, overseasBornPct: 56.8,
    dominantAncestries: [{ country: "Lebanon", basePct: 18.2 }, { country: "Vietnam", basePct: 10.4 }, { country: "China", basePct: 8.6 }, { country: "Pakistan", basePct: 5.8 }],
    dominantLanguages: [{ language: "Arabic", basePct: 22.4 }, { language: "Vietnamese", basePct: 8.6 }, { language: "Mandarin", basePct: 6.2 }, { language: "Urdu", basePct: 3.8 }] },
  // Melbourne — High Indian/Chinese
  { postcode: "3175", suburb: "Dandenong", state: "VIC", lat: -37.9863, lng: 145.2150, population: 29480, overseasBornPct: 64.8,
    dominantAncestries: [{ country: "India", basePct: 22.4 }, { country: "Sri Lanka", basePct: 11.8 }, { country: "Afghanistan", basePct: 8.2 }, { country: "Vietnam", basePct: 6.4 }],
    dominantLanguages: [{ language: "Hindi", basePct: 10.2 }, { language: "Sinhalese", basePct: 8.4 }, { language: "Dari", basePct: 6.8 }, { language: "Vietnamese", basePct: 5.6 }] },
  // Melbourne — High Chinese
  { postcode: "3168", suburb: "Clayton", state: "VIC", lat: -37.9215, lng: 145.1258, population: 22860, overseasBornPct: 58.6,
    dominantAncestries: [{ country: "China", basePct: 26.2 }, { country: "India", basePct: 12.4 }, { country: "Malaysia", basePct: 7.8 }, { country: "Sri Lanka", basePct: 4.6 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 24.8 }, { language: "Hindi", basePct: 6.2 }, { language: "Tamil", basePct: 4.8 }, { language: "Malay", basePct: 3.2 }] },
  // Melbourne — High Italian/Greek (older migration)
  { postcode: "3058", suburb: "Coburg", state: "VIC", lat: -37.7424, lng: 144.9640, population: 28340, overseasBornPct: 42.6,
    dominantAncestries: [{ country: "Italy", basePct: 12.4 }, { country: "Greece", basePct: 8.6 }, { country: "Lebanon", basePct: 6.2 }, { country: "India", basePct: 8.8 }],
    dominantLanguages: [{ language: "Italian", basePct: 8.2 }, { language: "Greek", basePct: 6.4 }, { language: "Arabic", basePct: 5.8 }, { language: "Hindi", basePct: 4.2 }] },
  // Brisbane — Diverse
  { postcode: "4101", suburb: "South Brisbane", state: "QLD", lat: -27.4975, lng: 153.0137, population: 18940, overseasBornPct: 48.4,
    dominantAncestries: [{ country: "China", basePct: 14.2 }, { country: "India", basePct: 12.8 }, { country: "New Zealand", basePct: 8.6 }, { country: "United Kingdom", basePct: 7.4 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 12.6 }, { language: "Hindi", basePct: 6.4 }, { language: "Korean", basePct: 4.2 }, { language: "Spanish", basePct: 2.8 }] },
  // Brisbane — Pacific Islander
  { postcode: "4114", suburb: "Logan Central", state: "QLD", lat: -27.6390, lng: 153.1080, population: 16420, overseasBornPct: 52.8,
    dominantAncestries: [{ country: "New Zealand", basePct: 16.8 }, { country: "Vietnam", basePct: 8.4 }, { country: "India", basePct: 6.2 }, { country: "Philippines", basePct: 5.8 }],
    dominantLanguages: [{ language: "Samoan", basePct: 8.4 }, { language: "Vietnamese", basePct: 7.2 }, { language: "Hindi", basePct: 3.8 }, { language: "Tagalog", basePct: 3.2 }] },
  // Adelaide — UK heritage
  { postcode: "5000", suburb: "Adelaide", state: "SA", lat: -34.9285, lng: 138.6007, population: 24680, overseasBornPct: 42.2,
    dominantAncestries: [{ country: "United Kingdom", basePct: 12.8 }, { country: "India", basePct: 10.4 }, { country: "China", basePct: 8.2 }, { country: "Italy", basePct: 4.6 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 6.8 }, { language: "Hindi", basePct: 5.4 }, { language: "Italian", basePct: 3.2 }, { language: "Vietnamese", basePct: 2.8 }] },
  // Perth — UK/South African
  { postcode: "6000", suburb: "Perth", state: "WA", lat: -31.9505, lng: 115.8605, population: 32840, overseasBornPct: 46.8,
    dominantAncestries: [{ country: "United Kingdom", basePct: 14.6 }, { country: "India", basePct: 8.8 }, { country: "South Africa", basePct: 6.4 }, { country: "Malaysia", basePct: 5.2 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 5.2 }, { language: "Hindi", basePct: 4.6 }, { language: "Afrikaans", basePct: 3.8 }, { language: "Malay", basePct: 2.4 }] },
  // Sydney — Inner (Anglo)
  { postcode: "2000", suburb: "Sydney", state: "NSW", lat: -33.8688, lng: 151.2093, population: 28640, overseasBornPct: 52.4,
    dominantAncestries: [{ country: "United Kingdom", basePct: 12.2 }, { country: "China", basePct: 16.4 }, { country: "South Korea", basePct: 6.8 }, { country: "Thailand", basePct: 4.2 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 14.2 }, { language: "Korean", basePct: 5.8 }, { language: "Thai", basePct: 3.6 }, { language: "Japanese", basePct: 2.8 }] },
  // Melbourne CBD
  { postcode: "3000", suburb: "Melbourne", state: "VIC", lat: -37.8136, lng: 144.9631, population: 42180, overseasBornPct: 62.8,
    dominantAncestries: [{ country: "China", basePct: 22.4 }, { country: "India", basePct: 14.6 }, { country: "Malaysia", basePct: 6.2 }, { country: "Indonesia", basePct: 4.8 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 20.2 }, { language: "Hindi", basePct: 8.4 }, { language: "Cantonese", basePct: 6.8 }, { language: "Malay", basePct: 3.2 }] },
  // Gold Coast
  { postcode: "4217", suburb: "Surfers Paradise", state: "QLD", lat: -28.0027, lng: 153.4300, population: 22460, overseasBornPct: 38.4,
    dominantAncestries: [{ country: "New Zealand", basePct: 12.4 }, { country: "United Kingdom", basePct: 10.2 }, { country: "Japan", basePct: 5.8 }, { country: "China", basePct: 5.2 }],
    dominantLanguages: [{ language: "Japanese", basePct: 4.8 }, { language: "Mandarin", basePct: 4.2 }, { language: "Korean", basePct: 2.6 }, { language: "Hindi", basePct: 2.2 }] },
  // Darwin
  { postcode: "0800", suburb: "Darwin", state: "NT", lat: -12.4634, lng: 130.8456, population: 18960, overseasBornPct: 32.6,
    dominantAncestries: [{ country: "Philippines", basePct: 8.4 }, { country: "New Zealand", basePct: 4.2 }, { country: "Indonesia", basePct: 3.8 }, { country: "United Kingdom", basePct: 3.6 }],
    dominantLanguages: [{ language: "Tagalog", basePct: 6.2 }, { language: "Greek", basePct: 2.8 }, { language: "Indonesian", basePct: 2.4 }, { language: "Mandarin", basePct: 1.8 }] },
  // Hobart
  { postcode: "7000", suburb: "Hobart", state: "TAS", lat: -42.8821, lng: 147.3272, population: 16840, overseasBornPct: 24.8,
    dominantAncestries: [{ country: "United Kingdom", basePct: 8.6 }, { country: "China", basePct: 4.2 }, { country: "Nepal", basePct: 3.8 }, { country: "India", basePct: 3.4 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 3.4 }, { language: "Nepali", basePct: 2.8 }, { language: "Hindi", basePct: 1.8 }, { language: "Korean", basePct: 1.2 }] },
  // Canberra
  { postcode: "2601", suburb: "Canberra", state: "ACT", lat: -35.2809, lng: 149.1300, population: 28460, overseasBornPct: 34.2,
    dominantAncestries: [{ country: "United Kingdom", basePct: 8.2 }, { country: "China", basePct: 6.8 }, { country: "India", basePct: 6.4 }, { country: "Philippines", basePct: 3.2 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 5.8 }, { language: "Hindi", basePct: 4.2 }, { language: "Korean", basePct: 2.2 }, { language: "Vietnamese", basePct: 1.8 }] },
  // Auburn — Middle Eastern
  { postcode: "2144", suburb: "Auburn", state: "NSW", lat: -33.8490, lng: 151.0330, population: 36820, overseasBornPct: 68.4,
    dominantAncestries: [{ country: "China", basePct: 18.6 }, { country: "Pakistan", basePct: 8.4 }, { country: "Afghanistan", basePct: 7.2 }, { country: "Turkey", basePct: 6.8 }],
    dominantLanguages: [{ language: "Mandarin", basePct: 16.4 }, { language: "Arabic", basePct: 10.2 }, { language: "Urdu", basePct: 6.8 }, { language: "Turkish", basePct: 5.4 }] },
  // Springvale — Vietnamese
  { postcode: "3171", suburb: "Springvale", state: "VIC", lat: -37.9500, lng: 145.1530, population: 22160, overseasBornPct: 66.2,
    dominantAncestries: [{ country: "Vietnam", basePct: 28.6 }, { country: "Cambodia", basePct: 8.4 }, { country: "China", basePct: 12.2 }, { country: "Sri Lanka", basePct: 4.8 }],
    dominantLanguages: [{ language: "Vietnamese", basePct: 26.4 }, { language: "Mandarin", basePct: 10.8 }, { language: "Khmer", basePct: 6.2 }, { language: "Cantonese", basePct: 4.6 }] },
  // Blacktown — South Asian
  { postcode: "2148", suburb: "Blacktown", state: "NSW", lat: -33.7690, lng: 150.9063, population: 48620, overseasBornPct: 54.6,
    dominantAncestries: [{ country: "India", basePct: 18.4 }, { country: "Philippines", basePct: 10.2 }, { country: "Sri Lanka", basePct: 6.8 }, { country: "Nepal", basePct: 4.6 }],
    dominantLanguages: [{ language: "Hindi", basePct: 10.8 }, { language: "Tagalog", basePct: 8.2 }, { language: "Tamil", basePct: 4.6 }, { language: "Nepali", basePct: 3.4 }] },
];

function buildDiasporaRecord(profile: SuburbProfile): DiasporaRecord {
  // Add year-on-year change to each ancestry
  const topAncestries = profile.dominantAncestries.map((a) => ({
    country: a.country,
    count: Math.round(profile.population * a.basePct / 100),
    percentage: a.basePct,
    yearOnYearChange: Math.round((seededRandom(`yoy-${profile.postcode}-${a.country}`) * 4 - 1) * 10) / 10,
  }));

  const languagesSpokenAtHome = profile.dominantLanguages.map((l) => ({
    language: l.language,
    count: Math.round(profile.population * l.basePct / 100),
    percentage: l.basePct,
  }));

  // English proficiency proportional to overseas-born percentage
  const nonEnglishPct = profile.overseasBornPct * 0.65;
  const englishProficiency = {
    speaksOnlyEnglish: Math.round(100 - nonEnglishPct),
    speaksOtherVeryWell: Math.round(nonEnglishPct * 0.55),
    speaksOtherNotWell: Math.round(nonEnglishPct * 0.35),
    notStated: Math.round(nonEnglishPct * 0.10),
  };

  return {
    postcode: profile.postcode,
    suburb: profile.suburb,
    state: profile.state,
    lat: profile.lat,
    lng: profile.lng,
    totalPopulation: profile.population,
    overseasBornPercent: profile.overseasBornPct,
    topAncestries,
    languagesSpokenAtHome,
    englishProficiency,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcodeFilter = searchParams.get("postcode");
  const suburbFilter = searchParams.get("suburb");
  const stateFilter = searchParams.get("state");
  const countryFilter = searchParams.get("country");

  let profiles = [...SUBURB_PROFILES];

  if (postcodeFilter) {
    profiles = profiles.filter((p) => p.postcode === postcodeFilter);
  }
  if (suburbFilter) {
    profiles = profiles.filter((p) =>
      p.suburb.toLowerCase().includes(suburbFilter.toLowerCase())
    );
  }
  if (stateFilter) {
    profiles = profiles.filter((p) => p.state === stateFilter.toUpperCase());
  }

  const records = profiles.map(buildDiasporaRecord);

  // If filtering by country of origin, include concentration percentage for map
  if (countryFilter) {
    const countryRecords = records.map((r) => {
      const ancestry = r.topAncestries.find(
        (a) => a.country.toLowerCase() === countryFilter.toLowerCase()
      );
      return {
        postcode: r.postcode,
        suburb: r.suburb,
        state: r.state,
        lat: r.lat,
        lng: r.lng,
        totalPopulation: r.totalPopulation,
        country: countryFilter,
        count: ancestry?.count ?? 0,
        percentage: ancestry?.percentage ?? 0,
        yearOnYearChange: ancestry?.yearOnYearChange ?? 0,
      };
    }).filter((r) => r.percentage > 0);

    return NextResponse.json(countryRecords);
  }

  return NextResponse.json(records);
}
