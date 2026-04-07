# Australian Open Data Sources

Catalogue of every external data API used by OzPulse layers. For each source: URL, authentication, data format, update frequency, rate limits, and known limitations.

---

## 1. AEMO -- Australian Energy Market Operator

**Layer**: Power & Energy (Agent 4)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| NEM Current Dispatch | `https://aemo.com.au/aemo/apps/api/report/ELEC_NEM_SUMMARY` | Current generation by fuel type, state, total demand |
| NEM Generator Information | `https://aemo.com.au/energy-systems/electricity/national-electricity-market-nem/nem-forecasting-and-planning/forecasting-and-planning-data/generation-information` | Generator registry (name, fuel, capacity, location, owner, dates) |
| NEM Price and Demand | `https://aemo.com.au/aemo/apps/api/report/CURRENT_DISPATCHIS` | 5-minute dispatch interval prices and demand by region |
| NEM Data Dashboard API | `https://data.opennem.org.au/v4/stats/au/NEM/power/7d.json` | OpenNEM (community API wrapping AEMO data) -- 7-day power generation by fuel type |
| AEMO NEMWEB | `https://nemweb.com.au/` | Raw MMS data files (CSV archives) |

### Authentication
- **AEMO public reports**: No API key required. Data is publicly accessible.
- **OpenNEM**: No API key required. Community-run, wraps AEMO data.
- **NEMWEB**: No auth. Direct file downloads.

### Rate Limits
- AEMO: No published rate limits, but be polite -- cache aggressively. Do not poll more than once per 5 minutes.
- OpenNEM: No published limits. Cache responses for at least 5 minutes.

### Data Format
- JSON (AEMO API, OpenNEM)
- CSV (NEMWEB raw data)

### Update Frequency
- NEM dispatch: Every 5 minutes
- Generator registry: Updated quarterly
- OpenNEM: Near real-time (5-minute intervals)

### Known Limitations
- AEMO APIs are undocumented and may change without notice. OpenNEM is more stable.
- Generator location coordinates are approximate (site centroid, not individual turbines).
- Historical data beyond 7 days requires NEMWEB CSV downloads.

---

## 2. Domain API / CoreLogic -- Property Data

**Layer**: Real Estate & Housing (Agent 5)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| Domain Listings Search | `https://api.domain.com.au/v1/listings/residential/_search` | Active property listings with price, location, features |
| Domain Property Profile | `https://api.domain.com.au/v1/properties/{propertyId}` | Single property details and history |
| Domain Suburb Performance | `https://api.domain.com.au/v1/suburbPerformanceStatistics` | Median price, days on market, auction clearance by suburb |
| Domain Sales Results | `https://api.domain.com.au/v1/salesResults/{city}` | Weekly auction results |

### Authentication
- **Domain API**: OAuth2 client credentials. Requires `DOMAIN_API_KEY` (client ID + secret).
- Register at `https://developer.domain.com.au/`
- Free tier: 500 calls/day. Paid tiers available.

### Rate Limits
- Free tier: 500 API calls per day, 5 calls per second
- Paid: up to 50,000 calls/day

### Data Format
- JSON

### Update Frequency
- Listings: Updated as agents publish/modify listings (near real-time)
- Suburb performance: Updated weekly (after auction weekend)
- Sales results: Updated Monday after auction weekend

### Known Limitations
- Free tier is very restrictive for a dashboard polling multiple postcodes. Budget for paid tier.
- CoreLogic data (automated valuations, historical trends) is not available via Domain API -- requires a separate CoreLogic commercial agreement.
- Some rural/regional areas have sparse listing data.

### Alternatives
- **CoreLogic RP Data API**: Commercial only. Contact sales. Provides automated valuations, capital growth, rental yields.
- **realestate.com.au**: No public API. Would require scraping (not recommended).
- **SQM Research**: `https://sqmresearch.com.au/` -- some free data on vacancy rates. No API; CSV downloads.

---

## 3. ABS -- Australian Bureau of Statistics

