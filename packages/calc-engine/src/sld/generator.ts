import { safeNumber, type SafeNumber } from '../utils/safe-math';

export interface SLDComponent {
  id: string;
  type: 'module' | 'string_combiner' | 'inverter' | 'transformer' | 'meter' | 'battery' | 'bms' | 'pcs' | 'grid';
  label: string;
  ratingKW?: SafeNumber;
  voltageV?: SafeNumber;
  notes?: string;
}

export interface SLDConnection {
  from: string;
  to: string;
  cableRatingA?: SafeNumber;
  voltageV?: SafeNumber;
  notes?: string;
}

export interface SLDDiagram {
  components: SLDComponent[];
  connections: SLDConnection[];
}

export interface SLDInputs {
  stringsCount: number;
  inverterCount: number;
  inverterRatingKW: number;
  transformerCount: number;
  transformerRatingKVA: number;
  hasBESS: boolean;
  bessRatingKW: number;
}

/**
 * Generates a structured SLD (Single-Line Diagram) data model.
 * Render this with an SVG/canvas library on the client side.
 */
export function generateSLD(inputs: Partial<SLDInputs>): SLDDiagram {
  const components: SLDComponent[] = [];
  const connections: SLDConnection[] = [];

  const {
    stringsCount = 0,
    inverterCount = 0,
    inverterRatingKW,
    transformerCount = 0,
    transformerRatingKVA,
    hasBESS = false,
    bessRatingKW,
  } = inputs;

  // PV strings
  for (let i = 0; i < stringsCount; i++) {
    components.push({
      id: `string_${i + 1}`,
      type: 'module',
      label: `String ${i + 1}`,
    });
  }

  // Combiner box if > 1 string
  if (stringsCount > 1) {
    components.push({ id: 'combiner_1', type: 'string_combiner', label: 'DC Combiner Box' });
    for (let i = 0; i < stringsCount; i++) {
      connections.push({ from: `string_${i + 1}`, to: 'combiner_1' });
    }
  }

  const dcSource = stringsCount > 1 ? 'combiner_1' : stringsCount === 1 ? 'string_1' : null;

  // Inverters
  for (let i = 0; i < inverterCount; i++) {
    const invId = `inverter_${i + 1}`;
    components.push({
      id: invId,
      type: 'inverter',
      label: `Inverter ${i + 1}`,
      ratingKW: safeNumber(inverterRatingKW ?? null),
    });
    if (dcSource) connections.push({ from: dcSource, to: invId });
  }

  // BESS
  if (hasBESS) {
    components.push({ id: 'bms', type: 'bms', label: 'BMS' });
    components.push({
      id: 'battery',
      type: 'battery',
      label: 'Battery Pack',
    });
    components.push({
      id: 'pcs',
      type: 'pcs',
      label: 'PCS',
      ratingKW: safeNumber(bessRatingKW ?? null),
    });
    connections.push({ from: 'battery', to: 'bms' });
    connections.push({ from: 'bms', to: 'pcs' });
  }

  // Transformer
  for (let i = 0; i < transformerCount; i++) {
    const trId = `transformer_${i + 1}`;
    components.push({
      id: trId,
      type: 'transformer',
      label: `Transformer ${i + 1}`,
      ratingKW: safeNumber(transformerRatingKVA ?? null),
    });
    if (inverterCount > 0) connections.push({ from: `inverter_${i + 1}`, to: trId });
    if (hasBESS) connections.push({ from: 'pcs', to: trId });
  }

  // Meter & grid
  components.push({ id: 'meter', type: 'meter', label: 'Revenue Meter' });
  components.push({ id: 'grid', type: 'grid', label: 'Grid POI' });
  if (transformerCount > 0) {
    connections.push({ from: `transformer_${transformerCount}`, to: 'meter' });
  } else if (inverterCount > 0) {
    connections.push({ from: `inverter_${inverterCount}`, to: 'meter' });
  }
  connections.push({ from: 'meter', to: 'grid' });

  return { components, connections };
}
