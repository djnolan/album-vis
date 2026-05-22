# In Bloom — Commerce Strategy Notes

Version 1.0 · Early-stage thinking, not a build spec

-----

## Overview

In Bloom has natural potential as a commerce product — the visualization is already the artifact, and physical prints and shirts are an obvious extension. This document captures early strategic thinking on how to approach that, starting with a low-risk phase one and leaving the door open for a fuller commerce build later.

-----

## The Business Model Options

### Phase 1 — Affiliate / Design Tool (recommended starting point)

Users generate their visualization, download a print-ready file, and are sent to a third-party print service to place their own order. In Bloom earns an affiliate commission on the referral. No inventory, no fulfillment, no legal exposure.

### Phase 2 — Print on Demand Storefront

In Bloom integrates directly with a POD provider, handles the order flow, and takes the margin. More revenue per order but more operational complexity and sharper legal questions around artist/album names.

### Phase 3 — Licensed or Original Content

Pursue licensing deals with artists or labels, or focus the storefront on independent/emerging artists who can give explicit permission. Cleanest legal position, highest effort.

-----

## Phase 1 in Detail — Affiliate Model

### How it works

1. User generates their visualization in the app
1. User selects a product format — square poster, vertical poster, t-shirt — and In Bloom sizes and formats the export file appropriately for that product
1. User downloads the print-ready file
1. In Bloom provides a direct affiliate link to a compatible print service where the user uploads the file and places their own order
1. In Bloom earns an affiliate commission on completed orders

### Why this works legally

The user is generating, downloading, and uploading their own file to their own account at the print service. They are placing the order under their own name. In Bloom is functioning as a design tool, not a merch seller. Whatever IP questions exist around putting an artist’s name on a product sit with the user, not the platform — the same way Canva isn’t liable for what users print.

### Affiliate programs to consider

- **Redbubble** — affiliate program available, strong for posters and shirts
- **Printful** — affiliate program available, good for higher quality POD
- **Printify** — affiliate program available
- **Zazzle** — affiliate program available, broad product range

Commissions typically run 5–15% of order value. Margins are thin but operational overhead is zero.

### What needs to be built

- Print-ready export — high resolution PNG or SVG formatted to standard print dimensions (e.g. 18×18” at 300dpi for a square poster)
- Product format selector — square poster, vertical poster, shirt — each with correct output dimensions
- Affiliate link placement — post-download screen or alongside the download button

-----

## The Legal Landscape

### What’s actually protected

Artist and band names are typically trademarked. Selling a product commercially that uses “Taylor Swift” or “Radiohead” without a license is trademark infringement regardless of whether any music or album art is reproduced.

### What the reality looks like

Unofficial band merch is a large, widely tolerated grey market. Enforcement is selective — rights holders typically pursue large-scale operations, obvious counterfeits, or high-revenue infringers. Small Etsy sellers doing modest volume rarely hear from lawyers. But they are still technically infringing — they’re betting on non-enforcement, not operating legally.

### Where In Bloom sits

The visualizations don’t reproduce album art, lyrics, or any official assets. The only connection to a specific album is text — the name. That’s a narrower exposure than a shirt with the album cover on it. But commercially selling a poster labeled “Speak Now — Taylor Swift” still trades on a trademark.

### The affiliate model avoids most of this

In phase 1, In Bloom isn’t selling anything with an artist’s name on it. The user generates the file and places their own order. This is meaningfully different from operating a merch storefront.

### If moving to phase 2

- Get a lawyer’s view before launching a direct storefront with named albums
- Consider limiting the preloaded album storefront to artists who can give explicit permission (independent artists, friends’ bands)
- Custom upload orders are cleaner — the user is asserting their own data
- Reframe marketing around the visualization as artwork, not licensed music product

-----

## Validation Signal

The affiliate model doubles as a validation mechanism. Strong click-through and conversion on affiliate links — people actually downloading files and going to print them — is the clearest possible signal that a full Phase 2 commerce build is worth pursuing.

Build Phase 1 first. Watch the data. Then decide.

-----

## Open Questions

- Which print services have the best affiliate programs and product quality for this use case?
- What are the exact print dimensions and file specs needed for the most common products (poster sizes, shirt print areas)?
- At what revenue level does it make sense to move from affiliate to direct POD integration?
- For a potential Phase 3, which artists or labels would be worth approaching for licensing conversations?
