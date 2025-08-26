/* CurbEase Admin — v2
   - Verifies a token from the URL (?token=...)
   - Fetches a published-to-web CSV from Google Sheets
   - Renders a searchable table
*/

// === CONFIG (edit these two if needed) ================================
const ACCESS_TOKEN = 'curbease-ok-2425'; // must match your URL's ?token= value
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv';
// =====================================================================

const qs = new URLSearchParams(location.search);
const token = qs.get('token') || '';
const badge = document.getElementById('status-badge');
const panel = document.getElementById('panel');
const search = document.getElementById('search');
const refreshBtn = document.getElementById('refresh');
const openCsv = document.getElementById('openCsv');
openCsv.href = SHEET_CSV_URL;

let rows = [];   // parsed CSV rows (array of object)
let headers = []; // header fields

init();

async function init(){
  if (token !== ACCESS_TOKEN){
    badge.textContent = 'Access denied';
    badge.classList.add('danger');
    renderError(`Unauthorized. The token in your URL does not match the expected token.`);
    return;
  }
  badge.textContent = 'Authorized';
  badge.classList.remove('danger');
  badge.classList.add('success');

  await loadCsv();
  refreshBtn.addEventListener('click', loadCsv);
  search.addEventListener('input', () => renderTable(filterRows(search.value)));
}

async function loadCsv(){
  panel.innerHTML = loading();
  try{
    const url = SHEET_CSV_URL + '&_=' + Date.now(); // cache-bust
    const res = await fetch(url, { mode: 'cors' });
    if(!res.ok){
      throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    const parsed = parseCsv(text);
    headers = parsed.headers;
    rows = parsed.rows;
    renderTable(rows);
    badge.textContent = `Loaded ${rows.length.toLocaleString()} rows`;
  }catch(err){
    renderError(err.message);
    console.error(err);
  }
}

function loading(){
  return `<div class="center"><div class="spinner"></div><div class="muted">Fetching sheet…</div></div>`;
}

function renderError(msg){
  panel.innerHTML = `<div class="center" style="flex-direction:column;text-align:center">
      <div class="muted" style="margin-bottom:8px">Something went wrong</div>
      <div style="color:#ffd3d3;background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.4);padding:10px 12px;border-radius:10px">
        ${escapeHtml(msg)}
      </div>
      <div style="margin-top:12px" class="muted">Check that your Google Sheet is <em>File → Share → Publish to web</em> and the link matches this page’s configuration.</div>
    </div>`;
}

function renderTable(data){
  if (!headers.length){
    panel.innerHTML = '<div class="muted">No data.</div>';
    return;
  }
  let thead = '<tr>' + headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>';
  let tbody = data.map(row => {
    return '<tr>' + headers.map(h => `<td>${escapeHtml(row[h] ?? '')}</td>`).join('') + '</tr>';
  }).join('');

  panel.innerHTML = `<div style="overflow:auto;border-radius:12px;border:1px solid rgba(255,255,255,.06)">
      <table>
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>`;
}

// Simple CSV parser (handles quoted fields)
function parseCsv(text){
  const rows = [];
  let i = 0, field = '', inQuotes = false, row = [], c, prev;
  const pushField = () => { row.push(field); field=''; };
  const pushRow = () => { rows.push(row); row = []; };

  while (i < text.length){
    c = text[i++];
    if (inQuotes){
      if (c === '"' && text[i] === '"'){ field += '"'; i++; }
      else if (c === '"'){ inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"'){ inQuotes = true; }
      else if (c === ','){ pushField(); }
      else if (c === '\n'){ pushField(); pushRow(); }
      else if (c === '\r'){ /* ignore CR */ }
      else { field += c; }
    }
    prev = c;
  }
  if (field.length || row.length){ pushField(); pushRow(); }

  const headers = rows.shift() || [];
  const objects = rows.filter(r => r.length && r.some(v => String(v).trim() !== '')).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
    return obj;
  });
  return { headers, rows: objects };
}

function filterRows(q){
  q = (q || '').toLowerCase().trim();
  if (!q) return rows;
  return rows.filter(r => headers.some(h => String(r[h]).toLowerCase().includes(q)));
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
