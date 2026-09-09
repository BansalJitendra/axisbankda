/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-deposits.js
  var import_deposits_exports = {};
  __export(import_deposits_exports, {
    default: () => import_deposits_default
  });

  // tools/importer/parsers/carousel-banner.js
  function parse(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(".owl-item:not(.cloned)"));
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll(".basic-card, .cat-banner-wrap, .single-banner"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      let imageCell = "";
      if (img) {
        imageCell = img.closest("picture") || img;
      }
      const textParts = [];
      const heading = slide.querySelector("h2, h3, h4, .card-title");
      if (heading) textParts.push(heading);
      slide.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) textParts.push(p);
      });
      const link = slide.querySelector("a[href]");
      if (link && !link.querySelector("img, picture") && link.textContent.trim()) {
        textParts.push(link);
      }
      if (!imageCell && textParts.length === 0) return;
      cells.push([imageCell, textParts.length ? textParts : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse2(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".basic-card, .compare-card")).filter((c) => !c.closest(".cloned"));
    cards = cards.filter((c) => !cards.some((other) => other !== c && other.contains(c)));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img");
      let imageCell = "";
      if (img) {
        const picture = img.closest("picture");
        imageCell = picture || img;
        imageCell.remove();
      }
      const textCell = card;
      if (!imageCell && !card.textContent.trim()) return;
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-split.js
  function parse3(element, { document: document2 }) {
    const nestedBlocks = Array.from(element.querySelectorAll("table"));
    nestedBlocks.forEach((t) => t.remove());
    const content = element.querySelector(":scope > .container") || element;
    const headingParts = [];
    const heading = content.querySelector(":scope > h1, :scope > h2, :scope > .section-heading, :scope > .contWrap > h2, :scope > .headingwrap > h2");
    if (heading) headingParts.push(heading);
    const intro = content.querySelector(":scope > p.section-desc, :scope > .contWrap > p, :scope > p.digi-desc");
    if (intro) headingParts.push(intro);
    const wrapperSelectors = [
      ".do-dont-wrapper",
      ".digi-wrapper",
      ".payments-wrapper",
      ".reward-list",
      '[class*="wrapper"]',
      '[class*="-wrap"]'
    ];
    let columnEls = [];
    for (const sel of wrapperSelectors) {
      const wrapper = content.querySelector(sel);
      if (wrapper) {
        const children = Array.from(wrapper.children).filter((c) => c.textContent.trim() || c.querySelector("img"));
        if (children.length >= 2) {
          columnEls = children;
          break;
        }
      }
    }
    const cells = [];
    if (columnEls.length >= 2) {
      if (headingParts.length) {
        const headingRow = new Array(columnEls.length).fill("");
        headingRow[0] = headingParts;
        cells.push(headingRow);
      }
      cells.push(columnEls.map((el) => el));
    } else {
      const single = [];
      if (headingParts.length) single.push(...headingParts);
      Array.from(content.children).forEach((child) => {
        if (headingParts.includes(child)) return;
        if (!(child.textContent.trim() || child.querySelector("img"))) return;
        if (child.tagName === "NAV") {
          const inner = Array.from(child.children).filter((c) => c.textContent.trim() || c.querySelector("img"));
          single.push(...inner.length ? inner : [child]);
        } else {
          single.push(child);
        }
      });
      if (single.length === 0) {
        element.replaceWith(...nestedBlocks, ...element.childNodes);
        return;
      }
      cells.push([single]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-split", cells });
    element.replaceWith(block);
    nestedBlocks.forEach((t) => block.after(t));
  }

  // tools/importer/parsers/widget.js
  function parse4(element, { document: document2 }) {
    const nestedBlocks = Array.from(element.querySelectorAll("table"));
    nestedBlocks.forEach((t) => t.remove());
    const heading = element.querySelector(":scope > .container > h2, :scope h2.section-heading, h2, h3, .section-heading");
    let description = element.querySelector(".section-desc, .calc-sec-wrapper > p, p.filter-text");
    if (!description) {
      description = Array.from(element.querySelectorAll("p")).find((p) => p.textContent.trim().length > 20) || null;
    }
    if (!heading && !description) {
      element.replaceWith(...nestedBlocks, ...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "widget", cells });
    element.replaceWith(block);
    nestedBlocks.forEach((t) => block.after(t));
  }

  // tools/importer/parsers/tabs-panel.js
  function parse5(element, { document: document2 }) {
    const cells = [];
    const tabLinks = Array.from(element.querySelectorAll('a[id^="tab-"], .tab-link[href^="#"], .line-tab-link[href^="#"], [data-target^="#"]'));
    const usedPanels = /* @__PURE__ */ new Set();
    tabLinks.forEach((link) => {
      const label = link.textContent.trim();
      if (!label) return;
      let targetId = "";
      const href = link.getAttribute("href") || link.getAttribute("data-target") || "";
      if (href.startsWith("#") && href.length > 1) {
        targetId = href.slice(1);
      } else if ((link.id || "").startsWith("tab-")) {
        targetId = link.id.slice(4);
      }
      if (!targetId) return;
      const panel = element.querySelector(`#${CSS.escape(targetId)}`);
      if (!panel || usedPanels.has(panel)) return;
      usedPanels.add(panel);
      cells.push([label, panel]);
    });
    if (cells.length === 0) {
      const panels = Array.from(element.querySelectorAll(".global-tab-content, .line-tab-content")).filter((p, _i, arr) => !arr.some((o) => o !== p && o.contains(p)));
      panels.forEach((panel) => {
        const heading = panel.querySelector("h1, h2, h3, h4, .section-heading, .title-cont");
        const label = heading ? heading.textContent.trim() : "";
        if (heading) heading.remove();
        const content = panel;
        if (!label && !content.textContent.trim()) return;
        cells.push([label || "Tab", content]);
      });
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-panel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse6(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll("div.py-6")).filter((it) => it.querySelector("button, h3, h4") && it.querySelector(".faq-content, p"));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll(".accord-inner-cont")).filter((it) => it.querySelector("h2, h3, h4") && it.querySelector("p"));
    }
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector("button h3, button h4, button h2, h3, h4");
      let contentEl = item.querySelector(".faq-content");
      if (!contentEl) {
        const paras = Array.from(item.querySelectorAll("p"));
        if (paras.length) contentEl = paras;
      }
      const titleCell = titleEl ? titleEl.textContent.trim() : "";
      const contentCell = contentEl || "";
      if (titleCell) {
        cells.push([titleCell, contentCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function parse7(element, { document: document2 }) {
    const nestedBlocks = Array.from(element.querySelectorAll("table"));
    nestedBlocks.forEach((t) => t.remove());
    const heading = element.querySelector('.cont-maintitle, h1, h2, h3, [class*="title"]');
    const description = element.querySelector(".cont-subtitle, p");
    let ctaLinks = Array.from(element.querySelectorAll('a.btn, a.btn-secondary, a.btn-primary, a[class*="btn"]'));
    if (ctaLinks.length === 0) {
      const genericLink = element.querySelector("a[href]");
      if (genericLink) ctaLinks = [genericLink];
    }
    const picture = element.querySelector("picture");
    const img = element.querySelector("img");
    const bgAsset = picture || img;
    if (!heading && !description && ctaLinks.length === 0) {
      element.replaceWith(...nestedBlocks, ...element.childNodes);
      return;
    }
    const cells = [];
    if (bgAsset) {
      cells.push([bgAsset]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/axisbankda-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".notification-overlay",
        '[class*="privy-cmp-AE1VSVI8T5"]',
        "#banner-home-privy-cmp-AE1VSVI8T5",
        "#customize-screen-privy-cmp-AE1VSVI8T5",
        "#chatbotUI"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header",
        "header",
        "footer",
        ".skip-to-main-menu",
        "a.skip-link",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/axisbankda-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-deposits.js
  var parsers = {
    "carousel-banner": parse,
    "cards-product": parse2,
    "columns-split": parse3,
    "widget": parse4,
    "tabs-panel": parse5,
    "accordion-faq": parse6,
    "hero-promo": parse7
  };
  var PAGE_TEMPLATE = {
    name: "deposits",
    description: "Axis Bank deposits product pages",
    urls: [
      "https://www.axis.bank.in/deposits/fixed-deposits"
    ],
    blocks: [
      {
        name: "columns-split",
        instances: [
          "body > main > div.pageWrapper.product > section.breadcrumb-wrap",
          "#how-to-apply"
        ]
      },
      {
        name: "carousel-banner",
        instances: [
          "#content > div.sfContentBlock.sf-Long-text > section.category-banner.banner-type-2.full-img-banner.withText > div.category-bannerwrap"
        ]
      },
      {
        name: "cards-product",
        instances: [
          "body > main > div.pageWrapper.product > div:nth-of-type(2)",
          "#feature-benefits .cards-wrapper",
          "#DepositSubCategoryCardDataWithImage",
          "#BlogPostChild"
        ]
      },
      {
        name: "widget",
        instances: [
          "#calculator"
        ]
      },
      {
        name: "hero-promo",
        instances: [
          "#interest-rates",
          "body > main > div.pageWrapper.product > div:nth-of-type(14)",
          "body > main > div.pageWrapper.product > div:nth-of-type(17)"
        ]
      },
      {
        name: "tabs-panel",
        instances: [
          "body > main > div.pageWrapper.product > div:nth-of-type(8)",
          "#advantages"
        ]
      },
      {
        name: "accordion-faq",
        instances: [
          "#faq",
          "#GotAnyQuerySliderParent"
        ]
      }
    ],
    sections: [
      { id: "rc1", name: "section-breadcrumb", style: null },
      { id: "rc3", name: "section-hero-carousel", style: null },
      { id: "rc4", name: "section-highlights", style: null },
      { id: "rc5", name: "section-fd-intro", style: null },
      { id: "rc6", name: "section-features-benefits", style: "grey" },
      { id: "rc7", name: "section-fd-calculator", style: "grey" },
      { id: "rc8", name: "section-interest-rates-cta", style: null },
      { id: "rc9", name: "section-eligibility-intro", style: null },
      { id: "rc10", name: "section-eligibility-tabs", style: null },
      { id: "rc11", name: "section-how-to-apply", style: null },
      { id: "rc12", name: "section-types-intro", style: null },
      { id: "rc13", name: "section-fd-products", style: null },
      { id: "rc14", name: "section-connector", style: null },
      { id: "rc15", name: "section-overdraft-intro", style: null },
      { id: "rc16", name: "section-overdraft-cta", style: null },
      { id: "rc17", name: "section-advantages-heading", style: null },
      { id: "rc18", name: "section-advantages-tabs", style: "dark" },
      { id: "rc19", name: "section-credit-power-cta", style: null },
      { id: "rc20", name: "section-faq-blogs", style: null }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_deposits_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_deposits_exports);
})();
