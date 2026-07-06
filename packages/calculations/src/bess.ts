/**
 * Battery Energy Storage System (BESS) sizing and loss calculations.
 */

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface BessInput {
  /** BESS storage capacity in MWh */
  bessEnergyMWh: number;
  /** BESS rated power output in MW */
  bessPowerMW: number;
  /** Usable energy per container in MWh */
  containerSizeMWh: number;
  /** Rated power per PCS (Power Conversion System) unit in MW */
  pcsRatingMW: number;
  /** Depth of discharge as a fraction (0–1, e.g. 0.9 for 90 %) */
  depthOfDischarge: number;
  /** Round-trip efficiency as a fraction (0–1, e.g. 0.92 for 92 %) */
  roundTripEfficiency: number;
  /** Average full charge–discharge cycles per day */
  dailyCycles: number;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface BessResult {
  /** Discharge duration at rated power (hours) */
  bessDurationHours: number;
  /** Number of battery containers required */
  containerQuantity: number;
  /** Number of PCS units required */
  pcsQuantity: number;
  /** Net usable energy after DoD and RTE losses (MWh) */
  usableEnergyMWh: number;
  /** Annual energy delivered to the grid (MWh/year) */
  annualDischargeEnergyMWh: number;
  /** Annual round-trip losses (MWh/year) */
  bessLossesMWh: number;
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Performs BESS sizing and energy loss calculations.
 *
 * @param input - BESS design and operational parameters.
 * @returns Sizing and annual energy results.
 */
export function calculateBess(input: BessInput): BessResult {
  const {
    bessEnergyMWh,
    bessPowerMW,
    containerSizeMWh,
    pcsRatingMW,
    depthOfDischarge,
    roundTripEfficiency,
    dailyCycles,
  } = input;

  const bessDurationHours = bessEnergyMWh / bessPowerMW;
  const containerQuantity = Math.ceil(bessEnergyMWh / containerSizeMWh);
  const pcsQuantity = Math.ceil(bessPowerMW / pcsRatingMW);
  const usableEnergyMWh = bessEnergyMWh * depthOfDischarge * roundTripEfficiency;
  const annualDischargeEnergyMWh = usableEnergyMWh * dailyCycles * 365;
  const bessLossesMWh = bessEnergyMWh * 365 * (1 - roundTripEfficiency);

  return {
    bessDurationHours,
    containerQuantity,
    pcsQuantity,
    usableEnergyMWh,
    annualDischargeEnergyMWh,
    bessLossesMWh,
  };
}
