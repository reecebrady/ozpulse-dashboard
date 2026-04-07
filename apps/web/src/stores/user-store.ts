import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, DashboardWidgets } from "@ozpulse/shared";

interface UserState {
  profile: UserProfile | null;
  widgets: DashboardWidgets | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setWidgets: (widgets: DashboardWidgets) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      widgets: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...partial } : null,
        })),
      setWidgets: (widgets) => set({ widgets }),
      clearProfile: () => set({ profile: null, widgets: null }),
    }),
    { name: "ozpulse-user" }
  )
);
