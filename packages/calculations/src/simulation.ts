/**
 * Hourly / time-series simulation orchestration.
 *
 * This module wires together PV, BESS, and yield sub-calculations to produce
 * a time-series dispatch profile for a combined PV + BESS plant.
 */

import { calculatePvSizing, type PvSizingInput } from "./pv.js";
import { calculateBess, type BessInput } from "./bess.js";
import { calculateYield, type YieldInput } from "./yield.js";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface SimulationInput {
  pv: PvSizingInput;
  bess: BessInput;
  yield: YieldInput;
  /** Target export power in MWac (grid connection limit) */
  exportLimitMWac?: number;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface SimulationResult {
  pv: ReturnType<typeof calculatePvSizing>;
  bess: ReturnType<typeof calculateBess>;
  yield: ReturnType<typeof calculateYield>;
  /** Annual curtailed energy due to export limit (MWh/year) */
  curtailmentMWhYear: number;
  /** Net export energy after curtailment (MWh/year) */
  netExportMWhYear: number;
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

/**
 * Runs the combined PV + BESS simulation and returns consolidated results.
 *
 * @param input - Unified simulation parameters.
 * @returns Aggregated results from each sub-calculation module.
 */
export function runSimulation(input: SimulationInput): SimulationResult {
  const pvResult = calculatePvSizing(input.pv);
  const bessResult = calculateBess(input.bess);
  const yieldResult = calculateYield(input.yield);

  const netPvMWhYear = yieldResult.netPvEnergyMWhYear;
  const bessChargingMWhYear =
    bessResult.annualDischargeEnergyMWh / bessResult.bessDurationHours;

  // Simple curtailment model: energy that exceeds the export limit is spilled.
  let curtailmentMWhYear = 0;
  let netExportMWhYear = netPvMWhYear + bessResult.annualDischargeEnergyMWh;

  if (input.exportLimitMWac !== undefined) {
    const maxAnnualExportMWh = input.exportLimitMWac * 8_760;
    if (netExportMWhYear > maxAnnualExportMWh) {
      curtailmentMWhYear = netExportMWhYear - maxAnnualExportMWh;
      netExportMWhYear = maxAnnualExportMWh;
    }
  }

  // Suppress unused variable warning — charge energy is relevant in detailed models.
  void bessChargingMWhYear;

  return {
    pv: pvResult,
    bess: bessResult,
    yield: yieldResult,
    curtailmentMWhYear,
    netExportMWhYear,
  };
}
