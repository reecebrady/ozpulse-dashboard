"use client";

import { useState } from "react";
import { useMigrationByPostcode } from "../hooks";
import { DiasporaConcentrationPanel } from "./diaspora-concentration";
import { MigrationTrendsChart } from "./migration-trends-chart";
import { WorkforceShiftsPanel } from "./workforce-shifts";
import { DemographicAlerts } from "./demographic-alerts";
import {
  VISA_CATEGORIES,
  VISA_CATEGORY_LABELS,
  VISA_CATEGORY_COLORS,
  type DemographicAlertConfig,
} from "../types";

interface ImmigrationLayerPanelProps {
  postcode: string;
  lgaCode: string;
  workplaceCatchmentPostcodes: string[];
  shiftThresholdPercent: number;
}

type Tab = "overview" | "diaspora" | "trends" | "workforce";

export function ImmigrationLayerPanel({
  postcode,
  lgaCode,
  workplaceCatchmentPostcodes,
  shiftThresholdPercent,
}: ImmigrationLayerPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { data: summary, isLoading } = useMigrationByPostcode(postcode);

  const alertConfig: DemographicAlertConfig = {
    postcode,
    lgaCode,
    shiftThresholdPercent,
    workplaceCatchmentPostcodes,
    enablePush: false,
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "diaspora", label: "Diaspora" },
    { id: "trends", label: "Trends" },
    { id: "workforce", label: "Workforce" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">Immigration & Demographics</h3>
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
        <DemographicAlerts config={alertConfig} />
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
            {/* Migration Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded bg-muted p-2">
                <div className="text-lg font-bold text-blue-400">
                  {summary.totalArrivals.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Arrivals
                </div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-lg font-bold text-red-400">
                  {summary.totalDepartures.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Departures
                </div>
              </div>
              <div className="rounded bg-muted p-2">
                <div
                  className={`text-lg font-bold ${summary.netMigration >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {summary.netMigration >= 0 ? "+" : ""}
                  {summary.netMigration.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground">Net</div>
              </div>
            </div>

            {/* Change indicator */}
            <div
              className={`rounded p-2 text-xs ${
                Math.abs(summary.netMigrationChangePercent) >= shiftThresholdPercent
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Net migration change:{" "}
              {summary.netMigrationChangePercent > 0 ? "+" : ""}
              {summary.netMigrationChangePercent}% vs previous quarter
              {Math.abs(summary.netMigrationChangePercent) >= shiftThresholdPercent &&
                " (exceeds threshold)"}
            </div>

            {/* By Visa Category */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold">By Visa Category</h4>
              {VISA_CATEGORIES.map((cat) => {
                const data = summary.byVisaCategory[cat];
                if (!data) return null;
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: VISA_CATEGORY_COLORS[cat] }}
                    />
                    <span className="flex-1">
                      {VISA_CATEGORY_LABELS[cat]}
                    </span>
                    <span className="text-blue-400">
                      +{data.arrivals.toLocaleString()}
                    </span>
                    <span className="text-red-400">
                      -{data.departures.toLocaleString()}
                    </span>
                    <span
                      className={
                        data.net >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      ={data.net >= 0 ? "+" : ""}
                      {data.net.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Top Source Countries */}
            {summary.topSourceCountries.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold">
                  Top Source Countries (12 months)
                </h4>
                {summary.topSourceCountries.slice(0, 10).map((c, i) => (
                  <div
                    key={c.country}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-4 text-right text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="flex-1">{c.country}</span>
                    <span>{c.arrivals.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      ({c.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "diaspora" && (
          <DiasporaConcentrationPanel postcode={postcode} />
        )}

        {activeTab === "trends" && (
          <MigrationTrendsChart postcode={postcode} />
        )}

        {activeTab === "workforce" && (
          <WorkforceShiftsPanel governmentOnly={false} />
        )}
      </div>

      <div className="border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
        Sources: ABS Migration Statistics, ABS Census, Department of Home
        Affairs
      </div>
    </div>
  );
}
