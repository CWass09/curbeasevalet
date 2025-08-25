
const EFFECTIVE_CSV = `https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv`;
const __params = new URLSearchParams((typeof location!=='undefined' && location.search) || '');
const __csvParam = __params.get('csv');
const __sheetId = __params.get('sheet');
const __gid = __params.get('gid');
let EFFECTIVE_CSV = `https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv`;
if (__csvParam) {
  EFFECTIVE_CSV = decodeURIComponent(__csvParam);
} else if (__sheetId && __gid) {
  EFFECTIVE_CSV = `https://docs.google.com/spreadsheets/d/${__sheetId}/gviz/tq?tqx=out:csv&gid=${__gid}`;
} else {
  EFFECTIVE_CSV = EFFECTIVE_CSV;
}
async function loadCSVIntoTable(){
  const mount = document.getElementById("csvTable");
  if(!mount) return;
  try{
    const res = await fetch(EFFECTIVE_CSV, {cache: "no-store"});
    const text = await res.text();
    // Parse CSV (handles quoted commas)
    const rows = text.trim().split(/\r?\n/).map(r => {
      const out = []; let cur = ""; let inQ = false;
      for(let i=0;i<r.length;i++){
        const ch = r[i];
        if(ch === '"' ){ inQ = !inQ; continue; }
        if(ch === ',' && !inQ){ out.push(cur); cur=""; continue; }
        cur += ch;
      }
      out.push(cur);
      return out.map(c => c.trim());
    });
    // Build table
    const table = document.createElement("table");
    table.style.width="100%";
    table.style.borderCollapse="collapse";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    table.appendChild(thead); table.appendChild(tbody);
    const thRow = document.createElement("tr");
    (rows[0]||[]).forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      th.style.textAlign="left";
      th.style.borderBottom="1px solid #e5e7eb";
      th.style.padding="10px 8px";
      th.style.fontSize="14px";
      th.style.background="#f8fafc";
      thRow.appendChild(th);
    });
    thead.appendChild(thRow);
    for(let i=1;i<rows.length;i++){
      const tr = document.createElement("tr");
      rows[i].forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        td.style.borderBottom="1px solid #eef2f7";
        td.style.padding="10px 8px";
        td.style.fontSize="14px";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    mount.innerHTML="";
    mount.appendChild(table);
  }catch(err){
    mount.textContent = "Could not load Google Sheet: " + err;
  }
}
document.addEventListener("DOMContentLoaded", loadCSVIntoTable);
