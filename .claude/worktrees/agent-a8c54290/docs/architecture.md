# OzPulse Dashboard -- System Architecture

## Monorepo Structure

```
ozpulse-dashboard/
├── apps/
│   └── web/                          # Next.js 15 App Router application
│       ├── src/
│       │   ├── app/                   # App Router: pages, layouts, API routes
│       │   │   ├── api/               # Route Handlers (REST endpoints)
│       │   │   │   ├── health/        # GET /api/health
│       │   │   │   ├── user/          # User-related endpoints
│       │   │   │   │   └── profile/   # GET/PUT /api/user/profile
│       │   │   │   ├── layers/        # Per-layer data endpoints (added by agents)
│       │   │   │   │   ├── power/
│       │   │   │   │   ├── real-estate/
│       │   │   │   │   ├── crime/
│       │   │   │   │   └── ...
│       │   │   │   └── alerts/        # GET/POST /api/alerts
│       │   │   ├── globals.css        # Tailwind v4 theme + dark mode
│       │   │   ├── layout.tsx         # Root layout (providers, metadata)
│       │   │   └── page.tsx           # Dashboard entry point
│       │   ├── components/
│       │   │   ├── layers/            # Per-layer UI components (lazy-loaded)
│       │   │   │   ├── layer-template.tsx
│       │   │   │   ├── power-energy/
│       │   │   │   ├── real-estate/
│       │   │   │   └── ...
│       │   │   ├── layout/            # Shell: sidebar, top-bar, detail-panel, alert-feed
│       │   │   ├── map/               # MapLibre container + LayerManager context
│       │   │   ├── ui/                # shadcn/ui primitives
│       │   │   └── widgets/           # Top-bar widgets (mortgage, fuel, risk)
│       │   ├── hooks/                 # Custom React hooks (data fetching, etc.)
│       │   ├── lib/                   # Utilities, API clients, constants
│       │   └── stores/                # Zustand stores (client state)
│       │       ├── user-store.ts      # User profile + localStorage persistence
│       │       ├── layer-store.ts     # Which layers are enabled
│       │       └── map-store.ts       # Map viewport, selected feature, alerts
│       ├── public/                    # Static assets
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── shared/                        # Cross-package types, Zod schemas, constants
│   │   └── src/
│   │       ├── index.ts               # Re-exports everything
│   │       ├── schemas.ts             # Zod validation schemas
│   │       └── types/
│   │           ├── layers.ts          # LayerId, LayerConfig, LAYER_CONFIGS
│   │           ├── alerts.ts          # Alert, AlertSeverity, AlertCategory
│   │           ├── map.ts             # MapViewState, MapLayerSource, MapPin
│   │           ├── user-profile.ts    # UserProfile, AlertThresholds, DashboardWidgets
│   │           ├── api.ts             # ApiResponse<T>, ApiError, PaginatedResponse
│   │           └── energy.ts          # GeneratorSite, FuelPrice, GridSnapshot (etc.)
│   ├── database/                      # Supabase client (simple, env-based)
│   │   └── src/
│   │       ├── client.ts
│   │       └── index.ts
│   └── db/                            # Typed Supabase client + schema definitions
│       └── src/
│           ├── client.ts              # createClient<Database>()
│           ├── schema.ts              # Database type (tables, rows, inserts)
│           └── index.ts
├── docs/
│   ├── tech-stack.md                  # Dependency inventory
│   ├── architecture.md                # This file
│   └── integration-guide.md           # Agent onboarding instructions
├── PROJECT-BRIEF.md                   # Product requirements + persona
├── turbo.json                         # Turborepo pipeline config
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
├── .env.example
└── package.json                       # Root workspace config
```

## Data Flow

```
External APIs (AEMO, Domain, ABS, Geoscience AU, etc.)
        │
        v
Next.js Route Handlers (apps/web/src/app/api/)
  - Fetch from external APIs
  - Validate with Zod schemas
  - Transform to internal types
  - Cache in Supabase (cached_data table) or return directly
        │
        v
TanStack Query (client-side)
  - Each layer has its own query key: ["layer", layerId, postcode]
  - staleTime per layer (energy: 5min, real-estate: 1hr, crime: 24hr)
  - gcTime: 30min (keeps data in memory for quick tab switches)
  - refetchInterval: layer-specific (see LAYER_CONFIGS.refreshIntervalMs)
  - Automatic retry (2 attempts) with exponential backoff
        │
        v
Zustand Stores (client state)
  - user-store: profile, postcode, preferences (persisted to localStorage)
  - layer-store: which layers are active, layer configs
  - map-store: viewport (center, zoom, bearing, pitch), selected feature, alerts
        │
        v
React Components
  - LayerManager context provides overlay registration
  - Each layer component registers its sources/layers with LayerManager
  - MapContainer reads overlays from LayerManager, renders via MapLibre GL JS
  - Sidebar reads layer-store for toggle state
  - TopBar reads user-store for widget values
  - DetailPanel reads map-store for selected feature
  - AlertFeed reads map-store for alert list
```

