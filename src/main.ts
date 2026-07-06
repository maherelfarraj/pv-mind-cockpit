type ScadaStatus = "online" | "degraded" | "offline";

interface CockpitState {
  projectName: string;
  projectVersion: string;
  simulationNotes: string;
  scadaStatus: ScadaStatus;
  scadaLastSync: string;
  updatedAt: string;
}

const CACHE_KEY = "pv-mind-cockpit.desktop-state";

const PROJECT_NAME_ID = "project-name";
const PROJECT_VERSION_ID = "project-version";
const SIMULATION_NOTES_ID = "simulation-notes";
const SCADA_STATUS_ID = "scada-status";
const SCADA_LAST_SYNC_ID = "scada-last-sync";
const PROJECT_IO_STATUS_ID = "project-io-status";
const REPORT_PREVIEW_ID = "report-preview";
const CACHE_STATUS_ID = "cache-status";
const PROJECT_IMPORT_INPUT_ID = "project-import-input";

function getInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Expected input element: ${id}`);
  }
  return element;
}

function getTextArea(id: string): HTMLTextAreaElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error(`Expected textarea element: ${id}`);
  }
  return element;
}

function getSelect(id: string): HTMLSelectElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLSelectElement)) {
    throw new Error(`Expected select element: ${id}`);
  }
  return element;
}

function getButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Expected button element: ${id}`);
  }
  return element;
}

function getParagraph(id: string): HTMLParagraphElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLParagraphElement)) {
    throw new Error(`Expected paragraph element: ${id}`);
  }
  return element;
}

function collectState(): CockpitState {
  const now = new Date().toISOString();
  const scadaStatus = getSelect(SCADA_STATUS_ID).value as ScadaStatus;

  return {
    projectName: getInput(PROJECT_NAME_ID).value.trim(),
    projectVersion: getInput(PROJECT_VERSION_ID).value.trim(),
    simulationNotes: getTextArea(SIMULATION_NOTES_ID).value,
    scadaStatus,
    scadaLastSync: getParagraph(SCADA_LAST_SYNC_ID).dataset.syncTime ?? "",
    updatedAt: now,
  };
}

function applyState(state: CockpitState): void {
  getInput(PROJECT_NAME_ID).value = state.projectName;
  getInput(PROJECT_VERSION_ID).value = state.projectVersion;
  getTextArea(SIMULATION_NOTES_ID).value = state.simulationNotes;
  getSelect(SCADA_STATUS_ID).value = state.scadaStatus;

  const scadaLastSync = getParagraph(SCADA_LAST_SYNC_ID);
  const lastSyncText = state.scadaLastSync ? new Date(state.scadaLastSync).toLocaleString() : "Not synced";
  scadaLastSync.dataset.syncTime = state.scadaLastSync;
  scadaLastSync.textContent = `Last sync: ${lastSyncText}`;

  renderReport();
}

function renderReport(): void {
  const state = collectState();
  const preview = getTextArea(REPORT_PREVIEW_ID);
  const lines = [
    `Project: ${state.projectName || "Untitled Project"}`,
    `Version: ${state.projectVersion || "Draft"}`,
    `SCADA: ${state.scadaStatus.toUpperCase()}`,
    `Telemetry Sync: ${state.scadaLastSync ? new Date(state.scadaLastSync).toLocaleString() : "Not synced"}`,
    "",
    "Simulation Notes:",
    state.simulationNotes || "No simulation notes captured yet.",
    "",
    `Generated: ${new Date(state.updatedAt).toLocaleString()}`,
  ];

  preview.value = lines.join("\n");
}

function setCacheStatus(text: string): void {
  getParagraph(CACHE_STATUS_ID).textContent = text;
}

function saveToCache(): void {
  const state = collectState();
  localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  setCacheStatus(`Cache saved at ${new Date(state.updatedAt).toLocaleString()}`);
  renderReport();
}

function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  setCacheStatus("Cache cleared.");
}

