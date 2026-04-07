import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "info" | "warning" | "success";
}

const badgeVariants: Record<string, string> = {
  default: "bg-[var(--primary)] text-[var(--primary-foreground)]",
  secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
  destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
  outline: "border border-[var(--border)] text-[var(--foreground)]",
  info: "bg-[var(--alert-info)]/15 text-[var(--alert-info)] border border-[var(--alert-info)]/30",
  warning: "bg-[var(--alert-warning)]/15 text-[var(--alert-warning)] border border-[var(--alert-warning)]/30",
  success: "bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
