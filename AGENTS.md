# AGENTS.md

## Cursor Cloud specific instructions

### Codebase note
`main` currently only contains `README.md`. The actual application lives on unmerged
`copilot/*` feature branches. This environment was set up against
`copilot/pvmind-setup-repository`, the foundational Expo monorepo for **PV Mind Cockpit**
(a solar PV + BESS design / simulation / SCADA / reporting platform). If you are working
on a different feature branch, adjust accordingly.

### Services / layout
- `apps/expo` — cross-platform Expo Router app (web / iOS / Android). Web is the target that runs in this VM.
- `packages/calc-engine` — TypeScript calculation engine (PV/BESS sizing, yield, CAPEX, SLD). Has Jest tests.
- `packages/ui`, `packages/supabase` — resolved from source (`main` → `src/index.ts`), no build step.

### Running / testing (standard commands live in `README.md` and each `package.json`)
- Run the web app: `cd apps/expo && EXPO_USE_METRO_WORKSPACE_ROOT=1 npx expo start --web --port 8081`, then open `http://localhost:8081`.
- Tests: `npm test --workspace=packages/calc-engine` (Jest).
- Typecheck: `npm run typecheck --workspace=packages/calc-engine`.

### Non-obvious gotchas
- **The web dev server MUST be started with `EXPO_USE_METRO_WORKSPACE_ROOT=1`.** Because `npm`
  workspaces hoist `node_modules` to the repo root, without this env var Expo emits a bundle URL
  like `/../../node_modules/expo-router/entry.bundle` which browsers normalize to
  `/node_modules/...` → **404 / blank page** (note: `curl --path-as-is` hides this because it does
  not normalize the path). The env var makes the workspace root Metro's server root so the URL
  becomes a resolvable `/node_modules/...`.
- **`calc-engine` must be built before the app can bundle.** The app imports `@pvmind/calc-engine`
  whose `package.json` `main`/`exports` point at `dist/`, so run
  `npm run build --workspace=packages/calc-engine` after installing/changing it. `ui` and
  `supabase` resolve from `src` and need no build.
- **Root `npm run build` / `turbo` fails**: installed Turbo (2.10.x) requires a `packageManager`
  field that this scaffold's `package.json` lacks (`Could not resolve workspace`). Build/test
  packages directly with `npm run <script> --workspace=<pkg>` instead of the root turbo scripts.
- **Supabase is optional for local dev.** With `EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` empty the app
  logs a warning and runs; the Design/Simulation/Yield tabs use the local `calc-engine` and work
  fully offline. Create `apps/expo/.env` from `.env.example` (it is git-ignored).
- **`npm run lint` for `calc-engine`/`ui`/`supabase` fails**: no ESLint config file is committed in
  this branch, so ESLint errors with "couldn't find a configuration file". Lint is effectively
  unconfigured here.
- Expo rewrites `apps/expo/tsconfig.json` and `apps/expo/expo-env.d.ts` on start (formatting +
  `.expo/types`). This churn is safe to discard; do not commit it.
