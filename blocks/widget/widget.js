import { loadCSS } from '../../scripts/aem.js';

/**
 * Parses a widget href into folder path and name.
 * @param {string} pathname URL pathname (e.g. `/widgets/path1/name.html`)
 * @returns {{ widgetPath: string, widgetName: string }}
 */
function parseWidgetHref(pathname) {
  const pathSegments = pathname.split('/').filter((p) => p);
  const widgetName = pathSegments[pathSegments.length - 1].split('.')[0];
  const widgetPath = pathSegments.slice(1, -1).join('/');
  return { widgetPath, widgetName };
}

/**
 * Builds a widget asset URL.
 * @param {string} widgetPath Folder path under `/widgets/`
 * @param {string} widgetName Widget file name without extension
 * @param {string} extension File extension (`html`, `css`, `js`)
 */
function widgetUrl(widgetPath, widgetName, extension) {
  const prefix = widgetPath ? `${widgetPath}/` : '';
  return `${window.hlx.codeBasePath}/widgets/${prefix}${widgetName}.${extension}`;
}

/**
 * Applies widget metadata, block classes, and section shell classes.
 * Must run before widget HTML/JS load so decorate can read config from the DOM.
 * @param {Element} widget The widget block element
 * @param {HTMLAnchorElement} source The authored widget link
 * @param {string} widgetName Widget file name without extension
 * @param {URLSearchParams} searchParams Query params from the widget href
 */
function applyWidgetShell(widget, source, widgetName, searchParams) {
  widget.classList.add(widgetName);
  widget.classList.remove('block');
  widget.dataset.source = source.href;
  searchParams.forEach((value, key) => {
    widget.dataset[key] = value;
  });

  const wrapper = widget.closest('.widget-wrapper');
  if (wrapper) {
    wrapper.classList.add(`${widgetName}-wrapper`);
    wrapper.classList.remove('widget-wrapper');
  }
  const container = widget.closest('.widget-container');
  if (container) {
    container.classList.add(`${widgetName}-container`);
    container.classList.remove('widget-container');
  }
}

/* -------------------------------------------------------------------------
   Homepage calculator hub ("Plan-o-Meter" / #goodCalculationTabs).
   Source is an interactive tabbed calculator (EMI / FD / SIP / PPF), each with
   sliders + number inputs and a live result. The import only carries the
   heading + one intro paragraph per calculator, so we build the interactive UI
   here and reuse each intro paragraph as its tab description.
   Slider ranges below match the source inputs.
   ------------------------------------------------------------------------- */

const INR = (n) => `₹ ${Math.round(n).toLocaleString('en-IN')}`;

