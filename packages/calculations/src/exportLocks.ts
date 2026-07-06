/**
 * Export lock / grid connection limit calculations.
 *
 * Determines curtailment losses and ramp rates imposed by the grid connection
 * agreement (GCA) or distribution network operator (DNO) export limits.
 */

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface ExportLocksInput {
  /** Net AC export power limit imposed by the grid connection agreement (MW) */
  exportLimitMWac: number;
  /** Unconstrained annual net generation (MWh/year) */
  unconstrainedAnnualEnergyMWh: number;
  /** Unconstrained peak AC power output (MW) */
  unconstrainedPeakPowerMWac: number;
  /** Maximum ramp-up rate allowed by the DNO (MW/minute, optional) */
  maxRampUpMWperMin?: number;
  /** Maximum ramp-down rate allowed by the DNO (MW/minute, optional) */
  maxRampDownMWperMin?: number;
  /** Availability factor as a fraction (0–1, e.g. 0.98) */
  availabilityFactor: number;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface ExportLocksResult {
  /** Annual curtailment loss (MWh/year) — energy that cannot be exported */
  curtailmentMWhYear: number;
  /** Curtailment as a fraction of unconstrained generation (0–1) */
  curtailmentFraction: number;
  /** Net constrained annual export (MWh/year) */
  constrainedAnnualExportMWh: number;
  /** Whether the peak generation exceeds the export limit */
  peakExceedsLimit: boolean;
  /** Capacity that must be curtailed at peak (MW, 0 if no curtailment) */
  curtailedPeakCapacityMW: number;
  /** Maximum ramp-up rate (MW/minute), echoed from input or undefined */
  maxRampUpMWperMin: number | undefined;
  /** Maximum ramp-down rate (MW/minute), echoed from input or undefined */
  maxRampDownMWperMin: number | undefined;
  /** Effective export after availability derating (MWh/year) */
  effectiveExportMWhYear: number;
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates curtailment losses and constrained export metrics.
 *
 * Uses a simplified model: annual curtailment is estimated proportionally
 * based on the ratio of curtailed peak capacity to unconstrained peak power.
 * A full time-series model should be used for final yield assessments.
 *
 * @param input - Grid connection and generation parameters.
 * @returns Curtailment losses and constrained export results.
 */
export function calculateExportLocks(
  input: ExportLocksInput
): ExportLocksResult {
  const {
    exportLimitMWac,
    unconstrainedAnnualEnergyMWh,
    unconstrainedPeakPowerMWac,
    maxRampUpMWperMin,
    maxRampDownMWperMin,
    availabilityFactor,
  } = input;

  const peakExceedsLimit = unconstrainedPeakPowerMWac > exportLimitMWac;
  const curtailedPeakCapacityMW = peakExceedsLimit
    ? unconstrainedPeakPowerMWac - exportLimitMWac
    : 0;

  // Proportional curtailment estimate
  const curtailmentFraction = peakExceedsLimit
    ? curtailedPeakCapacityMW / unconstrainedPeakPowerMWac
    : 0;

  const curtailmentMWhYear = unconstrainedAnnualEnergyMWh * curtailmentFraction;
  const constrainedAnnualExportMWh =
    unconstrainedAnnualEnergyMWh - curtailmentMWhYear;

  const effectiveExportMWhYear = constrainedAnnualExportMWh * availabilityFactor;

  return {
    curtailmentMWhYear,
    curtailmentFraction,
    constrainedAnnualExportMWh,
    peakExceedsLimit,
    curtailedPeakCapacityMW,
    maxRampUpMWperMin,
    maxRampDownMWperMin,
    effectiveExportMWhYear,
  };
}
