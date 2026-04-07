import type {
  AustralianState,
  CrimeRecord,
  STATE_POLICE_SOURCES,
} from "../types";

interface StatePoliceConfig {
  state: AustralianState;
  baseUrl: string;
  format: string;
}

// Normalised fetch from each state police open data portal
export async function fetchStatePoliceData(
  state: AustralianState,
  postcode?: string
): Promise<CrimeRecord[]> {
  const params = new URLSearchParams({ state });
  if (postcode) params.set("postcode", postcode);

  const res = await fetch(`/api/crime?${params}`);
  if (!res.ok) return [];
  return res.json();
}

// Server-side: normalise NSW BOCSAR data
export function parseNSWBOCSARResponse(raw: {
  data: {
    lga: string;
    offence_category: string;
    offence_subcategory: string;
    incidents: number;
    rate_per_100000: number;
    year: number;
    month: number;
    latitude: number;
    longitude: number;
  }[];
}): CrimeRecord[] {
  return raw.data.map((row) => ({
    id: `nsw-${row.lga}-${row.offence_category}-${row.year}${String(row.month).padStart(2, "0")}`,
    postcode: "", // resolved via geocoding
    sa3Code: row.lga,
    sa3Name: row.lga,
    state: "NSW",
    category: categoriseNSWOffence(row.offence_category),
    offenceType: row.offence_subcategory,
    count: row.incidents,
    rate: row.rate_per_100000,
    period: `${row.year}-${String(row.month).padStart(2, "0")}`,
    lat: row.latitude,
    lng: row.longitude,
  }));
}

function categoriseNSWOffence(
  category: string
): CrimeRecord["category"] {
  const cat = category.toLowerCase();
  if (cat.includes("assault") || cat.includes("robbery") || cat.includes("homicide") || cat.includes("sexual"))
    return "violent";
  if (cat.includes("theft") || cat.includes("break") || cat.includes("steal") || cat.includes("fraud"))
    return "property";
  if (cat.includes("drug")) return "drug";
  if (cat.includes("traffic") || cat.includes("driving")) return "traffic";
  return "public-order";
}

// Server-side: normalise VIC Crime Statistics Agency data
export function parseVICCSAResponse(raw: {
  records: {
    offence_division: string;
    offence_subdivision: string;
    lga: string;
    incidents_recorded: number;
    rate_per_100000: number;
    year: string;
    latitude: number;
    longitude: number;
  }[];
}): CrimeRecord[] {
  return raw.records.map((row) => ({
    id: `vic-${row.lga}-${row.offence_division}-${row.year}`,
    postcode: "",
    sa3Code: row.lga,
    sa3Name: row.lga,
    state: "VIC",
    category: categoriseVICOffence(row.offence_division),
    offenceType: row.offence_subdivision,
    count: row.incidents_recorded,
    rate: row.rate_per_100000,
    period: row.year,
    lat: row.latitude,
    lng: row.longitude,
  }));
}

function categoriseVICOffence(
  division: string
): CrimeRecord["category"] {
  const d = division.toLowerCase();
  if (d.includes("person")) return "violent";
  if (d.includes("property")) return "property";
  if (d.includes("drug")) return "drug";
  if (d.includes("order") || d.includes("justice")) return "public-order";
  return "traffic";
}

// Server-side: normalise QLD Police data (CSV-based, pre-parsed)
export function parseQLDPoliceResponse(rows: {
  offence: string;
  division: string;
  district: string;
  count: number;
  year: number;
  month: number;
  lat: number;
  lng: number;
}[]): CrimeRecord[] {
  return rows.map((row) => ({
    id: `qld-${row.district}-${row.offence}-${row.year}${String(row.month).padStart(2, "0")}`,
    postcode: "",
    sa3Code: row.district,
    sa3Name: row.district,
    state: "QLD",
    category: categoriseNSWOffence(row.division), // similar categorisation
    offenceType: row.offence,
    count: row.count,
    rate: 0,
    period: `${row.year}-${String(row.month).padStart(2, "0")}`,
    lat: row.lat,
    lng: row.lng,
  }));
}
