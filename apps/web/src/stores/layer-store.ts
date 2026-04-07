import { create } from "zustand";
import type { LayerId } from "@ozpulse/shared-types";

export interface SublayerConfig {
  id: string;
  name: string;
  enabled: boolean;
}

export interface LayerConfig {
  id: LayerId;
  name: string;
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
  category: "core" | "expanded";
  sublayers: SublayerConfig[];
}

const DEFAULT_LAYERS: LayerConfig[] = [
  {
    id: "power-energy",
    name: "Power & Energy",
    description: "Generator sites, grid output, fuel prices",
    icon: "Zap",
    color: "#eab308",
    enabled: false,
    category: "core",
    sublayers: [
      { id: "generators", name: "Generator Sites", enabled: true },
      { id: "fuel-prices", name: "Fuel Prices", enabled: true },
      { id: "grid-output", name: "Grid Output", enabled: false },
      { id: "transmission", name: "Transmission Lines", enabled: false },
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description: "Property prices, listings, mortgage impact",
    icon: "Home",
    color: "#22c55e",
    enabled: false,
    category: "core",
    sublayers: [
      { id: "listings", name: "Active Listings", enabled: true },
      { id: "median-prices", name: "Median Prices", enabled: true },
      { id: "auction-rates", name: "Auction Clearance", enabled: false },
      { id: "rental-yield", name: "Rental Yield", enabled: false },
    ],
  },
  {
    id: "crime-safety",
    name: "Crime & Safety",
    description: "Offence heatmaps, school safety, trends",
    icon: "Shield",
    color: "#ef4444",
    enabled: false,
    category: "core",
    sublayers: [
      { id: "violent", name: "Violent Crime", enabled: true },
      { id: "property", name: "Property Crime", enabled: true },
      { id: "drug", name: "Drug Offences", enabled: false },
      { id: "school-safety", name: "School Safety Zones", enabled: false },
    ],
  },
  {
    id: "immigration-demographics",
    name: "Immigration & Demographics",
    description: "Migration flows, diaspora maps, workforce shifts",
    icon: "Users",
    color: "#06b6d4",
    enabled: false,
    category: "core",
    sublayers: [
      { id: "net-migration", name: "Net Migration", enabled: true },
      { id: "visa-categories", name: "Visa Categories", enabled: false },
      { id: "workforce", name: "Workforce Composition", enabled: false },
    ],
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Major projects, pipeline, construction stages",
    icon: "Building2",
    color: "#f97316",
    enabled: false,
    category: "core",
    sublayers: [
      { id: "projects", name: "Active Projects", enabled: true },
      { id: "planned", name: "Planned", enabled: false },
      { id: "completed", name: "Completed", enabled: false },
    ],
  },
  {
    id: "mining-resources",
    name: "Mining & Resources",
    description: "Mine sites, production, commodity prices",
    icon: "Mountain",
    color: "#a855f7",
    enabled: false,
    category: "core",
    sublayers: [
      { id: "mine-sites", name: "Mine Sites", enabled: true },
      { id: "commodity-prices", name: "Commodity Prices", enabled: false },
      { id: "export-flows", name: "Export Flows", enabled: false },
    ],
  },
  {
    id: "leisure-lifestyle",
    name: "Leisure & Lifestyle",
    description: "Parks, events, weekend planner",
    icon: "TreePine",
    color: "#10b981",
    enabled: false,
    category: "core",
    sublayers: [
      { id: "parks", name: "Parks & Reserves", enabled: true },
      { id: "events", name: "Events", enabled: true },
      { id: "beaches", name: "Beaches", enabled: false },
    ],
  },
  {
    id: "education",
    name: "Education",
    description: "NAPLAN, MySchool ratings, catchments",
    icon: "GraduationCap",
    color: "#3b82f6",
    enabled: false,
    category: "expanded",
    sublayers: [
      { id: "schools", name: "Schools", enabled: true },
      { id: "naplan", name: "NAPLAN Results", enabled: false },
    ],
  },
  {
    id: "government",
    name: "Government",
    description: "MP voting records, attendance, policy impacts",
    icon: "Landmark",
    color: "#64748b",
    enabled: false,
    category: "expanded",
    sublayers: [
      { id: "electorates", name: "Electorates", enabled: true },
      { id: "voting", name: "Voting Records", enabled: false },
    ],
  },
  {
    id: "traffic-commute",
    name: "Traffic & Commute",
    description: "Live traffic, transport feeds",
    icon: "Car",
    color: "#8b5cf6",
    enabled: false,
    category: "expanded",
    sublayers: [
      { id: "live-traffic", name: "Live Traffic", enabled: true },
      { id: "public-transport", name: "Public Transport", enabled: false },
    ],
  },
  {
    id: "health",
    name: "Health",
    description: "Hospital wait times by region",
    icon: "Heart",
    color: "#ec4899",
    enabled: false,
    category: "expanded",
    sublayers: [
      { id: "hospitals", name: "Hospitals", enabled: true },
      { id: "wait-times", name: "Wait Times", enabled: false },
    ],
  },
  {
    id: "media-sentiment",
    name: "Media Sentiment",
    description: "Headline sentiment by topic",
    icon: "Newspaper",
    color: "#94a3b8",
    enabled: false,
    category: "expanded",
    sublayers: [],
  },
];

interface LayerState {
  layers: LayerConfig[];
  activeLayerIds: Set<LayerId>;
  expandedLayerIds: Set<LayerId>;
  searchQuery: string;

  toggleLayer: (id: LayerId) => void;
  enableLayer: (id: LayerId) => void;
  disableLayer: (id: LayerId) => void;
  disableAll: () => void;
  toggleSublayer: (layerId: LayerId, sublayerId: string) => void;
  toggleExpanded: (id: LayerId) => void;
  setSearchQuery: (query: string) => void;
  getActiveCount: () => number;
  getFilteredLayers: () => LayerConfig[];
}

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: DEFAULT_LAYERS,
  activeLayerIds: new Set<LayerId>(),
  expandedLayerIds: new Set<LayerId>(),
  searchQuery: "",

  toggleLayer: (id) =>
    set((state) => {
      const next = new Set(state.activeLayerIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return {
        activeLayerIds: next,
        layers: state.layers.map((l) =>
          l.id === id ? { ...l, enabled: next.has(id) } : l
        ),
      };
    }),

  enableLayer: (id) =>
    set((state) => {
      const next = new Set(state.activeLayerIds);
      next.add(id);
      return {
        activeLayerIds: next,
        layers: state.layers.map((l) =>
          l.id === id ? { ...l, enabled: true } : l
        ),
      };
    }),

  disableLayer: (id) =>
    set((state) => {
      const next = new Set(state.activeLayerIds);
      next.delete(id);
      return {
        activeLayerIds: next,
        layers: state.layers.map((l) =>
          l.id === id ? { ...l, enabled: false } : l
        ),
      };
    }),

  disableAll: () =>
    set((state) => ({
      activeLayerIds: new Set<LayerId>(),
      layers: state.layers.map((l) => ({ ...l, enabled: false })),
    })),

  toggleSublayer: (layerId, sublayerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              sublayers: l.sublayers.map((sl) =>
                sl.id === sublayerId ? { ...sl, enabled: !sl.enabled } : sl
              ),
            }
          : l
      ),
    })),

  toggleExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedLayerIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedLayerIds: next };
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getActiveCount: () => get().activeLayerIds.size,

  getFilteredLayers: () => {
    const { layers, searchQuery } = get();
    if (!searchQuery.trim()) return layers;
    const q = searchQuery.toLowerCase();
    return layers.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    );
  },
}));
