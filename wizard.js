/* ============================================================
   wizard.js — New Project Wizard (10 steps)
   ============================================================ */
'use strict';

import { blankProject, saveDraft, loadDraft, clearDraft, upsertProject, createShells } from './data.js';
import { showToast, escHtml, fmt } from './utils.js';

// ── Step definitions ─────────────────────────────────────────
const STEPS = [
  { num: 1, title: 'Project Info',       key: 'projectInfo'      },
  { num: 2, title: 'Capacity',           key: 'capacity'         },
  { num: 3, title: 'PV Module',          key: 'pvModule'         },
  { num: 4, title: 'Inverter',           key: 'inverter'         },
  { num: 5, title: 'Structure',          key: 'structure'        },
  { num: 6, title: 'BESS',              key: 'bess'             },
  { num: 7, title: 'Site Conditions',    key: 'siteConditions'   },
  { num: 8, title: 'Yield Assumptions',  key: 'yieldAssumptions' },
  { num: 9, title: 'CAPEX Assumptions',  key: 'capexAssumptions' },
  { num: 10, title: 'Review & Create',   key: null               },
];

// ── State ────────────────────────────────────────────────────
let currentStep = 1;
let project     = blankProject();
let doneSteps   = new Set();

// ── DOM refs ─────────────────────────────────────────────────
const stepListEl     = document.getElementById('step-list');
const progressFill   = document.getElementById('progress-fill');
const stepIndicator  = document.getElementById('step-indicator');
const btnPrev        = document.getElementById('btn-prev');
const btnNext        = document.getElementById('btn-next');
const btnCreate      = document.getElementById('btn-create');
const btnSaveDraft   = document.getElementById('btn-save-draft');
const btnSaveDraftFt = document.getElementById('btn-save-draft-footer');
const draftHint      = document.getElementById('draft-hint');

// ── Initialise ───────────────────────────────────────────────
function init() {
  // Restore draft if exists
  const draft = loadDraft();
  if (draft) {
    project = draft;
    showToast('Draft restored.', 'info', 3000);
  }

  buildStepList();
  goToStep(1);
  wireEvents();
}

// ── Build sidebar step list ──────────────────────────────────
function buildStepList() {
  stepListEl.innerHTML = STEPS.map(s => `
    <li class="step-list__item" data-step="${s.num}" role="listitem">
      <span class="step-num">${s.num}</span>
      <span class="step-name">${escHtml(s.title)}</span>
      <span class="step-check" aria-hidden="true">✓</span>
    </li>
  `).join('');
}

// ── Navigate to a step ───────────────────────────────────────
function goToStep(n) {
  // Collect current step data before leaving (unless initialising)
  if (currentStep !== n) {
    collectStep(currentStep);
  }

  currentStep = n;

  // Show / hide panels
  document.querySelectorAll('.step-panel').forEach(p => {
    p.classList.toggle('hidden', Number(p.dataset.step) !== n);
  });

  // Update sidebar
  document.querySelectorAll('.step-list__item').forEach(li => {
    const sn = Number(li.dataset.step);
    li.classList.toggle('is-active', sn === n);
    li.classList.toggle('is-done', doneSteps.has(sn) && sn !== n);
  });

  // Progress bar
  progressFill.style.width = `${((n - 1) / (STEPS.length - 1)) * 100}%`;

  // Footer buttons
  btnPrev.disabled = n === 1;
  const isLast = n === STEPS.length;
  btnNext.classList.toggle('hidden', isLast);
  btnCreate.classList.toggle('hidden', !isLast);

  stepIndicator.textContent = `Step ${n} of ${STEPS.length}`;

  // Populate fields from project state
  populateStep(n);

  // Special steps
  if (n === 6) syncBessToggle();
  if (n === 9) updateCapexPreview();
  if (n === 10) buildReviewSummary();

  // Scroll to top of panel
  document.querySelector('.wizard-body')?.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Populate form fields from project data ───────────────────
function populateStep(step) {
  const panel = document.querySelector(`.step-panel[data-step="${step}"]`);
  if (!panel) return;

  panel.querySelectorAll('[name]').forEach(el => {
    const path = el.name.split('.');
    const obj  = path.length === 2 ? project[path[0]] : project;
    const key  = path[path.length - 1];
    const val  = obj?.[key];

    if (el.type === 'checkbox') {
      el.checked = Boolean(val);
    } else {
      el.value = val ?? '';
    }
  });
}

// ── Collect form field values into project ────────────────────
function collectStep(step) {
  const panel = document.querySelector(`.step-panel[data-step="${step}"]`);
  if (!panel) return;

  panel.querySelectorAll('[name]').forEach(el => {
    const path = el.name.split('.');
    if (path.length !== 2) return;
    const [section, field] = path;
    if (!project[section]) return;

    if (el.type === 'checkbox') {
      project[section][field] = el.checked;
    } else if (el.type === 'number') {
      project[section][field] = el.value === '' ? '' : Number(el.value);
    } else {
      project[section][field] = el.value;
    }
  });

  // Auto-calculate DC/AC ratio
  if (step === 2) {
    const dc = Number(project.capacity.dcCapacity_kWp);
    const ac = Number(project.capacity.acCapacity_kW);
    if (dc > 0 && ac > 0 && !project.capacity.dcAcRatio) {
      project.capacity.dcAcRatio = Math.round((dc / ac) * 100) / 100;
      const dcAcEl = document.getElementById('dcAcRatio');
      if (dcAcEl) dcAcEl.value = project.capacity.dcAcRatio;
    }
  }

  // Auto-calculate total CAPEX
  if (step === 9) autoCalcCapex();

  project.updatedAt = new Date().toISOString();
}

// ── Validation ────────────────────────────────────────────────
const VALIDATORS = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
  6: validateStep6,
  7: validateStep7,
  8: validateStep8,
  9: validateStep9,
};

