import { create } from "zustand";
import type { LayerId, LayerConfig } from "@ozpulse/shared";

const DEFAULT_LAYERS: LayerConfig[] = [
  {
    id: "power-energy",
    name: "Power & Energy",
    description: "Generator sites, grid output, fuel prices, commute costs",
    icon: "Zap",
    color: "#eab308",
    enabled: false,
  },
  {
    id: "real-estate",
    name: "Real Estate & Housing",
    description: "Property values, auction rates, mortgage impact",
    icon: "Home",
    color: "#22c55e",
    enabled: false,
  },
  {
    id: "crime-safety",
    name: "Crime & Safety",
    description: "Offence heatmaps, school safety, corridor tool",
    icon: "Shield",
    color: "#ef4444",
    enabled: false,
  },
  {
    id: "immigration-demographics",
    name: "Immigration & Demographics",
    description: "Migration flows, diaspora maps, workforce shifts",
    icon: "Users",
    color: "#06b6d4",
    enabled: false,
  },
  {
    id: "infrastructure-industry",
    name: "Infrastructure & Industry",
    description: "Major projects, construction stages, job estimates",
    icon: "Building",
    color: "#f97316",
    enabled: false,
  },
  {
    id: "minerals-mining",
    name: "Minerals & Mining",
    description: "Mine sites, production volumes, commodity prices",
    icon: "Mountain",
    color: "#a855f7",
    enabled: false,
  },
  {
    id: "leisure-lifestyle",
    name: "Leisure & Lifestyle",
    description: "Parks, events, weekend planner, cost ratings",
    icon: "TreePine",
    color: "#10b981",
    enabled: false,
  },
  {
    id: "education",
    name: "Education",
    description: "NAPLAN, MySchool ratings, school catchments",
    icon: "GraduationCap",
    color: "#3b82f6",
    enabled: false,
  },
  {
    id: "government-performance",
    name: "Government Performance",
    description: "MP voting records, attendance, policy impacts",
    icon: "Landmark",
    color: "#64748b",
    enabled: false,
  },
  {
    id: "economic-pressure",
    name: "Economic Pressure",
    description: "Wage growth vs inflation, sector overlays",
    icon: "TrendingDown",
    color: "#f59e0b",
    enabled: false,
  },
  {
    id: "traffic-commute",
    name: "Traffic & Commute",
    description: "Live transport feeds, commute times",
    icon: "Car",
    color: "#8b5cf6",
    enabled: false,
  },
  {
    id: "health-hospitals",
    name: "Health & Hospitals",
    description: "Wait times by region, facility locations",
    icon: "Heart",
    color: "#ec4899",
    enabled: false,
  },
  {
    id: "media-sentiment",
    name: "Media Sentiment",
    description: "Headline sentiment by topic from major outlets",
    icon: "Newspaper",
    color: "#94a3b8",
    enabled: false,
  },
];

interface LayerState {
  layers: LayerConfig[];
  activeLayerIds: Set<LayerId>;
  toggleLayer: (id: LayerId) => void;
  enableLayer: (id: LayerId) => void;
  disableLayer: (id: LayerId) => void;
  disableAll: () => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: DEFAULT_LAYERS,
  activeLayerIds: new Set<LayerId>(),
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
}));
