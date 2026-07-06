const pages = [
  "Project Setup",
  "Site & Weather",
  "Variants",
  "Orientation",
  "System / Sub-Arrays",
  "PV Module",
  "Inverter",
  "Stringing & MPPT",
  "Bifacial Setup",
  "Detailed Losses",
  "Horizon",
  "Near Shadings",
  "3D Shading Scene",
  "Energy Management",
  "P50 / P90",
  "Run Simulation",
  "Results",
  "Loss Diagram",
  "Simulation Report",
];

const lossTabs = [
  "Thermal Parameter",
  "Ohmic Losses",
  "Module Quality - LID - Mismatch",
  "Soiling Loss",
  "IAM Losses",
  "Auxiliaries",
  "Ageing",
  "Unavailability",
  "Spectral Correction",
];

const defaults = {
  projectName: "Demo Utility Plant",
  siteName: "Default Site",
  annualGHI: 2050,
  area: 100000,
  horizonLossPct: 1.5,
  nearShadingLossPct: 2,
  orientationLossPct: 2,
  installedKwp: 10000,
  moduleEfficiencyPct: 21,
  inverterLossPct: 2.2,
  acLossPct: 1.2,
  transformerLossPct: 0.7,
};

const results = {
  "Gross irradiation": 0,
  "Collector-plane irradiation": 0,
  "Shading losses": 0,
  "Soiling losses": 0,
  "IAM losses": 0,
  "Thermal losses": 0,
  "Module quality losses": 0,
  LID: 0,
  Mismatch: 0,
  "DC ohmic losses": 0,
  "Inverter losses": 0,
  "AC losses": 0,
  "Transformer losses": 0,
  "Unavailability losses": 0,
  "Grid energy": 0,
  "Specific production": 0,
  "Performance ratio": 0,
  P50: 0,
  P90: 0,
  P95: 0,
};

const state = {
  page: pages[0],
  detailTab: lossTabs[0],
  values: { ...defaults, ...loadJson("sim-core", {}) },
  detailedLosses: {
    ...lossTabs.reduce((acc, tab) => {
      acc[tab] = { lossPct: 0, note: "" };
      return acc;
    }, {}),
    ...loadJson("sim-losses", {}),
  },
  results: { ...results, ...loadJson("sim-results", {}) },
  reportText: loadJson("sim-report", ""),
};

const navEl = document.getElementById("pageNav");
const contentEl = document.getElementById("pageContent");
const overlayEl = document.getElementById("overlay");

function loadJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toNum(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function clampPct(value) {
  return Math.max(0, Math.min(100, value));
}

function createInput(name, label, value, type = "number", step = "any") {
  const inputType = type === "text" ? "text" : "number";
  const stepPart = inputType === "number" ? `step="${step}"` : "";
  return `<label>${label}<input data-name="${name}" type="${inputType}" value="${value ?? ""}" ${stepPart} /></label>`;
}

function renderNav() {
  navEl.innerHTML = pages
    .map(
      (p) => `<button class="${state.page === p ? "active" : ""}" data-page="${p}">${p}</button>`
    )
    .join("");
}

function pageCard(title, body, statusId) {
  return `<article class="card"><h2>${title}</h2>${body}<div id="${statusId}" class="status"></div></article>`;
}

function bindSimpleSave(container, keyPrefix) {
  const btn = container.querySelector("[data-action='save']");
  const status = container.querySelector(".status");
  btn?.addEventListener("click", () => {
    status.textContent = "";
    status.classList.remove("error");

    const inputs = [...container.querySelectorAll("input[data-name]")];
    const updates = {};

    for (const input of inputs) {
      const name = input.dataset.name;
      const raw = input.value;
      if (input.type === "number") {
        const v = toNum(raw);
        if (!Number.isFinite(v) || v < 0) {
          status.textContent = `Validation failed: ${name} must be a non-negative number.`;
          status.classList.add("error");
          return;
        }
        updates[name] = v;
      } else {
        if (!raw.trim()) {
          status.textContent = `Validation failed: ${name} is required.`;
          status.classList.add("error");
          return;
        }
        updates[name] = raw.trim();
      }
    }

    Object.assign(state.values, updates);
    saveJson("sim-core", state.values);
    status.textContent = `${keyPrefix} saved.`;
  });
}

function renderDetailedLosses() {
  const tabButtons = lossTabs
    .map(
      (t) =>
        `<button class="${state.detailTab === t ? "active" : ""}" data-loss-tab="${t}">${t}</button>`
    )
    .join("");

  const tabValue = state.detailedLosses[state.detailTab] || { lossPct: 0, note: "" };

  contentEl.innerHTML = `
    <article class="card">
      <h2>Detailed Losses</h2>
      <div class="tab-strip">${tabButtons}</div>
      <div class="form-grid">
        ${createInput("lossPct", `${state.detailTab} (%)`, tabValue.lossPct, "number", "0.01")}
        <label>Engineering Note
          <textarea data-name="note">${tabValue.note ?? ""}</textarea>
        </label>
      </div>
      <div class="inline-actions">
        <button data-action="save-loss">Save ${state.detailTab}</button>
        <span id="lossStatus" class="status"></span>
      </div>
      <p>Saved detailed losses are consumed by Run Simulation and reflected in Results, Loss Diagram, and Simulation Report.</p>
    </article>
  `;

  contentEl.querySelectorAll("[data-loss-tab]").forEach((el) => {
    el.addEventListener("click", () => {
      state.detailTab = el.dataset.lossTab;
      render();
    });
  });

  const lossBtn = contentEl.querySelector("[data-action='save-loss']");
  const statusEl = contentEl.querySelector("#lossStatus");
  lossBtn.addEventListener("click", () => {
    statusEl.textContent = "";
    statusEl.classList.remove("error");

    const pct = toNum(contentEl.querySelector("input[data-name='lossPct']").value);
    const note = contentEl.querySelector("textarea[data-name='note']").value.trim();

    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      statusEl.textContent = "Validation failed: lossPct must be between 0 and 100.";
      statusEl.classList.add("error");
      return;
    }

    if (!note) {
      statusEl.textContent = "Validation failed: engineering note is required.";
      statusEl.classList.add("error");
      return;
    }

    state.detailedLosses[state.detailTab] = { lossPct: pct, note };
    saveJson("sim-losses", state.detailedLosses);
    statusEl.textContent = `${state.detailTab} saved.`;
  });
}

function getSavedLoss(name) {
  return clampPct(toNum(state.detailedLosses[name]?.lossPct) || 0) / 100;
}