function clearErrors(step) {
  const panel = document.querySelector(`.step-panel[data-step="${step}"]`);
  panel?.querySelectorAll('.form-error.visible').forEach(el => el.classList.remove('visible'));
  panel?.querySelectorAll('.form-control.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

function showError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errorId);
  input?.classList.add('is-invalid');
  err?.classList.add('visible');
}

function validateStep1() {
  clearErrors(1);
  let ok = true;
  if (!project.projectInfo.name?.trim()) { showError('projectName', 'err-projectName'); ok = false; }
  if (!project.projectInfo.location?.trim()) { showError('location', 'err-location'); ok = false; }
  if (!project.projectInfo.country?.trim()) { showError('country', 'err-country'); ok = false; }
  const lat = project.projectInfo.latitude;
  if (lat !== '' && lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
    showError('latitude', 'err-latitude'); ok = false;
  }
  const lng = project.projectInfo.longitude;
  if (lng !== '' && lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
    showError('longitude', 'err-longitude'); ok = false;
  }
  return ok;
}

function validateStep2() {
  clearErrors(2);
  let ok = true;
  const dc = Number(project.capacity.dcCapacity_kWp);
  if (!dc || dc <= 0) { showError('dcCapacity', 'err-dcCapacity'); ok = false; }
  const ac = Number(project.capacity.acCapacity_kW);
  if (!ac || ac <= 0) { showError('acCapacity', 'err-acCapacity'); ok = false; }
  const ratio = project.capacity.dcAcRatio;
  if (ratio !== '' && ratio !== null && (isNaN(ratio) || ratio < 0.5 || ratio > 2.5)) {
    showError('dcAcRatio', 'err-dcAcRatio'); ok = false;
  }
  return ok;
}

function validateStep3() {
  clearErrors(3);
  let ok = true;
  if (!project.pvModule.manufacturer?.trim()) { showError('pvManufacturer', 'err-pvManufacturer'); ok = false; }
  if (!project.pvModule.model?.trim()) { showError('pvModel', 'err-pvModel'); ok = false; }
  const pwr = Number(project.pvModule.powerSTC_Wp);
  if (!pwr || pwr <= 0) { showError('powerSTC', 'err-powerSTC'); ok = false; }
  const eff = project.pvModule.efficiency;
  if (eff !== '' && eff !== null && (isNaN(eff) || eff < 1 || eff > 35)) {
    showError('pvEfficiency', 'err-pvEfficiency'); ok = false;
  }
  return ok;
}

function validateStep4() {
  clearErrors(4);
  let ok = true;
  if (!project.inverter.manufacturer?.trim()) { showError('invManufacturer', 'err-invManufacturer'); ok = false; }
  if (!project.inverter.model?.trim()) { showError('invModel', 'err-invModel'); ok = false; }
  const pwr = Number(project.inverter.ratedPower_kW);
  if (!pwr || pwr <= 0) { showError('invPower', 'err-invPower'); ok = false; }
  const eff = project.inverter.efficiency;
  if (eff !== '' && eff !== null && (isNaN(eff) || eff < 80 || eff > 100)) {
    showError('invEfficiency', 'err-invEfficiency'); ok = false;
  }
  const qty = Number(project.inverter.quantity);
  if (!qty || qty < 1 || !Number.isInteger(qty)) { showError('invQuantity', 'err-invQuantity'); ok = false; }
  return ok;
}

