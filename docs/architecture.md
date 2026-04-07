# OzPulse System Architecture

## Monorepo Structure

```
ozpulse-dashboard/
├── apps/
│   └── web/                          # Next.js 15 App Router application
│       ├── app/                      # Root route (duplicate of src/app, to be consolidated)
│       │   ├── layout.tsx            # Root HTML layout
│       │   ├── page.tsx              # Landing page
│       │   └── globals.css           # Tailwind theme
│       ├── src/
│       │   ├── app/                  # Primary App Router directory
│       │   │   ├── layout.tsx        # Root layout with metadata
│       │   │   ├── page.tsx          # Dashboard entry point
│       │   │   ├── globals.css       # Tailwind CSS 4 theme tokens
│       │   │   └── api/              # Route handlers (created per layer)
│       │   │       ├── energy/       # AEMO proxy + aggregation
│       │   │       ├── property/     # Domain/CoreLogic proxy
│       │   │       ├── crime/        # ABS + state police proxy
│       │   │       ├── demographics/ # ABS migration proxy
│       │   │       ├── infrastructure/ # Infrastructure Australia proxy
│       │   │       ├── mining/       # Geoscience Australia proxy
│       │   │       ├── leisure/      # Tourism + events proxy
│       │   │       └── alerts/       # Alert CRUD + threshold checks
│       │   ├── components/
│       │   │   ├── layers/           # Layer plugin components
│       │   │   │   ├── layer-template.tsx   # Canonical template (copy this)
│       │   │   │   ├── power-energy/       # Agent 4
│       │   │   │   ├── real-estate/        # Agent 5
│       │   │   │   ├── crime-safety/       # Agent 6
│       │   │   │   ├── immigration/        # Agent 6
│       │   │   │   ├── infrastructure/     # Agent 4
│       │   │   │   ├── mining-resources/   # Agent 7
│       │   │   │   ├── leisure-lifestyle/  # Agent 7
│       │   │   │   └── global-index/       # Agent 7
│       │   │   ├── map/              # Map core
│       │   │   │   ├── map-container.tsx    # MapLibre GL JS mount point
│       │   │   │   └── LayerManager.tsx     # Overlay registry context
│       │   │   ├── layout/           # App shell
│       │   │   │   ├── dashboard.tsx        # Main layout orchestrator
│       │   │   │   ├── sidebar.tsx          # Layer toggle sidebar
│       │   │   │   ├── top-bar.tsx          # Widgets bar (equity, fuel, risk)
│       │   │   │   ├── detail-panel.tsx     # Right-side detail overlay
│       │   │   │   ├── alert-feed.tsx       # Bottom alert ticker
│       │   │   │   └── providers.tsx        # QueryClientProvider wrapper
│       │   │   ├── ui/               # shadcn/ui components (Agent 2)
│       │   │   └── widgets/          # Top bar widget components
│       │   ├── lib/                  # Utilities
│       │   │   ├── utils.ts          # cn() helper
│       │   │   ├── hooks/            # Custom hooks (usePostcode, useAlerts, etc.)
│       │   │   └── api-clients/      # Typed fetch wrappers for external APIs
│       │   └── stores/               # Zustand stores
│       │       ├── layer-store.ts    # Layer toggle state + config
│       │       ├── map-store.ts      # Viewport, selected pin, alerts
│       │       ├── user-profile.ts   # Persisted user profile
│       │       └── user-store.ts     # User + dashboard widgets
│       ├── next.config.ts            # transpilePackages for workspace deps
│       ├── postcss.config.js         # Tailwind CSS 4 PostCSS plugin
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                       # @ozpulse/shared
│   │   └── src/
│   │       ├── index.ts              # Re-exports
│   │       ├── schemas.ts            # Zod schemas (postcode, user profile)
│   │       ├── types.ts              # Core domain types
│   │       └── types/
│   │           ├── layers.ts         # LayerId union, LayerConfig, LAYER_CONFIGS
│   │           ├── alerts.ts         # Alert, AlertSeverity, AlertCategory
│   │           └── map.ts            # MapViewState, MapLayerSource, MapPin
│   │
│   ├── db/                           # @ozpulse/db
│   │   └── src/
│   │       ├── index.ts              # Re-exports
│   │       ├── client.ts             # Typed Supabase client
│   │       └── schema.ts             # Database type definitions (Supabase generated)
│   │
│   └── database/                     # @ozpulse/database (legacy, to consolidate with db/)
│       └── src/
│           ├── index.ts
│           └── client.ts             # Simpler Supabase client
│
├── docs/                             # You are here
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── integration-guide.md
│   └── data-sources.md
│
├── PROJECT-BRIEF.md                  # Master brief with persona, layers, agent assignments
├── turbo.json                        # Turborepo task config
├── tsconfig.base.json                # Shared TS config
├── tsconfig.json                     # Root TS config
├── pnpm-workspace.yaml               # Workspace package globs
├── package.json                      # Root scripts, engine constraints
├── .env.example                      # Required environment variables
└── .gitignore
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        External APIs                             │
│  AEMO  Domain  ABS  Police  InfraAus  GeoSci  BITRE  Tourism   │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Next.js API Route Handlers         │
│   /api/energy, /api/property, etc.   │
│                                      │
│   - Proxy external APIs              │
│   - Validate with Zod                │
│   - Transform to internal types      │
│   - Cache in Supabase (cached_data)  │
│   - Check alert thresholds           │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   TanStack Query                     │
│                                      │
│   queryKey: ["energy", postcode]     │
│   staleTime: per layer type          │
│   refetchInterval: per layer type    │
│   gcTime: Infinity (offline)         │
│                                      │
│   Deduplication + background refetch │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Zustand Stores                     │
│                                      │
│   layer-store: active layers, config │
│   map-store: viewport, pins, alerts  │
│   user-store: profile, widgets       │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   React Components                   │
│                                      │
│   Dashboard -> Sidebar (toggles)     │
│             -> TopBar (widgets)      │
│             -> MapContainer          │
│             -> DetailPanel           │
│             -> AlertFeed             │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   MapLibre GL JS                     │
│                                      │
│   Sources: GeoJSON, vector tiles     │
│   Layers: circle, fill, heatmap,    │
│           line, symbol, fill-extrusion│
│                                      │
│   LayerManager registers/removes     │
│   overlays as layers toggle on/off   │
└──────────────────────────────────────┘
```

