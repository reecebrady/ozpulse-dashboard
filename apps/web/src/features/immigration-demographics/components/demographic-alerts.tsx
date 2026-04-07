"use client";

import { useDemographicAlerts } from "../hooks";
import type { DemographicAlertConfig } from "../types";
import type { Alert } from "@ozpulse/shared";

interface DemographicAlertsProps {
  config: DemographicAlertConfig;
  onAlertClick?: (alert: Alert) => void;
}

function severityStyles(severity: Alert["severity"]) {
  switch (severity) {
    case "critical":
      return "border-red-500/50 bg-red-500/10";
    case "warning":
      return "border-yellow-500/50 bg-yellow-500/10";
    default:
      return "border-blue-500/50 bg-blue-500/10";
  }
}

function severityDot(severity: Alert["severity"]) {
  switch (severity) {
    case "critical":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    default:
      return "bg-blue-500";
  }
}

export function DemographicAlerts({
  config,
  onAlertClick,
}: DemographicAlertsProps) {
  const { alerts, isLoading } = useDemographicAlerts(config);

  if (isLoading) return null;
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-1">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          onClick={() => onAlertClick?.(alert)}
          className={`flex w-full items-start gap-2 rounded border p-2 text-left text-xs transition-colors hover:bg-muted/50 ${severityStyles(alert.severity)}`}
        >
          <span
            className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${severityDot(alert.severity)}`}
          />
          <div className="flex-1">
            <div className="font-medium">{alert.title}</div>
            <div className="text-[10px] text-muted-foreground">
              {alert.message}
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground">
            {new Date(alert.timestamp).toLocaleTimeString("en-AU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </button>
      ))}
    </div>
  );
}