// EMI: P·r·(1+r)^n / ((1+r)^n − 1); r = monthly rate, n = months
function calcEMI({ amount, rate, years }) {
  const n = years * 12;
  const r = rate / 12 / 100;
  const emi = r === 0 ? amount / n : (amount * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const total = emi * n;
  return {
    primary: { label: 'Monthly EMI', value: INR(emi) },
    breakdown: [
      { label: 'Principal amount', value: INR(amount) },
      { label: 'Total interest', value: INR(total - amount) },
      { label: 'Total amount payable', value: INR(total) },
    ],
    donut: [amount, total - amount],
  };
}

// FD: quarterly compounding — A = P(1 + r/4)^(4·years)
function calcFD({ amount, rate, years }) {
  const maturity = amount * (1 + rate / 4 / 100) ** (4 * years);
  return {
    primary: { label: 'Maturity value', value: INR(maturity) },
    breakdown: [
      { label: 'Invested amount', value: INR(amount) },
      { label: 'Interest earned', value: INR(maturity - amount) },
    ],
    donut: [amount, maturity - amount],
  };
}

// SIP: M·((1+i)^n − 1)/i·(1+i); i = monthly rate, n = months
function calcSIP({ amount, rate, years }) {
  const n = years * 12;
  const i = rate / 12 / 100;
  const invested = amount * n;
  const value = i === 0 ? invested : amount * (((1 + i) ** n - 1) / i) * (1 + i);
  return {
    primary: { label: 'Total value', value: INR(value) },
    breakdown: [
      { label: 'Invested amount', value: INR(invested) },
      { label: 'Estimated returns', value: INR(value - invested) },
    ],
    donut: [invested, value - invested],
  };
}

// PPF: yearly deposit, annual compounding over the tenure
function calcPPF({ amount, rate, years }) {
  let balance = 0;
  for (let y = 0; y < years; y += 1) balance = (balance + amount) * (1 + rate / 100);
  const invested = amount * years;
  return {
    primary: { label: 'Maturity value', value: INR(balance) },
    breakdown: [
      { label: 'Invested amount', value: INR(invested) },
      { label: 'Total interest', value: INR(balance - invested) },
    ],
    donut: [invested, balance - invested],
  };
}

const CALCULATORS = [
  {
    key: 'emi',
    tab: 'EMI Calculator',
    compute: calcEMI,
    fields: [
      {
        key: 'amount', label: 'Loan amount', min: 50000, max: 4000000, step: 10000, value: 1000000, fmt: INR,
      },
      {
        key: 'rate', label: 'Rate of interest (p.a.)', min: 8, max: 22, step: 0.01, value: 10.5, fmt: (v) => `${v}%`,
      },
      {
        key: 'years', label: 'Loan tenure (years)', min: 1, max: 30, step: 1, value: 5, fmt: (v) => `${v} Yr`,
      },
    ],
  },
  {
    key: 'fd',
    tab: 'FD Calculator',
    compute: calcFD,
    fields: [
      {
        key: 'amount', label: 'Total investment', min: 5000, max: 10000000, step: 1000, value: 100000, fmt: INR,
      },
      {
        key: 'rate', label: 'Rate of interest (p.a.)', min: 3, max: 9, step: 0.01, value: 7.1, fmt: (v) => `${v}%`,
      },
      {
        key: 'years', label: 'Time period (years)', min: 1, max: 10, step: 1, value: 5, fmt: (v) => `${v} Yr`,
      },
    ],
  },
  {
    key: 'sip',
    tab: 'SIP Calculator',
    compute: calcSIP,
    fields: [
      {
        key: 'amount', label: 'Monthly investment', min: 500, max: 500000, step: 500, value: 25000, fmt: INR,
      },
      {
        key: 'rate', label: 'Expected return rate (p.a.)', min: 1, max: 30, step: 0.1, value: 12, fmt: (v) => `${v}%`,
      },
      {
        key: 'years', label: 'Time period (years)', min: 1, max: 40, step: 1, value: 10, fmt: (v) => `${v} Yr`,
      },
    ],
  },
  {
    key: 'ppf',
    tab: 'PPF Calculator',
    compute: calcPPF,
    fields: [
      {
        key: 'amount', label: 'Yearly investment', min: 500, max: 150000, step: 500, value: 150000, fmt: INR,
      },
      {
        key: 'rate', label: 'Rate of interest (p.a.)', min: 6, max: 9, step: 0.01, value: 7.1, fmt: (v) => `${v}%`,
      },
      {
        key: 'years', label: 'Time period (years)', min: 15, max: 50, step: 1, value: 15, fmt: (v) => `${v} Yr`,
      },
    ],
  },
];

/**
 * Builds the interactive calculator for one tab and returns its panel element.
 * @param {object} config One entry from CALCULATORS
 * @param {string} description Intro paragraph text for this calculator
 */
function buildCalculatorPanel(config, description) {
  const panel = document.createElement('div');
  panel.className = 'widget-calc-panel';
  panel.dataset.calc = config.key;

  const controls = document.createElement('div');
  controls.className = 'widget-calc-controls';
  if (description) {
    const desc = document.createElement('p');
    desc.className = 'widget-calc-desc';
    desc.textContent = description;
    controls.append(desc);
  }

  const result = document.createElement('div');
  result.className = 'widget-calc-result';
  const donut = document.createElement('div');
  donut.className = 'widget-calc-donut';
  const primary = document.createElement('div');
  primary.className = 'widget-calc-primary';
  const breakdown = document.createElement('dl');
  breakdown.className = 'widget-calc-breakdown';
  result.append(donut, primary, breakdown);

  const state = {};
  config.fields.forEach((f) => { state[f.key] = f.value; });

  const render = () => {
    const out = config.compute(state);
    primary.innerHTML = `<span class="widget-calc-primary-label">${out.primary.label}</span>`
      + `<span class="widget-calc-primary-value">${out.primary.value}</span>`;
    breakdown.innerHTML = out.breakdown
      .map((b) => `<div><dt>${b.label}</dt><dd>${b.value}</dd></div>`).join('');
    const [a, b] = out.donut;
    const pct = a + b > 0 ? Math.round((a / (a + b)) * 100) : 0;
    donut.style.background = `conic-gradient(var(--brand-color) 0 ${pct}%, #e7c9d6 ${pct}% 100%)`;
  };

  config.fields.forEach((f) => {
    const row = document.createElement('div');
    row.className = 'widget-calc-field';
    const head = document.createElement('div');
    head.className = 'widget-calc-field-head';
    const label = document.createElement('label');
    label.textContent = f.label;
    const valueOut = document.createElement('output');
    valueOut.className = 'widget-calc-field-value';
    valueOut.textContent = f.fmt(f.value);
    head.append(label, valueOut);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = f.min;
    slider.max = f.max;
    slider.step = f.step;
    slider.value = f.value;
    slider.setAttribute('aria-label', f.label);
    slider.addEventListener('input', () => {
      state[f.key] = parseFloat(slider.value);
      valueOut.textContent = f.fmt(state[f.key]);
      render();
    });

    row.append(head, slider);
    controls.append(row);
  });

  render();
  panel.append(controls, result);
  return panel;
}

/**
 * Homepage calculator hub ("Great plans start with well-calculated decisions").
 * Authored as a static heading + one intro paragraph per calculator (no widget
 * link, so the JS loader below is skipped). We keep the heading on the white
 * section and build the interactive tabbed calculator (EMI/FD/SIP/PPF) inside a
 * grey rounded card, using each intro paragraph as that tab's description.
 * @param {Element} widget The widget block element
 * @returns {boolean} true when the calculator hub layout was applied
 */
function decorateCalculatorHub(widget) {
  const cell = widget.firstElementChild && widget.firstElementChild.firstElementChild;
  if (!cell) return false;
  const heading = cell.querySelector(':scope > h2');
  if (!heading || !/well-calculated decisions/i.test(heading.textContent)) return false;

  widget.classList.add('widget-calc-hub');
  const descriptions = [...cell.querySelectorAll(':scope > p, :scope > div > p')]
    .map((p) => p.textContent.trim());
  [...cell.children].forEach((child) => { if (child !== heading) child.remove(); });

  const card = document.createElement('div');
  card.className = 'widget-calc-card';

  const tablist = document.createElement('div');
  tablist.className = 'widget-calc-tabs';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'widget-calc-panels';

  CALCULATORS.forEach((config, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'widget-calc-tab';
    tab.textContent = config.tab;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

    const panel = buildCalculatorPanel(config, descriptions[i] || '');
    if (i !== 0) panel.hidden = true;

    tab.addEventListener('click', () => {
      tablist.querySelectorAll('.widget-calc-tab').forEach((t) => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      [...panels.children].forEach((p) => { p.hidden = true; });
      panel.hidden = false;
    });

    tablist.append(tab);
    panels.append(panel);
  });

  card.append(tablist, panels);
  cell.append(card);
  return true;
}

/**
 * Loads and decorates a widget block.
 * @param {Element} widget The widget block element
 */
export default async function decorate(widget) {
  const source = widget.querySelector('a[href]');
  if (!source) {
    // No widget link: this is authored static content (e.g. the homepage
    // calculator hub). Apply layout decoration and skip the widget loader.
    decorateCalculatorHub(widget);
    return;
  }
  const { pathname, searchParams } = new URL(source.href);
  const { widgetPath, widgetName } = parseWidgetHref(pathname);

  try {
    applyWidgetShell(widget, source, widgetName, searchParams);

    const resp = await fetch(widgetUrl(widgetPath, widgetName, 'html'));
    widget.innerHTML = await resp.text();

    const cssLoaded = loadCSS(widgetUrl(widgetPath, widgetName, 'css'));
    const decorationComplete = (async () => {
      const mod = await import(widgetUrl(widgetPath, widgetName, 'js'));
      if (mod.default) await mod.default(widget);
    })();
    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`failed to load widget ${widgetPath}/${widgetName}`, error);
  }
}
