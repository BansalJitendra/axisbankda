/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base block: accordion.
 * Source: https://www.axis.bank.in/accounts/savings-account
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt — Accordion, 2 columns, multiple rows):
 *   Row 1: block name (added by createBlock)
 *   Each subsequent row: [ title cell , content cell ]
 *
 * Source instances (#faq, #GotAnyQuerySliderParent) render FAQ items as:
 *   div.py-6...           (one accordion item)
 *     button              -> h3 (the clickable title)
 *     div.faq-content     -> the answer body (one or more <p>)
 * Items may be grouped inside tab panels (div.line-tab-content); we collect
 * every item across all panels. Load-More buttons and tab navigation are
 * excluded because we target the item wrappers directly.
 * All selectors validated against migration-work/block-context/accordion-faq/source.html.
 */
export default function parse(element, { document }) {
  // Each accordion item wrapper. Primary selector is the FAQ item card; fall
  // back to generic accordion item containers used elsewhere on the site.
  let items = Array.from(element.querySelectorAll('div.py-6'))
    .filter((it) => it.querySelector('button, h3, h4') && it.querySelector('.faq-content, p'));

  // Fallback: generic accordion structures with an explicit title/content split.
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll('.accord-inner-cont'))
      .filter((it) => it.querySelector('h2, h3, h4') && it.querySelector('p'));
  }

  // Empty-block guard.
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    // Title: the heading inside the toggle button (strip the arrow icon span).
    const titleEl = item.querySelector('button h3, button h4, button h2, h3, h4');
    // Content: the answer container, or paragraphs if no explicit wrapper.
    let contentEl = item.querySelector('.faq-content');
    if (!contentEl) {
      const paras = Array.from(item.querySelectorAll('p'));
      if (paras.length) contentEl = paras;
    }

    const titleCell = titleEl ? titleEl.textContent.trim() : '';
    const contentCell = contentEl || '';

    // Only push rows that have a title (2 cells to match the 2-column schema).
    if (titleCell) {
      cells.push([titleCell, contentCell]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
