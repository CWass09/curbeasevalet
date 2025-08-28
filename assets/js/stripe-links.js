// CurbEase Stripe payment links (LIVE)
// Success URLs should already be set in Stripe to /thank-you.html?plan={PLAN}&session_id={CHECKOUT_SESSION_ID}
const CURBEASE_STRIPE_LINKS = {
  basic:   "https://buy.stripe.com/3cIdR328c0KXbAobWJ9oc02",
  standard:"https://buy.stripe.com/14AdR3dQU51dfQEbWJ9oc03",
  premium: "https://buy.stripe.com/eVqfZbbIM79l6g4d0N9oc04"
};

async function goSubscribe(plan){
  try{ await logReferralToNetlify(plan); }catch(e){}
  return goSubscribeWithPromo(plan);
}
  window.location.href = url;
  return false;
}


// Optional: attach UTM tracking (promo code) when navigating to Stripe
function goSubscribeWithPromo(plan){
  const base = CURBEASE_STRIPE_LINKS[plan];
  if(!base){ alert('Plan link missing'); return false; }
  const promo = (document.getElementById('promo-input')||{}).value || '';
  const url = base + (promo ? ('?utm_source=promo&utm_medium=site&utm_campaign=' + encodeURIComponent(promo)) : '');
  window.location.href = url;
  return false;
}
