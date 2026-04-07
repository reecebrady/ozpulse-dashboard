"use client";

import { useSchoolSafety } from "../hooks";
import type { SchoolSafety } from "../types";

interface SchoolSafetyScoresProps {
  postcode: string;
  onSchoolClick?: (school: SchoolSafety) => void;
}

function safetyBadge(score: number) {
  if (score >= 75)
    return { label: "Safe", color: "bg-green-500/20 text-green-400" };
  if (score >= 50)
    return { label: "Moderate", color: "bg-yellow-500/20 text-yellow-400" };
  return { label: "Concern", color: "bg-red-500/20 text-red-400" };
}

function trendIndicator(trend: SchoolSafety["trend"]) {
  switch (trend) {
    case "improving":
      return { icon: "\u2191", color: "text-green-400", label: "Improving" };
    case "declining":
      return { icon: "\u2193", color: "text-red-400", label: "Declining" };
    default:
      return { icon: "\u2192", color: "text-gray-400", label: "Stable" };
  }
}

export function SchoolSafetyScores({
  postcode,
  onSchoolClick,
}: SchoolSafetyScoresProps) {
  const { data: schools, isLoading, error } = useSchoolSafety(postcode);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Loading school safety data...
      </div>
    );
  }

  if (error || !schools || schools.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No school data for {postcode}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">
        School Safety — {postcode} ({schools.length} schools)
      </h4>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {schools
          .sort((a, b) => b.safetyScore - a.safetyScore)
          .map((school) => {
            const badge = safetyBadge(school.safetyScore);
            const trend = trendIndicator(school.trend);

            return (
              <button
                key={school.schoolId}
                onClick={() => onSchoolClick?.(school)}
                className="flex w-full items-center gap-3 rounded border border-border bg-muted/50 p-2 text-left transition-colors hover:bg-muted"
              >
                <div className="flex-1">
                  <div className="text-xs font-medium">
                    {school.schoolName}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {school.schoolType.charAt(0).toUpperCase() +
                      school.schoolType.slice(1)}{" "}
                    — {school.suburb}, {school.state}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={trend.color} title={trend.label}>
                    {trend.icon}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {school.safetyScore}
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      <div className="text-[10px] text-muted-foreground">
        Scores derived from local crime index, nearby offences, incident
        reports, and attendance rates. Source: MySchool / ABS.
      </div>
    </div>
  );
}
