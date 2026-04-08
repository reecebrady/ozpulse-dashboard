# Agent 6 — Crime, Immigration & Demographics

**Agent:** Agent 6 (Crime & Immigration)
**Branch:** `agent6-crime-immigration`
**Scope:** Crime & Safety layer, Immigration & Demographics layer, related API routes and feature modules

---

## Work Completed

### 1. CrimeSafetyLayer.tsx — Full Implementation

**File:** `apps/web/src/components/layers/CrimeSafetyLayer.tsx`

Replaced placeholder stub with a working MapLibre layer component:

- Receives `{ map, visible, onFeatureClick }` props
- Adds **heatmap layer** (zoomed-out) and **circle layer** (zoomed-in) from `crime-heatmap.ts` mock data (~80 real Australian postcodes)
- Color-coded green → yellow → red → dark red by crime index
- **Category filter UI**: toggle between All, Violent, Property, Drug, Public Order, Traffic — updates GeoJSON source in real-time
- Click handler fires `onFeatureClick` with postcode, suburb, crimeIndex, lat/lng, and per-category rates
- Legend overlay with color scale and category filter buttons
- Visibility toggling when layer is shown/hidden from sidebar

### 2. ImmigrationLayer.tsx — Full Implementation

**File:** `apps/web/src/components/layers/ImmigrationLayer.tsx`

Replaced placeholder stub with a working MapLibre layer component:

- 23 SA4 regions with realistic net migration numbers
- **Three view modes** toggled via UI buttons:
  - **Net Migration** — blue intensity heatmap showing inflow density
  - **Global Flows** — great-circle arc lines from 20 source countries to Australian destinations, line thickness proportional to arrivals
  - **Diaspora** — same heatmap with click-through to diaspora detail
- 20 flow lines with realistic arrival counts (India→Parramatta 8,200; China→Sydney CBD 7,100; Philippines→Blacktown 3,400; etc.)
- Origin country dots sized by total arrivals
- Click handler for SA4 detail drill-down
- Legend updates per view mode

### 3. Mock Data (Verified — Built in Prior Session)

| File | What It Contains |
|------|-----------------|
| `components/layers/crime-safety/crime-heatmap.ts` | 80 real postcodes across all state capitals with per-category crime rates, area multipliers for CBDs/nightlife/disadvantaged areas, composite crime index |
| `components/layers/crime-safety/crime-trends.ts` | 12-month rolling trends with seasonal patterns, 20 key postcodes, surge detection algorithm |
| `api/crime/school-safety/route.ts` | 50 real schools with safety scores, incident breakdowns by type, ICSEA values, haversine radius search |
| `api/crime/statistics/route.ts` | 25 SA3 regions, per-subtype offence records (Assault, Break and Enter, Drug Possession, etc.), 12-month history |
| `api/crime/trends/route.ts` | Postcode trend generation with seasonal factors and month-on-month change |
| `api/demographics/diaspora/route.ts` | 20 suburb profiles with realistic ancestry patterns (Chinese in Strathfield 2135, Vietnamese in Cabramatta 2166, Lebanese in Bankstown 2200, Indian in Parramatta 2150, Afghan in Dandenong 3175, etc.) |
| `api/demographics/migration/route.ts` | 20 SA4 regions, visa category weights (city vs regional), country arrival weights, quarterly trends, flow line generation |

### 4. Feature Modules (42 Files — Built in Prior Session, Verified Intact)

Located in `apps/web/src/features/crime-safety/` and `apps/web/src/features/immigration-demographics/`:

- **Types & Schemas** — Zod schemas for crime records, migration records, diaspora, workforce shifts, visa categories, school safety
- **API Clients** — ABS Recorded Crime parser, state police normalisers (NSW BOCSAR, VIC CSA, QLD Police), MySchool ACARA, ABS migration/census
- **Hooks** — `useCrimeByPostcode`, `useCrimeHeatmap`, `useCrimeTrends`, `useCrimeComparison`, `useSchoolSafety`, `useCrimeAlerts`, `useNeighbourhoodRisk`, `useMigrationByPostcode`, `useMigrationHeatmap`, `useMigrationFlows`, `useDiasporaByPostcode`, `useWorkforceShifts`, `useDemographicAlerts`
- **Components** — CrimeHeatmap, OffenceTrends (recharts), SchoolSafetyScores, SafeCorridorTool, CrimeComparison, CrimeAlerts, CrimeLayerPanel (4-tab), MigrationHeatmap, DiasporaConcentrationPanel, MigrationFlowArrows, WorkforceShiftsPanel, MigrationTrendsChart, ImmigrationLayerPanel (4-tab), DemographicAlerts
- **Utils** — Crime index calculation (weighted vs national baselines), trend detection, percentile ranking, demographic shift detection (>3% threshold), Simpson's diversity index, housing pressure index
- **Layer Configs** — `registerCrimeLayer()` and `registerImmigrationLayer()` for Agent 3's LayerManager

---

## Duplicate API Routes Identified

| Keep | Remove | Reason |
|------|--------|--------|
| `/api/immigration/diaspora/` | `/api/demographics/diaspora/` | Consolidate under `/api/immigration/`; demographics version has better data — migrate its suburb profiles into immigration route |
| `/api/immigration/` | `/api/demographics/migration/` | Same — demographics version has better weighted distributions, merge into immigration |
| `/api/crime/schools/` | `/api/crime/school-safety/` | Consolidate; school-safety has the better 50-school dataset — migrate into schools route |
| `/api/crime/` | `/api/crime/statistics/` | Statistics has richer per-subtype data — merge into main crime route |

**Status:** Identified but not yet committed. Waiting for Agent 1 (Lead Architect) to coordinate the consolidation to avoid conflicts with other agents.

---

## Files Modified This Session

1. `apps/web/src/components/layers/CrimeSafetyLayer.tsx` — stub → full implementation
2. `apps/web/src/components/layers/ImmigrationLayer.tsx` — stub → full implementation

## Still TODO

- Commit and push branch
- Consolidate duplicate API routes (pending coordination with Agent 1)
- Wire both layers into dashboard layer toggle system (pending Agent 2/3 work on sidebar + LayerManager)
- Connect crime alert threshold checks to Agent 8's alert engine
