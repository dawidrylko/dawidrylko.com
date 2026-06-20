import { describe, it, expect } from 'vitest';
import { plPlural } from './pl-plural';

const forms: [string, string, string] = ['minuta', 'minuty', 'minut'];

describe('plPlural', () => {
  it('uses the singular for exactly 1', () => {
    expect(plPlural(1, forms)).toBe('minuta');
  });

  it('uses the "few" form for 2-4 (not the teens)', () => {
    expect(plPlural(2, forms)).toBe('minuty');
    expect(plPlural(3, forms)).toBe('minuty');
    expect(plPlural(4, forms)).toBe('minuty');
    expect(plPlural(23, forms)).toBe('minuty');
  });

  it('uses the "many" form for 0, 5+, and the teens', () => {
    expect(plPlural(0, forms)).toBe('minut');
    expect(plPlural(5, forms)).toBe('minut');
    expect(plPlural(11, forms)).toBe('minut');
    expect(plPlural(12, forms)).toBe('minut');
    expect(plPlural(14, forms)).toBe('minut');
    expect(plPlural(100, forms)).toBe('minut');
  });
});
