# Tech Stack

| Category | Choice | Why |
|----------|--------|-----|
| Monorepo | Turborepo + pnpm | Fast builds, workspace deps |
| Framework | Next.js 15 (App Router) | RSC, streaming, API routes |
| Language | TypeScript 5.8 | Type safety across full stack |
| Styling | Tailwind CSS 4 + shadcn/ui | Utility-first, accessible components |
| Maps | MapLibre GL JS 5 | Open source WebGL, no API key |
| Data Fetching | TanStack Query 5 | Cache, refetch, optimistic updates |
| Validation | Zod 3 | Runtime + static type inference |
| Database | PostgreSQL 16 + PostGIS | Spatial queries, mature ecosystem |
| Hosting (DB) | Supabase (AU region) | Managed Postgres, auth, realtime |
| Auth | NextAuth.js v5 | Session management, multiple providers |
| Charts | Recharts 2 | React-native charting, responsive |
| Deployment | Vercel (Sydney edge) | Edge functions, fast AU delivery |
| Testing | Vitest + Testing Library | Fast unit/integration tests |
