import type {
  PostcodeMigrationSummary,
  MigrationRecord,
  MigrationFlowLine,
  VisaCategory,
  COUNTRY_COORDINATES,
} from "../types";

export async function fetchMigrationByPostcode(
  postcode: string
): Promise<PostcodeMigrationSummary | null> {
  const res = await fetch(`/api/immigration/${postcode}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMigrationByState(
  state: string
): Promise<MigrationRecord[]> {
  const res = await fetch(`/api/immigration?state=${state}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchNationalMigrationHeatmap(): Promise<
  { lat: number; lng: number; value: number; postcode: string }[]
> {
  const res = await fetch("/api/immigration?format=heatmap");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMigrationFlows(): Promise<MigrationFlowLine[]> {
  const res = await fetch("/api/immigration?format=flows");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMigrationTrends(
  postcode: string,
  quarters: number = 8
): Promise<
  {
    period: string;
    arrivals: number;
    departures: number;
    net: number;
  }[]
> {
  const res = await fetch(
    `/api/immigration/${postcode}?trends=true&quarters=${quarters}`
  );
  if (!res.ok) return [];
  return res.json();
}

// Server-side: parse ABS migration SDMX-JSON response
export interface ABSMigrationRaw {
  dataSets: {
    series: Record<
      string,
      {
        attributes: number[];
        observations: Record<string, number[]>;
      }
    >;
  }[];
  structure: {
    dimensions: {
      series: { id: string; values: { id: string; name: string }[] }[];
      observation: { values: { id: string; name: string }[] }[];
    };
  };
}

export function parseABSMigrationResponse(
  raw: ABSMigrationRaw
): MigrationRecord[] {
  const records: MigrationRecord[] = [];
  const dataset = raw.dataSets[0];
  if (!dataset) return records;

  const seriesDims = raw.structure.dimensions.series;
  const obsDims = raw.structure.dimensions.observation;

  for (const [seriesKey, series] of Object.entries(dataset.series)) {
    const indices = seriesKey.split(":").map(Number);
    const regionVal = seriesDims[0]?.values[indices[0]!];
    const visaVal = seriesDims[1]?.values[indices[1]!];
    const countryVal = seriesDims[2]?.values[indices[2]!];

    if (!regionVal || !visaVal || !countryVal) continue;

    for (const [obsKey, obsValues] of Object.entries(series.observations)) {
      const periodVal = obsDims[0]?.values[Number(obsKey)];
      if (!periodVal || obsValues[0] == null) continue;

      records.push({
        id: `${regionVal.id}-${visaVal.id}-${countryVal.id}-${periodVal.id}`,
        sa4Code: regionVal.id,
        sa4Name: regionVal.name,
        state: regionVal.id.substring(0, 1) === "1" ? "NSW" : "VIC",
        period: periodVal.id,
        visaCategory: mapABSVisaCategory(visaVal.id),
        sourceCountry: countryVal.name,
        arrivals: Math.max(0, obsValues[0]),
        departures: obsValues[1] ? Math.max(0, obsValues[1]) : 0,
        netMovement: obsValues[0] - (obsValues[1] ?? 0),
        lat: 0,
        lng: 0,
      });
    }
  }

  return records;
}

function mapABSVisaCategory(absCode: string): VisaCategory {
  const mapping: Record<string, VisaCategory> = {
    SKL: "skilled",
    FAM: "family",
    STU: "student",
    HUM: "humanitarian",
    WHM: "working-holiday",
    BUS: "business",
  };
  return mapping[absCode] ?? "other";
}
