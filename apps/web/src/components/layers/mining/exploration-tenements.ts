/**
 * Simplified exploration license / tenement areas across Australia.
 * Each tenement is a simplified polygon (bounding box or simple shape).
 * In production, this would come from state mining registries.
 */

export interface ExplorationTenement {
  id: string;
  tenementNumber: string;
  holder: string;
  commodity: string;
  status: "active" | "pending" | "expired" | "renewal";
  areaKmSq: number;
  grantDate: string;
  expiryDate: string;
  state: string;
  polygon: [number, number][]; // simplified boundary coordinates [lng, lat][]
}

export const EXPLORATION_TENEMENTS: ExplorationTenement[] = [
  {
    id: "ten-001",
    tenementNumber: "E45/5890",
    holder: "Rio Tinto Exploration",
    commodity: "iron-ore",
    status: "active",
    areaKmSq: 420,
    grantDate: "2022-03-15",
    expiryDate: "2027-03-14",
    state: "WA",
    polygon: [
      [118.0, -22.0], [118.4, -22.0], [118.4, -22.3], [118.0, -22.3], [118.0, -22.0],
    ],
  },
  {
    id: "ten-002",
    tenementNumber: "E45/6102",
    holder: "Fortescue Exploration",
    commodity: "iron-ore",
    status: "active",
    areaKmSq: 380,
    grantDate: "2023-06-01",
    expiryDate: "2028-05-31",
    state: "WA",
    polygon: [
      [119.0, -22.4], [119.5, -22.4], [119.5, -22.8], [119.0, -22.8], [119.0, -22.4],
    ],
  },
  {
    id: "ten-003",
    tenementNumber: "E70/5541",
    holder: "Pilbara Minerals",
    commodity: "lithium",
    status: "active",
    areaKmSq: 210,
    grantDate: "2021-09-10",
    expiryDate: "2026-09-09",
    state: "WA",
    polygon: [
      [119.0, -21.2], [119.3, -21.2], [119.3, -21.5], [119.0, -21.5], [119.0, -21.2],
    ],
  },
  {
    id: "ten-004",
    tenementNumber: "E63/2045",
    holder: "Lynas Rare Earths",
    commodity: "rare-earths",
    status: "active",
    areaKmSq: 180,
    grantDate: "2020-04-20",
    expiryDate: "2025-04-19",
    state: "WA",
    polygon: [
      [122.3, -28.7], [122.8, -28.7], [122.8, -29.0], [122.3, -29.0], [122.3, -28.7],
    ],
  },
  {
    id: "ten-005",
    tenementNumber: "EPM/28120",
    holder: "BHP Exploration",
    commodity: "copper",
    status: "active",
    areaKmSq: 650,
    grantDate: "2023-01-12",
    expiryDate: "2028-01-11",
    state: "QLD",
    polygon: [
      [139.0, -20.5], [139.8, -20.5], [139.8, -21.0], [139.0, -21.0], [139.0, -20.5],
    ],
  },
  {
    id: "ten-006",
    tenementNumber: "EL/9180",
    holder: "BHP Olympic Dam Expansion",
    commodity: "copper",
    status: "active",
    areaKmSq: 890,
    grantDate: "2022-07-01",
    expiryDate: "2027-06-30",
    state: "SA",
    polygon: [
      [136.5, -30.2], [137.2, -30.2], [137.2, -30.7], [136.5, -30.7], [136.5, -30.2],
    ],
  },
  {
    id: "ten-007",
    tenementNumber: "E80/5780",
    holder: "Gold Fields Exploration",
    commodity: "gold",
    status: "active",
    areaKmSq: 320,
    grantDate: "2024-02-15",
    expiryDate: "2029-02-14",
    state: "WA",
    polygon: [
      [121.3, -31.0], [121.8, -31.0], [121.8, -31.4], [121.3, -31.4], [121.3, -31.0],
    ],
  },
  {
    id: "ten-008",
    tenementNumber: "E45/6350",
    holder: "Hancock Prospecting",
    commodity: "iron-ore",
    status: "pending",
    areaKmSq: 520,
    grantDate: "2025-01-01",
    expiryDate: "2030-12-31",
    state: "WA",
    polygon: [
      [120.0, -22.5], [120.5, -22.5], [120.5, -22.9], [120.0, -22.9], [120.0, -22.5],
    ],
  },
  {
    id: "ten-009",
    tenementNumber: "EPM/27805",
    holder: "Anglo American Exploration",
    commodity: "coking-coal",
    status: "active",
    areaKmSq: 430,
    grantDate: "2022-11-01",
    expiryDate: "2027-10-31",
    state: "QLD",
    polygon: [
      [147.8, -21.8], [148.3, -21.8], [148.3, -22.2], [147.8, -22.2], [147.8, -21.8],
    ],
  },
  {
    id: "ten-010",
    tenementNumber: "E70/6012",
    holder: "Mineral Resources",
    commodity: "lithium",
    status: "active",
    areaKmSq: 280,
    grantDate: "2023-08-20",
    expiryDate: "2028-08-19",
    state: "WA",
    polygon: [
      [118.5, -21.0], [118.9, -21.0], [118.9, -21.3], [118.5, -21.3], [118.5, -21.0],
    ],
  },
  {
    id: "ten-011",
    tenementNumber: "E28/3095",
    holder: "Glencore Exploration",
    commodity: "nickel",
    status: "active",
    areaKmSq: 350,
    grantDate: "2021-05-15",
    expiryDate: "2026-05-14",
    state: "WA",
    polygon: [
      [121.6, -28.5], [122.1, -28.5], [122.1, -28.9], [121.6, -28.9], [121.6, -28.5],
    ],
  },
  {
    id: "ten-012",
    tenementNumber: "E25/6080",
    holder: "Northern Star Resources",
    commodity: "gold",
    status: "pending",
    areaKmSq: 260,
    grantDate: "2025-03-01",
    expiryDate: "2030-02-28",
    state: "WA",
    polygon: [
      [121.2, -30.6], [121.7, -30.6], [121.7, -31.0], [121.2, -31.0], [121.2, -30.6],
    ],
  },
  {
    id: "ten-013",
    tenementNumber: "EL/6745",
    holder: "Newmont Exploration",
    commodity: "gold",
    status: "active",
    areaKmSq: 410,
    grantDate: "2022-09-01",
    expiryDate: "2027-08-31",
    state: "NSW",
    polygon: [
      [148.7, -33.3], [149.2, -33.3], [149.2, -33.7], [148.7, -33.7], [148.7, -33.3],
    ],
  },
  {
    id: "ten-014",
    tenementNumber: "E69/3840",
    holder: "IGO Limited",
    commodity: "nickel",
    status: "active",
    areaKmSq: 540,
    grantDate: "2023-04-10",
    expiryDate: "2028-04-09",
    state: "WA",
    polygon: [
      [123.0, -31.6], [123.5, -31.6], [123.5, -32.0], [123.0, -32.0], [123.0, -31.6],
    ],
  },
  {
    id: "ten-015",
    tenementNumber: "ML/30245",
    holder: "South32 Exploration",
    commodity: "manganese",
    status: "active",
    areaKmSq: 190,
    grantDate: "2021-12-01",
    expiryDate: "2041-11-30",
    state: "NT",
    polygon: [
      [136.2, -13.8], [136.7, -13.8], [136.7, -14.1], [136.2, -14.1], [136.2, -13.8],
    ],
  },
];

/** GeoJSON FeatureCollection of tenement polygons */
export function getTenementGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: EXPLORATION_TENEMENTS.map((ten) => ({
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [ten.polygon],
      },
      properties: {
        id: ten.id,
        tenementNumber: ten.tenementNumber,
        holder: ten.holder,
        commodity: ten.commodity,
        status: ten.status,
        areaKmSq: ten.areaKmSq,
        grantDate: ten.grantDate,
        expiryDate: ten.expiryDate,
        state: ten.state,
      },
    })),
  };
}

/** Get tenements filtered by status */
export function getTenementsByStatus(status: ExplorationTenement["status"]) {
  return EXPLORATION_TENEMENTS.filter((t) => t.status === status);
}

/** Get tenements filtered by commodity */
export function getTenementsByCommodity(commodity: string) {
  return EXPLORATION_TENEMENTS.filter((t) => t.commodity === commodity);
}
