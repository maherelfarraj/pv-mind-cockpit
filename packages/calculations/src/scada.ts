/**
 * SCADA point-list generation and tag-naming utilities.
 *
 * Produces a structured list of SCADA data points (tags) for a PV + BESS
 * plant based on the equipment counts derived from the sizing calculations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScadaTagType =
  | "analog_input"
  | "analog_output"
  | "digital_input"
  | "digital_output"
  | "calculated";

export interface ScadaTag {
  /** Unique tag identifier, e.g. "INV_01.AC_POWER_KW" */
  tagId: string;
  /** Human-readable description */
  description: string;
  /** Engineering unit (e.g. "kW", "V", "A", "%") */
  unit: string;
  /** IEC 61850 / DNP3 / Modbus data type */
  type: ScadaTagType;
  /** Source equipment group */
  group: string;
}

export interface ScadaPointListInput {
  /** Number of inverters */
  inverterCount: number;
  /** Number of BESS containers */
  bessContainerCount: number;
  /** Number of PCS units */
  pcsCount: number;
  /** Whether a meteorological station is present */
  hasMetStation: boolean;
}

export interface ScadaPointListResult {
  tags: ScadaTag[];
  totalTagCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function inverterTags(index: number): ScadaTag[] {
  const prefix = `INV_${pad(index)}`;
  return [
    { tagId: `${prefix}.AC_POWER_KW`, description: `Inverter ${index} AC power`, unit: "kW", type: "analog_input", group: "inverter" },
    { tagId: `${prefix}.DC_VOLTAGE_V`, description: `Inverter ${index} DC input voltage`, unit: "V", type: "analog_input", group: "inverter" },
    { tagId: `${prefix}.DC_CURRENT_A`, description: `Inverter ${index} DC input current`, unit: "A", type: "analog_input", group: "inverter" },
    { tagId: `${prefix}.AC_VOLTAGE_V`, description: `Inverter ${index} AC output voltage`, unit: "V", type: "analog_input", group: "inverter" },
    { tagId: `${prefix}.AC_CURRENT_A`, description: `Inverter ${index} AC output current`, unit: "A", type: "analog_input", group: "inverter" },
    { tagId: `${prefix}.EFFICIENCY_PCT`, description: `Inverter ${index} efficiency`, unit: "%", type: "calculated", group: "inverter" },
    { tagId: `${prefix}.STATUS`, description: `Inverter ${index} operational status`, unit: "", type: "digital_input", group: "inverter" },
    { tagId: `${prefix}.FAULT_CODE`, description: `Inverter ${index} fault code`, unit: "", type: "analog_input", group: "inverter" },
    { tagId: `${prefix}.ENERGY_TODAY_KWH`, description: `Inverter ${index} energy today`, unit: "kWh", type: "analog_input", group: "inverter" },
    { tagId: `${prefix}.ENERGY_TOTAL_KWH`, description: `Inverter ${index} total energy`, unit: "kWh", type: "analog_input", group: "inverter" },
  ];
}

function bessContainerTags(index: number): ScadaTag[] {
  const prefix = `BESS_${pad(index)}`;
  return [
    { tagId: `${prefix}.SOC_PCT`, description: `BESS container ${index} state of charge`, unit: "%", type: "analog_input", group: "bess" },
    { tagId: `${prefix}.SOH_PCT`, description: `BESS container ${index} state of health`, unit: "%", type: "analog_input", group: "bess" },
    { tagId: `${prefix}.VOLTAGE_V`, description: `BESS container ${index} terminal voltage`, unit: "V", type: "analog_input", group: "bess" },
    { tagId: `${prefix}.CURRENT_A`, description: `BESS container ${index} current`, unit: "A", type: "analog_input", group: "bess" },
    { tagId: `${prefix}.TEMPERATURE_C`, description: `BESS container ${index} cell temperature`, unit: "°C", type: "analog_input", group: "bess" },
    { tagId: `${prefix}.STATUS`, description: `BESS container ${index} status`, unit: "", type: "digital_input", group: "bess" },
    { tagId: `${prefix}.FAULT_CODE`, description: `BESS container ${index} fault code`, unit: "", type: "analog_input", group: "bess" },
  ];
}

function pcsTags(index: number): ScadaTag[] {
  const prefix = `PCS_${pad(index)}`;
  return [
    { tagId: `${prefix}.AC_POWER_KW`, description: `PCS ${index} AC power`, unit: "kW", type: "analog_input", group: "pcs" },
    { tagId: `${prefix}.AC_REACTIVE_POWER_KVAR`, description: `PCS ${index} reactive power`, unit: "kVAr", type: "analog_input", group: "pcs" },
    { tagId: `${prefix}.DC_POWER_KW`, description: `PCS ${index} DC power`, unit: "kW", type: "analog_input", group: "pcs" },
    { tagId: `${prefix}.STATUS`, description: `PCS ${index} operational status`, unit: "", type: "digital_input", group: "pcs" },
    { tagId: `${prefix}.CHARGE_CMD`, description: `PCS ${index} charge power setpoint`, unit: "kW", type: "analog_output", group: "pcs" },
    { tagId: `${prefix}.DISCHARGE_CMD`, description: `PCS ${index} discharge power setpoint`, unit: "kW", type: "analog_output", group: "pcs" },
  ];
}

function metStationTags(): ScadaTag[] {
  return [
    { tagId: "MET.GHI_W_M2", description: "Global horizontal irradiance", unit: "W/m²", type: "analog_input", group: "met_station" },
    { tagId: "MET.POA_W_M2", description: "Plane-of-array irradiance", unit: "W/m²", type: "analog_input", group: "met_station" },
    { tagId: "MET.AMBIENT_TEMP_C", description: "Ambient temperature", unit: "°C", type: "analog_input", group: "met_station" },
    { tagId: "MET.MODULE_TEMP_C", description: "Module back-sheet temperature", unit: "°C", type: "analog_input", group: "met_station" },
    { tagId: "MET.WIND_SPEED_MS", description: "Wind speed", unit: "m/s", type: "analog_input", group: "met_station" },
    { tagId: "MET.WIND_DIRECTION_DEG", description: "Wind direction", unit: "°", type: "analog_input", group: "met_station" },
  ];
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Generates a structured SCADA point list for a PV + BESS plant.
 *
 * @param input - Equipment counts used to enumerate individual tags.
 * @returns Full SCADA tag list and summary count.
 */
export function generateScadaPointList(
  input: ScadaPointListInput
): ScadaPointListResult {
  const tags: ScadaTag[] = [];

  for (let i = 1; i <= input.inverterCount; i++) {
    tags.push(...inverterTags(i));
  }

  for (let i = 1; i <= input.bessContainerCount; i++) {
    tags.push(...bessContainerTags(i));
  }

  for (let i = 1; i <= input.pcsCount; i++) {
    tags.push(...pcsTags(i));
  }

  if (input.hasMetStation) {
    tags.push(...metStationTags());
  }

  return { tags, totalTagCount: tags.length };
}
