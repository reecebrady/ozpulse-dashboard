import { create } from "zustand";

export interface DetailPanelContent {
  id: string;
  title: string;
  layerId?: string;
  type: "widget" | "map-feature" | "layer-detail";
  data: Record<string, unknown>;
}

interface UIState {
  sidebarCollapsed: boolean;
  detailPanelOpen: boolean;
  detailPanelContent: DetailPanelContent | null;
  detailPanelWidth: number;
  profileSetupOpen: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openDetailPanel: (content: DetailPanelContent) => void;
  closeDetailPanel: () => void;
  setDetailPanelWidth: (width: number) => void;
  setProfileSetupOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  detailPanelOpen: false,
  detailPanelContent: null,
  detailPanelWidth: 400,
  profileSetupOpen: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openDetailPanel: (content) =>
    set({ detailPanelOpen: true, detailPanelContent: content }),
  closeDetailPanel: () =>
    set({ detailPanelOpen: false, detailPanelContent: null }),
  setDetailPanelWidth: (width) => set({ detailPanelWidth: width }),
  setProfileSetupOpen: (open) => set({ profileSetupOpen: open }),
}));
