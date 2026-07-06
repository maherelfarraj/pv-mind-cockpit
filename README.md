# PV Mind Cockpit

PV Mind Cockpit by **GridMind EPC** is a cross-platform platform for end-to-end solar PV and BESS engineering workflows, including:
- site and system design
- simulation and yield analysis
- CAPEX and BOM generation
- SLD and reporting workflows
- SCADA-oriented operational views

---

## Product Overview

PV Mind Cockpit is designed to reduce handoffs between engineering, procurement, and operations teams by keeping technical and financial project data in one product.

Primary goals:
- accelerate feasibility and detailed design cycles
- standardize calculations and documentation output
- support collaboration across web, mobile, and desktop environments
- integrate data and auth with Supabase

---

## Tech Stack

Planned/target stack:
- **Frontend app**: Flutter (single codebase for Web, Android/iOS, Windows/macOS/Linux)
- **Backend services**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **State/data layer**: Supabase client SDK + typed model layer
- **Infrastructure/deployment**:
  - Web: Vercel or Netlify
  - API/DB/Auth/Storage: Supabase Cloud
  - Domain + DNS: Cloudflare / registrar DNS
- **CI/CD**: GitHub Actions

> This repository currently contains documentation only and will expand as implementation phases progress.

---

## Repository Structure

Current structure:

```text
pv-mind-cockpit/
└── README.md
```

Target structure (as implementation is added):

```text
pv-mind-cockpit/
├── apps/
│   ├── web/                # web entrypoint/config
│   ├── mobile/             # mobile entrypoint/config
│   └── desktop/            # desktop entrypoint/config
├── lib/
│   ├── core/               # shared app/core modules
│   ├── features/           # domain features (design, yield, CAPEX, etc.)
│   └── services/           # API/Supabase integrations
├── supabase/
│   ├── migrations/         # database migrations
│   ├── seed.sql            # local seed data
│   └── functions/          # edge functions
├── docs/
│   ├── architecture/
│   └── product/
└── README.md
```

---

## Setup Instructions

### 1) Prerequisites
- Git
- Flutter SDK (stable channel)
- Dart SDK (bundled with Flutter)
- Supabase CLI
- Android Studio / Xcode (for mobile targets)
- OS-specific desktop build tools:
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: clang/cmake/ninja/GTK dev packages

### 2) Clone the repository
```bash
git clone https://github.com/maherelfarraj/pv-mind-cockpit.git
cd pv-mind-cockpit
```

### 3) Configure environment
Create `.env` from your template (or manually):
```bash
cp .env.example .env
```

### 4) Install dependencies
```bash
flutter pub get
```

### 5) Validate toolchain
```bash
flutter doctor
```

---

## Environment Variables

Use a `.env` file at the repository root.

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Service role key (never expose in client builds) |
| `SUPABASE_DB_PASSWORD` | Local/dev | DB password for local CLI workflows |
| `APP_ENV` | Yes | `local`, `staging`, or `production` |
| `APP_VERSION` | Optional | App/version label for diagnostics |
| `SENTRY_DSN` | Optional | Error monitoring DSN |
| `API_BASE_URL` | Optional | Additional API base URL if non-Supabase services are used |
| `WEB_BASE_URL` | Yes (web) | Public web URL (for links/callbacks) |

Security notes:
- never commit real `.env` values
- treat `SUPABASE_SERVICE_ROLE_KEY` as secret/server-side only

---

## Running Web

```bash
flutter config --enable-web
flutter run -d chrome
```

Build production web bundle:
```bash
flutter build web --release
```

---

## Running Mobile

### Android
```bash
flutter run -d android
```

### iOS (macOS only)
```bash
flutter run -d ios
```

Build artifacts:
```bash
flutter build apk --release
flutter build ipa --release
```

---

## Running Desktop

Enable targets (as needed):
```bash
flutter config --enable-windows-desktop
flutter config --enable-macos-desktop
flutter config --enable-linux-desktop
```

Run desktop target:
```bash
flutter run -d windows
# or: -d macos / -d linux
```

Build desktop binaries:
```bash
flutter build windows --release
flutter build macos --release
flutter build linux --release
```

---

## Supabase Setup

### 1) Create project
- Create a new Supabase project for each environment (`staging`, `production`).
- Record URL and keys in `.env`.

### 2) Link local repo to Supabase project
```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 3) Local development stack
```bash
supabase start
supabase db reset
```

### 4) Schema migrations
```bash
supabase migration new <name>
supabase db push
```

### 5) Deploy edge functions
```bash
supabase functions deploy <function-name>
```

Recommended baseline:
- enable Row Level Security on all app tables
- define explicit policies per role/use-case
- keep service-role operations server-side only

---

## Domain Setup for `pvmind.ai`

### DNS records
At your DNS provider, configure:
- `A` / `ALIAS` record for root (`pvmind.ai`) to your web hosting target
- `CNAME` for `www.pvmind.ai` to your hosting target
- optional `CNAME` for `api.pvmind.ai` if routing custom APIs

### SSL/TLS
- enable automatic TLS certificates (Let’s Encrypt or provider-managed)
- enforce HTTPS redirect

### App/Auth URL alignment
In Supabase Auth settings, configure:
- Site URL: `https://pvmind.ai`
- Redirect URLs:
  - `https://pvmind.ai/*`
  - `https://www.pvmind.ai/*`
  - local dev callback URL(s)

### Verification checklist
- root and `www` resolve correctly
- TLS certificate active
- auth login/logout callbacks succeed on production domain

---

## Deployment Notes

Environment model:
- `local` for development
- `staging` for QA/UAT
- `production` for live releases

Recommended flow:
1. merge changes into main branch
2. run CI checks (format/lint/tests/build)
3. deploy to staging
4. run smoke/UAT checks
5. promote to production

Web deployment outputs:
- host `build/web` artifacts using Vercel/Netlify or equivalent CDN hosting

Release hygiene:
- tag production releases
- maintain migration discipline (forward-only, reviewed)
- keep rollback plan for web deploys and database changes

---

## Development Phases

### Phase 1 — Foundation
- project scaffolding and architecture baseline
- Supabase project initialization
- authentication and user/session management

### Phase 2 — Core Engineering Modules
- PV/BESS input workflows
- simulation/yield engine integration
- BOM and CAPEX model first release

### Phase 3 — Outputs & Documentation
- SLD generation pipeline
- reporting engine (PDF/exports)
- design review and approval workflows

### Phase 4 — Operations & Monitoring
- SCADA data integration points
- dashboards for performance/alerts
- user roles and operational controls

### Phase 5 — Hardening & Scale
- performance optimization
- security hardening and audit checks
- observability, backup, and reliability enhancements

---

## Notes

If you want, the next step can be adding:
- `.env.example`
- starter Flutter project scaffolding
- initial Supabase migration and seed files
- CI workflow skeleton
