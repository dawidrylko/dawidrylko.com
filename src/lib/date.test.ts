import { describe, it, expect } from 'vitest';
import { formatPolishDate, toISODate } from './date';

describe('formatPolishDate', () => {
  it('formats a date in Polish with a long month and zero-padded day', () => {
    // Local-time constructor keeps the day stable regardless of the host timezone.
    expect(formatPolishDate(new Date(2025, 11, 26))).toBe('26 grudnia 2025');
  });

  it('zero-pads single-digit days', () => {
    expect(formatPolishDate(new Date(2025, 0, 5))).toBe('05 stycznia 2025');
  });
});

describe('toISODate', () => {
  it('returns the ISO 8601 timestamp', () => {
    expect(toISODate(new Date(Date.UTC(2025, 11, 26, 10, 30)))).toBe('2025-12-26T10:30:00.000Z');
  });
});
