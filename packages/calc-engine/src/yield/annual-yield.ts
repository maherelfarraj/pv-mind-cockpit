import { safeNumber, safeDivide, allPositive, type SafeNumber } from '../utils/safe-math';

export interface YieldInputs {
  /** Installed DC array capacity in kWp */
  arrayKWp: number;
  /** Annual plane-of-array irradiance in kWh/m² */
  annualPoaKWhM2: number;
  /** STC irradiance (1000 W/m²) */
  stcIrradianceWM2?: number;
  /** Performance ratio (0–1) */
  performanceRatio: number;
  /** Temperature coefficient of power %/°C (negative, e.g. -0.0035) */
  tempCoefficientPct?: number;
  /** Average module temperature above STC in °C */
  avgTempRiseAboveStcC?: number;
}

export interface YieldResult {
  /** Annual AC energy output in MWh */
  annualACMWh: SafeNumber;
  /** Specific yield in kWh/kWp */
  specificYieldKWhKWp: SafeNumber;
  /** Capacity factor (CF) */
  capacityFactor: SafeNumber;
  /** Temperature-corrected performance ratio */
  tempCorrectedPR: SafeNumber;
  /** Annual CO₂ avoided in tonnes (assuming 0.5 kg CO₂/kWh grid) */
  co2AvoidedTonnes: SafeNumber;
  /** Equivalent full-load hours */
  fullLoadHours: SafeNumber;
}

const HOURS_PER_YEAR = 8760;
const CO2_KG_PER_KWH = 0.5; // grid average

export function calculateYield(inputs: Partial<YieldInputs>): YieldResult {
  const {
    arrayKWp,
    annualPoaKWhM2,
    stcIrradianceWM2 = 1000,
    performanceRatio,
    tempCoefficientPct = -0.004,
    avgTempRiseAboveStcC = 20,
  } = inputs;

  // Temperature-corrected PR
  const tempLoss = safeNumber(1 + (tempCoefficientPct ?? -0.004) * avgTempRiseAboveStcC);
  const tempCorrectedPR =
    allPositive(performanceRatio) && tempLoss !== null
      ? safeNumber(performanceRatio! * tempLoss)
      : null;

  // Annual AC energy: E = P_stc × (H_poa / G_stc) × PR_temp
  const annualACMWh =
    allPositive(arrayKWp, annualPoaKWhM2, stcIrradianceWM2) && tempCorrectedPR !== null
      ? safeNumber(
          (arrayKWp! * annualPoaKWhM2! * tempCorrectedPR) /
            (stcIrradianceWM2! / 1000) /
            1000,
        )
      : null;

  // Specific yield
  const specificYieldKWhKWp =
    annualACMWh !== null && allPositive(arrayKWp)
      ? safeDivide(annualACMWh * 1000, arrayKWp!)
      : null;

  // Capacity factor
  const capacityFactor =
    annualACMWh !== null && allPositive(arrayKWp)
      ? safeDivide(annualACMWh * 1000, arrayKWp! * HOURS_PER_YEAR)
      : null;

  // CO₂ avoided
  const co2AvoidedTonnes =
    annualACMWh !== null
      ? safeNumber((annualACMWh * 1000 * CO2_KG_PER_KWH) / 1000)
      : null;

  // Full load hours
  const fullLoadHours =
    annualACMWh !== null && allPositive(arrayKWp)
      ? safeDivide(annualACMWh * 1000, arrayKWp!)
      : null;

  return {
    annualACMWh,
    specificYieldKWhKWp,
    capacityFactor,
    tempCorrectedPR,
    co2AvoidedTonnes,
    fullLoadHours,
  };
}

/** Calculate monthly energy distribution given annual yield and monthly irradiance fractions */
export function monthlyEnergyDistribution(
  annualACMWh: SafeNumber,
  monthlyFractions: number[],
): SafeNumber[] {
  if (annualACMWh === null) return monthlyFractions.map(() => null);
  const total = monthlyFractions.reduce((a, b) => a + b, 0);
  return monthlyFractions.map((f) => safeDivide((annualACMWh * f * 1000), total));
}
