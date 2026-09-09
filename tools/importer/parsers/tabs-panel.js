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

  // --- Shape 0: homepage learning banner ---
  // Tab labels live in a sibling `ul.banner-tabs` and the content panels
  // (`.global-tab-content.banner-tab-card`) are the direct children of this
  // `.banner-tab-wrap`. Pair them positionally. This shape is homepage-specific
  // (those class names exist nowhere else) so it never affects other templates.
  const isBannerWrap = element.classList
    && (element.classList.contains('banner-tab-wrap')
      || element.querySelector(':scope > .global-tab-content.banner-tab-card'));
  if (isBannerWrap) {
    const labelList = element.parentElement
      && element.parentElement.querySelector('.banner-tabs');
    const labels = labelList
      ? Array.from(labelList.querySelectorAll(':scope > li')).map((li) => li.textContent.trim())
      : [];
    const panels = Array.from(element.querySelectorAll(':scope > .global-tab-content'));
    panels.forEach((panel, i) => {
      if (!panel.textContent.trim()) return;
      cells.push([labels[i] || `Tab ${i + 1}`, panel]);
    });
    if (cells.length > 0) {
      // Labels are now carried by the block; drop the now-redundant nav list.
      if (labelList) labelList.remove();
      const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-panel', cells });
      // The tab wrap is nested inside the hero banner section (#hm-banner) that a
      // later parser (hero-promo) will `replaceWith`. Relocate this block to be a
      // sibling AFTER that section so it is not consumed/detached, then remove the
      // now-emptied wrap in place.
      const hostSection = element.closest('section') || element.parentElement;
      if (hostSection && hostSection.parentNode) {
        hostSection.after(block);
        element.remove();
      } else {
        element.replaceWith(block);
      }
      return;
    }
  }

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
