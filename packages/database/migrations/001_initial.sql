-- OzPulse Dashboard: Initial database migration
-- Requires PostGIS extension for geography columns

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ───

CREATE TYPE pinned_location_type AS ENUM ('home', 'work', 'school', 'other');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE alert_type AS ENUM (
  'fuel-price',
  'crime-index',
  'demographic-shift',
  'coal-gas-share',
  'property-value',
  'general'
);

-- ─── User Profiles ───

CREATE TABLE user_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  postcode       VARCHAR(4) NOT NULL CHECK (postcode ~ '^\d{4}$'),
  mortgage_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
  mortgage_remaining NUMERIC(14, 2),
  net_worth      NUMERIC(14, 2),
  vehicle_efficiency NUMERIC(5, 2),          -- litres per 100 km
  commute_km     NUMERIC(8, 2),
  school_postcode VARCHAR(4) CHECK (school_postcode IS NULL OR school_postcode ~ '^\d{4}$'),
  work_postcode   VARCHAR(4) CHECK (work_postcode IS NULL OR work_postcode ~ '^\d{4}$'),
  alert_thresholds JSONB NOT NULL DEFAULT '{
    "fuel_value_of_work_ratio": null,
    "crime_index_rise": null,
    "demographic_shift_percent": 3,
    "coal_gas_share_floor": null
  }'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Alerts ───

CREATE TABLE alerts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type       alert_type NOT NULL DEFAULT 'general',
  severity   alert_severity NOT NULL DEFAULT 'info',
  title      VARCHAR(256) NOT NULL,
  message    TEXT NOT NULL,
  postcode   VARCHAR(4) CHECK (postcode IS NULL OR postcode ~ '^\d{4}$'),
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_user_unread ON alerts(user_id) WHERE read = FALSE;

-- ─── Cached Data (API response cache) ───

CREATE TABLE cached_data (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source     VARCHAR(128) NOT NULL,
  endpoint   VARCHAR(512) NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (source, endpoint)
);

CREATE INDEX idx_cached_data_source_endpoint ON cached_data(source, endpoint);
CREATE INDEX idx_cached_data_expires_at ON cached_data(expires_at);

-- ─── Pinned Locations ───

CREATE TABLE pinned_locations (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id  UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type     pinned_location_type NOT NULL DEFAULT 'other',
  label    VARCHAR(128) NOT NULL,
  lat      DOUBLE PRECISION NOT NULL,
  lng      DOUBLE PRECISION NOT NULL,
  postcode VARCHAR(4) CHECK (postcode IS NULL OR postcode ~ '^\d{4}$'),
  -- PostGIS geography column for spatial queries (e.g. radius search)
  geog     GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED
);

CREATE INDEX idx_pinned_locations_user_id ON pinned_locations(user_id);
CREATE INDEX idx_pinned_locations_geog ON pinned_locations USING GIST(geog);

-- ─── Row Level Security ───

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_locations ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
-- (auth.uid() is a Supabase helper that returns the authenticated user's ID)

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own pinned locations"
  ON pinned_locations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pinned locations"
  ON pinned_locations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pinned locations"
  ON pinned_locations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own pinned locations"
  ON pinned_locations FOR DELETE
  USING (user_id = auth.uid());

-- Cached data is readable by all authenticated users, writable by service role only
CREATE POLICY "Authenticated users can read cached data"
  ON cached_data FOR SELECT
  USING (true);
