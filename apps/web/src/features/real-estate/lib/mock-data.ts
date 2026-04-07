/**
 * Mock data generators for development without real API keys.
 * Each function produces realistic Australian property data
 * seeded deterministically from postcode/suburb for consistency.
 */
import type {
  PropertyListing,
  SuburbStats,
  PriceHeatmapPoint,
  ComparableSale,
  PriceIndexPoint,
  PriceIndexSeries,
  TestimonySummary,
  ValuationEstimate,
  PropertyType,
} from "@ozpulse/shared";
import { MAJOR_SUBURBS } from "./constants";

/** Simple deterministic hash from string */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Seeded pseudo-random from a seed value */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const PROPERTY_TYPES: PropertyType[] = ["house", "apartment", "townhouse", "unit", "villa"];
const STREET_NAMES = [
  "Smith St", "George St", "Railway Pde", "Victoria Ave", "Park Rd",
  "Church St", "King St", "Main St", "High St", "Station Rd",
  "Elizabeth St", "William St", "Queen St", "Albert Rd", "Bridge St",
  "Market St", "Hill St", "Lake Ave", "River Rd", "Creek St",
];

function getSuburbInfo(postcode: string) {
  return MAJOR_SUBURBS.find((s) => s.postcode === postcode) ?? {
    suburb: `Suburb ${postcode}`,
    postcode,
    state: "NSW" as const,
    lat: -33.8688 + (hashCode(postcode) % 100) * 0.01,
    lng: 151.2093 + (hashCode(postcode) % 100) * 0.01,
  };
}

/**
 * Generate a base median price for a postcode (higher for inner-city, lower for outer suburbs).
 */
function baseMedianForPostcode(postcode: string): number {
  const code = parseInt(postcode, 10);
  // Sydney inner
  if (code >= 2000 && code <= 2100) return 1_200_000 + (hashCode(postcode) % 400_000);
  // Sydney outer west
  if (code >= 2100 && code <= 2800) return 650_000 + (hashCode(postcode) % 350_000);
  // Melbourne inner
  if (code >= 3000 && code <= 3100) return 950_000 + (hashCode(postcode) % 350_000);
  // Melbourne outer
  if (code >= 3100 && code <= 3999) return 550_000 + (hashCode(postcode) % 300_000);
  // Brisbane
  if (code >= 4000 && code <= 4500) return 500_000 + (hashCode(postcode) % 250_000);
  // Adelaide
  if (code >= 5000 && code <= 5200) return 450_000 + (hashCode(postcode) % 200_000);
  // Perth
  if (code >= 6000 && code <= 6300) return 500_000 + (hashCode(postcode) % 250_000);
  // Hobart
  if (code >= 7000 && code <= 7300) return 450_000 + (hashCode(postcode) % 150_000);
  // Canberra
  if (code >= 2600 && code <= 2620) return 750_000 + (hashCode(postcode) % 250_000);
  // Default
  return 400_000 + (hashCode(postcode) % 200_000);
}

export function generateListings(postcode: string, count = 20): PropertyListing[] {
  const info = getSuburbInfo(postcode);
  const rand = seededRandom(hashCode(postcode + "listings"));
  const basePrice = baseMedianForPostcode(postcode);

  return Array.from({ length: count }, (_, i) => {
    const r = rand();
    const type = PROPERTY_TYPES[Math.floor(rand() * PROPERTY_TYPES.length)];
    const isApartment = type === "apartment" || type === "unit";
    const price = Math.round(basePrice * (0.6 + r * 0.8));
    const landArea = isApartment ? undefined : Math.round(300 + rand() * 500);
    const floorArea = isApartment ? Math.round(50 + rand() * 80) : Math.round(120 + rand() * 150);
    const pricePerSqm = floorArea ? Math.round(price / floorArea) : undefined;

    return {
      id: `listing-${postcode}-${i}`,
      address: `${Math.floor(rand() * 200) + 1} ${STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)]}`,
      suburb: info.suburb,
      postcode,
      state: info.state,
      lat: info.lat + (rand() - 0.5) * 0.02,
      lng: info.lng + (rand() - 0.5) * 0.02,
      priceAud: price,
      pricePerSqm,
      landAreaSqm: landArea,
      floorAreaSqm: floorArea,
      bedrooms: isApartment ? Math.floor(rand() * 3) + 1 : Math.floor(rand() * 3) + 2,
      bathrooms: Math.floor(rand() * 2) + 1,
      carSpaces: isApartment ? Math.floor(rand() * 2) : Math.floor(rand() * 2) + 1,
      propertyType: type,
      listingType: rand() > 0.7 ? "auction" : "sale",
      daysOnMarket: Math.floor(rand() * 90) + 1,
      rentalYieldPercent: +(3 + rand() * 3).toFixed(1),
      imageUrls: [],
      agentName: undefined,
      description: undefined,
    };
  });
}

