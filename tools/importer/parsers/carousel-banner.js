/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-banner. Base block: carousel.
 * Source: https://www.axis.bank.in/accounts/savings-account
 * Generated: 2026-09-09
 *
 * Structure (from library-description.txt — Carousel, 2 columns, multiple rows):
 *   Row 1: block name (added by createBlock)
 *   Each subsequent row: [ image cell , text cell(optional) ]
 *     - Image cell: the slide image (mandatory when present)
 *     - Text cell: title (heading), description, CTA (optional)
 *
 * Two source variants:
 *   1. #things-to-keep-slider — text-only slides: div.basic-card containing
 *      h3.card-title + p (no image).
 *   2. section.category-banner ... — image slides: div.cat-banner-wrap with a
 *      linked <picture>/<img> and no text.
 * Slides live inside .owl-item wrappers; owl clones (.cloned) are excluded.
 * All selectors validated against migration-work/block-context/carousel-banner/source.html.
 */
export default function parse(element, { document }) {
  // Real slides only — skip owl duplicate clones.
  let slides = Array.from(element.querySelectorAll('.owl-item:not(.cloned)'));

  // Fallback: if no owl markup, treat direct card/banner wrappers as slides.
  if (slides.length === 0) {
    slides = Array.from(element.querySelectorAll('.basic-card, .cat-banner-wrap, .single-banner'));
  }

  const cells = [];
  slides.forEach((slide) => {
    // Image (with its <picture> wrapper if present so <source> variants survive).
    const img = slide.querySelector('img');
    let imageCell = '';
    if (img) {
      imageCell = img.closest('picture') || img;
    }

    // Text content: heading + paragraphs (+ any CTA link that is not the image link).
    const textParts = [];
    const heading = slide.querySelector('h2, h3, h4, .card-title');
    if (heading) textParts.push(heading);
    slide.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) textParts.push(p);
    });
    // A CTA link only counts as text if it is not merely the image wrapper link.
    const link = slide.querySelector('a[href]');
    if (link && !link.querySelector('img, picture') && link.textContent.trim()) {
      textParts.push(link);
    }

    // Skip empty slides (navigation artifacts, empty owl items).
    if (!imageCell && textParts.length === 0) return;

    // Every row must have 2 cells to match the 2-column schema.
    cells.push([imageCell, textParts.length ? textParts : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-banner', cells });
  element.replaceWith(block);
}
