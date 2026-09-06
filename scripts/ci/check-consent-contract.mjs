#!/usr/bin/env node
/**
 * Consent contract: the cookie gate, and the legal documents that describe it,
 * checked against each other.
 *
 * A cookie policy is a statement of fact about what the site writes to a
 * visitor's device. It stops being true the moment the code changes without it,
 * and nothing about that failure is visible on the page. This gate ties the two
 * together:
 *
 *   - the GA4 cookie lifetime lives in one named constant and is passed to
 *     gtag as that constant, never as a literal
 *   - it stays under the 400-day ceiling browsers have enforced since Chrome
 *     M104 (RFC 6265bis), so the declared period is one a browser can honour
 *   - all four legal documents declare that same period, in their own language,
 *     and list the analytics cookies by the names GA4 actually writes
 *   - the built HTML references googletagmanager.com nowhere, which is what
 *     "nothing is loaded before consent" means in practice
 *   - the gtag stub in that HTML pushes `arguments`, not an array: gtag.js
 *     ignores plain arrays, and a shim that pushes one measures nothing while
 *     every surface signal stays green
 *
 * Zero dependencies. Source checks always run; the dist checks are skipped when
 * there is no build to read. Exits non-zero listing every problem.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative, sep } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const DIST_DIR = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(ROOT, 'dist');

const MODEL_SOURCE = 'src/lib/consent-model.ts';
const EFFECTS_SOURCE = 'src/lib/consent.ts';
const GTAG_SOURCE = 'src/data/gtag.ts';
const CONSTANT = 'ANALYTICS_COOKIE_EXPIRES_SECONDS';

/** Chrome has capped cookie lifetimes here since M104 (RFC 6265bis). */
const BROWSER_CAP_SECONDS = 34_560_000;

/**
 * How each supported period is written out, per document language.
 *
 * Deliberately a closed map: changing the constant without adding the matching
 * wording fails here rather than silently leaving four documents describing a
 * retention period the site no longer uses.
 */
const WORDING = {
  13: { pl: '13 miesięcy', en: '13 months' },
};

const DOCUMENTS = [
  { path: 'src/pages/polityka-cookies.astro', lang: 'pl', cookies: true },
  { path: 'src/pages/cookie-policy.astro', lang: 'en', cookies: true },
  { path: 'src/pages/polityka-prywatnosci.astro', lang: 'pl', cookies: false },
  { path: 'src/pages/privacy-policy.astro', lang: 'en', cookies: false },
];

/** Hosts that serve the tag loader; compared as whole hostnames, never as substrings. */
const TAG_HOSTS = new Set(['googletagmanager.com', 'www.googletagmanager.com']);

const ABSOLUTE_URL = /https?:\/\/[^\s"'`<>\\)]+/g;

const isTagHost = url => {
  try {
    return TAG_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
};

const problems = [];
const fail = msg => problems.push(msg);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const read = path => readFile(join(ROOT, path), 'utf8');

async function collectFiles(dir, extension) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return collectFiles(full, extension);
      return entry.name.endsWith(extension) ? [full] : [];
    }),
  );
  return files.flat();
}

async function checkSource() {
  const model = await read(MODEL_SOURCE);
  const declaration = model.match(new RegExp(`export const ${CONSTANT} = ([\\d_]+);`));

  if (!declaration) {
    fail(
      `${MODEL_SOURCE}: does not export ${CONSTANT}. The cookie lifetime must live in one named constant so the legal documents have a single value to mirror.`,
    );
    return null;
  }

  const seconds = Number(declaration[1].replaceAll('_', ''));
  const days = Math.round(seconds / 86400);
  const months = Math.round(days / 30);

  if (seconds > BROWSER_CAP_SECONDS) {
    fail(
      `${MODEL_SOURCE}: ${CONSTANT} is ${seconds}s (${days} days), above the ${BROWSER_CAP_SECONDS}s (400 day) ceiling browsers enforce. The browser would truncate the cookie, making the declared period unachievable.`,
    );
  }

  const effects = await read(EFFECTS_SOURCE);
  if (!new RegExp(`cookie_expires: ${CONSTANT}\\b`).test(effects)) {
    fail(
      `${EFFECTS_SOURCE}: gtag config does not pass ${CONSTANT} to cookie_expires. A literal there drifts from the declared period unnoticed.`,
    );
  }

  if (!/CONSENT_MAX_AGE_MS = ANALYTICS_COOKIE_EXPIRES_SECONDS \* 1000/.test(model)) {
    fail(
      `${MODEL_SOURCE}: CONSENT_MAX_AGE_MS must be derived from ${CONSTANT}. A consent record that expires first leaves the analytics cookies on the device with nothing on record to justify them.`,
    );
  }

  return { seconds, days, months };
}

