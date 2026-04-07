# OzPulse Integration Guide

Step-by-step instructions for Agents 2-8. Read this before writing any code.

## Quick Reference

| Task | Where to put it | Section |
|---|---|---|
| Create a new layer | `src/components/layers/{layer-name}/index.tsx` | [Creating a Layer](#creating-a-new-layer) |
| Add an API route | `src/app/api/{layer-name}/route.ts` | [API Routes](#adding-api-routes) |
| Add a TanStack Query hook | `src/lib/hooks/use-{layer-name}.ts` | [Data Fetching](#using-tanstack-query-hooks) |
| Register an alert | Call `useMapStore().addAlert()` | [Alerts](#registering-alerts) |
| Add map overlays | Use `useLayerManager().registerOverlay()` | [Map Overlays](#adding-map-overlays) |
| Update top-bar widgets | Modify `src/components/layout/top-bar.tsx` | [Widgets](#updating-top-bar-widgets) |
| Add shared types | `packages/shared/src/types/{domain}.ts` | [Types](#shared-types) |
| Write tests | `src/components/layers/{layer-name}/__tests__/` | [Testing](#testing-expectations) |

All file paths below are relative to `apps/web/` unless stated otherwise.

---

## Creating a New Layer

### Step 1: Copy the template

```bash
# From the repo root
mkdir -p apps/web/src/components/layers/{your-layer-name}
cp apps/web/src/components/layers/layer-template.tsx \
   apps/web/src/components/layers/{your-layer-name}/index.tsx
```

### Step 2: Set the layer ID

Open your new `index.tsx` and update the `LAYER_ID`:

```typescript
import type { LayerId } from "@ozpulse/shared";

export const LAYER_ID: LayerId = "power-energy"; // <-- change to your LayerId
```

Valid `LayerId` values are defined in `packages/shared/src/types/layers.ts`:
- `power-energy`
- `real-estate`
- `crime-safety`
- `immigration-demographics`
- `infrastructure`
- `mining-resources`
- `leisure-lifestyle`
- `education`
- `government-performance`
- `economic-pressure`
- `traffic-commute`
- `health`
- `media-sentiment`
- `personal-finance`

### Step 3: Implement the three exports

Every layer module must export these three things:

#### `LayerPanel` component

Rendered in the sidebar/detail area when the layer is active. Shows layer-specific data, charts, and controls.

```typescript
export function LayerPanel({ postcode, visible }: LayerPanelProps) {
  // Use your TanStack Query hook here
  const { data, isLoading } = useEnergyData(postcode);

  if (!visible) return null;
  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Power & Energy</h3>
      {/* Your charts, stats, controls */}
    </div>
  );
}
```

#### `getMapSources()` function

Returns a record of MapLibre source definitions. Called when the layer is toggled on.

```typescript
export function getMapSources(): Record<string, maplibregl.SourceSpecification> {
  return {
    "energy-generators": {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [], // Populated dynamically by your query hook
      },
    },
  };
}
```

#### `getMapLayers()` function

Returns an array of MapLibre layer style definitions. Each layer references a source from `getMapSources()`.

```typescript
export function getMapLayers(): maplibregl.LayerSpecification[] {
  return [
    {
      id: "energy-generators-circles",
      type: "circle",
      source: "energy-generators",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["get", "capacityMW"], 0, 4, 1000, 20],
        "circle-color": ["match", ["get", "fuelType"],
          "coal", "#1a1a1a",
          "gas", "#3b82f6",
          "wind", "#22c55e",
          "solar", "#eab308",
          "hydro", "#a855f7",
          "#6b7280" // default
        ],
        "circle-opacity": 0.8,
      },
    },
  ];
}
```

### Step 4: Register in layer config

The layer configs are already defined in `packages/shared/src/types/layers.ts` (`LAYER_CONFIGS` array). Verify your layer ID exists there. If you need to add a new layer ID, add it to both the `LayerId` union type and the `LAYER_CONFIGS` array.

The sidebar reads from `layer-store.ts` which has its own `DEFAULT_LAYERS` list. Ensure your layer appears in both places with consistent `id`, `name`, `description`, `icon`, and `color`.

### Step 5: Handle dynamic data updates

Your layer component should update its GeoJSON source data when new data arrives from TanStack Query:

```typescript
import { useLayerManager } from "@/components/map/LayerManager";

export function LayerPanel({ postcode, visible }: LayerPanelProps) {
  const { registerOverlay, removeOverlay } = useLayerManager();
  const { data } = useEnergyData(postcode);

  useEffect(() => {
    if (!visible || !data) return;

    registerOverlay({
      id: "energy-generators",
      type: "geojson",
      data: toGeoJSON(data), // Convert your API response to GeoJSON
      visible: true,
      zIndex: 10,
    });

    return () => removeOverlay("energy-generators");
  }, [visible, data]);

  // ... rest of component
}
```

---

## File Naming Conventions

### Layer files
```
src/components/layers/{layer-name}/
  index.tsx          # Main layer module (LayerPanel + getMapSources + getMapLayers)
  hooks.ts           # Layer-specific TanStack Query hooks
  types.ts           # Layer-specific TypeScript types (if complex)
  utils.ts           # Data transformation helpers
  __tests__/
    index.test.tsx   # Component tests
    hooks.test.ts    # Hook tests
```

Use kebab-case for directory names: `power-energy`, `real-estate`, `crime-safety`.

### API routes
```
src/app/api/{layer-name}/
  route.ts           # GET handler (main data endpoint)
  [postcode]/
    route.ts         # GET handler (postcode-specific data)
```

### Shared types
```
packages/shared/src/types/
  layers.ts          # LayerId, LayerConfig (already exists)
  alerts.ts          # Alert types (already exists)
  map.ts             # Map types (already exists)
  energy.ts          # Energy-specific types (create as needed)
  property.ts        # Property-specific types (create as needed)
  crime.ts           # Crime-specific types (create as needed)
```

### Hooks
```
src/lib/hooks/
  use-energy-data.ts
  use-property-data.ts
  use-crime-data.ts
  use-alerts.ts
  use-postcode.ts
```

---

## Adding API Routes

Use Next.js Route Handlers. Each layer gets its own directory under `src/app/api/`.

### Basic pattern

```typescript
// src/app/api/energy/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  state: z.enum(["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]).optional(),
  postcode: z.string().regex(/^\d{4}$/).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // 1. Check server-side cache (Supabase cached_data table)
    // 2. If cache miss or expired, fetch from external API
    // 3. Validate response with Zod
    // 4. Store in cache
    // 5. Return transformed data

    const data = await fetchFromAEMO(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[energy] API error:", error);
    return NextResponse.json({ error: "Failed to fetch energy data" }, { status: 500 });
  }
}
```

### Server-side caching pattern

```typescript
import { createClient } from "@ozpulse/db";

async function getCachedOrFetch<T>(
  layerId: string,
  dataKey: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const db = createClient();

  // Check cache
  const { data: cached } = await db
    .from("cached_data")
    .select("data, expires_at")
    .eq("layer_id", layerId)
    .eq("data_key", dataKey)
    .single();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.data as T;
  }

  // Fetch fresh data
  const fresh = await fetchFn();

  // Upsert cache
  await db.from("cached_data").upsert({
    layer_id: layerId,
    data_key: dataKey,
    data: fresh as Record<string, unknown>,
    expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  });

  return fresh;
}
```

### Authentication in API routes

```typescript
import { auth } from "@/auth"; // NextAuth.js config

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // session.user.id is available for user-specific queries
  // ...
}
```

---

## Using TanStack Query Hooks

### Refresh intervals

Use these constants for consistency across all layers:

```typescript
// src/lib/constants.ts (create this file)
export const REFRESH_INTERVALS = {
  REALTIME: 30_000,          // 30s -- energy, traffic
  FREQUENT: 300_000,         // 5min -- fuel prices
  HOURLY: 3_600_000,         // 1hr -- property, mining, health, media
  DAILY: 86_400_000,         // 24hr -- crime, demographics, infrastructure, education
} as const;

export const STALE_TIMES = {
  REALTIME: 30_000,
  FREQUENT: 300_000,
  HOURLY: 3_600_000,
  DAILY: 86_400_000,
} as const;
```

### Hook pattern

```typescript
// src/lib/hooks/use-energy-data.ts
import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS, STALE_TIMES } from "@/lib/constants";

interface EnergyDataParams {
  postcode?: string;
  state?: string;
  enabled?: boolean;
}

export function useEnergyData({ postcode, state, enabled = true }: EnergyDataParams) {
  return useQuery({
    queryKey: ["energy", { postcode, state }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postcode) params.set("postcode", postcode);
      if (state) params.set("state", state);

      const res = await fetch(`/api/energy?${params}`);
      if (!res.ok) throw new Error(`Energy API error: ${res.status}`);
      return res.json();
    },
    enabled,
    staleTime: STALE_TIMES.REALTIME,
    refetchInterval: REFRESH_INTERVALS.REALTIME,
    refetchOnWindowFocus: false,
  });
}
```

### Query key conventions

Use a consistent structure:
```typescript
// Layer data
["energy", { postcode, state }]
["property", { postcode, type }]
["crime", { postcode, period }]

// User-specific
["user-profile", userId]
["user-alerts", userId]

// Static/reference data
["postcodes", state]
["layer-configs"]
```

### Dependent queries

When one query depends on another (e.g., you need the user's postcode before fetching layer data):

```typescript
const { data: profile } = useUserProfile();
const { data: crimeData } = useCrimeData({
  postcode: profile?.postcode,
  enabled: !!profile?.postcode, // Only fetch when postcode is available
});
```

---

## Registering Alerts

### From a client component

Use the `map-store` to add alerts to the in-app feed:

```typescript
import { useMapStore } from "@/stores/map-store";
import { v4 as uuid } from "crypto"; // or use crypto.randomUUID()

function checkAndAlert(data: EnergyData, thresholds: AlertThresholds) {
  const mapStore = useMapStore.getState(); // Can call outside React

  if (data.coalGasShare < thresholds.coalGasShareFloor) {
    mapStore.addAlert({
      id: crypto.randomUUID(),
      type: "power-energy",
      severity: "warning",
      title: "Coal & gas share declining",
      message: `Coal and gas now account for ${data.coalGasShare.toFixed(1)}% of generation, below your ${thresholds.coalGasShareFloor}% threshold.`,
      timestamp: new Date().toISOString(),
      postcode: undefined,
    });
  }
}
```

### From an API route (server-side)

Write the alert to the database. The client will pick it up via its alerts query:

```typescript
// In an API route handler
async function createAlert(userId: string, alert: Omit<Alert, "id" | "created_at">) {
  const db = createClient();
  await db.from("alerts").insert({
    user_id: userId,
    layer_id: alert.layerId ?? "general",
    severity: alert.severity,
    category: alert.category,
    title: alert.title,
    message: alert.message,
    postcode: alert.postcode ?? null,
    dismissed: false,
  });
}
```

### Alert severity guide

- **info**: "New infrastructure project announced near your area"
- **warning**: "Fuel cost now exceeds 12% of your hourly wage (threshold: 15%)"
- **critical**: "Crime index in your postcode rose 8% this month (threshold: 5%)"

Use `warning` when approaching a threshold (within 80%). Use `critical` when the threshold is breached.

---

## Adding Map Overlays

### GeoJSON source + circle layer (point data)

Best for: generator sites, mine sites, school locations, infrastructure projects.

```typescript
export function getMapSources() {
  return {
    "mine-sites": {
      type: "geojson" as const,
      data: { type: "FeatureCollection" as const, features: [] },
    },
  };
}

export function getMapLayers() {
  return [
    {
      id: "mine-sites-circles",
      type: "circle" as const,
      source: "mine-sites",
      paint: {
        "circle-radius": [
          "interpolate", ["linear"],
          ["get", "productionTonnes"],
          0, 4,
          1_000_000, 16,
        ],
        "circle-color": "#a855f7",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    },
  ];
}
```

### Heatmap layer (density visualisation)

Best for: crime density, property price distribution, demographic concentration.

```typescript
export function getMapLayers() {
  return [
    {
      id: "crime-heatmap",
      type: "heatmap" as const,
      source: "crime-data",
      paint: {
        "heatmap-weight": ["get", "count"],
        "heatmap-intensity": [
          "interpolate", ["linear"], ["zoom"],
          0, 0.5,
          12, 2,
        ],
        "heatmap-radius": [
          "interpolate", ["linear"], ["zoom"],
          0, 10,
          12, 30,
        ],
        "heatmap-color": [
          "interpolate", ["linear"], ["heatmap-density"],
          0, "rgba(0,0,0,0)",
          0.2, "#ffffb2",
          0.4, "#fd8d3c",
          0.6, "#f03b20",
          0.8, "#bd0026",
          1, "#7f0000",
        ],
      },
    },
  ];
}
```

### Fill layer (polygon data)

Best for: postcode regions, SA3/SA4 statistical areas, electorate boundaries.

```typescript
export function getMapLayers() {
  return [
    {
      id: "postcode-fill",
      type: "fill" as const,
      source: "postcode-boundaries",
      paint: {
        "fill-color": [
          "interpolate", ["linear"],
          ["get", "medianPrice"],
          200_000, "#eff3ff",
          500_000, "#6baed6",
          1_000_000, "#08519c",
        ],
        "fill-opacity": 0.5,
      },
    },
    {
      id: "postcode-outline",
      type: "line" as const,
      source: "postcode-boundaries",
      paint: {
        "line-color": "#ffffff",
        "line-width": 0.5,
      },
    },
  ];
}
```

### Line layer (routes, corridors)

Best for: commute routes, transport corridors, pipeline routes.

```typescript
export function getMapLayers() {
  return [
    {
      id: "commute-route",
      type: "line" as const,
      source: "commute-data",
      paint: {
        "line-color": "#3b82f6",
        "line-width": 3,
        "line-opacity": 0.7,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    },
  ];
}
```

### Updating source data dynamically

When your TanStack Query hook receives new data, update the GeoJSON source:

```typescript
useEffect(() => {
  if (!mapRef.current || !data) return;

  const source = mapRef.current.getSource("mine-sites") as maplibregl.GeoJSONSource;
  if (source) {
    source.setData({
      type: "FeatureCollection",
      features: data.map(site => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [site.lng, site.lat] },
        properties: {
          id: site.id,
          name: site.name,
          commodity: site.commodity,
          productionTonnes: site.productionTonnes,
        },
      })),
    });
  }
}, [data]);
```

---

## Updating Top-Bar Widgets

The top bar (`src/components/layout/top-bar.tsx`) shows three persistent widgets:

1. **Equity** -- Mortgage equity based on property value vs remaining
2. **Fuel/wk** -- Weekly fuel cost based on commute distance, vehicle efficiency, and current fuel price
3. **Risk** -- Composite neighbourhood risk score

### How to feed data to widgets

Widgets read from the `user-store` (`src/stores/user-store.ts`):

```typescript
import { useUserStore } from "@/stores/user-store";

// In your layer hook, after computing a value:
const userStore = useUserStore.getState();
userStore.setWidgets({
  ...userStore.widgets,
  weeklyFuelCost: calculatedCost,  // Your layer computes this
});
```

The `DashboardWidgets` type (in `@ozpulse/shared`) should be extended as widgets are added:

```typescript
export interface DashboardWidgets {
  equityPercent?: number;
  weeklyFuelCost?: number;
  neighbourhoodRiskScore?: number;
  // Add new widget values here
}
```

### Adding a new widget

1. Add the value type to `DashboardWidgets` in `packages/shared/src/types.ts`
2. Compute the value in your layer hook
3. Write it to the user store via `setWidgets()`
4. Read it in `top-bar.tsx` via `useUserStore()`

```typescript
// In top-bar.tsx
const { widgets } = useUserStore();

// Add your widget alongside the existing ones:
<div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1">
  <span className="text-xs text-muted-foreground">Your Label</span>
  <span className="text-sm font-medium">
    {widgets?.yourValue?.toFixed(1) ?? "--"}
  </span>
</div>
```

---

## Shared Types

### Where to define types

- **Domain types used by multiple agents** go in `packages/shared/src/types/`
- **Layer-specific types** used only within one layer go in `src/components/layers/{layer-name}/types.ts`
- **API response types** go alongside the Zod schema that validates them

### Adding a new shared type

1. Create or edit a file in `packages/shared/src/types/`:

```typescript
// packages/shared/src/types/energy.ts
export interface GeneratorSite {
  id: string;
  name: string;
  fuelType: "coal" | "gas" | "wind" | "solar" | "hydro" | "battery" | "other";
  lat: number;
  lng: number;
  capacityMW: number;
  currentOutputMW: number;
}
```

2. Re-export from `packages/shared/src/index.ts`:

```typescript
export * from "./types/energy";
```

3. Import in your layer:

```typescript
import type { GeneratorSite } from "@ozpulse/shared";
```

### Zod schema conventions

Put Zod schemas in `packages/shared/src/schemas.ts` or `packages/shared/src/schemas/{domain}.ts`:

```typescript
import { z } from "zod";

export const generatorSiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  fuelType: z.enum(["coal", "gas", "wind", "solar", "hydro", "battery", "other"]),
  lat: z.number().min(-44).max(-10),  // Australian latitude range
  lng: z.number().min(112).max(154),  // Australian longitude range
  capacityMW: z.number().min(0),
  currentOutputMW: z.number().min(0),
});

export type GeneratorSite = z.infer<typeof generatorSiteSchema>;
```

---

## Testing Expectations

### What to test

Each layer should have tests covering:

1. **Hook tests** -- Verify your TanStack Query hook calls the right endpoint, handles errors, and transforms data correctly
2. **Component tests** -- Verify `LayerPanel` renders loading/error/success states
3. **Map source/layer tests** -- Verify `getMapSources()` and `getMapLayers()` return valid specs
4. **Utility tests** -- Verify data transformation functions (e.g., API response to GeoJSON)
5. **Zod schema tests** -- Verify schemas accept valid data and reject malformed data

### Vitest setup

The project uses Vitest. Tests are run with:

```bash
# From repo root
pnpm test

# From web app
cd apps/web && pnpm test

# Watch mode
cd apps/web && pnpm vitest
```

### Test file pattern

```typescript
// src/components/layers/power-energy/__tests__/index.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayerPanel, getMapSources, getMapLayers } from "../index";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("PowerEnergyLayer", () => {
  it("renders nothing when not visible", () => {
    render(<LayerPanel postcode="2000" visible={false} />, { wrapper });
    expect(screen.queryByText("Power & Energy")).toBeNull();
  });

  it("shows loading state", () => {
    render(<LayerPanel postcode="2000" visible={true} />, { wrapper });
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it("getMapSources returns valid source specs", () => {
    const sources = getMapSources();
    expect(Object.keys(sources).length).toBeGreaterThan(0);
    for (const source of Object.values(sources)) {
      expect(source).toHaveProperty("type");
    }
  });

  it("getMapLayers returns valid layer specs", () => {
    const layers = getMapLayers();
    expect(Array.isArray(layers)).toBe(true);
    for (const layer of layers) {
      expect(layer).toHaveProperty("id");
      expect(layer).toHaveProperty("type");
      expect(layer).toHaveProperty("source");
    }
  });
});
```

### Mocking external APIs

```typescript
import { vi } from "vitest";

// Mock fetch for API route tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ generators: [] }),
});
```

---

## Git Workflow

### Branch naming

Each agent works on their assigned branch:

| Agent | Branch |
|---|---|
| 1 - Lead Architect | `agent1-architecture` |
| 2 - Frontend UI/UX | `agent2-frontend-ui` |
| 3 - Map and Viz | `agent3-map-visualization` |
| 4 - Power and Infrastructure | `agent4-power-infra` |
| 5 - Real Estate | `agent5-real-estate` |
| 6 - Crime and Immigration | `agent6-crime-immigration` |
| 7 - Mining and Leisure | `agent7-mining-leisure` |
| 8 - Backend and Testing | `agent8-backend-testing` |

### Commit message format

```
[role] Short description of change

Longer explanation if needed.
```

Examples:
```
[power] Add AEMO generator site API route and hook
[frontend] Implement dark mode toggle in top bar
[map] Add heatmap layer type to LayerManager
[backend] Create cached_data table migration
```

### Avoiding conflicts

- Each agent owns their layer directory. Do not modify files outside your scope without coordinating.
- Shared types in `packages/shared/` may need coordination. If you need a new type, add it in a new file rather than editing an existing one.
- The `layer-store.ts` and `sidebar.tsx` contain the layer registry. If you need to add a new layer entry, coordinate with Agent 1 or Agent 2.

---

## Checklist Before Submitting

- [ ] Layer module exports `LAYER_ID`, `LayerPanel`, `getMapSources`, `getMapLayers`
- [ ] TanStack Query hook uses correct `staleTime` and `refetchInterval` from `REFRESH_INTERVALS`
- [ ] API route validates input with Zod
- [ ] API route checks server-side cache before hitting external API
- [ ] Types are exported from `@ozpulse/shared` if used by multiple agents
- [ ] Tests exist for hook, component, and map spec functions
- [ ] No hardcoded API keys (use environment variables)
- [ ] Commit messages use the `[role]` prefix
- [ ] Dark mode works (use Tailwind CSS colour tokens, not hardcoded colours)
