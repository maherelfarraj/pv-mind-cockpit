const pages = [
  "SCADA Overview",
  "Live Monitor",
  "Site Monitor",
  "Inverters",
  "BESS Monitor",
  "Weather Station",
  "Grid Meter",
  "Connectors",
  "Tag Dictionary",
  "Historian Trends",
  "Alarm Workbench",
  "Alarm → Work Orders",
  "Alarm SLA Aging",
  "Anomaly Board",
  "Anomaly RCA",
  "Work Orders",
  "Fleet KPIs",
  "KPI Variance",
  "Fleet Health",
  "Reports",
  "Settings",
];

const thresholds = {
  irradianceLow: 120,
  temperatureHigh: 47,
  windHigh: 20,
  frequencyLow: 49.5,
  frequencyHigh: 50.5,
  voltageLow: 360,
  voltageHigh: 440,
  bessSocLow: 20,
  bessTempHigh: 43,
};

const state = {
  selectedPage: pages[0],
  baselines: {
    expectedEnergyToday: 5200,
    expectedMonthlyEnergy: 154000,
    expectedAnnualEnergy: 1860000,
    expectedPR: 0.82,
    expectedSpecificYield: 4.8,
    expectedAvailability: 99.2,
    expectedLosses: 5.5,
    expectedPowerCurve: [],
    expectedInverterOutput: 385,
    expectedGridInjection: 4700,
    expectedPowerFactor: 0.98,
  },
  telemetry: {
    powerOutput: 0,
    energyToday: 0,
    irradiance: 0,
    temperature: 24,
    windSpeed: 6,
    gridFrequency: 50,
    gridVoltage: 400,
    inverterStatus: "Running",
    bessSoc: 72,
    bessTemperature: 29,
    alarmStates: 0,
    communicationStatus: "Online",
    powerFactor: 0.98,
    gridInjection: 0,
  },
  inverters: Array.from({ length: 12 }).map((_, i) => ({
    name: `INV-${String(i + 1).padStart(2, "0")}`,
    output: 0,
    status: "Running",
  })),
  alarms: [],
  anomalies: [],
  workOrders: [],
  history: [],
  reports: [],
  nextAlarmId: 1,
  nextAnomalyId: 1,
  nextWorkOrderId: 1,
  fleetHealthScore: 100,
};

const nav = document.getElementById("nav");
const pageTitle = document.getElementById("pageTitle");
const clock = document.getElementById("clock");
const pageContent = document.getElementById("pageContent");
const fleetHealth = document.getElementById("fleetHealth");

state.baselines.expectedPowerCurve = Array.from({ length: 24 }).map((_, h) => {
  const daylight = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
  return Math.round(daylight * 5000);
});

function fmt(n, d = 1) {
  return Number.isFinite(n) ? n.toFixed(d) : "--";
}

