/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-panel. Base block: tabs.
 * Source: https://www.axis.bank.in/accounts/savings-account
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt — Tabs, 2 columns, multiple rows):
 *   Row 1: block name (added by createBlock)
 *   Each subsequent row: [ tab label cell , tab content cell ]
 *
 * Two source shapes:
 *   1. #eligibility-documentation — explicit vertical tab links `a[id^="tab-"]`
 *      (e.g. #tab-equityfunds) whose target panel is the id with the "tab-"
 *      prefix removed (#equityfunds, an .accord-inner-cont). Labels carry text.
 *   2. #banking-program — no visible tab nav; one or more `.global-tab-content`
 *      panels each opening with its own heading. The heading becomes the label
 *      and the remaining panel content becomes the tab body.
 * Selectors validated against migration-work/block-context/tabs-panel/source.html.
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Shape 1: explicit tab links mapping to panels by id ---
  const tabLinks = Array.from(element.querySelectorAll('a[id^="tab-"], .tab-link[href^="#"], .line-tab-link[href^="#"], [data-target^="#"]'));
  const usedPanels = new Set();
  tabLinks.forEach((link) => {
    const label = link.textContent.trim();
    if (!label) return;
    // Resolve target panel id.
    let targetId = '';
    const href = link.getAttribute('href') || link.getAttribute('data-target') || '';
    if (href.startsWith('#') && href.length > 1) {
      targetId = href.slice(1);
    } else if ((link.id || '').startsWith('tab-')) {
      targetId = link.id.slice(4);
    }
    if (!targetId) return;
    const panel = element.querySelector(`#${CSS.escape(targetId)}`);
    if (!panel || usedPanels.has(panel)) return;
    usedPanels.add(panel);
    cells.push([label, panel]);
  });

  // --- Shape 2 (fallback): panels whose first heading is the label ---
  if (cells.length === 0) {
    const panels = Array.from(element.querySelectorAll('.global-tab-content, .line-tab-content'))
      // Keep only outermost panels (some panels nest a child tab wrap).
      .filter((p, _i, arr) => !arr.some((o) => o !== p && o.contains(p)));

    panels.forEach((panel) => {
      const heading = panel.querySelector('h1, h2, h3, h4, .section-heading, .title-cont');
      const label = heading ? heading.textContent.trim() : '';
      if (heading) heading.remove();
      const content = panel;
      if (!label && !content.textContent.trim()) return;
      cells.push([label || 'Tab', content]);
    });
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-panel', cells });
  element.replaceWith(block);
}
