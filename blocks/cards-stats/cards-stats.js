/*
 * cards-stats — CSR impact / achievement counter band (homepage only).
 * Variant of the vanilla "cards" block for a small set of headline statistics.
 *
 * Authored structure (one row per stat, two cells each):
 *   | 2.05M+ | Households Across India       |
 *   | 100Cr+ | National Cancer Grid (NCG)    |
 *   | 3.27M+ | Trees Planted                 |
 *
 * The first cell of each row is the (large) figure, the second is its label.
 *
 * On the source (axis.bank.in, section.progress .bg-progress) the heading,
 * subtext, the three stat cards and the "Know More" link all live INSIDE one
 * burgundy-gradient band (left content column) with a photo bleeding on the
 * right. In the imported content those pieces landed in separate sibling
 * wrappers (heading/subtext before the block, Know More + photo after it), so
 * here we hoist those siblings into the block to rebuild the single cohesive
 * band that matches the source. cards-stats is homepage-only, so this
 * restructuring can never affect another page.
 */

function buildStatsList(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cells = [...row.children];
    const value = cells[0];
    const label = cells[1];
    if (value) {
      value.className = 'cards-stats-value';
      li.append(value);
    }
    if (label) {
      label.className = 'cards-stats-label';
      li.append(label);
    }
    // If an author only supplied a single cell, keep it as the value.
    if (!value && !label && cells.length) {
      cells[0].className = 'cards-stats-value';
      li.append(cells[0]);
    }
    ul.append(li);
  });
  return ul;
}

/*
 * Pull the CSR heading/subtext (preceding sibling) and the Know More link +
 * photo (following sibling) into the block so it renders as one burgundy band.
 * Runs only when the surrounding content matches the CSR pattern, and is a
 * no-op otherwise, so a bare stats block anywhere else stays untouched.
 */
function assembleCsrBand(block, ul) {
  const wrapper = block.closest('.cards-stats-wrapper') || block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  const next = wrapper && wrapper.nextElementSibling;

  const heading = prev && prev.querySelector('h1, h2, h3');
  const isCsr = heading && /progress of all/i.test(heading.textContent);
  if (!isCsr) {
    block.textContent = '';
    block.append(ul);
    return;
  }

  block.classList.add('cards-stats-csr');

  const content = document.createElement('div');
  content.className = 'cards-stats-content';

  // Heading + subtext from the preceding default-content wrapper.
  const head = document.createElement('div');
  head.className = 'cards-stats-head';
  while (prev.firstElementChild) head.append(prev.firstElementChild);
  content.append(head);

  content.append(ul);

  // Know More link + decorative photo from the following wrapper.
  const media = document.createElement('div');
  media.className = 'cards-stats-media';
  if (next) {
    const cta = next.querySelector('p:has(a), a');
    const ctaLink = next.querySelector('a');
    if (ctaLink) {
      const ctaWrap = document.createElement('div');
      ctaWrap.className = 'cards-stats-cta';
      ctaWrap.append(cta && cta.tagName === 'P' ? cta : ctaLink);
      content.append(ctaWrap);
    }
    const pic = next.querySelector('picture');
    if (pic) {
      const p = pic.closest('p') || pic;
      media.append(p);
    }
  }

  block.textContent = '';
  block.append(content);
  if (media.childElementCount) block.append(media);

  // Remove the now-empty sibling wrappers so the band reads as one unit.
  if (prev && !prev.childElementCount) prev.remove();
  if (next && !next.childElementCount) next.remove();
}

export default function decorate(block) {
  const ul = buildStatsList(block);
  assembleCsrBand(block, ul);
}
