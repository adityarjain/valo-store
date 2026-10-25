import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { hasPrice, formatPrice, comparePrice, sumKnown, PRICE_UNAVAILABLE } from './price';
import { CURATED_SKINS } from '../data/curatedSkins';
import { DemoStoreProvider } from '../providers/DemoStoreProvider';

globalThis.fetch = (() => Promise.reject(new Error('offline'))) as typeof fetch;
mock.method(console, 'error', () => {});

test('null is unknown and formatting never invents 0 VP', () => {
  assert.equal(hasPrice(null), false);
  assert.equal(hasPrice(undefined), false);
  assert.equal(hasPrice(875), true);
  assert.equal(formatPrice(null), PRICE_UNAVAILABLE);
  assert.equal(formatPrice(1275), '1,275');
});

test('comparePrice sorts unknown prices last in both directions', () => {
  const prices = [2475, null, 875, null, 1775];
  assert.deepEqual([...prices].sort((a, b) => comparePrice(a, b)), [875, 1775, 2475, null, null]);
  assert.deepEqual([...prices].sort((a, b) => comparePrice(a, b, -1)), [2475, 1775, 875, null, null]);
});

test('sumKnown excludes unknown prices and counts them', () => {
  assert.deepEqual(sumKnown([875, null, 1275]), { total: 2150, unknown: 1 });
  assert.deepEqual(sumKnown([]), { total: 0, unknown: 0 });
});

test('no curated skin is marked verified, and priceStatus matches the price', () => {
  for (const s of CURATED_SKINS) {
    assert.notEqual(s.priceStatus, 'verified', s.displayName);
    assert.equal(s.priceStatus, s.defaultPrice === null ? 'unpriced' : 'estimated', s.displayName);
    assert.notEqual(s.defaultPrice, 0, s.displayName);
  }
});

test('catalogue max-price filter excludes unknown prices; price sort puts them last', async () => {
  const p = new DemoStoreProvider();
  const capped = (await p.getCatalog({ maxPrice: 1000 })).data!;
  assert.ok(capped.every((s) => hasPrice(s.defaultPrice) && s.defaultPrice <= 1000));

  const prices = (await p.getCatalog({ sortBy: 'price-desc' })).data!.map((s) => s.defaultPrice);
  const firstNull = prices.indexOf(null);
  if (firstNull !== -1) assert.ok(prices.slice(firstNull).every((x) => x === null));
});
