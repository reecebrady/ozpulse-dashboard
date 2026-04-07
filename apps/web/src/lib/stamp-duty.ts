/**
 * Australian Stamp Duty Calculator
 *
 * Calculates transfer (stamp) duty for each state and territory
 * based on property purchase price and buyer type.
 *
 * Rates are approximate and based on 2024-25 published schedules.
 * First Home Buyer (FHB) concessions applied where available.
 */

import type { AuState } from "@ozpulse/shared";

export type BuyerType = "owner-occupier" | "investor" | "first-home-buyer" | "foreign";

export interface StampDutyResult {
  state: AuState;
  purchasePrice: number;
  buyerType: BuyerType;
  dutyAmount: number;
  effectiveRate: number; // percentage of purchase price
  concessionApplied: string | null;
}

/** NSW transfer duty brackets (general) */
function calculateNSW(price: number, buyerType: BuyerType): StampDutyResult {
  // First Home Buyer: full exemption up to $800k, concessional to $1M
  if (buyerType === "first-home-buyer") {
    if (price <= 800_000) {
      return { state: "NSW", purchasePrice: price, buyerType, dutyAmount: 0, effectiveRate: 0, concessionApplied: "Full FHB exemption (up to $800k)" };
    }
    if (price <= 1_000_000) {
      const baseDuty = nswGeneralDuty(price);
      const concession = baseDuty * ((1_000_000 - price) / 200_000);
      const duty = Math.round(baseDuty - concession);
      return { state: "NSW", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: "Partial FHB concession ($800k-$1M)" };
    }
  }

  let duty = nswGeneralDuty(price);
  let concession: string | null = null;

  if (buyerType === "foreign") {
    duty += price * 0.08; // 8% surcharge for foreign buyers
    concession = "Foreign buyer surcharge 8%";
  }

  duty = Math.round(duty);
  return { state: "NSW", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: concession };
}

function nswGeneralDuty(price: number): number {
  if (price <= 16_000) return price * 0.0125;
  if (price <= 35_000) return 200 + (price - 16_000) * 0.015;
  if (price <= 93_000) return 485 + (price - 35_000) * 0.0175;
  if (price <= 351_000) return 1500 + (price - 93_000) * 0.035;
  if (price <= 1_168_000) return 10_530 + (price - 351_000) * 0.045;
  return 47_295 + (price - 1_168_000) * 0.055;
}

/** VIC transfer duty */
function calculateVIC(price: number, buyerType: BuyerType): StampDutyResult {
  if (buyerType === "first-home-buyer" && price <= 600_000) {
    return { state: "VIC", purchasePrice: price, buyerType, dutyAmount: 0, effectiveRate: 0, concessionApplied: "Full FHB exemption (up to $600k)" };
  }
  if (buyerType === "first-home-buyer" && price <= 750_000) {
    const baseDuty = vicGeneralDuty(price);
    const concession = baseDuty * ((750_000 - price) / 150_000);
    const duty = Math.round(baseDuty - concession);
    return { state: "VIC", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: "Partial FHB concession ($600k-$750k)" };
  }

  let duty = vicGeneralDuty(price);
  let concession: string | null = null;

  if (buyerType === "foreign") {
    duty += price * 0.08;
    concession = "Foreign buyer surcharge 8%";
  }

  duty = Math.round(duty);
  return { state: "VIC", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: concession };
}

function vicGeneralDuty(price: number): number {
  if (price <= 25_000) return price * 0.014;
  if (price <= 130_000) return 350 + (price - 25_000) * 0.024;
  if (price <= 960_000) return 2870 + (price - 130_000) * 0.06;
  if (price <= 2_000_000) return price * 0.055;
  return price * 0.065;
}

/** QLD transfer duty */
function calculateQLD(price: number, buyerType: BuyerType): StampDutyResult {
  if (buyerType === "first-home-buyer" && price <= 700_000) {
    const baseDuty = qldGeneralDuty(price);
    const concession = price <= 500_000 ? baseDuty : baseDuty * ((700_000 - price) / 200_000);
    const duty = Math.round(Math.max(0, baseDuty - concession));
    return { state: "QLD", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: duty === 0 ? "Full FHB concession" : "Partial FHB concession" };
  }

  let duty = qldGeneralDuty(price);
  let concession: string | null = null;

  if (buyerType === "foreign") {
    duty += price * 0.07;
    concession = "Foreign buyer surcharge 7%";
  }

  duty = Math.round(duty);
  return { state: "QLD", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: concession };
}

function qldGeneralDuty(price: number): number {
  if (price <= 5_000) return 0;
  if (price <= 75_000) return (price - 5_000) * 0.015;
  if (price <= 540_000) return 1050 + (price - 75_000) * 0.035;
  if (price <= 1_000_000) return 17_325 + (price - 540_000) * 0.045;
  return 38_025 + (price - 1_000_000) * 0.0575;
}

/** WA transfer duty */
function calculateWA(price: number, buyerType: BuyerType): StampDutyResult {
  if (buyerType === "first-home-buyer" && price <= 530_000) {
    return { state: "WA", purchasePrice: price, buyerType, dutyAmount: 0, effectiveRate: 0, concessionApplied: "Full FHB exemption (up to $530k)" };
  }

  let duty = waGeneralDuty(price);
  let concession: string | null = null;

  if (buyerType === "foreign") {
    duty += price * 0.07;
    concession = "Foreign buyer surcharge 7%";
  }

  duty = Math.round(duty);
  return { state: "WA", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: concession };
}

function waGeneralDuty(price: number): number {
  if (price <= 120_000) return price * 0.019;
  if (price <= 150_000) return 2280 + (price - 120_000) * 0.0285;
  if (price <= 360_000) return 3135 + (price - 150_000) * 0.038;
  if (price <= 725_000) return 11_115 + (price - 360_000) * 0.0475;
  return 28_453 + (price - 725_000) * 0.0515;
}

