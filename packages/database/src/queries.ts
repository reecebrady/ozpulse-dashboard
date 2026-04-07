/**
 * Type-safe database query functions for OzPulse.
 * All functions accept a Supabase client instance for testability.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  UserProfileRow,
  UserProfileInsert,
  UserProfileUpdate,
  AlertRow,
  AlertInsert,
  CachedDataRow,
  CachedDataInsert,
  PinnedLocationRow,
  PinnedLocationInsert,
} from "./schema";

type Client = SupabaseClient<Database>;

// ─── User Profiles ───

export async function getUserProfile(
  client: Client,
  userId: string,
): Promise<UserProfileRow | null> {
  const { data, error } = await client
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`getUserProfile failed: ${error.message}`);
  }
  return data;
}

export async function saveUserProfile(
  client: Client,
  userId: string,
  profile: UserProfileInsert,
): Promise<UserProfileRow> {
  const { data, error } = await client
    .from("user_profiles")
    .upsert({ ...profile, id: userId } as unknown as UserProfileRow, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) throw new Error(`saveUserProfile failed: ${error.message}`);
  return data!;
}

export async function updateUserProfile(
  client: Client,
  userId: string,
  updates: UserProfileUpdate,
): Promise<UserProfileRow> {
  const { data, error } = await client
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw new Error(`updateUserProfile failed: ${error.message}`);
  return data!;
}

// ─── Alerts ───

export interface GetAlertsOptions {
  userId: string;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export async function getAlerts(
  client: Client,
  options: GetAlertsOptions,
): Promise<{ alerts: AlertRow[]; total: number }> {
  const { userId, limit = 20, offset = 0, unreadOnly = false } = options;

  let query = client
    .from("alerts")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(`getAlerts failed: ${error.message}`);
  return { alerts: data ?? [], total: count ?? 0 };
}

export async function createAlert(
  client: Client,
  alert: AlertInsert,
): Promise<AlertRow> {
  const { data, error } = await client
    .from("alerts")
    .insert(alert)
    .select("*")
    .single();

  if (error) throw new Error(`createAlert failed: ${error.message}`);
  return data!;
}

export async function markAlertRead(
  client: Client,
  alertId: string,
  userId: string,
): Promise<void> {
  const { error } = await client
    .from("alerts")
    .update({ read: true })
    .eq("id", alertId)
    .eq("user_id", userId);

  if (error) throw new Error(`markAlertRead failed: ${error.message}`);
}

export async function deleteAlert(
  client: Client,
  alertId: string,
  userId: string,
): Promise<void> {
  const { error } = await client
    .from("alerts")
    .delete()
    .eq("id", alertId)
    .eq("user_id", userId);

  if (error) throw new Error(`deleteAlert failed: ${error.message}`);
}

/**
 * Check whether an alert of the same type+postcode was created within the
 * deduplication window (default 24 hours). Used to avoid spamming.
 */
export async function hasRecentAlert(
  client: Client,
  userId: string,
  type: string,
  postcode: string | null,
  windowHours = 24,
): Promise<boolean> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  let query = client
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", type)
    .gte("created_at", since);

  if (postcode) {
    query = query.eq("postcode", postcode);
  }

  const { count, error } = await query;
  if (error) throw new Error(`hasRecentAlert failed: ${error.message}`);
  return (count ?? 0) > 0;
}

// ─── Cached Data ───

export async function getCachedData(
  client: Client,
  source: string,
  endpoint: string,
): Promise<CachedDataRow | null> {
  const { data, error } = await client
    .from("cached_data")
    .select("*")
    .eq("source", source)
    .eq("endpoint", endpoint)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getCachedData failed: ${error.message}`);
  }

  // Check expiry
  if (data && new Date(data.expires_at) < new Date()) {
    return null; // expired
  }

  return data;
}

export async function setCachedData(
  client: Client,
  entry: CachedDataInsert,
): Promise<CachedDataRow> {
  const { data, error } = await client
    .from("cached_data")
    .upsert(entry, { onConflict: "source,endpoint" })
    .select("*")
    .single();

  if (error) throw new Error(`setCachedData failed: ${error.message}`);
  return data!;
}

// ─── Pinned Locations ───

export async function getPinnedLocations(
  client: Client,
  userId: string,
): Promise<PinnedLocationRow[]> {
  const { data, error } = await client
    .from("pinned_locations")
    .select("id, user_id, type, label, lat, lng, postcode")
    .eq("user_id", userId)
    .order("type", { ascending: true });

  if (error) throw new Error(`getPinnedLocations failed: ${error.message}`);
  return data ?? [];
}

export async function addPinnedLocation(
  client: Client,
  location: PinnedLocationInsert,
): Promise<PinnedLocationRow> {
  const { data, error } = await client
    .from("pinned_locations")
    .insert(location)
    .select("id, user_id, type, label, lat, lng, postcode")
    .single();

  if (error) throw new Error(`addPinnedLocation failed: ${error.message}`);
  return data!;
}

export async function deletePinnedLocation(
  client: Client,
  locationId: string,
  userId: string,
): Promise<void> {
  const { error } = await client
    .from("pinned_locations")
    .delete()
    .eq("id", locationId)
    .eq("user_id", userId);

  if (error) throw new Error(`deletePinnedLocation failed: ${error.message}`);
}
