import type { Alert, AlertThresholds, UserProfile } from "@ozpulse/shared";

/**
 * Alert engine: checks layer data against user thresholds
 * and returns alerts when values exceed configured limits.
 */

function makeId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

function now(): string {
  return new Date().toISOString();
}

// ── Individual Alert Checks ────────────────────────────────

/**
 * Fires when the fuel cost per litre expressed as a fraction of
 * hourly wage exceeds the user's threshold.
 *
 * E.g. threshold 0.15 means "alert me if one litre costs more than
 * 15 % of one hour's wage".
 */
export function checkFuelAlert(
  fuelPricePerLitre: number,
  hourlyWage: number,
  threshold: number
): Alert | null {
  if (hourlyWage <= 0) return null;
  const ratio = fuelPricePerLitre / hourlyWage;
  if (ratio <= threshold) return null;

  return {
    id: makeId(),
    type: "power-energy",
    severity: ratio > threshold * 1.5 ? "critical" : "warning",
    title: "Fuel cost alert",
    message: `Fuel at $${fuelPricePerLitre.toFixed(2)}/L is ${(ratio * 100).toFixed(1)}% of your hourly wage ($${hourlyWage.toFixed(2)}/hr). Threshold: ${(threshold * 100).toFixed(0)}%.`,
    timestamp: now(),
  };
}

/**
 * Fires when the crime index rises by more than the threshold
 * percentage points compared to the previous period.
 */
export function checkCrimeAlert(
  currentIndex: number,
  previousIndex: number,
  threshold: number
): Alert | null {
  if (previousIndex <= 0) return null;
  const change = ((currentIndex - previousIndex) / previousIndex) * 100;
  if (change <= threshold) return null;

  return {
    id: makeId(),
    type: "crime-safety",
    severity: change > threshold * 2 ? "critical" : "warning",
    title: "Crime index increase",
    message: `Crime index rose ${change.toFixed(1)}% (from ${previousIndex} to ${currentIndex}). Your threshold is ${threshold}%.`,
    timestamp: now(),
  };
}

/**
 * Fires when a demographic metric shifts by more than the threshold
 * percentage points.
 */
export function checkDemographicAlert(
  currentPercent: number,
  previousPercent: number,
  threshold: number
): Alert | null {
  const shift = Math.abs(currentPercent - previousPercent);
  if (shift <= threshold) return null;

  const direction = currentPercent > previousPercent ? "increased" : "decreased";
  return {
    id: makeId(),
    type: "immigration-demographics",
    severity: shift > threshold * 2 ? "critical" : "info",
    title: "Demographic shift detected",
    message: `Demographic metric ${direction} by ${shift.toFixed(1)} percentage points (${previousPercent.toFixed(1)}% -> ${currentPercent.toFixed(1)}%). Threshold: ${threshold}%.`,
    timestamp: now(),
  };
}

/**
 * Fires when the coal + gas share of energy generation drops
 * below the user's floor threshold. This is informational --
 * it can indicate either good news (more renewables) or supply
 * risk depending on context.
 */
export function checkEnergyAlert(
  coalGasSharePercent: number,
  floorThreshold: number
): Alert | null {
  if (coalGasSharePercent >= floorThreshold) return null;

  return {
    id: makeId(),
    type: "power-energy",
    severity: coalGasSharePercent < floorThreshold * 0.5 ? "warning" : "info",
    title: "Energy mix shift",
    message: `Coal + gas share is ${coalGasSharePercent.toFixed(1)}%, below your ${floorThreshold}% floor. Grid reliability may be affected.`,
    timestamp: now(),
  };
}

/**
 * Fires when property value changes significantly.
 */
export function checkPropertyAlert(
  currentValue: number,
  previousValue: number,
  threshold: number
): Alert | null {
  if (previousValue <= 0) return null;
  const changePct = ((currentValue - previousValue) / previousValue) * 100;
  if (Math.abs(changePct) <= threshold) return null;

  const direction = changePct > 0 ? "increased" : "decreased";
  return {
    id: makeId(),
    type: "real-estate",
    severity: Math.abs(changePct) > threshold * 2 ? "critical" : "info",
    title: "Property value change",
    message: `Property values ${direction} by ${Math.abs(changePct).toFixed(1)}% ($${previousValue.toLocaleString()} -> $${currentValue.toLocaleString()}). Threshold: ${threshold}%.`,
    timestamp: now(),
  };
}

// ── Aggregate Alert Processing ─────────────────────────────

export interface LayerData {
  fuelPricePerLitre?: number;
  crimeIndex?: number;
  previousCrimeIndex?: number;
  demographicPercent?: number;
  previousDemographicPercent?: number;
  coalGasSharePercent?: number;
  propertyValue?: number;
  previousPropertyValue?: number;
}

