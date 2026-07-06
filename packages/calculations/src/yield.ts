/**
 * PV energy yield and performance calculations.
 */

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface YieldInput {
  /** PV DC capacity in MWp */
  pvDcCapacityMWp: number;
  /** PV AC capacity in MWac */
  pvAcCapacityMWac: number;
  /**
   * Site-specific yield based on irradiance and losses (kWh/kWp/year).
   * Typically sourced from PVsyst or equivalent energy simulation software.
   */
  specificYieldKwhKwp: number;
  /** Total system loss fraction (0–1, e.g. 0.15 for 15 %) */
  totalLossPct: number;
  /**
   * Annual plane-of-array irradiance (kWh/m²/year).
   * Used for performance ratio calculation.
   */
  poaIrradiance: number;
  /** Year-1 net energy (MWh) — used as the base for degradation series */
  year1Energy: number;
  /** Annual degradation rate as a fraction (0–1, e.g. 0.005 for 0.5 %/year) */
  annualDegradationPct: number;
  /** Project lifetime in years */
  projectLifeYears: number;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface YieldResult {
  /** Gross annual energy before losses (MWh/year) */
  grossPvEnergyMWhYear: number;
  /** Net annual energy after losses (MWh/year) */
  netPvEnergyMWhYear: number;
  /** Performance ratio (dimensionless, 0–1) */
  performanceRatio: number;
  /** Capacity factor (dimensionless, 0–1) */
  capacityFactor: number;
  /** Energy production per year over project lifetime (MWh) */
  energyByYear: number[];
  /** Total lifetime energy production (MWh) */
  lifetimeEnergy: number;
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates annual and lifetime energy yield.
 *
 * @param input - Site, system, and financial parameters.
 * @returns Annual and lifetime energy results.
 */
export function calculateYield(input: YieldInput): YieldResult {
  const {
    pvDcCapacityMWp,
    pvAcCapacityMWac,
    specificYieldKwhKwp,
    totalLossPct,
    poaIrradiance,
    year1Energy,
    annualDegradationPct,
    projectLifeYears,
  } = input;

  const grossPvEnergyMWhYear = pvDcCapacityMWp * specificYieldKwhKwp;
  const netPvEnergyMWhYear = grossPvEnergyMWhYear * (1 - totalLossPct);

  const performanceRatio =
    netPvEnergyMWhYear / (pvDcCapacityMWp * poaIrradiance);

  const HOURS_PER_YEAR = 8_760;
  const capacityFactor =
    netPvEnergyMWhYear / (pvAcCapacityMWac * HOURS_PER_YEAR);

  // Year-n energy: E(n) = year1Energy × (1 − annualDegradationPct)^(n−1)
  const energyByYear: number[] = [];
  for (let n = 1; n <= projectLifeYears; n++) {
    const energyYearN =
      year1Energy * Math.pow(1 - annualDegradationPct, n - 1);
    energyByYear.push(energyYearN);
  }

  const lifetimeEnergy = energyByYear.reduce((sum, e) => sum + e, 0);

  return {
    grossPvEnergyMWhYear,
    netPvEnergyMWhYear,
    performanceRatio,
    capacityFactor,
    energyByYear,
    lifetimeEnergy,
  };
}
