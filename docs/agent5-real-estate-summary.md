# Agent 5: Real Estate — Work Summary

**Agent:** Agent 5 (Real Estate Module)
**Branch:** `agent5-real-estate`
**Scope:** `components/layers/real-estate/`, `features/real-estate/`, `app/api/real-estate/`, `lib/layers.ts` (import path only)

---

## What Was Done

### PRIORITY 3: Cleaned Up Duplicates

**Deleted files:**

| File | Reason |
|------|--------|
| `components/layers/RealEstateLayer.tsx` | Root-level stub that returned `null` |
| `components/layers/real-estate/RealEstateLayer.tsx` | Broken duplicate (wrong imports: `useUserProfile`, missing `SuburbStatsPanel`, missing `MortgageCalculator`) |
| `components/layers/real-estate/suburb-stats.ts` | Orphaned 44-entry data file, only imported by deleted RealEstateLayer.tsx |
| `app/api/real-estate/suburb-stats/route.ts` | Duplicate of `suburbs/` route — unused by any hook |
| `app/api/real-estate/price-history/route.ts` | Duplicate of `price-index/` route — unused by any hook |

**Updated imports:**

- `lib/layers.ts` line 70: `import("@/components/layers/RealEstateLayer")` changed to `import("@/components/layers/real-estate")`

**Result:** ONE layer component at `components/layers/real-estate/index.tsx`. Five API routes with no duplicates.

---

### PRIORITY 1: Consolidated RealEstateLayer with `{ map, visible }` Props

Rewrote `components/layers/real-estate/index.tsx` as the single entry point.

**Props:** `{ map: maplibregl.Map | null, visible: boolean }` — matches the `LAYER_COMPONENTS` registry convention.

**MapLibre layers added directly to map instance (no LayerManager dependency):**

| Layer ID | Type | Source | Min Zoom | Description |
|----------|------|--------|----------|-------------|
| `re-heatmap-circles` | circle | `re-heatmap-src` | 0 | Colored suburb circles, green-yellow-red ($3k-$14k/m²), radius scales with zoom |
| `re-heatmap-labels` | symbol | `re-heatmap-src` | 8 | `$X/m²` text labels per suburb |
| `re-listing-pins` | circle | `re-listings-src` | 11 | Green dots for individual listings |
| `re-listing-labels` | symbol | `re-listings-src` | 13 | `$Xk` price labels per listing |

**Interactivity:**

- Click suburb circle -> `setDetailPanel()` with suburb stats
- Click listing pin -> detail panel with listing data
- Cursor changes to pointer on hover over clickable features

**Alerts:**

- Fires `"warning"` severity alert via `addAlert()` if user's postcode shows declining property values (12m trend = "down")

**Profile integration:**

- Uses `useUserProfileStore` (the current consolidated store, not the deleted `useUserProfile`)
- Reads flat profile shape: `profile.mortgageValue`, `profile.loanRemaining`, `profile.remainingTermYears`, `profile.interestRate`
- Derives AU state from postcode prefix for stamp duty (2xxx->NSW, 3xxx->VIC, etc.)

**Sidebar content rendered:**

- Heatmap legend bar (green-yellow-red gradient)
- Suburb count + listing count
- Full `RealEstateLayerPanel` with 5 tabs: Overview, Listings, Comparables, Mortgage, Trends

---

### PRIORITY 2: Verified Feature Components

All components in `features/real-estate/components/` verified working with correct imports:

| Component | Status | What it does |
|-----------|--------|--------------|
| `mortgage-calculator.tsx` | Working | Price change scenarios (-10% to +10%), stamp duty by state, LTV, refinance capacity. $550k net worth default. |
| `price-index-chart.tsx` | Working | Recharts dual-line chart (suburb vs national 24 months), outperform/lag badge |
| `equity-widget.tsx` | Working | Compact top-bar widget: equity value + 12m trend arrow. Uses `useUserProfileStore`. |
| `suburb-stats-card.tsx` | Working | Median house/apt prices, days on market, clearance rate, yield, 12m change |
| `listing-card.tsx` | Working | Property card: bed/bath/car/type, price, days listed, yield |
| `comparable-sale-card.tsx` | Working | Sold price, date, distance, property attributes |
| `valuation-card.tsx` | Working | AVM estimate with confidence range, last sold data, methodology |
| `testimony-panel.tsx` | Working | Community sentiment badges, theme tags, sample quotes |
| `real-estate-layer-panel.tsx` | Working | Tabbed container wiring all above components |
| `price-heatmap-legend.tsx` | Working | Color legend for $/m² overlay |

