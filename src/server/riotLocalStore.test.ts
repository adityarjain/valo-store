import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseLockfile, mapStorefront, type RawStorefront } from './riotLocalStore';
import { CURATED_SKINS } from '../data/curatedSkins';

const VP = '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741';

test('parseLockfile reads name:pid:port:password:protocol', () => {
  const lock = parseLockfile('Riot Client:1234:51234:s3cret:https\n');
  assert.deepEqual(lock, { port: 51234, password: 's3cret', protocol: 'https' });
  assert.throws(() => parseLockfile('garbage'));
});

test('mapStorefront maps skin-level offers to verified prices and Night Market discounts', () => {
  const [a, b, c] = CURATED_SKINS;
  const fixture: RawStorefront = {
    SkinsPanelLayout: {
      SingleItemStoreOffers: [
        { Cost: { [VP]: 1775 }, Rewards: [{ ItemID: a.levels[0].uuid }] },
        { Cost: { [VP]: 2175 }, Rewards: [{ ItemID: 'not-in-catalogue' }] }, // skipped
      ],
      SingleItemOffersRemainingDurationInSeconds: 3600,
    },
    BonusStore: {
      BonusStoreOffers: [
        {
          Offer: { Cost: { [VP]: 1775 }, Rewards: [{ ItemID: b.levels[0].uuid }] },
          DiscountPercent: 30,
          DiscountCosts: { [VP]: 1243 },
        },
        {
          Offer: { Cost: { [VP]: 875 }, Rewards: [{ ItemID: c.levels[0].uuid }] },
          DiscountPercent: 20,
          DiscountCosts: { [VP]: 700 },
        },
      ],
    },
  };
  const now = new Date('2026-03-10T12:00:00Z');
  const { daily, nightMarket } = mapStorefront(fixture, CURATED_SKINS, now);

  assert.equal(daily.offers.length, 1);
  assert.equal(daily.offers[0].price, 1775);
  assert.equal(daily.offers[0].skin.priceStatus, 'verified');
  assert.equal(daily.source, 'live');
  assert.equal(daily.isDemo, false);
  assert.equal(daily.expiresAt, '2026-03-10T13:00:00.000Z');

  assert.equal(nightMarket.length, 2);
  assert.equal(nightMarket[0].discountedPrice, 1243);
  assert.equal(nightMarket[0].originalPrice, 1775);
  assert.equal(nightMarket[0].skin.priceStatus, 'verified');
});

test('mapStorefront keeps an offer with no VP cost as null price, not 0', () => {
  const a = CURATED_SKINS[0];
  const { daily } = mapStorefront(
    { SkinsPanelLayout: { SingleItemStoreOffers: [{ Cost: {}, Rewards: [{ ItemID: a.levels[0].uuid }] }] } },
    CURATED_SKINS
  );
  assert.equal(daily.offers[0].price, null);
  assert.notEqual(daily.offers[0].skin.priceStatus, 'verified');
});

// Guardrail: the live-store code may only talk to the local Riot Client, the read-only
// storefront, and the public cosmetics API, and must never reference purchase or login endpoints.
test('live-store code only references allowed hosts and no purchase/credential endpoints', () => {
  const code = [
    'src/server/riotLocalStore.ts',
    'src/app/api/store/route.ts',
    'src/providers/LiveStoreProvider.ts',
  ]
    .map((f) => fs.readFileSync(path.join(process.cwd(), f), 'utf8'))
    .join('\n')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//')) // comments may describe what we avoid
    .join('\n');

  const urls = [...code.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]);
  assert.ok(urls.length > 0);
  for (const u of urls) {
    assert.match(
      u,
      /^https:\/\/(pd\.\$\{shard\}\.a\.pvp\.net\/store$|valorant-api\.com\/)/,
      `unexpected URL in live-store code: ${u}`
    );
  }
  // under the storefront base, only the read-only v3/v2 storefront paths may be requested
  const paths = [...code.matchAll(/\$\{base\}(\/[^`]*)`/g)].map((m) => m[1]);
  assert.ok(paths.length > 0);
  for (const p of paths) assert.match(p, /^\/v[23]\/storefront\/\$\{auth\.subject\}$/, `unexpected store path: ${p}`);
  // actual cookie/session handling or login/purchase endpoints (mentioning "cookies" in UI text is fine)
  assert.doesNotMatch(code, /\/store\/v1\/order|\/purchase|auth\.riotgames\.com|document\.cookie|set-cookie|['"`]cookie['"`]|\bssid\b/i);
});