**Layer**: Crime & Safety (Agent 6), Immigration & Demographics (Agent 6), Economic Pressure (Agent 7)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| ABS.Stat Data Explorer API | `https://api.data.abs.gov.au/data/{dataflow}/{key}` | SDMX-JSON format data across all ABS datasets |
| Recorded Crime - Offenders | Dataflow: `ABS,CRIME_OFFENDERS,1.0.0` | Offender counts by offence type, state, age, sex |
| Recorded Crime - Victims | Dataflow: `ABS,CRIME_VICTIMS,1.0.0` | Victim counts by offence type, state |
| Overseas Migration | Dataflow: `ABS,OVERSEAS_ARRIVALS_DEPARTURES,1.0.0` | Net overseas migration by visa category, country |
| Regional Population | Dataflow: `ABS,REGIONAL_POPULATION,1.0.0` | Estimated resident population by SA2/SA3/SA4 |
| Consumer Price Index | Dataflow: `ABS,CPI,1.0.0` | CPI by group, capital city |
| Wage Price Index | Dataflow: `ABS,WPI,1.0.0` | Wage growth by industry, state |
| Census DataPacks | `https://www.abs.gov.au/census/find-census-data/datapacks` | Census 2021 by geography (SA1-SA4, postcode, LGA) |
| ABS Maps (GeoJSON) | `https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files` | ASGS boundary files (postcode, SA1-SA4, LGA, state) |

### Authentication
- **ABS.Stat API**: No API key required. Public access.
- **Census DataPacks**: Free download. No auth.
- **Boundary files**: Free download. No auth.

### Rate Limits
- No published rate limits. ABS asks for reasonable use.
- The API can be slow for large queries. Cache heavily.

### Data Format
- SDMX-JSON (ABS.Stat API)
- CSV (Census DataPacks)
- GeoJSON / Shapefile / GeoPackage (boundary files)

### Update Frequency
- Crime: Annual (Recorded Crime - Offenders and Victims released yearly, usually late January)
- Migration: Quarterly (with ~6 month lag)
- Population: Annual (ERP released in March for previous June)
- CPI: Quarterly
- WPI: Quarterly

### Known Limitations
- Crime data is state-aggregated, not postcode-level. Postcode-level crime requires state police APIs.
- SDMX-JSON is complex to parse. Use a helper library or write a transformer.
- Census data is from 2021. The 2026 Census results will not be available until late 2027.
- ABS.Stat API can be slow and occasionally returns 500 errors. Always cache and retry.

---

## 4. State Police Data -- Crime at Postcode Level

**Layer**: Crime & Safety (Agent 6)

### NSW -- Bureau of Crime Statistics and Research (BOCSAR)

| Endpoint | URL | Data |
|---|---|---|
| Crime Statistics Tool | `https://www.bocsar.nsw.gov.au/Pages/bocsar_crime_stats/bocsar_crime_stats.aspx` | LGA-level crime counts by offence type, monthly |
| NSW Crime Data Download | `https://www.bocsar.nsw.gov.au/Pages/bocsar_crime_stats/bocsar_lgaexcel.aspx` | Downloadable Excel/CSV by LGA |

- Auth: None (public)
- Format: HTML tool + downloadable Excel/CSV
- Update: Quarterly (with ~3 month lag)
- No REST API. Data must be downloaded and processed.

### VIC -- Crime Statistics Agency (CSA)

| Endpoint | URL | Data |
|---|---|---|
| Crime Stats Data Tables | `https://www.crimestatistics.vic.gov.au/crime-statistics/latest-victorian-crime-data/download-data` | LGA-level offence counts, downloadable CSV |
| Crime Stats Explorer | `https://www.crimestatistics.vic.gov.au/crime-statistics/latest-victorian-crime-data` | Interactive tool (no API) |

- Auth: None (public)
- Format: CSV download
- Update: Quarterly

### QLD -- Queensland Government Open Data

| Endpoint | URL | Data |
|---|---|---|
| QPS Crime Map Data | `https://www.data.qld.gov.au/dataset/qps-crime-statistics` | Offence counts by police division, monthly |
| QPS Online Crime Map | `https://qps-ocm.s3-ap-southeast-2.amazonaws.com/index.html` | Interactive map (scrape-unfriendly) |

- Auth: None
- Format: CSV
- Update: Monthly

### SA -- SA Police

| Endpoint | URL | Data |
|---|---|---|
| SA Crime Statistics | `https://data.sa.gov.au/data/dataset/crime-statistics` | Offence counts by suburb/LGA |

- Auth: None
- Format: CSV
- Update: Annually

### WA -- WA Police

| Endpoint | URL | Data |
|---|---|---|
| WA Crime Statistics | `https://www.police.wa.gov.au/Crime/Crime-Statistics` | Offence summary by district |

- Auth: None
- Format: PDF/Excel (limited machine readability)
- Update: Annually

### Known Limitations (All States)
- No uniform API across states. Each requires a custom importer.
- Most states provide LGA-level data, not postcode-level. Mapping LGA to postcode requires ABS concordance tables.
- Data release lags are 3-12 months depending on the state.
- WA and NT have very limited machine-readable crime data.
- Tasmania and ACT have small datasets due to population size.

---

## 5. Infrastructure Australia

