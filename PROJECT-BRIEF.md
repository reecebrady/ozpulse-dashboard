# OzPulse Dashboard — Project Brief

Australian-hosted, privacy-first dashboard app showing a live interactive map of Australia
with layered data overlays for: Power & Energy, Real Estate, Crime, Immigration, Infrastructure,
Mining, Leisure, plus Education, Government, Health, Traffic, and Media.

## Tech Stack
- **Monorepo**: Turborepo with npm workspaces
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Radix UI primitives
- **Map**: MapLibre GL JS (open-source, free tiles)
- **State**: Zustand (map + user stores)
- **Data**: TanStack Query v5, Zod validation
- **Database**: Supabase (AU region) with PostGIS
- **Deploy**: Vercel (Sydney edge) or Docker self-hosted

## Repo Structure
```
apps/web/               — Next.js dashboard app
  src/app/              — App Router pages
  src/components/
    layout/             — DashboardShell, Providers, TopBar, Sidebar, etc.
    layers/             — One component per data layer (lazy-loaded)
    map/                — MapContainer, LayerManager, map controls
    ui/                 — Shared UI (cards, charts, alerts, buttons)
  src/hooks/            — Custom React hooks
  src/lib/              — Layer registry, utils
  src/stores/           — Zustand stores (mapStore, userStore)
  src/types/            — App-level types
packages/shared-types/  — Cross-package TypeScript types
packages/data-fetchers/ — API client wrappers with caching
packages/ui/            — Shared UI primitives
docs/                   — Architecture docs, integration guide
```

## Layer Component Contract
Every layer component:
1. Receives `{ map: maplibregl.Map | null, visible: boolean }` as props
2. Adds/removes map sources and layers in useEffect
3. Toggles visibility based on `visible` prop
4. Fetches data via TanStack Query hooks
5. Returns null (renders on map) or a detail panel component

See `apps/web/src/components/layers/TemplateLayer.tsx` for the template.

## Branch Convention
Each agent works on branch: `agent-N-role-name` (e.g., `agent-3-map-viz`)
Commit messages prefixed with role: `[Map] Add layer manager system`
