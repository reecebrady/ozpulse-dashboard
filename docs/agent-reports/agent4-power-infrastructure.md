# Agent 4: Power & Infrastructure -- Progress Report

**Agent**: Agent 4 (Power & Infrastructure)
**Branch**: `agent4-power-infra`
**Status**: Partial -- types, utilities, and mock data complete; layer components and API routes pending

---

## Completed Work

### 1. Shared Types (`packages/shared/src/types/`)

#### `energy.ts`
- `FuelTech` -- 17 AEMO fuel technology classifications
- `FuelGroup` -- 8 simplified UI groupings (coal, gas, wind, solar, hydro, battery, biomass, other)
- `NEMRegion` -- NSW1, QLD1, VIC1, SA1, TAS1
- `AUState`, `FuelType` (U91, U95, U98, diesel, LPG, E10, E85)
- `Generator` -- full AEMO-style generator with duid, station name, owner, fuel tech, coordinates, capacity, dispatch type, status, commission/closure years
- `DispatchData`, `RegionalDispatch` -- live SCADA dispatch with MW by fuel group and renewable %
- `EnergyMixEntry` -- fuel group / MW / percent breakdown
- `FuelStation`, `FuelPriceEntry`, `FuelPriceRegional` -- multi-state fuel price model
- `CommuteCostInput`, `CommuteCostResult` -- commute calculator with daily/weekly/monthly/annual costs, % of wage, value-of-work ratio
- `TransmissionLine` -- NEM backbone lines with coordinates
- `EnergyAlert` -- 6 alert types (price spike, renewable record, generator trip, demand peak, fuel price jump, coal/gas floor)

#### `infrastructure.ts`
- `ProjectStage` -- 7 stages: early_planning through operational
- `InfraSector` -- 10 sectors: road, rail, port, airport, water, energy, telecom, social, mixed_use, other
- `FundingSource` -- federal, state, private, ppp, mixed
- `InfraProjectFull` -- full project model with cost breakdown by funding source, jobs direct/indirect, priority rating, source authority, tags
- `EconomicMultiplierInput`, `EconomicMultiplierResult` -- ABS IO table multiplier calculation
- `InfraPipelineSummary` -- aggregated by sector/stage/state
- `ProjectTimelineEvent` -- stage progression tracking

Updated `packages/shared/src/index.ts` to export both new type modules.

---

### 2. Utility Libraries (`apps/web/src/lib/`)

#### `energy/commute-calculator.ts`
Pure function calculating:
- Daily litres = (distance x 2 x efficiency) / 100
- Daily/weekly/monthly/annual cost in AUD
- % of gross weekly wage (based on 38hr AU work week)
- Value-of-work ratio (cost per km / minutely wage)

#### `energy/nem-regions.ts`
- Labels, state mappings, state-to-NEM reverse lookup
- Approximate centroids for map zoom

#### `energy/fuel-colors.ts`
- Color palette and labels for fuel groups matching the master brief (black=coal, blue=gas, green=wind, yellow=solar, purple=hydro, orange=battery)

#### `infrastructure/multiplier.ts`
Economic multiplier calculator using ABS Cat. No. 5209.0 Type II multipliers:
- Sector-specific multipliers (road 2.81x, rail 2.67x, social 2.54x, etc.)
- Jobs per $1M by sector
- 40/35/25 split for direct/indirect/induced employment
- Confidence rating based on project cost scale

#### `infrastructure/stage-config.ts`
- Labels and color palettes for project stages and infrastructure sectors

---

### 3. Mock Data (`apps/web/src/lib/mock-data/`)

#### `generators.ts` -- 50 real Australian generators

| Category | Examples | Count |
|----------|---------|-------|
| NSW Coal | Bayswater (2640MW), Eraring (2880MW), Vales Point B, Mount Piper, Liddell (retired) | 5 |
| VIC Brown Coal | Loy Yang A (2210MW), Loy Yang B, Yallourn | 3 |
| QLD Coal | Callide B/C, Gladstone, Tarong, Kogan Creek, Stanwell | 6 |
| Gas | Tallawarra B, Torrens Island A/B, Mortlake, Jeeralang, Braemar, Osborne, Colongra | 8 |
| Wind | Macarthur (420MW), Coopers Gap (453MW), Stockyard Hill (530MW), + 8 more | 11 |
| Solar | Limondale (313MW), Western Downs (400MW), Bungala (275MW), + 6 more | 9 |
| Hydro | Tumut 3 (1500MW), Murray 1, Gordon, Reece, John Butters, Dartmouth | 6 |
| Battery | Hornsdale (150MW), Victorian Big Battery (300MW), Waratah Super Battery (850MW), + 3 more | 6 |
| Biomass | Invicta Sugar Mill, Condong Sugar Mill | 2 |

All with real coordinates, capacity, owner, commission year, expected closure.

#### `fuel-prices.ts` -- 18 fuel stations across all capitals

