import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@ozpulse/shared-types";

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: "local",
  postcode: "",
  mortgageDetails: null,
  vehicleEfficiency: null,
  commuteRoute: null,
  pinnedLocations: [],
  alertThresholds: {
    fuelPriceMax: null,
    crimeIndexMax: null,
    demographicShiftPct: 3,
    coalGasShareMin: null,
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (profile) => set({ profile }),
      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...partial } : { ...DEFAULT_PROFILE, ...partial },
        })),
    }),
    { name: "ozpulse-user-profile" }
  )
);
