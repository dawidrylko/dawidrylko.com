// Generates the diagrams of the three Flexbox Layout posts. Every layout is real
// CSS flexbox rendered in Chromium, so a picture cannot disagree with the property
// it shows. The PNGs have a transparent background and have to read on both site
// themes: items and captions carry their own fill, and nothing relies on the page
// colour behind it. Run from the repository root:
//   node content/pl/2016-06-26--flexbox-layout-czesc-3-alignment/chart-source/flex-diagrams.mjs
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';

const PART_1 = 'content/pl/2016-05-14--flexbox-layout-czesc-1-parent-container';
const PART_2 = 'content/pl/2016-06-05--flexbox-layout-czesc-2-children-items';
const PART_3 = 'content/pl/2016-06-26--flexbox-layout-czesc-3-alignment';

const COLORS = ['blue', 'orange', 'green', 'violet', 'pink'];
const color = i => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];

const CSS = `
* { box-sizing: border-box; margin: 0; }
html, body { background: transparent; font-family: "Helvetica Neue", Arial, sans-serif; }
#stage { position: relative; width: 1000px; padding: 24px 44px; background: transparent; display: flex; flex-direction: column; gap: 28px; }
.c { display: flex; background: rgba(128, 128, 128, 0.16); border: 2px solid rgba(128, 128, 128, 0.55); border-radius: 18px; padding: 16px; }
.s { flex: none; width: 76px; height: 76px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 30px; color: #10202e; }
.blue { background: #5eb3f0; }
.orange { background: #f5a95c; }
.green { background: #7fd3a4; }
.violet { background: #c6a4ec; }
.pink { background: #f294b4; }
.row { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-width: 0; }
.row > .c { align-self: stretch; }
.cap { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 24px; font-weight: 700; color: #fff; background: #33415a; border-radius: 8px; padding: 4px 12px; }
.label { font-weight: 700; font-size: 44px; color: #f24726; text-align: center; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
svg.over { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
`;

const notes = (n, style = () => '', label = () => '') =>
  Array.from({ length: n }, (_, i) => `<div class="s ${color(i)}" style="${style(i)}">${label(i)}</div>`).join('');

const box = (css, inner, id = '') => `<div class="c" ${id ? `id="${id}"` : ''} style="${css}">${inner}</div>`;
const captioned = (cap, inner) => `<div class="row"><div class="cap">${cap}</div>${inner}</div>`;
const numbered = i => i + 1;

// Source order is shuffled on purpose: only the order property sorts these items.
const ordered = values =>
  values
    .map(v => {
      const position = [...values].sort((x, y) => x - y).indexOf(v);
      return `<div class="s ${color(position)}" style="order: ${v}; width: 96px; height: 96px;">${v}</div>`;
    })
    .join('');

