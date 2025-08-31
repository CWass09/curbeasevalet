/* admin-app.js — robust CSV fetch with fallbacks */
(() => {
  // ==== CONFIG ====
  const SPREADSHEET_ID = "1DBFts43__8kvOqYrmvp6WKi-XEm8ty-k5skp3HlO_Pw";
  const GID = "156265265";
  const SHEET_NAME = "Subscriptions";
  const CSV_CANDIDATES = [
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`,
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`,
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?gid=156265265&single=true&output=csv"
  ];
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 700;

  // ==== DOM ====
  const statusBadge = document.getElementById("statusBadge");
  const statusDot   = document.getElementById("statusDot");
  const statusText  = document.getElementById("statusText");
  const refreshBtn  = document.getElementById("refreshBtn");
  const searchInput = document.getElementById("search");
  const tbody       = document.getElementById("subsTbody");

  let rows = [];

  const setStatus = (badge, dot, text) => {
    statusBadge.textContent = badge;
    statusDot.className = "dot " + dot;
    statusText.textContent = text;
  };

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  async function attemptFetch(url) {
    const u = new URL(url);
    u.searchParams.set("ts", Date.now().toString()); // cache-bust
    const res = await fetch(u.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.startsWith("<!DOCTYPE html") || /Sorry, unable to open file/i.test(text)) {
      throw new Error("HTML error page (not a CSV)");
    }
    return text;
  }

  async function fetchCSVWithFallbacks() {
    let lastErr = null;
    for (const base of CSV_CANDIDATES) {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          setStatus("Loading", "load", `Fetching: ${new URL(base).pathname} (try ${attempt+1}/${MAX_RETRIES+1})`);
          const text = await attemptFetch(base);
          return text;
        } catch (e) {
          lastErr = e;
          if (attempt < MAX_RETRIES) {
            const wait = BASE_DELAY_MS * Math.pow(1.7, attempt);
            setStatus("Retrying", "load", `${e.message} — retrying in ${Math.round(wait)}ms`);
            await delay(wait);
            continue;
          }
          // move to next candidate
          break;
        }
      }
    }
    throw lastErr || new Error("All CSV endpoints failed");
  }

  const normalizeHeader = (h) => (h || "").trim().toLowerCase().replace(/\s+/g, " ");

  const targetCols = new Map([
    ["date purchased", "date"],
    ["date subscription was purchased", "date"],
    ["date", "date"],
    ["name", "name"],
    ["email", "email"],
    ["phone", "phone"],
    ["address", "address"],
    ["city", "city"],
    ["state", "state"],
    ["zip", "zip"],
    ["pickup day", "pickupDay"],
    ["day up day", "pickupDay"],
    ["bin location", "binLocation"],
    ["plan", "plan"],
    ["status", "status"],
    ["subscription id", "subscriptionId"],
    ["subscription", "subscriptionId"],
    ["customer id", "customerId"]
  ]);

  const mapRow = (obj) => {
    const out = {
      date: "", name: "", email: "", phone: "",
      address: "", city: "", state: "", zip: "",
      pickupDay: "", binLocation: "", plan: "", status: "",
      subscriptionId: "", customerId: ""
    };
    for (const key in obj) {
      const norm = normalizeHeader(key);
      const dst = targetCols.get(norm);
      if (dst) out[dst] = String(obj[key] ?? "").trim();
    }
    return out;
  };

  const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

  const render = (list) => {
    const frag = document.createDocumentFragment();
    list.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(r.date)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td class="wrap" title="${escapeHtml(r.address)}">${escapeHtml(r.address)}</td>
        <td>${escapeHtml(r.city)}</td>
        <td>${escapeHtml(r.state)}</td>
        <td>${escapeHtml(r.zip)}</td>
        <td>${escapeHtml(r.pickupDay)}</td>
        <td>${escapeHtml(r.binLocation)}</td>
        <td>${escapeHtml(r.plan)}</td>
        <td>${escapeHtml(r.status)}</td>
        <td>${escapeHtml(r.subscriptionId)}</td>
        <td>${escapeHtml(r.customerId)}</td>
      `;
      frag.appendChild(tr);
    });
    tbody.replaceChildren(frag);
  };

  const applySearch = () => {
    const q = (searchInput.value || "").toLowerCase().trim();
    if (!q) { render(rows); return; }
    const filtered = rows.filter(r => {
      return [
        r.name, r.email, r.address, r.plan, r.status,
        r.city, r.state, r.zip, r.binLocation, r.pickupDay, r.subscriptionId, r.customerId
      ].some(v => (v || "").toLowerCase().includes(q));
    });
    render(filtered);
  };

  async function load() {
    try {
      setStatus("Loading", "load", "Fetching Subscriptions CSV…");
      const text = await fetchCSVWithFallbacks();
      setStatus("Parsing", "load", "Parsing CSV…");
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rawRows = result.data || [];
          rows = rawRows.map(mapRow);
          setStatus("Ready", "ok", `Loaded ${rows.length} rows`);
          render(rows);
          applySearch();
        },
        error: (err) => setStatus("Error", "err", `CSV parse error: ${err?.message || err}`)
      });
    } catch (err) {
      setStatus("Error", "err", `CSV fetch failed: ${err?.message || err}`);
    }
  }

  refreshBtn?.addEventListener("click", load);
  searchInput?.addEventListener("input", applySearch);

  load();
})();
