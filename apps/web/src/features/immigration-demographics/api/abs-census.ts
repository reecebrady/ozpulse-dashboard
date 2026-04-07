import type {
  DiasporaConcentration,
  WorkforceShift,
  SettlementPattern,
} from "../types";

export async function fetchDiasporaByPostcode(
  postcode: string
): Promise<DiasporaConcentration | null> {
  const res = await fetch(`/api/immigration/diaspora?postcode=${postcode}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDiasporaHeatmap(
  state?: string
): Promise<DiasporaConcentration[]> {
  const params = new URLSearchParams();
  if (state) params.set("state", state);
  const res = await fetch(`/api/immigration/diaspora?${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchWorkforceShifts(
  sa4Code?: string,
  governmentOnly?: boolean
): Promise<WorkforceShift[]> {
  const params = new URLSearchParams();
  if (sa4Code) params.set("sa4", sa4Code);
  if (governmentOnly) params.set("government", "true");
  const res = await fetch(`/api/immigration/workforce?${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSettlementPatterns(
  state?: string
): Promise<SettlementPattern[]> {
  const params = new URLSearchParams();
  if (state) params.set("state", state);
  const res = await fetch(`/api/immigration?format=settlement&${params}`);
  if (!res.ok) return [];
  return res.json();
}

// Server-side: parse ABS Census TableBuilder data for ancestry/language
export interface ABSCensusRawRow {
  region_code: string;
  region_name: string;
  ancestry_code: string;
  ancestry_name: string;
  language_code: string;
  language_name: string;
  count: number;
  total_population: number;
  state: string;
  latitude: number;
  longitude: number;
}

export function aggregateDiasporaFromCensus(
  rows: ABSCensusRawRow[],
  postcode: string
): DiasporaConcentration | null {
  const postcodeRows = rows.filter((r) => r.region_code === postcode);
  if (postcodeRows.length === 0) return null;

  const totalPop = postcodeRows[0]!.total_population;
  const suburb = postcodeRows[0]!.region_name;
  const state = postcodeRows[0]!.state;
  const lat = postcodeRows[0]!.latitude;
  const lng = postcodeRows[0]!.longitude;

  // Aggregate ancestries
  const ancestryMap = new Map<string, number>();
  const languageMap = new Map<string, number>();

  for (const row of postcodeRows) {
    if (row.ancestry_name && row.ancestry_name !== "Australian") {
      ancestryMap.set(
        row.ancestry_name,
        (ancestryMap.get(row.ancestry_name) ?? 0) + row.count
      );
    }
    if (row.language_name && row.language_name !== "English") {
      languageMap.set(
        row.language_name,
        (languageMap.get(row.language_name) ?? 0) + row.count
      );
    }
  }

  const topAncestries = Array.from(ancestryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([country, count]) => ({
      country,
      count,
      percentage: totalPop > 0 ? (count / totalPop) * 100 : 0,
      yearOnYearChange: 0, // requires previous period data
    }));

  const languagesSpokenAtHome = Array.from(languageMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([language, count]) => ({
      language,
      count,
      percentage: totalPop > 0 ? (count / totalPop) * 100 : 0,
    }));

  const overseasBornCount = topAncestries.reduce((s, a) => s + a.count, 0);

  return {
    postcode,
    suburb,
    state,
    lat,
    lng,
    totalPopulation: totalPop,
    overseasBornPercent: totalPop > 0 ? (overseasBornCount / totalPop) * 100 : 0,
    topAncestries,
    languagesSpokenAtHome,
    englishProficiency: {
      speaksOnlyEnglish: 0,
      speaksOtherVeryWell: 0,
      speaksOtherNotWell: 0,
      notStated: 0,
    },
  };
}
