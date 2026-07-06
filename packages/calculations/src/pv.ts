/**
 * PV system sizing and string design calculations.
 */

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface PvSizingInput {
  /** Nameplate DC capacity in MWp */
  pvDcCapacityMWp: number;
  /** Nameplate AC capacity in MWac */
  pvAcCapacityMWac: number;
  /** Single module power at STC in Wp */
  modulePowerWp: number;
  /** Module open-circuit voltage at STC (V) */
  moduleVoc: number;
  /** Module maximum-power-point voltage at STC (V) */
  moduleVmp: number;
  /** Module maximum-power-point current at STC (A) */
  moduleImp: number;
  /** Temperature coefficient of Voc (%/°C, e.g. -0.0029) */
  tempCoeffVoc: number;
  /** Temperature coefficient of Pmax (%/°C, e.g. -0.0035) */
  tempCoeffPmax: number;
  /** Minimum site ambient temperature (°C) */
  minSiteTemp: number;
  /** Maximum site ambient temperature (°C) */
  maxSiteTemp: number;
  /** Maximum system DC voltage (V) */
  maxSystemVoltage: number;
  /** MPPT lower voltage limit (V) */
  mpptVoltageMin: number;
  /** MPPT upper voltage limit (V) */
  mpptVoltageMax: number;
  /** Maximum current per MPPT input (A) */
  maxCurrentPerMppt: number;
  /** Number of MPPT inputs per inverter */
  mpptCount: number;
  /** Inverter rated AC power (kW) */
  inverterRatedPowerKw: number;
  /** Modules wired in series per string (design choice) */
  modulesPerString: number;
  /** Maximum physical DC connectors per inverter (optional) */
  maxDcConnectorsPerInverter?: number;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface PvSizingResult {
  /** DC capacity converted to Wp */
  pvDcCapacityWp: number;
  /** AC capacity converted to kW */
  pvAcCapacityKw: number;
  /** Total number of modules required */
  numberOfModules: number;
  /** Voc corrected for cold (low) temperature (V) */
  correctedColdVoc: number;
  /** Vmp corrected for hot (high) temperature (V) */
  correctedHotVmp: number;
  /** Maximum allowable modules per string */
  maxModulesPerString: number;
  /** Minimum allowable modules per string */
  minModulesPerString: number;
  /** Total number of strings */
  numberOfStrings: number;
  /** Strings per MPPT input */
  stringsPerMppt: number;
  /** Strings per inverter */
  stringsPerInverter: number;
  /** Inverter quantity driven by AC capacity */
  inverterQuantityByAC: number;
  /** Inverter quantity driven by string count */
  inverterQuantityByString: number;
  /** Final (adopted) inverter quantity */
  finalInverterQuantity: number;
  /** DC/AC ratio */
  dcAcRatio: number;
  /** List of validation warnings */
  warnings: PvValidationWarning[];
}

export interface PvValidationWarning {
  code: PvWarningCode;
  message: string;
  value?: number;
  limit?: number;
}

export type PvWarningCode =
  | "COLD_VOC_EXCEEDS_SYSTEM_VOLTAGE"
  | "HOT_VMP_BELOW_MPPT_MIN"
  | "MPPT_CURRENT_EXCEEDED"
  | "DC_CONNECTORS_EXCEEDED"
  | "DC_AC_RATIO_HIGH";

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Performs PV system sizing and string design calculations.
 *
 * @param input - All required electrical and site parameters.
 * @returns Sizing results together with any validation warnings.
 */
export function calculatePvSizing(input: PvSizingInput): PvSizingResult {
  const {
    pvDcCapacityMWp,
    pvAcCapacityMWac,
    modulePowerWp,
    moduleVoc,
    moduleVmp,
    moduleImp,
    tempCoeffVoc,
    tempCoeffPmax,
    minSiteTemp,
    maxSiteTemp,
    maxSystemVoltage,
    mpptVoltageMin,
    mpptVoltageMax,
    maxCurrentPerMppt,
    mpptCount,
    inverterRatedPowerKw,
    modulesPerString,
    maxDcConnectorsPerInverter,
  } = input;

  // Unit conversions
  const pvDcCapacityWp = pvDcCapacityMWp * 1_000_000;
  const pvAcCapacityKw = pvAcCapacityMWac * 1_000;

  // Module count
  const numberOfModules = pvDcCapacityWp / modulePowerWp;

  // Temperature-corrected voltages
  const correctedColdVoc =
    moduleVoc * (1 + Math.abs(tempCoeffVoc) * (25 - minSiteTemp));
  const correctedHotVmp =
    moduleVmp * (1 - Math.abs(tempCoeffPmax) * (maxSiteTemp - 25));

  // String limits
  const maxModulesPerString = Math.floor(
    maxSystemVoltage / correctedColdVoc
  );
  const minModulesPerString = Math.ceil(mpptVoltageMin / correctedHotVmp);

  // String and inverter counts
  const numberOfStrings = Math.ceil(numberOfModules / modulesPerString);
  const stringsPerMppt = Math.floor(maxCurrentPerMppt / moduleImp);
  const stringsPerInverter = mpptCount * stringsPerMppt;
  const inverterQuantityByAC = Math.ceil(pvAcCapacityKw / inverterRatedPowerKw);
  const inverterQuantityByString = Math.ceil(
    numberOfStrings / stringsPerInverter
  );
  const finalInverterQuantity = Math.max(
    inverterQuantityByAC,
    inverterQuantityByString
  );

  // DC/AC ratio
  const dcAcRatio = pvDcCapacityMWp / pvAcCapacityMWac;

  // Validations
  const warnings: PvValidationWarning[] = [];

  if (correctedColdVoc > maxSystemVoltage) {
    warnings.push({
      code: "COLD_VOC_EXCEEDS_SYSTEM_VOLTAGE",
      message: `Cold Voc (${correctedColdVoc.toFixed(1)} V) exceeds maximum system voltage (${maxSystemVoltage} V).`,
      value: correctedColdVoc,
      limit: maxSystemVoltage,
    });
  }

  if (correctedHotVmp < mpptVoltageMin) {
    warnings.push({
      code: "HOT_VMP_BELOW_MPPT_MIN",
      message: `Hot Vmp (${correctedHotVmp.toFixed(1)} V) is below the MPPT minimum voltage (${mpptVoltageMin} V).`,
      value: correctedHotVmp,
      limit: mpptVoltageMin,
    });
  }

  const actualCurrentPerMppt = stringsPerMppt * moduleImp;
  if (actualCurrentPerMppt > maxCurrentPerMppt) {
    warnings.push({
      code: "MPPT_CURRENT_EXCEEDED",
      message: `MPPT current (${actualCurrentPerMppt.toFixed(1)} A) exceeds the maximum allowed (${maxCurrentPerMppt} A).`,
      value: actualCurrentPerMppt,
      limit: maxCurrentPerMppt,
    });
  }

  if (
    maxDcConnectorsPerInverter !== undefined &&
    stringsPerInverter > maxDcConnectorsPerInverter
  ) {
    warnings.push({
      code: "DC_CONNECTORS_EXCEEDED",
      message: `Strings per inverter (${stringsPerInverter}) exceeds physical connector count (${maxDcConnectorsPerInverter}).`,
      value: stringsPerInverter,
      limit: maxDcConnectorsPerInverter,
    });
  }

  const DC_AC_RATIO_HIGH_THRESHOLD = 1.5;
  if (dcAcRatio > DC_AC_RATIO_HIGH_THRESHOLD) {
    warnings.push({
      code: "DC_AC_RATIO_HIGH",
      message: `DC/AC ratio (${dcAcRatio.toFixed(2)}) exceeds the recommended maximum of ${DC_AC_RATIO_HIGH_THRESHOLD}.`,
      value: dcAcRatio,
      limit: DC_AC_RATIO_HIGH_THRESHOLD,
    });
  }

  return {
    pvDcCapacityWp,
    pvAcCapacityKw,
    numberOfModules,
    correctedColdVoc,
    correctedHotVmp,
    maxModulesPerString,
    minModulesPerString,
    numberOfStrings,
    stringsPerMppt,
    stringsPerInverter,
    inverterQuantityByAC,
    inverterQuantityByString,
    finalInverterQuantity,
    dcAcRatio,
    warnings,
  };
}
