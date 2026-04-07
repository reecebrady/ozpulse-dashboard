# Architecture

## Overview
Single-page dashboard with full-screen MapLibre map as the primary view.
All data layers are lazy-loaded React components that register with a central LayerManager.

## Data Flow
1. User opens app -> map loads centered on Australia
2. User enables layer via sidebar toggle
3. Layer component lazy-loads, fetches data via TanStack Query
4. Data renders as map overlays (GeoJSON sources + MapLibre layers)
5. Click events on map features open the right detail panel
6. Alerts pushed to bottom feed based on user thresholds

## State Management
- `mapStore` (Zustand): layer visibility, selected features, alerts
- `userStore` (Zustand + persist): user profile, postcode, mortgage, thresholds

## API Routes
Next.js API routes in `apps/web/src/app/api/` proxy external data sources.
This prevents CORS issues and allows server-side caching.
