const form = document.getElementById("sld-form");
const diagram = document.getElementById("diagram");
const summary = document.getElementById("summary");

const fields = [
  { id: "pvDcCapacity", label: "PV DC Capacity", fallback: "Not set" },
  { id: "acCapacity", label: "AC Capacity", fallback: "Not set" },
  { id: "inverterCount", label: "Number of Inverters", fallback: "Not set" },
  { id: "transformerVoltage", label: "Transformer Voltage", fallback: "Not set" },
  { id: "bessCapacity", label: "BESS MW / MWh", fallback: "N/A (PV-only)" },
  { id: "exportLimit", label: "Export Limit", fallback: "Not set" },
  { id: "powerFactor", label: "Power Factor", fallback: "Not set" },
  { id: "gridEnergy", label: "Grid Energy", fallback: "Not set" },
];

const createNode = (text, extraClass = "") =>
  `<span class="node ${extraClass}">${text}</span>`;

const updateDiagram = () => {
  const formData = new FormData(form);
  const configuration = formData.get("configuration");

  if (configuration === "pv-bess") {
    diagram.innerHTML = `
      <div class="line">
        ${createNode("PV Array")}
        <span class="arrow">→</span>
        ${createNode("Inverter")}
        <span class="arrow">→</span>
        ${createNode("AC Busbar", "busbar")}
        <span class="arrow">→</span>
        ${createNode("Transformer")}
        <span class="arrow">→</span>
        ${createNode("Grid")}
      </div>
      <div class="branch">
        ${createNode("BESS")}
        <span class="arrow">→</span>
        ${createNode("PCS")}
        <span class="arrow">→</span>
        ${createNode("AC Busbar", "busbar")}
      </div>
    `;
  } else {
    diagram.innerHTML = `
      <div class="line">
        ${createNode("PV Array")}
        <span class="arrow">→</span>
        ${createNode("Inverter")}
        <span class="arrow">→</span>
        ${createNode("MV Transformer")}
        <span class="arrow">→</span>
        ${createNode("HV Transformer")}
        <span class="arrow">→</span>
        ${createNode("Grid")}
      </div>
    `;
  }

  summary.innerHTML = fields
    .map(({ id, label, fallback }) => {
      if (id === "bessCapacity" && configuration === "pv-only") {
        return `<div><dt>${label}</dt><dd>${fallback}</dd></div>`;
      }

      const value = `${formData.get(id) || ""}`.trim();
      return `<div><dt>${label}</dt><dd>${value || fallback}</dd></div>`;
    })
    .join("");
};

form.addEventListener("input", updateDiagram);
form.addEventListener("change", updateDiagram);
updateDiagram();
