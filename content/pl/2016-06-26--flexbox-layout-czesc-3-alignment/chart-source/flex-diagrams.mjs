// Generates the diagrams of the three Flexbox Layout posts. Every layout is real
// CSS flexbox rendered in Chromium, so a picture cannot disagree with the property
// it shows. Run on macOS, whose Bradley Hand and Menlo fonts the set is drawn with,
// from the repository root:
//   node content/pl/2016-06-26--flexbox-layout-czesc-3-alignment/chart-source/flex-diagrams.mjs
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';

const PART_1 = 'content/pl/2016-05-14--flexbox-layout-czesc-1-parent-container';
const PART_2 = 'content/pl/2016-06-05--flexbox-layout-czesc-2-children-items';
const PART_3 = 'content/pl/2016-06-26--flexbox-layout-czesc-3-alignment';

const COLORS = ['salmon', 'purple', 'pale', 'yellow', 'pink', 'orange'];
const color = i => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];

const CSS = `
* { box-sizing: border-box; margin: 0; }
body { background: #fff; font-family: "Open Sans", "Helvetica Neue", Arial, sans-serif; }
#stage { position: relative; width: 1000px; padding: 44px; background: #fff; display: flex; flex-direction: column; gap: 30px; }
.c { display: flex; background: #ededed; border-radius: 26px; padding: 16px; isolation: isolate; }
.s { position: relative; flex: none; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 32px; color: #1a1a1a; }
.s::after { content: ""; position: absolute; left: 12%; right: 12%; bottom: -3px; height: 7px; background: rgba(0, 0, 0, 0.32); filter: blur(4px); z-index: -1; }
.s:nth-child(3n + 1) { transform: rotate(-0.5deg); }
.s:nth-child(3n + 2) { transform: rotate(0.4deg); }
.salmon { background: linear-gradient(165deg, #ee8f9a, #f3a2aa); }
.purple { background: linear-gradient(165deg, #c29fd2, #cdafdb); }
.pale { background: linear-gradient(165deg, #fdf3ab, #fef8b6); }
.yellow { background: linear-gradient(165deg, #f3d025, #f5d944); }
.pink { background: linear-gradient(165deg, #e78fb9, #eca2c8); }
.orange { background: linear-gradient(165deg, #fe9f4a, #ffaa5d); }
.row { display: flex; flex-direction: column; gap: 10px; }
.cap { font-family: Menlo, Consolas, monospace; font-size: 27px; font-weight: 700; color: #1a1a1a; }
.hand { font-family: "Bradley Hand", "Segoe Print", cursive; font-weight: 700; font-size: 58px; color: #f24726; text-align: center; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
svg.over { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5; }
`;

const notes = (n, style = () => '', label = () => '') =>
  Array.from({ length: n }, (_, i) => `<div class="s ${color(i)}" style="${style(i)}">${label(i)}</div>`).join('');

const box = (css, inner, id = '') => `<div class="c" ${id ? `id="${id}"` : ''} style="${css}">${inner}</div>`;
const captioned = (cap, inner) => `<div class="row"><div class="cap">${cap}</div>${inner}</div>`;
const numbered = i => i + 1;
// Source order is shuffled on purpose: only the order property sorts these notes.
const ordered = values =>
  values
    .map((v, i) => {
      const position = [...values].sort((x, y) => x - y).indexOf(v);
      return `<div class="s ${color(position)}" style="order: ${v}; width: 120px; height: 120px;">${v}</div>`;
    })
    .join('');

