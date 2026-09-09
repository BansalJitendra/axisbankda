I'll help plan this migration. Before I build out the full plan, let me clarify a couple of key points that will shape the scope significantly.# Axis Bank Site Migration Plan (Selected Pages → AEM Edge Delivery Services)

## Objective
Migrate a small set of representative pages from `https://www.axis.bank.in/` into AEM Edge Delivery Services (EDS), establishing reusable migration infrastructure (parsers, transformers, block variants, design system) that can later be scaled to the full site.

## Scope
- **Source site:** `https://www.axis.bank.in/` (used as provided)
- **Coverage:** A few key pages — homepage plus a small number of representative page types (to be confirmed once the site is reachable and templates are surveyed)
- **Not in scope (this pass):** Full-site crawl, all product/landing pages, forms conversion, commerce PDP/PLP flows

## Assumptions & Open Items
- The source URL is assumed reachable; if `axis.bank.in` does not resolve or blocks scraping, I'll flag it before proceeding and confirm an alternate.
- Project type (doc / da / xwalk) and the project-specific Block Library endpoint will be determined during setup.
- "A few key pages" is treated as: **1 homepage + up to 3 additional representative pages**. Exact URLs confirmed after an initial site look.

## Checklist

### Phase 0 — Setup & Verification
- [ ] Confirm source site `https://www.axis.bank.in/` is reachable and scrapeable
- [ ] Determine project properties (project type: doc/da/xwalk) and the project-specific Block Library endpoint
- [ ] Survey the available EDS block palette for this project (block inventory)

### Phase 1 — Page Selection
- [ ] Take an initial look at the site to identify candidate key pages
- [ ] Confirm the final short list of pages to migrate (homepage + up to 3 others)

### Phase 2 — Content Analysis (per selected page)
- [ ] Scrape each page: extract content, metadata, and download images
- [ ] Identify page structure — section boundaries and content sequences
- [ ] Determine authoring approach per sequence (default content vs blocks)
- [ ] Select/validate block variants; note any new variants needed

### Phase 3 — Import Infrastructure
- [ ] Create/update page templates and block mappings (DOM selectors per variant)
- [ ] Generate block parsers for each variant
- [ ] Generate page transformers (cleanup, sections, media handling)
- [ ] Build the bundled import script

### Phase 4 — Content Import
- [ ] Run the bulk import to generate HTML content for the selected pages
- [ ] Verify generated content files exist and are well-formed

### Phase 5 — Design Migration
- [ ] Extract site-level design tokens (colors, typography, spacing) from source
- [ ] Style the migrated blocks to match the original (per-block visual design)

### Phase 6 — Navigation & Footer
- [ ] Migrate the header/navigation from the source site
- [ ] Migrate the footer from the source site

### Phase 7 — Validation & QA
- [ ] Preview imported pages in the local dev server
- [ ] Visual critique: compare each migrated page against the original and fix divergences
- [ ] Post-import validation scoring (content completeness source vs output)

### Phase 8 — Handoff
- [ ] Summarize what was migrated, known gaps, and next steps for scaling to the full site

## Notes
- This plan builds reusable infrastructure so scaling from "a few key pages" to more page types later is incremental, not a restart.
- **Execution requires Execute mode** — this artifact is the plan; no files will be created or modified while in plan mode.

---

One thing worth flagging: there are optional plugins available that could improve this migration — **project-management** (for handover docs at Phase 8), and, if any selected pages turn out to be product/listing or form pages, **excat-commerce** and **forms-excat**. Would you like me to enable any of these before we start? I won't change any settings until you confirm.
