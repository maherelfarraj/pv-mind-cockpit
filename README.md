# pv-mind-cockpit

PV Mind Cockpit by GridMind EPC — a TypeScript monorepo for solar PV + BESS design, simulation, yield, CAPEX, BOM, SLD, SCADA, reporting, and platform services.

## Workspace layout

- `apps/web` — web client
- `apps/mobile` — mobile client
- `apps/desktop` — desktop client
- `packages/core` — shared domain logic
- `packages/ui` — shared UI primitives
- `packages/config` — shared configuration helpers
- `packages/database` — database access layer
- `packages/calculations` — PV and BESS calculations
- `packages/simulation` — simulation orchestration
- `packages/scada` — SCADA integration layer
- `packages/sld` — single-line diagram tooling
- `packages/reports` — reporting modules
- `packages/auth` — authentication flows and policies
- `packages/api` — API contracts and server utilities
- `supabase` — migrations, seeds, and edge functions
- `docs` — architecture, setup, deployment, domain, and module documentation

## Tooling

- Package manager: `pnpm`
- Task runner: `Turborepo`
- Language: `TypeScript`

## Getting started

1. Enable pnpm with Corepack: `corepack enable`
2. Install dependencies: `pnpm install`
3. Run checks: `pnpm lint && pnpm typecheck && pnpm build`