export function generateSuburbStats(postcode: string): SuburbStats {
  const info = getSuburbInfo(postcode);
  const rand = seededRandom(hashCode(postcode + "stats"));
  const basePrice = baseMedianForPostcode(postcode);

  return {
    suburb: info.suburb,
    postcode,
    state: info.state,
    lat: info.lat,
    lng: info.lng,
    medianPriceHouse: Math.round(basePrice * (0.9 + rand() * 0.3)),
    medianPriceApartment: Math.round(basePrice * (0.5 + rand() * 0.2)),
    medianPricePerSqm: Math.round(basePrice / (120 + rand() * 60)),
    medianDaysOnMarket: Math.floor(25 + rand() * 40),
    auctionClearanceRate: +(55 + rand() * 30).toFixed(1),
    totalListings: Math.floor(50 + rand() * 200),
    totalSales12Months: Math.floor(100 + rand() * 400),
    rentalYieldMedian: +(3 + rand() * 2.5).toFixed(1),
    priceChangePercent12m: +(-5 + rand() * 15).toFixed(1),
    priceChangePercent5y: +(5 + rand() * 40).toFixed(1),
    population: Math.floor(8000 + rand() * 30000),
  };
}

export function generateHeatmapPoints(): PriceHeatmapPoint[] {
  return MAJOR_SUBURBS.map((s) => {
    const rand = seededRandom(hashCode(s.postcode + "heatmap"));
    const basePrice = baseMedianForPostcode(s.postcode);
    return {
      postcode: s.postcode,
      suburb: s.suburb,
      lat: s.lat,
      lng: s.lng,
      medianPricePerSqm: Math.round(basePrice / (120 + rand() * 60)),
      medianPrice: basePrice,
      sampleSize: Math.floor(20 + rand() * 200),
    };
  });
}

export function generateComparables(postcode: string, count = 10): ComparableSale[] {
  const info = getSuburbInfo(postcode);
  const rand = seededRandom(hashCode(postcode + "comps"));
  const basePrice = baseMedianForPostcode(postcode);

  return Array.from({ length: count }, (_, i) => {
    const r = rand();
    const type = PROPERTY_TYPES[Math.floor(rand() * PROPERTY_TYPES.length)];
    const price = Math.round(basePrice * (0.7 + r * 0.6));
    const monthsAgo = Math.floor(rand() * 12);
    const soldDate = new Date();
    soldDate.setMonth(soldDate.getMonth() - monthsAgo);

    return {
      id: `comp-${postcode}-${i}`,
      address: `${Math.floor(rand() * 200) + 1} ${STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)]}`,
      suburb: info.suburb,
      postcode,
      lat: info.lat + (rand() - 0.5) * 0.015,
      lng: info.lng + (rand() - 0.5) * 0.015,
      soldPriceAud: price,
      soldDate: soldDate.toISOString().split("T")[0],
      pricePerSqm: Math.round(price / (100 + rand() * 100)),
      bedrooms: Math.floor(rand() * 3) + 2,
      bathrooms: Math.floor(rand() * 2) + 1,
      propertyType: type,
      landAreaSqm: type === "apartment" ? undefined : Math.round(300 + rand() * 400),
      distanceKm: +(rand() * 3).toFixed(1),
    };
  });
}