| City | Stations | U91 Range |
|------|----------|-----------|
| Sydney | Parramatta, Penrith, Campbelltown, Liverpool, Blacktown | 181.9-189.9c |
| Melbourne | Dandenong, Werribee, Ringwood | 175.9-179.9c |
| Brisbane | Logan, Ipswich | 183.9-186.9c |
| Adelaide | Elizabeth, Noarlunga | 169.9-172.9c |
| Perth | Armadale, Joondalup | 176.9-179.9c |
| Hobart | Glenorchy | 191.9c |

Plus state average lookup table.

#### `infra-projects.ts` -- 30 real projects

| Category | Projects |
|----------|----------|
| Nationally Significant | Inland Rail ($31.4B), Western Sydney Airport ($5.3B), Snowy 2.0 ($12B) |
| NSW | Sydney Metro West ($25B), Metro City & Southwest ($15.5B), WestConnex (completed) |
| VIC | Melbourne Metro Tunnel ($11B), North East Link ($15.8B), West Gate Tunnel ($10.2B), Suburban Rail Loop ($34.5B) |
| QLD | Cross River Rail ($5.4B), Bruce Highway ($13B), Rookwood Weir (completed) |
| WA | METRONET ($7.7B), Bunbury Outer Ring Road |
| SA | North-South Corridor ($15.4B), Port Bonython Hydrogen Hub |
| TAS | Marinus Link ($3.5B), Bridgewater Bridge |
| NT | Middle Arm Precinct, Darwin Ship Lift (completed) |
| Energy | HumeLink ($5.2B), VNI West ($3.8B) |
| Social | New Footscray Hospital, Westmead Health Precinct |

#### `transmission-lines.ts` -- 12 major NEM backbone lines
QNI, VIC-NSW Murray, Heywood, Basslink, Sydney-Newcastle 500kV, Liddell-Tamworth, Gladstone-Calvale, Tarong-South Pine, Latrobe Valley-Melbourne 500kV, Davenport-Adelaide, Snowy-Canberra, Gordon-Waddamana

#### `dispatch.ts` -- Mock dispatch generator
- `generateMockDispatch()` -- realistic NEM snapshot (NSW 10.2GW, QLD 7.6GW, VIC 5.8GW, SA 1.8GW, TAS 1.2GW)
- `aggregateNationalMix()` -- national energy mix with % breakdown

#### `index.ts` -- barrel export for all mock data modules

---

## Not Yet Completed

| Item | File | Priority |
|------|------|----------|
| PowerEnergyLayer component | `components/layers/PowerEnergyLayer.tsx` | P1 |
| InfrastructureLayer component | `components/layers/InfrastructureLayer.tsx` | P2 |
| TanStack Query hooks (energy) | `features/power-energy/hooks/` | P3 |
| TanStack Query hooks (infra) | `features/infrastructure/hooks/` | P3 |
| Energy API route | `app/api/power-energy/route.ts` | P3 |
| Infrastructure API route | `app/api/infrastructure/route.ts` | P3 |
| Map layer registration | `RegisteredLayer` implementations | P1 |
| Generator detail panel | click-to-inspect UI | P1 |
| Infrastructure detail panel | budget/jobs/timeline | P2 |
| Energy mix chart (Recharts) | pie/bar for NEM mix | P1 |
| Dispatch ticker | real-time strip | P1 |
| Commute calculator UI | panel component | P1 |
| Alert wiring | coal/gas floor, fuel-value-of-work | P1 |
| Git commits | branch exists, no commits pushed | -- |

---

## Files Created/Modified

```
packages/shared/src/types/energy.ts          NEW  -- all energy domain types
packages/shared/src/types/infrastructure.ts   NEW  -- all infrastructure domain types
packages/shared/src/index.ts                  MOD  -- added energy + infrastructure exports
apps/web/src/lib/energy/commute-calculator.ts NEW  -- pure commute cost function
apps/web/src/lib/energy/nem-regions.ts        NEW  -- NEM region constants
apps/web/src/lib/energy/fuel-colors.ts        NEW  -- fuel group colors + labels
apps/web/src/lib/infrastructure/multiplier.ts NEW  -- ABS IO economic multiplier
apps/web/src/lib/infrastructure/stage-config.ts NEW -- stage/sector labels + colors
apps/web/src/lib/mock-data/generators.ts      NEW  -- 50 real AU generators
apps/web/src/lib/mock-data/fuel-prices.ts     NEW  -- 18 stations + state averages
apps/web/src/lib/mock-data/infra-projects.ts  NEW  -- 30 real infra projects
apps/web/src/lib/mock-data/transmission-lines.ts NEW -- 12 NEM backbone lines
apps/web/src/lib/mock-data/dispatch.ts        NEW  -- dispatch snapshot generator
apps/web/src/lib/mock-data/index.ts           NEW  -- barrel export
```
