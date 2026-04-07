import { z } from "zod";

// === Project Sectors ===
export const INFRA_SECTORS = [
  "transport",
  "energy",
  "water",
  "social",
  "telecommunications",
  "defence",
  "health",
  "education",
  "mixed-use",
] as const;

export type InfraSector = (typeof INFRA_SECTORS)[number];

export const INFRA_SECTOR_LABELS: Record<InfraSector, string> = {
  transport: "Transport",
  energy: "Energy",
  water: "Water & Sewerage",
  social: "Social Infrastructure",
  telecommunications: "Telecommunications",
  defence: "Defence",
  health: "Health",
  education: "Education",
  "mixed-use": "Mixed Use Development",
};

export const INFRA_SECTOR_COLORS: Record<InfraSector, string> = {
  transport: "#3b82f6",
  energy: "#eab308",
  water: "#06b6d4",
  social: "#ec4899",
  telecommunications: "#8b5cf6",
  defence: "#64748b",
  health: "#ef4444",
  education: "#22c55e",
  "mixed-use": "#f97316",
};

// === Project Stages ===
export const PROJECT_STAGES = [
  "planning",
  "approved",
  "construction",
  "completed",
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const STAGE_COLORS: Record<ProjectStage, string> = {
  planning: "#94a3b8",
  approved: "#3b82f6",
  construction: "#f97316",
  completed: "#22c55e",
};

export const STAGE_LABELS: Record<ProjectStage, string> = {
  planning: "Planning",
  approved: "Approved",
  construction: "Under Construction",
  completed: "Completed",
};

// === Infrastructure Project Schema ===
export const InfraProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  sector: z.enum(INFRA_SECTORS),
  stage: z.enum(PROJECT_STAGES),
  lng: z.number(),
  lat: z.number(),
  state: z.string(),
  lga: z.string().optional(), // local government area
  budgetAUD: z.number().min(0),
  spentAUD: z.number().min(0).optional(),
  expectedJobs: z.number().int().min(0),
  constructionJobs: z.number().int().min(0).optional(),
  ongoingJobs: z.number().int().min(0).optional(),
  description: z.string(),
  startDate: z.string().nullable(),
  completionDate: z.string().nullable(),
  fundingSource: z.enum(["federal", "state", "private", "ppp"]).optional(),
  contractor: z.string().optional(),
  commuteImpact: z.object({
    affectedRoutes: z.array(z.string()).optional(),
    delayMinutes: z.number().optional(),
    detourKm: z.number().optional(),
  }).optional(),
});

export type InfraProject = z.infer<typeof InfraProjectSchema>;

// === Project Summary (for list views) ===
export const ProjectSummarySchema = z.object({
  totalProjects: z.number().int(),
  totalBudgetAUD: z.number(),
  totalJobs: z.number().int(),
  byStage: z.record(z.enum(PROJECT_STAGES), z.number().int()),
  bySector: z.record(z.enum(INFRA_SECTORS), z.number().int()),
  byState: z.record(z.string(), z.number().int()),
});

export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

// === Filter Types ===
export interface InfraFilters {
  sectors: InfraSector[];
  stages: ProjectStage[];
  minBudget: number | null;
  maxBudget: number | null;
  state: string | null;
  searchQuery: string;
}

// === Commute Impact Overlay ===
export interface CommuteRouteImpact {
  routeId: string;
  routeName: string;
  affectedProjects: {
    projectId: string;
    projectName: string;
    stage: ProjectStage;
    delayMinutes: number;
    detourKm: number;
  }[];
  totalDelayMinutes: number;
  totalDetourKm: number;
}
