"use client";

import { useState } from "react";
import { useCrimeByPostcode } from "../hooks";
import { OffenceTrends } from "./offence-trends";
import { SchoolSafetyScores } from "./school-safety-scores";
import { CrimeComparison } from "./crime-comparison";
import { CrimeAlerts } from "./crime-alerts";
import {
  OFFENCE_CATEGORIES,
  OFFENCE_CATEGORY_LABELS,
  OFFENCE_CATEGORY_COLORS,
  type OffenceCategory,
  type CrimeAlertConfig,
} from "../types";
import { riskLevel, riskColor } from "../utils/crime-calculations";

interface CrimeLayerPanelProps {
  postcode: string;
  schoolPostcodes: string[];
  crimeIndexThreshold: number;
}

type Tab = "overview" | "trends" | "schools" | "comparison";

export function CrimeLayerPanel({
  postcode,
  schoolPostcodes,
  crimeIndexThreshold,
}: CrimeLayerPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { data: summary, isLoading } = useCrimeByPostcode(postcode);

  const alertConfig: CrimeAlertConfig = {
    postcode,
    crimeIndexThreshold,
    schoolPostcodes,
    enablePush: false,
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "trends", label: "Trends" },
    { id: "schools", label: "Schools" },
    { id: "comparison", label: "vs National" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">Crime & Safety</h3>
        <p className="text-[10px] text-muted-foreground">
          Postcode {postcode}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      <div className="px-3 py-2">
        <CrimeAlerts config={alertConfig} />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading && (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}

        {activeTab === "overview" && summary && (
          <div className="space-y-4">
            {/* Crime Index Summary */}
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 flex-col items-center justify-center rounded-full"
                style={{
                  border: `3px solid ${riskColor(riskLevel(summary.crimeIndex))}`,
                }}
              >
                <span className="text-lg font-bold">
                  {summary.crimeIndex}
                </span>
                <span className="text-[8px] text-muted-foreground">
                  INDEX
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">{summary.sa3Name}</div>
                <div className="text-xs text-muted-foreground">
                  {summary.totalOffences.toLocaleString()} offences |{" "}
                  {summary.totalRate} per 100k
                </div>
                <div
                  className={`text-xs ${
                    summary.trend === "up"
                      ? "text-red-400"
                      : summary.trend === "down"
                        ? "text-green-400"
                        : "text-gray-400"
                  }`}
                >
                  {summary.trend === "up" ? "\u2191" : summary.trend === "down" ? "\u2193" : "\u2192"}{" "}
                  {summary.trendChangePercent > 0 ? "+" : ""}
                  {summary.trendChangePercent}% vs previous period
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold">By Category</h4>
              {OFFENCE_CATEGORIES.map((cat) => {
                const data = summary.byCategory[cat];
                if (!data) return null;
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: OFFENCE_CATEGORY_COLORS[cat],
                      }}
                    />
                    <span className="flex-1">
                      {OFFENCE_CATEGORY_LABELS[cat]}
                    </span>
                    <span className="font-medium">
                      {data.count.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      ({data.rate}/100k)
                    </span>
                    <span
                      className={
                        data.trend === "up"
                          ? "text-red-400"
                          : data.trend === "down"
                            ? "text-green-400"
                            : "text-gray-400"
                      }
                    >
                      {data.trend === "up" ? "\u2191" : data.trend === "down" ? "\u2193" : "\u2192"}
                      {Math.abs(data.changePercent)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <OffenceTrends postcode={postcode} />
        )}

        {activeTab === "schools" && (
          <SchoolSafetyScores postcode={postcode} />
        )}

        {activeTab === "comparison" && (
          <CrimeComparison postcode={postcode} />
        )}
      </div>

      <div className="border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
        Sources: ABS Recorded Crime, State Police Open Data, MySchool ACARA
      </div>
    </div>
  );
}
