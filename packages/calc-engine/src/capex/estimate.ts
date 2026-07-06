import { safeNumber, safeProduct, allPositive, type SafeNumber } from '../utils/safe-math';

export interface CapexInputs {
  /** PV array capacity in kWp */
  arrayKWp: number;
  /** BESS gross capacity in kWh */
  bessKWh: number;
  /** Module cost in USD/Wp */
  moduleCostUSDWp: number;
  /** Inverter cost in USD/kW */
  inverterCostUSDKW: number;
  /** BESS cost in USD/kWh */
  bessCostUSDKWh: number;
  /** BOS cost as fraction of module + inverter cost (e.g. 0.25) */
  bosFraction: number;
  /** EPC margin as fraction of total hardware cost (e.g. 0.15) */
  epcMarginFraction: number;
  /** Contingency fraction (e.g. 0.05) */
  contingencyFraction: number;
}

export interface CapexBreakdown {
  moduleCostUSD: SafeNumber;
  inverterCostUSD: SafeNumber;
  bessCostUSD: SafeNumber;
  bosCostUSD: SafeNumber;
  hardwareTotalUSD: SafeNumber;
  epcMarginUSD: SafeNumber;
  contingencyUSD: SafeNumber;
  totalCapexUSD: SafeNumber;
  specificCapexUSDKWp: SafeNumber;
  specificCapexUSDKWh: SafeNumber;
}

export function estimateCapex(inputs: Partial<CapexInputs>): CapexBreakdown {
  const {
    arrayKWp,
    bessKWh,
    moduleCostUSDWp,
    inverterCostUSDKW,
    bessCostUSDKWh,
    bosFraction,
    epcMarginFraction,
    contingencyFraction,
  } = inputs;

  const moduleCostUSD =
    allPositive(arrayKWp, moduleCostUSDWp)
      ? safeProduct(arrayKWp! * 1000, moduleCostUSDWp!)
      : null;

  const inverterCostUSD =
    allPositive(arrayKWp, inverterCostUSDKW)
      ? safeProduct(arrayKWp!, inverterCostUSDKW!)
      : null;

  const bessCostUSD =
    allPositive(bessKWh, bessCostUSDKWh)
      ? safeProduct(bessKWh!, bessCostUSDKWh!)
      : null;

  const hardwareBase =
    moduleCostUSD !== null && inverterCostUSD !== null && bessCostUSD !== null
      ? safeNumber(moduleCostUSD + inverterCostUSD + bessCostUSD)
      : null;

  const bosCostUSD =
    hardwareBase !== null && allPositive(bosFraction)
      ? safeNumber(hardwareBase * bosFraction!)
      : null;

  const hardwareTotalUSD =
    hardwareBase !== null && bosCostUSD !== null
      ? safeNumber(hardwareBase + bosCostUSD)
      : null;

  const epcMarginUSD =
    hardwareTotalUSD !== null && allPositive(epcMarginFraction)
      ? safeNumber(hardwareTotalUSD * epcMarginFraction!)
      : null;

  const contingencyUSD =
    hardwareTotalUSD !== null && allPositive(contingencyFraction)
      ? safeNumber(hardwareTotalUSD * contingencyFraction!)
      : null;

  const totalCapexUSD =
    hardwareTotalUSD !== null && epcMarginUSD !== null && contingencyUSD !== null
      ? safeNumber(hardwareTotalUSD + epcMarginUSD + contingencyUSD)
      : null;

  const specificCapexUSDKWp =
    totalCapexUSD !== null && allPositive(arrayKWp)
      ? safeNumber(totalCapexUSD / arrayKWp! / 1000)
      : null; // USD/Wp

  const specificCapexUSDKWh =
    totalCapexUSD !== null && allPositive(bessKWh)
      ? safeNumber(totalCapexUSD / bessKWh!)
      : null;

  return {
    moduleCostUSD,
    inverterCostUSD,
    bessCostUSD,
    bosCostUSD,
    hardwareTotalUSD,
    epcMarginUSD,
    contingencyUSD,
    totalCapexUSD,
    specificCapexUSDKWp,
    specificCapexUSDKWh,
  };
}
