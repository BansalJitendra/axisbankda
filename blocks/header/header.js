// Axis Bank header/nav — content-first, data-driven. All copy/links/images come
// from content/nav.plain.html; this module only reads that DOM and adds behavior.

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Metadata-independent dual-fetch: /content first (localhost / aem up),
 * then site root (DA/EDS production). Fixed paths only — no metadata lookup.
 */
async function fetchNavFragment() {
  let base = '/content/';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return null;
  const text = await resp.text();
  const tpl = document.createElement('div');
  tpl.innerHTML = text;
  // Resolve fragment-relative image paths against the fragment's own base dir,
  // so images resolve correctly regardless of the current page path.
  tpl.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', base + src);
    }
  });
  return tpl;
}

/** Close every open megamenu panel. */
function closeAllPanels(navList) {
  navList.querySelectorAll(':scope > li[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

/** Build the burgundy top bar (persona tabs, logo, search, utility, CTAs) from section 1. */
function buildTopBar(section) {
  section.classList.add('nav-brand');
  const lists = [...section.querySelectorAll(':scope > ul')];
  const logoP = section.querySelector(':scope > p');
  if (logoP) logoP.classList.add('nav-logo');

  // lists[0] = persona tabs, lists[1] = utility/CTA links, lists[2] = language options
  const [personas, utility, languages] = lists;
  if (personas) personas.classList.add('nav-personas');
  if (utility) utility.classList.add('nav-utility');

  // Build the search form (form controls belong in JS, not the fragment).
  const search = document.createElement('form');
  search.className = 'nav-search';
  search.setAttribute('role', 'search');
  search.innerHTML = '<span class="nav-search-icon" aria-hidden="true"></span>'
    + '<input type="search" aria-label="Search" placeholder="What are you looking for today?">'
    + '<button type="button" class="nav-search-mic" aria-label="Voice search"></button>';
  search.addEventListener('submit', (e) => e.preventDefault());

  // Build the language dropdown from the language <ul> content (read, don't invent).
  let localeWrap = null;
  if (languages) {
    languages.classList.add('nav-locale');
    localeWrap = document.createElement('div');
    localeWrap.className = 'nav-locale-wrap';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-locale-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    const current = languages.querySelector('a');
    trigger.textContent = current ? current.textContent : 'Eng';
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    languages.before(localeWrap);
    localeWrap.append(trigger, languages);
  }

  // Reorder for desktop rows: row A = personas + utility + locale; row B = logo + search + CTAs.
  const rowA = document.createElement('div');
  rowA.className = 'nav-utility-row';
  const rowB = document.createElement('div');
  rowB.className = 'nav-main-row';

  if (personas) rowA.append(personas);
  if (utility) rowA.append(utility);
  if (localeWrap) rowA.append(localeWrap);

  if (logoP) rowB.append(logoP);
  rowB.append(search);

  section.textContent = '';
  section.append(rowA, rowB);
}

/**
 * Build the megamenu nav (section 2). Each top-level <li> becomes a megamenu
 * trigger; its nested <ul> is a tabbed panel (left rail of tabs + per-tab
 * content) with featured promo cards. Generic — reads structure from the DOM.
 */
function buildNav(section) {
  section.classList.add('nav-sections');
  const topList = section.querySelector(':scope > ul');
  if (!topList) return;
  topList.classList.add('nav-list');

  [...topList.children].forEach((li) => {
    // The li holds: <a> trigger, <ul> tab list (panel), and optionally a
    // second <ul> of per-panel footer quick-links.
    const directLists = [...li.children].filter((c) => c.tagName === 'UL');
    const panel = directLists[0];
    if (!panel) return;
    const footerList = directLists[1] || null;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');
    // 'nav-submenu' marks this as an expandable sub-panel (accordion semantics).
    panel.classList.add('nav-panel', 'nav-submenu');

    // Tabs are the LI children of the panel list.
    const tabItems = [...panel.children].filter((c) => c.tagName === 'LI');
    const rail = document.createElement('ul');
    rail.className = 'nav-tab-rail';
    const content = document.createElement('div');
    content.className = 'nav-tab-content';

    tabItems.forEach((tabLi, i) => {
      const tabLink = tabLi.querySelector(':scope > a');
      const subList = tabLi.querySelector(':scope > ul');
      // Children after the sub-list: an optional filter-chip <p> (comes before any
      // <h4>), section-label <h3> headings, then the featured card (<h4> + <p>s).
      const kids = [...tabLi.children];
      const h4Index = kids.findIndex((c) => c.tagName === 'H4');
      const groupHeadings = kids.filter((c) => c.tagName === 'H3');
      const filterRow = kids.find((c, idx) => c.tagName === 'P'
        && c !== tabLink && (h4Index === -1 || idx < h4Index) && c.querySelector('img') === null && c.querySelector('a') === null);
      const featuredParts = h4Index === -1 ? [] : kids.slice(h4Index).filter((c) => /^(H4|P)$/.test(c.tagName));

      // Rail entry
      const railLi = document.createElement('li');
      railLi.className = 'nav-tab';
      if (i === 0) railLi.classList.add('active');
      const railBtn = document.createElement('button');
      railBtn.type = 'button';
      railBtn.textContent = tabLink ? tabLink.textContent : `Tab ${i + 1}`;
      railLi.append(railBtn);
      rail.append(railLi);

      // Pane
      const pane = document.createElement('div');
      pane.className = 'nav-pane';
      if (i === 0) pane.classList.add('active');
      const grid = document.createElement('div');
      grid.className = 'nav-pane-grid';
      if (tabLink) {
        const head = document.createElement('a');
        head.className = 'nav-pane-title';
        head.href = tabLink.href;
        head.textContent = tabLink.textContent;
        grid.append(head);
      }
      if (filterRow) {
        filterRow.classList.add('nav-filter-row');
        grid.append(filterRow);
      }
      if (subList) {
        subList.classList.add('nav-links');
        // Source renders each panel link's label as a card title (<p class="card-title">).
        // Mirror that semantic so titles are exposed as titled elements, not bare links.
        subList.querySelectorAll(':scope > li > a').forEach((a) => a.classList.add('nav-card-title'));
        grid.append(subList);
      }
      groupHeadings.forEach((h) => {
        h.classList.add('nav-group-heading');
        grid.append(h);
      });
      pane.append(grid);

      if (featuredParts.length) {
        const card = document.createElement('div');
        card.className = 'nav-featured';
        // Split into a text sub-card (heading + copy) and a media sub-card
        // (image + CTA), mirroring the source's stacked featured blocks.
        const textCard = document.createElement('div');
        textCard.className = 'nav-featured-text';
        const mediaCard = document.createElement('div');
        mediaCard.className = 'nav-featured-media';
        const ctaCard = document.createElement('div');
        ctaCard.className = 'nav-featured-cta';
        featuredParts.forEach((p) => {
          if (p.querySelector('img')) mediaCard.append(p);
          else if (p.querySelector('a')) ctaCard.append(p);
          else textCard.append(p);
        });
        if (textCard.childElementCount) card.append(textCard);
        if (mediaCard.childElementCount) card.append(mediaCard);
        if (ctaCard.childElementCount) card.append(ctaCard);
        pane.append(card);
      } else {
        // No featured card: let the link-card grid fill the full panel width so
        // the layout stays balanced (matches source panels that have no promo).
        pane.classList.add('nav-pane-full');
      }
      content.append(pane);

      // Tab activation (hover + click) — desktop switches panes on hover.
      const activate = () => {
        rail.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
        content.querySelectorAll('.nav-pane').forEach((p) => p.classList.remove('active'));
        railLi.classList.add('active');
        pane.classList.add('active');
      };
      railBtn.addEventListener('mouseenter', () => { if (isDesktop.matches) activate(); });
      railBtn.addEventListener('click', (e) => { e.preventDefault(); activate(); });
    });

    // Rebuild panel: rail + content (+ per-panel footer bar if present)
    panel.textContent = '';
    panel.append(rail, content);
    if (footerList) {
      footerList.classList.add('nav-panel-footer');
      panel.append(footerList);
    }
  });

  // Desktop: open on hover of the trigger li. Mobile: click toggles (handled below).
  [...topList.children].forEach((li) => {
    const trigger = li.querySelector(':scope > a');
    li.addEventListener('mouseenter', () => {
      if (isDesktop.matches) { closeAllPanels(topList); li.setAttribute('aria-expanded', 'true'); }
    });
    li.addEventListener('mouseleave', () => {
      if (isDesktop.matches) li.setAttribute('aria-expanded', 'false');
    });
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (!isDesktop.matches && li.classList.contains('nav-drop')) {
          e.preventDefault();
          const open = li.getAttribute('aria-expanded') === 'true';
          closeAllPanels(topList);
          li.setAttribute('aria-expanded', open ? 'false' : 'true');
        }
      });
    }
  });
}

/** Toggle the mobile drawer open/closed and morph the hamburger. */
function toggleMenu(nav, forceClosed = null) {
  const expanded = forceClosed !== null ? forceClosed : nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/** Reset state when crossing the desktop/mobile boundary. */
function handleViewportChange(nav) {
  const topList = nav.querySelector('.nav-list');
  if (isDesktop.matches) {
    // returning to desktop: close mobile drawer + reset hamburger + collapse panels
    nav.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = '';
    if (topList) closeAllPanels(topList);
  } else if (topList) {
    // going to mobile: collapse any hover-open desktop panels
    closeAllPanels(topList);
  }
}

export default async function decorate(block) {
  const fragment = await fetchNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const sections = [...nav.children];
  if (sections[0]) buildTopBar(sections[0]);
  if (sections[1]) buildNav(sections[1]);

  // Hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-label="Open navigation">'
    + '<span class="nav-hamburger-icon"></span></button>';
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);

  // Close panels on Escape.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      const topList = nav.querySelector('.nav-list');
      if (topList) closeAllPanels(topList);
      if (!isDesktop.matches) toggleMenu(nav, true);
    }
  });

  isDesktop.addEventListener('change', () => handleViewportChange(nav));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