function loadCache(): void {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) {
    setCacheStatus("Cache empty.");
    renderReport();
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CockpitState>;
    if (typeof parsed.projectName !== "string" || typeof parsed.projectVersion !== "string") {
      throw new Error("Invalid cache shape");
    }

    const state: CockpitState = {
      projectName: parsed.projectName,
      projectVersion: parsed.projectVersion,
      simulationNotes: typeof parsed.simulationNotes === "string" ? parsed.simulationNotes : "",
      scadaStatus: parsed.scadaStatus === "degraded" || parsed.scadaStatus === "offline" ? parsed.scadaStatus : "online",
      scadaLastSync: typeof parsed.scadaLastSync === "string" ? parsed.scadaLastSync : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };

    applyState(state);
    setCacheStatus(`Loaded cache from ${new Date(state.updatedAt).toLocaleString()}`);
  } catch {
    setCacheStatus("Cache is unreadable. Save a new snapshot.");
    renderReport();
  }
}

function exportProject(): void {
  const state = collectState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  const safeName = (state.projectName || "pv-project").replace(/\s+/g, "-").toLowerCase();
  anchor.href = url;
  anchor.download = `${safeName}-desktop-export.json`;
  anchor.click();

  URL.revokeObjectURL(url);
  getParagraph(PROJECT_IO_STATUS_ID).textContent = `Exported project at ${new Date().toLocaleString()}`;
}

function importProject(file: File): void {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = typeof reader.result === "string" ? JSON.parse(reader.result) : null;
      if (!payload || typeof payload !== "object") {
        throw new Error("invalid import");
      }

      const parsed = payload as Partial<CockpitState>;
      const state: CockpitState = {
        projectName: typeof parsed.projectName === "string" ? parsed.projectName : "",
        projectVersion: typeof parsed.projectVersion === "string" ? parsed.projectVersion : "",
        simulationNotes: typeof parsed.simulationNotes === "string" ? parsed.simulationNotes : "",
        scadaStatus: parsed.scadaStatus === "degraded" || parsed.scadaStatus === "offline" ? parsed.scadaStatus : "online",
        scadaLastSync: typeof parsed.scadaLastSync === "string" ? parsed.scadaLastSync : "",
        updatedAt: new Date().toISOString(),
      };

      applyState(state);
      getParagraph(PROJECT_IO_STATUS_ID).textContent = `Imported ${file.name}`;
      saveToCache();
    } catch {
      getParagraph(PROJECT_IO_STATUS_ID).textContent = `Failed to import ${file.name}`;
    }
  });

  reader.readAsText(file);
}

function setupShortcuts(): void {
  document.addEventListener("keydown", (event) => {
    const isModifier = event.metaKey || event.ctrlKey;
    if (!isModifier) {
      return;
    }

    const target = event.target;
    const isTypingTarget = target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

    switch (event.key.toLowerCase()) {
      case "1":
        event.preventDefault();
        document.getElementById("dashboard-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "2":
        event.preventDefault();
        document.getElementById("simulation-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "3":
        event.preventDefault();
        document.getElementById("scada-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "i":
        event.preventDefault();
        getInput(PROJECT_IMPORT_INPUT_ID).click();
        break;
      case "e":
        event.preventDefault();
        exportProject();
        break;
      case "s":
        if (isTypingTarget) {
          event.preventDefault();
        }
        event.preventDefault();
        saveToCache();
        break;
      default:
        break;
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const importButton = getButton("project-import");
  const exportButton = getButton("project-export");
  const importInput = getInput(PROJECT_IMPORT_INPUT_ID);
  const saveCacheButton = getButton("save-cache");
  const clearCacheButton = getButton("clear-cache");
  const scadaSyncButton = getButton("scada-sync");

  importButton.addEventListener("click", () => importInput.click());
  exportButton.addEventListener("click", exportProject);
  saveCacheButton.addEventListener("click", saveToCache);
  clearCacheButton.addEventListener("click", clearCache);

  scadaSyncButton.addEventListener("click", () => {
    const now = new Date().toISOString();
    const scadaLastSync = getParagraph(SCADA_LAST_SYNC_ID);
    scadaLastSync.dataset.syncTime = now;
    scadaLastSync.textContent = `Last sync: ${new Date(now).toLocaleString()}`;
    renderReport();
  });

  importInput.addEventListener("change", () => {
    const [file] = Array.from(importInput.files ?? []);
    if (file) {
      importProject(file);
    }
    importInput.value = "";
  });

  [
    getInput(PROJECT_NAME_ID),
    getInput(PROJECT_VERSION_ID),
    getTextArea(SIMULATION_NOTES_ID),
    getSelect(SCADA_STATUS_ID),
  ].forEach((element) => {
    element.addEventListener("input", renderReport);
    element.addEventListener("change", renderReport);
  });

  setupShortcuts();
  loadCache();
});
