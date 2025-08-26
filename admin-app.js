// admin-app.js (updated)

// Google Sheets CSV endpoint (Publish to web)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?gid=156265265&single=true&output=csv";

// Elements
const statusEl = document.getElementById("status") || document.getElementById("admin-status");
const containerEl = document.getElementById("csv-container") || document.getElementById("admin-table");
const searchEl = document.getElementById("search");
const refreshBtn = document.getElementById("refresh");
const openCsvBtn = document.getElementById("open-csv");

// Simple auth gate via token param
(function gate() {
  const token = new URL(location.href).searchParams.get("token");
  if (token !== "curbease-ok-2425") {
    if (statusEl) statusEl.textContent = "Access denied.";
    throw new Error("Bad token");
  }
})();

// Helpers
function setStatus(msg) {
  if (statusEl) {
    statusEl.textContent = msg || "";
    statusEl.style.display = msg ? "inline-block" : "none";
  }
}

function csvToRows(text) {
  // Robust CSV split that respects quotes
  const rows = [];
  let cur = [], val = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i+1];
    if (c === '"' && n === '"') { val += '"'; i++; continue; }
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { cur.push(val); val = ""; continue; }
    if ((c === '\n' || c === '\r') && !inQ) {
      if (val !== "" || cur.length) { cur.push(val); rows.push(cur); cur = []; val = ""; }
      while (text[i+1] === '\r' || text[i+1] === '\n') i++;
      continue;
    }
    val += c;
  }
  if (val !== "" || cur.length) { cur.push(val); rows.push(cur); }
  return rows;
}

function renderTable(rows) {
  if (!containerEl) return;
  if (!rows.length) { containerEl.innerHTML = "<p>No rows.</p>"; return; }

  const [headers, ...data] = rows;

  const table = document.createElement("table");
  table.className = "min-w-full text-sm text-slate-200 border border-slate-700 rounded-lg overflow-hidden";
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr>" + headers.map(h => `<th class='px-3 py-2 bg-slate-800 border-b border-slate-700 text-left font-semibold'>${h}</th>`).join("") + "</tr>";
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = r.map(c => `<td class='px-3 py-2 border-b border-slate-800'>${c}</td>`).join("");
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  containerEl.innerHTML = "";
  containerEl.appendChild(table);
}

async function loadCSV() {
  setStatus("Loading CSV...");
  const res = await fetch(CSV_URL, { cache: "no-store" });
  if (!res.ok) {
    setStatus(`CSV fetch failed: ${res.status}`);
    throw new Error(`CSV fetch failed: ${res.status}`);
  }
  const text = await res.text();
  const rows = csvToRows(text);
  renderTable(rows);
  setStatus("");
  return rows;
}

let cachedRows = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    cachedRows = await loadCSV();
  } catch (e) {
    console.error(e);
  }

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      const q = searchEl.value.trim().toLowerCase();
      if (!q) return renderTable(cachedRows || []);
      const [headers, ...rest] = cachedRows || [];
      const filtered = rest.filter(r => r.join(" ").toLowerCase().includes(q));
      renderTable([headers, ...filtered]);
    });
  }

  if (refreshBtn) refreshBtn.addEventListener("click", async () => {
    try {
      cachedRows = await loadCSV();
      if (searchEl) searchEl.value = "";
    } catch (e) { console.error(e); }
  });

  if (openCsvBtn) openCsvBtn.addEventListener("click", () => {
    window.open(CSV_URL, "_blank", "noopener");
  });
});
