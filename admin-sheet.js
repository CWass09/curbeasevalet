
const DEFAULT_SHEET_ID = "1DBFts43__8kvOqYrmvp6WKi-XEm8ty-k5skp3HlO_Pw";
const DEFAULT_GID = "156265265";
const DEFAULT_GVIZ = `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${DEFAULT_GID}`;
const FALLBACK_PUB = "https://docs.google.com/spreadsheets/d/e/2PACX-1vShSt84sllgBrJ6wOpq9AoRAMCbS5bJBuexFnJuSP1xxlKYDci_J-E3hJJJLPt9a098VonUbhOJEWB0/pub?output=csv";

function getCsvSource() {
  const p = new URLSearchParams((typeof location!=='undefined' && location.search) || '');
  const csv = p.get('csv');
  const sid = p.get('sheet');
  const gid = p.get('gid');
  if (csv) return decodeURIComponent(csv);
  if (sid && gid) return `https://docs.google.com/spreadsheets/d/${sid}/gviz/tq?tqx=out:csv&gid=${gid}`;
  return DEFAULT_GVIZ;
}

function parseCsvLine(line){
  const out=[]; let cur="", q=false;
  for(let i=0;i<line.length;i++){ const ch=line[i];
    if(ch=='"'){ if(q && line[i+1]=='"'){ cur+='"'; i++; } else q=!q; }
    else if(ch==',' && !q){ out.push(cur); cur=""; }
    else cur+=ch;
  }
  out.push(cur);
  return out.map(s=>s.replace(/^"|"$/g,''));
}

async function tryFetch(url) {
  const res = await fetch(url, { cache:'no-store' });
  return { ok: res.ok, status: res.status, text: res.ok ? await res.text() : '' };
}

async function loadCSVIntoTable(){
  const mount = document.getElementById("csvTable");
  try{
    const tried=[];
    let src = getCsvSource();
    for (let i=0;i<3;i++) {
      tried.push(src);
      const r = await tryFetch(src);
      if (r.ok && r.text) {
        const lines = r.text.split(/\r?\n/).filter(Boolean);
        if (lines.length===0) throw new Error("No rows in CSV");
        const headers = parseCsvLine(lines[0]);
        const rows = lines.slice(1).map(parseCsvLine);
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        thead.innerHTML = '<tr>' + headers.map(h=>'<th>'+h+'</th>').join('') + '</tr>';
        tbody.innerHTML = rows.map(r => '<tr>' + headers.map((h,i)=>'<td>'+ (r[i]||'') +'</td>').join('') + '</tr>').join('');
        table.appendChild(thead); table.appendChild(tbody);
        table.style.width="100%"; table.style.borderCollapse="collapse";
        mount.innerHTML=""; mount.appendChild(table);
        const dbg=document.getElementById('csvDebug'); if(dbg) dbg.textContent = 'Loaded from: ' + src;
        return;
      }
      if (i===0) src = FALLBACK_PUB;
      else if (i===1) src = '/.netlify/functions/fetch-csv?src=' + encodeURIComponent(getCsvSource());
    }
    throw new Error("CSV fetch failed after attempts.");
  }catch(err){
    mount.textContent = "Could not load Google Sheet: " + err;
  }
}
document.addEventListener("DOMContentLoaded", loadCSVIntoTable);