**Layer**: Infrastructure & Industry (Agent 4)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| Infrastructure Priority List | `https://www.infrastructureaustralia.gov.au/infrastructure-priority-list` | National priority projects and initiatives |
| Market Capacity Report | `https://www.infrastructureaustralia.gov.au/publications` | Construction pipeline, workforce capacity |
| Infrastructure Pipeline | `https://data.gov.au/dataset/infrastructure-project-pipeline` | Federal + state project pipeline (when published) |

### Authentication
- None. Public data.

### Data Format
- PDF reports (priority list, market capacity)
- CSV / Excel (project pipeline on data.gov.au, when available)

### Update Frequency
- Priority List: Updated every 1-2 years
- Pipeline data: Updated bi-annually

### Known Limitations
- Most data is in PDF reports, not machine-readable. Requires manual extraction or PDF parsing.
- State infrastructure bodies (e.g., Transport for NSW, Major Road Projects Victoria) publish their own pipelines separately.
- Geographic coordinates for projects are rarely provided. Will need geocoding from project descriptions/addresses.

### State Infrastructure Sources

| State | Source | URL |
|---|---|---|
| NSW | Transport for NSW / Infrastructure NSW | `https://www.transport.nsw.gov.au/projects` |
| VIC | Major Transport Infrastructure Authority | `https://bigbuild.vic.gov.au/projects` |
| QLD | Building Queensland | `https://buildingqueensland.qld.gov.au/` |
| SA | Infrastructure SA | `https://www.infrastructure.sa.gov.au/` |
| WA | Infrastructure WA | `https://www.infrastructure.wa.gov.au/` |

---

## 6. Geoscience Australia -- Mining & Resources

**Layer**: Minerals, Mining & Resources (Agent 7)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| Australian Mines Atlas (AMA) | `https://portal.ga.gov.au/` | Mine sites, mineral occurrences, exploration tenements |
| GA Web Services (WMS/WFS) | `https://services.ga.gov.au/gis/rest/services` | OGC web services for geospatial data |
| EFTPOS (Mineral Resources) | `https://ecat.ga.gov.au/geonetwork/srv/eng/catalog.search` | Metadata catalogue for mineral resource datasets |
| OZMIN Database | `https://portal.ga.gov.au/metadata/ozmin` | Operating mines and deposits |
| Australian Resource Reviews | `https://www.ga.gov.au/data-pubs/data-and-publications-search?searchTerm=resources+review` | Annual commodity reviews |

### Authentication
- None. All Geoscience Australia data is freely available.

### Data Format
- GeoJSON / WMS / WFS (web services)
- CSV (downloadable datasets)
- PDF (resource reviews)

### Update Frequency
- Mine registry: Updated annually
- Web services: Near real-time spatial data
- Resource reviews: Annual

### Known Limitations
- The Australian Mines Atlas was deprecated in favour of the GA Portal. Some legacy links may break.
- WFS queries for large areas can be slow. Use bounding box filters.
- Commodity production figures often have a 1-2 year reporting lag.
- Export value data requires supplementary sources (Department of Industry).

### Supplementary Sources

| Source | URL | Data |
|---|---|---|
| Dept of Industry (DISER) | `https://www.industry.gov.au/data-and-publications/resources-and-energy-quarterly` | Commodity price forecasts, production stats |
| ASX Mining Companies | `https://www.asx.com.au/markets/trade-our-cash-market/directory` | Listed mining companies (for operator data) |

---

## 7. BITRE -- Bureau of Infrastructure and Transport Research Economics

**Layer**: Traffic & Commute, Infrastructure (Agents 4, 7)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| BITRE Data Portal | `https://www.bitre.gov.au/statistics` | Transport statistics, aviation, freight, road |
| Road Safety Data | `https://www.bitre.gov.au/statistics/safety` | Fatality and serious injury data |
| Aviation Statistics | `https://www.bitre.gov.au/statistics/aviation` | Domestic/international passenger numbers |
| Freight Statistics | `https://www.bitre.gov.au/statistics/freight` | Road, rail, sea freight volumes |

### Authentication
- None. Public data.

### Data Format
- Excel / CSV downloads
- PDF reports

### Update Frequency
- Monthly (aviation, road safety)
- Quarterly (freight)
- Annual (comprehensive yearbook)

### Known Limitations
- No REST API. All data is downloadable files.
- Real-time traffic data is state-managed (see state transport APIs below).

### State Transport APIs (Real-Time)

