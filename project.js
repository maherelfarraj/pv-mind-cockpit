/* ============================================================
   project.js — Project detail page
   ============================================================ */
'use strict';

import { getProject } from './data.js';
import { getParam, escHtml, fmt } from './utils.js';

const id = getParam('id');

function notFound() {
  document.getElementById('project-hero').style.display  = 'none';
  document.getElementById('kpi-strip').style.display     = 'none';
  document.getElementById('main-content').innerHTML = `
    <div class="not-found">
      <h2>Project not found</h2>
      <p>The project you are looking for does not exist or may have been deleted.</p>
      <a href="index.html" class="btn btn--primary">Back to Dashboard</a>
    </div>`;
}

function init() {
  if (!id) { notFound(); return; }
  const p = getProject(id);
  if (!p) { notFound(); return; }

  // Page title
  document.title = `${p.projectInfo?.name || 'Project'} — PV-Mind Cockpit`;
  document.getElementById('nav-project-name').textContent = p.projectInfo?.name || 'Project';

  renderHero(p);
  renderKpis(p);
  renderShells(p);
  renderDataCards(p);
}

// ── Hero ─────────────────────────────────────────────────────
function renderHero(p) {
  const pi = p.projectInfo || {};
  document.getElementById('hero-name').textContent = pi.name || 'Untitled Project';
  document.getElementById('hero-status').innerHTML = p.status === 'active'
    ? '<span class="badge badge--green">Active</span>'
    : '<span class="badge badge--amber">Draft</span>';

  const parts = [
    [pi.location, pi.country].filter(Boolean).join(', '),
    pi.client,
    pi.projectType ? pi.projectType.charAt(0).toUpperCase() + pi.projectType.slice(1) + ' Scale' : '',
    p.createdAt ? 'Created ' + new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(p.createdAt)) : '',
  ].filter(Boolean);
  document.getElementById('hero-meta').textContent = parts.join('  •  ');

  document.getElementById('btn-edit-project').href = `wizard.html?edit=${p.id}`;
}

