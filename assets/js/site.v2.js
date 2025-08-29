
// Smooth internal nav handled by CSS (scroll-behavior). Light JS for hover cards and mobile tweaks.
document.addEventListener('DOMContentLoaded', () => {
  // animate on scroll
  const opts = { threshold: .14 };
  const reveal = (el)=>{ el.style.transform='translateY(0)'; el.style.opacity='1'; };
  document.querySelectorAll('.card,.tier').forEach(el=>{
    el.style.opacity='.0'; el.style.transform='translateY(10px)';
    new IntersectionObserver((entries,obs)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ reveal(el); obs.unobserve(el); } });
    },opts).observe(el);
  });
});
