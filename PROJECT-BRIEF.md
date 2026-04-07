# OzPulse Dashboard - Master Project Brief

An average Australian persona fitting this profile is a mid-40s parent (or couple) in a government-linked role like public service, education admin, or transport authority, based in a suburban postcode of a capital city such as Sydney outer west or similar in Melbourne/Brisbane. Net worth sits at $550k, with 80-90% tied to the family home mortgage on a 20-25 year remaining term after 10 years of payments. The job pays steady but feels squeezed by fuel costs that now eat 15-20% of the weekly commute budget, making the daily drive or train feel like it delivers less real value than the effort put in.

## Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Maps**: MapLibre GL JS (primary), Leaflet (fallback)
- **Data Fetching**: TanStack Query
- **Validation**: Zod
- **Database**: PostgreSQL + PostGIS (Supabase AU region)
- **Auth**: NextAuth.js
- **Deployment**: Vercel (Sydney edge) or self-hosted Docker on Sydney VPS

## Layers

1. **Power & Energy** - AEMO live feeds, generator sites, fuel prices, commute cost calculator
2. **Real Estate & Housing** - Domain/CoreLogic APIs, heatmaps, mortgage calculator
3. **Crime & Safety** - ABS, state police data, school safety, corridor analysis
4. **Immigration & Demographics** - ABS migration, visa categories, diaspora maps
5. **Infrastructure & Industry** - Infrastructure Australia pipeline, project tracking
6. **Minerals, Mining & Resources** - Geoscience Australia, mine sites, commodity charts
7. **Leisure & Lifestyle** - Tourism APIs, parks, events, weekend planner
8. **Global Index** - Education, government performance, economic pressure, health, media sentiment

## Architecture

```
ozpulse-dashboard/
├── apps/
│   └── web/                    # Next.js 15 app
│       ├── app/                # App Router pages and API routes
│       │   └── api/            # Backend API routes
│       ├── components/
│       │   ├── layers/         # Each data layer as lazy-loaded component
│       │   ├── map/            # Map core components
│       │   ├── panels/         # Sidebar, detail panel, alert feed
│       │   ├── ui/             # shadcn/ui components
│       │   └── widgets/        # Top bar widgets (mortgage, fuel, risk)
│       ├── lib/                # Utilities, API clients, hooks
│       ├── types/              # Shared TypeScript types
│       └── public/             # Static assets
├── packages/
│   ├── ui/                     # Shared UI component library
│   ├── shared/                 # Shared types, utils, constants
│   └── map-engine/             # Map abstraction layer
├── docs/                       # Architecture docs, integration guides
├── PROJECT-BRIEF.md
├── turbo.json
└── package.json
```

## Agent Branches

| Agent | Branch | Scope |
|-------|--------|-------|
| 1 - Lead Architect | agent/architect | Skeleton, docs, types, integration guide |
| 2 - Frontend UI/UX | agent/frontend-ui | Layout, sidebar, panels, theme, profile |
| 3 - Map and Viz | agent/map-engine | MapLibre core, LayerManager, overlays |
| 4 - Power and Infrastructure | agent/power-infra | Energy layer, infrastructure layer |
| 5 - Real Estate | agent/real-estate | Housing layer, mortgage calculator |
| 6 - Crime and Immigration | agent/crime-immigration | Safety layer, demographics layer |
| 7 - Mining and Leisure | agent/mining-leisure | Resources, lifestyle, global index layers |
| 8 - Backend and Testing | agent/backend-testing | API routes, DB schema, alerts, tests |

## Conventions

- All commits prefixed with agent role: [architect], [frontend], [map], [power], [realestate], [crime], [mining], [backend]
- Each layer is a lazy-loaded React component in components/layers/
- Data fetching via TanStack Query hooks in lib/hooks/
- Zod schemas for all API responses in lib/schemas/
- Types exported from packages/shared/src/types/
