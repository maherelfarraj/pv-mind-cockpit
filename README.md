# PV_Mind Cockpit

PV_Mind Cockpit mobile app for [pvmind.ai](https://pvmind.ai) — a GridMind EPC Solar PV + BESS Design, Simulation, Yield, SCADA, and Reporting Platform.

## Official URLs

| URL | Purpose |
| --- | --- |
| https://pvmind.ai | Public landing / marketing |
| https://www.pvmind.ai | Redirects to pvmind.ai |
| https://app.pvmind.ai | Authenticated web application |
| https://api.pvmind.ai | API / webhook endpoint |

## Mobile screens

- Dashboard
- Projects
- Project Detail
- PV Summary
- BESS Summary
- Yield Summary
- CAPEX Summary
- SCADA Live
- Alarms
- Work Orders
- Reports
- Settings

## Included mobile behaviors

- Bottom tab navigation
- Responsive card layouts
- Offline work-order draft save
- Automatic draft sync when connectivity returns
- Photo attachment placeholder for work orders
- Push notification placeholder
- Deep-link auth callback at `pvmind://auth/callback`
- Web auth callback at `https://app.pvmind.ai/auth/callback`

## Environment variables

Copy `.env.example` to `.env` and adjust values as needed. Production builds use the official `pvmind.ai` domain:

```bash
EXPO_PUBLIC_APP_URL="https://app.pvmind.ai"
EXPO_PUBLIC_PUBLIC_URL="https://pvmind.ai"
EXPO_PUBLIC_API_URL="https://api.pvmind.ai"
```

## Mobile app identity

| Setting | Value |
| --- | --- |
| Display name | PV_Mind |
| iOS bundle ID | ai.pvmind.app |
| Android package | ai.pvmind.app |
| Deep link scheme | pvmind:// |

## Run locally

```bash
npm install
npm run start
```

## DNS (GoDaddy)

Add domains in your hosting provider dashboard first, then copy the exact DNS records into GoDaddy:

- `@` → pvmind.ai
- `www` → www.pvmind.ai
- `app` → app.pvmind.ai
- `api` → api.pvmind.ai

Do not hardcode DNS values in application code.
