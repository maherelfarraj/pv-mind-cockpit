/* ============================================================
   dashboard.js — project list rendering & search
   ============================================================ */
'use strict';

import { loadProjects, deleteProject } from './data.js';
import { showToast } from './utils.js';

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch { return '—'; }
}

function typeIcon(type) {
  const icons = {
    utility:     'M4 18 L12 6 L20 18',
    commercial:  'M3 18 V8 h18 v10',
    industrial:  'M2 18 V10 L8 4 L14 10 V18',
    residential: 'M2 18 L10 4 L18 18',
  };
  const path = icons[type] || icons.utility;
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="${path}" stroke="#1a6b3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="4" y1="20" x2="20" y2="20" stroke="#f5a623" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function renderCard(p) {
  const dc = p.capacity?.dcCapacity_kWp
    ? (p.capacity.dcCapacity_kWp >= 1000
        ? (p.capacity.dcCapacity_kWp / 1000).toFixed(2) + ' MWp'
        : p.capacity.dcCapacity_kWp + ' kWp')
    : '—';

  const pr = p.yieldAssumptions?.performanceRatio
    ? (p.yieldAssumptions.performanceRatio * 100).toFixed(1) + '%'
    : '—';

  const capex = p.capexAssumptions?.totalCapex_USD
    ? '$' + Number(p.capexAssumptions.totalCapex_USD).toLocaleString()
    : '—';

  const location = [p.projectInfo?.location, p.projectInfo?.country].filter(Boolean).join(', ') || 'Location TBD';
  const statusBadge = p.status === 'active'
    ? '<span class="badge badge--green">Active</span>'
    : '<span class="badge badge--amber">Draft</span>';

  return `
<article class="project-card" data-id="${p.id}">
  <div class="project-card__header">
    <div class="project-card__icon">${typeIcon(p.projectInfo?.projectType)}</div>
    <div class="project-card__meta">
      <a href="project.html?id=${p.id}" class="project-card__name">${escHtml(p.projectInfo?.name || 'Untitled Project')}</a>
      <span class="project-card__location">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M5 1a3 3 0 010 6c-1.7 0-3-1.3-3-3s1.3-3 3-3z" stroke="#6b7a8d" stroke-width="1.2" fill="none"/>
          <circle cx="5" cy="4" r="1" fill="#6b7a8d"/>
          <path d="M5 7v2" stroke="#6b7a8d" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        ${escHtml(location)}
      </span>
    </div>
    ${statusBadge}
  </div>
  <div class="project-card__body">
    <div class="project-card__kpis">
      <div class="kpi"><div class="kpi__value">${dc}</div><div class="kpi__label">DC Capacity</div></div>
      <div class="kpi"><div class="kpi__value">${pr}</div><div class="kpi__label">Perf. Ratio</div></div>
      <div class="kpi"><div class="kpi__value">${capex}</div><div class="kpi__label">CAPEX</div></div>
    </div>
  </div>
  <div class="project-card__footer">
    <span class="project-card__date">Created ${formatDate(p.createdAt)}</span>
    <div class="project-card__actions">
      <a href="project.html?id=${p.id}" class="btn btn--sm btn--outline">Open</a>
      <button class="btn btn--sm btn--ghost" data-del="${p.id}" aria-label="Delete project">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1.5 3h9M4 3V2h4v1M5 5v4M7 5v4M2 3l.75 7.5h6.5L10 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</article>`;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function render(projects) {
  const grid  = document.getElementById('project-grid');
  const empty = document.getElementById('empty-state');

  if (!projects.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = projects.map(renderCard).join('');

  // stats
  const total  = projects.length;
  const active = projects.filter(p => p.status === 'active').length;
  const draft  = projects.filter(p => p.status === 'draft').length;
  const mwp    = projects.reduce((acc, p) => acc + (Number(p.capacity?.dcCapacity_kWp) || 0), 0) / 1000;

  document.getElementById('stat-total').textContent  = total;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-draft').textContent  = draft;
  document.getElementById('stat-mwp').textContent    = mwp.toFixed(2);
}

function init() {
  const projects = loadProjects();
  render(projects);

  // Search
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { render(loadProjects()); return; }
    render(loadProjects().filter(p =>
      (p.projectInfo?.name || '').toLowerCase().includes(q) ||
      (p.projectInfo?.location || '').toLowerCase().includes(q) ||
      (p.projectInfo?.country || '').toLowerCase().includes(q)
    ));
  });

  // Delete
  document.getElementById('project-grid').addEventListener('click', e => {
    const delBtn = e.target.closest('[data-del]');
    if (!delBtn) return;
    const id = delBtn.dataset.del;
    if (!confirm('Delete this project? This cannot be undone.')) return;
    deleteProject(id);
    render(loadProjects());
    showToast('Project deleted', 'success');
  });
}

init();
