/* Admin CSV loader with robust CORS fallback
   - Direct GVIZ CSV (no Publish to web required)
   - Fallback to AllOrigins proxy
   - Optional: published CSV fallback
   - URL overrides:
     ?csv=ENCODED_CSV_URL
     ?sheet=SPREADSHEET_ID&gid=GID
*/
(function(){
  const DEFAULT_SHEET_ID = "1DBFts43__8kvOqYrmvp6WKi-XEm8ty-k5skp3HlO_Pw";
  const DEFAULT_GID      = "156265265";
  const DEFAULT_PUBLISHED_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv";

  const qs = new URLSearchParams(location.search);
  const overrideCsv   = qs.get("csv");
  const overrideSheet = qs.get("sheet");
  const overrideGid   = qs.get("gid");

  const statusEl = document.getElementById("status");
  const errorEl  = document.getElementById("error");
  const outEl    = document.getElementById("out");
  const sourceEl = document.getElementById("source");

  function gvizCsv(sheetId, gid){
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  }
  function proxy(url){
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }
  function setStatus(msg){ statusEl.textContent = msg; }
  function setError(msg){ errorEl.textContent = msg; }
  function setSource(msg){ sourceEl.textContent = "Source: " + msg; }

  async function fetchText(url){
    const res = await fetch(url, {cache:"no-store"});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  function parseCsv(text){
    // minimal CSV parse: split lines then commas, handles basic quoted fields
    const rows = [];
    let i=0, field="", row=[], inQ=false;
    for(const ch of text){
      if(inQ){
        if(ch === '"'){ inQ = false; }
        else { field += ch; }
      }else{
        if(ch === '"'){ inQ = true; }
        else if(ch === ','){ row.push(field); field=""; }
        else if(ch === '\n' || ch === '\r'){
          if(field.length || row.length){ row.push(field); rows.push(row); field=""; row=[]; }
        }else{ field += ch; }
      }
      i++;
    }
    if(field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function renderTable(rows){
    if(!rows || !rows.length){ outEl.innerHTML = "<div class='error'>No rows found.</div>"; return; }
    const headers = rows[0];
    const rest = rows.slice(1);
    let html = "<table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse;margin-top:12px'>";
    html += "<thead><tr>" + headers.map(h=>`<th style="background:#f2f5ff">${h}</th>`).join("") + "</tr></thead>";
    html += "<tbody>" + rest.map(r=>"<tr>"+ r.map(c=>`<td>${c}</td>`).join("") +"</tr>").join("") + "</tbody>";
    html += "</table>";
    outEl.innerHTML = html;
  }

  async function load(){
    setError(""); outEl.innerHTML="";
    let stepsTried = [];
    let url = overrideCsv || (overrideSheet && overrideGid ? gvizCsv(overrideSheet, overrideGid) : gvizCsv(DEFAULT_SHEET_ID, DEFAULT_GID));
    setSource(url);

    // 1) Try direct
    stepsTried.push("direct:"+url);
    try{
      setStatus("Loading CSV (direct)…");
      const txt = await fetchText(url);
      setStatus("Loaded (direct).");
      renderTable(parseCsv(txt));
      return;
    }catch(e){
      console.warn("Direct fetch failed:", e);
    }

    // 2) Try proxy for same URL
    const p1 = proxy(url);
    stepsTried.push("proxy:"+p1);
    try{
      setStatus("Loading CSV via proxy…");
      const txt = await fetchText(p1);
      setStatus("Loaded via proxy.");
      renderTable(parseCsv(txt));
      return;
    }catch(e){
      console.warn("Proxy fetch failed:", e);
    }

    // 3) Fallback: published CSV (direct)
    stepsTried.push("published:"+DEFAULT_PUBLISHED_CSV);
    try{
      setStatus("Loading published CSV (direct)…");
      const txt = await fetchText(DEFAULT_PUBLISHED_CSV);
      setStatus("Loaded published CSV (direct).");
      renderTable(parseCsv(txt));
      return;
    }catch(e){
      console.warn("Published CSV direct failed:", e);
    }

    // 4) Fallback: published CSV via proxy
    const p2 = proxy(DEFAULT_PUBLISHED_CSV);
    stepsTried.push("published-proxy:"+p2);
    try{
      setStatus("Loading published CSV via proxy…");
      const txt = await fetchText(p2);
      setStatus("Loaded published CSV via proxy.");
      renderTable(parseCsv(txt));
      return;
    }catch(e){
      console.warn("Published CSV via proxy failed:", e);
    }

    setStatus("");
    setError("Failed to fetch");
    const pre = document.createElement("pre");
    pre.textContent = "Tried:\\n" + stepsTried.join("\\n");
    outEl.appendChild(pre);
  }

  document.getElementById("reload").addEventListener("click", ()=>load());
  load();
})();