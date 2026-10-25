import { test, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DemoStoreProvider } from './DemoStoreProvider';
import { createRng, stringToSeed } from '../utils/seedRandom';

// Force the offline CURATED_SKINS path so tests never hit the network.
globalThis.fetch = (() => Promise.reject(new Error('offline'))) as typeof fetch;
mock.method(console, 'error', () => {}); // fetchAllSkins logs the expected offline failure

const setDay = (iso: string) => mock.timers.enable({ apis: ['Date'], now: new Date(iso) });
const ids = (offers: { skin: { uuid: string } }[]) => offers.map((o) => o.skin.uuid);

async function dailyOn(day: string, offset = 0) {
  setDay(`${day}T12:00:00Z`);
  const p = new DemoStoreProvider();
  p.setSeedOffset(offset);
  const res = await p.getDailyOffers();
  mock.timers.reset();
  return res.data!;
}

async function nightMarketOn(day: string, offset = 0) {
  setDay(`${day}T12:00:00Z`);
  const p = new DemoStoreProvider();
  p.setSeedOffset(offset);
  const res = await p.getNightMarketOffers();
  mock.timers.reset();
  return res.data!;
}

beforeEach(() => mock.timers.reset());
afterEach(() => mock.timers.reset());

test('createRng is deterministic and stays in [0, 1)', () => {
  const a = createRng(42);
  const b = createRng(42);
  for (let i = 0; i < 100; i++) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
  assert.notEqual(createRng(1)(), createRng(2)());
});

test('stringToSeed is stable and non-negative', () => {
  assert.equal(stringToSeed('store_rotation_2026-01-01'), stringToSeed('store_rotation_2026-01-01'));
  assert.ok(stringToSeed('anything at all') >= 0);
  assert.notEqual(stringToSeed('2026-01-01'), stringToSeed('2026-01-02'));
});

test('daily store: same day + offset gives the same 4 offers', async () => {
  const a = await dailyOn('2026-03-10');
  const b = await dailyOn('2026-03-10');
  assert.deepEqual(a.offers.map((o) => o.id), b.offers.map((o) => o.id));
  assert.equal(a.rotationDate, '2026-03-10');
});

test('daily store: 4 unique, priced offers, first one featured', async () => {
  const { offers } = await dailyOn('2026-03-10');
  assert.equal(offers.length, 4);
  assert.equal(new Set(ids(offers)).size, 4);
  assert.deepEqual(offers.map((o) => o.featured), [true, false, false, false]);
  for (const o of offers) assert.ok((o.price ?? 0) > 0);
});

test('daily store: a new day or a new offset changes the rotation', async () => {
  const base = ids((await dailyOn('2026-03-10')).offers);
  assert.notDeepEqual(ids((await dailyOn('2026-03-11')).offers), base);
  assert.notDeepEqual(ids((await dailyOn('2026-03-10', 1)).offers), base);
});

test('night market: deterministic, 6 unique eligible skins with correct discounts', async () => {
  const a = await nightMarketOn('2026-03-10');
  const b = await nightMarketOn('2026-03-10');
  assert.deepEqual(a.map((o) => [o.id, o.discountPercent]), b.map((o) => [o.id, o.discountPercent]));
  assert.equal(a.length, 6);
  assert.equal(new Set(ids(a)).size, 6);
  for (const o of a) {
    assert.ok(['Select', 'Deluxe', 'Premium'].includes(o.skin.tier.name));
    assert.ok(o.discountPercent >= 18 && o.discountPercent <= 48);
    assert.equal(o.discountedPrice, Math.round(o.originalPrice * (1 - o.discountPercent / 100)));
    assert.ok(o.discountedPrice < o.originalPrice);
  }
});

test('night market: rotates with the date', async () => {
  const a = ids(await nightMarketOn('2026-03-10'));
  assert.notDeepEqual(ids(await nightMarketOn('2026-03-11')), a);
});
