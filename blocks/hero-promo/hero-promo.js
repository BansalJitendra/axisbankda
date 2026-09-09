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
}