/**
 * Runs all alert checks against the user's profile thresholds
 * and the latest layer data. Returns an array of triggered alerts.
 */
export function processAlerts(
  profile: UserProfile,
  layerData: LayerData
): Alert[] {
  const alerts: Alert[] = [];
  const t = profile.alertThresholds;

  // Fuel alert
  if (
    layerData.fuelPricePerLitre != null &&
    profile.hourlyWage != null &&
    (profile as { hourlyWage?: number }).hourlyWage! > 0
  ) {
    const fuelAlert = checkFuelAlert(
      layerData.fuelPricePerLitre,
      (profile as { hourlyWage?: number }).hourlyWage!,
      t.fuelValueOfWorkRatio
    );
    if (fuelAlert) {
      fuelAlert.postcode = profile.postcode;
      alerts.push(fuelAlert);
    }
  }

  // Crime alert
  if (layerData.crimeIndex != null && layerData.previousCrimeIndex != null) {
    const crimeAlert = checkCrimeAlert(
      layerData.crimeIndex,
      layerData.previousCrimeIndex,
      t.crimeIndexRise
    );
    if (crimeAlert) {
      crimeAlert.postcode = profile.postcode;
      alerts.push(crimeAlert);
    }
  }

  // Demographic alert
  if (
    layerData.demographicPercent != null &&
    layerData.previousDemographicPercent != null
  ) {
    const demoAlert = checkDemographicAlert(
      layerData.demographicPercent,
      layerData.previousDemographicPercent,
      t.demographicShiftPercent
    );
    if (demoAlert) {
      demoAlert.postcode = profile.postcode;
      alerts.push(demoAlert);
    }
  }

  // Energy mix alert
  if (layerData.coalGasSharePercent != null) {
    const energyAlert = checkEnergyAlert(
      layerData.coalGasSharePercent,
      t.coalGasShareFloor
    );
    if (energyAlert) {
      energyAlert.postcode = profile.postcode;
      alerts.push(energyAlert);
    }
  }

  // Property value alert
  if (
    layerData.propertyValue != null &&
    layerData.previousPropertyValue != null
  ) {
    const propAlert = checkPropertyAlert(
      layerData.propertyValue,
      layerData.previousPropertyValue,
      t.demographicShiftPercent // reuse demographic threshold for property
    );
    if (propAlert) {
      propAlert.postcode = profile.postcode;
      alerts.push(propAlert);
    }
  }

  return alerts;
}

// ── Notification Preferences ──────────────────────────────

export interface NotificationPreferences {
  /** Global enable/disable */
  enabled: boolean;
  /** Per-layer notification toggles */
  layerPreferences: Record<string, boolean>;
  /** Enable browser push notifications */
  pushEnabled: boolean;
  /** Minimum severity to notify: info shows all, warning skips info, critical only critical */
  minimumSeverity: "info" | "warning" | "critical";
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  layerPreferences: {
    "power-energy": true,
    "real-estate": true,
    "crime-safety": true,
    "immigration-demographics": true,
    infrastructure: true,
    "mining-resources": true,
    "leisure-lifestyle": false,
  },
  pushEnabled: false,
  minimumSeverity: "warning",
};

const SEVERITY_RANK: Record<string, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

/**
 * Filter alerts based on user notification preferences.
 */
export function filterAlertsByPreferences(
  alerts: Alert[],
  preferences: NotificationPreferences
): Alert[] {
  if (!preferences.enabled) return [];

  const minRank = SEVERITY_RANK[preferences.minimumSeverity] ?? 0;

  return alerts.filter((alert) => {
    if (SEVERITY_RANK[alert.severity] < minRank) return false;
    const layerKey = alert.type ?? "";
    if (layerKey && preferences.layerPreferences[layerKey] === false) {
      return false;
    }
    return true;
  });
}

// ── Notification Persistence (localStorage) ───────────────

const PREFS_KEY = "ozpulse-notification-prefs";

export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

export function saveNotificationPreferences(
  prefs: NotificationPreferences
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// ── Web Push API Setup ────────────────────────────────────

/**
 * Request permission for browser push notifications.
 * Returns the subscription object if granted, null otherwise.
 */
export async function requestPushPermission(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    return subscription;
  } catch {
    return null;
  }
}

/**
 * Show a browser notification for an alert.
 */
export function showBrowserNotification(alert: Alert): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(`[${alert.severity.toUpperCase()}] ${alert.title}`, {
    body: alert.message,
    tag: `ozpulse-${alert.type}-${Date.now()}`,
    requireInteraction: alert.severity === "critical",
  });
}
