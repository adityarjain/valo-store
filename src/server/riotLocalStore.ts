// UNOFFICIAL and OPT-IN. Reads the access token from the Riot Client running on THIS machine
// (its local lockfile API) and makes one read-only storefront request for your own account.
//
// Rules this file keeps:
//  - no password, no cookies (ssid), no tokens persisted, logged, or returned to the browser
//  - only these hosts: 127.0.0.1 (local Riot Client), pd.<shard>.a.pvp.net, valorant-api.com
//  - read-only: the storefront endpoint only, never purchase/order endpoints
// Riot does not support this. Endpoint shapes below are from community docs and may change.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import type { DailyStoreResult, NightMarketOffer, Skin, StoreOffer } from '@/types/store';

export interface Lockfile {
  port: number;
  password: string;
  protocol: string;
}

interface Cost {
  [currencyId: string]: number;
}
interface Reward {
  ItemID: string;
}
interface RawOffer {
  Cost?: Cost;
  Rewards?: Reward[];
}
export interface RawStorefront {
  SkinsPanelLayout?: {
    SingleItemStoreOffers?: RawOffer[];
    SingleItemOffersRemainingDurationInSeconds?: number;
  };
  BonusStore?: {
    BonusStoreOffers?: { Offer: RawOffer; DiscountPercent: number; DiscountCosts: Cost }[];
    BonusStoreRemainingDurationInSeconds?: number;
  };
}

export interface LiveStore {
  daily: DailyStoreResult;
  nightMarket: NightMarketOffer[];
}

const VP_CURRENCY_ID = '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741';
const CLIENT_PLATFORM = Buffer.from(
  JSON.stringify({
    platformType: 'PC',
    platformOS: 'Windows',
    platformOSVersion: '10.0.19042.1.256.64bit',
    platformChipset: 'Unknown',
  })
).toString('base64');
const SHARDS = ['na', 'eu', 'ap', 'kr'];

export function parseLockfile(text: string): Lockfile {
  const [, , port, password, protocol] = text.trim().split(':');
  if (!port || !password) throw new Error('Unrecognised Riot Client lockfile format.');
  return { port: Number(port), password, protocol: protocol || 'https' };
}

function lockfilePath(): string {
  if (process.env.VALO_RIOT_LOCKFILE) return process.env.VALO_RIOT_LOCKFILE;
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA ?? '', 'Riot Games', 'Riot Client', 'Config', 'lockfile');
  }
  return path.join(os.homedir(), 'Library', 'Application Support', 'Riot Games', 'Riot Client', 'Config', 'lockfile');
}

// The local Riot Client uses a self-signed cert, so verification is disabled for this one
// 127.0.0.1 request only.
function localGet<T>(lock: Lockfile, urlPath: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: '127.0.0.1',
        port: lock.port,
        path: urlPath,
        method: 'GET',
        rejectUnauthorized: false,
        headers: { Authorization: 'Basic ' + Buffer.from(`riot:${lock.password}`).toString('base64') },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () =>
          res.statusCode === 200 ? resolve(JSON.parse(body) as T) : reject(new Error(`Riot Client returned ${res.statusCode}.`))
        );
      }
    );
    req.on('error', () => reject(new Error('Could not reach the local Riot Client. Is it running?')));
    req.end();
  });
}

const rewardId = (o: RawOffer) => o.Rewards?.[0]?.ItemID;

function priced(skin: Skin, price: number): Skin {
  return {
    ...skin,
    defaultPrice: price,
    priceStatus: 'verified',
    priceNote: 'Price from your Riot storefront response.',
  };
}

/** Pure mapping from a storefront response to app types. Offers are skin LEVEL uuids. */
export function mapStorefront(raw: RawStorefront, skins: Skin[], now = new Date()): LiveStore {
  const byLevel = new Map<string, Skin>();
  for (const s of skins) for (const l of s.levels) byLevel.set(l.uuid, s);

  const dailyRaw = raw.SkinsPanelLayout?.SingleItemStoreOffers ?? [];
  const remaining = raw.SkinsPanelLayout?.SingleItemOffersRemainingDurationInSeconds ?? 0;

  const offers: StoreOffer[] = [];
  dailyRaw.forEach((o, idx) => {
    const skin = byLevel.get(rewardId(o) ?? '');
    const cost = o.Cost?.[VP_CURRENCY_ID];
    if (!skin) return;
    offers.push({
      id: `live_offer_${idx}_${skin.uuid}`,
      skin: typeof cost === 'number' ? priced(skin, cost) : skin,
      price: typeof cost === 'number' ? cost : null,
      originalPrice: typeof cost === 'number' ? cost : null,
      featured: idx === 0,
    });
  });

  const nightMarket: NightMarketOffer[] = [];
  (raw.BonusStore?.BonusStoreOffers ?? []).forEach((b, idx) => {
    const skin = byLevel.get(rewardId(b.Offer) ?? '');
    const original = b.Offer.Cost?.[VP_CURRENCY_ID];
    const discounted = b.DiscountCosts?.[VP_CURRENCY_ID];
    if (!skin || typeof original !== 'number' || typeof discounted !== 'number') return;
    nightMarket.push({
      id: `live_nm_${idx}_${skin.uuid}`,
      skin: priced(skin, discounted),
      originalPrice: original,
      discountPercent: b.DiscountPercent,
      discountedPrice: discounted,
      isRevealed: false,
    });
  });

  return {
    daily: {
      offers,
      expiresAt: new Date(now.getTime() + remaining * 1000).toISOString(),
      remainingSeconds: remaining,
      isDemo: false,
      source: 'live',
      lastUpdated: now.toISOString(),
      rotationDate: now.toISOString().split('T')[0],
    },
    nightMarket,
  };
}

export async function fetchLiveStore(skins: Skin[]): Promise<LiveStore> {
  const shard = (process.env.VALO_SHARD ?? '').toLowerCase();
  if (!SHARDS.includes(shard)) {
    throw new Error(`Set VALO_SHARD to your region shard (${SHARDS.join(', ')}).`);
  }

  let lock: Lockfile;
  try {
    lock = parseLockfile(fs.readFileSync(/*turbopackIgnore: true*/ lockfilePath(), 'utf8'));
  } catch {
    throw new Error('Riot Client lockfile not found. Start the Riot Client (the game need not be running).');
  }

  const auth = await localGet<{ accessToken: string; token: string; subject: string }>(
    lock,
    '/entitlements/v1/token'
  );

  const versionRes = await fetch('https://valorant-api.com/v1/version');
  const version = ((await versionRes.json()) as { data?: { riotClientVersion?: string } }).data?.riotClientVersion;

  const res = await fetch(`https://pd.${shard}.a.pvp.net/store/v3/storefront/${auth.subject}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'X-Riot-Entitlements-JWT': auth.token,
      'X-Riot-ClientPlatform': CLIENT_PLATFORM,
      'X-Riot-ClientVersion': version ?? '',
      'Content-Type': 'application/json',
    },
    body: '{}',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Riot storefront returned ${res.status}. The endpoint may have changed.`);

  return mapStorefront((await res.json()) as RawStorefront, skins);
}
