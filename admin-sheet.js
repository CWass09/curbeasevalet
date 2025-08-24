
(async function(){
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAIuKTmyPU5OybJbNw9O7oWML19IHwU5Prnxy3_k3zMCjD3pYUUxBWFmJ31xMj_gOrzmh9OtdV_Kqe/pub?gid=319823546&single=true&output=csv";
  try{
    const data = await fetchCSV(SHEET_CSV_URL);
    const summaryEl = document.getElementById('summary');
    if(!data.length){
      summaryEl.innerHTML = '<p>No rows found.</p>';
      return;
    }
    const headers = Object.keys(data[0]);
    const thead = document.getElementById('thead');
    thead.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = data.map(row => {
      const fullAddress = row['Full Address'] || [row['Street'], row['City'], row['State'], row['Zip']].filter(Boolean).join(', ');
      if(fullAddress && !row['Full Address']) { row['Full Address'] = fullAddress; }
      return `<tr>${headers.map(h => `<td>${(row[h]||'')}</td>`).join('')}</tr>`;
    }).join('');
    summaryEl.innerHTML = `<p><strong>${data.length}</strong> subscriptions loaded.</p>`;
  }catch(err){
    document.getElementById('summary').innerHTML = `<p style="color:#b91c1c;">${err.message}</p>`;
  }
})();
