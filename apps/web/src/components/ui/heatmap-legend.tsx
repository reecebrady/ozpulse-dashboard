"use client";

import { cn } from "@/lib/utils";

interface HeatmapLegendProps {
  minLabel: string;
  maxLabel: string;
  colors: string[];
  title?: string;
  className?: string;
}

export function HeatmapLegend({
  minLabel,
  maxLabel,
  colors,
  title,
  className,
}: HeatmapLegendProps) {
  const gradient = colors.length > 0
    ? `linear-gradient(to right, ${colors.join(", ")})`
    : "linear-gradient(to right, #22c55e, #eab308, #ef4444)";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {title && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          {title}
        </span>
      )}
      <div
        className="h-2 w-full rounded-full"
        style={{ background: gradient }}
      />
      <div className="flex justify-between">
        <span className="text-[10px] text-[var(--muted-foreground)]">
          {minLabel}
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)]">
          {maxLabel}
        </span>
      </div>
    </div>
  );
}
