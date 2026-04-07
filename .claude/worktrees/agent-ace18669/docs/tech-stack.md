# OzPulse Tech Stack

Every technology choice, why it was made, and version pinning guidance.

## Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | `^15.3.0` | App Router, server components, API route handlers, edge runtime support |
| **React** | `^19.1.0` | UI rendering, concurrent features, server components |
| **TypeScript** | `^5.8.0` | Type safety across the entire monorepo |
| **Node.js** | `>=20` | Runtime (LTS, required for Next.js 15) |

### Why Next.js 15 App Router

- Server components reduce client bundle size -- critical when shipping MapLibre + Recharts + 8 layer modules
- Route handlers replace the need for a separate Express/Fastify backend
- Turbopack dev server (`next dev --turbopack`) gives sub-second HMR
- Edge runtime option for Vercel Sydney deployment keeps latency under 50ms for AU users
- Built-in image optimisation for satellite/aerial tile overlays

## Monorepo

| Technology | Version | Purpose |
|---|---|---|
| **Turborepo** | `^2.5.0` | Task orchestration, caching, dependency graph |
| **pnpm** | `9.15.0` | Package manager with strict hoisting, workspace protocol |

### Why Turborepo over Nx

- Zero-config for Next.js projects (Vercel-native)
- Simpler mental model: `turbo.json` defines task dependencies, that's it
- Remote caching on Vercel for free (important for 8-agent parallel workflow)
- pnpm workspaces handle linking; Turborepo handles orchestration
- No generator/schematic bloat -- agents just create files and import

### Version Pinning: pnpm

The root `package.json` pins `"packageManager": "pnpm@9.15.0"`. Corepack enforces this. Do not upgrade pnpm without testing all workspace links.

## Mapping

| Technology | Version | Purpose |
|---|---|---|
| **MapLibre GL JS** | `^5.1.0` | Vector tile rendering, GeoJSON overlays, heatmaps, 3D terrain |

### Why MapLibre over Leaflet

- **Open source, no token required** -- MapLibre is BSD-licensed with no API key needed for the core library. Leaflet is also free but MapLibre is WebGL-accelerated.
- **Performance** -- WebGL rendering handles 100k+ features (mine sites, generator pins, crime heatmaps) without DOM thrashing. Leaflet's SVG/Canvas renderer caps out around 10k features.
- **Vector tiles** -- Native support for MVT (Mapbox Vector Tiles) from free sources like OpenFreeMap, Protomaps, or self-hosted tilesets. This is essential for Australian postcode boundaries (2,600+ polygons) and SA3/SA4 statistical areas.
- **Australian focus** -- We use OpenFreeMap or Protomaps as the base style provider. No Mapbox token, no US-centric defaults. We control the style JSON to highlight Australian geographic features.
- **3D terrain** -- Built-in terrain support for elevation data (useful for mining sites, flood risk overlays).
- **Heatmap layer type** -- Native heatmap rendering for crime density, property prices, demographic shifts.

### Why not Mapbox GL JS

Mapbox GL JS v2+ is proprietary (not open source). MapLibre is the community fork of the last open-source Mapbox GL JS v1, now significantly ahead in features. No licensing risk, no per-map-load billing.

## Data Layer

| Technology | Version | Purpose |
|---|---|---|
| **TanStack Query** | `^5.75.0` | Server state management, caching, background refetch |
| **Zustand** | (via stores) | Client-only state: UI toggles, user profile, map viewport |
| **Zod** | `^3.24.0` | Runtime validation of API responses and user input |

### Why TanStack Query

- **Per-layer cache control** -- Each layer type has different staleness requirements. Energy data refreshes every 30 seconds; demographics refreshes daily. TanStack Query's `staleTime` and `refetchInterval` per query key handle this without custom logic.
- **Deduplication** -- Multiple components (sidebar widget, map overlay, detail panel) can consume the same query without duplicate network requests.
- **Background refetch** -- Data stays fresh without user interaction. The dashboard shows live AEMO data that updates every 5 minutes automatically.
- **Offline support** -- TanStack Query's `gcTime` (garbage collection time) can be set to `Infinity` for offline-first layers, serving stale data when the network is unavailable.
- **DevTools** -- React Query DevTools are invaluable for debugging cache states across 14 layer queries.

### Why Zustand (not Redux, not Jotai)

- **Minimal boilerplate** -- A store is a single `create()` call. No actions, reducers, or providers.
- **Works outside React** -- Stores can be read/written from non-React contexts (MapLibre event handlers, service workers).
- **Persist middleware** -- User profile and preferences survive page reload via `persist()` to localStorage.
- **Small bundle** -- ~1KB gzipped. Redux Toolkit adds ~11KB.
- **No provider nesting** -- Unlike React Context, Zustand stores don't cause provider hell in the component tree.

### Why Zod

- **Runtime safety at API boundaries** -- Australian government APIs return inconsistent shapes. Zod catches malformed responses before they corrupt the UI or stores.
- **Schema-first types** -- `z.infer<typeof schema>` generates TypeScript types from Zod schemas, single source of truth.
- **Composable** -- Schemas for postcodes, coordinates, and dates are reused across all layer validators.

## Database