/** SA transfer duty */
function calculateSA(price: number, buyerType: BuyerType): StampDutyResult {
  if (buyerType === "first-home-buyer" && price <= 650_000) {
    return { state: "SA", purchasePrice: price, buyerType, dutyAmount: 0, effectiveRate: 0, concessionApplied: "Full FHB exemption (up to $650k)" };
  }

  let duty = saGeneralDuty(price);
  let concession: string | null = null;

  if (buyerType === "foreign") {
    duty += price * 0.07;
    concession = "Foreign buyer surcharge 7%";
  }

  duty = Math.round(duty);
  return { state: "SA", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: concession };
}

function saGeneralDuty(price: number): number {
  if (price <= 12_000) return price * 0.01;
  if (price <= 30_000) return 120 + (price - 12_000) * 0.02;
  if (price <= 50_000) return 480 + (price - 30_000) * 0.03;
  if (price <= 100_000) return 1080 + (price - 50_000) * 0.035;
  if (price <= 200_000) return 2830 + (price - 100_000) * 0.04;
  if (price <= 250_000) return 6830 + (price - 200_000) * 0.0425;
  if (price <= 300_000) return 8955 + (price - 250_000) * 0.0475;
  if (price <= 500_000) return 11_330 + (price - 300_000) * 0.05;
  return 21_330 + (price - 500_000) * 0.055;
}

/** TAS transfer duty */
function calculateTAS(price: number, buyerType: BuyerType): StampDutyResult {
  if (buyerType === "first-home-buyer" && price <= 600_000) {
    const baseDuty = tasGeneralDuty(price);
    const duty = Math.round(Math.max(0, baseDuty - 18_858));
    return { state: "TAS", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: "FHB duty concession (up to $18,858)" };
  }

  const duty = Math.round(tasGeneralDuty(price));
  return { state: "TAS", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: null };
}

function tasGeneralDuty(price: number): number {
  if (price <= 3_000) return price * 0.017;
  if (price <= 25_000) return 50 + (price - 3_000) * 0.0225;
  if (price <= 75_000) return 545 + (price - 25_000) * 0.03;
  if (price <= 200_000) return 2045 + (price - 75_000) * 0.035;
  if (price <= 375_000) return 6420 + (price - 200_000) * 0.04;
  if (price <= 725_000) return 13_420 + (price - 375_000) * 0.0425;
  return 28_295 + (price - 725_000) * 0.045;
}

/** ACT transfer duty */
function calculateACT(price: number, buyerType: BuyerType): StampDutyResult {
  if (buyerType === "first-home-buyer" && price <= 1_000_000) {
    return { state: "ACT", purchasePrice: price, buyerType, dutyAmount: 0, effectiveRate: 0, concessionApplied: "Full FHB exemption (up to $1M)" };
  }

  let duty = actGeneralDuty(price);
  const concession: string | null = null;

  duty = Math.round(duty);
  return { state: "ACT", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: concession };
}

function actGeneralDuty(price: number): number {
  if (price <= 260_000) return price * 0.012;
  if (price <= 300_000) return 3120 + (price - 260_000) * 0.0234;
  if (price <= 500_000) return 4056 + (price - 300_000) * 0.0408;
  if (price <= 750_000) return 12_216 + (price - 500_000) * 0.0502;
  if (price <= 1_000_000) return 24_766 + (price - 750_000) * 0.0572;
  if (price <= 1_455_000) return 39_066 + (price - 1_000_000) * 0.064;
  return 68_186 + (price - 1_455_000) * 0.0727;
}

/** NT transfer duty */
function calculateNT(price: number, buyerType: BuyerType): StampDutyResult {
  if (buyerType === "first-home-buyer" && price <= 650_000) {
    return { state: "NT", purchasePrice: price, buyerType, dutyAmount: 0, effectiveRate: 0, concessionApplied: "Full FHB exemption (up to $650k)" };
  }

  const rate = ntRate(price);
  let duty = price * rate;
  const concession: string | null = null;

  duty = Math.round(duty);
  return { state: "NT", purchasePrice: price, buyerType, dutyAmount: duty, effectiveRate: round2((duty / price) * 100), concessionApplied: concession };
}

function ntRate(price: number): number {
  // NT uses a sliding scale formula. Simplified brackets:
  if (price <= 525_000) return 0.0 + (price / 525_000) * 0.0495;
  if (price <= 3_000_000) return 0.0495;
  return 0.0595;
}

const STATE_CALCULATORS: Record<AuState, (price: number, buyerType: BuyerType) => StampDutyResult> = {
  NSW: calculateNSW,
  VIC: calculateVIC,
  QLD: calculateQLD,
  WA: calculateWA,
  SA: calculateSA,
  TAS: calculateTAS,
  ACT: calculateACT,
  NT: calculateNT,
};

/**
 * Calculate stamp duty for a given state, price, and buyer type.
 */
export function calculateStampDuty(
  state: AuState,
  purchasePrice: number,
  buyerType: BuyerType = "owner-occupier",
): StampDutyResult {
  if (purchasePrice <= 0) {
    return { state, purchasePrice, buyerType, dutyAmount: 0, effectiveRate: 0, concessionApplied: null };
  }
  return STATE_CALCULATORS[state](purchasePrice, buyerType);
}

/**
 * Get a summary of stamp duty across all states for comparison.
 */
export function compareStampDutyAllStates(
  purchasePrice: number,
  buyerType: BuyerType = "owner-occupier",
): StampDutyResult[] {
  return (["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as AuState[]).map(
    (state) => calculateStampDuty(state, purchasePrice, buyerType),
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
