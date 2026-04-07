# OzPulse Architecture

## Overview

Single-page dashboard app with a full-screen interactive map as the primary interface. Built as a Turborepo monorepo with Next.js 15 App Router.

## Data Flow

```
External APIs (AEMO, Domain, ABS, etc.)
        |
  Next.js API Routes (apps/web/app/api/)
        |
  TanStack Query (client-side caching + refetch)
        |
  Layer Components (lazy-loaded, render map overlays)
        |
  MapLibre GL JS (renders everything on canvas)
```

## Key Decisions

- **MapLibre GL JS** over Leaflet: WebGL rendering handles thousands of pins/heatmap cells without DOM bottlenecks. Open source, no token required.
- **App Router** over Pages: Server components for initial data, streaming for progressive layer loading.
- **TanStack Query**: Each layer manages its own cache with independent refresh intervals (energy: 5min, property: 1hr, crime: daily).
- **PostGIS**: Spatial queries for "near my postcode" and geofencing alerts.
- **Lazy loading**: Each layer is `React.lazy()` imported, only loaded when toggled on.

## Deployment

- Vercel Sydney edge for frontend (instant loads for AU users)
- Supabase AU region for PostgreSQL + PostGIS + Auth
- Background cron jobs refresh external data into Supabase cache tables
