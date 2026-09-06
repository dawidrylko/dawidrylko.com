import { CONTENT_LANG, DEFAULT_LANG } from '../lib/i18n';

// Banner and footer copy for the cookie gate, in both site languages. The
// banner follows the language of the page it appears on: the English shell and
// the Polish content zone each get their own wording and link to the legal
// documents written in that language.

export interface ConsentCopy {
  /** Names the banner region; also its accessible name via aria-labelledby. */
  heading: string;
  body: string;
  accept: string;
  reject: string;
  /** Footer link that reopens the banner so a decision can be changed. */
  settings: string;
  /** Shown when a decision is already on record and the banner is reopened. */
  currentAllowed: string;
  currentRefused: string;
  privacyPolicy: { href: string; label: string };
  cookiePolicy: { href: string; label: string };
}

export const CONSENT_COPY: Record<string, ConsentCopy> = {
  [DEFAULT_LANG]: {
    heading: 'Analytics cookies',
    body: 'This site measures traffic with Google Analytics 4, which stores two cookies on your device. Nothing is loaded and nothing is stored until you agree. Refusing keeps the site fully usable.',
    accept: 'Accept',
    reject: 'Refuse',
    settings: 'Cookie settings',
    currentAllowed: 'Your current choice: analytics allowed.',
    currentRefused: 'Your current choice: analytics refused.',
    privacyPolicy: { href: '/privacy-policy/', label: 'Privacy policy' },
    cookiePolicy: { href: '/cookie-policy/', label: 'Cookie policy' },
  },
  [CONTENT_LANG]: {
    heading: 'Cookies analityczne',
    body: 'Ta strona mierzy ruch w Google Analytics 4, co zapisuje na Twoim urządzeniu dwa pliki cookies. Do czasu Twojej zgody nic się nie wczytuje i nic nie zostaje zapisane. Odmowa nie ogranicza korzystania ze strony.',
    accept: 'Akceptuję',
    reject: 'Odrzucam',
    settings: 'Ustawienia cookies',
    currentAllowed: 'Twój obecny wybór: analityka dozwolona.',
    currentRefused: 'Twój obecny wybór: analityka odrzucona.',
    privacyPolicy: { href: '/polityka-prywatnosci/', label: 'Polityka prywatności' },
    cookiePolicy: { href: '/polityka-cookies/', label: 'Polityka cookies' },
  },
};

/** Copy for a page language, falling back to the shell language. */
export const consentCopyFor = (lang: string): ConsentCopy => CONSENT_COPY[lang] ?? CONSENT_COPY[DEFAULT_LANG];
