// Rotating words for the homepage top hero headline (source: axis.bank.in #hm-banner).
const HERO_ROTATING_WORDS = ['financial growth', 'aspirations', 'life goals', 'progress'];

// Wrap a leading "open" so it renders burgundy/italic/bold like the source hero.
function wrapLeadingOpen(str) {
  return str.replace(/^(\s*)open\b/i, '$1<span class="hero-promo-open">open</span>');
}

/**
 * The homepage hero headline arrives as a single run-on text node, e.g.
 * "open to your financial growthaspirationslife goalsprogressfinancial growth"
 * because the source rotates the last word through several inline spans.
 * Rebuild it as a clean two-line headline with a single rotating word so it no
 * longer renders as a concatenated string. Scoped by the run-on signature, so
 * only this specific hero is ever touched.
 */
function fixRotatingHeadline(block) {
  const heading = block.querySelector('h1, h2, h3');
  if (!heading) return;
  if (!/growthaspirations|goalsprogress/i.test(heading.textContent)) return;

  const firstLine = heading.innerHTML.split(/<br\s*\/?>/i)[0].trim();
  heading.innerHTML = `${wrapLeadingOpen(firstLine)}<br>`
    + '<span class="hero-promo-open">open</span> to your '
    + '<span class="hero-promo-rotator">'
    + `<span class="hero-promo-rotator-word">${HERO_ROTATING_WORDS[0]}</span>`
    + '</span>';

  const wordEl = heading.querySelector('.hero-promo-rotator-word');
  if (!wordEl || HERO_ROTATING_WORDS.length < 2) return;
  let index = 0;
  setInterval(() => {
    index = (index + 1) % HERO_ROTATING_WORDS.length;
    wordEl.textContent = HERO_ROTATING_WORDS[index];
  }, 2500);
}

export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows.find((row) => row.querySelector('picture'));

  if (imageRow) {
    imageRow.classList.add('hero-promo-image');
    rows
      .filter((row) => row !== imageRow)
      .forEach((row) => row.classList.add('hero-promo-content'));
  } else {
    block.classList.add('no-image');
    rows.forEach((row) => row.classList.add('hero-promo-content'));
  }

  fixRotatingHeadline(block);
}
