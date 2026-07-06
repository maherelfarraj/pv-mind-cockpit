# pv-mind-cockpit
PV_Mind Cockpit by GridMind EPC — cross-platform solar PV + BESS design, simulation, yield, CAPEX, BOM, SLD, SCADA, and reporting platform.

## Export lock engine

This repository now includes a standalone export-lock engine in `/home/runner/work/pv-mind-cockpit/pv-mind-cockpit/export-lock-engine.js`.

### API

- `evaluateExportLock(state)` returns:
  - `locked`: `true` when export must remain blocked
  - `ready`: inverse of `locked`
  - `blockers`: blocker labels matching the product language
  - `blockerIds`: stable machine-readable blocker IDs
  - `message`: locked or ready message
- `isExportLocked(state)` returns the lock boolean only
- `LOCKED_MESSAGE` and `READY_MESSAGE` expose the required copy
- `EXPORT_LOCK_RULES` exposes the blocker definitions and supported aliases

### Supported blockers

The engine locks export when any of the following checks fail:

- Project setup missing
- Weather file missing
- Variant missing
- Orientation not linked
- Sub-array incomplete
- PV module missing
- Inverter missing
- Stringing non-compliant
- MPPT non-compliant
- Physical connector limit exceeded
- Loss assumptions incomplete
- Horizon not reviewed
- Near shading not reviewed
- 3D scene mismatch unresolved
- P50/P90 missing
- Simulation not run
- Report not generated
- Critical SCADA alarms unacknowledged
- Required CAPEX missing
- BOM not generated

### Expected state shape

Pass a flat object of booleans. The engine accepts positive and negative aliases for each check so callers can use either readiness-style keys such as `projectSetupComplete` / `weatherFilePresent` / `simulationRun`, or blocker-style keys such as `projectSetupMissing` / `weatherFileMissing` / `simulationNotRun`.
