import { lazy } from "react";
import type { MapLayerConfig } from "@ozpulse/shared-types";

/**
 * Layer Registry
 * Each agent registers their layer here.
 * Components are lazy-loaded so the initial bundle stays small.
 */
export const LAYER_REGISTRY: MapLayerConfig[] = [
  {
    id: "power-energy",
    name: "Power & Energy",
    description: "Generator sites, grid output, fuel prices, transmission lines",
    defaultVisible: false,
    component: "@/components/layers/PowerEnergyLayer",
    dataSources: ["AEMO", "ACCC FuelWatch"],
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description: "Property prices, listings, auction rates, mortgage impact",
    defaultVisible: false,
    component: "@/components/layers/RealEstateLayer",
    dataSources: ["Domain API", "CoreLogic"],
  },
  {
    id: "crime-safety",
    name: "Crime & Safety",
    description: "Offence heatmaps, rolling trends, school safety scores",
    defaultVisible: false,
    component: "@/components/layers/CrimeSafetyLayer",
    dataSources: ["ABS", "State Police"],
  },
  {
    id: "immigration-demographics",
    name: "Immigration & Demographics",
    description: "Migration flows, diaspora maps, workforce composition",
    defaultVisible: false,
    component: "@/components/layers/ImmigrationLayer",
    dataSources: ["ABS Migration"],
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    description: "Major projects, stages, budgets, job creation",
    defaultVisible: false,
    component: "@/components/layers/InfrastructureLayer",
    dataSources: ["Infrastructure Australia", "State Planning"],
  },
  {
    id: "mining-resources",
    name: "Mining & Resources",
    description: "Mine sites, production, commodity prices, exports",
    defaultVisible: false,
    component: "@/components/layers/MiningLayer",
    dataSources: ["Geoscience Australia", "Dept Resources"],
  },
  {
    id: "leisure-lifestyle",
    name: "Leisure & Lifestyle",
    description: "Parks, beaches, events, low-cost activities, weekend planner",
    defaultVisible: false,
    component: "@/components/layers/LeisureLayer",
    dataSources: ["State Tourism", "Council Calendars"],
  },
];

export const LAYER_COMPONENTS = {
  "power-energy": lazy(() => import("@/components/layers/PowerEnergyLayer")),
  "real-estate": lazy(() => import("@/components/layers/RealEstateLayer")),
  "crime-safety": lazy(() => import("@/components/layers/CrimeSafetyLayer")),
  "immigration-demographics": lazy(() => import("@/components/layers/ImmigrationLayer")),
  "infrastructure": lazy(() => import("@/components/layers/InfrastructureLayer")),
  "mining-resources": lazy(() => import("@/components/layers/MiningLayer")),
  "leisure-lifestyle": lazy(() => import("@/components/layers/LeisureLayer")),
} as const;
