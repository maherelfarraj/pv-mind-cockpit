// PV Mind Calc Engine — Public API

// Utilities
export {
  safeNumber,
  safeDivide,
  safePercent,
  safeProduct,
  safeSum,
  allPositive,
  formatValue,
  formatCurrency,
  NEEDS_INPUT,
  type SafeNumber,
} from './utils/safe-math';

// PV Sizing
export {
  sizePVSystem,
  type PVSizingInputs,
  type PVSizingResult,
} from './pv/sizing';

// Irradiance
export {
  estimatePOA,
  annualAverageGHI,
  type MonthlyIrradiance,
  type TiltOptimizationResult,
} from './pv/irradiance';

// BESS Sizing
export {
  sizeBESS,
  type BESSInputs,
  type BESSResult,
} from './bess/sizing';

// Yield
export {
  calculateYield,
  monthlyEnergyDistribution,
  type YieldInputs,
  type YieldResult,
} from './yield/annual-yield';

// CAPEX
export {
  estimateCapex,
  type CapexInputs,
  type CapexBreakdown,
} from './capex/estimate';

// SLD
export {
  generateSLD,
  type SLDDiagram,
  type SLDComponent,
  type SLDConnection,
  type SLDInputs,
} from './sld/generator';