**Hooks in `features/real-estate/hooks/`:**

| Hook | Query Key | Refresh | Status |
|------|-----------|---------|--------|
| `useHeatmapData` | `["real-estate", "heatmap"]` | 1hr | Working |
| `useListings` | `["real-estate", "listings", postcode, ...]` | 1hr | Working |
| `useSuburbDetail` | `["real-estate", "suburb", postcode]` | 1hr | Working |
| `usePriceIndex` | `["real-estate", "price-index", postcode]` | 1hr | Working |
| `useValuation` | `["real-estate", "valuation", postcode, addr]` | 1hr | Working |
| `useEquityWidget` | Derived from `useSuburbDetail` | - | Working |

---

### API Routes (5 active)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/real-estate/heatmap` | GET | National $/m² heatmap points for all tracked suburbs |
| `/api/real-estate/listings?postcode=&type=&bedrooms=&limit=` | GET | Filtered property listings by postcode |
| `/api/real-estate/suburbs?postcode=` | GET | Suburb stats, comparables, testimonies, valuation |
| `/api/real-estate/price-index?postcode=` | GET | 24-month price index (suburb + national benchmark) |
| `/api/real-estate/valuation?postcode=&address=` | GET | Automated valuation estimate with confidence range |

All routes use deterministic mock data generators seeded by postcode. Each has `// TODO` markers for Domain API / CoreLogic integration.

---

### Utility Libraries

| File | What it provides |
|------|-----------------|
| `lib/constants.ts` | 38 major suburbs with lat/lng, stamp duty brackets for all 8 states/territories, refresh intervals, heatmap colors |
| `lib/mock-data.ts` | Deterministic generators: `generateListings`, `generateSuburbStats`, `generateHeatmapPoints`, `generateComparables`, `generatePriceIndex`, `generateNationalPriceIndex`, `generateTestimonies`, `generateValuation` |
| `lib/mortgage-math.ts` | `calculateMortgage()`, `calculateStampDuty()`, `formatAud()`, `formatPercent()` |
| `map-layers.ts` | `heatmapToGeoJSON()`, `listingsToGeoJSON()`, `getMapSources()`, `getMapLayers()` (standalone MapLibre style definitions) |

---

## Still TODO

1. **Expand `MAJOR_SUBURBS`** from 38 to ~100 entries — needs more Sydney outer west, Melbourne outer, regional centers (Newcastle, Wollongong, Geelong, Sunshine Coast, Cairns, Townsville, Ballarat, Bendigo, Launceston, Alice Springs)
2. **Final type-check pass** — last run showed 0 errors in real-estate files, but should re-verify after suburbs expansion
3. **Commit and push** with `[RealEstate]` prefix

---

## File Map

```
components/layers/real-estate/
  index.tsx                    <- THE layer component (consolidated)

features/real-estate/
  index.ts                     <- barrel exports
  types.ts                     <- re-exports from @ozpulse/shared
  map-layers.ts                <- GeoJSON converters + MapLibre style defs
  components/
    real-estate-layer-panel.tsx <- tabbed detail panel
    mortgage-calculator.tsx     <- equity impact calculator
    price-index-chart.tsx       <- recharts trend chart
    equity-widget.tsx           <- top-bar widget
    suburb-stats-card.tsx       <- suburb summary card
    listing-card.tsx            <- property listing card
    comparable-sale-card.tsx    <- recent sale card
    valuation-card.tsx          <- AVM estimate card
    testimony-panel.tsx         <- community sentiment
    price-heatmap-legend.tsx    <- color legend
  hooks/
    use-real-estate-data.ts     <- 5 TanStack Query hooks
    use-equity-widget.ts        <- derived equity hook
  lib/
    constants.ts                <- suburbs, stamp duty, colors
    mock-data.ts                <- deterministic data generators
    mortgage-math.ts            <- financial calculations

app/api/real-estate/
  heatmap/route.ts
  listings/route.ts
  suburbs/route.ts
  price-index/route.ts
  valuation/route.ts
```
