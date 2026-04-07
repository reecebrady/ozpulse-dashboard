/**
 * Global trade / supply chain data for Australian mineral and energy exports.
 * Export flows to major trading partners by commodity, volume, and value.
 */

export interface ExportFlow {
  id: string;
  commodity: string;
  destination: string;
  destinationCoords: [number, number]; // [lng, lat] of destination port/country centroid
  originPort: string;
  originCoords: [number, number]; // [lng, lat] of Australian port
  volumeTonnes: number;
  valueAUD: number;
  shareOfTotal: number; // percentage of Australia's total export for that commodity
  year: number;
}

export const EXPORT_FLOWS: ExportFlow[] = [
  // --- Iron Ore to China ---
  {
    id: "flow-001",
    commodity: "iron-ore",
    destination: "China",
    destinationCoords: [121.47, 31.23],
    originPort: "Port Hedland",
    originCoords: [118.58, -20.31],
    volumeTonnes: 620_000_000,
    valueAUD: 68_200_000_000,
    shareOfTotal: 82,
    year: 2025,
  },
  {
    id: "flow-002",
    commodity: "iron-ore",
    destination: "Japan",
    destinationCoords: [139.69, 35.69],
    originPort: "Port Hedland",
    originCoords: [118.58, -20.31],
    volumeTonnes: 45_000_000,
    valueAUD: 4_950_000_000,
    shareOfTotal: 6,
    year: 2025,
  },
  {
    id: "flow-003",
    commodity: "iron-ore",
    destination: "South Korea",
    destinationCoords: [126.98, 37.57],
    originPort: "Port Hedland",
    originCoords: [118.58, -20.31],
    volumeTonnes: 52_000_000,
    valueAUD: 5_720_000_000,
    shareOfTotal: 7,
    year: 2025,
  },
  {
    id: "flow-004",
    commodity: "iron-ore",
    destination: "India",
    destinationCoords: [72.88, 19.08],
    originPort: "Port Hedland",
    originCoords: [118.58, -20.31],
    volumeTonnes: 12_000_000,
    valueAUD: 1_320_000_000,
    shareOfTotal: 2,
    year: 2025,
  },

  // --- LNG ---
  {
    id: "flow-005",
    commodity: "lng",
    destination: "Japan",
    destinationCoords: [139.69, 35.69],
    originPort: "Dampier",
    originCoords: [116.71, -20.66],
    volumeTonnes: 28_000_000,
    valueAUD: 22_400_000_000,
    shareOfTotal: 38,
    year: 2025,
  },
  {
    id: "flow-006",
    commodity: "lng",
    destination: "China",
    destinationCoords: [121.47, 31.23],
    originPort: "Gladstone",
    originCoords: [151.27, -23.85],
    volumeTonnes: 22_000_000,
    valueAUD: 17_600_000_000,
    shareOfTotal: 30,
    year: 2025,
  },
  {
    id: "flow-007",
    commodity: "lng",
    destination: "South Korea",
    destinationCoords: [126.98, 37.57],
    originPort: "Dampier",
    originCoords: [116.71, -20.66],
    volumeTonnes: 12_000_000,
    valueAUD: 9_600_000_000,
    shareOfTotal: 16,
    year: 2025,
  },

  // --- Coal ---
  {
    id: "flow-008",
    commodity: "coal",
    destination: "Japan",
    destinationCoords: [139.69, 35.69],
    originPort: "Newcastle",
    originCoords: [151.78, -32.93],
    volumeTonnes: 65_000_000,
    valueAUD: 9_750_000_000,
    shareOfTotal: 28,
    year: 2025,
  },
  {
    id: "flow-009",
    commodity: "coal",
    destination: "India",
    destinationCoords: [72.88, 19.08],
    originPort: "Gladstone",
    originCoords: [151.27, -23.85],
    volumeTonnes: 55_000_000,
    valueAUD: 8_250_000_000,
    shareOfTotal: 24,
    year: 2025,
  },
  {
    id: "flow-010",
    commodity: "coal",
    destination: "South Korea",
    destinationCoords: [126.98, 37.57],
    originPort: "Newcastle",
    originCoords: [151.78, -32.93],
    volumeTonnes: 38_000_000,
    valueAUD: 5_700_000_000,
    shareOfTotal: 16,
    year: 2025,
  },
  {
    id: "flow-011",
    commodity: "coal",
    destination: "China",
    destinationCoords: [121.47, 31.23],
    originPort: "Hay Point",
    originCoords: [149.30, -21.27],
    volumeTonnes: 42_000_000,
    valueAUD: 6_300_000_000,
    shareOfTotal: 18,
    year: 2025,
  },

  // --- Lithium ---
  {
    id: "flow-012",
    commodity: "lithium",
    destination: "China",
    destinationCoords: [121.47, 31.23],
    originPort: "Fremantle",
    originCoords: [115.75, -32.05],
    volumeTonnes: 2_200_000,
    valueAUD: 6_600_000_000,
    shareOfTotal: 78,
    year: 2025,
  },
  {
    id: "flow-013",
    commodity: "lithium",
    destination: "South Korea",
    destinationCoords: [126.98, 37.57],
    originPort: "Fremantle",
    originCoords: [115.75, -32.05],
    volumeTonnes: 350_000,
    valueAUD: 1_050_000_000,
    shareOfTotal: 12,
    year: 2025,
  },
  {
    id: "flow-014",
    commodity: "lithium",
    destination: "Japan",
    destinationCoords: [139.69, 35.69],
    originPort: "Fremantle",
    originCoords: [115.75, -32.05],
    volumeTonnes: 180_000,
    valueAUD: 540_000_000,
    shareOfTotal: 6,
    year: 2025,
  },

  // --- Gold ---
  {
    id: "flow-015",
    commodity: "gold",
    destination: "China",
    destinationCoords: [121.47, 31.23],
    originPort: "Perth Mint",
    originCoords: [115.86, -31.95],
    volumeTonnes: 120,
    valueAUD: 3_600_000_000,
    shareOfTotal: 35,
    year: 2025,
  },
  {
    id: "flow-016",
    commodity: "gold",
    destination: "India",
    destinationCoords: [72.88, 19.08],
    originPort: "Perth Mint",
    originCoords: [115.86, -31.95],
    volumeTonnes: 85,
    valueAUD: 2_550_000_000,
    shareOfTotal: 25,
    year: 2025,
  },

  // --- Copper ---
  {
    id: "flow-017",
    commodity: "copper",
    destination: "China",
    destinationCoords: [121.47, 31.23],
    originPort: "Adelaide",
    originCoords: [138.51, -34.93],
    volumeTonnes: 310_000,
    valueAUD: 2_945_000_000,
    shareOfTotal: 65,
    year: 2025,
  },
  {
    id: "flow-018",
    commodity: "copper",
    destination: "Japan",
    destinationCoords: [139.69, 35.69],
    originPort: "Townsville",
    originCoords: [146.78, -19.25],
    volumeTonnes: 82_000,
    valueAUD: 779_000_000,
    shareOfTotal: 17,
    year: 2025,
  },
];

