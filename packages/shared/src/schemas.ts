import { z } from "zod";

export const userProfileSchema = z.object({
  id: z.string(),
  postcode: z.string().regex(/^\d{4}$/, "Must be a 4-digit Australian postcode"),
  mortgageValue: z.number().min(0),
  mortgageRemaining: z.number().min(0),
  netWorth: z.number(),
  vehicleEfficiencyLPer100km: z.number().min(0).max(50),
  commuteRouteKm: z.number().min(0),
  schoolPostcode: z.string().regex(/^\d{4}$/).optional(),
  workplacePostcode: z.string().regex(/^\d{4}$/).optional(),
  alertThresholds: z.object({
    fuelValueOfWorkRatio: z.number(),
    crimeIndexRise: z.number(),
    demographicShiftPercent: z.number().default(3),
    coalGasShareFloor: z.number(),
  }),
});

export const postcodeSchema = z.string().regex(/^\d{4}$/, "Must be a 4-digit Australian postcode");
