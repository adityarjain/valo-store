// A null price means "unknown". It must never be coerced to 0 VP.
export const PRICE_UNAVAILABLE = 'Price unavailable';

export const hasPrice = (p: number | null | undefined): p is number => typeof p === 'number';

/** "1,275" for a known price, "Price unavailable" otherwise (no VP suffix). */
export const formatPrice = (p: number | null | undefined): string =>
  hasPrice(p) ? p.toLocaleString() : PRICE_UNAVAILABLE;

/** Ascending comparator that always sorts unknown prices last, flip with dir = -1. */
export const comparePrice = (a: number | null | undefined, b: number | null | undefined, dir: 1 | -1 = 1): number => {
  if (!hasPrice(a)) return hasPrice(b) ? 1 : 0;
  if (!hasPrice(b)) return -1;
  return (a - b) * dir;
};

/** Sum only known prices and report how many were unknown. */
export const sumKnown = (prices: (number | null | undefined)[]): { total: number; unknown: number } => {
  let total = 0;
  let unknown = 0;
  for (const p of prices) {
    if (hasPrice(p)) total += p;
    else unknown++;
  }
  return { total, unknown };
};
