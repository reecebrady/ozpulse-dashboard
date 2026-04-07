import type { NEMRegion, AUState } from "@ozpulse/shared";

export const NEM_REGION_LABELS: Record<NEMRegion, string> = {
  NSW1: "New South Wales",
  QLD1: "Queensland",
  VIC1: "Victoria",
  SA1: "South Australia",
  TAS1: "Tasmania",
};

export const NEM_REGION_STATES: Record<NEMRegion, AUState> = {
  NSW1: "NSW",
  QLD1: "QLD",
  VIC1: "VIC",
  SA1: "SA",
  TAS1: "TAS",
};

export const STATE_TO_NEM: Partial<Record<AUState, NEMRegion>> = {
  NSW: "NSW1",
  ACT: "NSW1",
  QLD: "QLD1",
  VIC: "VIC1",
  SA: "SA1",
  TAS: "TAS1",
};

// Approximate centroid for each NEM region (for map zoom)
export const NEM_REGION_CENTERS: Record<NEMRegion, [number, number]> = {
  NSW1: [149.13, -33.87],
  QLD1: [153.03, -27.47],
  VIC1: [144.96, -37.81],
  SA1: [138.60, -34.93],
  TAS1: [147.33, -42.88],
};
