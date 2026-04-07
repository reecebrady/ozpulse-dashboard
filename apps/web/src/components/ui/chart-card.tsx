"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  loading,
  error,
  className,
  children,
  actions,
}: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--muted)] border-t-[var(--primary)]" />
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center text-sm text-[var(--destructive)]">
            {error}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
