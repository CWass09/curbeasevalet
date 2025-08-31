/* CurbEase small DOM fixes without changing base layout */
(function(){
  function q(sel, root=document){ return root.querySelector(sel); }
  function qa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  document.addEventListener('DOMContentLoaded', function(){

    // 1) Remove stray "Mission" floating above hero: any anchor to mission not in nav/footer
    qa('a[href*="mission"]').forEach(a => {
      const inNav = a.closest('nav, .nav, .site-nav, .navbar, .menu, .mobile-menu, footer, .site-footer');
      if(!inNav){
        a.style.display = 'none';
      }
    });

    // 2) Ensure Mission in header nav is between Subscribe and About if all present
    const navList = q('nav ul, .nav-list, .navbar ul, .site-nav ul');
    if(navList){
      const links = qa('a', navList);
      const linkMap = Object.fromEntries(links.map(a => [a.textContent.trim().toLowerCase(), a]));
      const subscribe = linkMap['subscribe'];
      const mission   = linkMap['mission'];
      const about     = linkMap['about'];
      if(subscribe && mission && about){
        // insert mission after subscribe (before about)
        if(mission !== subscribe.nextElementSibling){
          navList.insertBefore(mission.parentElement || mission, (about.parentElement || about));
        }
      }
    }

    // 3) Hide "Manage subscription" button in header (but keep in mobile menu)
    qa('header a, .header a, .topbar a, nav a').forEach(a => {
      const text = (a.textContent || '').trim().toLowerCase();
      const inMobileMenu = a.closest('.mobile-menu, .menu-panel, .drawer, .offcanvas');
      if(text.includes('manage') && text.includes('subscription') && !inMobileMenu){
        a.style.display = 'none';
        a.classList.add('btn-manage-hidden');
      }
    });

    // 4) Premium card: ensure NEW badge and monthly cleaning bullet
    // Try to locate premium card by heading text
    const premiumHeadings = qa('h3, h2').filter(h => /premium/i.test(h.textContent));
    premiumHeadings.forEach(h => {
      const card = h.closest('.plan, .plan-card, .pricing-card, .tier, .card, .pricing');
      if(card){
        // Badge
        if(!q('.badge-new', card)){
          const badge = document.createElement('span');
          badge.className = 'badge-new';
          badge.textContent = 'NEW';
          card.appendChild(badge);
        }
        // Bullet
        const ul = q('ul', card);
        if(ul && !qa('li', ul).some(li => /bin cleaning/i.test(li.textContent))){
          const li = document.createElement('li');
          li.innerHTML = '<strong>One free trash &amp; recycle bin cleaning per month</strong>';
          ul.appendChild(li);
        }
      }
    });

    // 5) Footer alignment (inline style as fallback if CSS classes differ)
    const footerLinks = q('.site-footer .links, .footer-links, footer nav');
    if(footerLinks){
      Object.assign(footerLinks.style, {
        display:'flex', flexWrap:'wrap', gap:'12px 20px',
        alignItems:'center', justifyContent:'center', textAlign:'center'
      });
    }

    // 6) Make /mission route work if someone linked without .html (client-side enhancement)
    // If this script is on mission.html, ensure history path is /mission
    try{
      const path = location.pathname.replace(/\/+/g,'/');
      if(path.endsWith('/mission.html')){
        history.replaceState({}, '', '/mission');
      }
    }catch(e){}
  });
})();
