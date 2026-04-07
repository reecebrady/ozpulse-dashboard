/**
 * Suburb-level statistics for the Real Estate layer.
 * Provides interfaces and mock data structured like Domain API responses.
 * In production, this would be replaced by live Domain/CoreLogic feeds.
 */

export interface SuburbStatEntry {
  suburb: string;
  postcode: string;
  state: string;
  medianHousePrice: number;
  medianApartmentPrice: number;
  medianDaysOnMarket: number;
  rentalYieldPercent: number;
  auctionClearanceRate: number;
  yoyChangePercent: number;
  totalListings: number;
  totalSales12m: number;
  population: number;
  lat: number;
  lng: number;
}

/**
 * Mock suburb stats for ~50 suburbs across all capital cities.
 * Prices reflect realistic 2025-2026 Australian medians:
 *   Sydney ~$1.4M, Melbourne ~$1.0M, Brisbane ~$850k, Perth ~$750k,
 *   Adelaide ~$750k, Hobart ~$650k, Canberra ~$950k, Darwin ~$550k.
 * Apartments are 40-60% of house prices. Yields 2-5%, DOM 20-60.
 */
export const SUBURB_STATS: SuburbStatEntry[] = [
  // ── Sydney ──
  { suburb: "Sydney CBD", postcode: "2000", state: "NSW", medianHousePrice: 2_150_000, medianApartmentPrice: 1_050_000, medianDaysOnMarket: 24, rentalYieldPercent: 2.8, auctionClearanceRate: 72.3, yoyChangePercent: 5.2, totalListings: 340, totalSales12m: 820, population: 26_500, lat: -33.8688, lng: 151.2093 },
  { suburb: "Bondi", postcode: "2026", state: "NSW", medianHousePrice: 3_200_000, medianApartmentPrice: 1_250_000, medianDaysOnMarket: 22, rentalYieldPercent: 2.3, auctionClearanceRate: 78.1, yoyChangePercent: 6.8, totalListings: 185, totalSales12m: 430, population: 11_200, lat: -33.8914, lng: 151.2743 },
  { suburb: "Parramatta", postcode: "2150", state: "NSW", medianHousePrice: 1_280_000, medianApartmentPrice: 580_000, medianDaysOnMarket: 30, rentalYieldPercent: 3.5, auctionClearanceRate: 65.4, yoyChangePercent: 4.1, totalListings: 420, totalSales12m: 950, population: 32_800, lat: -33.8151, lng: 151.0011 },
  { suburb: "Chatswood", postcode: "2067", state: "NSW", medianHousePrice: 2_450_000, medianApartmentPrice: 920_000, medianDaysOnMarket: 25, rentalYieldPercent: 2.6, auctionClearanceRate: 74.8, yoyChangePercent: 5.9, totalListings: 210, totalSales12m: 510, population: 22_100, lat: -33.7969, lng: 151.1811 },
  { suburb: "Hornsby", postcode: "2077", state: "NSW", medianHousePrice: 1_650_000, medianApartmentPrice: 720_000, medianDaysOnMarket: 28, rentalYieldPercent: 2.9, auctionClearanceRate: 69.2, yoyChangePercent: 4.5, totalListings: 180, totalSales12m: 390, population: 21_500, lat: -33.7028, lng: 151.0986 },
  { suburb: "Manly", postcode: "2095", state: "NSW", medianHousePrice: 3_750_000, medianApartmentPrice: 1_350_000, medianDaysOnMarket: 21, rentalYieldPercent: 2.1, auctionClearanceRate: 80.5, yoyChangePercent: 7.2, totalListings: 125, totalSales12m: 290, population: 15_600, lat: -33.7969, lng: 151.2844 },
  { suburb: "Castle Hill", postcode: "2154", state: "NSW", medianHousePrice: 1_820_000, medianApartmentPrice: 750_000, medianDaysOnMarket: 27, rentalYieldPercent: 2.8, auctionClearanceRate: 71.6, yoyChangePercent: 5.0, totalListings: 230, totalSales12m: 520, population: 38_500, lat: -33.7310, lng: 151.0036 },
  { suburb: "Blacktown", postcode: "2148", state: "NSW", medianHousePrice: 950_000, medianApartmentPrice: 480_000, medianDaysOnMarket: 32, rentalYieldPercent: 3.8, auctionClearanceRate: 62.1, yoyChangePercent: 3.4, totalListings: 380, totalSales12m: 870, population: 47_200, lat: -33.7688, lng: 150.9065 },
  { suburb: "Liverpool", postcode: "2170", state: "NSW", medianHousePrice: 880_000, medianApartmentPrice: 450_000, medianDaysOnMarket: 34, rentalYieldPercent: 4.0, auctionClearanceRate: 58.9, yoyChangePercent: 2.8, totalListings: 350, totalSales12m: 790, population: 29_100, lat: -33.9209, lng: 150.9235 },
  { suburb: "Cronulla", postcode: "2230", state: "NSW", medianHousePrice: 2_650_000, medianApartmentPrice: 1_100_000, medianDaysOnMarket: 23, rentalYieldPercent: 2.4, auctionClearanceRate: 76.3, yoyChangePercent: 6.1, totalListings: 140, totalSales12m: 310, population: 17_800, lat: -34.0553, lng: 151.1518 },
  { suburb: "Penrith", postcode: "2750", state: "NSW", medianHousePrice: 820_000, medianApartmentPrice: 420_000, medianDaysOnMarket: 35, rentalYieldPercent: 4.2, auctionClearanceRate: 56.7, yoyChangePercent: 2.5, totalListings: 310, totalSales12m: 720, population: 13_200, lat: -33.7507, lng: 150.6944 },
  { suburb: "Campbelltown", postcode: "2560", state: "NSW", medianHousePrice: 780_000, medianApartmentPrice: 410_000, medianDaysOnMarket: 37, rentalYieldPercent: 4.3, auctionClearanceRate: 54.2, yoyChangePercent: 2.1, totalListings: 290, totalSales12m: 680, population: 31_400, lat: -34.0654, lng: 150.8141 },
  { suburb: "Bankstown", postcode: "2200", state: "NSW", medianHousePrice: 1_080_000, medianApartmentPrice: 520_000, medianDaysOnMarket: 31, rentalYieldPercent: 3.6, auctionClearanceRate: 63.8, yoyChangePercent: 3.6, totalListings: 360, totalSales12m: 810, population: 33_600, lat: -33.9175, lng: 151.0346 },

  // ── Melbourne ──
  { suburb: "Melbourne CBD", postcode: "3000", state: "VIC", medianHousePrice: 1_350_000, medianApartmentPrice: 540_000, medianDaysOnMarket: 29, rentalYieldPercent: 3.4, auctionClearanceRate: 67.5, yoyChangePercent: 2.8, totalListings: 520, totalSales12m: 1150, population: 47_300, lat: -37.8136, lng: 144.9631 },
  { suburb: "St Kilda", postcode: "3182", state: "VIC", medianHousePrice: 1_750_000, medianApartmentPrice: 620_000, medianDaysOnMarket: 26, rentalYieldPercent: 2.9, auctionClearanceRate: 70.2, yoyChangePercent: 3.5, totalListings: 280, totalSales12m: 640, population: 20_800, lat: -37.8676, lng: 144.9809 },
  { suburb: "Footscray", postcode: "3011", state: "VIC", medianHousePrice: 920_000, medianApartmentPrice: 450_000, medianDaysOnMarket: 32, rentalYieldPercent: 3.8, auctionClearanceRate: 63.1, yoyChangePercent: 2.4, totalListings: 310, totalSales12m: 700, population: 17_500, lat: -37.7994, lng: 144.8995 },
  { suburb: "Box Hill", postcode: "3128", state: "VIC", medianHousePrice: 1_480_000, medianApartmentPrice: 580_000, medianDaysOnMarket: 28, rentalYieldPercent: 3.1, auctionClearanceRate: 68.9, yoyChangePercent: 3.0, totalListings: 250, totalSales12m: 580, population: 13_100, lat: -37.8190, lng: 145.1218 },
  { suburb: "Ringwood", postcode: "3134", state: "VIC", medianHousePrice: 1_120_000, medianApartmentPrice: 520_000, medianDaysOnMarket: 30, rentalYieldPercent: 3.3, auctionClearanceRate: 66.4, yoyChangePercent: 2.6, totalListings: 220, totalSales12m: 490, population: 18_200, lat: -37.8131, lng: 145.2288 },
  { suburb: "Dandenong", postcode: "3175", state: "VIC", medianHousePrice: 680_000, medianApartmentPrice: 370_000, medianDaysOnMarket: 38, rentalYieldPercent: 4.5, auctionClearanceRate: 55.8, yoyChangePercent: 1.9, totalListings: 340, totalSales12m: 780, population: 30_200, lat: -37.9871, lng: 145.2150 },
  { suburb: "Frankston", postcode: "3199", state: "VIC", medianHousePrice: 740_000, medianApartmentPrice: 410_000, medianDaysOnMarket: 36, rentalYieldPercent: 4.2, auctionClearanceRate: 57.3, yoyChangePercent: 2.2, totalListings: 280, totalSales12m: 650, population: 36_500, lat: -38.1453, lng: 145.1267 },
  { suburb: "Werribee", postcode: "3030", state: "VIC", medianHousePrice: 590_000, medianApartmentPrice: 340_000, medianDaysOnMarket: 40, rentalYieldPercent: 4.6, auctionClearanceRate: 52.5, yoyChangePercent: 1.5, totalListings: 420, totalSales12m: 960, population: 41_800, lat: -37.9000, lng: 144.6613 },

  // ── Brisbane ──
  { suburb: "Brisbane CBD", postcode: "4000", state: "QLD", medianHousePrice: 1_100_000, medianApartmentPrice: 520_000, medianDaysOnMarket: 26, rentalYieldPercent: 3.9, auctionClearanceRate: 58.2, yoyChangePercent: 8.3, totalListings: 290, totalSales12m: 650, population: 12_400, lat: -27.4698, lng: 153.0251 },
  { suburb: "Ipswich", postcode: "4305", state: "QLD", medianHousePrice: 520_000, medianApartmentPrice: 310_000, medianDaysOnMarket: 42, rentalYieldPercent: 5.0, auctionClearanceRate: 48.6, yoyChangePercent: 6.2, totalListings: 380, totalSales12m: 850, population: 9_800, lat: -27.6170, lng: 152.7607 },
  { suburb: "Logan", postcode: "4114", state: "QLD", medianHousePrice: 580_000, medianApartmentPrice: 340_000, medianDaysOnMarket: 38, rentalYieldPercent: 4.8, auctionClearanceRate: 50.4, yoyChangePercent: 7.1, totalListings: 350, totalSales12m: 800, population: 25_300, lat: -27.6389, lng: 153.1094 },
  { suburb: "Gold Coast", postcode: "4217", state: "QLD", medianHousePrice: 1_250_000, medianApartmentPrice: 650_000, medianDaysOnMarket: 28, rentalYieldPercent: 3.6, auctionClearanceRate: 55.9, yoyChangePercent: 9.5, totalListings: 450, totalSales12m: 1020, population: 19_800, lat: -28.0167, lng: 153.4000 },
  { suburb: "Caboolture", postcode: "4510", state: "QLD", medianHousePrice: 560_000, medianApartmentPrice: 320_000, medianDaysOnMarket: 40, rentalYieldPercent: 4.9, auctionClearanceRate: 47.3, yoyChangePercent: 6.8, totalListings: 320, totalSales12m: 730, population: 28_400, lat: -27.0849, lng: 152.9517 },
  { suburb: "Toowoomba", postcode: "4350", state: "QLD", medianHousePrice: 480_000, medianApartmentPrice: 280_000, medianDaysOnMarket: 44, rentalYieldPercent: 5.1, auctionClearanceRate: 45.1, yoyChangePercent: 5.8, totalListings: 260, totalSales12m: 590, population: 16_500, lat: -27.5598, lng: 151.9507 },

  // ── Perth ──
  { suburb: "Perth CBD", postcode: "6000", state: "WA", medianHousePrice: 980_000, medianApartmentPrice: 480_000, medianDaysOnMarket: 25, rentalYieldPercent: 3.7, auctionClearanceRate: 42.5, yoyChangePercent: 12.1, totalListings: 220, totalSales12m: 490, population: 10_200, lat: -31.9505, lng: 115.8605 },
  { suburb: "Fremantle", postcode: "6160", state: "WA", medianHousePrice: 880_000, medianApartmentPrice: 450_000, medianDaysOnMarket: 28, rentalYieldPercent: 3.9, auctionClearanceRate: 40.1, yoyChangePercent: 11.5, totalListings: 190, totalSales12m: 420, population: 8_500, lat: -32.0569, lng: 115.7484 },
  { suburb: "Joondalup", postcode: "6027", state: "WA", medianHousePrice: 720_000, medianApartmentPrice: 380_000, medianDaysOnMarket: 30, rentalYieldPercent: 4.2, auctionClearanceRate: 38.6, yoyChangePercent: 10.8, totalListings: 250, totalSales12m: 560, population: 34_100, lat: -31.7445, lng: 115.7669 },
  { suburb: "Rockingham", postcode: "6168", state: "WA", medianHousePrice: 560_000, medianApartmentPrice: 320_000, medianDaysOnMarket: 33, rentalYieldPercent: 4.8, auctionClearanceRate: 36.2, yoyChangePercent: 9.4, totalListings: 280, totalSales12m: 630, population: 35_800, lat: -32.2768, lng: 115.7340 },

  // ── Adelaide ──
  { suburb: "Adelaide CBD", postcode: "5000", state: "SA", medianHousePrice: 920_000, medianApartmentPrice: 450_000, medianDaysOnMarket: 27, rentalYieldPercent: 3.8, auctionClearanceRate: 60.4, yoyChangePercent: 10.2, totalListings: 190, totalSales12m: 420, population: 14_300, lat: -34.9285, lng: 138.6007 },
  { suburb: "Glenelg", postcode: "5045", state: "SA", medianHousePrice: 1_050_000, medianApartmentPrice: 520_000, medianDaysOnMarket: 24, rentalYieldPercent: 3.4, auctionClearanceRate: 64.8, yoyChangePercent: 11.0, totalListings: 140, totalSales12m: 310, population: 8_200, lat: -34.9814, lng: 138.5147 },
  { suburb: "Elizabeth", postcode: "5112", state: "SA", medianHousePrice: 420_000, medianApartmentPrice: 250_000, medianDaysOnMarket: 42, rentalYieldPercent: 5.2, auctionClearanceRate: 48.1, yoyChangePercent: 8.5, totalListings: 310, totalSales12m: 700, population: 12_600, lat: -34.7257, lng: 138.6707 },

  // ── Hobart ──
  { suburb: "Hobart CBD", postcode: "7000", state: "TAS", medianHousePrice: 680_000, medianApartmentPrice: 380_000, medianDaysOnMarket: 32, rentalYieldPercent: 4.0, auctionClearanceRate: 52.6, yoyChangePercent: 3.1, totalListings: 160, totalSales12m: 350, population: 22_100, lat: -42.8821, lng: 147.3272 },
  { suburb: "Sandy Bay", postcode: "7005", state: "TAS", medianHousePrice: 1_050_000, medianApartmentPrice: 520_000, medianDaysOnMarket: 26, rentalYieldPercent: 3.2, auctionClearanceRate: 58.3, yoyChangePercent: 4.2, totalListings: 90, totalSales12m: 200, population: 6_800, lat: -42.8950, lng: 147.3200 },
  { suburb: "Glenorchy", postcode: "7010", state: "TAS", medianHousePrice: 490_000, medianApartmentPrice: 290_000, medianDaysOnMarket: 38, rentalYieldPercent: 4.8, auctionClearanceRate: 46.5, yoyChangePercent: 2.4, totalListings: 180, totalSales12m: 410, population: 19_500, lat: -42.8333, lng: 147.2833 },

  // ── Canberra ──
  { suburb: "Canberra City", postcode: "2601", state: "ACT", medianHousePrice: 1_150_000, medianApartmentPrice: 550_000, medianDaysOnMarket: 26, rentalYieldPercent: 3.6, auctionClearanceRate: 66.2, yoyChangePercent: 3.8, totalListings: 170, totalSales12m: 380, population: 8_900, lat: -35.2809, lng: 149.1300 },
  { suburb: "Belconnen", postcode: "2617", state: "ACT", medianHousePrice: 870_000, medianApartmentPrice: 440_000, medianDaysOnMarket: 30, rentalYieldPercent: 4.1, auctionClearanceRate: 62.5, yoyChangePercent: 3.2, totalListings: 210, totalSales12m: 470, population: 26_300, lat: -35.2386, lng: 149.0650 },
  { suburb: "Woden", postcode: "2606", state: "ACT", medianHousePrice: 1_020_000, medianApartmentPrice: 510_000, medianDaysOnMarket: 28, rentalYieldPercent: 3.7, auctionClearanceRate: 64.8, yoyChangePercent: 3.5, totalListings: 150, totalSales12m: 340, population: 14_200, lat: -35.3460, lng: 149.0870 },

  // ── Darwin ──
  { suburb: "Darwin CBD", postcode: "0800", state: "NT", medianHousePrice: 580_000, medianApartmentPrice: 320_000, medianDaysOnMarket: 45, rentalYieldPercent: 5.2, auctionClearanceRate: 35.4, yoyChangePercent: 1.8, totalListings: 180, totalSales12m: 400, population: 12_800, lat: -12.4634, lng: 130.8456 },
  { suburb: "Palmerston", postcode: "0830", state: "NT", medianHousePrice: 450_000, medianApartmentPrice: 280_000, medianDaysOnMarket: 50, rentalYieldPercent: 5.5, auctionClearanceRate: 32.1, yoyChangePercent: 1.2, totalListings: 210, totalSales12m: 470, population: 36_200, lat: -12.4870, lng: 130.9850 },
];

