import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./schema";

type Client = SupabaseClient<Database>;
type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"];
type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];
type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];
type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];
type CachedDataRow = Database["public"]["Tables"]["cached_data"]["Row"];

// ============================================================
// User Profiles
// ============================================================

export async function getUserProfile(
  client: Client,
  userId: string
): Promise<UserProfileRow | null> {
  const { data, error } = await client
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data;
}

export async function upsertUserProfile(
  client: Client,
  profile: UserProfileInsert & { id?: string }
): Promise<UserProfileRow> {
  const { data, error } = await client
    .from("user_profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  client: Client,
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfileRow> {
  const { data, error } = await client
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserProfile(
  client: Client,
  userId: string
): Promise<void> {
  const { error } = await client
    .from("user_profiles")
    .delete()
    .eq("id", userId);

  if (error) throw error;
}

// ============================================================
// Alerts
// ============================================================

export async function getAlertsForUser(
  client: Client,
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    layerId?: string;
  }
): Promise<AlertRow[]> {
  let query = client
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .eq("dismissed", false)
    .order("created_at", { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq("read", false);
  }
  if (options?.layerId) {
    query = query.eq("layer_id", options.layerId);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createAlert(
  client: Client,
  alert: AlertInsert
): Promise<AlertRow> {
  const { data, error } = await client
    .from("alerts")
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markAlertRead(
  client: Client,
  alertId: string
): Promise<void> {
  const { error } = await client
    .from("alerts")
    .update({ read: true })
    .eq("id", alertId);

  if (error) throw error;
}

export async function dismissAlert(
  client: Client,
  alertId: string
): Promise<void> {
  const { error } = await client
    .from("alerts")
    .update({ dismissed: true })
    .eq("id", alertId);

  if (error) throw error;
}

export async function getUnreadAlertCount(
  client: Client,
  userId: string
): Promise<number> {
  const { count, error } = await client
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)
    .eq("dismissed", false);

  if (error) throw error;
  return count ?? 0;
}

// ============================================================
// Cached Data
// ============================================================

export async function getCachedData<T = Record<string, unknown>>(
  client: Client,
  layerId: string,
  dataKey: string
): Promise<T | null> {
  const { data, error } = await client
    .from("cached_data")
    .select("*")
    .eq("layer_id", layerId)
    .eq("data_key", dataKey)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  // Check if expired
  const row = data as CachedDataRow;
  if (new Date(row.expires_at) < new Date()) {
    // Expired - clean up and return null
    await client
      .from("cached_data")
      .delete()
      .eq("id", row.id);
    return null;
  }

  return row.data as T;
}

export async function setCachedData(
  client: Client,
  layerId: string,
  dataKey: string,
  data: Record<string, unknown>,
  ttlMs: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  const { error } = await client
    .from("cached_data")
    .upsert(
      {
        layer_id: layerId,
        data_key: dataKey,
        data,
        expires_at: expiresAt,
      },
      { onConflict: "layer_id,data_key" }
    );

  if (error) throw error;
}

export async function clearExpiredCache(client: Client): Promise<number> {
  const { data, error } = await client
    .from("cached_data")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) throw error;
  return data?.length ?? 0;
}

// ============================================================
// Spatial Queries
// ============================================================

/**
 * Get nearby cached data within a radius of a point.
 * Uses Supabase RPC to call a PostGIS function.
 * Requires a corresponding database function to be created.
 */
export async function getNearbyData(
  client: Client,
  point: { lng: number; lat: number },
  radiusKm: number,
  layerId: string
): Promise<Record<string, unknown>[]> {
  const { data, error } = await client.rpc("get_nearby_data", {
    p_lng: point.lng,
    p_lat: point.lat,
    p_radius_km: radiusKm,
    p_layer_id: layerId,
  });

  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Saved Locations
// ============================================================

export async function getSavedLocations(
  client: Client,
  userId: string
) {
  const { data, error } = await client
    .from("saved_locations")
    .select("*")
    .eq("user_id", userId)
    .order("location_type");

  if (error) throw error;
  return data ?? [];
}

export async function upsertSavedLocation(
  client: Client,
  location: Database["public"]["Tables"]["saved_locations"]["Insert"] & { id?: string }
) {
  const { data, error } = await client
    .from("saved_locations")
    .upsert(location, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSavedLocation(
  client: Client,
  locationId: string
): Promise<void> {
  const { error } = await client
    .from("saved_locations")
    .delete()
    .eq("id", locationId);

  if (error) throw error;
}
