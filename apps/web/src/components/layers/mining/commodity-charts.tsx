"use client";

/**
 * Commodity price trend charts for iron ore, coal, lithium, gold, and copper.
 * Uses recharts with 12-month mock price data at realistic levels.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { COMMODITY_COLORS } from "./mine-sites";

// --- Mock 12-month price data (Apr 2025 -> Mar 2026) ---

interface PricePoint {
  month: string;
  price: number;
}

interface CommodityPriceData {
  commodity: string;
  unit: string;
  color: string;
  data: PricePoint[];
}

function generatePriceData(
  basePrice: number,
  volatility: number,
  trend: number,
  seed: number
): PricePoint[] {
  const months = [
    "Apr 25", "May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25",
    "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26",
  ];
  let price = basePrice;
  const points: PricePoint[] = [];
  let s = seed;

  for (const month of months) {
    // Simple deterministic pseudo-random
    s = ((s * 1103515245 + 12345) & 0x7fffffff) >>> 0;
    const noise = ((s % 1000) / 1000 - 0.5) * 2 * volatility;
    price = price * (1 + trend / 12 + noise);
    price = Math.max(price * 0.7, price); // floor at 70% of base
    points.push({ month, price: Math.round(price * 100) / 100 });
  }

  return points;
}

export const COMMODITY_PRICE_SERIES: CommodityPriceData[] = [
  {
    commodity: "Iron Ore",
    unit: "USD/t",
    color: COMMODITY_COLORS["iron-ore"]!,
    data: generatePriceData(110, 0.04, 0.02, 42),
  },
  {
    commodity: "Thermal Coal",
    unit: "USD/t",
    color: COMMODITY_COLORS["thermal-coal"]!,
    data: generatePriceData(130, 0.05, -0.03, 73),
  },
  {
    commodity: "Lithium Carbonate",
    unit: "USD/t",
    color: COMMODITY_COLORS["lithium"]!,
    data: generatePriceData(15000, 0.06, -0.08, 101),
  },
  {
    commodity: "Gold",
    unit: "USD/oz",
    color: COMMODITY_COLORS["gold"]!,
    data: generatePriceData(3000, 0.02, 0.06, 17),
  },
  {
    commodity: "Copper",
    unit: "USD/t",
    color: COMMODITY_COLORS["copper"]!,
    data: generatePriceData(9500, 0.03, 0.04, 59),
  },
];

interface CommodityChartsProps {
  selectedCommodity?: string;
}

export function CommodityCharts({ selectedCommodity }: CommodityChartsProps) {
  const series = selectedCommodity
    ? COMMODITY_PRICE_SERIES.filter(
        (s) => s.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())
      )
    : COMMODITY_PRICE_SERIES;

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold">Commodity Price Trends (12-month)</h4>

      {series.map((commodity) => (
        <div key={commodity.commodity} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{commodity.commodity}</span>
            <span className="text-xs text-muted-foreground">
              Latest: {commodity.data[commodity.data.length - 1]!.price.toLocaleString()}{" "}
              {commodity.unit}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={commodity.data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toLocaleString()} ${commodity.unit}`,
                  commodity.commodity,
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={commodity.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}

/** Standalone bar chart: Export value by commodity (top 8) */
export function ExportValueChart() {
  const exportData = [
    { commodity: "Iron Ore", valueB: 57.5, color: COMMODITY_COLORS["iron-ore"]! },
    { commodity: "LNG", valueB: 45.0, color: COMMODITY_COLORS["lng"]! },
    { commodity: "Coal", valueB: 14.6, color: COMMODITY_COLORS["coal"]! },
    { commodity: "Lithium", valueB: 8.6, color: COMMODITY_COLORS["lithium"]! },
    { commodity: "Gold", valueB: 10.2, color: COMMODITY_COLORS["gold"]! },
    { commodity: "Copper", valueB: 4.2, color: COMMODITY_COLORS["copper"]! },
    { commodity: "Alumina", valueB: 2.3, color: COMMODITY_COLORS["alumina"]! },
    { commodity: "Nickel", valueB: 1.4, color: COMMODITY_COLORS["nickel"]! },
  ].sort((a, b) => b.valueB - a.valueB);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Annual Export Value (AUD billions)</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={exportData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="commodity" tick={{ fontSize: 10 }} width={80} />
          <Tooltip formatter={(value: number) => [`$${value}B`, "Export Value"]} />
          <Bar dataKey="valueB" fill="#e67e22" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
