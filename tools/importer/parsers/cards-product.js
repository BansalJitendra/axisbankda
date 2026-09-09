/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base block: cards.
 * Source: https://www.axis.bank.in/accounts/savings-account
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt — Cards, 2 columns, multiple rows):
 *   Row 1: block name (added by createBlock)
 *   Each subsequent row: [ image/icon cell , text-content cell ]
 *
 * Source has several card shapes, all handled here:
 *   - #whyChooseOurCardsSlider  -> div.basic-card.type-4 (font-icon + h2 title, NO image)
 *   - #changedCards             -> div.compare-card (image + category tags, benefits, fees, CTAs)
 *   - #BlogPostChild            -> div.basic-card.blog-card (image + meta + h3 title + desc)
 * Cards live in owl carousels or plain flex grids; owl duplicate clones (.cloned)
 * are excluded to avoid repeated rows. When a card has no image, cell 1 is left
 * empty so every row keeps the 2-column shape.
 * All selectors validated against migration-work/block-context/cards-product/source.html.
 */
export default function parse(element, { document }) {
  // Card items across the different source shapes. Exclude owl clones.
  let cards = Array.from(element.querySelectorAll('.basic-card, .compare-card'))
    .filter((c) => !c.closest('.cloned'));

  // De-duplicate nested matches (keep only outermost card wrappers).
  cards = cards.filter((c) => !cards.some((other) => other !== c && other.contains(c)));

  const cells = [];
  cards.forEach((card) => {
    // Image (with <picture> wrapper if present). Font-icon <span>s are not images.
    const img = card.querySelector('img');
    let imageCell = '';
    if (img) {
      const picture = img.closest('picture');
      imageCell = picture || img;
      // Detach so the same asset does not also appear in the text cell.
      imageCell.remove();
    }

    // Everything else in the card becomes the text content cell.
    // The card element itself (now without its image) is used directly so all
    // titles, category tags, benefit lists, fees, descriptions and CTA links
    // are preserved with their semantic markup.
    const textCell = card;

    // Skip genuinely empty cards.
    if (!imageCell && !card.textContent.trim()) return;

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
