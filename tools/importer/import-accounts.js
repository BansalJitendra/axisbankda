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

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (accounts)
const PAGE_TEMPLATE = {
  name: 'accounts',
  description: 'Axis Bank account/card category pages',
  urls: [
    'https://www.axis.bank.in/accounts/savings-account',
    'https://www.axis.bank.in/cards/credit-card',
  ],
  blocks: [
    {
      name: 'carousel-banner',
      instances: [
        'section.category-banner.banner-type-2.full-img-banner.withText',
        '#things-to-keep-slider',
      ],
    },
    {
      name: 'cards-product',
      instances: [
        '#whyChooseOurCardsSlider',
        'section.mutualfund-wrap',
        '#changedCards',
        '#eligibility-criteria .cards-wrapper',
        '#services .cards-wrapper',
        '#BlogPostChild',
      ],
    },
    {
      name: 'columns-split',
      instances: [
        'body > main > div.pageWrapper.category > section.breadcrumb-wrap',
        'body > main > div.pageWrapper.category > div:nth-of-type(5)',
        '#offers',
        '#open-by-axis-bank',
        '#do-dont',
        'section.long-form',
      ],
    },
    {
      name: 'widget',
      instances: [
        '#cardFinder1',
        '#all_account',
        '#allCards',
        '#calculator',
        '#siploan',
        '#emiloan',
        '#salary',
      ],
    },
    {
      name: 'tabs-panel',
      instances: [
        '#banking-program',
        '#howtoapply',
        '#eligibility-documentation',
        'body > main > div.pageWrapper.category > div:nth-of-type(8)',
      ],
    },
    {
      name: 'accordion-faq',
      instances: [
        '#faq',
        '#GotAnyQuerySliderParent',
        '#GotAnyQuerySliderChild',
      ],
    },
    {
      name: 'hero-promo',
      instances: [
        '#fees_charge',
        '#interest-rate',
        'body > main > div.pageWrapper.category > div:nth-of-type(4)',
        'body > main > div.pageWrapper.category > div:nth-of-type(9)',
        'body > main > div.pageWrapper.category > div:nth-of-type(10)',
        'body > main > div.pageWrapper.category > div:nth-of-type(16)',
        'body > main > div.pageWrapper.category > div:nth-of-type(18)',
        'body > main > div.pageWrapper.category > div:nth-of-type(20)',
      ],
    },
  ],
  sections: [
    { id: 'rc1', name: 'section-breadcrumb', style: null },
    { id: 'rc3', name: 'section-hero-carousel', style: null },
    { id: 'rc4', name: 'section-intro-highlights', style: null },
    { id: 'rc5', name: 'section-account-finder', style: null },
    { id: 'rc6', name: 'section-interest-rates-cta', style: null },
    { id: 'rc7', name: 'section-open-account-steps', style: 'grey' },
    { id: 'rc8', name: 'section-deals-intro', style: null },
    { id: 'rc9', name: 'section-rewards-panels', style: null },
    { id: 'rc10', name: 'section-eligibility-tabs', style: null },
    { id: 'rc11', name: 'section-fees-charges-cta', style: null },
    { id: 'rc12', name: 'section-nri-cta', style: null },
    { id: 'rc13', name: 'section-open-app-features', style: null },
    { id: 'rc14', name: 'section-interest-calculator', style: 'grey' },
    { id: 'rc15', name: 'section-banking-program-tabs', style: null },
    { id: 'rc16', name: 'section-things-to-keep', style: null },
    { id: 'rc17', name: 'section-dos-donts', style: 'accent' },
    { id: 'rc18', name: 'section-cta-banner-1', style: null },
    { id: 'rc19', name: 'section-faq-accordion', style: null },
    { id: 'rc20', name: 'section-cta-banner-2', style: null },
    { id: 'rc21', name: 'section-learn-hub', style: null },
    { id: 'rc22', name: 'section-cta-banner-3', style: null },
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
