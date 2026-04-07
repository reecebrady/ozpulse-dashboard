"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatWidgetProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  trendPositive?: boolean; // whether "up" is good or bad (e.g., up equity = good, up crime = bad)
  icon?: React.ReactNode;
  className?: string;
}

export function StatWidget({
  label,
  value,
  subValue,
  trend,
  trendValue,
  trendPositive,
  icon,
  className,
}: StatWidgetProps) {
  const trendColor = !trend || trend === "flat"
    ? "text-[var(--muted-foreground)]"
    : (trend === "up" && trendPositive) || (trend === "down" && !trendPositive)
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5",
        className
      )}
    >
      {icon && (
        <div className="flex-shrink-0 text-[var(--muted-foreground)]">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] leading-none">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-sm font-semibold leading-none">{value}</span>
          {subValue && (
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {subValue}
            </span>
          )}
        </div>
      </div>
      {trend && (
        <div className={cn("flex items-center gap-0.5 ml-1", trendColor)}>
          <TrendIcon className="h-3 w-3" />
          {trendValue && (
            <span className="text-[10px] font-medium">{trendValue}</span>
          )}
        </div>
      )}
    </div>
  );
}
