// Immigration & Demographics Module — Agent 6
// Provides migration heatmaps, diaspora concentration, flow arrows, workforce shifts, alerts

export * from "./types";
export * from "./components";
export * from "./hooks";
export * from "./layer/immigration-layer-config";
export {
  migrationIntensityColor,
  diasporaConcentrationLevel,
  calculateHousingPressureIndex,
} from "./utils/demographic-calculations";
