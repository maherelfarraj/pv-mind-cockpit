# PV Mind Cockpit Desktop Scaffold

Tauri desktop scaffold for macOS-focused PV Mind Cockpit workflows.

## Included desktop modules

- Large dashboard layout
- Simulation workspace
- SCADA monitor
- Project import/export (JSON)
- Report preview
- Local cache (browser storage)
- Window resizing support
- Keyboard shortcuts

## Keyboard shortcuts

- `Cmd/Ctrl + 1`: Focus dashboard
- `Cmd/Ctrl + 2`: Focus simulation workspace
- `Cmd/Ctrl + 3`: Focus SCADA monitor
- `Cmd/Ctrl + I`: Import project JSON
- `Cmd/Ctrl + E`: Export project JSON
- `Cmd/Ctrl + S`: Save local cache snapshot

## Development

```bash
npm install
npm run dev
npm run tauri dev
```

## Build

```bash
npm run build
npm run tauri build
```
