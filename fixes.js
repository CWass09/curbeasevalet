
window.CurbEase = window.CurbEase || {};
CurbEase.requireAuth = function(){
  const ok = sessionStorage.getItem('CE_AUTH_OK') === '1';
  if(!ok){ window.location.href = '/admin-access.html'; }
  return ok;
}
CurbEase.logout = function(){
  sessionStorage.removeItem('CE_AUTH_OK');
  window.location.href = '/';
}
