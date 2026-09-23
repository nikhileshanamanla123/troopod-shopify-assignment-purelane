# AI workflow notes — Hero section

**Delegated to AI:** first-pass porting of static CSS values (colors, clamp()
sizes, breakpoints) from the prototype into scoped section CSS; drafting the
rotator JS rewrite from per-page-global to per-section-instance; drafting the
metaobject field table.

**Where it failed / needed correction:**
- First draft of the `image_tag` call tried to pass a boolean expression
  (`forloop.first and ...`) directly as a Liquid filter argument — invalid
  syntax. Liquid can't evaluate compound booleans inline like that; had to
  hoist the condition into an `{% if %}` and branch into two explicit
  `image_tag` calls (one `eager`/`fetchpriority: high` for the LCP image, one
  `lazy` for everything else).
- Initial schema draft used a native `money` metaobject field type without
  checking that decimal math (percentage-off calculation) on a money object
  in Liquid needs `.amount` unpacking, not a bare filter chain. Downgraded to
  a documented plain decimal for this pass and left the "right" fix as a
  build note rather than shipping code I hadn't actually verified against
  Shopify's metaobject money field shape.
- Had to manually re-check that `role="img"` spans were being replaced with
  real `<img>` everywhere, not just visually matched — an AI-only pass will
  happily keep a decorative span with a background-image and call it "pixel
  accurate," which is exactly the accessibility failure mode the assignment
  is testing for.

**What I'd systematise for 20 more of these:**
- A short "prototype smell" checklist to run against every section before
  writing schema: hardcoded copy, `role="img"` spans, ids assumed unique,
  animation state pre-applied to above-fold content, inline SVG data-URIs
  that should become real assets. I hit all five just in the Hero section.
- A snippet library stub (`price-tag.liquid`, `icon-badge.liquid`) created
  *before* touching section 1, since the assignment already tells you
  (image 6, "reusable") that several sections render similar cards — waiting
  until section 3 to notice the duplication costs a refactor pass.
- A standing rule: never let AI mark a `image_tag`/loading-priority decision
  as done without stating which single image on the page is the LCP
  candidate — it's easy to lazy-load everything "for performance" and
  accidentally hurt LCP instead.