function runSimulation() {
  const ghi = state.values.annualGHI;
  const area = state.values.area;
  const installedKwp = state.values.installedKwp;
  const moduleEff = clampPct(state.values.moduleEfficiencyPct) / 100;

  const orientation = clampPct(state.values.orientationLossPct) / 100;
  const horizon = clampPct(state.values.horizonLossPct) / 100;
  const nearShading = clampPct(state.values.nearShadingLossPct) / 100;

  const shadingLossPct = clampPct((horizon + nearShading) * 100) / 100;

  const soiling = getSavedLoss("Soiling Loss");
  const iam = getSavedLoss("IAM Losses");
  const thermal = getSavedLoss("Thermal Parameter");
  const mqLm = getSavedLoss("Module Quality - LID - Mismatch");
  const ohmic = getSavedLoss("Ohmic Losses");
  const unavailability = getSavedLoss("Unavailability");

  const lid = mqLm * 0.35;
  const mismatch = mqLm * 0.65;

  const grossIrr = ghi * area;
  const collectorIrr = grossIrr * (1 - orientation) * (1 - shadingLossPct);

  const dcNetFactor =
    (1 - soiling) *
    (1 - iam) *
    (1 - thermal) *
    (1 - mqLm) *
    (1 - ohmic);

  const arrayEnergy = collectorIrr * moduleEff * dcNetFactor;

  const inverterLoss = clampPct(state.values.inverterLossPct) / 100;
  const acLoss = clampPct(state.values.acLossPct) / 100;
  const transformerLoss = clampPct(state.values.transformerLossPct) / 100;

  const afterInverter = arrayEnergy * (1 - inverterLoss);
  const afterAC = afterInverter * (1 - acLoss);
  const gridEnergy = afterAC * (1 - transformerLoss) * (1 - unavailability);

  const specificProduction = installedKwp > 0 ? gridEnergy / installedKwp : 0;
  const referenceYield = installedKwp > 0 ? collectorIrr / installedKwp : 0;
  const pr = referenceYield > 0 ? gridEnergy / referenceYield : 0;

  state.results = {
    "Gross irradiation": grossIrr,
    "Collector-plane irradiation": collectorIrr,
    "Shading losses": grossIrr - collectorIrr,
    "Soiling losses": collectorIrr * soiling,
    "IAM losses": collectorIrr * iam,
    "Thermal losses": collectorIrr * thermal,
    "Module quality losses": collectorIrr * mqLm,
    LID: collectorIrr * lid,
    Mismatch: collectorIrr * mismatch,
    "DC ohmic losses": collectorIrr * ohmic,
    "Inverter losses": arrayEnergy * inverterLoss,
    "AC losses": afterInverter * acLoss,
    "Transformer losses": afterAC * transformerLoss,
    "Unavailability losses": afterAC * (1 - transformerLoss) * unavailability,
    "Grid energy": gridEnergy,
    "Specific production": specificProduction,
    "Performance ratio": pr,
    P50: gridEnergy,
    P90: gridEnergy * 0.95,
    P95: gridEnergy * 0.92,
  };

  saveJson("sim-results", state.results);
  state.reportText = buildReport();
  saveJson("sim-report", state.reportText);
}

function fmt(value) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function buildReport() {
  const lines = [
    `Project: ${state.values.projectName}`,
    `Site: ${state.values.siteName}`,
    "",
    "Simulation Outputs",
  ];

  for (const [name, value] of Object.entries(state.results)) {
    lines.push(`- ${name}: ${fmt(value)}`);
  }

  lines.push("", "Detailed Loss Inputs");
  for (const tab of lossTabs) {
    const v = state.detailedLosses[tab];
    lines.push(`- ${tab}: ${fmt(v.lossPct)}% | ${v.note || "n/a"}`);
  }
  return lines.join("\n");
}

function renderResultsBlock(title, data) {
  const metrics = Object.entries(data)
    .map(([k, v]) => `<div class="metric"><strong>${k}</strong><span>${fmt(v)}</span></div>`)
    .join("");
  return `<article class="card"><h2>${title}</h2><div class="metrics">${metrics}</div></article>`;
}

