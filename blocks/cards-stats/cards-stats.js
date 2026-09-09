/*
 * cards-stats — impact / achievement counter row.
 * Variant of the vanilla "cards" block for a small set of headline statistics.
 *
 * Authored structure (one row per stat, two cells each):
 *   | 2.05M+ | Households Across India       |
 *   | 100Cr+ | National Cancer Grid (NCG)    |
 *   | 3.27M+ | Trees Planted                 |
 *
 * The first cell of each row is the (large) figure, the second is its label.
 * Any intro heading/paragraph authored before the block stays as default
 * content in the section above it.
 */
export default function decorate(block) {
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
  block.textContent = '';
  block.append(ul);
}