## Layer Plugin System

Each data layer is a self-contained module in `apps/web/src/components/layers/{layer-name}/`. A layer module exports:

### Required Exports

```typescript
// 1. Layer identifier constant
export const LAYER_ID: LayerId = "power-energy";

// 2. Panel component -- renders in the sidebar/detail area when layer is active
export function LayerPanel(props: { postcode: string; visible: boolean }): JSX.Element;

// 3. Map sources -- GeoJSON or tile sources to add to the map
export function getMapSources(): Record<string, MapLayerSource>;

// 4. Map layers -- MapLibre style layer definitions
export function getMapLayers(): MapLibreLayerSpec[];
```

### Registration Flow

1. The layer component is **lazy-loaded** via `React.lazy()` or Next.js `dynamic()`.
2. When the user toggles a layer ON in the sidebar, `layer-store.enableLayer(id)` fires.
3. The `Dashboard` component renders the layer's `LayerPanel` (conditionally based on active state).
4. Inside `LayerPanel`, the component calls `useLayerManager().registerOverlay()` to push its map data into the LayerManager context.
5. `MapContainer` reads all registered overlays from LayerManager and applies them as MapLibre sources and layers.
6. When the layer is toggled OFF, `removeOverlay()` is called (via a `useEffect` cleanup), and the map sources/layers are removed.

### Layer Lifecycle

```
User toggles layer ON
  -> layer-store.enableLayer(id)
  -> Dashboard renders <LayerPanel visible={true} />
  -> LayerPanel mounts, fires TanStack Query for data
  -> On data load, calls registerOverlay({ id, type, data, visible: true, zIndex })
  -> MapContainer picks up the new overlay, adds source + layer to MapLibre map
  -> Layer panel renders sidebar charts/info

User toggles layer OFF
  -> layer-store.disableLayer(id)
  -> LayerPanel's useEffect cleanup calls removeOverlay(id)
  -> MapContainer removes source + layer from map
  -> LayerPanel unmounts
```

## Caching Strategy

### TanStack Query (Client)

| Layer Category | staleTime | gcTime | refetchInterval | Rationale |
|----------------|-----------|--------|-----------------|-----------|
| Power & Energy | 5 min | 30 min | 5 min | AEMO NEM data updates every 5 minutes |
| Real Estate | 1 hr | 2 hr | 1 hr | Property listings change infrequently |
| Crime & Safety | 24 hr | 24 hr | 24 hr | ABS/police data is monthly/quarterly |
| Immigration | 24 hr | 24 hr | 24 hr | Census and visa data is periodic |
| Infrastructure | 24 hr | 24 hr | 24 hr | Project stages change infrequently |
| Mining | 1 hr | 2 hr | 1 hr | Commodity prices update hourly |
| Leisure | 24 hr | 24 hr | 24 hr | Events data is daily |
| Traffic | 5 min | 15 min | 5 min | Live transport data |

Default TanStack Query config (in `providers.tsx`):
```typescript
{
  staleTime: 60_000,        // 1 minute default
  retry: 2,                 // Retry failed requests twice
  refetchOnWindowFocus: false,  // Avoid unnecessary refetches
}
```

### Server-Side Cache (Supabase)

The `cached_data` table stores API responses with expiry:
- Route handlers check `cached_data` before calling external APIs
- If `expires_at > now()`, return cached data
- If expired or missing, fetch from external API, store in `cached_data`, return fresh data
- This reduces external API calls and provides offline fallback data

### Offline Support (Future)

Service worker registration for:
- Caching map tiles (OpenStreetMap) for offline map panning
- Caching last-known API responses for each enabled layer
- Background sync for alert checks when connection is restored

Not implemented in MVP. TanStack Query's `gcTime` provides partial offline support by keeping stale data available.

## Authentication

### Primary: Clerk (MVP)

Clerk provides hosted authentication with minimal setup:

1. Add `<ClerkProvider>` to root layout
2. Use `<SignIn />` and `<SignUp />` components
3. Middleware protects API routes and pages
4. Webhook syncs user creation to Supabase `user_profiles` table
5. `auth()` helper in Route Handlers to get current user

