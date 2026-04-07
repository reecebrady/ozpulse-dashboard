"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMigrationTrends } from "../hooks";

interface MigrationTrendsChartProps {
  postcode: string;
  quarters?: number;
}

export function MigrationTrendsChart({
  postcode,
  quarters = 8,
}: MigrationTrendsChartProps) {
  const { data: trends, isLoading } = useMigrationTrends(postcode, quarters);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading trends...
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">
        Migration Trends — {postcode}
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="#9ca3af" />
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
          <Area
            type="monotone"
            dataKey="arrivals"
            name="Arrivals"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="departures"
            name="Departures"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="net"
            name="Net"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.1}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
