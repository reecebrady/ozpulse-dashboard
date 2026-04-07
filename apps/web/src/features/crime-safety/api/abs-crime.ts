import type {
  PostcodeCrimeSummary,
  CrimeRecord,
  CrimeTrendPoint,
  AustralianState,
  OffenceCategory,
} from "../types";

const ABS_BASE_URL =
  process.env.NEXT_PUBLIC_ABS_API_URL ??
  "https://api.data.abs.gov.au/data/ABS,RECORDED_CRIME";

interface ABSCrimeResponse {
  dataSets: {
    observations: Record<string, number[]>;
    series: Record<
      string,
      { attributes: number[]; observations: Record<string, number[]> }
    >;
  }[];
  structure: {
    dimensions: {
      observation: { values: { id: string; name: string }[] }[];
      series: { values: { id: string; name: string }[] }[];
    };
  };
}

function mapABSCategory(absCategory: string): OffenceCategory {
  const mapping: Record<string, OffenceCategory> = {
    "01": "violent",
    "02": "violent",
    "03": "property",
    "04": "property",
    "05": "drug",
    "06": "public-order",
    "07": "traffic",
    "08": "property",
    "09": "violent",
  };
  return mapping[absCategory] ?? "public-order";
}

export async function fetchABSCrimeByPostcode(
  postcode: string
): Promise<PostcodeCrimeSummary | null> {
  const res = await fetch(`/api/crime/${postcode}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchABSCrimeByState(
  state: AustralianState
): Promise<CrimeRecord[]> {
  const res = await fetch(`/api/crime?state=${state}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCrimeTrends(
  postcode: string,
  months: number = 12
): Promise<CrimeTrendPoint[]> {
  const res = await fetch(`/api/crime/trends?postcode=${postcode}&months=${months}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchNationalCrimeHeatmap(): Promise<
  { lat: number; lng: number; value: number; postcode: string }[]
> {
  const res = await fetch("/api/crime?format=heatmap");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchCrimeComparison(postcode: string): Promise<{
  userPostcode: PostcodeCrimeSummary;
  stateAverage: { crimeIndex: number; totalRate: number };
  nationalAverage: { crimeIndex: number; totalRate: number };
  percentileRank: number;
} | null> {
  const res = await fetch(`/api/crime/${postcode}?compare=true`);
  if (!res.ok) return null;
  return res.json();
}

// Server-side: parse raw ABS SDMX-JSON response
export function parseABSCrimeResponse(
  raw: ABSCrimeResponse
): CrimeRecord[] {
  const records: CrimeRecord[] = [];
  const dataset = raw.dataSets[0];
  if (!dataset) return records;

  const seriesDims = raw.structure.dimensions.series;
  const obsDims = raw.structure.dimensions.observation;

  for (const [seriesKey, series] of Object.entries(dataset.series)) {
    const indices = seriesKey.split(":").map(Number);
    const regionVal = seriesDims[0]?.values[indices[0]!];
    const offenceVal = seriesDims[1]?.values[indices[1]!];

    if (!regionVal || !offenceVal) continue;

    for (const [obsKey, obsValues] of Object.entries(series.observations)) {
      const periodVal = obsDims[0]?.values[Number(obsKey)];
      if (!periodVal || obsValues[0] == null) continue;

      records.push({
        id: `${regionVal.id}-${offenceVal.id}-${periodVal.id}`,
        postcode: regionVal.id,
        sa3Code: regionVal.id,
        sa3Name: regionVal.name,
        state: regionVal.id.substring(0, 1) === "1" ? "NSW" : "VIC",
        category: mapABSCategory(offenceVal.id),
        offenceType: offenceVal.name,
        count: obsValues[0],
        rate: 0, // calculated separately with population data
        period: periodVal.id,
        lat: 0,
        lng: 0,
      });
    }
  }

  return records;
}
