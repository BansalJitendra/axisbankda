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

  // single-column list of links = breadcrumb pattern
  if (cols.length === 1) {
    const onlyCell = block.firstElementChild.firstElementChild;
    const list = onlyCell && onlyCell.querySelector(':scope > ul');
    if (list && [...list.children].every((li) => li.querySelector('a') || li.children.length === 0)) {
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