const BODY = {
  'flex-container': {
    dir: PART_1,
    html: `<div class="label" id="label" style="margin-bottom: 34px;">Kontener</div>${box('flex-wrap: wrap; gap: 14px; padding: 36px 170px;', notes(12), 'target')}`,
    arrows: `line(shift(at('#label', 'bottom'), 0, 2), shift(at('#target', 'top'), 0, -2), 5);`,
  },
  'flex-direction': {
    dir: PART_1,
    html: `<div class="grid2">
      ${captioned('row', box('flex-direction: row; gap: 10px;', notes(4, () => '', numbered), 'a'))}
      ${captioned('row-reverse', box('flex-direction: row-reverse; gap: 10px;', notes(4, () => '', numbered), 'b'))}
      ${captioned('column', box('flex-direction: column; gap: 10px; align-items: center;', notes(4, () => '', numbered), 'c'))}
      ${captioned('column-reverse', box('flex-direction: column-reverse; gap: 10px; align-items: center;', notes(4, () => '', numbered), 'd'))}
    </div>`,
    arrows: `for (const id of ['#a', '#b']) line(shift(at(id + ' > :nth-child(1)', 'bottom'), 0, 8), shift(at(id + ' > :nth-child(4)', 'bottom'), 0, 8), 4);
             for (const id of ['#c', '#d']) line(shift(at(id + ' > :nth-child(1)', 'right'), 14, 0), shift(at(id + ' > :nth-child(4)', 'right'), 14, 0), 4);`,
  },
  'flex-wrap': {
    dir: PART_1,
    html: box('flex-wrap: wrap; gap: 56px 14px; padding: 36px 130px;', notes(14), 'w'),
    arrows: `const last = at('#w > :nth-child(7)', 'right');
             const next = at('#w > :nth-child(8)', 'left');
             const y = (at('#w > :nth-child(7)', 'bottom').y + at('#w > :nth-child(8)', 'top').y) / 2;
             path([[last.x + 6, last.y], [last.x + 36, last.y], [last.x + 36, y], [next.x - 36, y], [next.x - 36, next.y], [next.x - 10, next.y]]);`,
  },
  'flex-children': {
    dir: PART_2,
    html: `<div class="label" id="label">Potomkowie</div>${box('flex-wrap: wrap; gap: 14px; padding: 76px 170px 36px;', notes(12), 'target')}`,
    arrows: `for (const n of [1, 3, 4, 6]) line(shift(at('#label', 'bottom'), 0, 2), shift(at('#target > :nth-child(' + n + ')', 'top'), 0, -4), 4);`,
  },
  'flex-order': {
    dir: PART_2,
    html: `<div style="display: flex; justify-content: center; gap: 70px; align-items: flex-start;">
      <div class="row" style="gap: 20px; align-items: stretch;">
        ${[
          [3, 1, 4, 2],
          [2, 1, 1, 1],
          [6, 0, -1, -2],
        ]
          .map(values => box('gap: 12px;', ordered(values)))
          .join('')}
      </div>
      ${box('flex-direction: column; gap: 12px;', ordered([4, 1, 3, 2]))}
    </div>`,
  },
  'flex-grow': {
    dir: PART_2,
    html: [
      [1, 1, 1, 1],
      [1, 2, 1],
    ]
      .map(values =>
        box(
          'gap: 14px;',
          values.map((v, i) => `<div class="s ${color(i)}" style="flex: ${v} 1 0; width: auto;">${v}</div>`).join(''),
        ),
      )
      .join(''),
  },
  'flex-axes': {
    dir: PART_3,
    html: `<div class="grid2">
      ${captioned('flex-direction: row', box('gap: 10px; height: 380px; align-items: center; justify-content: center;', notes(3), 'r'))}
      ${captioned('flex-direction: column', box('flex-direction: column; gap: 10px; height: 380px; align-items: center; justify-content: center;', notes(3), 'k'))}
    </div>`,
    arrows: `const r = box('#r');
             const k = box('#k');
             line({ x: r.x + 16, y: r.y + r.h - 22 }, { x: r.x + r.w - 16, y: r.y + r.h - 22 }, 5);
             text('main-axis', r.x + r.w / 2, r.y + r.h - 36);
             line({ x: r.x + 22, y: r.y + 16 }, { x: r.x + 22, y: r.y + r.h - 44 }, 3);
             text('cross-axis', r.x + 116, r.y + 42);
             line({ x: k.x + 22, y: k.y + 16 }, { x: k.x + 22, y: k.y + k.h - 16 }, 5);
             text('main-axis', k.x + 108, k.y + 42);
             line({ x: k.x + 44, y: k.y + k.h - 22 }, { x: k.x + k.w - 16, y: k.y + k.h - 22 }, 3);
             text('cross-axis', k.x + k.w - 98, k.y + k.h - 36);`,
  },
  'flex-justify-content': {
    dir: PART_3,
    html: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around']
      .map(v => captioned(v, box(`justify-content: ${v};`, notes(3, () => 'margin: 0 4px;'))))
      .join(''),
  },
  'flex-align-items': {
    dir: PART_3,
    html: `<div class="grid2">${['flex-start', 'flex-end', 'center', 'baseline', 'stretch']
      .map(v => {
        const sizes = [90, 54, 124];
        const fonts = ['font-size: 50px;', 'font-size: 22px;', 'font-size: 36px;'];
        const item = i => {
          if (v === 'stretch') return 'height: auto;';
          if (v === 'baseline') return `height: ${sizes[i]}px; align-items: flex-start; ${fonts[i]}`;
          return `height: ${sizes[i]}px;`;
        };
        const label = () => (v === 'baseline' ? 'Ag' : '');
        return captioned(v, box(`align-items: ${v}; gap: 12px; height: 180px;`, notes(3, item, label)));
      })
      .join('')}</div>`,
  },
  'flex-align-content': {
    dir: PART_3,
    html: `<div class="grid2">${['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch']
      .map(v =>
        captioned(
          v,
          box(
            `flex-wrap: wrap; align-content: ${v}; gap: 8px 10px; height: 300px;`,
            notes(8, () => (v === 'stretch' ? 'height: auto; min-height: 76px;' : '')),
          ),
        ),
      )
      .join('')}</div>`,
  },
  'flex-align-self': {
    dir: PART_3,
    html: captioned(
      'align-items: flex-start',
      box(
        'align-items: flex-start; justify-content: space-between; height: 340px;',
        ['auto', 'flex-start', 'flex-end', 'center', 'stretch']
          .map(
            (v, i) =>
              `<div class="s ${color(i)}" style="align-self: ${v}; width: 160px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 22px; ${v === 'stretch' ? 'height: auto;' : 'height: 100px;'}">${v}</div>`,
          )
          .join(''),
      ),
    ),
  },
  'flex-center': {
    dir: PART_3,
    html: box(
      'justify-content: center; align-items: center; height: 400px;',
      notes(1, () => 'width: 150px; height: 150px;'),
      'centered',
    ),
    arrows: `const c = box('#centered');
             const s = box('#centered > .s');
             line({ x: c.x + 20, y: s.y + s.h / 2 }, { x: s.x - 10, y: s.y + s.h / 2 }, 3);
             line({ x: c.x + c.w - 20, y: s.y + s.h / 2 }, { x: s.x + s.w + 10, y: s.y + s.h / 2 }, 3);
             line({ x: s.x + s.w / 2, y: c.y + 20 }, { x: s.x + s.w / 2, y: s.y - 10 }, 3);
             line({ x: s.x + s.w / 2, y: c.y + c.h - 20 }, { x: s.x + s.w / 2, y: s.y + s.h + 10 }, 3);`,
  },
};

