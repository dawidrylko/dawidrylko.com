// Enforces the project's single-source styling convention (CLAUDE.md >
// "Konwencje kodu" > "Style"): all CSS lives in src/styles/main.css, so .astro
// files and components must NOT carry scoped `<style>` blocks. Scoped styles
// would also escape Stylelint, which only lints src/**/*.css. Runs in CI on
// pull_request. Zero dependencies; `findScopedStyleViolations` is pure and
// unit-tested.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Matches an opening <style> tag (with or without attributes such as
// `is:global`/`define:vars`), so every form of an Astro scoped style is caught.
const STYLE_TAG = /<style(\s[^>]*)?>/i;

// Pure: given [{ path, content }], return the paths that contain a <style> tag.
export function findScopedStyleViolations(files) {
  return files.filter(({ content }) => STYLE_TAG.test(content)).map(({ path }) => path);
}

// Recursively collect every .astro file under `dir`.
function collectAstroFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectAstroFiles(full));
    } else if (entry.endsWith('.astro')) {
      out.push(full);
    }
  }
  return out;
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  const files = collectAstroFiles('src').map(path => ({ path, content: readFileSync(path, 'utf8') }));
  const violations = findScopedStyleViolations(files);

  if (violations.length) {
    console.error('✗ Scoped <style> blocks found in .astro files:');
    for (const path of violations) {
      console.error(`  - ${path}`);
    }
    console.error('\nMove the styles to src/styles/main.css (global, design-token based). See CLAUDE.md.');
    process.exit(1);
  }

  console.log('✓ No scoped <style> blocks in .astro files.');
}
