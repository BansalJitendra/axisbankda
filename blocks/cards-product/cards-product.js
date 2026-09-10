import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Split the (import-mangled) homepage tile text into a title + optional caption.
 * The source markdown was `#### <Title>` on one line and a caption on the next;
 * the importer collapsed them into a single string with no delimiter
 * (e.g. `#### Premium AccountFor the elite`). We strip the leading markdown
 * hashes and split on a trailing `For <word> …` caption when present.
 * NOTE: this is a defensive display fix — the real fix belongs in the importer.
 */
function splitTileText(raw) {
  const cleaned = (raw || '').replace(/^#+\s*/, '').trim();
  const m = cleaned.match(/^(.+?)(For\s+\w.*)$/);
  if (m) return { title: m[1].trim(), desc: m[2].trim() };
  return { title: cleaned, desc: '' };
}

/* Homepage "product tile" variant: a header row (heading + CTAs) followed by
 * category tiles whose only content is a single link with `#### …` markdown text.
 * Category pages never produce that markdown, so this branch is homepage-only. */
function decorateProductTiles(block, ul) {
  const items = [...ul.children];
  const isTile = (li) => {
    const a = li.querySelector('a');
    return a && /^#+\s/.test(a.textContent.trim());
  };
  if (!items.some(isTile)) return;

  block.classList.add('cards-product-tiles');

  items.forEach((li) => {
    // drop the empty leading image cell EDS left behind
    li.querySelectorAll(':scope > div:empty').forEach((d) => d.remove());

    if (isTile(li)) {
      li.classList.add('cards-product-tiles-item');
      const a = li.querySelector('a');
      const { title, desc } = splitTileText(a.textContent);
      a.textContent = '';
      a.removeAttribute('title');
      const text = document.createElement('span');
      text.className = 'cards-product-tile-text';
      const t = document.createElement('span');
      t.className = 'cards-product-tile-title';
      t.textContent = title;
      text.append(t);
      if (desc) {
        const d = document.createElement('span');
        d.className = 'cards-product-tile-desc';
        d.textContent = desc;
        text.append(d);
      }
      a.append(text);
    } else {
      // first row holds the section heading + Apply Now / Explore More CTAs
      li.classList.add('cards-product-tiles-header');
    }
  });
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-product-card-image';
      else div.className = 'cards-product-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  decorateProductTiles(block, ul);
}
