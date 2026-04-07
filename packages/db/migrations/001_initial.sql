-- OzPulse Dashboard - Initial Schema
-- PostGIS-enabled schema for spatial queries

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- user_profiles: stores user personalisation data
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  postcode VARCHAR(4) NOT NULL CHECK (postcode ~ '^\d{4}$'),
  home_location GEOMETRY(Point, 4326),

  -- Mortgage details
  property_value NUMERIC(12, 2) DEFAULT 0,
  loan_remaining NUMERIC(12, 2) DEFAULT 0,
  remaining_term_years INTEGER DEFAULT 25 CHECK (remaining_term_years >= 0 AND remaining_term_years <= 30),
  interest_rate NUMERIC(5, 2) DEFAULT 6.0 CHECK (interest_rate >= 0 AND interest_rate <= 20),
  net_worth NUMERIC(14, 2) DEFAULT 550000,

  -- Vehicle / commute
  vehicle_fuel_efficiency NUMERIC(5, 2) DEFAULT 8.0, -- L/100km
  fuel_type VARCHAR(10) DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel', 'lpg', 'electric', 'hybrid')),
  weekly_commute_km NUMERIC(8, 2) DEFAULT 50,
  hourly_wage NUMERIC(8, 2),

  -- Workplace and school postcodes
  work_postcode VARCHAR(4) CHECK (work_postcode IS NULL OR work_postcode ~ '^\d{4}$'),
  school_postcodes VARCHAR(4)[] DEFAULT '{}',

  -- Alert thresholds (JSONB for flexibility)
  alert_thresholds JSONB NOT NULL DEFAULT '{
    "fuelValueOfWorkRatio": 0.2,
    "crimeIndexThreshold": 100,
    "demographicShiftPercent": 3,
    "coalGasShareMinPercent": 50
  }'::jsonb,

  -- Privacy: opt-in cloud sync
  cloud_sync_enabled BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_postcode ON user_profiles (postcode);
CREATE INDEX idx_user_profiles_home_location ON user_profiles USING GIST (home_location);

-- ============================================================
-- alerts: per-user alert records
-- ============================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  layer_id VARCHAR(50) NOT NULL,
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  category VARCHAR(30) NOT NULL DEFAULT 'general',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  postcode VARCHAR(4) CHECK (postcode IS NULL OR postcode ~ '^\d{4}$'),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON alerts (user_id);
CREATE INDEX idx_alerts_user_unread ON alerts (user_id) WHERE read = FALSE;
CREATE INDEX idx_alerts_layer_id ON alerts (layer_id);
CREATE INDEX idx_alerts_postcode ON alerts (postcode) WHERE postcode IS NOT NULL;
CREATE INDEX idx_alerts_created_at ON alerts (created_at DESC);

-- ============================================================
-- cached_data: layer data cache with TTL
-- ============================================================
CREATE TABLE cached_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layer_id VARCHAR(50) NOT NULL,
  data_key VARCHAR(200) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (layer_id, data_key)
);

CREATE INDEX idx_cached_data_lookup ON cached_data (layer_id, data_key);
CREATE INDEX idx_cached_data_expires ON cached_data (expires_at);

-- ============================================================
-- saved_locations: user pinned locations (home, work, school)
-- ============================================================
CREATE TABLE saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('home', 'work', 'school', 'custom')),
  label VARCHAR(100),
  postcode VARCHAR(4) NOT NULL CHECK (postcode ~ '^\d{4}$'),
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_locations_user_id ON saved_locations (user_id);
CREATE INDEX idx_saved_locations_geom ON saved_locations USING GIST (geom);
CREATE INDEX idx_saved_locations_type ON saved_locations (user_id, location_type);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_saved_locations_updated_at
  BEFORE UPDATE ON saved_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row-level security policies (Supabase auth)
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY user_profiles_self ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY alerts_self ON alerts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY saved_locations_self ON saved_locations
  FOR ALL USING (auth.uid() = user_id);

-- cached_data is publicly readable (no user data)
ALTER TABLE cached_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY cached_data_read ON cached_data
  FOR SELECT USING (TRUE);
CREATE POLICY cached_data_write ON cached_data
  FOR ALL USING (TRUE); -- Service role only in practice
