# pv-mind-cockpit

Simulation Studio prototype for PV project setup, detailed losses configuration, simulation execution, and reporting.

## Run locally

Because this is a static web app, open `index.html` directly in a browser, or serve the repository root with any static server.

Example:

```bash
python -m http.server 8080
```

Then browse to `http://localhost:8080`.

## Included workflow pages

- Project Setup
- Site & Weather
- Variants
- Orientation
- System / Sub-Arrays
- PV Module
- Inverter
- Stringing & MPPT
- Bifacial Setup
- Detailed Losses
- Horizon
- Near Shadings
- 3D Shading Scene
- Energy Management
- P50 / P90
- Run Simulation
- Results
- Loss Diagram
- Simulation Report

## Detailed Losses tabs

Each tab has form validation and a save action; saved values feed simulation outputs.

- Thermal Parameter
- Ohmic Losses
- Module Quality - LID - Mismatch
- Soiling Loss
- IAM Losses
- Auxiliaries
- Ageing
- Unavailability
- Spectral Correction
