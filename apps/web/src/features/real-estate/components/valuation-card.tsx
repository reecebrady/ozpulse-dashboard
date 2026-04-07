"use client";

import type { ValuationEstimate } from "@ozpulse/shared";
import { formatAud } from "../lib/mortgage-math";

interface ValuationCardProps {
  valuation: ValuationEstimate;
}

export function ValuationCard({ valuation }: ValuationCardProps) {
  return (
    <div className="rounded-lg border border-border p-3">
      <h4 className="text-sm font-semibold">Property Valuation</h4>
      <p className="text-xs text-muted-foreground">{valuation.address}</p>

      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">Estimated Value</p>
        <p className="text-2xl font-bold text-green-600">
          {formatAud(valuation.estimatedValueAud)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatAud(valuation.confidenceLow)} &ndash;{" "}
          {formatAud(valuation.confidenceHigh)}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {valuation.lastSoldPrice && (
          <div>
            <p className="text-muted-foreground">Last Sold</p>
            <p className="font-medium">
              {formatAud(valuation.lastSoldPrice)}
            </p>
            {valuation.lastSoldDate && (
              <p className="text-muted-foreground">{valuation.lastSoldDate}</p>
            )}
          </div>
        )}
        <div>
          <p className="text-muted-foreground">Comparables Used</p>
          <p className="font-medium">{valuation.comparablesUsed}</p>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {valuation.methodology}
      </p>
    </div>
  );
}
