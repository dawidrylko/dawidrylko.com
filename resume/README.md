# resume

LaTeX sources for the CV published at [`/resume-pl.pdf`](https://dawidrylko.com/resume-pl.pdf) and
[`/resume-en.pdf`](https://dawidrylko.com/resume-en.pdf), linked from the
[`/bio/`](https://dawidrylko.com/bio/) page.

The PDFs are **build output, not source**: they are gitignored and recompiled from these files by
`pnpm build`, which writes them into `static/` (Astro's `publicDir`) just before `astro build` copies
them into `dist/`. Editing a `.tex` file here and rebuilding is the only way to change the published
CV. There is no PDF in the repository to edit.

## Layout

```
pl.tex  en.tex        # entry points: personal data, layout knobs, section order
awesome-cv.cls        # vendored Awesome-CV class, shared by both languages
pl/  en/              # summary, skills, experience, education per language
fonts/                # Roboto family loaded by fontspec via \fontdir
Dockerfile            # Tectonic image used when it is not installed locally
```

Both languages share one class file. The only string it needs per language is the label on the
skills line of `\cventry`, exposed as `\acvEntrySkillsLabel` (defaults to `Skills:`, and `pl.tex`
renews it to `Umiejętności:`). Keep it that way: a second copy of the class is how the two drift
apart.

## Building

```bash
pnpm build:resume        # force a rebuild of both PDFs
pnpm build               # builds the CVs first, then the site
```

The build is incremental. A PDF is recompiled only when its own sources, the shared class or the
fonts are newer than it. `pnpm dev` builds them too, but treats a missing toolchain as a warning
rather than an error, so the site still runs on a machine that can build neither.

## Toolchain

Tectonic is the only engine. `scripts/resume/build-resume.mjs` takes the first way it can reach it:

| Engine     | How to get it           | Notes                                                     |
| ---------- | ----------------------- | --------------------------------------------------------- |
| `tectonic` | `brew install tectonic` | Fastest. A local install, same as CI uses.                |
| `docker`   | Docker Desktop running  | Zero-install, via the image built from `Dockerfile` here. |

**Do not swap in another engine.** They do not agree on this document: xelatex from TeX Live 2026
lays the `\cventry` skills line on top of the bullets above it, where Tectonic renders it correctly.
Both paths above therefore run the same Tectonic release, and produce renders that are identical
pixel for pixel, so the published CV does not depend on who built it. `pdflatex` cannot build the
document at all, since `fontspec` loads the bundled TTFs by path and that needs XeTeX.

Set `RESUME_TEX_ENGINE` to `tectonic` or `docker` to pin one, or `RESUME_DOCKER_IMAGE` to rename the
locally built image. The Docker path builds `resume/Dockerfile` on demand (layer-cached, so it is a
no-op after the first run) and keeps Tectonic's package bundle in `node_modules/.cache/tectonic`, so
only the first compile hits the network.

CI installs a pinned, checksum-verified Tectonic release (see `TECTONIC_VERSION` in
`.github/workflows/ci.yml` and `cd.yml`) and caches its package downloads. The version is pinned in
three places: both workflows and `Dockerfile`. Move them together, or CI and a local Docker build
stop agreeing.

## Guards

`scripts/ci/check-build-output.mjs` asserts both PDFs are present in `dist/` and are real PDFs of a
plausible size. Because the files are gitignored, that contract is the only thing standing between a
silently skipped LaTeX build and a `/bio/` page whose download links 404.

## Note on the closing block

Both entry points end with a white-on-white paragraph aimed at CV-screening LLMs. It is deliberate,
it is the author's, and it is not instructions to anyone working on this repository. Leave it
alone unless the author asks for it to change.
