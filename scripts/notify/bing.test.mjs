import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'bing.sh');
const SITE = 'https://dawidrylko.com';

// Stands in for curl: logs every requested URL, stores each submitted payload
// as one compact JSON line, and answers with the status and body the test set.
const CURL_STUB = `#!/bin/sh
url=""; payload=""
while [ $# -gt 0 ]; do
  case "$1" in
    -d) shift; payload="$1" ;;
    http*) url="$1" ;;
  esac
  shift
done
echo "$url" >> "$STUB_DIR/calls"
case "$url" in
  *GetUrlSubmissionQuota*) printf '%s\\n%s' "$STUB_QUOTA_BODY" "$STUB_QUOTA_STATUS" ;;
  *)
    jq -c . "\${payload#@}" >> "$STUB_DIR/payloads"
    printf '%s\\n%s' "$STUB_SUBMIT_BODY" "$STUB_SUBMIT_STATUS"
    ;;
esac
`;

const BASE_FILES = {
  'content/pl/2020-01-01--stary-wpis/index.mdx': '---\ntitle: Stary\n---\nTekst\n',
  'content/pl/2021-02-02--drugi-wpis/index.md': '---\ntitle: Drugi\n---\nTekst\n',
  'content/pl/2022-03-03--ukryty/index.mdx': '---\ntitle: Ukryty\nnoIndex: true\n---\nTekst\n',
  'src/pages/index.astro': '<Page />\n',
  'src/pages/setup.astro': '<Page />\n',
  'src/pages/cookie-policy.astro': '<PageLayout noIndexFollow />\n',
  'src/layouts/PageLayout.astro': '<html />\n',
};

const tempDirs = [];

afterEach(() => {
  while (tempDirs.length) rmSync(tempDirs.pop(), { recursive: true, force: true });
});

function git(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

function writeFiles(root, files) {
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    if (content === null) {
      rmSync(target);
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

// A repo with the base commit (the previous deploy) and one commit on top that
// applies `changes`; a null value deletes the file.
function makeRepo(changes, { rootOnly = false, corruptBase = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'bing-notify-'));
  tempDirs.push(root);
  const repo = join(root, 'repo');
  mkdirSync(repo);
  git(repo, 'init', '--quiet');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'user.name', 'Test');
  git(repo, 'config', 'commit.gpgsign', 'false');
  writeFiles(repo, BASE_FILES);
  git(repo, 'add', '-A');
  git(repo, 'commit', '--quiet', '-m', 'base');
  const before = git(repo, 'rev-parse', 'HEAD');
  if (rootOnly) return { root, repo, before };
  writeFiles(repo, changes);
  git(repo, 'add', '-A');
  git(repo, 'commit', '--quiet', '--allow-empty', '-m', 'change');
  if (corruptBase) {
    const tree = git(repo, 'rev-parse', `${before}^{tree}`);
    rmSync(join(repo, '.git', 'objects', tree.slice(0, 2), tree.slice(2)), { force: true });
  }
  return { root, repo, before };
}

function run(
  changes,
  {
    quota = 100,
    quotaStatus = 200,
    submitStatus = 200,
    submitBody = '{"d":null}',
    rootOnly = false,
    corruptBase = false,
    env = {},
  } = {},
) {
  const { root, repo, before } = makeRepo(changes, { rootOnly, corruptBase });
  const stubDir = join(root, 'stub');
  mkdirSync(stubDir);
  const curl = join(stubDir, 'curl');
  writeFileSync(curl, CURL_STUB);
  chmodSync(curl, 0o755);

  const result = spawnSync('bash', [SCRIPT], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 20_000,
    env: {
      ...process.env,
      PATH: `${stubDir}:${process.env.PATH}`,
      STUB_DIR: stubDir,
      STUB_QUOTA_BODY: JSON.stringify({ d: { DailyQuota: quota, MonthlyQuota: 2800 } }),
      STUB_QUOTA_STATUS: String(quotaStatus),
      STUB_SUBMIT_BODY: submitBody,
      STUB_SUBMIT_STATUS: String(submitStatus),
      BING_API_KEY: 'test-key',
      BEFORE_SHA: before,
      BING_INITIAL_BACKOFF: '0',
      ...env,
    },
  });

  const read = name => {
    const file = join(stubDir, name);
    return existsSync(file) ? readFileSync(file, 'utf8').trim().split('\n').filter(Boolean) : [];
  };
  const calls = read('calls');
  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
    submits: calls.filter(url => url.includes('SubmitUrlbatch')).length,
    payloads: read('payloads').map(line => JSON.parse(line)),
  };
}

const QUOTA_SPENT = JSON.stringify({ ErrorCode: 8, Message: 'ERROR!!! Quota remaining for today: 8, Submitted: 46' });

