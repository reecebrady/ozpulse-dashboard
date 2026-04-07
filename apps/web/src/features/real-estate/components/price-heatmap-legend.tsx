"use client";

import { PRICE_HEATMAP_COLORS } from "../lib/constants";

const LEGEND_ITEMS = [
  { label: "< $400/m²", color: PRICE_HEATMAP_COLORS.veryLow },
  { label: "$400-600", color: PRICE_HEATMAP_COLORS.low },
  { label: "$600-900", color: PRICE_HEATMAP_COLORS.medium },
  { label: "$900-1.2k", color: PRICE_HEATMAP_COLORS.high },
  { label: "> $1.2k/m²", color: PRICE_HEATMAP_COLORS.veryHigh },
];

export function PriceHeatmapLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="font-medium">$/m²</span>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
