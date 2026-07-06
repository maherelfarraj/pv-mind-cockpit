# pv-mind-cockpit
PV_Mind Cockpit by GridMind EPC — cross-platform solar PV + BESS design, simulation, yield, CAPEX, BOM, SLD, SCADA, and reporting platform.

## SCADA Monitor (Simulated)

This repository now includes a browser-based SCADA monitor prototype with a simulated telemetry engine.

### Run

Open `/home/runner/work/pv-mind-cockpit/pv-mind-cockpit/index.html` in a browser.

### Included pages

- SCADA Overview
- Live Monitor
- Site Monitor
- Inverters
- BESS Monitor
- Weather Station
- Grid Meter
- Connectors
- Tag Dictionary
- Historian Trends
- Alarm Workbench
- Alarm → Work Orders
- Alarm SLA Aging
- Anomaly Board
- Anomaly RCA
- Work Orders
- Fleet KPIs
- KPI Variance
- Fleet Health
- Reports
- Settings

### Simulation coverage

Baselines:
- Expected Energy Today
- Expected Monthly Energy
- Expected Annual Energy
- Expected PR
- Expected Specific Yield
- Expected Availability
- Expected Losses
- Expected Power Curve
- Expected Inverter Output
- Expected Grid Injection
- Expected Power Factor

Live telemetry updates:
- Power output
- Energy
- Irradiance
- Temperature
- Wind speed
- Grid frequency
- Grid voltage
- Inverter status
- BESS SoC
- BESS temperature
- Alarm states
- Communication status

Rules implemented:
- Alarms are triggered when thresholds are crossed.
- Anomalies are created when actual energy is below expected.
- Work orders are created from alarms.
- RCA suggestions are draft-only.
- Fleet health score is calculated continuously.
