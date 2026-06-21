// Validates that a pull request description actually fills in the repository
// template (.github/pull_request_template.md) rather than leaving it as the
// empty scaffold. Pairs with the Conventional-Commits PR-title gate to keep PR
// metadata high-signal. Zero dependencies; runs in CI on pull_request.
//
// The body is passed via env (PR_BODY) so it is never interpolated into a
// shell command. Importable: `validatePrBody` is pure and unit-tested.

const REQUIRED_HEADINGS = ['## Description', '## Type of change', '## Related issue', '## Checklist'];

// Strip HTML comments (the template's guidance lives in them) so "did the
// author write anything real?" checks see only authored prose.
const stripComments = text => text.replace(/<!--[\s\S]*?-->/g, '');

// Return the text under `heading` up to the next `## ` heading (or end).
const sectionBody = (body, heading) => {
  const start = body.indexOf(heading);
  if (start === -1) return null;
  const after = body.slice(start + heading.length);
  const next = after.search(/\n## /);
  return next === -1 ? after : after.slice(0, next);
};

export function validatePrBody(rawBody) {
  const errors = [];
  const body = (rawBody ?? '').trim();

  if (!body) {
    return ['The PR description is empty. Fill in the template (.github/pull_request_template.md).'];
  }

  for (const heading of REQUIRED_HEADINGS) {
    if (!body.includes(heading)) {
      errors.push(`Missing required section: "${heading}".`);
    }
  }

  const description = sectionBody(body, '## Description');
  if (description !== null && !stripComments(description).trim()) {
    errors.push('The "## Description" section is empty — describe what the PR changes and why.');
  }

  // At least one "Type of change" box must be ticked: "- [x]".
  if (!/^\s*-\s*\[x\]/im.test(body)) {
    errors.push('Tick at least one box under "## Type of change" (use "- [x]").');
  }

  return errors;
}

// CLI entry point: run only when executed directly, not when imported by tests.
const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  const errors = validatePrBody(process.env.PR_BODY);
  if (errors.length) {
    console.error('✗ The PR description does not follow the template:');
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    console.error('\nEdit the PR description to match .github/pull_request_template.md.');
    process.exit(1);
  }
  console.log('✓ PR description follows the template.');
}
