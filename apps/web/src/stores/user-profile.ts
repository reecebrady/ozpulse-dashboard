import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfileData {
  postcode: string;
  mortgageValue: number;
  remainingTermYears: number;
  interestRate: number;
  loanRemaining: number;
  vehicleEfficiencyLPer100km: number;
  commuteDistanceKm: number;
  daysPerWeek: number;
  workPostcode: string;
  schoolPostcodes: string[];
  hourlyWage: number;
  alertThresholds: {
    crimeRisePercent: number;
    fuelRatioMax: number;
    coalGasFloorPercent: number;
    demographicShiftPercent: number;
  };
}

const DEFAULT_PROFILE: UserProfileData = {
  postcode: "",
  mortgageValue: 0,
  remainingTermYears: 25,
  interestRate: 6.5,
  loanRemaining: 0,
  vehicleEfficiencyLPer100km: 8.5,
  commuteDistanceKm: 25,
  daysPerWeek: 5,
  workPostcode: "",
  schoolPostcodes: [],
  hourlyWage: 45,
  alertThresholds: {
    crimeRisePercent: 10,
    fuelRatioMax: 0.2,
    coalGasFloorPercent: 50,
    demographicShiftPercent: 3,
  },
};

interface UserProfileStore {
  profile: UserProfileData;
  hasProfile: boolean;
  setProfile: (profile: UserProfileData) => void;
  updateProfile: (partial: Partial<UserProfileData>) => void;
  updateThresholds: (
    partial: Partial<UserProfileData["alertThresholds"]>
  ) => void;
  clearProfile: () => void;

  // Derived values
  getEquity: () => number;
  getLTV: () => number;
  getWeeklyFuelCost: (fuelPricePerLitre: number) => number;
  getFuelWorkRatio: (fuelPricePerLitre: number) => number;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      hasProfile: false,

      setProfile: (profile) => set({ profile, hasProfile: true }),

      updateProfile: (partial) =>
        set((s) => ({
          profile: { ...s.profile, ...partial },
          hasProfile: true,
        })),

      updateThresholds: (partial) =>
        set((s) => ({
          profile: {
            ...s.profile,
            alertThresholds: { ...s.profile.alertThresholds, ...partial },
          },
        })),

      clearProfile: () => set({ profile: DEFAULT_PROFILE, hasProfile: false }),

      getEquity: () => {
        const { mortgageValue, loanRemaining } = get().profile;
        return mortgageValue - loanRemaining;
      },

      getLTV: () => {
        const { mortgageValue, loanRemaining } = get().profile;
        if (mortgageValue <= 0) return 0;
        return (loanRemaining / mortgageValue) * 100;
      },

      getWeeklyFuelCost: (fuelPricePerLitre) => {
        const { vehicleEfficiencyLPer100km, commuteDistanceKm, daysPerWeek } =
          get().profile;
        const dailyLitres =
          (commuteDistanceKm * 2 * vehicleEfficiencyLPer100km) / 100;
        return dailyLitres * fuelPricePerLitre * daysPerWeek;
      },

      getFuelWorkRatio: (fuelPricePerLitre) => {
        const { hourlyWage } = get().profile;
        if (hourlyWage <= 0) return 0;
        const weeklyCost = get().getWeeklyFuelCost(fuelPricePerLitre);
        const weeklyWage = hourlyWage * 38; // standard AU work week
        return weeklyCost / weeklyWage;
      },
    }),
    { name: "ozpulse-user-profile" }
  )
);
