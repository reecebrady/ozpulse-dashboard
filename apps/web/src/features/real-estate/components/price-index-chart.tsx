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
import type { PriceIndexSeries } from "@ozpulse/shared";

interface PriceIndexChartProps {
  suburbSeries: PriceIndexSeries;
  nationalSeries: PriceIndexSeries;
}

export function PriceIndexChart({
  suburbSeries,
  nationalSeries,
}: PriceIndexChartProps) {
  // Merge the two series by period
  const merged = suburbSeries.dataPoints.map((sp) => {
    const np = nationalSeries.dataPoints.find((n) => n.period === sp.period);
    return {
      period: sp.period,
      suburbIndex: sp.indexValue,
      nationalIndex: np?.indexValue ?? null,
      suburbMedian: sp.medianPrice,
      nationalMedian: np?.medianPrice ?? null,
    };
  });

  // Check if suburb outperforms or lags
  const latestSuburb = suburbSeries.dataPoints.at(-1);
  const latestNational = nationalSeries.dataPoints.at(-1);
  const outperforms =
    latestSuburb && latestNational
      ? latestSuburb.indexValue > latestNational.indexValue
      : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Price Index (24 months)</h4>
        {outperforms !== null && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              outperforms
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {outperforms ? "Outperforming" : "Lagging"} national
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10 }}
            tickFormatter={(v: string) => {
              const [, m] = v.split("-");
              return m === "01" || m === "07" ? v : "";
            }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            domain={["dataMin - 5", "dataMax + 5"]}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}`,
              name === "suburbIndex"
                ? suburbSeries.region
                : "National",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) =>
              value === "suburbIndex" ? suburbSeries.region : "National"
            }
          />
          <Line
            type="monotone"
            dataKey="suburbIndex"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="nationalIndex"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Median Price Trend */}
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10 }}
            tickFormatter={(v: string) => {
              const [, m] = v.split("-");
              return m === "01" || m === "07" ? v : "";
            }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v: number) =>
              v >= 1_000_000
                ? `$${(v / 1_000_000).toFixed(1)}M`
                : `$${(v / 1000).toFixed(0)}k`
            }
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === "suburbMedian"
                ? `${suburbSeries.region} Median`
                : "National Median",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) =>
              value === "suburbMedian"
                ? `${suburbSeries.region} Median`
                : "National Median"
            }
          />
          <Line
            type="monotone"
            dataKey="suburbMedian"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="nationalMedian"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
