"use client";

import { useMemo } from "react";
import { useCrimeAlerts } from "./use-crime-alerts";
import type { CrimeAlertConfig } from "../types";
import type { Alert, UserProfile } from "@ozpulse/shared";

/**
 * Builds CrimeAlertConfig from the shared UserProfile and returns all crime alerts.
 * Intended for the bottom alert feed in the dashboard.
 */
export function useAllCrimeAlerts(profile: UserProfile | null): {
  alerts: Alert[];
  isLoading: boolean;
} {
  const config: CrimeAlertConfig | undefined = useMemo(() => {
    if (!profile) return undefined;
    return {
      postcode: profile.postcode,
      crimeIndexThreshold: profile.alertThresholds.crimeIndexRise,
      schoolPostcodes: profile.schoolPostcodes,
      enablePush: false,
    };
  }, [profile]);

  return useCrimeAlerts(config);
}
