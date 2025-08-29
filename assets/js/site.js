
const STRIPE = {
  basic:   "https://buy.stripe.com/3cIdR328c0KXbAobWJ9oc02",
  standard:"https://buy.stripe.com/14AdR3dQU51dfQEbWJ9oc03",
  premium: "https://buy.stripe.com/eVqfZbbIM79l6g4d0N9oc04"
};
function subscribe(plan){
  const url = STRIPE[plan];
  if(!url){ alert("Plan not available."); return; }
  // Optional tracking
  const qp = new URLSearchParams(window.location.search);
  const utm = qp.get("utm_campaign") ? `?utm_campaign=${encodeURIComponent(qp.get("utm_campaign"))}` : "";
  window.location.href = url + utm;
}
