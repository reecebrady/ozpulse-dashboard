/**
 * Database schema types for OzPulse.
 * Maps 1:1 to PostgreSQL tables defined in migrations/001_initial.sql.
 */

// ─── Enums ───

export type PinnedLocationType = "home" | "work" | "school" | "other";
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType =
  | "fuel-price"
  | "crime-index"
  | "demographic-shift"
  | "coal-gas-share"
  | "property-value"
  | "general";

// ─── Row types ───

export interface UserProfileRow {
  id: string;
  postcode: string;
  mortgage_value: number;
  mortgage_remaining: number | null;
  net_worth: number | null;
  vehicle_efficiency: number | null; // L per 100km
  commute_km: number | null;
  school_postcode: string | null;
  work_postcode: string | null;
  alert_thresholds: AlertThresholdsJson;
  created_at: string;
  updated_at: string;
}

export interface AlertThresholdsJson {
  fuel_value_of_work_ratio: number | null;
  crime_index_rise: number | null;
  demographic_shift_percent: number;
  coal_gas_share_floor: number | null;
}

export interface AlertRow {
  id: string;
  user_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  postcode: string | null;
  read: boolean;
  created_at: string;
}

export interface CachedDataRow {
  id: string;
  source: string;
  endpoint: string;
  data: Record<string, unknown>;
  fetched_at: string;
  expires_at: string;
}

export interface PinnedLocationRow {
  id: string;
  user_id: string;
  type: PinnedLocationType;
  label: string;
  lat: number;
  lng: number;
  postcode: string | null;
  /** PostGIS geography point, stored as WKT or GeoJSON. Queries use ST_* functions. */
  geog?: unknown;
}

// ─── Insert / Update helpers ───

export type UserProfileInsert = Omit<UserProfileRow, "id" | "created_at" | "updated_at">;
export type UserProfileUpdate = Partial<UserProfileInsert>;

export type AlertInsert = Omit<AlertRow, "id" | "created_at">;
export type AlertUpdate = Partial<Pick<AlertRow, "read">>;

export type CachedDataInsert = Omit<CachedDataRow, "id">;
export type CachedDataUpdate = Partial<Pick<CachedDataRow, "data" | "fetched_at" | "expires_at">>;

export type PinnedLocationInsert = Omit<PinnedLocationRow, "id" | "geog">;
export type PinnedLocationUpdate = Partial<Omit<PinnedLocationInsert, "user_id">>;

// ─── Supabase Database type (compatible with @supabase/supabase-js generic) ───

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfileRow;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      alerts: {
        Row: AlertRow;
        Insert: AlertInsert;
        Update: AlertUpdate;
      };
      cached_data: {
        Row: CachedDataRow;
        Insert: CachedDataInsert;
        Update: CachedDataUpdate;
      };
      pinned_locations: {
        Row: PinnedLocationRow;
        Insert: PinnedLocationInsert;
        Update: PinnedLocationUpdate;
      };
    };
  };
}
