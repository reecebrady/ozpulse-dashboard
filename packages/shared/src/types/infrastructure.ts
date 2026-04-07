import type { AUState } from "./energy";

// ─── Project Classification ───

export type ProjectStage =
  | "early_planning"
  | "business_case"
  | "planning_approval"
  | "procurement"
  | "construction"
  | "completed"
  | "operational";

export type InfraSector =
  | "road" | "rail" | "port" | "airport"
  | "water" | "energy" | "telecommunications"
  | "social" | "mixed_use" | "other";

export type FundingSource = "federal" | "state" | "private" | "ppp" | "mixed";

// ─── Infrastructure Project ───

export interface InfraProjectFull {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  state: AUState;
  lga?: string;
  sector: InfraSector;
  stage: ProjectStage;
  fundingSource: FundingSource;
  estimatedCostAUD: number;
  federalContributionAUD?: number;
  stateContributionAUD?: number;
  privateContributionAUD?: number;
  estimatedJobsDirect: number;
  estimatedJobsIndirect?: number;
  constructionStartDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  sourceAuthority: string;
  priorityRating?: "high" | "priority_initiative" | "priority_project" | "nationally_significant";
  lastUpdated: string;
  tags: string[];
}

// ─── Economic Multiplier ───

export interface EconomicMultiplierInput {
  projectCostAUD: number;
  sector: InfraSector;
  state: AUState;
  constructionYears: number;
}

export interface EconomicMultiplierResult {
  directJobs: number;
  indirectJobs: number;
  inducedJobs: number;
  totalJobs: number;
  gdpContributionAUD: number;
  multiplier: number;
  methodology: string;
  confidence: "high" | "medium" | "low";
  source: string;
}

// ─── Pipeline Summary ───

export interface InfraPipelineSummary {
  totalProjects: number;
  totalValueAUD: number;
  totalEstimatedJobs: number;
  bySector: Partial<Record<InfraSector, { count: number; valueAUD: number }>>;
  byStage: Partial<Record<ProjectStage, { count: number; valueAUD: number }>>;
  byState: Partial<Record<AUState, { count: number; valueAUD: number }>>;
}

// ─── Project Timeline ───

export interface ProjectTimelineEvent {
  projectId: string;
  date: string;
  stage: ProjectStage;
  description: string;
}
