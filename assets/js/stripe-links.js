
const CURBEASE_STRIPE_LINKS = {
  basic:   "https://buy.stripe.com/3cIdR328c0KXbAobWJ9oc02",
  standard:"https://buy.stripe.com/14AdR3dQU51dfQEbWJ9oc03",
  premium: "https://buy.stripe.com/eVqfZbbIM79l6g4d0N9oc04"
};

function goSubscribe(plan){
  try{ window.captureReferral && window.captureReferral(plan); }catch(e){}
  const base = CURBEASE_STRIPE_LINKS[plan];
  if(!base){ alert('Plan temporarily unavailable'); return; }
  const url = new URL(base);
  const promo = new URLSearchParams(location.search).get('promo') || '';
  if(promo) url.searchParams.set('utm_campaign', promo);
  location.href = url.toString();
}
