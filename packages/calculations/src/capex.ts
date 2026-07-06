/**
 * Capital expenditure (CAPEX) and LCOE calculations.
 */

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface CapexInput {
  /** Total number of PV modules */
  numberOfModules: number;
  /** Cost per module (currency unit) */
  moduleUnitCost: number;
  /** Final inverter quantity */
  finalInverterQuantity: number;
  /** Cost per inverter (currency unit) */
  inverterUnitCost: number;
  /** PV DC capacity in MWp */
  pvDcCapacityMWp: number;
  /** Structure (racking/mounting) cost per MWp (currency unit) */
  structureCostPerMWp: number;
  /** Whether a BESS is included in the project */
  bessEnabled: boolean;
  /** BESS energy capacity in MWh (ignored when bessEnabled is false) */
  bessEnergyMWh: number;
  /** BESS cost per MWh (currency unit, ignored when bessEnabled is false) */
  bessCostPerMWh: number;
  /** Civil works cost per MWp (currency unit) */
  civilCostPerMWp: number;
  /** PV AC capacity in MWac */
  pvAcCapacityMWac: number;
  /** Electrical BOS cost per MWac (currency unit) */
  electricalCostPerMWac: number;
  /** Engineering, procurement, and construction management cost (currency unit) */
  engineeringCost: number;
  /** Contingency as a fraction of subtotal CAPEX (0–1, e.g. 0.05 for 5 %) */
  contingencyPct: number;
  /** Total lifetime energy production (MWh) — used for LCOE */
  lifetimeEnergy: number;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface CapexResult {
  /** Module procurement cost */
  moduleCapex: number;
  /** Inverter procurement cost */
  inverterCapex: number;
  /** Structure / racking cost */
  structureCapex: number;
  /** BESS procurement cost (0 if BESS not enabled) */
  bessCapex: number;
  /** Civil works cost */
  civilCapex: number;
  /** Electrical BOS cost */
  electricalCapex: number;
  /** Sum of all line items before contingency */
  subtotalCapex: number;
  /** Contingency allowance */
  contingency: number;
  /** Total project CAPEX */
  totalCapex: number;
  /** Specific CAPEX per MWp (DC) */
  capexPerMWp: number;
  /** Specific CAPEX per MWac (AC) */
  capexPerMWac: number;
  /** Simple (undiscounted) LCOE (currency unit per MWh) */
  simpleLcoe: number;
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates total project CAPEX and simple LCOE.
 *
 * @param input - Cost parameters and system sizing results.
 * @returns Detailed CAPEX breakdown and derived metrics.
 */
export function calculateCapex(input: CapexInput): CapexResult {
  const {
    numberOfModules,
    moduleUnitCost,
    finalInverterQuantity,
    inverterUnitCost,
    pvDcCapacityMWp,
    structureCostPerMWp,
    bessEnabled,
    bessEnergyMWh,
    bessCostPerMWh,
    civilCostPerMWp,
    pvAcCapacityMWac,
    electricalCostPerMWac,
    engineeringCost,
    contingencyPct,
    lifetimeEnergy,
  } = input;

  const moduleCapex = numberOfModules * moduleUnitCost;
  const inverterCapex = finalInverterQuantity * inverterUnitCost;
  const structureCapex = pvDcCapacityMWp * structureCostPerMWp;
  const bessCapex = bessEnabled ? bessEnergyMWh * bessCostPerMWh : 0;
  const civilCapex = pvDcCapacityMWp * civilCostPerMWp;
  const electricalCapex = pvAcCapacityMWac * electricalCostPerMWac;

  const subtotalCapex =
    moduleCapex +
    inverterCapex +
    structureCapex +
    bessCapex +
    civilCapex +
    electricalCapex +
    engineeringCost;

  const contingency = subtotalCapex * contingencyPct;
  const totalCapex = subtotalCapex + contingency;

  const capexPerMWp = totalCapex / pvDcCapacityMWp;
  const capexPerMWac = totalCapex / pvAcCapacityMWac;
  const simpleLcoe = totalCapex / lifetimeEnergy;

  return {
    moduleCapex,
    inverterCapex,
    structureCapex,
    bessCapex,
    civilCapex,
    electricalCapex,
    subtotalCapex,
    contingency,
    totalCapex,
    capexPerMWp,
    capexPerMWac,
    simpleLcoe,
  };
}
