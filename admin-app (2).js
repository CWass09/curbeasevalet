(() => {
  const CSV_URL = window.__CSV_URL__;
  const REQUIRED_TOKEN = window.__TOKEN__;

  const authChip = document.getElementById('authChip');
  const search = document.getElementById('search');
  const refreshBtn = document.getElementById('refreshBtn');
  const openBtn = document.getElementById('openBtn');
  const errorBox = document.getElementById('errorBox');
  const debugBox = document.getElementById('debugBox');
  const grid = document.getElementById('grid');
  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');

  function qs(k) { return new URLSearchParams(location.search).get(k); }
  function setChip(text, klass){ authChip.textContent=text; authChip.className='chip ' + (klass||''); }
  function showError(msg){ errorBox.textContent = msg; errorBox.classList.remove('hidden'); }
  function clearError(){ errorBox.classList.add('hidden'); errorBox.textContent=''; }
  function logDebug(obj){ debugBox.textContent = (typeof obj==='string'?obj:JSON.stringify(obj, null, 2)); }

  // Auth
  const token = qs('token');
  if(!token){
    setChip('missing token','bad');
    showError('Missing ?token=… in URL.');
    return;
  }
  if(token !== REQUIRED_TOKEN){
    setChip('access denied','bad');
    showError('Invalid token.');
    return;
  }
  setChip('access granted','ok');

  // CSV helpers
  function parseCSV(text){
    // Basic CSV parser that handles quotes/newlines
    const rows = [];
    let i=0, cur='', row=[], inQ=false;
    while(i < text.length){
      const c = text[i++];
      if(inQ){
        if(c === '"'){
          if(text[i] === '"'){ cur+='"'; i++; } else { inQ = false; }
        } else { cur += c; }
      }else{
        if(c === '"'){ inQ = true; }
        else if(c === ','){ row.push(cur); cur=''; }
        else if(c === '\n'){ row.push(cur); rows.push(row); row=[]; cur=''; }
        else if(c === '\r'){ /* ignore */ }
        else { cur += c; }
      }
    }
    if(cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function render(rows){
    if(!rows || !rows.length){ showError('CSV is empty.'); return; }
    clearError();
    thead.innerHTML = ''; tbody.innerHTML = '';
    grid.classList.remove('hidden');

    const headers = rows[0];
    const trh = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th'); th.textContent = h; trh.appendChild(th);
    });
    thead.appendChild(trh);

    const body = rows.slice(1);
    body.forEach(r => {
      if(r.every(c => c==='')) return;
      const tr = document.createElement('tr');
      r.forEach((c, idx) => {
        const td = document.createElement('td'); td.textContent = c; tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    // quick search
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      for(const tr of tbody.rows){
        const show = tr.textContent.toLowerCase().includes(q);
        tr.style.display = show ? '' : 'none';
      }
    });
  }

  async function fetchCSV(){
    clearError();
    setChip('loading…', ''); 
    logDebug(`GET ${CSV_URL}`);
    try{
      const res = await fetch(CSV_URL, { mode:'cors', redirect:'follow', cache:'no-store' });
      logDebug({status:res.status, ok:res.ok, url:res.url});
      if(!res.ok){
        const t = await res.text();
        showError(`CSV fetch failed (${res.status}). See “Open CSV”.`);
        logDebug(t.slice(0, 500));
        setChip('error','bad');
        return;
      }
      const text = await res.text();
      const rows = parseCSV(text);
      render(rows);
      setChip('loaded','ok');
    }catch(err){
      showError('CSV fetch error: ' + err.message);
      setChip('error','bad');
      logDebug(String(err));
    }
  }

  refreshBtn.addEventListener('click', fetchCSV);
  openBtn.addEventListener('click', () => window.open(CSV_URL, '_blank'));

  fetchCSV();
})();