async function checkDocuments({ months }) {
  const declared = WORDING[months];

  if (!declared) {
    fail(
      `scripts/ci/check-consent-contract.mjs: no wording registered for ${months} month(s). Add it to WORDING together with the change to ${CONSTANT}.`,
    );
    return;
  }

  const gtag = await read(GTAG_SOURCE);
  const measurementId = gtag.match(/export const GTAG = '([^']+)'/)?.[1];
  if (!measurementId) {
    fail(`${GTAG_SOURCE}: could not read the GTAG measurement ID.`);
    return;
  }

  // GA4 strips the G- prefix when it builds the session cookie name. Read from
  // the browser after a real acceptance, never from the vendor documentation.
  const sessionCookie = `_ga_${measurementId.replace(/^G-/, '')}`;

  for (const { path, lang, cookies } of DOCUMENTS) {
    const source = await read(path);
    const wording = declared[lang];

    if (!source.includes(wording)) {
      fail(
        `${path}: does not declare "${wording}" while ${CONSTANT} is ${months} month(s). The document and the code disagree about how long the analytics cookies live.`,
      );
    }

    if (!cookies) continue;

    for (const name of ['_ga', sessionCookie]) {
      // The session cookie is interpolated from GTAG, so accept either the
      // literal name or the expression that produces it.
      const present = source.includes(`<code>${name}</code>`) || source.includes('{sessionCookie}');
      if (!present) {
        fail(
          `${path}: no entry for the ${name} cookie. Every analytics cookie must stay listed with its retention period.`,
        );
      }
    }
  }
}

async function checkDist() {
  if (!(await exists(DIST_DIR))) {
    console.log('  · dist/ not found, skipping the built-output checks.');
    return;
  }

  const pages = await collectFiles(DIST_DIR, '.html');
  if (pages.length === 0) {
    fail('no HTML pages found in dist');
    return;
  }

  let stubs = 0;

  for (const page of pages) {
    const rel = relative(DIST_DIR, page).split(sep).join('/');
    const html = await readFile(page, 'utf8');

    // The whole point of the gate: the loader is injected by the consent island
    // after a decision, so it must not be reachable from the static HTML. Hosts
    // are compared as parsed hostnames rather than as substrings, so an
    // unrelated URL that merely contains the string cannot mask a real one.
    for (const url of html.match(ABSOLUTE_URL) ?? []) {
      if (isTagHost(url)) {
        fail(
          `${rel}: references ${url} in the HTML. The loader must be injected only after consent, never shipped in the page.`,
        );
      }
    }

    if (html.includes("gtag('consent','default'")) {
      stubs += 1;
      if (!html.includes('dataLayer.push(arguments)')) {
        fail(
          `${rel}: the gtag stub does not push \`arguments\`. gtag.js ignores plain arrays, so commands would be silently dropped.`,
        );
      }
    }
  }

  if (stubs === 0) {
    fail('no page carries the Consent Mode defaults. Without them gtag has no denied baseline to start from.');
  }

  // The loader has to exist somewhere: in the client bundle, built at runtime.
  const scripts = await collectFiles(DIST_DIR, '.js');
  const bundled = await Promise.all(scripts.map(file => readFile(file, 'utf8')));
  if (!bundled.some(code => code.includes('googletagmanager.com/gtag/js'))) {
    fail(
      'no client bundle builds the googletagmanager.com/gtag/js loader. Consent would grant analytics that never load.',
    );
  }

  console.log(`  · ${pages.length} page(s) checked, ${stubs} carrying the Consent Mode defaults.`);
}

async function main() {
  console.log('Consent contract\n');

  const retention = await checkSource();
  if (retention) {
    await checkDocuments(retention);
  }
  await checkDist();

  if (problems.length > 0) {
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    console.error(`\nConsent contract failed: ${problems.length} problem(s).`);
    process.exit(1);
  }

  console.log(
    `  ✓ ${CONSTANT} = ${retention.seconds}s (${retention.days} days), declared as "${WORDING[retention.months].pl}" / "${WORDING[retention.months].en}" in ${DOCUMENTS.length} document(s); no pre-consent loader in the built HTML.`,
  );
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