## Layer Plugin System

Each layer is a self-contained module. The system uses a plugin pattern where layers register their map sources, map layers, and UI panel with the central `LayerManager`.

### Layer Module Contract

Every layer module at `components/layers/{layer-name}/index.tsx` must export:

```typescript
// 1. Layer identifier
export const LAYER_ID: LayerId = "power-energy";

// 2. Panel component -- rendered in the sidebar/detail panel when the layer is active
export function LayerPanel({ postcode, visible }: LayerPanelProps): JSX.Element;

// 3. Map sources -- GeoJSON or vector tile sources for MapLibre
export function getMapSources(): Record<string, MapLibreSourceSpec>;

// 4. Map layers -- MapLibre style layer definitions
export function getMapLayers(): MapLibreLayerSpec[];
```

### Registration Flow

```
1. User toggles layer in Sidebar
   └─> layer-store.toggleLayer("power-energy")

2. Dashboard reads activeLayerIds from layer-store
   └─> Passes activeLayers Set to MapContainer

3. MapContainer / LayerManager detects new active layer
   └─> Dynamically imports components/layers/power-energy/index.tsx
   └─> Calls getMapSources() -> adds sources to MapLibre map
   └─> Calls getMapLayers() -> adds style layers to MapLibre map

4. Layer's internal useQuery hook starts fetching data
   └─> Updates GeoJSON source data as responses arrive
   └─> Background refetch keeps data fresh

5. User toggles layer off
   └─> LayerManager removes sources and layers from MapLibre
   └─> useQuery stops refetching (enabled: false)
```

### LayerManager Context

The `LayerManager` (`components/map/LayerManager.tsx`) provides a React context with:

- `registerOverlay(overlay)` -- Add a GeoJSON/tile/heatmap overlay
- `removeOverlay(id)` -- Remove an overlay by ID
- `toggleOverlay(id)` -- Toggle visibility without removing data

Each overlay has:
```typescript
interface LayerOverlay {
  id: string;
  type: "geojson" | "tiles" | "markers" | "heatmap";
  data: unknown;
  visible: boolean;
  zIndex: number;
}
```

## Caching Strategy

### TanStack Query Cache Configuration

Each layer type has tuned cache parameters based on how frequently the underlying data changes:

