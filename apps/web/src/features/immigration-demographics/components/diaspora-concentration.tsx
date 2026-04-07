"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDiasporaByPostcode } from "../hooks";
import { diasporaConcentrationLevel } from "../utils/demographic-calculations";

interface DiasporaConcentrationProps {
  postcode: string;
}

const COUNTRY_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
  "#84cc16", "#a855f7", "#22d3ee", "#fb923c", "#e879f9",
  "#2dd4bf", "#fbbf24", "#818cf8", "#34d399", "#f472b6",
];

export function DiasporaConcentrationPanel({
  postcode,
}: DiasporaConcentrationProps) {
  const { data: diaspora, isLoading } = useDiasporaByPostcode(postcode);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading diaspora data...
      </div>
    );
  }

  if (!diaspora) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No diaspora data for {postcode}
      </div>
    );
  }

  const level = diasporaConcentrationLevel(diaspora.overseasBornPercent);

  const topAncestryData = diaspora.topAncestries.slice(0, 10).map((a) => ({
    country: a.country.length > 12 ? a.country.slice(0, 12) + "..." : a.country,
    fullName: a.country,
    percentage: Math.round(a.percentage * 10) / 10,
    change: a.yearOnYearChange,
  }));

  return (
    <div className="space-y-3">
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">
            Diaspora — {diaspora.suburb}, {diaspora.state}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            Population: {diaspora.totalPopulation.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {Math.round(diaspora.overseasBornPercent)}%
          </div>
          <div className="text-[10px] text-muted-foreground">
            overseas-born ({level})
          </div>
        </div>
      </div>

      {/* Top ancestries chart */}
      <div>
        <h5 className="mb-1 text-xs font-medium">
          Top Ancestries (% of population)
        </h5>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topAncestryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" tick={{ fontSize: 9 }} stroke="#9ca3af" />
            <YAxis
              dataKey="country"
              type="category"
              tick={{ fontSize: 9 }}
              width={80}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "6px",
                fontSize: "11px",
              }}
              formatter={(value: number, name: string, props: { payload: { fullName: string; change: number } }) => [
                `${value}% (YoY: ${props.payload.change > 0 ? "+" : ""}${props.payload.change}%)`,
                props.payload.fullName,
              ]}
            />
            <Bar dataKey="percentage">
              {topAncestryData.map((_, i) => (
                <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Languages spoken at home */}
      {diaspora.languagesSpokenAtHome.length > 0 && (
        <div>
          <h5 className="mb-1 text-xs font-medium">
            Languages Spoken at Home (non-English)
          </h5>
          <div className="space-y-1">
            {diaspora.languagesSpokenAtHome.slice(0, 8).map((lang) => (
              <div
                key={lang.language}
                className="flex items-center gap-2 text-xs"
              >
                <span className="flex-1">{lang.language}</span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(lang.percentage * 3, 100)}%`,
                    }}
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground">
                  {lang.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* English proficiency */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-muted p-2">
          <div className="font-medium">
            {diaspora.englishProficiency.speaksOnlyEnglish}%
          </div>
          <div className="text-[10px] text-muted-foreground">
            English only
          </div>
        </div>
        <div className="rounded bg-muted p-2">
          <div className="font-medium">
            {diaspora.englishProficiency.speaksOtherVeryWell}%
          </div>
          <div className="text-[10px] text-muted-foreground">
            Other + fluent English
          </div>
        </div>
      </div>
    </div>
  );
}
