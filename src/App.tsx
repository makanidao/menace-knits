import { useEffect, useState } from "react";

import { BUNDLES, MASKS, maskById, money } from "./data";


type Line = { key: string; qty: number; masks: string[] };

const CART_KEY = "mk-cart-v1";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const PERKS = [
  { d: "M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5", title: "Hand crocheted.", text: "Every mask is made by hand, stitch by stitch, so no two are exactly alike." },
  { d: "M4 10c0-4 3.6-7 8-7s8 3 8 7v4a8 8 0 0 1-16 0z M8 12h8", title: "Wear it two ways.", text: "Roll it up like a beanie at the lodge, pull it down as a full mask on the lift." },
  { d: "M3 11h18v4a3 3 0 0 1-3 3h-3l-3-3-3 3H6a3 3 0 0 1-3-3z", title: "Goggle friendly.", text: "The eye opening sits right where your goggles go, so your face stays covered." },
];

export default function Store() {
  const [active, setActive] = useState(MASKS[0].id);
  const [view, setView] = useState(MASKS[0].photo);
  const [qty, setQty] = useState(1);
  const [slots, setSlots] = useState<string[]>([MASKS[0].id, MASKS[1].id, MASKS[2].id, MASKS[3].id]);
  const [cart, setCart] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [banner, setBanner] = useState("");
  const [splitId, setSplitId] = useState(MASKS[0].id);

  const mask = maskById(active);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved) as Line[]);
    } catch {
      /* storage unavailable, start with an empty cart */
    }
    const order = new URLSearchParams(window.location.search).get("order");
    if (order === "success") {
      setBanner("Order placed. Thank you! A receipt is on its way to your inbox.");
      setCart([]);
    } else if (order === "cancelled") {
      setBanner("Checkout cancelled. Your cart is still here.");
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (id: string) => {
    setActive(id);
    setView(maskById(id).photo);
    setSlots((s) => [id, ...s.slice(1)]);
  };

  const pickFromLineup = (id: string) => {
    choose(id);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const addToCart = () => {
    const line: Line = { key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, qty, masks: slots.slice(0, qty) };
    setCart((c) => [...c, line]);
    setNote("");
    setOpen(true);
  };

  const removeLine = (key: string) => setCart((c) => c.filter((l) => l.key !== key));

  const subtotal = cart.reduce((sum, l) => sum + (BUNDLES.find((b) => b.qty === l.qty)?.total ?? 0), 0);
  const count = cart.reduce((n, l) => n + l.qty, 0);

  const checkout = async () => {
    setBusy(true);
    setNote("");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: cart.map(({ qty: q, masks }) => ({ qty: q, masks })), origin: window.location.origin }),
      });
      const res = (await r.json()) as { ok: true; url: string } | { ok: false; reason: string };
      if (res.ok) {
        window.location.href = res.url;
        return;
      }
      setNote(
        res.reason === "not_configured"
          ? "Online checkout opens very soon. Your cart is saved, so check back shortly."
          : "Checkout could not start. Please try again in a moment.",
      );
    } catch {
      setNote("Checkout could not start. Please try again in a moment.");
    }
    setBusy(false);
  };

  const thumbs = [mask.photo, mask.sheet, mask.split];
  const bundle = BUNDLES.find((b) => b.qty === qty) ?? BUNDLES[0];
  const splitMask = maskById(splitId);

  return (
    <div className="mk">
      {banner && <div className="mk-banner" role="status">{banner}</div>}
      <div className="mk-bar">
        Bundle 4 masks for <b>$99.99</b> and save 37%
      </div>

      <header className="mk-head">
        <div className="mk-wrap mk-head-in">
          <a className="mk-logo" href="/">
            <img src="/favicon.svg" alt="" />
            Menace Knits
          </a>
          <nav className="mk-nav" aria-label="Main">
            <a href="#shop">Shop</a>
            <a href="#lineup">The lineup</a>
            <a href="#two-ways">Two ways</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="mk-cartbtn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
            Cart <span>{count}</span>
          </button>
        </div>
      </header>

      <main>
        <section id="shop" className="mk-wrap mk-product" style={{ scrollMarginTop: 80 }}>
          <div className="mk-gallery">
            <div className="mk-main">
              <img src={view} alt={`${mask.name} crochet ski mask`} />
              <span className="mk-stamp">Save 25%</span>
            </div>
            <div className="mk-thumbs">
              {thumbs.map((src, i) => (
                <button key={src} className="mk-thumb" aria-pressed={view === src} onClick={() => setView(src)} aria-label={`View photo ${i + 1}`}>
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
              {MASKS.filter((m) => m.id !== active).map((m) => (
                <button key={m.id} className="mk-thumb" aria-pressed={false} onClick={() => choose(m.id)} aria-label={`Show ${m.name}`}>
                  <img src={m.photo} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="mk-info">
            <div>
              <div className="mk-eyebrow">Handmade crochet balaclava</div>
              <h1 className="mk-title">Menace Knits Ski Mask</h1>
            </div>

            <div className="mk-price">
              <strong>{money(29.99)}</strong>
              <s>{money(39.99)}</s>
              <span className="mk-save">Save 25%</span>
            </div>

            <div>
              <span className="mk-label">
                Style: <em>{mask.name}</em>
              </span>
              <div className="mk-swatches">
                {MASKS.map((m) => (
                  <button key={m.id} className="mk-swatch" aria-pressed={m.id === active} onClick={() => choose(m.id)}>
                    <i style={{ background: m.swatch }} />
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <ul className="mk-perks">
              {PERKS.map((p) => (
                <li key={p.title}>
                  <Icon d={p.d} />
                  <span>
                    <b>{p.title}</b> {p.text}
                  </span>
                </li>
              ))}
            </ul>

            <div>
              <span className="mk-label">Bundle and save</span>
              <div className="mk-bundles" role="radiogroup" aria-label="Bundle size">
                {BUNDLES.map((b) => (
                  <div
                    key={b.qty}
                    className="mk-bundle"
                    role="radio"
                    tabIndex={0}
                    aria-checked={b.qty === qty}
                    onClick={() => setQty(b.qty)}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setQty(b.qty);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {b.popular && <span className="mk-flag">Most popular</span>}
                    <div className="mk-bundle-row">
                      <span className="mk-bundle-name">
                        <span className="mk-radio" />
                        <span>
                          {b.qty} {b.qty === 1 ? "Mask" : "Masks"}
                          <small>{money(b.each)} each</small>
                        </span>
                      </span>
                      <span className="mk-bundle-price">
                        <b>{money(b.total)}</b>
                        <s>{money(b.compare)}</s>
                      </span>
                    </div>
                    {b.qty === qty && (
                      <div className="mk-slots" onClick={(e) => e.stopPropagation()}>
                        {Array.from({ length: b.qty }, (_, i) => (
                          <label key={i} className="mk-slot">
                            Mask {i + 1}
                            <select
                              id={`slot-${i}`}
                              value={slots[i]}
                              onChange={(e) => {
                                const v = e.target.value;
                                setSlots((s) => s.map((x, j) => (j === i ? v : x)));
                                if (i === 0) {
                                  setActive(v);
                                  setView(maskById(v).photo);
                                }
                              }}
                            >
                              {MASKS.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className="mk-add" onClick={addToCart}>
              Add to cart · {money(bundle.total)}
            </button>
            <div className="mk-fine">
              <span>Secure checkout</span>
              <span>Ships sealed and brand new</span>
              <span>One size fits most adults</span>
            </div>
          </div>
        </section>

        <section id="lineup" className="mk-section">
          <div className="mk-wrap">
            <div className="mk-eyebrow">The lineup</div>
            <h2 className="mk-h2">Pick your menace</h2>
            <p className="mk-lede">Five styles, all hand crocheted. Mix them in any bundle so the whole crew matches without matching.</p>
            <div className="mk-lineup">
              {MASKS.map((m) => (
                <article key={m.id} className="mk-card">
                  <div className="mk-card-img">
                    <img src={m.photo} alt={`${m.name} ski mask on a chairlift`} loading="lazy" />
                  </div>
                  <div className="mk-card-body">
                    <div className="mk-card-top">
                      <h3>{m.name}</h3>
                      <span>{m.style}</span>
                    </div>
                    <p>{m.blurb}</p>
                    <button className="mk-pick" onClick={() => pickFromLineup(m.id)}>
                      Choose {m.name}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="two-ways" className="mk-section">
          <div className="mk-wrap">
            <div className="mk-eyebrow">Up or down</div>
            <h2 className="mk-h2">Beanie at the lodge. Full mask on the lift.</h2>
            <p className="mk-lede">Roll the face up and it sits like a beanie with the horns or ears on top. When the wind picks up, pull it down and drop your goggles over the eye opening.</p>
            <div className="mk-updown">
              <div className="mk-tabs" role="tablist" aria-label="Style">
                {MASKS.map((m) => (
                  <button key={m.id} role="tab" className="mk-tab" aria-selected={m.id === splitId} onClick={() => setSplitId(m.id)}>
                    {m.name}
                  </button>
                ))}
              </div>
              <div className="mk-split">
                <img src={splitMask.split} alt={`${splitMask.name} worn rolled up as a beanie and pulled down as a mask`} loading="lazy" />
                <div className="mk-split-tags" aria-hidden="true">
                  <span>Rolled up</span>
                  <span>Pulled down</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-wrap">
            <div className="mk-eyebrow">Details</div>
            <h2 className="mk-h2">What you get</h2>
            <dl className="mk-specs">
              <div><dt>Made</dt><dd>Hand crocheted yarn knit</dd></div>
              <div><dt>Fit</dt><dd>One size, stretches to fit most adults</dd></div>
              <div><dt>Wear</dt><dd>Rolled up beanie or full face mask</dd></div>
              <div><dt>Care</dt><dd>Hand wash cold, lay flat to dry</dd></div>
              <div><dt>Arrives</dt><dd>Brand new in a sealed clear bag</dd></div>
              <div><dt>Price</dt><dd>{money(29.99)} each, from {money(25)} in a 4 pack</dd></div>
            </dl>
          </div>
        </section>

        <section id="faq" className="mk-section">
          <div className="mk-wrap">
            <div className="mk-eyebrow">Questions</div>
            <h2 className="mk-h2">Good to know</h2>
            <div className="mk-faq">
              <details>
                <summary>Can I mix styles in a bundle?</summary>
                <p>Yes. Pick a bundle size, then choose a style for every mask in it.</p>
              </details>
              <details>
                <summary>Will it fit with goggles and a helmet?</summary>
                <p>The eye opening lines up with goggles. The knit layers under a helmet, though styles with horns or ears look best with a hood or no helmet.</p>
              </details>
              <details>
                <summary>How do I wash it?</summary>
                <p>Hand wash in cold water with a little gentle soap, squeeze out the water without wringing, and lay it flat to dry.</p>
              </details>
              <details>
                <summary>How does shipping work?</summary>
                <p>Your masks ship brand new in sealed bags. You get an email with tracking as soon as your order leaves.</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer className="mk-foot">
        <div className="mk-wrap mk-foot-in">
          <a className="mk-logo" href="/">
            <img src="/favicon.svg" alt="" />
            Menace Knits
          </a>
          <small>© 2026 Menace Knits. Handmade crochet ski masks.</small>
        </div>
      </footer>

      {open && (
        <>
          <div className="mk-scrim" onClick={() => setOpen(false)} />
          <aside className="mk-drawer" role="dialog" aria-modal="true" aria-label="Your cart">
            <div className="mk-drawer-head">
              <h2>Your cart</h2>
              <button className="mk-x" onClick={() => setOpen(false)} aria-label="Close cart">
                ×
              </button>
            </div>
            <div className="mk-lines">
              {cart.length === 0 ? (
                <p className="mk-empty">Your cart is empty. Pick a mask to get started.</p>
              ) : (
                cart.map((l) => {
                  const b = BUNDLES.find((x) => x.qty === l.qty) ?? BUNDLES[0];
                  return (
                    <div key={l.key} className="mk-line">
                      <img src={maskById(l.masks[0]).photo} alt="" />
                      <div>
                        <h4>{l.qty === 1 ? "Ski Mask" : `${l.qty} Mask Bundle`}</h4>
                        <p>{l.masks.map((id) => maskById(id).name).join(", ")}</p>
                      </div>
                      <div className="mk-line-r">
                        {money(b.total)}
                        <button className="mk-remove" onClick={() => removeLine(l.key)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mk-drawer-foot">
              <div className="mk-sub">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <button className="mk-checkout" disabled={cart.length === 0 || busy} onClick={checkout}>
                {busy ? "Starting checkout..." : "Check out"}
              </button>
              {note ? (
                <p className="mk-note" role="status">{note}</p>
              ) : (
                <p className="mk-note">Shipping and tax are shown at checkout.</p>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