| Layer Type | `staleTime` | `refetchInterval` | `gcTime` | Rationale |
|---|---|---|---|---|
| **Power & Energy** | 30s | 30s | 5min | AEMO dispatches update every 5 min; fuel prices change throughout the day |
| **Traffic & Commute** | 30s | 60s | 5min | Live transport feeds, peak-hour sensitivity |
| **Real Estate** | 1hr | 1hr | 24hr | Property listings update a few times daily |
| **Mining & Resources** | 1hr | 1hr | 24hr | Commodity prices update hourly |
| **Health** | 1hr | 1hr | 24hr | Hospital wait times update hourly |
| **Media Sentiment** | 1hr | 1hr | 6hr | Headline aggregation, not real-time |
| **Fuel Prices** | 5min | 5min | 30min | ACCC FuelWatch updates multiple times per day |
| **Crime & Safety** | 24hr | 24hr | 7d | ABS releases monthly/quarterly |
| **Immigration** | 24hr | 24hr | 7d | ABS releases quarterly |
| **Infrastructure** | 24hr | 24hr | 7d | Project pipeline updates infrequently |
| **Leisure & Lifestyle** | 24hr | 24hr | 7d | Events/parks data is relatively stable |
| **Education** | 24hr | 24hr | 7d | NAPLAN results are annual |
| **Gov Performance** | 24hr | 24hr | 7d | Parliamentary data updates per sitting |
| **Economic Pressure** | 24hr | 24hr | 7d | ABS economic indicators are monthly/quarterly |

### Server-Side Caching

The `cached_data` table in Supabase acts as a server-side cache:

```sql
CREATE TABLE cached_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  layer_id TEXT NOT NULL,
  data_key TEXT NOT NULL,           -- e.g., "energy:nsw:2024-04-07"
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(layer_id, data_key)
);
```

API route handlers check `cached_data` before hitting external APIs. If the cache is fresh, they return the cached response. This:
- Reduces external API calls (important for rate-limited sources like Domain API)
- Provides a fallback when external APIs are down
- Enables historical data queries ("what was the energy mix last Tuesday?")

## Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  User   │────>│  Next.js    │────>│  NextAuth.js │────>│  Google  │
│ Browser │     │  Middleware  │     │  /api/auth/* │     │  OAuth   │
└─────────┘     └──────┬──────┘     └──────┬───────┘     └──────────┘
                       │                   │
                       │                   ▼
                       │            ┌──────────────┐
                       │            │  Supabase    │
                       │            │  sessions    │
                       │            │  + accounts  │
                       │            └──────────────┘
                       │
                       ▼
                ┌──────────────┐
                │  Protected   │
                │  Routes      │
                │  /dashboard  │
                │  /api/*      │
                └──────────────┘
```

### Flow

1. **Unauthenticated user** visits `/` -- sees a landing page with sign-in prompt
2. **Sign in** via Google OAuth (primary) or email/password
3. **NextAuth.js** creates a session, stores it in Supabase via the adapter
4. **Middleware** (`middleware.ts`) checks session on every request to `/dashboard` and `/api/*`
5. **Server components** call `auth()` to get the current user
6. **Client components** use `useSession()` from next-auth/react
7. **User profile** is created on first sign-in with defaults (postcode prompt on onboarding)

### Authorisation

- Row Level Security (RLS) on Supabase tables ensures users can only read/write their own data
- API route handlers validate the session before processing requests
- No admin role in MVP; all users have the same permissions

## Alert System Architecture

```
┌─────────────────────────────────────────────────┐
│                Alert Pipeline                    │
│                                                  │
│  1. Data Fetch (TanStack Query)                 │
│     └─> New energy/crime/property data arrives  │
│                                                  │
│  2. Threshold Check (in API route or client)    │
│     └─> Compare new value against user's        │
│         alertThresholds from profile             │
│     └─> e.g., fuelValueOfWorkRatio > threshold  │
│                                                  │
│  3. Alert Generation                            │
│     └─> Create Alert object:                    │
│         { severity, category, title, message }  │
│                                                  │
│  4. Storage                                     │
│     └─> INSERT into Supabase alerts table       │
│     └─> Zustand map-store.addAlert() for UI     │
│                                                  │
│  5. Notification                                │
│     └─> In-app: AlertFeed component shows it    │
│     └─> Push: Web Push API (service worker)     │
│     └─> Supabase Realtime for cross-tab sync    │
└─────────────────────────────────────────────────┘
```

### Alert Types

| Category | Trigger Example | Default Threshold |
|---|---|---|
| `fuel` | Fuel cost exceeds X% of hourly wage | `fuelValueOfWorkRatio > 0.15` |
| `crime` | Crime index in postcode rises by X% | `crimeIndexRise > 5` |
| `property` | Median price in postcode drops by X% | configurable |
| `demographics` | Net migration shift exceeds X% | `demographicShiftPercent > 3` |
| `energy` | Coal/gas share drops below X% | `coalGasShareFloor > 20` |
| `infrastructure` | New project approved near postcode | proximity-based |
| `general` | System notifications | always shown |

### Severity Levels

- **info** -- Informational, no action needed (blue indicator)
- **warning** -- Worth attention, threshold approaching (yellow indicator)
- **critical** -- Immediate attention, threshold breached significantly (red indicator)

### User Configuration

Users configure thresholds via their profile (`alertThresholds` field in `UserProfile`). The `useUserProfile` store persists these to localStorage and syncs to Supabase.

## Offline Support Strategy

### Service Worker

A service worker (to be implemented by Agent 8) provides three levels of offline support:

#### Level 1: Cached Map Tiles

```
Strategy: Cache-First with network fallback
Scope: Map tile requests (*.pbf, *.png from tile servers)
Behaviour: Tiles the user has already viewed are served from cache.
           New tile requests fail gracefully with a grey placeholder.
```

#### Level 2: Cached API Responses

```
Strategy: Stale-While-Revalidate
Scope: /api/* responses
Behaviour: Serve the last successful response immediately.
           Attempt a network fetch in the background.
           If network succeeds, update the cache.
           If network fails, the stale data remains.
```

#### Level 3: TanStack Query Persister

```
Strategy: gcTime set to Infinity for critical queries
Scope: Energy, crime, property data
Behaviour: TanStack Query keeps stale data in memory.
           On reconnect, background refetch updates all stale queries.
           UI shows a "Last updated: X minutes ago" indicator.
```

### Offline Indicators

- A banner appears at the top of the dashboard when offline: "You are offline. Showing cached data."
- Each widget shows "Last updated: ..." timestamp
- Map tiles that failed to load show a subtle grid pattern

## Database Schema Design

### Core Tables

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Australian postcode geometries (pre-loaded from ABS)
CREATE TABLE postcodes (
  postcode CHAR(4) PRIMARY KEY,
  suburb_name TEXT NOT NULL,
  state TEXT NOT NULL,          -- NSW, VIC, QLD, SA, WA, TAS, NT, ACT
  geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
  centroid GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_Centroid(geom)) STORED,
  sa3_code TEXT,
  sa4_code TEXT,
  population INT
);
CREATE INDEX idx_postcodes_geom ON postcodes USING GIST(geom);
CREATE INDEX idx_postcodes_state ON postcodes(state);

-- User profiles
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  postcode CHAR(4) REFERENCES postcodes(postcode),
  mortgage_value NUMERIC(12,2) DEFAULT 0,
  mortgage_remaining NUMERIC(12,2),
  mortgage_term_years INT DEFAULT 25,
  interest_rate NUMERIC(5,4) DEFAULT 0.0620,
  vehicle_efficiency NUMERIC(4,1) DEFAULT 8.0,    -- L/100km
  commute_distance_km NUMERIC(6,1) DEFAULT 0,
  work_postcode CHAR(4),
  school_postcodes TEXT[],
  hourly_wage NUMERIC(8,2),
  alert_thresholds JSONB DEFAULT '{
    "fuelValueOfWorkRatio": 0.15,
    "crimeIndexRise": 5,
    "demographicShiftPercent": 3,
    "coalGasShareFloor": 20
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Alerts
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  layer_id TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  postcode CHAR(4),
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_alerts_user ON alerts(user_id, created_at DESC);
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Server-side API response cache
CREATE TABLE cached_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  layer_id TEXT NOT NULL,
  data_key TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(layer_id, data_key)
);
CREATE INDEX idx_cached_data_lookup ON cached_data(layer_id, data_key);
CREATE INDEX idx_cached_data_expiry ON cached_data(expires_at);

-- Energy data (Agent 4)
CREATE TABLE energy_generators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  geom GEOMETRY(Point, 4326) NOT NULL,
  capacity_mw NUMERIC(8,1),
  owner TEXT,
  commissioned_date DATE,
  expected_closure_date DATE
);
CREATE INDEX idx_energy_generators_geom ON energy_generators USING GIST(geom);
CREATE INDEX idx_energy_generators_fuel ON energy_generators(fuel_type);

-- Crime data (Agent 6)
CREATE TABLE crime_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  postcode CHAR(4) REFERENCES postcodes(postcode),
  sa3_code TEXT,
  offence_type TEXT NOT NULL,
  count INT NOT NULL,
  period TEXT NOT NULL,           -- YYYY-MM
  geom GEOMETRY(Point, 4326),
  change_from_prev NUMERIC(5,2)
);
CREATE INDEX idx_crime_records_postcode ON crime_records(postcode, period);
CREATE INDEX idx_crime_records_geom ON crime_records USING GIST(geom);

-- Infrastructure projects (Agent 4)
CREATE TABLE infra_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  geom GEOMETRY(Point, 4326) NOT NULL,
  sector TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('planning', 'approved', 'construction', 'completed')),
  budget_aud NUMERIC(14,2),
  expected_jobs INT,
  completion_date DATE
);
CREATE INDEX idx_infra_projects_geom ON infra_projects USING GIST(geom);
CREATE INDEX idx_infra_projects_stage ON infra_projects(stage);

-- Mine sites (Agent 7)
CREATE TABLE mine_sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  geom GEOMETRY(Point, 4326) NOT NULL,
  commodity TEXT NOT NULL,
  production_tonnes NUMERIC(14,2),
  export_value_aud NUMERIC(14,2),
  operator TEXT
);
CREATE INDEX idx_mine_sites_geom ON mine_sites USING GIST(geom);
CREATE INDEX idx_mine_sites_commodity ON mine_sites(commodity);
```

### Spatial Query Patterns

**Find postcode for a coordinate:**
```sql
SELECT postcode, suburb_name, state
FROM postcodes
WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($lng, $lat), 4326));
```

**Find all crime records within 10km of a postcode centroid:**
```sql
SELECT cr.*
FROM crime_records cr
JOIN postcodes p ON p.postcode = $postcode
WHERE ST_DWithin(
  cr.geom::geography,
  p.centroid::geography,
  10000  -- metres
);
```

**Aggregate property data into hex grid for heatmap:**
```sql
SELECT
  ST_SnapToGrid(geom, 0.01) AS grid_point,
  AVG(price_aud) AS avg_price,
  COUNT(*) AS listing_count
FROM property_listings
WHERE state = $state
GROUP BY grid_point;
```

**Commute corridor safety analysis:**
```sql
WITH corridor AS (
  SELECT ST_Buffer(
    ST_MakeLine(
      (SELECT centroid FROM postcodes WHERE postcode = $home),
      (SELECT centroid FROM postcodes WHERE postcode = $work)
    )::geography,
    2000  -- 2km buffer
  )::geometry AS geom
)
SELECT cr.offence_type, SUM(cr.count) AS total
FROM crime_records cr, corridor
WHERE ST_Intersects(cr.geom, corridor.geom)
GROUP BY cr.offence_type;
```

## Component Hierarchy

```
RootLayout
└── Providers (QueryClientProvider)
    └── LayerManagerProvider
        └── Dashboard
            ├── Sidebar
            │   ├── Layer toggle buttons (from LAYER_CONFIGS)
            │   └── Layer panels (rendered when active)
            ├── TopBar
            │   ├── EquityWidget
            │   ├── FuelWidget
            │   └── RiskWidget
            ├── MapContainer
            │   ├── MapLibre GL JS instance
            │   ├── Layer overlays (managed by LayerManager)
            │   └── Popups / tooltips
            ├── DetailPanel (overlay, shown on feature click)
            │   └── Layer-specific charts (Recharts)
            └── AlertFeed
                └── Alert items (from map-store)
```

## Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Map tiles (required)
NEXT_PUBLIC_MAPLIBRE_STYLE_URL=https://tiles.example.com/style.json

# External API keys (required for respective layers)
DOMAIN_API_KEY=           # Domain Group property API
AEMO_API_KEY=             # AEMO energy data API

# Auth (one of these sets)
CLERK_SECRET_KEY=         # If using Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# OR
NEXTAUTH_SECRET=          # If using NextAuth.js
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```