// ── KPI strip ─────────────────────────────────────────────────
function renderKpis(p) {
  const ca = p.capacity || {};
  const ya = p.yieldAssumptions || {};
  const cx = p.capexAssumptions || {};
  const be = p.bess || {};

  const dcKwp  = Number(ca.dcCapacity_kWp) || 0;
  const dcLabel = dcKwp >= 1000 ? (dcKwp/1000).toFixed(2) + ' MWp' : dcKwp ? dcKwp + ' kWp' : '—';

  const acKw  = Number(ca.acCapacity_kW) || 0;
  const acLabel = acKw >= 1000 ? (acKw/1000).toFixed(2) + ' MW AC' : acKw ? acKw + ' kW' : '—';

  const pr    = ya.performanceRatio ? (Number(ya.performanceRatio) * 100).toFixed(1) + '%' : '—';
  const p50   = ya.p50_kWh ? fmt(Number(ya.p50_kWh)) + ' MWh' : '—';
  const capex = cx.totalCapex_USD ? (cx.currency || 'USD') + ' ' + fmt(Number(cx.totalCapex_USD)) : '—';
  const bess  = be.enabled && be.energyCapacity_kWh
    ? (Number(be.energyCapacity_kWh) >= 1000
        ? (Number(be.energyCapacity_kWh)/1000).toFixed(1) + ' MWh'
        : be.energyCapacity_kWh + ' kWh')
    : 'None';

  const kpis = [
    { label: 'DC Capacity',   value: dcLabel },
    { label: 'AC Capacity',   value: acLabel },
    { label: 'DC/AC Ratio',   value: ca.dcAcRatio || '—' },
    { label: 'Performance Ratio', value: pr },
    { label: 'P50 Yield',     value: p50 },
    { label: 'BESS',          value: bess },
    { label: 'Total CAPEX',   value: capex },
  ];

  document.getElementById('kpi-grid').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <span class="kpi-card__value">${escHtml(k.value)}</span>
      <span class="kpi-card__label">${escHtml(k.label)}</span>
    </div>`).join('');
}

// ── Shells ────────────────────────────────────────────────────
function renderShells(p) {
  const shells = p.shells || {};

  const defs = [
    { key: 'pvDesignId',   label: 'PV Design',           icon: '☀️',  bg: '#fffbeb' },
    { key: 'bessDesignId', label: 'BESS Design',          icon: '🔋',  bg: '#f0fdf4' },
    { key: 'yieldSimId',   label: 'Yield Simulation',     icon: '📈',  bg: '#eff6ff' },
    { key: 'capexSheetId', label: 'CAPEX Sheet',          icon: '💰',  bg: '#fdf4ff' },
    { key: 'bomId',        label: 'Bill of Materials',    icon: '📋',  bg: '#f0fdf4' },
    { key: 'sldId',        label: 'Single-Line Diagram',  icon: '⚡',  bg: '#fef3c7' },
    { key: 'simulationId', label: 'Simulation Model',     icon: '🔬',  bg: '#eff6ff' },
    { key: 'scadaId',      label: 'SCADA Shell',          icon: '🖥️',  bg: '#fef2f2' },
  ];

  document.getElementById('shells-grid').innerHTML = defs.map(d => {
    const shellId = shells[d.key];
    const shortId = shellId ? shellId.split('-')[0] : 'pending';
    return `
    <div class="shell-card">
      <div class="shell-card__icon" style="background:${d.bg}">${d.icon}</div>
      <div class="shell-card__body">
        <div class="shell-card__title">${escHtml(d.label)}</div>
        <div class="shell-card__id">${escHtml(shortId)}</div>
        <div class="shell-card__status">
          ${shellId
            ? '<span class="badge badge--green">Created</span>'
            : '<span class="badge badge--gray">Pending</span>'}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Data cards ────────────────────────────────────────────────
function dl(pairs) {
  const filtered = pairs.filter(([, v]) => v !== '' && v !== null && v !== undefined && v !== '—');
  if (!filtered.length) return '<p class="text-muted text-sm">No data entered.</p>';
  return `<dl class="data-dl">${filtered.map(([k, v]) =>
    `<dt>${escHtml(k)}</dt><dd>${escHtml(String(v))}</dd>`).join('')}</dl>`;
}

function card(icon, title, pairs) {
  return `
  <div class="data-card">
    <div class="data-card__header">
      <span class="data-card__icon">${icon}</span>
      <span class="data-card__title">${escHtml(title)}</span>
    </div>
    <div class="data-card__body">${dl(pairs)}</div>
  </div>`;
}

function renderDataCards(p) {
  const pi = p.projectInfo  || {};
  const ca = p.capacity     || {};
  const pv = p.pvModule     || {};
  const iv = p.inverter     || {};
  const st = p.structure    || {};
  const be = p.bess         || {};
  const sc = p.siteConditions || {};
  const ya = p.yieldAssumptions || {};
  const cx = p.capexAssumptions || {};
  const cur = cx.currency || 'USD';

  document.getElementById('proj-data-grid').innerHTML = [
    card('📍', 'Project Info', [
      ['Name',        pi.name],
      ['Client',      pi.client],
      ['Location',    pi.location],
      ['Country',     pi.country],
      ['Latitude',    pi.latitude  ? pi.latitude  + '°' : ''],
      ['Longitude',   pi.longitude ? pi.longitude + '°' : ''],
      ['Type',        pi.projectType],
      ['Description', pi.description],
    ]),
    card('⚡', 'Capacity', [
      ['DC Capacity',     ca.dcCapacity_kWp  ? ca.dcCapacity_kWp  + ' kWp' : ''],
      ['AC Capacity',     ca.acCapacity_kW   ? ca.acCapacity_kW   + ' kW'  : ''],
      ['DC/AC Ratio',     ca.dcAcRatio],
      ['Strings',         ca.numberOfStrings],
      ['Arrays / Tables', ca.numberOfArrays],
    ]),
    card('☀️', 'PV Module', [
      ['Manufacturer',   pv.manufacturer],
      ['Model',          pv.model],
      ['Power @ STC',    pv.powerSTC_Wp ? pv.powerSTC_Wp + ' Wp' : ''],
      ['Efficiency',     pv.efficiency  ? pv.efficiency  + ' %'  : ''],
      ['Voc',            pv.voc ? pv.voc + ' V' : ''],
      ['Isc',            pv.isc ? pv.isc + ' A' : ''],
      ['Vmp',            pv.vmp ? pv.vmp + ' V' : ''],
      ['Imp',            pv.imp ? pv.imp + ' A' : ''],
      ['Temp. Coeff.',   pv.tempCoeffPmax ? pv.tempCoeffPmax + ' %/°C' : ''],
      ['Modules/String', pv.modulesPerString],
    ]),
    card('🔌', 'Inverter', [
      ['Manufacturer', iv.manufacturer],
      ['Model',        iv.model],
      ['Rated Power',  iv.ratedPower_kW ? iv.ratedPower_kW + ' kW' : ''],
      ['Efficiency',   iv.efficiency    ? iv.efficiency    + ' %'  : ''],
      ['MPPT Range',   iv.mpptRangeMin && iv.mpptRangeMax ? `${iv.mpptRangeMin}–${iv.mpptRangeMax} V` : ''],
      ['MPPT Inputs',  iv.numberOfMPPT],
      ['Quantity',     iv.quantity],
    ]),
    card('🏗️', 'Structure', [
      ['Mounting Type',    st.mountingType],
      ['Material / Brand', st.structureType],
      ['Tilt Angle',       st.tiltAngle  != null && st.tiltAngle  !== '' ? st.tiltAngle  + '°' : ''],
      ['Azimuth',          st.azimuth    != null && st.azimuth    !== '' ? st.azimuth    + '°' : ''],
      ['GCR',              st.groundCoverageRatio],
      ['Row Pitch',        st.pitchM ? st.pitchM + ' m' : ''],
    ]),
    be.enabled ? card('🔋', 'BESS', [
      ['Manufacturer',     be.manufacturer],
      ['Model',            be.model],
      ['Energy Capacity',  be.energyCapacity_kWh ? be.energyCapacity_kWh + ' kWh' : ''],
      ['Power',            be.power_kW ? be.power_kW + ' kW' : ''],
      ['Chemistry',        be.chemistry],
      ['DoD',              be.dod  ? be.dod  + ' %' : ''],
      ['RTE',              be.rte  ? be.rte  + ' %' : ''],
      ['Cycle Life',       be.cycles],
    ]) : '',
    card('🌤️', 'Site Conditions', [
      ['GHI',          sc.ghi_kWhm2yr ? sc.ghi_kWhm2yr + ' kWh/m²/yr' : ''],
      ['DNI',          sc.dni_kWhm2yr ? sc.dni_kWhm2yr + ' kWh/m²/yr' : ''],
      ['DHI',          sc.dhi_kWhm2yr ? sc.dhi_kWhm2yr + ' kWh/m²/yr' : ''],
      ['Avg. Temp.',   sc.avgTemp_C  ? sc.avgTemp_C  + ' °C' : ''],
      ['Max. Temp.',   sc.maxTemp_C  ? sc.maxTemp_C  + ' °C' : ''],
      ['Min. Temp.',   sc.minTemp_C  ? sc.minTemp_C  + ' °C' : ''],
      ['Wind Speed',   sc.windSpeed_ms ? sc.windSpeed_ms + ' m/s' : ''],
      ['Altitude',     sc.altitude_m   ? sc.altitude_m   + ' m.a.s.l.' : ''],
      ['Soiling Rate', sc.soilingLossRate ? sc.soilingLossRate + ' %/yr' : ''],
      ['Snow Zone',    sc.snowLoadZone],
    ]),
    card('📈', 'Yield Assumptions', [
      ['Performance Ratio', ya.performanceRatio ? (Number(ya.performanceRatio) * 100).toFixed(1) + ' %' : ''],
      ['Soiling Loss',      ya.soilingLoss     ? ya.soilingLoss     + ' %' : ''],
      ['Shading Loss',      ya.shadingLoss     ? ya.shadingLoss     + ' %' : ''],
      ['Mismatch Loss',     ya.mismatchLoss    ? ya.mismatchLoss    + ' %' : ''],
      ['Wiring Loss',       ya.wiringLoss      ? ya.wiringLoss      + ' %' : ''],
      ['Availability Loss', ya.availabilityLoss ? ya.availabilityLoss + ' %' : ''],
      ['Degradation',       ya.degradationRate  ? ya.degradationRate  + ' %/yr' : ''],
      ['P50 Yield',         ya.p50_kWh ? fmt(Number(ya.p50_kWh)) + ' MWh' : ''],
      ['P90 Yield',         ya.p90_kWh ? fmt(Number(ya.p90_kWh)) + ' MWh' : ''],
    ]),
    card('💰', 'CAPEX', [
      ['Currency',      cur],
      ['PV Modules',    cx.pvModuleCost_perWp   ? `${cur} ${cx.pvModuleCost_perWp}/Wp`   : ''],
      ['Inverters',     cx.inverterCost_perW    ? `${cur} ${cx.inverterCost_perW}/W`     : ''],
      ['Structure',     cx.structureCost_perWp  ? `${cur} ${cx.structureCost_perWp}/Wp`  : ''],
      ['BESS',          cx.bessCost_perKwh      ? `${cur} ${cx.bessCost_perKwh}/kWh`     : ''],
      ['Civil Works',   cx.civilCost_perWp      ? `${cur} ${cx.civilCost_perWp}/Wp`      : ''],
      ['Electrical BOS', cx.electricalCost_perWp ? `${cur} ${cx.electricalCost_perWp}/Wp` : ''],
      ['EPC Margin',    cx.epcMargin_pct  ? cx.epcMargin_pct + ' %' : ''],
      ['Total CAPEX',   cx.totalCapex_USD ? `${cur} ${fmt(Number(cx.totalCapex_USD))}` : ''],
    ]),
  ].filter(Boolean).join('');
}

init();
