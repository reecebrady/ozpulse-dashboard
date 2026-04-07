/**
 * GeoJSON FeatureCollection of ~40 major Australian mine sites.
 * Each feature contains name, operator, commodity, production, export value, and coordinates.
 * Color coding is applied via the commodity field at the layer level.
 */

import type { MineSite } from "@ozpulse/shared-types";

export interface MineSiteFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MineSite & { commodityColor: string };
}

export interface MineSiteCollection {
  type: "FeatureCollection";
  features: MineSiteFeature[];
}

/** Commodity-to-color mapping for map rendering */
export const COMMODITY_COLORS: Record<string, string> = {
  "iron-ore": "#c0392b",
  coal: "#2c3e50",
  "thermal-coal": "#34495e",
  "coking-coal": "#1a252f",
  gold: "#f1c40f",
  copper: "#e67e22",
  lithium: "#2ecc71",
  uranium: "#9b59b6",
  zinc: "#95a5a6",
  nickel: "#16a085",
  alumina: "#ecf0f1",
  bauxite: "#d35400",
  lng: "#3498db",
  "rare-earths": "#e74c3c",
  silver: "#bdc3c7",
  manganese: "#8e44ad",
  titanium: "#1abc9c",
};

const sites: (MineSite & { commodityColor: string })[] = [
  // --- Iron Ore (Pilbara, WA) ---
  {
    id: "mine-001",
    name: "Tom Price Mine",
    commodity: "iron-ore",
    coordinates: [117.79, -23.35],
    productionTonnes: 65_000_000,
    exportValueAUD: 7_150_000_000,
    owner: "Rio Tinto",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },
  {
    id: "mine-002",
    name: "Newman (Mt Whaleback)",
    commodity: "iron-ore",
    coordinates: [119.73, -23.35],
    productionTonnes: 80_000_000,
    exportValueAUD: 8_800_000_000,
    owner: "BHP",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },
  {
    id: "mine-003",
    name: "Christmas Creek",
    commodity: "iron-ore",
    coordinates: [119.22, -22.35],
    productionTonnes: 50_000_000,
    exportValueAUD: 5_500_000_000,
    owner: "Fortescue",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },
  {
    id: "mine-004",
    name: "Cloudbreak",
    commodity: "iron-ore",
    coordinates: [119.37, -22.29],
    productionTonnes: 45_000_000,
    exportValueAUD: 4_950_000_000,
    owner: "Fortescue",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },
  {
    id: "mine-005",
    name: "Solomon Hub (Kings / Firetail)",
    commodity: "iron-ore",
    coordinates: [118.77, -22.60],
    productionTonnes: 42_000_000,
    exportValueAUD: 4_620_000_000,
    owner: "Fortescue",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },
  {
    id: "mine-006",
    name: "Marandoo Mine",
    commodity: "iron-ore",
    coordinates: [118.14, -22.68],
    productionTonnes: 35_000_000,
    exportValueAUD: 3_850_000_000,
    owner: "Rio Tinto",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },
  {
    id: "mine-007",
    name: "Yandicoogina",
    commodity: "iron-ore",
    coordinates: [119.18, -22.72],
    productionTonnes: 55_000_000,
    exportValueAUD: 6_050_000_000,
    owner: "Rio Tinto",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },
  {
    id: "mine-008",
    name: "Roy Hill",
    commodity: "iron-ore",
    coordinates: [120.06, -22.62],
    productionTonnes: 60_000_000,
    exportValueAUD: 6_600_000_000,
    owner: "Hancock Prospecting",
    state: "WA",
    commodityColor: COMMODITY_COLORS["iron-ore"]!,
  },

  // --- Coal ---
  {
    id: "mine-009",
    name: "Moranbah North",
    commodity: "coking-coal",
    coordinates: [148.05, -22.00],
    productionTonnes: 9_500_000,
    exportValueAUD: 3_800_000_000,
    owner: "Anglo American",
    state: "QLD",
    commodityColor: COMMODITY_COLORS["coking-coal"]!,
  },
  {
    id: "mine-010",
    name: "Caval Ridge",
    commodity: "coking-coal",
    coordinates: [148.08, -21.95],
    productionTonnes: 5_800_000,
    exportValueAUD: 2_320_000_000,
    owner: "BHP",
    state: "QLD",
    commodityColor: COMMODITY_COLORS["coking-coal"]!,
  },
  {
    id: "mine-011",
    name: "Peak Downs",
    commodity: "coking-coal",
    coordinates: [148.19, -22.26],
    productionTonnes: 8_200_000,
    exportValueAUD: 3_280_000_000,
    owner: "BHP",
    state: "QLD",
    commodityColor: COMMODITY_COLORS["coking-coal"]!,
  },
  {
    id: "mine-012",
    name: "Hunter Valley Operations",
    commodity: "thermal-coal",
    coordinates: [151.15, -32.38],
    productionTonnes: 14_000_000,
    exportValueAUD: 1_820_000_000,
    owner: "Glencore",
    state: "NSW",
    commodityColor: COMMODITY_COLORS["thermal-coal"]!,
  },
  {
    id: "mine-013",
    name: "Mount Arthur",
    commodity: "thermal-coal",
    coordinates: [150.90, -32.33],
    productionTonnes: 12_000_000,
    exportValueAUD: 1_560_000_000,
    owner: "BHP",
    state: "NSW",
    commodityColor: COMMODITY_COLORS["thermal-coal"]!,
  },
  {
    id: "mine-014",
    name: "Kestrel Mine",
    commodity: "coking-coal",
    coordinates: [148.48, -23.52],
    productionTonnes: 4_500_000,
    exportValueAUD: 1_800_000_000,
    owner: "Adaro / EMR Capital",
    state: "QLD",
    commodityColor: COMMODITY_COLORS["coking-coal"]!,
  },

  // --- Gold ---
  {
    id: "mine-015",
    name: "Super Pit (KCGM)",
    commodity: "gold",
    coordinates: [121.50, -30.78],
    productionTonnes: 24,
    exportValueAUD: 2_400_000_000,
    owner: "Northern Star",
    state: "WA",
    commodityColor: COMMODITY_COLORS["gold"]!,
  },
  {
    id: "mine-016",
    name: "Cadia Valley",
    commodity: "gold",
    coordinates: [148.99, -33.47],
    productionTonnes: 28,
    exportValueAUD: 2_800_000_000,
    owner: "Newmont",
    state: "NSW",
    commodityColor: COMMODITY_COLORS["gold"]!,
  },
  {
    id: "mine-017",
    name: "Boddington Gold Mine",
    commodity: "gold",
    coordinates: [116.38, -32.75],
    productionTonnes: 22,
    exportValueAUD: 2_200_000_000,
    owner: "Newmont",
    state: "WA",
    commodityColor: COMMODITY_COLORS["gold"]!,
  },
  {
    id: "mine-018",
    name: "Telfer Mine",
    commodity: "gold",
    coordinates: [122.23, -21.71],
    productionTonnes: 16,
    exportValueAUD: 1_600_000_000,
    owner: "Newmont",
    state: "WA",
    commodityColor: COMMODITY_COLORS["gold"]!,
  },
  {
    id: "mine-019",
    name: "St Ives Gold Mine",
    commodity: "gold",
    coordinates: [121.67, -31.25],
    productionTonnes: 12,
    exportValueAUD: 1_200_000_000,
    owner: "Gold Fields",
    state: "WA",
    commodityColor: COMMODITY_COLORS["gold"]!,
  },

  // --- Copper / Multi-metal ---
  {
    id: "mine-020",
    name: "Olympic Dam",
    commodity: "copper",
    coordinates: [136.88, -30.45],
    productionTonnes: 180_000,
    exportValueAUD: 1_710_000_000,
    owner: "BHP",
    state: "SA",
    commodityColor: COMMODITY_COLORS["copper"]!,
  },
  {
    id: "mine-021",
    name: "Mount Isa Mine",
    commodity: "copper",
    coordinates: [139.49, -20.73],
    productionTonnes: 145_000,
    exportValueAUD: 1_377_500_000,
    owner: "Glencore",
    state: "QLD",
    commodityColor: COMMODITY_COLORS["copper"]!,
  },
  {
    id: "mine-022",
    name: "Ernest Henry Mine",
    commodity: "copper",
    coordinates: [140.70, -20.47],
    productionTonnes: 65_000,
    exportValueAUD: 617_500_000,
    owner: "Evolution Mining",
    state: "QLD",
    commodityColor: COMMODITY_COLORS["copper"]!,
  },
  {
    id: "mine-023",
    name: "Prominent Hill",
    commodity: "copper",
    coordinates: [135.53, -29.72],
    productionTonnes: 55_000,
    exportValueAUD: 522_500_000,
    owner: "BHP",
    state: "SA",
    commodityColor: COMMODITY_COLORS["copper"]!,
  },

  // --- Lithium ---
  {
    id: "mine-024",
    name: "Greenbushes Lithium Mine",
    commodity: "lithium",
    coordinates: [116.06, -33.86],
    productionTonnes: 1_500_000,
    exportValueAUD: 4_500_000_000,
    owner: "Tianqi / IGO",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lithium"]!,
  },
  {
    id: "mine-025",
    name: "Pilgangoora",
    commodity: "lithium",
    coordinates: [119.07, -21.30],
    productionTonnes: 680_000,
    exportValueAUD: 2_040_000_000,
    owner: "Pilbara Minerals",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lithium"]!,
  },
  {
    id: "mine-026",
    name: "Mt Cattlin",
    commodity: "lithium",
    coordinates: [119.76, -33.53],
    productionTonnes: 240_000,
    exportValueAUD: 720_000_000,
    owner: "Allkem",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lithium"]!,
  },
  {
    id: "mine-027",
    name: "Wodgina Lithium Mine",
    commodity: "lithium",
    coordinates: [118.68, -21.19],
    productionTonnes: 450_000,
    exportValueAUD: 1_350_000_000,
    owner: "Mineral Resources / Albemarle",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lithium"]!,
  },

  // --- Uranium ---
  {
    id: "mine-028",
    name: "Ranger Uranium Mine",
    commodity: "uranium",
    coordinates: [132.92, -12.68],
    productionTonnes: 3_200,
    exportValueAUD: 480_000_000,
    owner: "ERA (Rio Tinto)",
    state: "NT",
    commodityColor: COMMODITY_COLORS["uranium"]!,
  },

  // --- LNG / Gas ---
  {
    id: "mine-029",
    name: "Gorgon LNG",
    commodity: "lng",
    coordinates: [115.07, -21.39],
    productionTonnes: 16_000_000,
    exportValueAUD: 12_800_000_000,
    owner: "Chevron",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lng"]!,
  },
  {
    id: "mine-030",
    name: "Ichthys LNG",
    commodity: "lng",
    coordinates: [130.87, -12.51],
    productionTonnes: 8_900_000,
    exportValueAUD: 7_120_000_000,
    owner: "INPEX",
    state: "NT",
    commodityColor: COMMODITY_COLORS["lng"]!,
  },
  {
    id: "mine-031",
    name: "North West Shelf LNG",
    commodity: "lng",
    coordinates: [116.77, -20.62],
    productionTonnes: 14_500_000,
    exportValueAUD: 11_600_000_000,
    owner: "Woodside",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lng"]!,
  },
  {
    id: "mine-032",
    name: "Scarborough LNG (Pluto T2)",
    commodity: "lng",
    coordinates: [113.58, -19.78],
    productionTonnes: 8_000_000,
    exportValueAUD: 6_400_000_000,
    owner: "Woodside",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lng"]!,
  },
  {
    id: "mine-033",
    name: "Wheatstone LNG",
    commodity: "lng",
    coordinates: [115.38, -21.81],
    productionTonnes: 8_900_000,
    exportValueAUD: 7_120_000_000,
    owner: "Chevron",
    state: "WA",
    commodityColor: COMMODITY_COLORS["lng"]!,
  },

  // --- Alumina / Bauxite ---
  {
    id: "mine-034",
    name: "Worsley Alumina Refinery",
    commodity: "alumina",
    coordinates: [116.07, -33.21],
    productionTonnes: 4_600_000,
    exportValueAUD: 2_300_000_000,
    owner: "South32",
    state: "WA",
    commodityColor: COMMODITY_COLORS["alumina"]!,
  },
  {
    id: "mine-035",
    name: "Weipa Bauxite Mine",
    commodity: "bauxite",
    coordinates: [141.87, -12.63],
    productionTonnes: 35_000_000,
    exportValueAUD: 1_750_000_000,
    owner: "Rio Tinto",
    state: "QLD",
    commodityColor: COMMODITY_COLORS["bauxite"]!,
  },

  // --- Nickel ---
  {
    id: "mine-036",
    name: "Murrin Murrin Nickel",
    commodity: "nickel",
    coordinates: [121.87, -28.73],
    productionTonnes: 35_000,
    exportValueAUD: 875_000_000,
    owner: "Glencore",
    state: "WA",
    commodityColor: COMMODITY_COLORS["nickel"]!,
  },
  {
    id: "mine-037",
    name: "Nova-Bollinger Nickel",
    commodity: "nickel",
    coordinates: [123.20, -31.82],
    productionTonnes: 22_000,
    exportValueAUD: 550_000_000,
    owner: "IGO",
    state: "WA",
    commodityColor: COMMODITY_COLORS["nickel"]!,
  },

  // --- Zinc ---
  {
    id: "mine-038",
    name: "McArthur River Zinc",
    commodity: "zinc",
    coordinates: [136.10, -16.44],
    productionTonnes: 230_000,
    exportValueAUD: 690_000_000,
    owner: "Glencore",
    state: "NT",
    commodityColor: COMMODITY_COLORS["zinc"]!,
  },

  // --- Rare Earths ---
  {
    id: "mine-039",
    name: "Mount Weld Rare Earths",
    commodity: "rare-earths",
    coordinates: [122.55, -28.86],
    productionTonnes: 12_000,
    exportValueAUD: 840_000_000,
    owner: "Lynas",
    state: "WA",
    commodityColor: COMMODITY_COLORS["rare-earths"]!,
  },

  // --- Manganese ---
  {
    id: "mine-040",
    name: "GEMCO Manganese (Groote Eylandt)",
    commodity: "manganese",
    coordinates: [136.47, -13.97],
    productionTonnes: 5_800_000,
    exportValueAUD: 1_740_000_000,
    owner: "South32",
    state: "NT",
    commodityColor: COMMODITY_COLORS["manganese"]!,
  },

  // --- Titanium minerals ---
  {
    id: "mine-041",
    name: "Murray Basin Mineral Sands",
    commodity: "titanium",
    coordinates: [141.82, -34.86],
    productionTonnes: 850_000,
    exportValueAUD: 425_000_000,
    owner: "Iluka Resources",
    state: "VIC",
    commodityColor: COMMODITY_COLORS["titanium"]!,
  },
];

export function getMineSiteGeoJSON(): MineSiteCollection {
  return {
    type: "FeatureCollection",
    features: sites.map((site) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: site.coordinates,
      },
      properties: site,
    })),
  };
}

/** Return raw array for non-map use (tables, charts) */
export function getMineSites() {
  return sites;
}

/** Get unique commodity types */
export function getCommodityTypes(): string[] {
  return [...new Set(sites.map((s) => s.commodity))];
}

/** Get sites filtered by commodity */
export function getMineSitesByCommodity(commodity: string) {
  return sites.filter((s) => s.commodity === commodity);
}

/** Get total export value by commodity */
export function getExportValueByCommodity(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const site of sites) {
    result[site.commodity] = (result[site.commodity] ?? 0) + site.exportValueAUD;
  }
  return result;
}