/** Get flows grouped by commodity */
export function getFlowsByCommodity(): Record<string, ExportFlow[]> {
  const grouped: Record<string, ExportFlow[]> = {};
  for (const flow of EXPORT_FLOWS) {
    if (!grouped[flow.commodity]) grouped[flow.commodity] = [];
    grouped[flow.commodity]!.push(flow);
  }
  return grouped;
}

/** Get flows grouped by destination */
export function getFlowsByDestination(): Record<string, ExportFlow[]> {
  const grouped: Record<string, ExportFlow[]> = {};
  for (const flow of EXPORT_FLOWS) {
    if (!grouped[flow.destination]) grouped[flow.destination] = [];
    grouped[flow.destination]!.push(flow);
  }
  return grouped;
}

/** Arc GeoJSON for rendering trade flow lines on the map */
export function getTradeFlowArcsGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: EXPORT_FLOWS.map((flow) => ({
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [flow.originCoords, flow.destinationCoords],
      },
      properties: {
        id: flow.id,
        commodity: flow.commodity,
        destination: flow.destination,
        originPort: flow.originPort,
        volumeTonnes: flow.volumeTonnes,
        valueAUD: flow.valueAUD,
        shareOfTotal: flow.shareOfTotal,
      },
    })),
  };
}

/** Summary totals by destination country */
export function getDestinationSummary() {
  const summary: Record<string, { totalValueAUD: number; totalTonnes: number; commodities: string[] }> = {};
  for (const flow of EXPORT_FLOWS) {
    if (!summary[flow.destination]) {
      summary[flow.destination] = { totalValueAUD: 0, totalTonnes: 0, commodities: [] };
    }
    const dest = summary[flow.destination]!;
    dest.totalValueAUD += flow.valueAUD;
    dest.totalTonnes += flow.volumeTonnes;
    if (!dest.commodities.includes(flow.commodity)) {
      dest.commodities.push(flow.commodity);
    }
  }
  return summary;
}
