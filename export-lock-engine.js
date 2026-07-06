const LOCKED_MESSAGE =
  "🔒 Export Locked: Complete project setup, weather, orientation, sub-arrays, module, inverter, stringing, losses, shading, P50/P90, simulation, CAPEX, BOM, and SCADA blockers before exporting.";

const READY_MESSAGE = "[PV_MIND PROJECT READY FOR EXPORT]";

const EXPORT_LOCK_RULES = Object.freeze([
  createRule("project-setup-missing", "Project setup missing", {
    truthy: ["projectSetupComplete", "projectSetupReady", "hasProjectSetup"],
    falsy: ["projectSetupMissing"],
  }),
  createRule("weather-file-missing", "Weather file missing", {
    truthy: ["weatherFilePresent", "weatherFileUploaded", "hasWeatherFile"],
    falsy: ["weatherFileMissing"],
  }),
  createRule("variant-missing", "Variant missing", {
    truthy: ["variantSelected", "hasVariant"],
    falsy: ["variantMissing"],
  }),
  createRule("orientation-not-linked", "Orientation not linked", {
    truthy: ["orientationLinked"],
    falsy: ["orientationNotLinked"],
  }),
  createRule("sub-array-incomplete", "Sub-array incomplete", {
    truthy: ["subArrayComplete", "subArrayConfigured", "subArraysComplete"],
    falsy: ["subArrayIncomplete"],
  }),
  createRule("pv-module-missing", "PV module missing", {
    truthy: ["pvModuleSelected", "hasPvModule", "moduleSelected"],
    falsy: ["pvModuleMissing", "moduleMissing"],
  }),
  createRule("inverter-missing", "Inverter missing", {
    truthy: ["inverterSelected", "hasInverter"],
    falsy: ["inverterMissing"],
  }),
  createRule("stringing-non-compliant", "Stringing non-compliant", {
    truthy: ["stringingCompliant"],
    falsy: ["stringingNonCompliant"],
  }),
  createRule("mppt-non-compliant", "MPPT non-compliant", {
    truthy: ["mpptCompliant"],
    falsy: ["mpptNonCompliant"],
  }),
  createRule("physical-connector-limit-exceeded", "Physical connector limit exceeded", {
    truthy: ["withinPhysicalConnectorLimit"],
    falsy: ["physicalConnectorLimitExceeded"],
  }),
  createRule("loss-assumptions-incomplete", "Loss assumptions incomplete", {
    truthy: ["lossAssumptionsComplete", "lossesComplete"],
    falsy: ["lossAssumptionsIncomplete", "lossesIncomplete"],
  }),
  createRule("horizon-not-reviewed", "Horizon not reviewed", {
    truthy: ["horizonReviewed"],
    falsy: ["horizonNotReviewed"],
  }),
  createRule("near-shading-not-reviewed", "Near shading not reviewed", {
    truthy: ["nearShadingReviewed"],
    falsy: ["nearShadingNotReviewed"],
  }),
  createRule("3d-scene-mismatch-unresolved", "3D scene mismatch unresolved", {
    truthy: ["sceneMismatchResolved"],
    falsy: ["sceneMismatchUnresolved", "threeDSceneMismatchUnresolved"],
  }),
  createRule("p50-p90-missing", "P50/P90 missing", {
    truthy: ["p50P90Available", "p50P90Generated"],
    falsy: ["p50P90Missing"],
  }),
  createRule("simulation-not-run", "Simulation not run", {
    truthy: ["simulationRun", "simulationCompleted"],
    falsy: ["simulationNotRun"],
  }),
  createRule("report-not-generated", "Report not generated", {
    truthy: ["reportGenerated"],
    falsy: ["reportNotGenerated"],
  }),
  createRule("critical-scada-alarms-unacknowledged", "Critical SCADA alarms unacknowledged", {
    truthy: ["criticalScadaAlarmsAcknowledged"],
    falsy: ["criticalScadaAlarmsUnacknowledged"],
  }),
  createRule("required-capex-missing", "Required CAPEX missing", {
    truthy: ["requiredCapexPresent", "requiredCapexComplete", "capexComplete"],
    falsy: ["requiredCapexMissing"],
  }),
  createRule("bom-not-generated", "BOM not generated", {
    truthy: ["bomGenerated"],
    falsy: ["bomNotGenerated"],
  }),
]);

function createRule(id, label, aliases) {
  return Object.freeze({
    id,
    label,
    aliases: Object.freeze({
      truthy: Object.freeze([...(aliases.truthy || [])]),
      falsy: Object.freeze([...(aliases.falsy || [])]),
    }),
  });
}

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function resolveRule(state, rule) {
  for (const key of rule.aliases.truthy) {
    if (hasOwn(state, key)) {
      return Boolean(state[key]);
    }
  }

  for (const key of rule.aliases.falsy) {
    if (hasOwn(state, key)) {
      return !Boolean(state[key]);
    }
  }

  return false;
}

function evaluateExportLock(state = {}) {
  const blockers = [];
  const blockerIds = [];

  for (const rule of EXPORT_LOCK_RULES) {
    const passed = resolveRule(state, rule);

    if (!passed) {
      blockerIds.push(rule.id);
      blockers.push(rule.label);
    }
  }

  const locked = blockers.length > 0;

  return {
    locked,
    ready: !locked,
    blockers,
    blockerIds,
    message: locked ? LOCKED_MESSAGE : READY_MESSAGE,
  };
}

function isExportLocked(state = {}) {
  return evaluateExportLock(state).locked;
}

module.exports = {
  EXPORT_LOCK_RULES,
  LOCKED_MESSAGE,
  READY_MESSAGE,
  evaluateExportLock,
  isExportLocked,
};