function validateStep5() {
  clearErrors(5);
  let ok = true;
  const tilt = project.structure.tiltAngle;
  if (tilt !== '' && tilt !== null && (isNaN(tilt) || tilt < 0 || tilt > 90)) {
    showError('tiltAngle', 'err-tiltAngle'); ok = false;
  }
  const az = project.structure.azimuth;
  if (az !== '' && az !== null && (isNaN(az) || az < 0 || az > 360)) {
    showError('azimuth', 'err-azimuth'); ok = false;
  }
  const gcr = project.structure.groundCoverageRatio;
  if (gcr !== '' && gcr !== null && (isNaN(gcr) || gcr < 0.1 || gcr > 1.0)) {
    showError('gcr', 'err-gcr'); ok = false;
  }
  return ok;
}

function validateStep6() {
  clearErrors(6);
  if (!project.bess.enabled) return true;
  let ok = true;
  const energy = Number(project.bess.energyCapacity_kWh);
  if (!energy || energy <= 0) { showError('bessEnergy', 'err-bessEnergy'); ok = false; }
  const pwr = Number(project.bess.power_kW);
  if (!pwr || pwr <= 0) { showError('bessPower', 'err-bessPower'); ok = false; }
  const dod = project.bess.dod;
  if (dod !== '' && dod !== null && (isNaN(dod) || dod < 50 || dod > 100)) {
    showError('bessDod', 'err-bessDod'); ok = false;
  }
  const rte = project.bess.rte;
  if (rte !== '' && rte !== null && (isNaN(rte) || rte < 60 || rte > 100)) {
    showError('bessRte', 'err-bessRte'); ok = false;
  }
  return ok;
}

function validateStep7() {
  clearErrors(7);
  let ok = true;
  const ghi = Number(project.siteConditions.ghi_kWhm2yr);
  if (!ghi || ghi < 500 || ghi > 3000) { showError('ghi', 'err-ghi'); ok = false; }
  const soil = project.siteConditions.soilingLossRate;
  if (soil !== '' && soil !== null && (isNaN(soil) || soil < 0 || soil > 20)) {
    showError('soilingRate', 'err-soilingRate'); ok = false;
  }
  return ok;
}

function validateStep8() {
  clearErrors(8);
  let ok = true;
  const pr = Number(project.yieldAssumptions.performanceRatio);
  if (!pr || pr < 0.5 || pr > 1.0) { showError('perfRatio', 'err-perfRatio'); ok = false; }
  return ok;
}

function validateStep9() {
  clearErrors(9);
  return true; // CAPEX step — no required fields
}

// ── BESS toggle ───────────────────────────────────────────────
function syncBessToggle() {
  const toggle = document.getElementById('bessEnabled');
  const fields = document.getElementById('bess-fields');
  if (!toggle || !fields) return;
  fields.classList.toggle('hidden', !toggle.checked);
}

// ── CAPEX auto-calculate ─────────────────────────────────────
function autoCalcCapex() {
  const c       = project.capexAssumptions;
  const cap     = project.capacity;
  const dcKwp   = Number(cap.dcCapacity_kWp) || 0;
  const dcWp    = dcKwp * 1000;
  const bessKwh = project.bess.enabled ? (Number(project.bess.energyCapacity_kWh) || 0) : 0;

  const pvCost       = (Number(c.pvModuleCost_perWp)   || 0) * dcWp;
  const invCost      = (Number(c.inverterCost_perW)     || 0) * dcWp;
  const structCost   = (Number(c.structureCost_perWp)   || 0) * dcWp;
  const bessCost     = (Number(c.bessCost_perKwh)       || 0) * bessKwh;
  const civilCost    = (Number(c.civilCost_perWp)       || 0) * dcWp;
  const electricCost = (Number(c.electricalCost_perWp)  || 0) * dcWp;
  const margin       = (Number(c.epcMargin_pct)         || 0) / 100;

  const subtotal = pvCost + invCost + structCost + bessCost + civilCost + electricCost;
  const total    = subtotal * (1 + margin);

  return { pvCost, invCost, structCost, bessCost, civilCost, electricCost, subtotal, total, margin };
}