/** Lookup suburb stats by postcode */
export function getSuburbStatsByPostcode(postcode: string): SuburbStatEntry | undefined {
  return SUBURB_STATS.find((s) => s.postcode === postcode);
}

/** Get all suburbs for a given state */
export function getSuburbsByState(state: string): SuburbStatEntry[] {
  return SUBURB_STATS.filter((s) => s.state === state);
}

/** National median calculations */
export function getNationalMedians() {
  const houses = SUBURB_STATS.map((s) => s.medianHousePrice);
  const apartments = SUBURB_STATS.map((s) => s.medianApartmentPrice);
  const clearance = SUBURB_STATS.map((s) => s.auctionClearanceRate);

  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  return {
    medianHousePrice: median(houses),
    medianApartmentPrice: median(apartments),
    auctionClearanceRate: +(clearance.reduce((a, b) => a + b, 0) / clearance.length).toFixed(1),
    totalSuburbs: SUBURB_STATS.length,
  };
}

/** State-level median calculations */
export function getStateMedians() {
  const states = [...new Set(SUBURB_STATS.map((s) => s.state))];
  return states.map((state) => {
    const suburbs = getSuburbsByState(state);
    const housePrices = suburbs.map((s) => s.medianHousePrice);
    const avgHouse = Math.round(housePrices.reduce((a, b) => a + b, 0) / housePrices.length);
    const aptPrices = suburbs.map((s) => s.medianApartmentPrice);
    const avgApt = Math.round(aptPrices.reduce((a, b) => a + b, 0) / aptPrices.length);
    const avgClearance = +(suburbs.map((s) => s.auctionClearanceRate).reduce((a, b) => a + b, 0) / suburbs.length).toFixed(1);
    const avgYoy = +(suburbs.map((s) => s.yoyChangePercent).reduce((a, b) => a + b, 0) / suburbs.length).toFixed(1);

    return {
      state,
      medianHousePrice: avgHouse,
      medianApartmentPrice: avgApt,
      auctionClearanceRate: avgClearance,
      yoyChangePercent: avgYoy,
      suburbCount: suburbs.length,
    };
  });
}
