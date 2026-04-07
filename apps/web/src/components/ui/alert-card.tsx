"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import type { Alert } from "@ozpulse/shared-types";

const severityStyles: Record<string, string> = {
  info: "border-l-[var(--severity-info)] bg-[var(--severity-info)]/5",
  warning: "border-l-[var(--severity-warning)] bg-[var(--severity-warning)]/5",
  critical:
    "border-l-[var(--severity-critical)] bg-[var(--severity-critical)]/5",
};

const severityDotStyles: Record<string, string> = {
  info: "bg-[var(--severity-info)]",
  warning: "bg-[var(--severity-warning)]",
  critical: "bg-[var(--severity-critical)]",
};

interface AlertCardProps {
  alert: Alert;
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function AlertCard({
  alert,
  onMarkRead,
  onDismiss,
  className,
}: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (!alert.read) onMarkRead?.(alert.id);
    setExpanded(!expanded);
  };

  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <div
      className={cn(
        "flex-shrink-0 w-72 rounded-md border border-[var(--border)] border-l-4 cursor-pointer transition-colors",
        severityStyles[alert.severity],
        !alert.read && "ring-1 ring-[var(--border)]",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2 p-2.5">
        <span
          className={cn(
            "mt-1 h-2 w-2 rounded-full shrink-0",
            severityDotStyles[alert.severity],
            alert.read && "opacity-40"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4
              className={cn(
                "text-xs font-medium truncate",
                alert.read && "text-[var(--muted-foreground)]"
              )}
            >
              {alert.title}
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {timeAgo}
              </span>
              {expanded ? (
                <ChevronUp className="h-3 w-3 text-[var(--muted-foreground)]" />
              ) : (
                <ChevronDown className="h-3 w-3 text-[var(--muted-foreground)]" />
              )}
            </div>
          </div>
          {!expanded && (
            <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
              {alert.message}
            </p>
          )}
          {expanded && (
            <div className="mt-1.5">
              <p className="text-xs text-[var(--muted-foreground)]">
                {alert.message}
              </p>
              {alert.postcode && (
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                  Postcode: {alert.postcode}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss?.(alert.id);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
