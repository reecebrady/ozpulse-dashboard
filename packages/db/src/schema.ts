export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          postcode: string;
          home_location: unknown | null; // PostGIS point
          property_value: number;
          loan_remaining: number;
          remaining_term_years: number;
          interest_rate: number;
          net_worth: number;
          vehicle_fuel_efficiency: number;
          fuel_type: "petrol" | "diesel" | "lpg" | "electric" | "hybrid";
          weekly_commute_km: number;
          hourly_wage: number | null;
          work_postcode: string | null;
          school_postcodes: string[];
          alert_thresholds: Record<string, number>;
          cloud_sync_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["user_profiles"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["user_profiles"]["Insert"]
        >;
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          layer_id: string;
          severity: "info" | "warning" | "critical";
          category: string;
          title: string;
          message: string;
          postcode: string | null;
          read: boolean;
          dismissed: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["alerts"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
      };
      cached_data: {
        Row: {
          id: string;
          layer_id: string;
          data_key: string;
          data: Record<string, unknown>;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["cached_data"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["cached_data"]["Insert"]>;
      };
      saved_locations: {
        Row: {
          id: string;
          user_id: string;
          location_type: "home" | "work" | "school" | "custom";
          label: string | null;
          postcode: string;
          geom: unknown | null; // PostGIS point
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["saved_locations"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["saved_locations"]["Insert"]
        >;
      };
    };
  };
}
