import { useMemo } from "react";
import { useSuburbDetail } from "./use-real-estate-data";
import { calculateMortgage, formatAud, formatPercent } from "../lib/mortgage-math";
import type { MortgageInput } from "@ozpulse/shared";

interface EquityWidgetData {
  equity: string;
  equityRaw: number;
  ltv: string;
  ltvRaw: number;
  equityChange: string;
  trend: "up" | "down" | "flat";
  isLoading: boolean;
}

/**
 * Hook that provides top-bar equity widget data.
 * Combines user mortgage details with suburb price trends
 * to show current equity position and recent change.
 */
export function useEquityWidget(
  mortgage: MortgageInput | null,
  postcode: string | null
): EquityWidgetData {
  const { data: suburbData, isLoading } = useSuburbDetail(
    postcode ?? "",
    !!mortgage && !!postcode
  );

  return useMemo(() => {
    if (!mortgage || !postcode) {
      return {
        equity: "--",
        equityRaw: 0,
        ltv: "--",
        ltvRaw: 0,
        equityChange: "--",
        trend: "flat" as const,
        isLoading: false,
      };
    }

    const calc = calculateMortgage(mortgage);
    const priceChange12m = suburbData?.stats.priceChangePercent12m ?? 0;

    // Adjust property value based on suburb trend
    const adjustedEquity = calc.equityAfterPriceChange(priceChange12m);
    const adjustedLtv = calc.ltvAfterPriceChange(priceChange12m);
    const equityDelta = adjustedEquity - calc.currentEquity;

    return {
      equity: formatAud(adjustedEquity),
      equityRaw: adjustedEquity,
      ltv: `${(adjustedLtv * 100).toFixed(1)}%`,
      ltvRaw: adjustedLtv,
      equityChange: formatPercent(priceChange12m),
      trend:
        priceChange12m > 0.5
          ? ("up" as const)
          : priceChange12m < -0.5
          ? ("down" as const)
          : ("flat" as const),
      isLoading,
    };
  }, [mortgage, postcode, suburbData, isLoading]);
}