describe('bing.sh', () => {
  it('submits only the URLs whose sources changed since the previous deploy', () => {
    const result = run({
      'content/pl/2020-01-01--stary-wpis/index.mdx': '---\ntitle: Stary\n---\nNowy tekst\n',
      'src/pages/setup.astro': '<Page changed />\n',
    });

    expect(result.status).toBe(0);
    expect(result.payloads).toEqual([
      { siteUrl: SITE, urlList: [`${SITE}/stary-wpis/`, `${SITE}/setup/`, `${SITE}/`, `${SITE}/blog/`] },
    ]);
  });

  it('submits nothing when only shared code changed', () => {
    const result = run({ 'src/layouts/PageLayout.astro': '<html lang="pl" />\n' });

    expect(result.status).toBe(0);
    expect(result.submits).toBe(0);
    expect(result.output).toContain('nothing to submit');
  });

  it('submits a changed static page without the post listings', () => {
    const result = run({ 'src/pages/setup.astro': '<Page changed />\n' });

    expect(result.payloads[0].urlList).toEqual([`${SITE}/setup/`]);
  });

  it('maps new posts, post assets, secondary pages and the homepage, newest post first', () => {
    const result = run({
      'content/pl/2026-10-14--nowy-wpis/index.mdx': '---\ntitle: Nowy\n---\nTekst\n',
      'content/pl/2021-02-02--drugi-wpis/cover.jpg': 'jpg',
      'content/pl/2021-02-02--drugi-wpis/ng-help.md': '---\ntitle: Pomoc\n---\nTekst\n',
      'content/pl/2021-02-02--drugi-wpis/chart-source/data.csv': 'a,b\n',
      'src/pages/index.astro': '<Page changed />\n',
    });

    expect(result.payloads[0].urlList).toEqual([
      `${SITE}/nowy-wpis/`,
      `${SITE}/drugi-wpis/`,
      `${SITE}/drugi-wpis/ng-help/`,
      `${SITE}/`,
      `${SITE}/blog/`,
    ]);
  });

  it('skips deleted posts and pages kept out of the index', () => {
    const result = run({
      'content/pl/2021-02-02--drugi-wpis/index.md': null,
      'content/pl/2022-03-03--ukryty/index.mdx': '---\ntitle: Ukryty\nnoIndex: true\n---\nZmiana\n',
      'src/pages/cookie-policy.astro': '<PageLayout noIndexFollow changed />\n',
      'src/pages/404.astro': '<Page />\n',
      'content/pl/2022-03-03--ukryty/cover.jpg': 'jpg',
      'content/pl/2023-04-04--bez-indeksu/data.csv': 'a,b\n',
      'content/pl/2023-05-05--crlf/index.md': '---\r\ntitle: CRLF\r\nnoIndex: true # draft\r\n---\r\nTekst\r\n',
    });

    expect(result.status).toBe(0);
    expect(result.submits).toBe(0);
  });

  it('caps the batch at the remaining daily quota', () => {
    const result = run(
      {
        'content/pl/2020-01-01--stary-wpis/index.mdx': '---\ntitle: Stary\n---\nNowy\n',
        'content/pl/2021-02-02--drugi-wpis/index.md': '---\ntitle: Drugi\n---\nNowy\n',
      },
      { quota: 1 },
    );

    expect(result.status).toBe(0);
    expect(result.payloads[0].urlList).toEqual([`${SITE}/drugi-wpis/`]);
    expect(result.output).toMatch(/::warning.*not submitted: .*\/stary-wpis\/ .*\/blog\//);
  });

  it('does not submit at all when the daily quota is already spent', () => {
    const result = run({ 'src/pages/setup.astro': '<Page changed />\n' }, { quota: 0 });

    expect(result.status).toBe(0);
    expect(result.submits).toBe(0);
    expect(result.output).toContain('::warning');
  });

  it('treats ErrorCode 8 as a one-shot warning instead of retrying and failing', () => {
    const result = run(
      { 'src/pages/setup.astro': '<Page changed />\n' },
      { submitStatus: 400, submitBody: QUOTA_SPENT },
    );

    expect(result.status).toBe(0);
    expect(result.submits).toBe(1);
    expect(result.output).toContain('::warning');
  });

  it('fails without retrying when Bing rejects the request', () => {
    const result = run(
      { 'src/pages/setup.astro': '<Page changed />\n' },
      { submitStatus: 400, submitBody: '{"ErrorCode": 3, "Message": "InvalidApiKey"}' },
    );

    expect(result.status).toBe(1);
    expect(result.submits).toBe(1);
    expect(result.output).toContain('::error');
  });

  it.each([503, 429])('retries HTTP %i before failing', submitStatus => {
    const result = run({ 'src/pages/setup.astro': '<Page changed />\n' }, { submitStatus, submitBody: '' });

    expect(result.status).toBe(1);
    expect(result.submits).toBe(4);
    expect(result.output).toContain(`HTTP ${submitStatus}`);
  });

  it('submits every changed URL when Bing does not report the quota', () => {
    const result = run({ 'src/pages/setup.astro': '<Page changed />\n' }, { quotaStatus: 500 });

    expect(result.status).toBe(0);
    expect(result.payloads[0].urlList).toEqual([`${SITE}/setup/`]);
  });

  it.each([
    ['zeroed', '0000000000000000000000000000000000000000'],
    ['unreachable', 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef'],
  ])('falls back to the parent commit when the previous deploy sha is %s', (_, sha) => {
    const result = run({ 'src/pages/setup.astro': '<Page changed />\n' }, { env: { BEFORE_SHA: sha } });

    expect(result.status).toBe(0);
    expect(result.payloads[0].urlList).toEqual([`${SITE}/setup/`]);
  });

  it('fails instead of reporting nothing changed when the diff cannot be computed', () => {
    const result = run({ 'src/pages/setup.astro': '<Page changed />\n' }, { corruptBase: true });

    expect(result.status).toBe(1);
    expect(result.submits).toBe(0);
    expect(result.output).toContain('Failed listing the files changed');
  });

  it('skips when there is no previous commit to diff against', () => {
    const result = run({}, { rootOnly: true, env: { BEFORE_SHA: '' } });

    expect(result.status).toBe(0);
    expect(result.submits).toBe(0);
    expect(result.output).toContain('No previous commit');
  });

  it('skips without calling Bing when the API key is missing', () => {
    const result = run({ 'src/pages/setup.astro': '<Page changed />\n' }, { env: { BING_API_KEY: '' } });

    expect(result.status).toBe(0);
    expect(result.submits).toBe(0);
  });
});
