/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stats. Base block: cards.
 * Source: https://www.axis.bank.in/  ("open to the progress of all" CSR impact counters, #counter)
 * Generated: 2026-09-09
 *
 * New CUSTOM variant — an accent full-bleed "impact counters" row of animated
 * count-up statistics. No images: each stat is a big figure + unit and a
 * descriptive label.
 *
 * Row/cell structure — AUTHORITATIVE SOURCE is this repo's block implementation
 * blocks/cards-stats/cards-stats.js decorate(), NOT the generic base "Cards"
 * library convention. decorate() reads TWO cells per row:
 *     cells[0] -> .cards-stats-value  (the large figure)
 *     cells[1] -> .cards-stats-label  (its supporting label)
 * A 1-column ("no images") table would strand the label, so this variant emits
 * a 2-column table:
 *   Row 1: block name (added by createBlock)
 *   Each subsequent row: [ figure/number cell , label cell ]
 *
 * Source shape (validated against migration-work/block-context/cards-stats/source.html):
 *   #counter.progress-list
 *     > div.progress-card
 *         > span.data.count[.million|.cr-1|...]  -> raw figure ("2.05", "100", "3.27")
 *         > p.desc                               -> label ("Households Across India", ...)
 * The displayed unit ("M+", "Cr+") is encoded in the count span's CSS class on the
 * live site (its animated count-up appends it), so the raw span text alone omits it.
 * We rebuild the full figure text from those class tokens so the authored value
 * matches what the source renders. Unknown/absent unit classes fall back to the
 * raw number text.
 */
export default function parse(element, { document }) {
  // Map the count span's unit class token to its displayed suffix.
  const unitSuffix = (span) => {
    const cls = span.className.toLowerCase();
    if (/\bmillion\b/.test(cls)) return 'M+';
    if (/\bbillion\b/.test(cls)) return 'B+';
    if (/\bcr(-\d+)?\b/.test(cls) || /\bcrore\b/.test(cls)) return 'Cr+';
    if (/\blakh\b|\blac\b/.test(cls)) return 'L+';
    if (/\bthousand\b|\bk\b/.test(cls)) return 'K+';
    if (/\bpercent\b/.test(cls)) return '%';
    if (/\bplus\b/.test(cls)) return '+';
    return '';
  };

  // Each stat card. Exclude any owl carousel clones defensively.
  const cards = Array.from(element.querySelectorAll('.progress-card, .progress-item, .counter-item'))
    .filter((c) => !c.closest('.cloned'));

  const cells = [];
  cards.forEach((card) => {
    // Figure: the count span (raw number) + its unit suffix derived from class.
    const numberEl = card.querySelector('span.data.count, .data.count, span.count, [class*="count"]');
    // Label: the description paragraph.
    const labelEl = card.querySelector('p.desc, .desc, p');

    let valueCell = '';
    if (numberEl) {
      const raw = numberEl.textContent.trim();
      const suffix = unitSuffix(numberEl);
      const figure = document.createElement('p');
      figure.textContent = suffix ? `${raw}${suffix}` : raw;
      valueCell = figure;
    }

    const labelCell = labelEl || '';

    // Skip a card with neither a figure nor a label.
    if (!valueCell && !labelCell) return;

    // Keep every row at 2 cells so the block table stays well-formed.
    cells.push([valueCell, labelCell]);
  });

  // Empty-block guard: unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
