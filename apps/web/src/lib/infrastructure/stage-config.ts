import type { ProjectStage, InfraSector } from "@ozpulse/shared";

export const STAGE_LABELS: Record<ProjectStage, string> = {
  early_planning: "Early Planning",
  business_case: "Business Case",
  planning_approval: "Planning Approval",
  procurement: "Procurement",
  construction: "Under Construction",
  completed: "Completed",
  operational: "Operational",
};

export const STAGE_COLORS: Record<ProjectStage, string> = {
  early_planning: "#94a3b8",
  business_case: "#a78bfa",
  planning_approval: "#60a5fa",
  procurement: "#fbbf24",
  construction: "#f97316",
  completed: "#22c55e",
  operational: "#10b981",
};

export const SECTOR_LABELS: Record<InfraSector, string> = {
  road: "Road",
  rail: "Rail",
  port: "Port",
  airport: "Airport",
  water: "Water & Sewerage",
  energy: "Energy",
  telecommunications: "Telecommunications",
  social: "Social (Schools, Hospitals)",
  mixed_use: "Mixed Use",
  other: "Other",
};

export const SECTOR_COLORS: Record<InfraSector, string> = {
  road: "#f59e0b",
  rail: "#3b82f6",
  port: "#06b6d4",
  airport: "#8b5cf6",
  water: "#0ea5e9",
  energy: "#ef4444",
  telecommunications: "#64748b",
  social: "#ec4899",
  mixed_use: "#a855f7",
  other: "#6b7280",
};
