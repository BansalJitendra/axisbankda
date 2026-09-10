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

  // homepage "learning promo" strip: an italic <em>open</em> eyebrow paragraph,
  // a list of article links, a "Learn more" link and a promo image.
  const isLearningPromo = cols.length === 1
    && (() => {
      const cell = block.firstElementChild.firstElementChild;
      if (!cell) return false;
      const firstP = cell.querySelector(':scope > p');
      const hasEyebrow = firstP && firstP.querySelector('em')
        && /^open\b/i.test(firstP.textContent.trim());
      const hasList = !!cell.querySelector(':scope > ul');
      const hasImage = !!cell.querySelector('picture');
      return hasEyebrow && hasList && hasImage;
    })();
  if (isLearningPromo) {
    block.classList.add('columns-split-learning');
    // split the single authored cell into a text column + an image column
    const cell = block.firstElementChild.firstElementChild;
    const picP = cell.querySelector(':scope > p:has(picture)');
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
