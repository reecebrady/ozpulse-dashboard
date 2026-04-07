import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/*  User Profile – synced to localStorage via Zustand persist          */
/* ------------------------------------------------------------------ */

export interface UserProfileData {
  postcode: string;
  mortgageValue: number;       // total mortgage amount AUD
  mortgageRemainingMonths: number; // months remaining
  propertyValue: number;       // current estimated property value AUD
  vehicleEfficiency: number;   // L/100km
  commuteDistance: number;      // one-way km
  schoolPostcode: string;
  workplacePostcode: string;
}

export interface UserStoreState {
  /* Profile */
  profile: UserProfileData;
  hasCompletedSetup: boolean;

  /* Actions */
  setProfile: (profile: Partial<UserProfileData>) => void;
  loadProfile: () => void;
  saveProfile: () => void;
  resetProfile: () => void;
  setHasCompletedSetup: (v: boolean) => void;

  /* Computed (stubs — will be fed by real data layers later) */
  weeklyFuelCost: () => number;
  equityPercent: () => number;
  riskScore: () => { value: number; label: string; color: string };
}

const DEFAULT_PROFILE: UserProfileData = {
  postcode: "",
  mortgageValue: 0,
  mortgageRemainingMonths: 360, // 30 years
  propertyValue: 0,
  vehicleEfficiency: 8.5, // average Australian car ~8.5 L/100km
  commuteDistance: 20,
  schoolPostcode: "",
  workplacePostcode: "",
};

/**
 * Average fuel price stub (AUD per litre).
 * This will be replaced by the real energy layer data.
 */
const STUB_FUEL_PRICE_PER_LITRE = 1.95;
const WORK_DAYS_PER_WEEK = 5;

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      profile: { ...DEFAULT_PROFILE },
      hasCompletedSetup: false,

      setProfile: (partial) =>
        set((state) => ({
          profile: { ...state.profile, ...partial },
        })),

      loadProfile: () => {
        // persist middleware handles this automatically on init
      },

      saveProfile: () => {
        // persist middleware handles this automatically on set
      },

      resetProfile: () =>
        set({ profile: { ...DEFAULT_PROFILE }, hasCompletedSetup: false }),

      setHasCompletedSetup: (v) => set({ hasCompletedSetup: v }),

      /**
       * Weekly fuel cost estimate.
       * Formula: (commuteKm * 2 * workDays * efficiency / 100) * pricePerLitre
       */
      weeklyFuelCost: () => {
        const { vehicleEfficiency, commuteDistance } = get().profile;
        if (!vehicleEfficiency || !commuteDistance) return 0;
        const weeklyKm = commuteDistance * 2 * WORK_DAYS_PER_WEEK;
        const litres = (weeklyKm * vehicleEfficiency) / 100;
        return Math.round(litres * STUB_FUEL_PRICE_PER_LITRE * 100) / 100;
      },

      /**
       * Home equity percentage.
       * Formula: ((propertyValue - mortgageValue) / propertyValue) * 100
       */
      equityPercent: () => {
        const { propertyValue, mortgageValue } = get().profile;
        if (!propertyValue || propertyValue <= 0) return 0;
        const equity = ((propertyValue - mortgageValue) / propertyValue) * 100;
        return Math.round(Math.max(0, Math.min(100, equity)) * 10) / 10;
      },

      /**
       * Neighbourhood risk score (stub).
       * Returns a score 0-100 with label and colour.
       * Will be replaced by real crime/safety layer aggregation.
       */
      riskScore: () => {
        const { postcode } = get().profile;
        if (!postcode) return { value: 0, label: "N/A", color: "var(--color-muted-foreground)" };

        // Stub: deterministic score based on postcode digits
        const digits = postcode.split("").map(Number);
        const score = (digits.reduce((a, b) => a + b, 0) * 7) % 100;

        if (score < 33)
          return { value: score, label: "Low", color: "var(--color-risk-low)" };
        if (score < 66)
          return { value: score, label: "Medium", color: "var(--color-risk-medium)" };
        return { value: score, label: "High", color: "var(--color-risk-high)" };
      },
    }),
    {
      name: "ozpulse-user",
    }
  )
);
