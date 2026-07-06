import { safeNumber, safeDivide, allPositive, type SafeNumber } from '../utils/safe-math';

/** Monthly irradiance record */
export interface MonthlyIrradiance {
  month: number; // 1–12
  /** Global Horizontal Irradiance in kWh/m²/day */
  ghiKWhM2Day: number;
  /** Direct Normal Irradiance in kWh/m²/day */
  dniKWhM2Day?: number;
  /** Diffuse Horizontal Irradiance in kWh/m²/day */
  dhiKWhM2Day?: number;
  /** Average ambient temperature °C */
  ambientTempC?: number;
}

export interface TiltOptimizationResult {
  /** Optimal tilt angle in degrees */
  optimalTiltDeg: SafeNumber;
  /** Transposition factor (POA/GHI) */
  transpositionFactor: SafeNumber;
  /** Plane of array irradiance kWh/m²/day */
  poaKWhM2Day: SafeNumber;
}

/**
 * Simple isotropic model for POA irradiance from GHI.
 * For production use, replace with Perez or HAY-Davies model.
 */
export function estimatePOA(
  ghiKWhM2Day: number,
  tiltDeg: number,
  latitudeDeg: number,
): TiltOptimizationResult {
  const valid = allPositive(ghiKWhM2Day) && safeNumber(tiltDeg) !== null && safeNumber(latitudeDeg) !== null;
  if (!valid) {
    return { optimalTiltDeg: null, transpositionFactor: null, poaKWhM2Day: null };
  }

  // Optimal tilt ≈ latitude for fixed-tilt systems (rule of thumb)
  const optimalTiltDeg = safeNumber(Math.abs(latitudeDeg));

  // Simple transposition factor based on tilt deviation from optimal
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const beamFactor = Math.cos(tiltRad);
  const diffuseFactor = (1 + Math.cos(tiltRad)) / 2;
  const reflectedFactor = 0.2 * (1 - Math.cos(tiltRad)) / 2;
  const transpositionFactor = safeNumber(beamFactor + diffuseFactor + reflectedFactor);

  const poaKWhM2Day =
    transpositionFactor !== null
      ? safeNumber(ghiKWhM2Day * transpositionFactor)
      : null;

  return { optimalTiltDeg, transpositionFactor, poaKWhM2Day };
}

/**
 * Compute annual average GHI from monthly data.
 */
export function annualAverageGHI(monthlyData: MonthlyIrradiance[]): SafeNumber {
  if (!monthlyData.length) return null;
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let weightedSum = 0;
  let totalDays = 0;
  for (const m of monthlyData) {
    const days = daysInMonth[(m.month - 1) % 12];
    const ghi = safeNumber(m.ghiKWhM2Day);
    if (ghi === null) return null;
    weightedSum += ghi * days;
    totalDays += days;
  }
  return safeDivide(weightedSum, totalDays);
}
