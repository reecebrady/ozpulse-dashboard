# Integration Guide for Agents

## Adding a New Layer

1. **Create your layer component** in `apps/web/src/components/layers/YourLayer.tsx`
   - Copy from `TemplateLayer.tsx`
   - Accept `{ map, visible }` props
   - Use TanStack Query for data fetching

2. **Add types** to `packages/shared-types/src/index.ts`
   - Export interfaces for your domain data

3. **Add data fetchers** to `packages/data-fetchers/src/`
   - Create a file like `energy.ts` with fetch functions
   - Use `createFetcher` from base

4. **Register in layer registry** at `apps/web/src/lib/layers.ts`
   - Add config entry to `LAYER_REGISTRY`
   - Add lazy import to `LAYER_COMPONENTS`

5. **Add API routes** if needed at `apps/web/src/app/api/your-domain/route.ts`
   - Proxy external APIs, add caching headers

## File Ownership
- Agent 1: `/docs/`, root config, architecture decisions
- Agent 2: `components/layout/`, `components/ui/`, global CSS, theming
- Agent 3: `components/map/`, `src/lib/layers.ts`, `src/stores/mapStore.ts`
- Agent 4: `components/layers/PowerEnergyLayer.tsx`, `components/layers/InfrastructureLayer.tsx`
- Agent 5: `components/layers/RealEstateLayer.tsx`
- Agent 6: `components/layers/CrimeSafetyLayer.tsx`, `components/layers/ImmigrationLayer.tsx`
- Agent 7: `components/layers/MiningLayer.tsx`, `components/layers/LeisureLayer.tsx`, expanded layers
- Agent 8: `app/api/`, Supabase schema, tests, alerts, backend logic

## Conventions
- Commit prefix: `[Role] message` (e.g., `[Energy] Add AEMO data fetcher`)
- Branch: `agent-N-role-name`
- TanStack Query keys: `['layer-id', ...params]`
- All coordinates: `[longitude, latitude]` (GeoJSON order)
