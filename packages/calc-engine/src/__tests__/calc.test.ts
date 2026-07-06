import { sizePVSystem } from '../pv/sizing';

describe('sizePVSystem', () => {
  const validInputs = {
    dailyLoadKWh: 500,
    peakSunHours: 5.5,
    systemEfficiency: 0.8,
    modulePowerWp: 550,
    moduleAreaM2: 2.6,
    modulesPerString: 20,
    strings: 5,
  };

  it('returns correct array power for valid inputs', () => {
    const result = sizePVSystem(validInputs);
    expect(result.arrayPowerKWp).toBeCloseTo(113.64, 1);
  });

  it('returns null values when inputs are missing', () => {
    const result = sizePVSystem({});
    expect(result.arrayPowerKWp).toBeNull();
    expect(result.moduleCount).toBeNull();
    expect(result.annualProductionMWh).toBeNull();
  });

  it('returns null for zero peak sun hours', () => {
    const result = sizePVSystem({ ...validInputs, peakSunHours: 0 });
    expect(result.arrayPowerKWp).toBeNull();
  });

  it('calculates module count from array power', () => {
    const result = sizePVSystem(validInputs);
    expect(result.moduleCount).not.toBeNull();
    expect(result.moduleCount).toBeGreaterThan(0);
  });

  it('never returns NaN or Infinity', () => {
    const result = sizePVSystem({ ...validInputs, systemEfficiency: 0 });
    for (const val of Object.values(result)) {
      if (val !== null) {
        expect(isNaN(val as number)).toBe(false);
        expect(isFinite(val as number)).toBe(true);
      }
    }
  });
});

import { sizeBESS } from '../bess/sizing';

describe('sizeBESS', () => {
  const validInputs = {
    requiredEnergyKWh: 200,
    dod: 0.9,
    roundTripEfficiency: 0.92,
    backupHours: 4,
    nominalVoltageV: 3.7,
    nominalCapacityAh: 280,
    seriesCount: 16,
    parallelCount: 10,
  };

  it('calculates gross capacity correctly', () => {
    const result = sizeBESS(validInputs);
    expect(result.grossCapacityKWh).not.toBeNull();
    expect(result.grossCapacityKWh!).toBeGreaterThan(0);
  });

  it('returns null for missing inputs', () => {
    const result = sizeBESS({});
    expect(result.grossCapacityKWh).toBeNull();
    expect(result.peakPowerKW).toBeNull();
  });

  it('never returns NaN or Infinity', () => {
    const result = sizeBESS({ ...validInputs, dod: 0 });
    for (const val of Object.values(result)) {
      if (val !== null) {
        expect(isNaN(val as number)).toBe(false);
        expect(isFinite(val as number)).toBe(true);
      }
    }
  });
});

import { calculateYield } from '../yield/annual-yield';

describe('calculateYield', () => {
  const validInputs = {
    arrayKWp: 1000,
    annualPoaKWhM2: 1800,
    performanceRatio: 0.82,
  };

  it('calculates annual yield for valid inputs', () => {
    const result = calculateYield(validInputs);
    expect(result.annualACMWh).not.toBeNull();
    expect(result.annualACMWh!).toBeGreaterThan(0);
  });

  it('returns null for missing inputs', () => {
    const result = calculateYield({});
    expect(result.annualACMWh).toBeNull();
    expect(result.specificYieldKWhKWp).toBeNull();
  });

  it('never returns NaN or Infinity', () => {
    const result = calculateYield({ ...validInputs, performanceRatio: 0 });
    for (const val of Object.values(result)) {
      if (val !== null) {
        expect(isNaN(val as number)).toBe(false);
        expect(isFinite(val as number)).toBe(true);
      }
    }
  });
});
