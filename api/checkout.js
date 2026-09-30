// Vercel serverless function: creates a Stripe Checkout session.
// Set STRIPE_SECRET_KEY in Vercel > Project > Settings > Environment Variables.
const BUNDLES = { 1: 29.99, 2: 53.98, 3: 76.47, 4: 99.99 };
const MASKS = {
  "pink-bunny": "Pink Bunny",
  "mint-menace": "Mint Menace",
  "drip-eye": "Drip Eye",
  "denim-bunny": "Denim Bunny",
  cobalt: "Cobalt",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, reason: "method" });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(200).json({ ok: false, reason: "not_configured" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const lines = Array.isArray(body.lines) ? body.lines.slice(0, 20) : [];
  const origin = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
  if (!lines.length) return res.status(400).json({ ok: false, reason: "empty" });

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${origin}/?order=success`);
  form.set("cancel_url", `${origin}/?order=cancelled`);
  form.set("shipping_address_collection[allowed_countries][0]", "US");

  for (let i = 0; i < lines.length; i++) {
    const { qty, masks } = lines[i] || {};
    const total = BUNDLES[qty];
    if (!total || !Array.isArray(masks) || masks.length !== qty || masks.some((m) => !MASKS[m])) {
      return res.status(400).json({ ok: false, reason: "invalid" });
    }
    const p = `line_items[${i}]`;
    form.set(`${p}[quantity]`, "1");
    form.set(`${p}[price_data][currency]`, "usd");
    form.set(`${p}[price_data][unit_amount]`, String(Math.round(total * 100)));
    form.set(`${p}[price_data][product_data][name]`, qty === 1 ? "Menace Knits Ski Mask" : `Menace Knits Ski Mask x${qty}`);
    form.set(`${p}[price_data][product_data][description]`, masks.map((m) => MASKS[m]).join(", "));
  }

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const json = await r.json();
  if (!r.ok || !json.url) return res.status(200).json({ ok: false, reason: "stripe_error" });
  return res.status(200).json({ ok: true, url: json.url });
}