function stamp(date = new Date()) {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

function upsertAlarm(key, severity, message, value, limit) {
  const active = state.alarms.find((a) => a.key === key && a.active);
  if (value) {
    if (!active) {
      const alarm = {
        id: state.nextAlarmId++,
        key,
        severity,
        message,
        active: true,
        raisedAt: stamp(),
        clearedAt: null,
        metricValue: value,
        threshold: limit,
      };
      state.alarms.unshift(alarm);
      createWorkOrderFromAlarm(alarm);
    } else {
      active.metricValue = value;
    }
  } else if (active) {
    active.active = false;
    active.clearedAt = stamp();
  }
}

function createWorkOrderFromAlarm(alarm) {
  state.workOrders.unshift({
    id: `WO-${String(state.nextWorkOrderId++).padStart(4, "0")}`,
    source: `AL-${alarm.id}`,
    title: `Investigate ${alarm.message}`,
    priority: alarm.severity === "HIGH" ? "P1" : "P2",
    status: "Open",
    createdAt: stamp(),
    slaDue: stamp(new Date(Date.now() + 2 * 60 * 60 * 1000)),
    rcaSuggestion: suggestRca(alarm.message),
    rcaStatus: "Draft",
  });
}

function suggestRca(message) {
  if (message.includes("Temperature")) return "Inspect cooling loop and panel ventilation.";
  if (message.includes("Irradiance")) return "Verify weather sensor cleanliness and calibration.";
  if (message.includes("frequency")) return "Coordinate with grid operator and check relay settings.";
  if (message.includes("Communication")) return "Check gateway link quality and connector heartbeat.";
  return "Perform site inspection and validate sensor chain.";
}

function simulateTelemetry() {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  const daylight = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
  const expectedPower = daylight * 5000;
  const weatherNoise = 0.86 + Math.random() * 0.28;
  const cloudHit = Math.random() < 0.06 ? 0.7 : 1;
  const actualPower = Math.max(0, expectedPower * weatherNoise * cloudHit);

  state.telemetry.powerOutput = actualPower;
  state.telemetry.energyToday += actualPower / 3600;
  state.telemetry.irradiance = Math.max(0, daylight * 980 + (Math.random() * 80 - 40));
  state.telemetry.temperature = 22 + daylight * 21 + (Math.random() * 4 - 2);
  state.telemetry.windSpeed = Math.max(0, 4 + Math.random() * 11 + (1 - daylight) * 2);
  state.telemetry.gridFrequency = 50 + (Math.random() * 0.6 - 0.3);
  state.telemetry.gridVoltage = 400 + (Math.random() * 34 - 17);
  state.telemetry.powerFactor = 0.95 + Math.random() * 0.04;
  state.telemetry.gridInjection = Math.max(0, actualPower * (0.9 + Math.random() * 0.06));
  state.telemetry.communicationStatus = Math.random() < 0.99 ? "Online" : "Intermittent";

  const invBase = actualPower / state.inverters.length;
  state.inverters = state.inverters.map((inv) => {
    const trip = Math.random() < 0.005;
    const status = trip ? "Fault" : "Running";
    const output = status === "Fault" ? 0 : Math.max(0, invBase * (0.85 + Math.random() * 0.25));
    return { ...inv, status, output };
  });
  state.telemetry.inverterStatus = state.inverters.some((i) => i.status === "Fault") ? "Degraded" : "Running";

  const netForBess = state.telemetry.gridInjection - state.baselines.expectedGridInjection;
  const socDrift = netForBess > 0 ? 0.03 : -0.04;
  state.telemetry.bessSoc = Math.min(100, Math.max(5, state.telemetry.bessSoc + socDrift));
  state.telemetry.bessTemperature = 27 + (100 - state.telemetry.bessSoc) * 0.08 + Math.random() * 3;

  applyRules();
  calculateFleetHealth();

  state.history.unshift({
    ts: stamp(now),
    power: state.telemetry.powerOutput,
    energy: state.telemetry.energyToday,
    irr: state.telemetry.irradiance,
    temp: state.telemetry.temperature,
  });
  state.history = state.history.slice(0, 120);
}

function applyRules() {
  upsertAlarm(
    "irradiance_low",
    "MEDIUM",
    "Irradiance below threshold",
    state.telemetry.irradiance < thresholds.irradianceLow ? state.telemetry.irradiance : null,
    thresholds.irradianceLow
  );
  upsertAlarm(
    "temp_high",
    "HIGH",
    "Temperature above threshold",
    state.telemetry.temperature > thresholds.temperatureHigh ? state.telemetry.temperature : null,
    thresholds.temperatureHigh
  );
  upsertAlarm(
    "wind_high",
    "MEDIUM",
    "Wind speed above threshold",
    state.telemetry.windSpeed > thresholds.windHigh ? state.telemetry.windSpeed : null,
    thresholds.windHigh
  );
  upsertAlarm(
    "grid_freq",
    "HIGH",
    "Grid frequency out of range",
    state.telemetry.gridFrequency < thresholds.frequencyLow || state.telemetry.gridFrequency > thresholds.frequencyHigh
      ? state.telemetry.gridFrequency
      : null,
    `${thresholds.frequencyLow}-${thresholds.frequencyHigh}`
  );
  upsertAlarm(
    "grid_voltage",
    "MEDIUM",
    "Grid voltage out of range",
    state.telemetry.gridVoltage < thresholds.voltageLow || state.telemetry.gridVoltage > thresholds.voltageHigh
      ? state.telemetry.gridVoltage
      : null,
    `${thresholds.voltageLow}-${thresholds.voltageHigh}`
  );
  upsertAlarm(
    "bess_soc_low",
    "HIGH",
    "BESS SoC below threshold",
    state.telemetry.bessSoc < thresholds.bessSocLow ? state.telemetry.bessSoc : null,
    thresholds.bessSocLow
  );
  upsertAlarm(
    "bess_temp_high",
    "HIGH",
    "BESS temperature above threshold",
    state.telemetry.bessTemperature > thresholds.bessTempHigh ? state.telemetry.bessTemperature : null,
    thresholds.bessTempHigh
  );
  upsertAlarm(
    "comm_status",
    "HIGH",
    "Communication status degraded",
    state.telemetry.communicationStatus !== "Online" ? 1 : null,
    "Online"
  );

  const now = new Date();
  const progress = Math.min(1, Math.max(0, (now.getHours() - 6 + now.getMinutes() / 60) / 12));
  const expectedByNow = state.baselines.expectedEnergyToday * progress;
  const energyGap = expectedByNow - state.telemetry.energyToday;
  if (energyGap > 200) {
    const existing = state.anomalies.find((a) => a.status === "Open" && a.type === "Energy Deficit");
    if (!existing) {
      const anomaly = {
        id: `AN-${String(state.nextAnomalyId++).padStart(4, "0")}`,
        type: "Energy Deficit",
        severity: energyGap > 600 ? "HIGH" : "MEDIUM",
        summary: "Actual energy is below expected baseline",
        expected: expectedByNow,
        actual: state.telemetry.energyToday,
        status: "Open",
        createdAt: stamp(),
        rcaSuggestion: "Draft: Validate inverter clipping, soiling, and curtailment logs.",
        rcaStatus: "Draft",
      };
      state.anomalies.unshift(anomaly);
    }
  } else {
    state.anomalies
      .filter((a) => a.status === "Open" && a.type === "Energy Deficit")
      .forEach((a) => {
        a.status = "Resolved";
        a.resolvedAt = stamp();
      });
  }

  state.telemetry.alarmStates = state.alarms.filter((a) => a.active).length;
}

function calculateFleetHealth() {
  const running = state.inverters.filter((i) => i.status === "Running").length;
  const availability = (running / state.inverters.length) * 100;
  const expectedPowerNow = state.baselines.expectedPowerCurve[new Date().getHours()] || 0;
  const performance = expectedPowerNow > 0 ? (state.telemetry.powerOutput / expectedPowerNow) * 100 : 100;
  const activeAlarms = state.alarms.filter((a) => a.active).length;
  const openAnomalies = state.anomalies.filter((a) => a.status === "Open").length;
  const commPenalty = state.telemetry.communicationStatus === "Online" ? 0 : 8;
  const penalties = activeAlarms * 4 + openAnomalies * 6 + commPenalty;

  state.fleetHealthScore = Math.max(
    0,
    Math.min(100, availability * 0.45 + performance * 0.45 + (100 - penalties) * 0.1)
  );
}

function statusClass(v) {
  if (v === "Fault" || v === "HIGH" || v === "Degraded") return "bad";
  if (v === "MEDIUM" || v === "Intermittent" || v === "Open") return "warn";
  return "ok";
}

function makeCards(items) {
  return `<div class="cards">${items
    .map(
      (x) => `<div class="card">
      <h3>${x.label}</h3>
      <div class="value">${x.value}</div>
      ${x.sub ? `<div class="sub">${x.sub}</div>` : ""}
    </div>`
    )
    .join("")}</div>`;
}

function makeTable(headers, rows) {
  return `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${
    rows.length
      ? rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${headers.length}" class="muted">No records</td></tr>`
  }</tbody></table>`;
}

function renderPage() {
  pageTitle.textContent = state.selectedPage;
  clock.textContent = `Last update: ${stamp()}`;
  fleetHealth.textContent = `Fleet Health: ${fmt(state.fleetHealthScore, 0)}%`;

  const t = state.telemetry;
  const activeAlarms = state.alarms.filter((a) => a.active);
  const openAnomalies = state.anomalies.filter((a) => a.status === "Open");
  const openWos = state.workOrders.filter((w) => w.status === "Open");
  const kpiVariance = [
    ["Energy Today (kWh)", fmt(t.energyToday), fmt(state.baselines.expectedEnergyToday), `${fmt((t.energyToday / state.baselines.expectedEnergyToday) * 100)}%`],
    ["PR", fmt(t.powerOutput / Math.max(1, t.irradiance * 5), 2), fmt(state.baselines.expectedPR, 2), `${fmt(((t.powerOutput / Math.max(1, t.irradiance * 5)) / state.baselines.expectedPR) * 100)}%`],
    ["Specific Yield", fmt(t.energyToday / 1080, 2), fmt(state.baselines.expectedSpecificYield, 2), `${fmt(((t.energyToday / 1080) / state.baselines.expectedSpecificYield) * 100)}%`],
    ["Availability", fmt((state.inverters.filter((i) => i.status === "Running").length / state.inverters.length) * 100, 1), fmt(state.baselines.expectedAvailability, 1), `${fmt((((state.inverters.filter((i) => i.status === "Running").length / state.inverters.length) * 100) / state.baselines.expectedAvailability) * 100)}%`],
  ];

  const pagesRender = {
    "SCADA Overview": () =>
      `${makeCards([
        { label: "Power Output", value: `${fmt(t.powerOutput, 0)} kW`, sub: `Expected ${fmt(state.baselines.expectedGridInjection, 0)} kW` },
        { label: "Energy Today", value: `${fmt(t.energyToday, 1)} kWh`, sub: `Expected ${state.baselines.expectedEnergyToday} kWh` },
        { label: "Active Alarms", value: `${activeAlarms.length}`, sub: "Threshold-driven alerts" },
        { label: "Open Anomalies", value: `${openAnomalies.length}`, sub: "Actual vs expected energy" },
        { label: "Open Work Orders", value: `${openWos.length}`, sub: "Created from alarms" },
      ])}
      <div class="split">
        ${makeTable(
          ["Baseline", "Value"],
          Object.entries(state.baselines).map(([k, v]) => [k, Array.isArray(v) ? `24-point curve` : `${v}`])
        )}
        ${makeTable(
          ["Metric", "Live"],
          [
            ["Irradiance", `${fmt(t.irradiance, 0)} W/m²`],
            ["Temperature", `${fmt(t.temperature, 1)} °C`],
            ["Wind Speed", `${fmt(t.windSpeed, 1)} m/s`],
            ["Grid Frequency", `${fmt(t.gridFrequency, 2)} Hz`],
            ["Grid Voltage", `${fmt(t.gridVoltage, 1)} V`],
          ]
        )}
      </div>`,
    "Live Monitor": () =>
      `${makeCards([
        { label: "Power", value: `${fmt(t.powerOutput, 0)} kW` },
        { label: "Grid Injection", value: `${fmt(t.gridInjection, 0)} kW` },
        { label: "Power Factor", value: fmt(t.powerFactor, 3) },
        { label: "Communication", value: `<span class="status ${statusClass(t.communicationStatus)}">${t.communicationStatus}</span>` },
      ])}
      ${makeTable(
        ["Timestamp", "Power kW", "Energy kWh", "Irradiance", "Temp °C"],
        state.history.slice(0, 20).map((h) => [h.ts, fmt(h.power, 0), fmt(h.energy, 1), fmt(h.irr, 0), fmt(h.temp, 1)])
      )}`,
    "Site Monitor": () =>
      `${makeCards([
        { label: "Site Availability", value: `${fmt((state.inverters.filter((i) => i.status === "Running").length / state.inverters.length) * 100, 1)}%` },
        { label: "Expected Losses", value: `${fmt(state.baselines.expectedLosses, 1)}%` },
        { label: "Expected Monthly Energy", value: `${state.baselines.expectedMonthlyEnergy} kWh` },
      ])}`,
    Inverters: () =>
      makeTable(
        ["Inverter", "Output (kW)", "Status", "Expected (kW)"],
        state.inverters.map((i) => [
          i.name,
          fmt(i.output, 1),
          `<span class="status ${statusClass(i.status)}">${i.status}</span>`,
          fmt(state.baselines.expectedInverterOutput, 0),
        ])
      ),
    "BESS Monitor": () =>
      `${makeCards([
        { label: "State of Charge", value: `${fmt(t.bessSoc, 1)}%` },
        { label: "BESS Temperature", value: `${fmt(t.bessTemperature, 1)} °C` },
        { label: "Status", value: `<span class="status ${statusClass(t.bessSoc < thresholds.bessSocLow ? "HIGH" : "OK")}">${t.bessSoc < thresholds.bessSocLow ? "Discharging Risk" : "Normal"}</span>` },
      ])}`,
    "Weather Station": () =>
      makeCards([
        { label: "Irradiance", value: `${fmt(t.irradiance, 0)} W/m²` },
        { label: "Ambient Temperature", value: `${fmt(t.temperature, 1)} °C` },
        { label: "Wind Speed", value: `${fmt(t.windSpeed, 1)} m/s` },
      ]),
    "Grid Meter": () =>
      makeCards([
        { label: "Frequency", value: `${fmt(t.gridFrequency, 2)} Hz` },
        { label: "Voltage", value: `${fmt(t.gridVoltage, 1)} V` },
        { label: "Power Factor", value: fmt(t.powerFactor, 3), sub: `Expected ${state.baselines.expectedPowerFactor}` },
      ]),
    Connectors: () =>
      makeTable(
        ["Connector", "Protocol", "Status", "Last Heartbeat"],
        [
          ["SCADA Core", "MQTT", `<span class="status ${statusClass(t.communicationStatus)}">${t.communicationStatus}</span>`, stamp()],
          ["Inverter Gateway", "Modbus TCP", `<span class="status ${statusClass(t.inverterStatus)}">${t.inverterStatus}</span>`, stamp()],
          ["BESS EMS", "IEC-61850", `<span class="status ok">Online</span>`, stamp()],
        ]
      ),
    "Tag Dictionary": () =>
      makeTable(
        ["Tag", "Description", "Unit"],
        [
          ["plant.power_output", "Plant active power output", "kW"],
          ["plant.energy_today", "Daily accumulated energy", "kWh"],
          ["met.irradiance", "Plane of array irradiance", "W/m²"],
          ["grid.frequency", "Grid frequency", "Hz"],
          ["bess.soc", "Battery state of charge", "%"],
          ["alarm.active_count", "Number of active alarms", "count"],
        ]
      ),
    "Historian Trends": () =>
      makeTable(
        ["Timestamp", "Power", "Irradiance", "Temp", "Alarms"],
        state.history.slice(0, 40).map((h) => [h.ts, fmt(h.power, 0), fmt(h.irr, 0), fmt(h.temp, 1), `${state.telemetry.alarmStates}`])
      ),
    "Alarm Workbench": () =>
      makeTable(
        ["Alarm ID", "Message", "Severity", "State", "Raised", "Cleared"],
        state.alarms.slice(0, 50).map((a) => [
          `AL-${a.id}`,
          a.message,
          `<span class="status ${statusClass(a.severity)}">${a.severity}</span>`,
          a.active ? `<span class="status bad">Active</span>` : `<span class="status ok">Cleared</span>`,
          a.raisedAt,
          a.clearedAt || "-",
        ])
      ),
    "Alarm → Work Orders": () =>
      makeTable(
        ["Work Order", "Source Alarm", "Priority", "Status", "RCA"],
        state.workOrders.slice(0, 50).map((w) => [
          w.id,
          w.source,
          `<span class="status ${statusClass(w.priority === "P1" ? "HIGH" : "MEDIUM")}">${w.priority}</span>`,
          `<span class="status ${statusClass(w.status)}">${w.status}</span>`,
          `${w.rcaStatus}: ${w.rcaSuggestion}`,
        ])
      ),
    "Alarm SLA Aging": () =>
      makeTable(
        ["Work Order", "Created At", "SLA Due", "Aging (min)", "SLA State"],
        openWos.map((w) => {
          const ageMin = Math.floor((Date.now() - new Date(w.createdAt).getTime()) / 60000);
          const overdue = Date.now() > new Date(w.slaDue).getTime();
          return [
            w.id,
            w.createdAt,
            w.slaDue,
            `${ageMin}`,
            overdue ? `<span class="status bad">Breached</span>` : `<span class="status ok">Within SLA</span>`,
          ];
        })
      ),
    "Anomaly Board": () =>
      makeTable(
        ["Anomaly", "Type", "Severity", "Expected (kWh)", "Actual (kWh)", "Status"],
        state.anomalies.slice(0, 50).map((a) => [
          a.id,
          a.type,
          `<span class="status ${statusClass(a.severity)}">${a.severity}</span>`,
          fmt(a.expected, 1),
          fmt(a.actual, 1),
          `<span class="status ${statusClass(a.status)}">${a.status}</span>`,
        ])
      ),
    "Anomaly RCA": () =>
      makeTable(
        ["Anomaly", "Summary", "RCA Suggestion", "RCA Status"],
        state.anomalies.slice(0, 50).map((a) => [a.id, a.summary, a.rcaSuggestion, `<span class="status warn">${a.rcaStatus}</span>`])
      ),
    "Work Orders": () =>
      makeTable(
        ["ID", "Title", "Priority", "Status", "Created", "RCA Status"],
        state.workOrders.slice(0, 50).map((w) => [
          w.id,
          w.title,
          `<span class="status ${statusClass(w.priority === "P1" ? "HIGH" : "MEDIUM")}">${w.priority}</span>`,
          `<span class="status ${statusClass(w.status)}">${w.status}</span>`,
          w.createdAt,
          `<span class="status warn">${w.rcaStatus}</span>`,
        ])
      ),
    "Fleet KPIs": () =>
      makeCards([
        { label: "Expected PR", value: fmt(state.baselines.expectedPR, 2) },
        { label: "Expected Specific Yield", value: `${fmt(state.baselines.expectedSpecificYield, 2)} kWh/kWp` },
        { label: "Expected Availability", value: `${fmt(state.baselines.expectedAvailability, 1)}%` },
        { label: "Expected Annual Energy", value: `${state.baselines.expectedAnnualEnergy} kWh` },
      ]),
    "KPI Variance": () => makeTable(["KPI", "Actual", "Expected", "Attainment"], kpiVariance),
    "Fleet Health": () =>
      makeCards([
        { label: "Fleet Health Score", value: `${fmt(state.fleetHealthScore, 0)} / 100`, sub: "Calculated from availability, performance, alarms, anomalies" },
      ]),
    Reports: () => {
      const report = `Fleet health ${fmt(state.fleetHealthScore, 0)}%, active alarms ${activeAlarms.length}, open anomalies ${openAnomalies.length}, open work orders ${openWos.length}.`;
      if (!state.reports.length || state.reports[0].summary !== report) {
        state.reports.unshift({ at: stamp(), summary: report });
        state.reports = state.reports.slice(0, 20);
      }
      return makeTable(["Generated At", "Summary"], state.reports.map((r) => [r.at, r.summary]));
    },
    Settings: () =>
      makeTable(
        ["Threshold", "Value"],
        Object.entries(thresholds).map(([k, v]) => [k, `${v}`])
      ),
  };

  pageContent.innerHTML = pagesRender[state.selectedPage]();
}

function buildNav() {
  nav.innerHTML = pages
    .map(
      (p) =>
        `<button class="nav-btn ${p === state.selectedPage ? "active" : ""}" data-page="${p}">${p}</button>`
    )
    .join("");
  [...nav.querySelectorAll(".nav-btn")].forEach((btn) =>
    btn.addEventListener("click", () => {
      state.selectedPage = btn.dataset.page;
      buildNav();
      renderPage();
    })
  );
}

buildNav();
simulateTelemetry();
renderPage();
setInterval(() => {
  simulateTelemetry();
  renderPage();
}, 1000);
