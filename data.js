/* ============================================================
   data.js — LocalStorage persistence layer
   ============================================================ */
'use strict';

const PROJECTS_KEY = 'pvm_projects';
const DRAFT_KEY    = 'pvm_wizard_draft';

/** Return all stored projects (array). */
export function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch { return []; }
}

/** Persist the full projects array. */
export function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

/** Return a single project by id, or null. */
export function getProject(id) {
  return loadProjects().find(p => p.id === id) || null;
}

/** Upsert a project. */
export function upsertProject(project) {
  const projects = loadProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  saveProjects(projects);
}

/** Remove a project by id. */
export function deleteProject(id) {
  saveProjects(loadProjects().filter(p => p.id !== id));
}

/** Save wizard draft (partial data). */
export function saveDraft(data) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

/** Load wizard draft, or null. */
export function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
  } catch { return null; }
}

/** Clear wizard draft. */
export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/**
 * Build the initial blank project data object.
 */
export function blankProject() {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    projectInfo: {
      name: '', client: '', location: '', country: '',
      latitude: '', longitude: '',
      projectType: 'utility', description: ''
    },
    capacity: {
      dcCapacity_kWp: '', acCapacity_kW: '',
      dcAcRatio: '', numberOfStrings: '', numberOfArrays: ''
    },
    pvModule: {
      manufacturer: '', model: '',
      powerSTC_Wp: '', efficiency: '',
      voc: '', isc: '', vmp: '', imp: '',
      tempCoeffPmax: '', modulesPerString: ''
    },
    inverter: {
      manufacturer: '', model: '',
      ratedPower_kW: '', efficiency: '',
      mpptRangeMin: '', mpptRangeMax: '',
      numberOfMPPT: '', quantity: ''
    },
    structure: {
      mountingType: 'fixed-tilt', tiltAngle: '', azimuth: '',
      groundCoverageRatio: '', pitchM: '', structureType: ''
    },
    bess: {
      enabled: false,
      manufacturer: '', model: '',
      energyCapacity_kWh: '', power_kW: '',
      dod: '', rte: '', cycles: '',
      chemistry: 'LFP'
    },
    siteConditions: {
      ghi_kWhm2yr: '', dni_kWhm2yr: '', dhi_kWhm2yr: '',
      avgTemp_C: '', maxTemp_C: '', minTemp_C: '',
      windSpeed_ms: '', altitude_m: '',
      soilingLossRate: '', snowLoadZone: ''
    },
    yieldAssumptions: {
      performanceRatio: '', soilingLoss: '', shadingLoss: '',
      mismatchLoss: '', wiringLoss: '', availabilityLoss: '',
      degradationRate: '', p50_kWh: '', p90_kWh: ''
    },
    capexAssumptions: {
      currency: 'USD',
      pvModuleCost_perWp: '', inverterCost_perW: '',
      structureCost_perWp: '', bessCost_perKwh: '',
      civilCost_perWp: '', electricalCost_perWp: '',
      epcMargin_pct: '', totalCapex_USD: ''
    },
    shells: {
      pvDesignId: null, bessDesignId: null,
      yieldSimId: null, capexSheetId: null,
      bomId: null, sldId: null,
      simulationId: null, scadaId: null
    }
  };
}

/**
 * Create all linked shells for a newly created project.
 * Returns the shells object with generated IDs.
 */
export function createShells(projectId) {
  const uid = () => crypto.randomUUID();
  return {
    pvDesignId:   uid(),
    bessDesignId: uid(),
    yieldSimId:   uid(),
    capexSheetId: uid(),
    bomId:        uid(),
    sldId:        uid(),
    simulationId: uid(),
    scadaId:      uid(),
  };
}
