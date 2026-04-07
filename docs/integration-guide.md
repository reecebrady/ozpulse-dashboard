# Agent Integration Guide

## How to Add a New Layer

### 1. Create your layer component

Copy `apps/web/components/layers/template-layer.tsx` and rename it.

Your component receives:
- `visible: boolean` - whether the layer is toggled on
- `userPostcode?: string` - the user's pinned postcode

### 2. Create your data hooks

Put TanStack Query hooks in `apps/web/lib/hooks/use-{layer-name}.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";

export function usePowerData(postcode?: string) {
  return useQuery({
    queryKey: ["power-data", postcode],
    queryFn: () => fetch(`/api/power?postcode=${postcode}`).then(r => r.json()),
    refetchInterval: 300_000, // 5 minutes
    enabled: !!postcode,
  });
}
```

### 3. Create your API route

Put API routes in `apps/web/app/api/{layer-name}/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  // Fetch from external data source
  // Transform and return
  return NextResponse.json(data);
}
```

### 4. Create Zod schemas

Put validation schemas in `apps/web/lib/schemas/{layer-name}.ts`:

```typescript
import { z } from "zod";

export const PowerPlantSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["coal", "gas", "wind", "solar", "hydro", "battery", "other"]),
  latitude: z.number(),
  longitude: z.number(),
  capacityMW: z.number(),
  currentOutputMW: z.number(),
  owner: z.string(),
});
```

### 5. Register map layers

Use the LayerManager API from `@ozpulse/map-engine`:

```typescript
import { LayerManager } from "@ozpulse/map-engine";

// In your component's useEffect:
layerManager.register({
  id: "power-energy",
  visible: true,
  addToMap: (map) => {
    map.addSource("power-plants", { type: "geojson", data: geojsonData });
    map.addLayer({ id: "power-plants-circles", type: "circle", source: "power-plants", paint: { ... } });
  },
  removeFromMap: (map) => {
    map.removeLayer("power-plants-circles");
    map.removeSource("power-plants");
  },
});
```

## File Ownership

Each agent owns specific directories. Do NOT modify files outside your scope:

| Agent | Owned Files |
|-------|-------------|
| 1 - Architect | `docs/`, root configs, `packages/shared/src/types/` |
| 2 - Frontend | `apps/web/components/ui/`, `apps/web/components/panels/`, `apps/web/components/widgets/`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css` |
| 3 - Map | `packages/map-engine/`, `apps/web/components/map/` |
| 4 - Power & Infra | `apps/web/components/layers/power-energy.tsx`, `apps/web/components/layers/infrastructure.tsx`, `apps/web/lib/hooks/use-power.ts`, `apps/web/lib/hooks/use-infrastructure.ts`, `apps/web/app/api/power/`, `apps/web/app/api/infrastructure/` |
| 5 - Real Estate | `apps/web/components/layers/real-estate.tsx`, `apps/web/lib/hooks/use-real-estate.ts`, `apps/web/app/api/real-estate/` |
| 6 - Crime & Immigration | `apps/web/components/layers/crime-safety.tsx`, `apps/web/components/layers/immigration.tsx`, `apps/web/lib/hooks/use-crime.ts`, `apps/web/lib/hooks/use-immigration.ts`, `apps/web/app/api/crime/`, `apps/web/app/api/immigration/` |
| 7 - Mining & Leisure | `apps/web/components/layers/mining.tsx`, `apps/web/components/layers/leisure.tsx`, `apps/web/components/layers/global-index/`, `apps/web/lib/hooks/use-mining.ts`, `apps/web/lib/hooks/use-leisure.ts`, `apps/web/app/api/mining/`, `apps/web/app/api/leisure/` |
| 8 - Backend | `apps/web/app/api/` (shared routes), `apps/web/lib/db/`, `apps/web/lib/auth/`, tests, Supabase schema |

## Shared Conventions

- Import types from `@ozpulse/shared`
- Import map utilities from `@ozpulse/map-engine`
- Import UI components from `@ozpulse/ui`
- Use `cn()` from `@ozpulse/ui` for conditional classNames
- All API responses validated with Zod
- Commit messages prefixed with your role tag
