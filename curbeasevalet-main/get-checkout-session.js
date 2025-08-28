// /.netlify/functions/get-checkout-session.js
// Uses a restricted Stripe key via env var STRIPE_RESTRICTED_KEY (Checkout Sessions: Read)
const fetch = global.fetch || require('node-fetch');
exports.handler = async (event) => {
  try {
    const id = (event.queryStringParameters && event.queryStringParameters.id) || "";
    const key = process.env.STRIPE_RESTRICTED_KEY;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: "Missing STRIPE_RESTRICTED_KEY" }) };

    const params = new URLSearchParams();
    params.append("expand[]", "line_items");
    params.append("expand[]", "line_items.data.price.product");

    const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` }
    });
    if (!resp.ok) {
      const t = await resp.text();
      return { statusCode: resp.status, body: t };
    }
    const s = await resp.json();
    const cd = s.customer_details || {};
    const addr = cd.address || {};
    const li = s.line_items && s.line_items.data && s.line_items.data[0];
    const plan = (li && (li.price && (li.price.nickname || (li.price.product && li.price.product.name)))) || (li && li.description) || "";

    // Custom fields (bin_location) if present
    let binLocation = "";
    if (Array.isArray(s.custom_fields)) {
      const f = s.custom_fields.find(x => x.key === "bin_location");
      binLocation = (f && f.text && f.text.value) || "";
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({
        name: cd.name || "",
        email: cd.email || "",
        address: addr.line1 || "",
        city: addr.city || "",
        state: addr.state || "",
        zip: addr.postal_code || "",
        plan: (plan || "").toString().toLowerCase(),
        bin_location: binLocation
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
