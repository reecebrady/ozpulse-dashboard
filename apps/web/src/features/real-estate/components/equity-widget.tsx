"use client";

import { useUserProfileStore } from "@/stores/user-profile";
import { useEquityWidget } from "../hooks/use-equity-widget";
import type { MortgageInput } from "@ozpulse/shared";

/**
 * Compact equity widget for the top bar.
 * Shows current equity estimate and 12m trend.
 */
export function EquityWidget() {
  const profile = useUserProfileStore((s) => s.profile);
  const hasProfile = useUserProfileStore((s) => s.hasProfile);

  const mortgageInput: MortgageInput | null =
    hasProfile && profile.mortgageValue > 0
      ? {
          propertyValue: profile.mortgageValue,
          loanRemaining: profile.loanRemaining,
          remainingTermYears: profile.remainingTermYears,
          interestRate: profile.interestRate,
          netWorth: profile.mortgageValue - profile.loanRemaining,
        }
      : null;

  const widget = useEquityWidget(mortgageInput, hasProfile ? profile.postcode : null);

  const trendColor =
    widget.trend === "up"
      ? "text-green-500"
      : widget.trend === "down"
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1">
      <span className="text-xs text-muted-foreground">Equity</span>
      <span className="text-sm font-medium">{widget.equity}</span>
      {widget.equityChange !== "--" && (
        <span className={`text-xs ${trendColor}`}>
          {widget.trend === "up" ? "\u2191" : widget.trend === "down" ? "\u2193" : "\u2192"}
          {widget.equityChange}
        </span>
      )}
    </div>
  );
}
