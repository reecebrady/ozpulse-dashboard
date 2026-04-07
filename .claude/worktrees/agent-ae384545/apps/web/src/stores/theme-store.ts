import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: () => "light" | "dark";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark" as Theme,
      setTheme: (theme) => set({ theme }),
      resolvedTheme: () => {
        const t = get().theme;
        if (t === "system") {
          if (typeof window === "undefined") return "dark";
          return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        return t;
      },
    }),
    { name: "ozpulse-theme" }
  )
);
