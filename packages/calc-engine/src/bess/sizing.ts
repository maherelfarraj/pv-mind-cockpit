import { safeNumber, safeDivide, safeProduct, allPositive, type SafeNumber } from '../utils/safe-math';

export interface BESSInputs {
  /** Daily energy to be stored / discharged in kWh */
  requiredEnergyKWh: number;
  /** Depth of discharge (0–1, e.g. 0.90) */
  dod: number;
  /** Round-trip efficiency (0–1, e.g. 0.92) */
  roundTripEfficiency: number;
  /** Desired backup duration in hours */
  backupHours: number;
  /** Nominal cell/module voltage in V */
  nominalVoltageV: number;
  /** Nominal cell/module capacity in Ah */
  nominalCapacityAh: number;
  /** Number of cells/modules in series per string */
  seriesCount: number;
  /** Number of parallel strings */
  parallelCount: number;
}

export interface BESSResult {
  /** Required usable energy in kWh */
  usableEnergyKWh: SafeNumber;
  /** Required gross (nameplate) capacity in kWh */
  grossCapacityKWh: SafeNumber;
  /** Peak power rating in kW */
  peakPowerKW: SafeNumber;
  /** Configured capacity from cell arrangement in kWh */
  configuredCapacityKWh: SafeNumber;
  /** Total cell/module count */
  totalCellCount: SafeNumber;
  /** System voltage in V */
  systemVoltageV: SafeNumber;
  /** C-rate at peak power */
  cRate: SafeNumber;
}

export function sizeBESS(inputs: Partial<BESSInputs>): BESSResult {
  const {
    requiredEnergyKWh,
    dod,
    roundTripEfficiency,
    backupHours,
    nominalVoltageV,
    nominalCapacityAh,
    seriesCount,
    parallelCount,
  } = inputs;

  // Usable = required / RTE
  const usableEnergyKWh =
    allPositive(requiredEnergyKWh, roundTripEfficiency)
      ? safeDivide(requiredEnergyKWh!, roundTripEfficiency!)
      : null;

  // Gross = usable / DoD
  const grossCapacityKWh =
    usableEnergyKWh !== null && allPositive(dod)
      ? safeDivide(usableEnergyKWh, dod!)
      : null;

  // Peak power = usable / backup hours
  const peakPowerKW =
    usableEnergyKWh !== null && allPositive(backupHours)
      ? safeDivide(usableEnergyKWh, backupHours!)
      : null;

  // Configured capacity from cell arrangement
  const configuredCapacityKWh =
    allPositive(nominalVoltageV, nominalCapacityAh, seriesCount, parallelCount)
      ? safeNumber(
          (nominalVoltageV! * seriesCount! * nominalCapacityAh! * parallelCount!) / 1000,
        )
      : null;

  // Total cell count
  const totalCellCount =
    allPositive(seriesCount, parallelCount)
      ? safeProduct(seriesCount!, parallelCount!)
      : null;

  // System voltage
  const systemVoltageV =
    allPositive(nominalVoltageV, seriesCount)
      ? safeProduct(nominalVoltageV!, seriesCount!)
      : null;

  // C-rate = peakPower / grossCapacity (both in consistent units)
  const cRate =
    peakPowerKW !== null && grossCapacityKWh !== null
      ? safeDivide(peakPowerKW, grossCapacityKWh)
      : null;

  return {
    usableEnergyKWh,
    grossCapacityKWh,
    peakPowerKW,
    configuredCapacityKWh,
    totalCellCount,
    systemVoltageV,
    cRate,
  };
}
