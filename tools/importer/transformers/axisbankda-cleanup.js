/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: axisbankda (axis.bank.in) site-wide cleanup.
 *
 * Removes non-authorable global chrome and widgets so the import contains
 * only page-level authorable content.
 *
 * ALL selectors below were verified against migration-work/cleaned.html:
 *   - <header class="header">                    site header (offset 264)
 *   - .mainLevelItem / .dropdown-menu /           header nav megamenu panels
 *     .nav-item.megadd                            (product dropdowns); rendered
 *                                                 in the DOM flow OUTSIDE
 *                                                 <header> at scrape time, so the
 *                                                 header removal misses them and
 *                                                 they leak into the page body
 *   - .home-side-bar / .interest-rates-popup /    floating "Rates" side-bar popup
 *     .popup-mob-wrap / .rates-popup              (FD/loan rate tables toggled by
 *                                                 the edge "Rates" tab, plus the
 *                                                 tab anchors themselves); a body
 *                                                 widget, not inline homepage
 *                                                 content, so it must be dropped
 *   - <footer>                                   site footer (offset 23929452)
 *   - .copyright-wrap                             footer legal bar (DCGC logo,
 *                                                 disclaimer/privacy/copyright);
 *                                                 sits OUTSIDE <footer> so the
 *                                                 footer removal misses it
 *   - #scrollToTopBtn / .scrollToTopBtn           floating "Scroll To Top" widget
 *   - .skip-to-main-menu / a.skip-link           accessibility skip link in header
 *   - #chatbotUI                                  chatbot widget (offset 23612177)
 *   - .notification-overlay                       cookie/consent CMP wrapper (offset 25645402)
 *   - [class*="privy-cmp-AE1VSVI8T5"]             cookie consent manager (privy CMP) widget
 *   - #banner-home-privy-cmp-AE1VSVI8T5           cookie banner home screen
 *   - #customize-screen-privy-cmp-AE1VSVI8T5      cookie customize screen
 *   - iframe                                      5 embedded frames (non-authorable)
 *
 * NOTE: <nav> is intentionally NOT removed globally — the only <nav> in the
 * captured DOM is empty and nested inside section.breadcrumb-wrap, which is
 * mapped as an authorable columns-split block.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets that could interfere with block parsing.
    WebImporter.DOMUtils.remove(element, [
      '.notification-overlay',
      '[class*="privy-cmp-AE1VSVI8T5"]',
      '#banner-home-privy-cmp-AE1VSVI8T5',
      '#customize-screen-privy-cmp-AE1VSVI8T5',
      '#chatbotUI',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome + safe element cleanup.
    WebImporter.DOMUtils.remove(element, [
      'header.header',
      'header',
      '.mainLevelItem',
      '.dropdown-menu',
      '.nav-item.megadd',
      '.home-side-bar',
      '.interest-rates-popup',
      '.popup-mob-wrap',
      '.rates-popup',
      'footer',
      '.copyright-wrap',
      '#scrollToTopBtn',
      '.scrollToTopBtn',
      '.skip-to-main-menu',
      'a.skip-link',
      'iframe',
    ]);
  }
}