function updateCapexPreview() {
  const result  = autoCalcCapex();
  const preview = document.getElementById('capex-preview');
  const table   = document.getElementById('capex-table');
  const cur     = project.capexAssumptions.currency || 'USD';

  if (!result.subtotal) { if (preview) preview.style.display = 'none'; return; }
  if (preview) preview.style.display = '';

  // Auto-fill total if not overridden
  const totalEl = document.getElementById('totalCapex');
  if (totalEl && !totalEl.dataset.userOverride) {
    totalEl.value = Math.round(result.total);
    project.capexAssumptions.totalCapex_USD = Math.round(result.total);
  }

  const rows = [
    { label: 'PV Modules',           value: result.pvCost },
    { label: 'Inverters',            value: result.invCost },
    { label: 'Structure / Racking',  value: result.structCost },
    { label: 'BESS',                 value: result.bessCost },
    { label: 'Civil Works',          value: result.civilCost },
    { label: 'Electrical BOS',       value: result.electricCost },
  ].filter(r => r.value > 0);

  if (!table) return;
  table.innerHTML = rows.map(r => {
    const pct = result.subtotal > 0 ? ((r.value / result.subtotal) * 100).toFixed(1) : '0';
    return `<span class="ct-label">${escHtml(r.label)}</span>
            <span class="ct-value">${cur} ${fmt(r.value)}</span>
            <span class="ct-pct">${pct}%</span>`;
  }).join('') + `
    <span class="ct-label ct-total">Total CAPEX (incl. EPC margin)</span>
    <span class="ct-value ct-total">${cur} ${fmt(result.total)}</span>
    <span class="ct-pct ct-total"></span>
  `;
}

// ── Review summary ────────────────────────────────────────────
function reviewDl(pairs) {
  return `<dl class="review-dl">${pairs
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `<dt>${escHtml(k)}</dt><dd>${escHtml(String(v))}</dd>`)
    .join('')}</dl>`;
}

function reviewCard(title, pairs, editStep) {
  const hasPairs = pairs.some(([, v]) => v !== '' && v !== null && v !== undefined);
  if (!hasPairs) return '';
  return `
  <div class="review-card">
    <div class="review-card__header">
      <span class="review-card__title">${escHtml(title)}</span>
      <button class="review-card__edit" data-goto="${editStep}" type="button">Edit</button>
    </div>
    <div class="review-card__body">${reviewDl(pairs)}</div>
  </div>`;
}

