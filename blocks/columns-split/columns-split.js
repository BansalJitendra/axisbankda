export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-split-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-split-img-col');
        }
      }
    });
  });

  // homepage "learning promo" strip: an italic <em>open</em> eyebrow (either a
  // leading paragraph or the heading itself), a list of article links, a
  // "Learn more" link and a promo image.
  const isLearningPromo = cols.length === 1
    && (() => {
      const cell = block.firstElementChild.firstElementChild;
      if (!cell) return false;
      const eyebrow = cell.querySelector(':scope > p, :scope > h2, :scope > h3');
      const hasEyebrow = eyebrow && eyebrow.querySelector('em')
        && /^open\b/i.test(eyebrow.textContent.trim());
      const hasList = !!cell.querySelector(':scope > ul');
      const hasImage = !!cell.querySelector('picture');
      return hasEyebrow && hasList && hasImage;
    })();
  if (isLearningPromo) {
    block.classList.add('columns-split-learning');
    // split the single authored cell into a text column + an image column
    const cell = block.firstElementChild.firstElementChild;
    // the promo image may be a bare <picture> or wrapped in a <p>; normalise to
    // a paragraph so it forms the right-hand media column.
    let picP = cell.querySelector(':scope > p:has(picture)');
    if (!picP) {
      const bare = cell.querySelector(':scope > picture');
      if (bare) {
        picP = document.createElement('p');
        bare.replaceWith(picP);
        picP.append(bare);
      }
    }
    const textCol = document.createElement('div');
    textCol.className = 'columns-split-learning-text';
    [...cell.children].forEach((child) => {
      if (child !== picP) textCol.append(child);
    });
    cell.prepend(textCol);
    if (picP) picP.classList.add('columns-split-learning-media');
  }

  // homepage payments + rewards band: two headings in one cell.
  const isPayments = /Payments made effortless/i.test(block.textContent)
    && /Spending made rewarding/i.test(block.textContent);
  if (isPayments) {
    block.classList.add('columns-split-payments');
    // the single authored cell holds both panels in sequence: split it at the
    // second heading ("Spending made rewarding") into a left + right panel.
    const cell = block.firstElementChild.firstElementChild;
    const headings = [...cell.querySelectorAll(':scope > h2')];
    const splitAt = headings[1];
    if (splitAt) {
      const left = document.createElement('div');
      left.className = 'columns-split-payments-left';
      const right = document.createElement('div');
      right.className = 'columns-split-payments-right';
      let target = left;
      [...cell.children].forEach((child) => {
        if (child === splitAt) target = right;
        target.append(child);
      });
      cell.append(left, right);

      // left panel woman photo: authored either as a bare <picture> or already
      // wrapped in a <p>. Normalise to a tagged paragraph so it becomes the
      // absolute bottom-anchored backdrop instead of a tall in-flow element.
      const barePic = left.querySelector(':scope > picture');
      const wrappedPic = left.querySelector(':scope > p:has(picture)');
      if (barePic) {
        const p = document.createElement('p');
        barePic.replaceWith(p);
        p.append(barePic);
        p.classList.add('columns-split-payments-woman');
      } else if (wrappedPic) {
        wrappedPic.classList.add('columns-split-payments-woman');
      }

      // right panel offer images form a rotating single-card carousel (source
      // .rewards-slider). Each offer is a picture (bare, wrapped in a <p>, or
      // linked via an <a>). Group them into a slider, drop the stray "‹›" /
      // "123" control glyphs, and add dot navigation + autoplay.
      const slides = [...right.querySelectorAll(':scope > p:has(picture), :scope > a:has(picture)')];
      const glyphs = [...right.querySelectorAll(':scope > p')]
        .filter((p) => !p.querySelector('picture') && !p.querySelector('a'));
      glyphs.forEach((p) => p.remove());
      if (slides.length > 1) {
        const slider = document.createElement('div');
        slider.className = 'columns-split-payments-slider';
        slides.forEach((p, i) => {
          if (i === 0) p.classList.add('is-active');
          slider.append(p);
        });
        right.append(slider);

        const dots = document.createElement('div');
        dots.className = 'columns-split-payments-dots';
        let current = 0;
        const show = (idx) => {
          slides[current].classList.remove('is-active');
          dots.children[current].classList.remove('is-active');
          current = (idx + slides.length) % slides.length;
          slides[current].classList.add('is-active');
          dots.children[current].classList.add('is-active');
        };
        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', `Offer ${i + 1}`);
          if (i === 0) dot.classList.add('is-active');
          dot.addEventListener('click', () => show(i));
          dots.append(dot);
        });
        right.append(dots);
        setInterval(() => show(current + 1), 4000);
      }
    }
  }

  // single-column list of links = breadcrumb pattern (but not the learning promo,
  // whose cell also carries an eyebrow, image and CTA alongside the list)
  if (cols.length === 1 && !isLearningPromo && !isPayments) {
    const onlyCell = block.firstElementChild.firstElementChild;
    const list = onlyCell && onlyCell.querySelector(':scope > ul');
    const onlyContent = onlyCell
      && [...onlyCell.children].every((el) => el === list || el.tagName === 'P');
    if (list && onlyContent
      && [...list.children].every((li) => li.querySelector('a') || li.children.length === 0)) {
      block.classList.add('columns-split-breadcrumb');
    }
  }

  // feature-list pattern: a <ul> whose items carry a title + description
  // (multiple direct <p> children, no nested list) -> render as feature cards
  block.querySelectorAll('ul').forEach((ul) => {
    const items = [...ul.children];
    if (
      items.length > 0
      && items.every((li) => li.querySelectorAll(':scope > p').length >= 2
        && !li.querySelector(':scope > ul, :scope > ol'))
    ) {
      ul.classList.add('columns-split-features');
    }
  });
}
