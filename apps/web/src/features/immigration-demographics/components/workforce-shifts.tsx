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
import { useWorkforceShifts } from "../hooks";
import { calculateWorkforceCompositionScore } from "../utils/demographic-calculations";

interface WorkforceShiftsProps {
  sa4Code?: string;
  governmentOnly?: boolean;
}

export function WorkforceShiftsPanel({
  sa4Code,
  governmentOnly,
}: WorkforceShiftsProps) {
  const { data: shifts, isLoading } = useWorkforceShifts(
    sa4Code,
    governmentOnly
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading workforce data...
      </div>
    );
  }

  if (!shifts || shifts.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No workforce data available
      </div>
    );
  }

  const scores = calculateWorkforceCompositionScore(shifts);

  const chartData = shifts.slice(0, 10).map((s) => ({
    industry:
      s.industry.length > 20 ? s.industry.slice(0, 20) + "..." : s.industry,
    "Australian Born": Math.round(s.australianBornPercent),
    "Overseas Born": Math.round(s.overseasBornPercent),
    change: s.yearOnYearChange,
  }));

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">
        Workforce Composition{governmentOnly ? " (Government Sector)" : ""}
      </h4>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 9 }}
            stroke="#9ca3af"
          />
          <YAxis
            dataKey="industry"
            type="category"
            tick={{ fontSize: 8 }}
            width={120}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              fontSize: "11px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "10px" }} />
          <Bar
            dataKey="Australian Born"
            stackId="a"
            fill="#3b82f6"
          />
          <Bar
            dataKey="Overseas Born"
            stackId="a"
            fill="#f59e0b"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Year-on-year change indicators */}
      <div className="space-y-1">
        <h5 className="text-xs font-medium">
          Year-on-Year Composition Change
        </h5>
        {shifts.slice(0, 6).map((s) => (
          <div
            key={s.industry}
            className="flex items-center gap-2 text-xs"
          >
            <span className="flex-1 truncate">{s.industry}</span>
            {s.governmentSector && (
              <span className="rounded bg-blue-500/20 px-1 text-[9px] text-blue-400">
                GOV
              </span>
            )}
            <span
              className={
                s.yearOnYearChange > 0
                  ? "text-blue-400"
                  : s.yearOnYearChange < 0
                    ? "text-red-400"
                    : "text-gray-400"
              }
            >
              {s.yearOnYearChange > 0 ? "+" : ""}
              {s.yearOnYearChange}% overseas
            </span>
          </div>
        ))}
      </div>

      {/* Top overseas countries in workforce */}
      {shifts[0] && shifts[0].topOverseasCountries.length > 0 && (
        <div>
          <h5 className="mb-1 text-xs font-medium">
            Top Overseas Countries ({shifts[0].industry})
          </h5>
          <div className="flex flex-wrap gap-1">
            {shifts[0].topOverseasCountries.slice(0, 6).map((c) => (
              <span
                key={c.country}
                className="rounded bg-muted px-2 py-0.5 text-[10px]"
              >
                {c.country} ({c.percentage}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
