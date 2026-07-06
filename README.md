# pv-mind-cockpit

PV Mind Cockpit is a cross-platform solar PV + BESS cockpit scaffold with web, mobile, desktop, and Supabase-ready backend layers.

## Stack

- **Web:** React, Vite, TypeScript, Tailwind CSS, shadcn-style UI components, Recharts, Lucide Icons, TanStack Query, Zustand, Supabase client
- **Mobile:** Expo React Native, Expo Router, TypeScript, NativeWind, TanStack Query, SecureStore-backed offline draft queue
- **Desktop:** Tauri wrapper for the web app
- **Backend:** Supabase-ready Postgres schema, auth/storage adapters, plus local mock repositories so the apps run without credentials

## Workspace layout

- `apps/web` — operator dashboard
- `apps/mobile` — field workflow app with offline drafts
- `apps/desktop` — macOS Tauri wrapper scaffold for the web app
- `packages/core` — shared domain types, mock repository, and Supabase-ready adapters
- `supabase` — SQL migrations

## Getting started

```bash
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm install
pnpm lint
pnpm typecheck
pnpm build
```

## Run apps

```bash
pnpm dev:web
pnpm dev:mobile
pnpm dev:desktop
```

By default, the apps use local mock data. Set Supabase environment variables in the app you want to connect when credentials are available.