| State | Source | URL | Data |
|---|---|---|---|
| NSW | Transport for NSW Open Data | `https://opendata.transport.nsw.gov.au/` | GTFS-R, traffic incidents, Opal usage |
| VIC | PTV Data API | `https://www.ptv.vic.gov.au/footer/data-and-reporting/datasets/ptv-timetable-api/` | Real-time departures, routes |
| QLD | TransLink GTFS | `https://www.data.qld.gov.au/dataset/general-transit-feed-specification-gtfs-seq` | SEQ transit feeds |

---

## 8. MySchool / NAPLAN -- Education Data

**Layer**: Education (Agent 7)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| MySchool Data | `https://www.myschool.edu.au/` | School profiles, NAPLAN results, financial data |
| ACARA Data Access Program | `https://www.acara.edu.au/reporting/data-access` | Bulk school data (requires application) |
| MySchool Like Schools | `https://www.myschool.edu.au/school/{school-id}/naplan/results` | NAPLAN results comparison |

### Authentication
- **MySchool website**: No API. Web scraping would be required (check ToS).
- **ACARA Data Access Program**: Requires formal application. Bulk CSV data provided on approval.

### Data Format
- HTML (MySchool website)
- CSV (ACARA bulk data, if approved)

### Update Frequency
- NAPLAN: Annual (results released ~August)
- School profiles: Updated annually

### Known Limitations
- MySchool has no public API. The website is the only official access point.
- ACARA bulk data access requires justification and approval (can take weeks).
- NAPLAN moved to online testing; historical comparisons pre-2023 are not directly comparable.
- School location coordinates are available but not via API (ABS has a school locations dataset).

---

## 9. ACCC Fuel Price Monitoring / FuelWatch

**Layer**: Power & Energy (Agent 4)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| ACCC Fuel Price Reports | `https://www.accc.gov.au/consumers/petrol-and-fuel/petrol-price-cycles` | National fuel price reports |
| NSW FuelCheck | `https://api.onegov.nsw.gov.au/FuelCheckApp/v2/fuel/prices` | Real-time fuel prices by station (NSW) |
| WA FuelWatch | `https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS` | Next-day fuel prices (WA, legislated disclosure) |
| QLD Fuel Reports | `https://www.data.qld.gov.au/dataset/fuel-price-reporting` | QLD station prices |
| SA Fuel Pricing | `https://www.sa.gov.au/topics/driving-and-transport/fuel-prices` | SA daily prices |

### Authentication
- **NSW FuelCheck**: Requires API key from Service NSW developer portal
- **WA FuelWatch**: RSS feed, no auth
- **QLD/SA**: Public downloads, no auth

### Data Format
- JSON (NSW FuelCheck API)
- RSS/XML (WA FuelWatch)
- CSV (QLD, SA)

### Update Frequency
- NSW: Real-time (updated as stations report)
- WA: Daily (next-day prices by 2:30pm)
- QLD: Daily
- SA: Daily

### Known Limitations
- No single national fuel price API exists. Each state has its own system.
- Victoria does not have a fuel price monitoring scheme. Requires third-party data or scraping (e.g., PetrolSpy, MotorMouth).
- Tasmania and NT have limited fuel price data availability.
- NSW FuelCheck API has occasional downtime and rate limits (check developer portal for current limits).

---

## 10. Tourism Data

**Layer**: Leisure & Lifestyle (Agent 7)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| Tourism Research Australia (TRA) | `https://www.tra.gov.au/en/data-and-research` | International and domestic visitor statistics |
| ATDW -- Australian Tourism Data Warehouse | `https://atdw.com.au/` | Listings for attractions, events, accommodation |
| data.gov.au Tourism | `https://data.gov.au/search?q=tourism` | Various tourism datasets |
| National Parks | State-specific (see below) | Park locations, facilities, alerts |

### Authentication
- **TRA**: Public reports, no auth
- **ATDW**: Commercial API. Requires partnership agreement.
- **data.gov.au**: Public, no auth

### Data Format
- CSV / Excel (TRA)
- JSON (ATDW API)
- Various (data.gov.au)

### Update Frequency
- TRA: Quarterly
- ATDW: Near real-time (listings updated by operators)

### National Parks APIs

| State | URL |
|---|---|
| NSW NPWS | `https://www.nationalparks.nsw.gov.au/visit-a-park` |
| VIC Parks | `https://www.parks.vic.gov.au/` |
| QLD QPWS | `https://parks.des.qld.gov.au/` |

### Known Limitations
- ATDW is the best structured source but requires a commercial agreement.
- TRA data has significant lag (6+ months for quarterly releases).
- National park data varies wildly by state. No single API.
- Event data requires aggregation from multiple sources (Eventbrite API, local council feeds, etc.)

---

## 11. Parliament Data