function renderGenericPage(page) {
  if (page === "Detailed Losses") {
    renderDetailedLosses();
    return;
  }

  if (page === "Run Simulation") {
    contentEl.innerHTML = `
      <article class="card">
        <h2>Run Simulation</h2>
        <p>Run the simulation engine to calculate irradiance, losses, array energy, grid energy, PR, and P50/P90/P95 outputs.</p>
        <div class="inline-actions">
          <button data-action="run">Run Simulation</button>
          <span class="status" id="runStatus"></span>
        </div>
      </article>
      ${renderResultsBlock("Quick Results", state.results)}
    `;

    contentEl.querySelector("[data-action='run']").addEventListener("click", async () => {
      overlayEl.classList.remove("hidden");
      const status = contentEl.querySelector("#runStatus");
      status.textContent = "Running...";
      await new Promise((resolve) => setTimeout(resolve, 1100));
      runSimulation();
      overlayEl.classList.add("hidden");
      status.textContent = "Simulation complete. Results updated.";
      render();
    });
    return;
  }

  if (page === "Results") {
    contentEl.innerHTML = renderResultsBlock("Results", state.results);
    return;
  }

  if (page === "Loss Diagram") {
    const totalLoss = Object.entries(state.results)
      .filter(([k]) => k.includes("loss") || k.includes("Loss") || ["LID", "Mismatch"].includes(k))
      .reduce((sum, [, v]) => sum + Number(v), 0);

    contentEl.innerHTML = renderResultsBlock("Loss Diagram", {
      "Total quantified losses": totalLoss,
      "Grid energy": state.results["Grid energy"],
      "P50": state.results.P50,
      "P90": state.results.P90,
      "P95": state.results.P95,
    });
    return;
  }

  if (page === "Simulation Report") {
    contentEl.innerHTML = `
      <article class="card">
        <h2>Simulation Report</h2>
        <textarea id="reportText">${state.reportText || buildReport()}</textarea>
        <div class="inline-actions">
          <button data-action="save-report">Save Report</button>
          <span id="reportStatus" class="status"></span>
        </div>
      </article>
    `;
    const saveBtn = contentEl.querySelector("[data-action='save-report']");
    saveBtn.addEventListener("click", () => {
      const text = contentEl.querySelector("#reportText").value.trim();
      const status = contentEl.querySelector("#reportStatus");
      if (!text) {
        status.textContent = "Validation failed: report cannot be empty.";
        status.classList.add("error");
        return;
      }
      status.classList.remove("error");
      state.reportText = text;
      saveJson("sim-report", state.reportText);
      status.textContent = "Report saved.";
    });
    return;
  }

  const pageForms = {
    "Project Setup": [
      createInput("projectName", "Project name", state.values.projectName, "text"),
      createInput("siteName", "Site name", state.values.siteName, "text"),
    ],
    "Site & Weather": [
      createInput("annualGHI", "Annual GHI (kWh/m²)", state.values.annualGHI, "number", "1"),
      createInput("area", "Collector area (m²)", state.values.area, "number", "1"),
    ],
    Variants: [createInput("variantCount", "Variant count", state.values.variantCount || 1, "number", "1")],
    Orientation: [
      createInput("orientationLossPct", "Orientation loss (%)", state.values.orientationLossPct, "number", "0.01"),
    ],
    "System / Sub-Arrays": [
      createInput("installedKwp", "Installed power (kWp)", state.values.installedKwp, "number", "1"),
    ],
    "PV Module": [
      createInput("moduleEfficiencyPct", "Module efficiency (%)", state.values.moduleEfficiencyPct, "number", "0.01"),
    ],
    Inverter: [
      createInput("inverterLossPct", "Inverter losses (%)", state.values.inverterLossPct, "number", "0.01"),
    ],
    "Stringing & MPPT": [
      createInput("stringVoltage", "String voltage (V)", state.values.stringVoltage || 1200, "number", "1"),
    ],
    "Bifacial Setup": [
      createInput("bifacialGainPct", "Bifacial gain (%)", state.values.bifacialGainPct || 0, "number", "0.01"),
    ],
    Horizon: [
      createInput("horizonLossPct", "Horizon shading loss (%)", state.values.horizonLossPct, "number", "0.01"),
    ],
    "Near Shadings": [
      createInput("nearShadingLossPct", "Near shading loss (%)", state.values.nearShadingLossPct, "number", "0.01"),
    ],
    "3D Shading Scene": [
      createInput("sceneObjects", "3D scene objects", state.values.sceneObjects || 0, "number", "1"),
    ],
    "Energy Management": [
      createInput("acLossPct", "AC losses (%)", state.values.acLossPct, "number", "0.01"),
      createInput("transformerLossPct", "Transformer losses (%)", state.values.transformerLossPct, "number", "0.01"),
    ],
    "P50 / P90": [
      createInput("p50BankabilityNote", "Bankability note", state.values.p50BankabilityNote || "Base case", "text"),
    ],
  };

  const fields = pageForms[page] || [createInput("genericValue", "Value", state.values.genericValue || 0)];
  contentEl.innerHTML = pageCard(
    page,
    `<div class="form-grid">${fields.join("")}</div><div class="inline-actions"><button data-action="save">Save</button></div>`,
    "genericStatus"
  );

  bindSimpleSave(contentEl, page);
}

function render() {
  renderNav();
  renderGenericPage(state.page);

  navEl.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", () => {
      state.page = el.dataset.page;
      render();
    });
  });
}

render();
