// Blocks AI attribution in commit messages and the PR title/description, per
// the project rule (CLAUDE.md > "Git i pull requesty"): no `Co-Authored-By`,
// `Claude-Session` or "Generated with Claude Code" footers anywhere. Runs in CI
// on pull_request. Zero dependencies.
import { execSync } from 'node:child_process';

const PATTERNS = [
  /generated with .{0,40}claude/i,
  /co-?authored-by:\s*claude/i,
  /claude-session/i,
  /claude\.ai\/code/i,
  /🤖\s*generated/i,
];

const sources = [];

// PR title and description are passed by the workflow via env so the body is
// never interpolated into a shell command (avoids injection).
for (const [label, value] of [
  ['PR title', process.env.PR_TITLE],
  ['PR description', process.env.PR_BODY],
]) {
  if (value && value.trim()) {
    sources.push({ label, text: value });
  }
}

// Commit messages on the PR (base..head). The workflow passes both SHAs and
// fetches full history so the range resolves.
const base = process.env.BASE_SHA;
const head = process.env.HEAD_SHA;
if (base && head) {
  const log = execSync(`git log -z --format=%B ${base}..${head}`, { encoding: 'utf8' });
  for (const message of log.split('\0')) {
    if (message.trim()) {
      sources.push({ label: 'commit message', text: message });
    }
  }
}

const violations = [];
for (const { label, text } of sources) {
  for (const pattern of PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      violations.push(`${label}: "${match[0].trim()}"`);
    }
  }
}

if (violations.length) {
  console.error('✗ Forbidden AI attribution found:');
  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }
  console.error(
    '\nRemove AI attribution (Co-Authored-By, Claude-Session, "Generated with Claude Code", 🤖 footers, …) from commit messages and the PR title/description. See CLAUDE.md.',
  );
  process.exit(1);
}

console.log('✓ No AI attribution in commit messages or PR title/description.');