function buildReviewSummary() {
  const p  = project;
  const pi = p.projectInfo;
  const ca = p.capacity;
  const pv = p.pvModule;
  const iv = p.inverter;
  const st = p.structure;
  const be = p.bess;
  const sc = p.siteConditions;
  const ya = p.yieldAssumptions;
  const cx = p.capexAssumptions;
  const cur = cx.currency || 'USD';

  const cards = [
    reviewCard('Project Info', [
      ['Name',         pi.name],
      ['Client',       pi.client],
      ['Location',     [pi.location, pi.country].filter(Boolean).join(', ')],
      ['Coordinates',  pi.latitude && pi.longitude ? `${pi.latitude}°, ${pi.longitude}°` : ''],
      ['Type',         pi.projectType],
    ], 1),
    reviewCard('Capacity', [
      ['DC Capacity',  ca.dcCapacity_kWp ? ca.dcCapacity_kWp + ' kWp' : ''],
      ['AC Capacity',  ca.acCapacity_kW  ? ca.acCapacity_kW  + ' kW'  : ''],
      ['DC/AC Ratio',  ca.dcAcRatio],
      ['Strings',      ca.numberOfStrings],
      ['Arrays',       ca.numberOfArrays],
    ], 2),
    reviewCard('PV Module', [
      ['Manufacturer', pv.manufacturer],
      ['Model',        pv.model],
      ['Power (STC)',  pv.powerSTC_Wp ? pv.powerSTC_Wp + ' Wp' : ''],
      ['Efficiency',   pv.efficiency  ? pv.efficiency  + ' %'  : ''],
      ['Voc / Vmp',    pv.voc && pv.vmp ? `${pv.voc} V / ${pv.vmp} V` : ''],
      ['Isc / Imp',    pv.isc && pv.imp ? `${pv.isc} A / ${pv.imp} A` : ''],
      ['Temp. Coeff.', pv.tempCoeffPmax ? pv.tempCoeffPmax + ' %/°C' : ''],
      ['Modules/String', pv.modulesPerString],
    ], 3),
    reviewCard('Inverter', [
      ['Manufacturer', iv.manufacturer],
      ['Model',        iv.model],
      ['Rated Power',  iv.ratedPower_kW ? iv.ratedPower_kW + ' kW' : ''],
      ['Efficiency',   iv.efficiency    ? iv.efficiency    + ' %'  : ''],
      ['MPPT Range',   iv.mpptRangeMin && iv.mpptRangeMax ? `${iv.mpptRangeMin}–${iv.mpptRangeMax} V` : ''],
      ['Quantity',     iv.quantity],
    ], 4),
    reviewCard('Structure', [
      ['Mounting Type', st.mountingType],
      ['Material',      st.structureType],
      ['Tilt',          st.tiltAngle  != null && st.tiltAngle  !== '' ? st.tiltAngle  + '°' : ''],
      ['Azimuth',       st.azimuth    != null && st.azimuth    !== '' ? st.azimuth    + '°' : ''],
      ['GCR',           st.groundCoverageRatio],
      ['Pitch',         st.pitchM ? st.pitchM + ' m' : ''],
    ], 5),
    be.enabled ? reviewCard('BESS', [
      ['Manufacturer',   be.manufacturer],
      ['Model',          be.model],
      ['Energy Capacity', be.energyCapacity_kWh ? be.energyCapacity_kWh + ' kWh' : ''],
      ['Power',          be.power_kW ? be.power_kW + ' kW' : ''],
      ['Chemistry',      be.chemistry],
      ['DoD',            be.dod  ? be.dod  + ' %' : ''],
      ['RTE',            be.rte  ? be.rte  + ' %' : ''],
      ['Cycle Life',     be.cycles],
    ], 6) : '',
    reviewCard('Site Conditions', [
      ['GHI',         sc.ghi_kWhm2yr ? sc.ghi_kWhm2yr + ' kWh/m²/yr' : ''],
      ['DNI',         sc.dni_kWhm2yr ? sc.dni_kWhm2yr + ' kWh/m²/yr' : ''],
      ['Avg Temp.',   sc.avgTemp_C   ? sc.avgTemp_C   + ' °C'         : ''],
      ['Max Temp.',   sc.maxTemp_C   ? sc.maxTemp_C   + ' °C'         : ''],
      ['Wind Speed',  sc.windSpeed_ms ? sc.windSpeed_ms + ' m/s'      : ''],
      ['Altitude',    sc.altitude_m   ? sc.altitude_m   + ' m'        : ''],
      ['Soiling Rate', sc.soilingLossRate ? sc.soilingLossRate + ' %/yr' : ''],
    ], 7),
    reviewCard('Yield Assumptions', [
      ['Performance Ratio', ya.performanceRatio ? (Number(ya.performanceRatio) * 100).toFixed(1) + ' %' : ''],
      ['Soiling Loss',      ya.soilingLoss     ? ya.soilingLoss     + ' %' : ''],
      ['Shading Loss',      ya.shadingLoss     ? ya.shadingLoss     + ' %' : ''],
      ['Mismatch Loss',     ya.mismatchLoss    ? ya.mismatchLoss    + ' %' : ''],
      ['Wiring Loss',       ya.wiringLoss      ? ya.wiringLoss      + ' %' : ''],
      ['Availability Loss', ya.availabilityLoss ? ya.availabilityLoss + ' %' : ''],
      ['Degradation',       ya.degradationRate ? ya.degradationRate + ' %/yr' : ''],
      ['P50 Yield',         ya.p50_kWh ? fmt(ya.p50_kWh) + ' MWh' : ''],
      ['P90 Yield',         ya.p90_kWh ? fmt(ya.p90_kWh) + ' MWh' : ''],
    ], 8),
    reviewCard('CAPEX', [
      ['Currency',         cur],
      ['PV Module',        cx.pvModuleCost_perWp   ? `${cur} ${cx.pvModuleCost_perWp}/Wp`   : ''],
      ['Inverter',         cx.inverterCost_perW    ? `${cur} ${cx.inverterCost_perW}/W`     : ''],
      ['Structure',        cx.structureCost_perWp  ? `${cur} ${cx.structureCost_perWp}/Wp`  : ''],
      ['BESS',             cx.bessCost_perKwh      ? `${cur} ${cx.bessCost_perKwh}/kWh`     : ''],
      ['Civil Works',      cx.civilCost_perWp      ? `${cur} ${cx.civilCost_perWp}/Wp`      : ''],
      ['Electrical BOS',   cx.electricalCost_perWp ? `${cur} ${cx.electricalCost_perWp}/Wp` : ''],
      ['EPC Margin',       cx.epcMargin_pct        ? cx.epcMargin_pct + ' %'                : ''],
      ['Total CAPEX',      cx.totalCapex_USD       ? `${cur} ${fmt(Number(cx.totalCapex_USD))}` : ''],
    ], 9),
  ].filter(Boolean).join('');

  const reviewEl = document.getElementById('review-summary');
  reviewEl.innerHTML = `<div class="review-grid">${cards}</div>`;

  // Wire "Edit" buttons
  reviewEl.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => goToStep(Number(btn.dataset.goto)));
  });
}

