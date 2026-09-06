import type { FC } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { consentCopyFor } from '../data/consent-copy';
import { CONSENT_SETTINGS_EVENT } from '../lib/consent-model';
import { applyStoredConsent, decideConsent } from '../lib/consent';

// Consent gate for GA4. Art. 399 of the Prawo komunikacji elektronicznej
// requires prior consent for anything written to the device, and Poland grants
// analytics no exemption, so the measurement loader is injected only once this
// banner has been answered.
//
// The banner is deliberately not modal: it neither locks scrolling nor traps
// focus, so the site stays fully usable while the question is open. Refusing is
// one click, exactly like accepting.

interface CookieConsentProps {
  /** Page language, so the banner speaks the language around it. */
  lang: string;
}

const CookieConsent: FC<CookieConsentProps> = ({ lang }) => {
  const copy = consentCopyFor(lang);
  const headingId = useId();
  const bodyId = useId();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [decided, setDecided] = useState<boolean | null>(null);

  // Kept out of the server render so the static HTML never ships a banner that
  // a returning visitor has already answered. Applying the stored decision is
  // idempotent: consent-boot.ts has normally done it already, from the head.
  useEffect(() => {
    const stored = applyStoredConsent();

    if (stored) {
      setDecided(stored.analytics);
    } else {
      setOpen(true);
    }

    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, reopen);
  }, []);

  const answer = useCallback((analytics: boolean) => {
    setDecided(decideConsent(analytics).analytics);
    setOpen(false);
  }, []);

  // Escape only dismisses a banner reopened over an existing decision. On a
  // first visit there is nothing to fall back to, so the question stays until
  // it is answered one way or the other.
  useEffect(() => {
    if (!open || decided === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, decided]);

  useEffect(() => {
    if (open) {
      bannerRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-labelledby={headingId}
      aria-describedby={bodyId}
      tabIndex={-1}
      ref={bannerRef}
    >
      <div className="cookie-consent-text">
        <h2 id={headingId}>{copy.heading}</h2>
        <p id={bodyId}>{copy.body}</p>
        {decided !== null && (
          <p className="cookie-consent-state">{decided ? copy.currentAllowed : copy.currentRefused}</p>
        )}
        <p className="cookie-consent-links">
          <a href={copy.cookiePolicy.href}>{copy.cookiePolicy.label}</a>
          <span className="separator" aria-hidden="true">
            •
          </span>
          <a href={copy.privacyPolicy.href}>{copy.privacyPolicy.label}</a>
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" onClick={() => answer(false)}>
          {copy.reject}
        </button>
        <button type="button" onClick={() => answer(true)}>
          {copy.accept}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
