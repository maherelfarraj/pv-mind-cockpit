import {
  safeNumber,
  safeDivide,
  safeProduct,
  allPositive,
  type SafeNumber,
} from '../utils/safe-math';

/** Inputs for PV system sizing. All power/energy in SI units as noted. */
export interface PVSizingInputs {
  /** Daily energy demand in kWh */
  dailyLoadKWh: number;
  /** Average peak sun hours per day (h/day) */
  peakSunHours: number;
  /** Overall system efficiency/loss factor (0–1, e.g. 0.80) */
  systemEfficiency: number;
  /** Module rated STC power in Wp */
  modulePowerWp: number;
  /** Module area in m² */
  moduleAreaM2: number;
  /** Number of modules per string */
  modulesPerString: number;
  /** Number of strings */
  strings: number;
}

export interface PVSizingResult {
  /** Required DC array power in kWp */
  arrayPowerKWp: SafeNumber;
  /** Minimum number of modules */
  moduleCount: SafeNumber;
  /** Recommended inverter AC output in kW */
  inverterCapacityKW: SafeNumber;
  /** Estimated annual AC energy production in MWh */
  annualProductionMWh: SafeNumber;
  /** Specific yield in kWh/kWp/yr */
  specificYieldKWhKWp: SafeNumber;
  /** Total array area in m² */
  totalArrayAreaM2: SafeNumber;
  /** DC/AC ratio */
  dcAcRatio: SafeNumber;
}

export function sizePVSystem(inputs: Partial<PVSizingInputs>): PVSizingResult {
  const {
    dailyLoadKWh,
    peakSunHours,
    systemEfficiency,
    modulePowerWp,
    moduleAreaM2,
    modulesPerString,
    strings,
  } = inputs;

  // Required array power: load / (PSH × efficiency)
  const arrayPowerKWp =
    allPositive(dailyLoadKWh, peakSunHours, systemEfficiency)
      ? safeDivide(
          dailyLoadKWh! ,
          peakSunHours! * systemEfficiency!,
        )
      : null;

  // Number of modules = arrayPower (W) / module power (Wp)
  const moduleCount =
    arrayPowerKWp !== null && allPositive(modulePowerWp)
      ? safeNumber(Math.ceil((arrayPowerKWp * 1000) / modulePowerWp!))
      : null;

  // Inverter capacity = array power (AC sizing at 1:1 base)
  const inverterCapacityKW =
    arrayPowerKWp !== null ? safeNumber(arrayPowerKWp) : null;

  // Annual production = arrayPower × PSH × 365 × efficiency
  const annualProductionMWh =
    arrayPowerKWp !== null && allPositive(peakSunHours, systemEfficiency)
      ? safeNumber(
          (arrayPowerKWp * peakSunHours! * 365 * systemEfficiency!) / 1000,
        )
      : null;

  // Specific yield = annual (kWh) / arrayPowerKWp
  const specificYieldKWhKWp =
    annualProductionMWh !== null && arrayPowerKWp !== null
      ? safeDivide(annualProductionMWh * 1000, arrayPowerKWp)
      : null;

  // Total area
  const totalArrayAreaM2 =
    moduleCount !== null && allPositive(moduleAreaM2)
      ? safeProduct(moduleCount, moduleAreaM2!)
      : null;

  // DC/AC ratio
  const configuredDCkWp =
    allPositive(modulesPerString, strings, modulePowerWp)
      ? safeNumber(
          (modulesPerString! * strings! * modulePowerWp!) / 1000,
        )
      : null;
  const dcAcRatio =
    configuredDCkWp !== null && inverterCapacityKW !== null
      ? safeDivide(configuredDCkWp, inverterCapacityKW)
      : null;

  return {
    arrayPowerKWp,
    moduleCount,
    inverterCapacityKW,
    annualProductionMWh,
    specificYieldKWhKWp,
    totalArrayAreaM2,
    dcAcRatio,
  };
}
