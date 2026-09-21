function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-banner');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-banner-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-banner-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-banner-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-banner-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-banner-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-banner-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-banner-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-banner-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-banner-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

/**
 * Homepage "Financial Literacy Week" feature.
 * On the source this is a burgundy .bg-progress band that groups the heading +
 * intro copy (which here are default content, siblings above the block) together
 * with the article-image carousel (.JSfinancialweekSlider). To reproduce that
 * single rounded band we wrap the preceding heading/intro default-content-wrapper
 * and this carousel's wrapper into one flex container and tag the block.
 *
 * Strongly guarded so ONLY this homepage instance is affected: the immediately
 * preceding sibling must be a default-content-wrapper whose heading text is
 * "Financial Literacy". Category-page carousels (which have no such heading) and
 * the other two homepage carousels (apply-now tiles, promo banners) never match.
 */
function decorateFinancialLiteracy(block) {
  const wrapper = block.closest('.carousel-banner-wrapper');
  if (!wrapper) return;
  const prev = wrapper.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return;
  const heading = prev.querySelector('h1, h2, h3');
  if (!heading || !/financial literacy/i.test(heading.textContent)) return;
  if (wrapper.parentElement.classList.contains('carousel-banner-fw-band')) return;

  block.classList.add('carousel-banner-fw');
  const band = document.createElement('div');
  band.className = 'carousel-banner-fw-band';
  prev.parentNode.insertBefore(band, prev);
  band.append(prev, wrapper);
}

/**
 * Homepage "Apply Now" band. On the source the Apply-Now product-tile carousel
 * and the rotating promo-banner carousel sit side by side: a bordered white
 * "Apply Now" card on the LEFT (~1/3) and the promo banner on the RIGHT (~2/3).
 * In the import they arrive as two stacked, full-width carousel wrappers, with
 * the "Apply Now" heading trapped at the end of the preceding interest-rates
 * default-content-wrapper.
 *
 * This runs from the TILE carousel (the imageless one). It moves the trailing
 * "Apply Now" heading into the tile wrapper, then wraps the tile wrapper (left)
 * and the immediately-following promo carousel wrapper (right) into one flex
 * band.
 *
 * Guarded so ONLY the homepage instance matches: the block must be the
 * imageless tile carousel, its wrapper's next sibling must be a
 * carousel-banner-wrapper whose carousel HAS pictures, and the heading pulled
 * in must read "Apply Now".
 */
function decorateApplyBand(block) {
  if (block.querySelector('picture')) return; // only the tile carousel
  const wrapper = block.closest('.carousel-banner-wrapper');
  if (!wrapper) return;

  const promoWrapper = wrapper.nextElementSibling;
  if (!promoWrapper || !promoWrapper.classList.contains('carousel-banner-wrapper')) return;
  const promoCarousel = promoWrapper.querySelector('.carousel-banner');
  if (!promoCarousel || !promoCarousel.querySelector('picture')) return;

  if (wrapper.parentElement.classList.contains('carousel-banner-apply-band')) return;

  // pull the trailing "Apply Now" heading out of the preceding rates panel
  const prev = wrapper.previousElementSibling;
  const heading = prev && prev.classList.contains('default-content-wrapper')
    ? [...prev.querySelectorAll(':scope > h1, :scope > h2, :scope > h3')].pop()
    : null;
  if (heading && /apply now/i.test(heading.textContent)) {
    wrapper.prepend(heading);
  }

  block.classList.add('carousel-banner-apply');
  promoCarousel.classList.add('carousel-banner-apply-promo');
  const band = document.createElement('div');
  band.className = 'carousel-banner-apply-band';
  wrapper.parentNode.insertBefore(band, wrapper);
  band.append(wrapper, promoWrapper);
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-banner-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = {};

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-banner-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-banner-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-banner-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-banner-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-banner-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }

  decorateFinancialLiteracy(block);
  decorateApplyBand(block);
}
