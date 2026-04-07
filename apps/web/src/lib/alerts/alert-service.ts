/**
 * Alert Service -- orchestrates periodic evaluation of alert conditions
 * against cached data, creates new alerts, and handles deduplication.
 *
 * Designed to run inside a TanStack Query polling loop on the client,
 * or as a server-side cron job.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, AlertThresholdsJson } from "@ozpulse/database";
import { getCachedData, createAlert, hasRecentAlert } from "@ozpulse/database";
import {
  evaluateAlertConditions,
  type FuelPriceData,
  type CrimeIndexData,
  type DemographicData,
  type EnergyMixData,
} from "./alert-engine";

/** How long before the same alert can fire again (hours) */
const DEDUP_WINDOW_HOURS = 24;

interface AlertServiceConfig {
  userId: string;
  postcode: string;
  thresholds: AlertThresholdsJson;
  /** Vehicle efficiency L/100km -- from user profile */
  vehicleEfficiency: number | null;
  /** One-way commute km -- from user profile */
  commuteKm: number | null;
  /** Hourly wage for value-of-work calculation. Defaults to AU median if null. */
  hourlyWage: number | null;
}

const AU_MEDIAN_HOURLY_WAGE = 42; // approx ABS figure

/**
 * Extract fuel price data from cached AEMO / fuel API responses.
 * Returns null if the cache doesn't contain usable data.
 */
function extractFuelPriceData(
  cached: Record<string, unknown> | null,
  config: AlertServiceConfig,
): FuelPriceData | undefined {
  if (!cached) return undefined;
  if (config.vehicleEfficiency == null || config.commuteKm == null) return undefined;

  const avgPrice = cached["average_price_per_litre"] as number | undefined;
  if (avgPrice == null) return undefined;

  return {
    averagePricePerLitre: avgPrice,
    hourlyWage: config.hourlyWage ?? AU_MEDIAN_HOURLY_WAGE,
    vehicleEfficiency: config.vehicleEfficiency,
    commuteKm: config.commuteKm,
  };
}

/**
 * Extract crime index data from cached crime API responses.
 */
function extractCrimeIndexData(
  cached: Record<string, unknown> | null,
): CrimeIndexData | undefined {
  if (!cached) return undefined;

  const current = cached["current_index"] as number | undefined;
  const previous = cached["previous_index"] as number | undefined;
  if (current == null || previous == null) return undefined;

  return { currentIndex: current, previousIndex: previous };
}

/**
 * Extract demographic shift data from cached ABS responses.
 */
function extractDemographicData(
  cached: Record<string, unknown> | null,
): DemographicData | undefined {
  if (!cached) return undefined;

  const current = cached["current_population"] as number | undefined;
  const previous = cached["previous_population"] as number | undefined;
  if (current == null || previous == null) return undefined;

  return { currentValue: current, previousValue: previous };
}

/**
 * Extract energy mix data from cached AEMO responses.
 */
function extractEnergyMixData(
  cached: Record<string, unknown> | null,
): EnergyMixData | undefined {
  if (!cached) return undefined;

  const share = cached["coal_gas_share_percent"] as number | undefined;
  if (share == null) return undefined;

  return { coalGasSharePercent: share };
}

/**
 * Run the alert evaluation cycle once.
 * Call this from a TanStack Query `queryFn` with `refetchInterval`.
 *
 * Returns the number of new alerts created.
 */
export async function runAlertCycle(
  client: SupabaseClient<Database>,
  config: AlertServiceConfig,
): Promise<number> {
  // Fetch cached data for each data source
  const [fuelCache, crimeCache, demoCache, energyCache] = await Promise.all([
    getCachedData(client, "fuel", `postcode/${config.postcode}`).then((r) => r?.data ?? null),
    getCachedData(client, "crime", `postcode/${config.postcode}`).then((r) => r?.data ?? null),
    getCachedData(client, "demographics", `postcode/${config.postcode}`).then(
      (r) => r?.data ?? null,
    ),
    getCachedData(client, "energy", "national/mix").then((r) => r?.data ?? null),
  ]);

  // Build input for the engine
  const input = {
    userId: config.userId,
    postcode: config.postcode,
    thresholds: config.thresholds,
    fuelPrice: extractFuelPriceData(fuelCache, config),
    crimeIndex: extractCrimeIndexData(crimeCache),
    demographic: extractDemographicData(demoCache),
    energyMix: extractEnergyMixData(energyCache),
  };

  // Evaluate all conditions
  const pendingAlerts = evaluateAlertConditions(input);

  // Deduplicate and persist
  let created = 0;
  for (const alert of pendingAlerts) {
    const isDuplicate = await hasRecentAlert(
      client,
      config.userId,
      alert.type,
      alert.postcode,
      DEDUP_WINDOW_HOURS,
    );

    if (!isDuplicate) {
      await createAlert(client, alert);
      created++;
    }
  }

  return created;
}

/**
 * Hook-friendly wrapper: returns the query config for TanStack Query.
 *
 * Usage:
 * ```ts
 * const { data } = useQuery(alertPollingQuery(client, config));
 * ```
 */
export function alertPollingQuery(
  client: SupabaseClient<Database>,
  config: AlertServiceConfig | null,
) {
  return {
    queryKey: ["alert-cycle", config?.userId, config?.postcode],
    queryFn: async () => {
      if (!config) return 0;
      return runAlertCycle(client, config);
    },
    enabled: config != null,
    /** Poll every 5 minutes */
    refetchInterval: 5 * 60 * 1000,
    /** Don't refetch on window focus -- rely on the interval */
    refetchOnWindowFocus: false,
    /** Stale immediately so the interval drives refetches */
    staleTime: 0,
  };
}
