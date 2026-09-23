# Build notes — Hero section

## What I'd flag about the original prototype file
- The hero badges, headline, CTA copy, and every price/₹ figure are hand-typed
  into the HTML. None of it survives a merchant trying to run a sale or
  reword the tagline without a developer.
- Product art is rendered as `<span role="img" aria-label="...">` with a CSS
  background-image (base64 SVG). `role="img"` on a `<span>` is a weak
  accessibility pattern (works in most screen readers, but it's a non-real
  image: no `loading="lazy"`, no responsive `srcset`, and it can't be swapped
  for real product photography without editing CSS custom properties). Fixed
  by rendering real `<img>`/`<picture>` via Shopify's `image_tag`.
- `<h1 class="d1 rv in">` ships already in its "revealed" (`.in`) state while
  every sibling element uses `.rv` (starts invisible/blurred, animates in on
  scroll). That's inconsistent, and worse, it means the LCP element's paint
  is gated behind a class the other elements need JS to add. I dropped the
  scroll-reveal treatment from the hero entirely — content above the fold
  should never depend on scroll-triggered JS to become visible or fully
  opaque; that's a CLS/LCP risk, not a design detail worth preserving.
- The rotator's timing/pause-on-hover/`IntersectionObserver` logic was solid
  and I kept it, just rewired to run per-section-instance (see below) instead
  of against a single global `#heroProd` id, and added `shopify:block:select`
  handling so the theme editor never leaves a slide "stuck."

## What I changed in the code and why
- **Filename:** the assignment's own scope table (image 4) names this section
  `section.hero`. Shopify section files can't have a second literal dot
  before `.liquid`, so I used `sections/section-hero.liquid` as the closest
  valid equivalent and I'm calling that out explicitly rather than silently
  deviating from the given name.
- **Scene/water background + header parallax** in the original file are
  page-level, not hero-specific (the same `.scenes`/`.water` stage underlies
  every section down the page and reacts to `data-scene` zones on sections
  I'm not building yet). I did not port them into this section — they're
  bonus scope per the brief, and bolting a page-wide visual system onto one
  section's CSS/JS file would make it non-reusable and impossible to review
  in isolation. Flagging so it isn't mistaken for an oversight.
- **IDs → per-instance scoping:** original used `id="hstage"`, `id="hdots"`,
  `id="heroProd"`. A section can be added more than once, or duplicated, in
  the theme editor, so I moved to `data-hero-stage` + section-scoped queries
  (`section.querySelector(...)`) instead of `document.getElementById`.
- **Badge line-breaks:** the prototype hardcodes `Plant<br>powered`. A
  merchant can't type a `<br>` into a plain-text setting field safely, so the
  schema's `label` field uses a `|` as an editable line-break marker
  (documented in the field's `info` text in the schema itself).

## What I'd do with more time
- Move `bundle_tier.price` / `compare_at_price` from plain decimals to
  Shopify's native `money` metaobject field type for multi-currency
  correctness (see docs/metaobjects.md).
- Add an `alt_text` override field to `bundle_tier` products list so a
  merchant can write hero-specific alt text instead of reusing the product's
  catalog alt text verbatim.
- Snapshot-test the section at 375px/768px/1440px against the prototype
  screenshots to catch any sub-pixel spacing drift in `--sec-y`/padding
  values I hand-copied.

---

# Build notes — Shop grid section

## What I'd flag about the original prototype file
- Every product image is a hand-drawn inline `<svg>` embedded directly in the
  HTML (see lines ~1288-1318 for one example) — some are 30+ lines of `<path>`
  data per card. That's fine for a design mockup but means the "image" has
  no `alt` text at all (SVGs there have no `<title>`/`aria-label`), can't be
  swapped by a merchant, and can't be responsive-srcset'd. Replaced with
  `product.featured_image` throughout.
- All 8 cards hardcode `★ 4.8` and a review count with no source — every one
  of them also happens to hardcode `₹200 / ₹299 / 33% off`, i.e. every
  product in the prototype has identical pricing, which is clearly a
  placeholder pattern, not a real catalog. Flagging so nobody assumes ₹200
  flat pricing is a real requirement.
- No sold-out, missing-image, or long-title case exists in the prototype at
  all (every card is a clean happy-path). The assignment's own setup section
  (image 5) asks for exactly these three edge cases to be seeded — this
  section is where they'd actually show up, so I handled all three:
  sold out → dimmed card + disabled button + "Sold out" pill (`card--sold-out`
  class); no image → `placeholder_svg_tag` instead of a broken `<img>`;
  long title → 2-line clamp instead of pushing the price/button out of
  vertical alignment with its neighbours.

## What I changed in the code and why
- Collection-driven instead of one block per product — a deliberate scope
  decision (real Shopify data via a picker, not per-card hardcoded
  settings), not an oversight.
- Pills ("Best seller"/"New"/"Top rated") come from product **tags**, not a
  metafield. Tags are free-text and mutable by anyone with product-edit
  access without touching Admin's metafield UI.
- Rating/review count use `reviews.rating` / `reviews.rating_count`
  metafields. If Purelane already runs a reviews app (Judge.me, Loox, Yotpo),
  check its existing metafield namespace first — duplicating one would
  create two sources of truth for the same number.
- Add to cart is a real `<form action="/cart/add">` (works with JS off,
  redirects to `/cart`), progressively enhanced by a `<product-form-card>`
  custom element that does the AJAX add + dispatches a `cart:add` event. I
  did NOT wire this into Dawn's actual cart-notification/cart-drawer
  component — that file lives outside the five in-scope sections and I
  don't have its exact markup contract in front of me. Wiring against the
  real Dawn file is the obvious next step with more time; calling it out so
  it isn't mistaken for a finished cart-drawer integration.

## Reusable component extracted
- `snippets/product-card.liquid` — takes a single `product` and renders the
  full card. The Combos section (#combos) reuses the same card body inside
  each combo's "stack" of ingredient products; Bundles (#bundles) reuses it
  for tier product-preview images. Built with `pill_override` and
  `image_loading` params specifically so those callers can override
  behaviour without forking the markup.
