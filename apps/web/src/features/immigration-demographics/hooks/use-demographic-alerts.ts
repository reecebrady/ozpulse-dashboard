"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@ozpulse/shared";
import { REFRESH_INTERVALS } from "@ozpulse/shared";
import { fetchMigrationByPostcode, fetchDiasporaByPostcode } from "../api";
import {
  calculateDemographicShiftPercent,
  detectSignificantShifts,
} from "../utils/demographic-calculations";
import type { DemographicAlertConfig, DiasporaConcentration } from "../types";

export function useDemographicAlerts(
  config: DemographicAlertConfig | undefined
) {
  const previousDiasporaRef = useRef<DiasporaConcentration | null>(null);

  const migrationQuery = useQuery({
    queryKey: ["immigration", "alerts", config?.postcode],
    queryFn: () => fetchMigrationByPostcode(config!.postcode),
    enabled: !!config?.postcode,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
    refetchInterval: REFRESH_INTERVALS.DEMOGRAPHICS,
  });

  const diasporaQuery = useQuery({
    queryKey: ["diaspora", "alerts", config?.postcode],
    queryFn: () => fetchDiasporaByPostcode(config!.postcode),
    enabled: !!config?.postcode,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
    refetchInterval: REFRESH_INTERVALS.DEMOGRAPHICS,
  });

  const workplaceQueries = useQuery({
    queryKey: [
      "immigration",
      "alerts",
      "workplace",
      config?.workplaceCatchmentPostcodes,
    ],
    queryFn: async () => {
      if (!config?.workplaceCatchmentPostcodes.length) return [];
      const results = await Promise.all(
        config.workplaceCatchmentPostcodes.map(fetchMigrationByPostcode)
      );
      return results.filter(Boolean);
    },
    enabled: !!config?.workplaceCatchmentPostcodes.length,
    staleTime: REFRESH_INTERVALS.DEMOGRAPHICS,
  });

  const alerts: Alert[] = [];

  // Check for net migration change exceeding threshold
  if (migrationQuery.data && config) {
    const { netMigrationChangePercent, postcode, sa4Name } =
      migrationQuery.data;

    if (
      Math.abs(netMigrationChangePercent) >= config.shiftThresholdPercent
    ) {
      const direction =
        netMigrationChangePercent > 0 ? "increase" : "decrease";
      alerts.push({
        id: `demo-migration-${postcode}`,
        layerId: "immigration-demographics",
        severity:
          Math.abs(netMigrationChangePercent) >= config.shiftThresholdPercent * 2
            ? "critical"
            : "warning",
        title: `Net migration ${direction} in ${sa4Name}`,
        message: `Net migration changed by ${netMigrationChangePercent > 0 ? "+" : ""}${netMigrationChangePercent}% in your LGA (threshold: ${config.shiftThresholdPercent}%).`,
        postcode,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  // Check for diaspora concentration shifts
  if (diasporaQuery.data && previousDiasporaRef.current && config) {
    const shifts = calculateDemographicShiftPercent(
      diasporaQuery.data,
      previousDiasporaRef.current
    );
    const significant = detectSignificantShifts(
      shifts,
      config.shiftThresholdPercent
    );

    for (const shift of significant) {
      alerts.push({
        id: `demo-diaspora-${config.postcode}-${shift.country}`,
        layerId: "immigration-demographics",
        severity: "info",
        title: `Demographic shift: ${shift.country} in ${config.postcode}`,
        message: `${shift.country}-born population shifted by ${shift.shiftPercent > 0 ? "+" : ""}${shift.shiftPercent}% in your area.`,
        postcode: config.postcode,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  if (diasporaQuery.data) {
    previousDiasporaRef.current = diasporaQuery.data;
  }

  // Workplace catchment alerts
  if (workplaceQueries.data && config) {
    for (const wpData of workplaceQueries.data) {
      if (!wpData) continue;
      if (
        Math.abs(wpData.netMigrationChangePercent) >=
        config.shiftThresholdPercent
      ) {
        alerts.push({
          id: `demo-workplace-${wpData.postcode}`,
          layerId: "immigration-demographics",
          severity: "info",
          title: `Workforce area migration shift: ${wpData.sa4Name}`,
          message: `Net migration in your workplace area changed by ${wpData.netMigrationChangePercent > 0 ? "+" : ""}${wpData.netMigrationChangePercent}%.`,
          postcode: wpData.postcode,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }
  }

  return {
    alerts,
    isLoading:
      migrationQuery.isLoading ||
      diasporaQuery.isLoading ||
      workplaceQueries.isLoading,
    error:
      migrationQuery.error ||
      diasporaQuery.error ||
      workplaceQueries.error,
  };
}