Benefits for MVP:
- Pre-built UI (sign-in, sign-up, user profile)
- Social login (Google, GitHub) out of the box
- Session management handled by Clerk
- No database tables needed for auth

### Fallback: NextAuth v5

If self-hosted auth is required:
1. Configure `auth.ts` with Supabase adapter
2. Use credentials provider or OAuth providers
3. Session stored in Supabase
4. More control, more setup

### Auth Flow

```
User visits dashboard
  -> Clerk middleware checks session
  -> If unauthenticated: redirect to /sign-in
  -> If authenticated: render dashboard
  -> Clerk session includes userId
  -> Route Handlers use auth() to get userId
  -> userId maps to user_profiles.id in Supabase
```

## Map Architecture

### MapLibre GL JS

The map uses MapLibre GL JS (`^5.1.0`), an open-source vector/raster map renderer.

**Basemap**: OpenStreetMap raster tiles for MVP
```
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

**Default View**: Australia centred
```typescript
{
  longitude: 133.7751,
  latitude: -25.2744,
  zoom: 4,
}
```

**Layer Rendering**: Each layer adds sources and style layers to the MapLibre map instance:
- `geojson` sources for point/polygon data (generator sites, property listings)
- `raster` sources for heatmap tiles
- `vector` sources for dense spatial data (crime by SA3)

**Interaction**:
- Click on map features triggers `onFeatureClick` -> opens DetailPanel
- Hover shows tooltip with feature summary
- Map viewport changes sync to `map-store` (debounced)

### Australian Spatial Data

- Postcodes: 4-digit Australian postcodes (0200-9999)
- Statistical areas: SA1, SA2, SA3, SA4 (ABS ASGS)
- PostGIS queries: `ST_Contains`, `ST_DWithin` for radius search, `ST_Intersects` for polygon overlap
- Coordinate reference system: EPSG:4326 (WGS 84)

## Database Architecture

### Supabase PostgreSQL + PostGIS

Tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `user_profiles` | User settings and preferences | `id`, `postcode`, `mortgage_value`, `vehicle_efficiency`, `alert_thresholds` |
| `alerts` | User-specific notifications | `id`, `user_id`, `layer_id`, `severity`, `title`, `message` |
| `cached_data` | Server-side API response cache | `layer_id`, `data_key`, `data` (JSONB), `expires_at` |

Future tables (added by domain agents):
- `generator_sites` (PostGIS point geometry)
- `property_listings` (PostGIS point geometry)
- `crime_stats` (keyed by SA3 + period)
- `migration_data` (keyed by SA4 + period)
- `infra_projects` (PostGIS point geometry)
- `mine_sites` (PostGIS point geometry)

All spatial tables use `geography(Point, 4326)` columns for PostGIS indexing.

### Row Level Security

- All tables have RLS enabled
- `user_profiles`: users can only read/write their own row
- `alerts`: users can only read/dismiss their own alerts
- `cached_data`: read-only for authenticated users (written by server-side functions)

## API Routes

All API routes live in `apps/web/src/app/api/` as Next.js Route Handlers.

### Route Structure

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | Health check (returns status + timestamp) |
| `/api/user/profile` | GET | Get current user's profile |
| `/api/user/profile` | PUT | Update current user's profile |
| `/api/layers/power/generators` | GET | Generator site data |
| `/api/layers/power/fuel-prices` | GET | Fuel price data by postcode |
| `/api/layers/real-estate/listings` | GET | Property listings by postcode |
| `/api/layers/crime/stats` | GET | Crime statistics by SA3/postcode |
| `/api/layers/immigration/flows` | GET | Migration flow data |
| `/api/layers/infrastructure/projects` | GET | Infrastructure project data |
| `/api/layers/mining/sites` | GET | Mine site data |
| `/api/layers/leisure/events` | GET | Events and leisure data |
| `/api/alerts` | GET | Get user's alerts |
| `/api/alerts` | POST | Create an alert |

### Route Handler Pattern

Every route handler follows this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  postcode: z.string().regex(/^\d{4}$/),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // 1. Check cache
    // 2. If miss, fetch from external API
    // 3. Validate response with Zod
    // 4. Store in cache
    // 5. Return typed response

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Import Aliases

The `apps/web/tsconfig.json` defines:
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Usage:
```typescript
import { useLayerStore } from "@/stores/layer-store";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
```

Cross-package imports use the workspace package name:
```typescript
import type { LayerId, UserProfile } from "@ozpulse/shared";
import { supabase } from "@ozpulse/database";
import { createClient } from "@ozpulse/db";
```
