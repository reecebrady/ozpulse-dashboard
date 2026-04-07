export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          postcode: string;
          mortgage_value: number;
          mortgage_remaining: number | null;
          mortgage_term_years: number;
          interest_rate: number;
          vehicle_efficiency: number;
          commute_distance_km: number;
          work_postcode: string | null;
          school_postcodes: string[];
          hourly_wage: number | null;
          alert_thresholds: Record<string, number>;
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
          title: string;
          message: string;
          postcode: string | null;
          read: boolean;
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
    };
  };
}
