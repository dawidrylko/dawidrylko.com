// Polish has three plural forms. Pick the right one for a count:
//   - one:  n === 1                         (1 minuta)
//   - few:  n % 10 in 2..4 and not 12..14   (2 minuty, 23 minuty)
//   - many: everything else                 (5 minut, 11 minut, 100 minut)
export function plPlural(n: number, [one, few, many]: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (n === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