const BODY = {
  'flex-container': {
    dir: PART_1,
    html: `<div class="hand" id="label" style="margin-bottom: 40px;">Kontener</div>${box('flex-wrap: wrap; justify-content: center; gap: 16px; padding: 44px 100px;', notes(28), 'target')}`,
    arrows: `line(at('#label', 'bottom'), at('#target', 'top'));`,
  },
  'flex-direction': {
    dir: PART_1,
    html: `<div class="grid2">
      ${captioned('row', box('flex-direction: row; gap: 8px;', notes(4, () => 'width: 92px;', numbered), 'a'))}
      ${captioned('column', box('flex-direction: column; gap: 8px; align-items: center;', notes(4, () => '', numbered), 'c'))}
      ${captioned('row-reverse', box('flex-direction: row-reverse; gap: 8px;', notes(4, () => 'width: 92px;', numbered), 'b'))}
      ${captioned('column-reverse', box('flex-direction: column-reverse; gap: 8px; align-items: center;', notes(4, () => '', numbered), 'd'))}
    </div>`,
    arrows: `for (const id of ['#a', '#b']) line(shift(at(id + ' > :nth-child(1)', 'center'), 0, 28), shift(at(id + ' > :nth-child(4)', 'center'), 0, 28), 4);
             for (const id of ['#c', '#d']) line(shift(at(id + ' > :nth-child(1)', 'center'), 30, 0), shift(at(id + ' > :nth-child(4)', 'center'), 30, 0), 4);`,
  },
  'flex-wrap': {
    dir: PART_1,
    html: box('flex-wrap: wrap; gap: 60px 16px; padding: 44px 100px;', notes(14), 'w'),
    arrows: `const last = at('#w > :nth-child(7)', 'right');
             const next = at('#w > :nth-child(8)', 'left');
             const y = (at('#w > :nth-child(7)', 'bottom').y + at('#w > :nth-child(8)', 'top').y) / 2;
             path([[last.x + 4, last.y], [last.x + 34, last.y], [last.x + 34, y], [next.x - 34, y], [next.x - 34, next.y], [next.x - 8, next.y]]);`,
  },
  'flex-children': {
    dir: PART_2,
    html: `<div class="hand" id="label">Potomkowie</div>${box('flex-wrap: wrap; justify-content: center; gap: 16px; padding: 90px 100px 44px;', notes(28), 'target')}`,
    arrows: `for (const n of [1, 3, 5, 7]) line(at('#label', 'bottom'), at('#target > :nth-child(' + n + ')', 'top'));`,
  },
  'flex-order': {
    dir: PART_2,
    html: `<div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div class="row" style="gap: 24px;">
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
          'gap: 16px;',
          values.map((v, i) => `<div class="s ${color(i)}" style="flex: ${v} 1 0; width: auto;">${v}</div>`).join(''),
        ),
      )
      .join(''),
  },
  'flex-axes': {
    dir: PART_3,
    html: `<div class="grid2">
      ${captioned('flex-direction: row', box('gap: 10px; height: 400px; align-items: center; justify-content: center;', notes(3), 'r'))}
      ${captioned('flex-direction: column', box('flex-direction: column; gap: 10px; height: 400px; align-items: center; justify-content: center;', notes(3), 'k'))}
    </div>`,
    arrows: `const r = box('#r');
             const k = box('#k');
             line({ x: r.x + 16, y: r.y + r.h - 22 }, { x: r.x + r.w - 16, y: r.y + r.h - 22 }, 5);
             text('main-axis', r.x + r.w / 2, r.y + r.h - 34);
             line({ x: r.x + 22, y: r.y + 16 }, { x: r.x + 22, y: r.y + r.h - 44 }, 3);
             text('cross-axis', r.x + 110, r.y + 40);
             line({ x: k.x + 22, y: k.y + 16 }, { x: k.x + 22, y: k.y + k.h - 16 }, 5);
             text('main-axis', k.x + 110, k.y + 40);
             line({ x: k.x + 44, y: k.y + k.h - 22 }, { x: k.x + k.w - 16, y: k.y + k.h - 22 }, 3);
             text('cross-axis', k.x + k.w - 100, k.y + k.h - 34);`,
  },
  'flex-justify-content': {
    dir: PART_3,
    html: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around']
      .map(v => captioned(v, box(`justify-content: ${v};`, notes(3, () => 'margin: 0 3px;'))))
      .join(''),
  },
  'flex-align-items': {
    dir: PART_3,
    html: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch']
      .map(v => {
        const sizes = [100, 60, 130];
        const fonts = ['font-size: 54px;', 'font-size: 24px;', 'font-size: 40px;'];
        const item = i => {
          if (v === 'stretch') return 'height: auto;';
          if (v === 'baseline') return `height: ${sizes[i]}px; align-items: flex-start; ${fonts[i]}`;
          return `height: ${sizes[i]}px;`;
        };
        const label = () => (v === 'baseline' ? 'Ag' : '');
        return captioned(v, box(`align-items: ${v}; gap: 12px; height: 190px;`, notes(3, item, label)));
      })
      .join(''),
  },
  'flex-align-content': {
    dir: PART_3,
    html: `<div class="grid2">${['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch']
      .map(v =>
        captioned(
          v,
          box(
            `flex-wrap: wrap; align-content: ${v}; gap: 6px 8px; height: 330px;`,
            notes(8, () => (v === 'stretch' ? 'height: auto; min-height: 84px;' : '')),
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
              `<div class="s ${color(i)}" style="align-self: ${v}; width: 160px; font-family: Menlo, Consolas, monospace; font-size: 22px; ${v === 'stretch' ? 'height: auto;' : 'height: 110px;'}">${v}</div>`,
          )
          .join(''),
      ),
    ),
  },
  'flex-center': {
    dir: PART_3,
    html: box(
      'justify-content: center; align-items: center; height: 420px;',
      notes(1, () => 'width: 150px; height: 150px;'),
      'centered',
    ),
    arrows: `const c = box('#centered');
             const s = box('#centered > .s');
             line({ x: c.x + 20, y: s.y + s.h / 2 }, { x: s.x - 8, y: s.y + s.h / 2 }, 3);
             line({ x: c.x + c.w - 20, y: s.y + s.h / 2 }, { x: s.x + s.w + 8, y: s.y + s.h / 2 }, 3);
             line({ x: s.x + s.w / 2, y: c.y + 20 }, { x: s.x + s.w / 2, y: s.y - 8 }, 3);
             line({ x: s.x + s.w / 2, y: c.y + c.h - 20 }, { x: s.x + s.w / 2, y: s.y + s.h + 8 }, 3);`,
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
const line = (a, b, width = 6) =>
  attrs(document.createElementNS(NS, 'line'), { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '#f24726', 'stroke-width': width, 'marker-end': 'url(#h)' });
const path = points =>
  attrs(document.createElementNS(NS, 'polyline'), { points: points.map(q => q.join(',')).join(' '), fill: 'none', stroke: '#f24726', 'stroke-width': 4, 'stroke-linejoin': 'round', 'marker-end': 'url(#h)' });
const text = (value, x, y) => {
  const t = document.createElementNS(NS, 'text');
  t.textContent = value;
  attrs(t, { x, y, fill: '#f24726', 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, 'font-family': 'Menlo, Consolas, monospace' });
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
  await page.locator('#stage').screenshot({ path: file });
  console.log('wrote', file);
}
await browser.close();
