# a11y-contrast

WCAG AA contrast audit for the design tokens in `src/styles/main.css`.

`check-contrast.mjs` parses the `--color-*` custom properties from `:root` and
checks every foreground/background pair used for text in the UI against the
WCAG AA threshold (4.5:1 for normal-size text). It has no dependencies and runs
without a browser or build, so it works as a fast CI gate.

```bash
pnpm a11y:contrast
```

The script exits non-zero when any pair drops below AA. `--color-accent` is used
only for decorative dividers (which are exempt from WCAG 1.4.11), so it is not
audited as a text foreground.
