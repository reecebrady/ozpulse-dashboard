import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@ozpulse/shared";

interface UserProfileStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

export const useUserProfile = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...partial } : null,
        })),
      clearProfile: () => set({ profile: null }),
    }),
    { name: "ozpulse-user-profile" }
  )
);
