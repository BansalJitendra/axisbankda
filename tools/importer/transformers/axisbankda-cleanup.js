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
 *   - <footer>                                   site footer (offset 23929452)
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
      'footer',
      '.skip-to-main-menu',
      'a.skip-link',
      'iframe',
    ]);
  }
}
