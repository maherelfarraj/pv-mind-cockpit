# PV Mind Cockpit

**PV_Mind Cockpit** by [GridMind EPC](https://pvmind.ai) — A cross-platform solar PV + BESS design, simulation, yield, CAPEX, SLD, SCADA, and reporting platform.

> **Official domain:** [pvmind.ai](https://pvmind.ai)

---

## Platform Support

| Platform | Target | Notes |
|----------|--------|-------|
| Web      | ✅ | Via Expo + Metro bundler |
| iOS      | ✅ | Native via Expo SDK |
| Android  | ✅ | Native via Expo SDK |
| macOS    | ✅ | Via Expo macOS target |

---

## Monorepo Structure

```
pv-mind-cockpit/
├── apps/
│   └── expo/              # Cross-platform app (Expo Router)
│       ├── app/
│       │   ├── (tabs)/
│       │   │   ├── index.tsx       # Dashboard
│       │   │   ├── design.tsx      # PV / BESS / CAPEX / SLD
│       │   │   ├── simulation.tsx  # Energy simulation
│       │   │   ├── yield.tsx       # Yield analysis
│       │   │   ├── scada.tsx       # Live SCADA monitoring
│       │   │   └── reports.tsx     # Report generation
│       │   └── project/
│       │       ├── new.tsx         # Create project
│       │       └── [id].tsx        # Project detail
│       └── src/
│           ├── config/env.ts       # Env-var config (no hardcoded URLs)
│           └── services/supabase.ts
│
├── packages/
│   ├── calc-engine/       # Shared calculation engine (TypeScript)
│   │   └── src/
│   │       ├── utils/safe-math.ts  # NaN/Infinity guard → "Needs Input"
│   │       ├── pv/sizing.ts        # PV array sizing
│   │       ├── pv/irradiance.ts    # POA irradiance / tilt optimization
│   │       ├── bess/sizing.ts      # BESS sizing
│   │       ├── yield/annual-yield.ts
│   │       ├── capex/estimate.ts   # CAPEX breakdown
│   │       └── sld/generator.ts    # SLD data model generator
│   │
│   ├── ui/                # Shared React Native design system
│   │   └── src/
│   │       ├── theme.ts            # Design tokens (colors, spacing, etc.)
│   │       ├── components/Button.tsx
│   │       ├── components/Input.tsx
│   │       ├── components/Card.tsx
│   │       ├── components/MetricCard.tsx  # Shows "Needs Input" for null
│   │       ├── components/SafeValue.tsx
│   │       ├── components/StatusBadge.tsx
│   │       └── components/SectionHeader.tsx
│   │
│   └── supabase/          # Supabase backend layer
│       ├── src/
│       │   ├── client.ts           # Singleton Supabase client (reads from env)
│       │   ├── types/database.ts   # Full TypeScript DB schema types
│       │   └── repositories/
│       │       ├── projects.ts
│       │       ├── simulations.ts
│       │       └── scada.ts        # Real-time SCADA subscriptions
│       └── supabase/
│           └── migrations/00001_init.sql  # Initial schema with RLS
```

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Expo CLI: `npm install -g expo`

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example apps/expo/.env
# Edit apps/expo/.env with your Supabase credentials
```

### 4. Run the app

```bash
# Web
cd apps/expo && npx expo start --web

# iOS
cd apps/expo && npx expo start --ios

# Android
cd apps/expo && npx expo start --android
```

### 5. Run tests

```bash
npm test --workspace=packages/calc-engine
```

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration: `packages/supabase/supabase/migrations/00001_init.sql`
3. Set env vars in `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>`

---

## Design Principles

- **No NaN or Infinity in UI** — all calculations use `safeNumber()` from `@pvmind/calc-engine`. Results display as **Needs Input** when data is missing.
- **No hardcoded URLs** — all Supabase URLs and keys come from `EXPO_PUBLIC_*` env vars.
- **No dead buttons** — every interactive element has a working handler.
- **No demo data** — projects are loaded from Supabase; the list starts empty.

---

## License

Proprietary — © GridMind EPC. All rights reserved.
