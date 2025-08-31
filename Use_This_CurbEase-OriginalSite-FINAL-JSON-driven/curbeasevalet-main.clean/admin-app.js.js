// admin-app.js (CurbEase Admin)

// Published Google Sheets CSV URL (exact)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv";

// Grab UI elements (works with old + new HTML)
const statusEl = document.getElementById("status") || document.getElementById("admin-status");
const containerEl = document.getElementById("csv-container") || (() => {
  const div = document.createElement("div");
  div.id = "csv-container";
  document.body.appendChild(div);
  return div;
})();

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
  else console.log("[Admin]", msg);
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(",").map(s => s.trim());
  return lines.slice(1).map(row => {
    const cols = row.split(","); // simple CSV parse; fine for your sheet (no embedded commas)
    const obj = {};
    header.forEach((h, i) => obj[h] = (cols[i] || "").trim());
    return obj;
  });
}

function renderTable(rows) {
  containerEl.innerHTML = "";
  if (!rows.length) {
    containerEl.textContent = "No rows found.";
    return;
  }
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  Object.keys(rows[0]).forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    th.style.textAlign = "left";
    th.style.padding = "8px";
    th.style.borderBottom = "1px solid #333";
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(r => {
    const tr = document.createElement("tr");
    Object.values(r).forEach(v => {
      const td = document.createElement("td");
      td.textContent = v;
      td.style.padding = "8px";
      td.style.borderBottom = "1px solid #222";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  containerEl.appendChild(table);
}

async function loadCSV() {
  try {
    setStatus("Loading CSV…");
    const resp = await fetch(CSV_URL, { cache: "no-store" });
    if (!resp.ok) throw new Error("CSV fetch failed: " + resp.status);
    const txt = await resp.text();
    const data = parseCSV(txt);
    renderTable(data);
    setStatus("Loaded.");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Failed to load CSV.");
  }
}

// Allow manual refresh (works with old button id="refresh-btn")
const refreshBtn = document.getElementById("refresh-btn");
if (refreshBtn) refreshBtn.addEventListener("click", loadCSV);

loadCSV();
