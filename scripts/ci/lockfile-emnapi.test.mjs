import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// @astrojs/astro2tsx (used by `astro check`) ships only a WASM build loaded
// through @napi-rs/wasm-runtime, whose @emnapi/runtime peer is declared as
// "^1.7.1 || ^2.0.0-alpha.4". pnpm once satisfied it with 2.0.0-alpha.3, hoisted
// from @astrojs/compiler-rs, and the mismatched pair crashed `astro check` with
// "this.bridge.setLastError is not a function". The packageExtensions entry in
// package.json pins the runtime astro2tsx is built against; this guards it.
const LOCKFILE = readFileSync(new URL('../../pnpm-lock.yaml', import.meta.url), 'utf8');

function satisfiesWasmRuntimePeer(version) {
  const [core, pre] = version.split('-');
  const [major, minor, patch] = core.split('.').map(Number);
  if (major === 1) return !pre && (minor > 7 || (minor === 7 && patch >= 1));
  if (major === 2) {
    if (!pre) return true;
    const alpha = /^alpha\.(\d+)$/.exec(pre);
    return minor > 0 || patch > 0 || (alpha !== null && Number(alpha[1]) >= 4);
  }
  return false;
}

describe('pnpm-lock.yaml @emnapi peers for astro2tsx', () => {
  const snapshot = /^ {2}'@astrojs\/astro2tsx@0\.1\.3[^']*':\n((?: {4}.*\n)+)/m.exec(LOCKFILE.split('snapshots:')[1]);
  const wasmRuntime = /'@napi-rs\/wasm-runtime': [^\n]*\(@emnapi\/runtime@([^)]+)\)/.exec(snapshot?.[1] ?? '');

  it('resolves astro2tsx and its @napi-rs/wasm-runtime', () => {
    expect(wasmRuntime).not.toBeNull();
  });

  it('gives that @napi-rs/wasm-runtime an @emnapi/runtime inside its peer range', () => {
    expect(satisfiesWasmRuntimePeer(wasmRuntime?.[1] ?? '')).toBe(true);
  });

  it('keeps astro2tsx on the runtime it is built against', () => {
    expect(snapshot?.[1]).toContain("'@emnapi/runtime': 1.11.3");
  });
});
