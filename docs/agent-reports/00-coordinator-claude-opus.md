# Agent Report: Coordinator (Claude Opus 4.6 -- Main Terminal)

**Agent:** Coordinator / Orchestrator
**Model:** Claude Opus 4.6 (1M context)
**Terminal:** Main session (not numbered 1-8)
**Branch:** `main`
**Date:** 2026-04-09

---

## Role

Set up the monorepo skeleton, wrote the master project brief, launched and coordinated all 8 parallel agents, consolidated their output, and diagnosed the resulting mess.

## What I Built

### Monorepo Skeleton
- Initialized git repo at `/Users/reecebrady/Projects/Aus-Dash`
- Turborepo config with `apps/web` + 6 packages (`shared`, `shared-types`, `db`, `data-fetchers`, `map-engine`, `ui`)
- Root configs: `package.json`, `turbo.json`, `tsconfig.json`, `.gitignore`, `.env.example`

### Next.js 15 App (`apps/web`)
- `layout.tsx`, `page.tsx`, `globals.css`, `next.config.ts`, `postcss.config.mjs`
- App Router structure with `src/app/` entry points

### Shared Types (`packages/shared`)
- `UserProfile`, `AlertThresholds`, `MapLayer`, `LayerCategory`
- `GeneratorSite`, `PropertyListing`, `CrimeRecord`, `MigrationData`, `InfraProject`, `MineSite`, `Alert`
- Typed layer IDs, refresh intervals, heatmap/GeoJSON/pin interfaces

### Database Package (`packages/db`)
- Supabase client with typed `Database` interface
- Tables: `user_profiles`, `alerts`, `cached_data`, `saved_locations`
- PostGIS geometry columns for spatial queries
- `queries.ts` with CRUD functions

### Layout Components (`apps/web/src/components/layout/`)
- `DashboardShell.tsx` -- main layout shell
- `Providers.tsx` -- TanStack Query provider
- `Sidebar.tsx` -- layer toggle sidebar
- `TopBar.tsx` -- stat widgets bar
- `DetailPanel.tsx` -- right slide-in panel
- `AlertFeed.tsx` -- bottom notification bar

### Map System (`apps/web/src/components/map/`)
- `MapContainer.tsx` -- MapLibre GL JS initialization (Australia center, nav controls, scale, geolocation, fullscreen)
- `LayerManager` -- register/show/hide/remove layer system
- `heatmap-renderer.ts`, `pin-marker.tsx`, `line-overlay.ts`, `polygon-overlay.ts`
- `popup.tsx` -- React popup on feature click
- Tools: `postcode-pin.ts`, `draw-corridor.ts`, `measure-tool.ts`, `zoom-to-postcode.ts`

### Zustand Stores (`apps/web/src/stores/`)
- `user-profile.ts` -- persisted to localStorage, with derived getters (equity, LTV, fuel cost, fuel/wage ratio)
- `map-store.ts` -- map view state, sidebar toggle
- `layer-store.ts` -- active layers
- `ui-store.ts` -- theme, panel states
- `alerts.ts` -- alert list, unread count

### Layer Template
- `TemplateLayer.tsx` -- contract: `{ map, visible }` props, useEffect for source/layer management

### `PROJECT-BRIEF.md`
- Full project spec, tech stack, repo structure, layer component contract, branch conventions

## What I Did Wrong

### Spawned sub-agents inside a terminal that was itself one of 8 agents
- Reece had 8 terminals open, each running Claude Code as an agent
- I (in one of those terminals) launched 8 MORE sub-agents internally
- This meant up to 15+ concurrent Claude sessions hitting the API
- All sub-agents hit rate limits and produced partial, conflicting output
- They wrote to overlapping files creating duplicates everywhere

### The resulting mess (224 files with conflicts)

| Duplicate | Files | Should Be |
|-----------|-------|-----------|
| Layer templates | `TemplateLayer.tsx`, `LayerTemplate.tsx`, `layer-template.tsx` | Keep `TemplateLayer.tsx` only |
| Real estate entry | `RealEstateLayer.tsx` (root), `real-estate/RealEstateLayer.tsx`, `real-estate/index.tsx` | One file |
| Layer managers | `layer-manager.ts`, `LayerManager.tsx` | Consolidate to one |
| Providers | `Providers.tsx`, `providers.tsx` | Case conflict on macOS |
| Dashboard | `DashboardShell.tsx`, `dashboard.tsx` | Keep `DashboardShell.tsx` |
| Stores | `mapStore.ts`/`map-store.ts`, `userStore.ts`/`user-store.ts`, `ui.ts`/`ui-store.ts` | One per store |
| DB packages | `packages/db`, `packages/database` | Keep `packages/db` |

## Current State of `main`

- **10 commits**, 224 files
- Core skeleton is solid (configs, types, map init, stores, layout)
- All 8 layer components exist as stubs or partial implementations
- Real estate and crime/immigration features are the most complete
- Leisure and global-index are minimal stubs
- No tests exist yet
- App likely does not build due to import conflicts between duplicates

## Recommendation for Agent 1 (Lead Architect)

1. Delete all duplicates, establish one naming convention
2. Fix all imports so the app builds cleanly
3. Then the other 7 agents can branch from a clean `main` and work in parallel without conflicts

---

*This report was written by the Coordinator terminal to document what happened and why the codebase needs cleanup before agents 1-8 can proceed effectively.*
