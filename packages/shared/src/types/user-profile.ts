import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string().uuid().optional(),
  postcode: z.string().regex(/^\d{4}$/, "Australian postcode must be 4 digits"),
  mortgageDetails: z.object({
    propertyValue: z.number().positive(),
    loanRemaining: z.number().nonnegative(),
    remainingTermYears: z.number().min(0).max(30),
    interestRate: z.number().min(0).max(20),
    netWorth: z.number().default(550000),
  }).optional(),
  vehicle: z.object({
    fuelEfficiency: z.number().positive().describe("L/100km"),
    fuelType: z.enum(["petrol", "diesel", "lpg", "electric", "hybrid"]),
    weeklyCommutekm: z.number().positive(),
  }).optional(),
  commuteRoute: z.object({
    startPostcode: z.string().regex(/^\d{4}$/),
    endPostcode: z.string().regex(/^\d{4}$/),
    waypoints: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
  }).optional(),
  pinnedLocations: z.object({
    home: z.object({ lat: z.number(), lng: z.number(), postcode: z.string() }).optional(),
    workplace: z.object({ lat: z.number(), lng: z.number(), postcode: z.string() }).optional(),
    school: z.object({ lat: z.number(), lng: z.number(), name: z.string() }).optional(),
  }).optional(),
  alertThresholds: z.object({
    fuelValueOfWorkRatio: z.number().min(0).max(1).default(0.2),
    crimeIndexThreshold: z.number().default(100),
    demographicShiftPercent: z.number().default(3),
    coalGasShareMinPercent: z.number().default(50),
  }).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
