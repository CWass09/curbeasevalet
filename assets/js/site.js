
document.addEventListener('DOMContentLoaded', ()=>{
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('show'); });
  },{threshold:.1});
  document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));

  window.captureReferral = function(plan){
    try{
      const name = document.getElementById('referrer_name')?.value || '';
      const email= document.getElementById('referrer_email')?.value || '';
      localStorage.setItem('referrer_name', name);
      localStorage.setItem('referrer_email', email);
      const f = document.querySelector('form[name="referral-capture"]');
      if(f){
        f.querySelector('[name="referrer_name"]').value = name;
        f.querySelector('[name="referrer_email"]').value = email;
        f.querySelector('[name="referral_code"]').value = '';
        f.querySelector('[name="plan_selected"]').value = plan || '';
        f.submit();
      }
    }catch(e){ console.warn(e); }
  };
});
