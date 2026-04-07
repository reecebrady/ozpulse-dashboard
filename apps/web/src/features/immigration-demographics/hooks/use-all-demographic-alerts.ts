"use client";

import { useMemo } from "react";
import { useDemographicAlerts } from "./use-demographic-alerts";
import type { DemographicAlertConfig } from "../types";
import type { Alert, UserProfile } from "@ozpulse/shared";

/**
 * Builds DemographicAlertConfig from the shared UserProfile and returns all demographic alerts.
 * Intended for the bottom alert feed in the dashboard.
 */
export function useAllDemographicAlerts(profile: UserProfile | null): {
  alerts: Alert[];
  isLoading: boolean;
} {
  const config: DemographicAlertConfig | undefined = useMemo(() => {
    if (!profile) return undefined;
    return {
      postcode: profile.postcode,
      lgaCode: profile.postcode, // LGA resolved server-side from postcode
      shiftThresholdPercent: profile.alertThresholds.demographicShift,
      workplaceCatchmentPostcodes: profile.workPostcode
        ? [profile.workPostcode]
        : [],
      enablePush: false,
    };
  }, [profile]);

  return useDemographicAlerts(config);
}
