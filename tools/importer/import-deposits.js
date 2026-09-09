/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselBannerParser from './parsers/carousel-banner.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsSplitParser from './parsers/columns-split.js';
import widgetParser from './parsers/widget.js';
import tabsPanelParser from './parsers/tabs-panel.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import heroPromoParser from './parsers/hero-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/axisbankda-cleanup.js';
import sectionsTransformer from './transformers/axisbankda-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-banner': carouselBannerParser,
  'cards-product': cardsProductParser,
  'columns-split': columnsSplitParser,
  'widget': widgetParser,
  'tabs-panel': tabsPanelParser,
  'accordion-faq': accordionFaqParser,
  'hero-promo': heroPromoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (deposits)
const PAGE_TEMPLATE = {
  name: 'deposits',
  description: 'Axis Bank deposits product pages',
  urls: [
    'https://www.axis.bank.in/deposits/fixed-deposits',
  ],
  blocks: [
    {
      name: 'columns-split',
      instances: [
        'body > main > div.pageWrapper.product > section.breadcrumb-wrap',
        '#how-to-apply',
      ],
    },
    {
      name: 'carousel-banner',
      instances: [
        '#content > div.sfContentBlock.sf-Long-text > section.category-banner.banner-type-2.full-img-banner.withText > div.category-bannerwrap',
      ],
    },
    {
      name: 'cards-product',
      instances: [
        'body > main > div.pageWrapper.product > div:nth-of-type(2)',
        '#feature-benefits .cards-wrapper',
        '#DepositSubCategoryCardDataWithImage',
        '#BlogPostChild',
      ],
    },
    {
      name: 'widget',
      instances: [
        '#calculator',
      ],
    },
    {
      name: 'hero-promo',
      instances: [
        '#interest-rates',
        'body > main > div.pageWrapper.product > div:nth-of-type(14)',
        'body > main > div.pageWrapper.product > div:nth-of-type(17)',
      ],
    },
    {
      name: 'tabs-panel',
      instances: [
        'body > main > div.pageWrapper.product > div:nth-of-type(8)',
        '#advantages',
      ],
    },
    {
      name: 'accordion-faq',
      instances: [
        '#faq',
        '#GotAnyQuerySliderParent',
      ],
    },
  ],
  sections: [
    { id: 'rc1', name: 'section-breadcrumb', style: null },
    { id: 'rc3', name: 'section-hero-carousel', style: null },
    { id: 'rc4', name: 'section-highlights', style: null },
    { id: 'rc5', name: 'section-fd-intro', style: null },
    { id: 'rc6', name: 'section-features-benefits', style: 'grey' },
    { id: 'rc7', name: 'section-fd-calculator', style: 'grey' },
    { id: 'rc8', name: 'section-interest-rates-cta', style: null },
    { id: 'rc9', name: 'section-eligibility-intro', style: null },
    { id: 'rc10', name: 'section-eligibility-tabs', style: null },
    { id: 'rc11', name: 'section-how-to-apply', style: null },
    { id: 'rc12', name: 'section-types-intro', style: null },
    { id: 'rc13', name: 'section-fd-products', style: null },
    { id: 'rc14', name: 'section-connector', style: null },
    { id: 'rc15', name: 'section-overdraft-intro', style: null },
    { id: 'rc16', name: 'section-overdraft-cta', style: null },
    { id: 'rc17', name: 'section-advantages-heading', style: null },
    { id: 'rc18', name: 'section-advantages-tabs', style: 'dark' },
    { id: 'rc19', name: 'section-credit-power-cta', style: null },
    { id: 'rc20', name: 'section-faq-blogs', style: null },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (only if 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
        return;
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already detached by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
