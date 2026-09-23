# Metaobject definitions

Metaobject *definitions* live in Shopify Admin (Content → Metaobjects), not in
the theme repo, so they can't be committed as files. This doc is the source
of truth for what to create by hand (or via the Admin GraphQL API) before the
Hero section will render real data.

## `bundle_tier`

Used by: Hero section (product-stage carousel), and will be reused by the
Bundles section (`#bundles`) later — same shape of data, so one definition
serves both instead of duplicating it.

| Field name | Handle | Type | Required | Notes |
|---|---|---|---|---|
| Label | `label` | Single line text | Yes | e.g. "Any 2 products" |
| Quantity | `quantity` | Integer | Yes | 1, 2, 3, 5... |
| Products | `products` | List of references → Product | Yes | Drives the real images/titles shown |
| Price | `price` | Number (decimal) | Yes | Store as a plain decimal (e.g. `349.00`); the section multiplies by 100 and passes it through Shopify's `money` filter so it always renders in the store's currency/format |
| Compare-at price | `compare_at_price` | Number (decimal) | No | Same convention as above |
| Savings label | `savings_label` | Single line text | No | e.g. "33% off" or "Save ₹249". Left blank = the section auto-computes a "%off" from price vs compare-at |

**Why a decimal number instead of Shopify's native `money` metaobject field
type:** the native money field ties itself to the shop's presentment
currency object shape (`{amount, currency_code}`), which is the more
"correct" long-term choice if this store ever sells in multiple currencies.
I used plain decimals here to keep the Liquid simple for review; flagged in
build-notes.md as a "would change with more time."

### Records to seed for the Hero carousel (matches prototype exactly)
1. label: `Single bottle`, quantity: `1`, products: [Tap Cleaner], price: `200`, compare_at_price: `299`, savings_label: `33% off`
2. label: `Any 2 products`, quantity: `2`, products: [Tap Cleaner, Kitchen Cleaner], price: `349`, compare_at_price: `598`, savings_label: `Save ₹249`
3. label: `Any 3 products`, quantity: `3`, products: [Tap Cleaner, Metal Cleaner, Kitchen Cleaner], price: `499`, compare_at_price: `897`, savings_label: `Save ₹398`
