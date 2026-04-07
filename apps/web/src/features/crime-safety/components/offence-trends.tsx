"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useCrimeTrends } from "../hooks";
import type { OffenceCategory } from "../types";
import { OFFENCE_CATEGORY_COLORS, OFFENCE_CATEGORY_LABELS } from "../types";

interface OffenceTrendsProps {
  postcode: string;
  months?: number;
  categories?: OffenceCategory[];
}

export function OffenceTrends({
  postcode,
  months = 12,
  categories,
}: OffenceTrendsProps) {
  const { data: trends, isLoading, error } = useCrimeTrends(postcode, months);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading trends...
      </div>
    );
  }

  if (error || !trends || trends.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">
        12-Month Crime Trends — {postcode}
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line
            type="monotone"
            dataKey="rate"
            name="Rate per 100k"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            name="Total Offences"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Month-on-month change arrows */}
      <div className="flex flex-wrap gap-1">
        {trends.slice(-6).map((t) => (
          <div
            key={t.period}
            className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px]"
          >
            <span>{t.period}</span>
            <span
              className={
                t.changePercent > 0
                  ? "text-red-500"
                  : t.changePercent < 0
                    ? "text-green-500"
                    : "text-gray-400"
              }
            >
              {t.changePercent > 0 ? "\u2191" : t.changePercent < 0 ? "\u2193" : "\u2192"}
              {Math.abs(t.changePercent)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
