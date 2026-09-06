import { CONSENT_SETTINGS_EVENT } from '../lib/consent-model';

// Wires the footer control that reopens the consent banner. Art. 7(3) GDPR
// requires withdrawing consent to be as easy as giving it, so the way back to
// the decision is a permanent part of the page chrome.
document
  .querySelector('[data-cookie-settings]')
  ?.addEventListener('click', () => window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT)));
