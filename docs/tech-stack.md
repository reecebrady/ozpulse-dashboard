# Tech Stack

| Category | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js 15 (App Router) | Server components, API routes, Vercel deploy |
| Language | TypeScript 5.8 | Type safety across monorepo |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration |
| UI Primitives | Radix UI | Accessible, unstyled, composable |
| Map | MapLibre GL JS v5 | OSS, no API key, vector tiles |
| State | Zustand | Simple, performant, middleware |
| Data Fetching | TanStack Query v5 | Caching, refetch, stale management |
| Validation | Zod | Runtime type checking for API data |
| Charts | Recharts | React-native charting, good defaults |
| Database | Supabase (PostGIS) | AU-hosted, real-time, spatial queries |
| Auth | Clerk or NextAuth | Optional, for profile sync |
| Monorepo | Turborepo | Parallel builds, caching |