| Technology | Version | Purpose |
|---|---|---|
| **Supabase** | `^2.49.0` (JS client) | PostgreSQL hosting, auth, real-time subscriptions, storage |
| **PostgreSQL + PostGIS** | Supabase-managed | Spatial queries, postcode geometry lookups, heatmap aggregation |

### Why Supabase AU Region

- **Data sovereignty** -- Supabase offers an `ap-southeast-2` (Sydney) region. All user data (postcodes, mortgage details, alert thresholds) stays within Australia.
- **PostGIS built-in** -- Supabase projects include PostGIS by default. Spatial queries like "find all crime records within 10km of postcode 2000" use `ST_DWithin` without any additional setup.
- **Row Level Security** -- Each user's profile and alerts are isolated by RLS policies. No server-side authorisation code needed.
- **Real-time** -- Supabase Realtime can push alert updates to connected clients via WebSocket. Useful for the alert feed.
- **Free tier is generous** -- 500MB database, 1GB file storage, 50k monthly active users. Sufficient for MVP.

### PostGIS Usage

PostGIS handles:
1. **Postcode polygon lookups** -- `ST_Contains(postcode_geom, ST_MakePoint(lng, lat))` to resolve coordinates to postcodes
2. **Radius queries** -- `ST_DWithin(geom, user_point, radius_metres)` for "nearby" searches
3. **Heatmap pre-aggregation** -- `ST_SnapToGrid` + `COUNT(*)` to bucket crime/property data into hexagonal grids
4. **Route corridor analysis** -- `ST_Buffer(ST_MakeLine(...), width)` for the commute corridor safety overlay

## Authentication

| Technology | Version | Purpose |
|---|---|---|
| **NextAuth.js** | `^5.0.0-beta.25` | Authentication, session management |

### Why NextAuth.js

- **Next.js native** -- Works with App Router middleware for route protection
- **Multiple providers** -- Google, GitHub, email/password. Australian users expect Google sign-in.
- **Session in server components** -- `auth()` call in server components, no client-side flash
- **Supabase adapter available** -- Sessions and accounts stored in the same Supabase database

Note: The `.env.example` also references Clerk keys. The project may evaluate Clerk as an alternative. Both are supported; the architecture does not depend on either specifically.

## UI

| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | `^4.1.0` | Utility-first CSS, theme tokens, dark mode |
| **shadcn/ui** | (copy-paste, no version) | Pre-built accessible components (buttons, dialogs, popovers) |
| **Lucide React** | `^0.475.0` | Icon library (layer icons, UI chrome) |
| **Recharts** | `^2.15.0` | Charts for detail panels (line, bar, area, pie) |
| **class-variance-authority** | `^0.7.1` | Component variant definitions |
| **clsx + tailwind-merge** | `^2.1.1` / `^3.0.0` | Conditional class merging |

### Why Tailwind CSS 4

- **CSS-first configuration** -- `@theme {}` block in `globals.css` replaces `tailwind.config.js`. Simpler, faster.
- **Lightning CSS engine** -- Tailwind 4 uses Rust-based compilation. Build times are negligible.
- **Design tokens** -- Custom colour tokens for energy types (`--color-energy-coal`, `--color-energy-solar`) and crime categories are defined once and used everywhere.
- **Dark mode** -- `.dark` class variant with theme overrides already configured.

### Why shadcn/ui (not a component library)

- **Copy-paste, not dependency** -- Components live in our repo. No version drift, no breaking upgrades.
- **Tailwind-native** -- Every component uses Tailwind classes. No CSS-in-JS runtime.
- **Accessible** -- Built on Radix UI primitives. Keyboard navigation, ARIA attributes, focus management.

## Testing

| Technology | Version | Purpose |
|---|---|---|
| **Vitest** | `^3.1.0` | Unit and integration tests |
| **Testing Library** | `^16.2.0` | React component testing |

### Why Vitest over Jest

- **Native ESM** -- No transform configuration needed for TypeScript imports
- **Vite-compatible** -- Shares the same transform pipeline as Turbopack/Vite
- **Watch mode** -- Instant re-runs on file save
- **Workspace support** -- Runs tests across monorepo packages

## Deployment

| Option | When to use |
|---|---|
| **Vercel (Sydney edge)** | Default. Zero-config Next.js deployment. Edge functions in `syd1` region. |
| **Docker on Sydney VPS** | If Vercel costs become prohibitive or self-hosting is preferred. |

## Version Pinning Guidance

### Rules

1. **Use caret ranges (`^`)** for all dependencies. This allows patch and minor updates within a major version.
2. **Pin `packageManager`** in root `package.json` to an exact pnpm version. Corepack enforces this.
3. **Lock file is law** -- `pnpm-lock.yaml` must be committed. Never delete it.
4. **Review major bumps manually** -- When Renovate/Dependabot proposes a major version upgrade (e.g., Next.js 15 -> 16), a human reviews and tests before merging.
5. **MapLibre pinning** -- MapLibre 5.x has a stable API. Pin to `^5.1.0` and only bump when new layer types require it.
6. **Supabase client** -- Pin to `^2.49.0`. The v3 client (when released) will require migration.

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated -r

# Update all within semver ranges
pnpm update -r

# Update a specific package across all workspaces
pnpm update -r maplibre-gl
```
