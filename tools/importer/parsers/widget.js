/* eslint-disable */
/* global WebImporter */
/**
 * Parser for widget. Custom block (no block-library convention — structure
 * inferred from source HTML).
 * Source: https://www.axis.bank.in/accounts/savings-account
 * Generated: 2026-09-09
 *
 * The "widget" instances are interactive, JS-driven tools (account/card finders,
 * calculators, EMI/SIP tools): #cardFinder1, #all_account, #allCards, #calculator,
 * #siploan, #emiloan, #salary. Their live UI (filters, sliders, tab panels, modals)
 * is not authorable static content and would produce noisy markdown. The authorable
 * essence of each is its section heading and its introductory description.
 *
 * Inferred structure (single column):
 *   Row 1: block name (added by createBlock)
 *   Row 2: heading + intro description in one cell.
 *
 * All selectors validated against migration-work/block-context/widget/source.html.
 */
export default function parse(element, { document }) {
  // Preserve any already-emitted nested block tables (created by earlier parsers,
  // e.g. a cards-product listing nested inside a finder widget). Detach them now
  // so this parser's replaceWith() does not destroy them; they are re-inserted as
  // siblings after the widget block below.
  const nestedBlocks = Array.from(element.querySelectorAll('table'));
  nestedBlocks.forEach((t) => t.remove());

  // Section heading (the human-authored title of the widget).
  const heading = element.querySelector(':scope > .container > h2, :scope h2.section-heading, h2, h3, .section-heading');

  // Introductory description sitting near the heading (calculator/finder intro).
  // Prefer explicit description classes; fall back to the first meaningful paragraph.
  let description = element.querySelector('.section-desc, .calc-sec-wrapper > p, p.filter-text');
  if (!description) {
    description = Array.from(element.querySelectorAll('p'))
      .find((p) => p.textContent.trim().length > 20) || null;
  }

  // Empty-block guard: nothing authorable to keep. Still preserve any nested
  // block tables detached above by re-inserting them in place of the element.
  if (!heading && !description) {
    element.replaceWith(...nestedBlocks, ...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);

  // Some widgets (e.g. the homepage calculators hub #goodCalculationTabs) bundle
  // several sub-tools, each opening with its own authorable title + intro
  // paragraph inside a tab panel. Capture every such title/description so this
  // static, human-authored copy is not dropped. Restricted to clean text classes
  // (`.calc-title`, `.section-desc`) so interactive slider/numeric noise stays out.
  // Skip nodes already captured as the primary heading/description above.
  const extraSelectors = '.line-tab-content .calc-title, .line-tab-content .section-desc, .card-tab-wrap .calc-title, .card-tab-wrap .section-desc';
  const seen = new Set([heading, description]);
  Array.from(element.querySelectorAll(extraSelectors)).forEach((node) => {
    if (seen.has(node) || !node.textContent.trim()) return;
    seen.add(node);
    contentCell.push(node);
  });

  // Single-column block: one row, one cell holding heading + description(s).
  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'widget', cells });
  element.replaceWith(block);
  // Re-insert preserved nested block tables as siblings after the widget block.
  nestedBlocks.forEach((t) => block.after(t));
}
