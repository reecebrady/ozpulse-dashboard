import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  detailPanelOpen: boolean;
  detailPanelWidth: number;
  detailPanelTab: string;
  alertFeedExpanded: boolean;
  profileEditorOpen: boolean;
  theme: Theme;
  mobileSidebarOpen: boolean;
  selectedFeature: Record<string, unknown> | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDetailPanelOpen: (open: boolean) => void;
  setDetailPanelWidth: (width: number) => void;
  setDetailPanelTab: (tab: string) => void;
  setAlertFeedExpanded: (expanded: boolean) => void;
  setProfileEditorOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setSelectedFeature: (feature: Record<string, unknown> | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      detailPanelOpen: false,
      detailPanelWidth: 420,
      detailPanelTab: "overview",
      alertFeedExpanded: false,
      profileEditorOpen: false,
      theme: "dark" as Theme,
      mobileSidebarOpen: false,
      selectedFeature: null,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),
      setDetailPanelWidth: (width) =>
        set({ detailPanelWidth: Math.max(320, Math.min(640, width)) }),
      setDetailPanelTab: (tab) => set({ detailPanelTab: tab }),
      setAlertFeedExpanded: (expanded) => set({ alertFeedExpanded: expanded }),
      setProfileEditorOpen: (open) => set({ profileEditorOpen: open }),
      setTheme: (theme) => set({ theme }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setSelectedFeature: (feature) => set({ selectedFeature: feature }),
    }),
    {
      name: "ozpulse-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        detailPanelWidth: state.detailPanelWidth,
        theme: state.theme,
      }),
    }
  )
);
