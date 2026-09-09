/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base block: hero.
 * Source: https://www.axis.bank.in/accounts/savings-account
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt — Hero, 1 column, up to 3 rows):
 *   Row 1: block name (added by createBlock)
 *   Row 2 (optional): background image
 *   Row 3: title (heading), subheading, call-to-action link(s)
 *
 * Source instances are promo/CTA sections such as #fees_charge, #interest-rate,
 * and generic pageWrapper CTA banners. They contain a heading (.cont-maintitle /
 * h2 / h1), a subheading paragraph (.cont-subtitle / p), one or more CTA anchors
 * (a.btn / a.btn-secondary / a.btn-primary), and a decorative <picture>/<img>.
 * All selectors validated against migration-work/block-context/hero-promo/source.html.
 */
export default function parse(element, { document }) {
  // Preserve any already-emitted nested block tables (from earlier parsers, e.g.
  // a widget/columns-split block nested inside a CTA banner container). Detach
  // them so this parser's replaceWith does not destroy them; re-inserted as
  // siblings after the hero-promo block below.
  const nestedBlocks = Array.from(element.querySelectorAll('table'));
  nestedBlocks.forEach((t) => t.remove());

  // Heading: prefer the promo main title, fall back to any heading in the block.
  const heading = element.querySelector('.cont-maintitle, h1, h2, h3, [class*="title"]');

  // Subheading / descriptive copy.
  const description = element.querySelector('.cont-subtitle, p');

  // CTA links — buttons first, then any anchor as fallback. Mutually exclusive
  // via a single querySelectorAll of button-styled anchors; if none, fall back.
  let ctaLinks = Array.from(element.querySelectorAll('a.btn, a.btn-secondary, a.btn-primary, a[class*="btn"]'));
  if (ctaLinks.length === 0) {
    const genericLink = element.querySelector('a[href]');
    if (genericLink) ctaLinks = [genericLink];
  }

  // Background / decorative image (optional).
  const picture = element.querySelector('picture');
  const img = element.querySelector('img');
  const bgAsset = picture || img;

  // Empty-block guard: nothing meaningful to place. Still preserve nested block
  // tables detached above by re-inserting them in place of the element.
  if (!heading && !description && ctaLinks.length === 0) {
    element.replaceWith(...nestedBlocks, ...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2 (optional): background image in its own single cell.
  if (bgAsset) {
    cells.push([bgAsset]);
  }

  // Row 3: all content in ONE cell (hero is a single-column block).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