// ── Wire all events ───────────────────────────────────────────
function wireEvents() {
  // Next button
  btnNext.addEventListener('click', () => {
    collectStep(currentStep);
    const validate = VALIDATORS[currentStep];
    if (validate && !validate()) {
      showToast('Please fix the highlighted fields before continuing.', 'error');
      return;
    }
    doneSteps.add(currentStep);
    if (currentStep < STEPS.length) goToStep(currentStep + 1);
  });

  // Prev button
  btnPrev.addEventListener('click', () => {
    collectStep(currentStep);
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  // Save draft buttons
  [btnSaveDraft, btnSaveDraftFt].forEach(btn => {
    btn?.addEventListener('click', handleSaveDraft);
  });

  // Create project button
  btnCreate.addEventListener('click', handleCreate);

  // BESS toggle
  document.getElementById('bessEnabled')?.addEventListener('change', () => {
    project.bess.enabled = document.getElementById('bessEnabled').checked;
    syncBessToggle();
  });

  // CAPEX live preview (input on step 9)
  document.querySelector('.step-panel[data-step="9"]')?.addEventListener('input', () => {
    collectStep(9);
    updateCapexPreview();
  });

  // Total CAPEX manual override detection
  const totalCapexEl = document.getElementById('totalCapex');
  totalCapexEl?.addEventListener('input', () => {
    totalCapexEl.dataset.userOverride = totalCapexEl.value ? '1' : '';
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Enter' && e.ctrlKey) btnNext.click();
  });

  // Sidebar step click (navigation only to visited / earlier steps)
  stepListEl.addEventListener('click', e => {
    const li = e.target.closest('.step-list__item');
    if (!li) return;
    const target = Number(li.dataset.step);
    if (target === currentStep) return;
    // Allow going back freely; going forward only if step is done
    if (target < currentStep || doneSteps.has(target) || target === currentStep + 1) {
      collectStep(currentStep);
      const validate = VALIDATORS[currentStep];
      if (target > currentStep && validate && !validate()) {
        showToast('Please fix the highlighted fields before continuing.', 'error');
        return;
      }
      if (target > currentStep) doneSteps.add(currentStep);
      goToStep(target);
    }
  });
}

// ── Save draft handler ────────────────────────────────────────
function handleSaveDraft() {
  collectStep(currentStep);
  saveDraft(project);
  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (draftHint) draftHint.textContent = `Saved at ${now}`;
  showToast('Draft saved successfully.', 'success');
}

// ── Create project handler ────────────────────────────────────
async function handleCreate() {
  collectStep(currentStep);

  // Final validation pass on all steps
  let allValid = true;
  for (let s = 1; s <= 9; s++) {
    const validate = VALIDATORS[s];
    if (validate && !validate()) {
      allValid = false;
      showToast(`Step ${s} has validation errors. Please review.`, 'error', 4000);
      goToStep(s);
      return;
    }
  }

  if (!allValid) return;

  // Mark as active and create linked shells
  project.status = 'active';
  project.createdAt  = project.createdAt  || new Date().toISOString();
  project.updatedAt  = new Date().toISOString();
  project.shells     = createShells(project.id);

  // Persist
  upsertProject(project);
  clearDraft();

  // Visual feedback
  btnCreate.disabled = true;
  btnCreate.innerHTML = `<span class="spinner"></span> Creating…`;

  // Simulate brief async (would be API call in production)
  await new Promise(r => setTimeout(r, 900));

  showToast('Project created successfully!', 'success', 4000);
  window.location.href = `project.html?id=${project.id}`;
}

// ── Bootstrap ─────────────────────────────────────────────────
init();
