"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useCrimeComparison } from "../hooks";
import {
  OFFENCE_CATEGORIES,
  OFFENCE_CATEGORY_LABELS,
  OFFENCE_CATEGORY_COLORS,
} from "../types";

interface CrimeComparisonProps {
  postcode: string;
}

export function CrimeComparison({ postcode }: CrimeComparisonProps) {
  const { data: comparison, isLoading } = useCrimeComparison(postcode);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading comparison...
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No comparison data available
      </div>
    );
  }

  const chartData = OFFENCE_CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " "),
    "Your Area":
      comparison.userPostcode.byCategory[cat]?.rate ?? 0,
    "State Avg":
      comparison.stateAverage.crimeIndex,
    "National Avg":
      comparison.nationalAverage.crimeIndex,
  }));

  const percentile = comparison.percentileRank;
  const percentileColor =
    percentile >= 70 ? "text-green-400" : percentile >= 40 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">
          National Comparison — {postcode}
        </h4>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">
            Safety Percentile
          </div>
          <div className={`text-lg font-bold ${percentileColor}`}>
            {percentile}th
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-muted p-2">
          <div className="text-lg font-bold">
            {comparison.userPostcode.crimeIndex}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Your Crime Index
          </div>
        </div>
        <div className="rounded bg-muted p-2">
          <div className="text-lg font-bold">
            {comparison.stateAverage.crimeIndex}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {comparison.userPostcode.state} Avg
          </div>
        </div>
        <div className="rounded bg-muted p-2">
          <div className="text-lg font-bold">
            {comparison.nationalAverage.crimeIndex}
          </div>
          <div className="text-[10px] text-muted-foreground">
            National Avg
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              fontSize: "11px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "10px" }} />
          <Bar dataKey="Your Area" fill="#3b82f6" />
          <Bar dataKey="State Avg" fill="#6b7280" />
          <Bar dataKey="National Avg" fill="#9ca3af" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
