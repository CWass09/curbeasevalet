/**
 * Deploy this as a Web App (Anyone with link).
 * Set SECRET below and pass it as header `X-Secret` from admin.html.
 * Updates the first row matching referrer_email in "Referrals" sheet: sets "Credit Applied" = "Yes" and appends to Notes.
 */
const SECRET = 'CHANGE_ME_SECRET';

function doPost(e) {
  try {
    const headers = e && e.parameter ? e.parameter : {};
    const body = JSON.parse(e.postData.contents || '{}');
    const secret = (e && e.parameters && e.parameters['X-Secret']) ? e.parameters['X-Secret'][0] : (e && e.postData && e.postData.type === 'application/json' && e.postData.contents ? JSON.parse(e.postData.contents)['X-Secret'] : e && e.headers ? e.headers['X-Secret'] : '');
    // Simpler: allow X-Secret in header when using fetch
    var xSecret = '' + ( (e && e.postData) ? (e.postData.headers && e.postData.headers['X-Secret']) : '' );
  } catch(err) {}
  var reqSecret = (e && e.postData && e.postData.headers && e.postData.headers['X-Secret']) || (body && body['X-Secret']) || (e && e.parameter && e.parameter['X-Secret']);
  if (reqSecret !== SECRET) {
    return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'unauthorized' })).setMimeType(ContentService.MimeType.JSON);
  }
  var payload = JSON.parse(e.postData.contents || '{}');
  var refEmail = (payload.referrer_email||'').toLowerCase().trim();
  var plan = (payload.plan||'').toLowerCase().trim();
  var sh = SpreadsheetApp.getActive().getSheetByName('Referrals');
  if (!sh) return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'sheet not found' })).setMimeType(ContentService.MimeType.JSON);
  var data = sh.getDataRange().getValues();
  var header = data[0];
  var idxEmail = header.indexOf('Referrer Email');
  var idxCredit = header.indexOf('Credit Applied');
  var idxNotes = header.indexOf('Notes');
  var updated = 0;
  for (var i=1;i<data.length;i++){
    var row = data[i];
    if ((row[idxEmail]||'').toString().toLowerCase().trim() === refEmail){
      sh.getRange(i+1, idxCredit+1).setValue('Yes');
      var old = row[idxNotes] || '';
      sh.getRange(i+1, idxNotes+1).setValue((old?old+' | ':'') + 'Credit applied via admin ' + (new Date()).toISOString());
      updated++;
      break;
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ ok:true, updated:updated })).setMimeType(ContentService.MimeType.JSON);
}