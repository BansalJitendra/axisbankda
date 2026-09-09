/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-split. Base block: columns.
 * Source: https://www.axis.bank.in/accounts/savings-account
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt — Columns, flexible columns/rows):
 *   Row 1: block name (added by createBlock)
 *   Optional heading row (single spanning cell) for a section title/description.
 *   One content row whose cells are the natural side-by-side column groups.
 *
 * Source instances are varied side-by-side sections:
 *   - section.breadcrumb-wrap        -> breadcrumb nav (single column)
 *   - #offers / rewards panels        -> heading + offer/reward columns
 *   - #open-by-axis-bank              -> mobile image column + feature list column
 *   - #do-dont                        -> "Do's" column + "Don'ts" column + image
 *   - section.long-form               -> long-form copy
 * The parser finds an explicit multi-column wrapper and uses its direct children
 * as columns; otherwise it emits a single content column. All rows keep the same
 * column count. Selectors validated against
 * migration-work/block-context/columns-split/source.html.
 */
export default function parse(element, { document }) {
  // Preserve any already-emitted nested block tables (from earlier parsers, e.g.
  // a cards-product listing nested inside this container). Detach them so this
  // parser's cell extraction / replaceWith does not swallow or destroy them; they
  // are re-inserted as siblings after the columns-split block below.
  const nestedBlocks = Array.from(element.querySelectorAll('table'));
  nestedBlocks.forEach((t) => t.remove());

  const content = element.querySelector(':scope > .container') || element;

  // Section-level heading / intro that should sit above the columns (optional).
  const headingParts = [];
  const heading = content.querySelector(':scope > h1, :scope > h2, :scope > .section-heading, :scope > .contWrap > h2, :scope > .headingwrap > h2');
  if (heading) headingParts.push(heading);
  const intro = content.querySelector(':scope > p.section-desc, :scope > .contWrap > p, :scope > p.digi-desc');
  if (intro) headingParts.push(intro);

  // Known multi-column wrappers (ordered by specificity). The first that yields
  // 2+ element children defines the columns.
  const wrapperSelectors = [
    '.do-dont-wrapper',
    '.digi-wrapper',
    '.payments-wrapper',
    '.reward-list',
    '[class*="wrapper"]',
    '[class*="-wrap"]',
  ];

  let columnEls = [];
  for (const sel of wrapperSelectors) {
    const wrapper = content.querySelector(sel);
    if (wrapper) {
      const children = Array.from(wrapper.children).filter((c) => c.textContent.trim() || c.querySelector('img'));
      if (children.length >= 2) {
        columnEls = children;
        break;
      }
    }
  }

  const cells = [];

  if (columnEls.length >= 2) {
    // Optional heading row spanning all columns.
    if (headingParts.length) {
      const headingRow = new Array(columnEls.length).fill('');
      headingRow[0] = headingParts;
      cells.push(headingRow);
    }
    // Column row: one cell per detected column.
    cells.push(columnEls.map((el) => el));
  } else {
    // Single-column fallback: preserve all content in one cell.
    const single = [];
    if (headingParts.length) single.push(...headingParts);
    // Remaining content: everything under `content` except what we already pulled
    // as heading. Use direct children so the whole section is preserved.
    Array.from(content.children).forEach((child) => {
      if (headingParts.includes(child)) return;
      if (!(child.textContent.trim() || child.querySelector('img'))) return;
      // Unwrap semantic wrappers (e.g. <nav> around a breadcrumb <ul>) that the
      // markdown converter would otherwise render as an empty cell.
      if (child.tagName === 'NAV') {
        const inner = Array.from(child.children).filter((c) => c.textContent.trim() || c.querySelector('img'));
        single.push(...(inner.length ? inner : [child]));
      } else {
        single.push(child);
      }
    });
    if (single.length === 0) {
      element.replaceWith(...nestedBlocks, ...element.childNodes);
      return;
    }
    cells.push([single]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split', cells });
  element.replaceWith(block);
  // Re-insert preserved nested block tables as siblings after this block.
  nestedBlocks.forEach((t) => block.after(t));
}
