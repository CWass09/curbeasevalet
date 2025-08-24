
async function fetchCSV(url){
  const res = await fetch(url, { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to fetch CSV: ' + res.status);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if(lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for(let i=1;i<lines.length;i++){
    const cells = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => row[h] = (cells[idx] || ""));
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line){
  const out = [];
  let cur = "", inQ = false;
  for(let i=0;i<line.length;i++){
    const ch = line[i];
    if(ch === '"'){
      if(inQ && line[i+1] === '"'){ cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if(ch === ',' && !inQ){
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map(s => s.replace(/^"|"$/g, ""));
}
