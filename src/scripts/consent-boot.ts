import { applyStoredConsent } from '../lib/consent';

// Puts an existing consent decision into effect as early as the document can,
// ahead of the Core Web Vitals registration below it and well ahead of the
// banner island hydrating. Without this a returning visitor who has already
// accepted would lose the metrics that fire before React wakes up.
applyStoredConsent();
