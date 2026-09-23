# Purelane — Dawn theme build

Take-home assignment: converting `purelane-homepage.html` (static prototype)
into production Shopify sections on stock Dawn.

Status: Hero section only (see `docs/build-notes.md` for what's covered).

## Structure
- `sections/section-hero.liquid` — the Hero section
- `snippets/icon-badge.liquid`, `snippets/price-tag.liquid` — shared components,
  written to be reused by later sections (Shop, Combos, Bundles)
- `assets/section-hero.css`, `assets/section-hero.js` — scoped styles/behaviour
- `docs/metaobjects.md` — metaobject definitions to create in Admin
- `docs/build-notes.md`, `docs/ai-workflow-notes.md` — per-deliverables spec
