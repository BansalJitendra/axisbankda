/**
 * Loads and decorates the footer.
 *
 * Content-first: all copy, links and images live in the footer fragment
 * (content/footer.plain.html). This block only reads that DOM and applies
 * layout — it never hardcodes footer copy.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Metadata-independent dual-fetch: /content first (localhost / aem up),
  // then root (DA/EDS production, where the fragment is served at site root).
  let resp = await fetch('/content/footer.plain.html');
  let fragmentPath = '/content/footer.plain.html';
  if (!resp.ok) {
    resp = await fetch('/footer.plain.html');
    fragmentPath = '/footer.plain.html';
  }
  if (!resp.ok) return;

  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;

  // Rebase relative image sources against the fragment location so nested
  // pages (e.g. /content/loans/home-loan) still resolve images/... correctly.
  container.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', new URL(src, new URL(fragmentPath, window.location)).href);
    }
  });

  const footer = document.createElement('div');
  footer.className = 'footer-content';

  const sections = [...container.children].filter((el) => el.tagName === 'DIV');

  // Split top-level sections into two visual bands. Sections led by an <h2>
  // form the upper (light) column band; the rest form the lower (dark) band.
  const upper = document.createElement('div');
  upper.className = 'footer-band footer-band-light';
  const upperInner = document.createElement('div');
  upperInner.className = 'footer-band-inner';
  upper.append(upperInner);

  const lower = document.createElement('div');
  lower.className = 'footer-band footer-band-dark';
  const lowerInner = document.createElement('div');
  lowerInner.className = 'footer-band-inner';
  lower.append(lowerInner);

  sections.forEach((section) => {
    section.classList.add('footer-column');
    const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
    const isPrimaryColumn = heading && heading.tagName === 'H2';

    // Tag special sub-parts for styling.
    const socialPara = [...section.querySelectorAll('p')].find(
      (p) => p.querySelectorAll('a > img').length >= 3,
    );
    if (socialPara) {
      socialPara.classList.add('footer-social');
      section.classList.add('footer-notice');
    }
    if ([...section.children].some((c) => c.tagName === 'P')
      && !heading && !section.querySelector('ul')) {
      section.classList.add('footer-notice');
    }

    (isPrimaryColumn ? upperInner : lowerInner).append(section);
  });

  if (upperInner.children.length) footer.append(upper);
  if (lowerInner.children.length) footer.append(lower);

  // Back-to-top: any link pointing at #top scrolls smoothly to the page top.
  const backToTop = footer.querySelector('a[href="#top"], a[href="#"]');
  if (backToTop && /back to top/i.test(backToTop.textContent)) {
    backToTop.classList.add('footer-back-to-top');
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Accordion setup for mobile (single-expand): every link column heading
  // toggles its own list; opening one closes the others. On desktop the CSS
  // keeps all lists visible, so this only affects the mobile view.
  const toggles = [];
  footer.querySelectorAll('.footer-column').forEach((col) => {
    const heading = col.querySelector('h2, h3');
    const list = col.querySelector('ul');
    // Only columns that actually have a link list become accordions.
    if (!heading || !list) return;
    heading.classList.add('footer-accordion-toggle');
    heading.setAttribute('role', 'button');
    heading.setAttribute('tabindex', '0');
    heading.setAttribute('aria-expanded', 'false');
    toggles.push(heading);
    const toggle = () => {
      const open = heading.getAttribute('aria-expanded') === 'true';
      toggles.forEach((h) => h.setAttribute('aria-expanded', 'false'));
      heading.setAttribute('aria-expanded', open ? 'false' : 'true');
    };
    heading.addEventListener('click', toggle);
    heading.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  block.textContent = '';
  block.append(footer);
}