export function generatePriceIndex(postcode: string): PriceIndexSeries {
  const rand = seededRandom(hashCode(postcode + "index"));
  const basePrice = baseMedianForPostcode(postcode);
  const dataPoints: PriceIndexPoint[] = [];
  let indexValue = 100;

  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    // Random walk with slight upward bias
    indexValue += (rand() - 0.45) * 3;
    indexValue = Math.max(80, Math.min(130, indexValue));

    dataPoints.push({
      period,
      medianPrice: Math.round(basePrice * (indexValue / 100)),
      pricePerSqm: Math.round((basePrice / 130) * (indexValue / 100)),
      indexValue: +indexValue.toFixed(1),
      volume: Math.floor(30 + rand() * 150),
    });
  }

  return {
    region: getSuburbInfo(postcode).suburb,
    propertyType: "all",
    dataPoints,
    baselinePeriod: dataPoints[0].period,
  };
}

export function generateNationalPriceIndex(): PriceIndexSeries {
  const rand = seededRandom(hashCode("national-index"));
  const dataPoints: PriceIndexPoint[] = [];
  let indexValue = 100;

  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    indexValue += (rand() - 0.45) * 2;
    indexValue = Math.max(90, Math.min(120, indexValue));

    dataPoints.push({
      period,
      medianPrice: Math.round(750_000 * (indexValue / 100)),
      indexValue: +indexValue.toFixed(1),
      volume: Math.floor(5000 + rand() * 10000),
    });
  }

  return {
    region: "National",
    propertyType: "all",
    dataPoints,
    baselinePeriod: dataPoints[0].period,
  };
}

export function generateTestimonies(postcode: string): TestimonySummary[] {
  const info = getSuburbInfo(postcode);
  const rand = seededRandom(hashCode(postcode + "testimony"));
  const sentiments: TestimonySummary["sentiment"][] = ["positive", "neutral", "negative"];

  const themes = [
    ["good schools", "quiet streets", "family friendly"],
    ["convenient transport", "growing area", "new developments"],
    ["parking issues", "traffic congestion", "construction noise"],
    ["great cafes", "community feel", "parks nearby"],
    ["rising prices", "competitive auctions", "investor activity"],
  ];

  const quotes = [
    "We love the neighbourhood, very family-oriented.",
    "Public transport options have improved significantly.",
    "Construction in the area is a concern for now.",
    "Great value compared to inner-city suburbs.",
    "The auction market here is very competitive.",
    "Quiet residential feel with easy access to shops.",
    "Schools in the catchment are well-regarded.",
    "Rental yields are reasonable for the price point.",
  ];

  return [
    {
      suburb: info.suburb,
      postcode,
      sentiment: sentiments[Math.floor(rand() * 3)],
      themes: themes[Math.floor(rand() * themes.length)],
      sampleQuotes: [
        quotes[Math.floor(rand() * quotes.length)],
        quotes[Math.floor(rand() * quotes.length)],
      ],
      sourcesCount: Math.floor(10 + rand() * 50),
      lastUpdated: new Date().toISOString(),
    },
  ];
}

export function generateValuation(postcode: string, address?: string): ValuationEstimate {
  const rand = seededRandom(hashCode(postcode + "valuation"));
  const basePrice = baseMedianForPostcode(postcode);
  const estimated = Math.round(basePrice * (0.85 + rand() * 0.3));
  const margin = Math.round(estimated * 0.08);

  return {
    address: address ?? `42 ${STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)]}`,
    postcode,
    estimatedValueAud: estimated,
    confidenceLow: estimated - margin,
    confidenceHigh: estimated + margin,
    lastSoldPrice: rand() > 0.3 ? Math.round(estimated * (0.7 + rand() * 0.2)) : null,
    lastSoldDate: rand() > 0.3 ? "2019-06-15" : null,
    comparablesUsed: Math.floor(5 + rand() * 15),
    methodology: "Automated valuation model using comparable sales, suburb trends, and property attributes.",
  };
}