**Layer**: Government Performance (Agent 7)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| Parliament of Australia Open Data | `https://www.aph.gov.au/About_Parliament/Parliamentary_Departments/Parliamentary_Library/pubs/rp/rp2021/Quick_Guides/OpenData` | Bills, Hansard, committee reports |
| APH API (Hansard) | `https://api.aph.gov.au/hansard` | Parliamentary debates, questions, answers |
| They Vote For You | `https://theyvoteforyou.org.au/api/v1/` | MP voting records, attendance, rebellion rates |
| OpenAustralia | `https://www.openaustralia.org.au/api/` | Hansard search, MP profiles, appearances |

### Authentication
- **APH API**: No auth (public)
- **They Vote For You**: API key required (free, register at site)
- **OpenAustralia**: API key required (free, register at site)

### Data Format
- JSON / XML (all APIs)
- PDF (committee reports, tabled documents)

### Update Frequency
- Hansard: Published within days of parliamentary sitting
- Voting records: Updated per sitting day
- OpenAustralia: Near real-time during sitting weeks

### Known Limitations
- Federal parliament only. State parliament data requires separate sources:
  - NSW: `https://www.parliament.nsw.gov.au/hansard`
  - VIC: `https://www.parliament.vic.gov.au/hansard`
  - QLD: `https://www.parliament.qld.gov.au/work-of-the-assembly/hansard`
- They Vote For You is community-maintained. May have gaps.
- Linking MP activity to geographic impact requires manual postcode-to-electorate mapping.

---

## 12. Health Data

**Layer**: Health & Hospitals (Agent 7)

### Endpoints

| Endpoint | URL | Data |
|---|---|---|
| AIHW Data Portal | `https://www.aihw.gov.au/reports-data` | Hospital statistics, disease prevalence, health expenditure |
| MyHospitals | `https://www.aihw.gov.au/reports-data/myhospitals` | Hospital profiles, wait times, performance |
| NSW Health Stats | `https://www.health.nsw.gov.au/Hospitals/Pages/ed-wait-times.aspx` | Emergency department wait times (near real-time) |

### Authentication
- AIHW: Public, no auth
- State health departments: Public, no auth

### Data Format
- CSV / Excel (AIHW)
- HTML (MyHospitals, state wait times -- no API)

### Update Frequency
- AIHW: Annual reports
- Emergency wait times: Updated every 15-30 minutes (state-specific)

### Known Limitations
- MyHospitals has no API. Data is web-only.
- Real-time wait times vary by state. Only NSW and VIC publish them digitally.
- Hospital location data (coordinates) available from AIHW but may need geocoding.

---

## 13. Additional Data Sources

### ABS Geospatial

| Dataset | Use | URL |
|---|---|---|
| Postcode boundaries | Choropleth maps, postcode lookups | ABS ASGS boundary files |
| SA1-SA4 boundaries | Statistical area analysis | ABS ASGS boundary files |
| Mesh Blocks | Fine-grained demographic analysis | ABS ASGS boundary files |

Download from: `https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files`

### data.gov.au

General-purpose Australian open data portal. Search for specific datasets: `https://data.gov.au/search`

Notable datasets:
- National public toilet map
- Aged care facilities
- Childcare service locations
- NBN rollout data

### Reserve Bank of Australia (RBA)

| Endpoint | URL | Data |
|---|---|---|
| RBA Statistics Tables | `https://www.rba.gov.au/statistics/tables/` | Cash rate, exchange rates, lending rates |
| RBA Statistical Tables API | `https://api.rba.gov.au/` | Machine-readable economic indicators |

- Auth: None
- Format: JSON, CSV
- Update: Monthly (some daily)

---

## Data Ingestion Strategy

### Real-time layers (Energy, Traffic, Fuel)
1. Client hits our Next.js API route
2. API route checks `cached_data` table (TTL: 30s-5min)
3. On cache miss, fetches from external API
4. Validates with Zod, transforms to internal types
5. Stores in cache, returns to client
6. TanStack Query on client handles background refetch

### Batch layers (Crime, Demographics, Infrastructure, Education)
1. Scheduled job (cron or Supabase Edge Function) runs daily/weekly
2. Downloads CSV/Excel from government source
3. Parses and transforms to internal types
4. Upserts into Supabase tables with PostGIS geometry
5. Client queries our API route which reads from Supabase
6. TanStack Query caches for 24 hours

### Manual ingestion (Census, NAPLAN, one-off datasets)
1. Download dataset manually
2. Run import script (`scripts/import-{dataset}.ts`)
3. Script reads CSV/Shapefile, transforms, and inserts into Supabase
4. Data is served from Supabase thereafter