const HELPERS = `
const stage = document.getElementById('stage');
const origin = stage.getBoundingClientRect();
const NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(NS, 'svg');
svg.setAttribute('class', 'over');
svg.innerHTML = '<defs><marker id="h" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#f24726"/></marker></defs>';
stage.append(svg);
const box = sel => {
  const r = document.querySelector(sel).getBoundingClientRect();
  return { x: r.x - origin.x, y: r.y - origin.y, w: r.width, h: r.height };
};
const at = (sel, side) => {
  const b = box(sel);
  return {
    top: { x: b.x + b.w / 2, y: b.y },
    bottom: { x: b.x + b.w / 2, y: b.y + b.h },
    left: { x: b.x, y: b.y + b.h / 2 },
    right: { x: b.x + b.w, y: b.y + b.h / 2 },
    center: { x: b.x + b.w / 2, y: b.y + b.h / 2 },
  }[side];
};
const shift = (p, dx, dy) => ({ x: p.x + dx, y: p.y + dy });
const attrs = (el, values) => {
  for (const [k, v] of Object.entries(values)) el.setAttribute(k, v);
  svg.append(el);
};
const line = (a, b, width = 5) =>
  attrs(document.createElementNS(NS, 'line'), { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#f24726', 'stroke-width': width, 'marker-end': 'url(#h)' });
const path = points =>
  attrs(document.createElementNS(NS, 'polyline'), { points: points.map(q => q.join(',')).join(' '), fill: 'none', stroke: '#f24726', 'stroke-width': 4, 'stroke-linejoin': 'round', 'marker-end': 'url(#h)' });
const text = (value, x, y) => {
  const t = document.createElementNS(NS, 'text');
  t.textContent = value;
  attrs(t, { x, y, fill: '#f24726', 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, 'font-family': 'ui-monospace, Menlo, Consolas, monospace' });
};
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
for (const [name, { dir, html, arrows = '' }] of Object.entries(BODY)) {
  await page.setContent(
    `<!doctype html><html><head><style>${CSS}</style></head><body><div id="stage">${html}</div></body></html>`,
  );
  await page.evaluate(`(() => { ${HELPERS} ${arrows} })()`);
  const file = resolve(dir, `${name}.png`);
  await page.locator('#stage').screenshot({ path: file, omitBackground: true });
  console.log('wrote', file);
}
await browser.close();
