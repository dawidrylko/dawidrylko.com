import { describe, it, expect } from 'vitest';
import { serializeJsonLd } from './json-ld';

describe('serializeJsonLd', () => {
  it('cannot close the surrounding script element', () => {
    expect(serializeJsonLd({ abstract: 'a</script><b>' })).not.toContain('<');
  });

  it('round-trips the value unchanged', () => {
    const data = { name: 'x < y', nested: ['</script>'] };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
