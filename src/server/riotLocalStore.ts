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
    SingleItemOffers?: string[];
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
  /** "Name#TAG" of the account the store belongs to */
  account?: string;
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

  // Prefer the priced offers; if only the bare level-id list is present, show them with unknown
  // (null) prices rather than dropping the offers.
  const pricedRaw = raw.SkinsPanelLayout?.SingleItemStoreOffers;
  const dailyRaw: RawOffer[] = pricedRaw?.length
    ? pricedRaw
    : (raw.SkinsPanelLayout?.SingleItemOffers ?? []).map((id) => ({ Rewards: [{ ItemID: id }] }));
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

export interface LocalAuth {
  accessToken: string;
  token: string;
  /** the account's PUUID */
  subject: string;
  /** "Name#TAG" of the account logged in to the Riot Client, if available */
  account?: string;
}

/** Reads the logged-in account's token from the local Riot Client. Called on every request so a
 * switched account is noticed immediately. */
export async function readLocalAuth(): Promise<LocalAuth> {
  let lock: Lockfile;
  try {
    lock = parseLockfile(fs.readFileSync(/*turbopackIgnore: true*/ lockfilePath(), 'utf8'));
  } catch {
    throw new Error(
      'Riot Client lockfile not found. Log in to the Riot Client on this PC (if it still fails, launch VALORANT).'
    );
  }

  let auth: Omit<LocalAuth, 'account'>;
  try {
    auth = await localGet<Omit<LocalAuth, 'account'>>(lock, '/entitlements/v1/token');
  } catch (err) {
    throw new Error(
      `${err instanceof Error ? err.message : 'Local Riot Client error.'} Make sure you are logged in to the Riot Client (launch VALORANT if needed).`
    );
  }
  if (!auth.accessToken || !auth.token || !auth.subject) {
    throw new Error('The Riot Client is not logged in yet. Log in, then refresh.');
  }

  // Best effort: show which account this is so you can tell a stale or wrong login at a glance.
  let account: string | undefined;
  try {
    const alias = await localGet<{ game_name?: string; tag_line?: string }>(lock, '/player-account/aliases/v1/active');
    if (alias.game_name) account = `${alias.game_name}#${alias.tag_line ?? ''}`;
  } catch {
    /* optional */
  }
  return { ...auth, account };
}

const STORE_FALLBACK_STATUSES = [404, 405, 410];

export async function fetchLiveStore(
  auth: LocalAuth,
  skins: Skin[],
  fetchImpl: typeof fetch = fetch
): Promise<LiveStore> {
  const shard = (process.env.VALO_SHARD ?? '').toLowerCase();
  if (!SHARDS.includes(shard)) {
    throw new Error(`Set VALO_SHARD to your region shard (${SHARDS.join(', ')}).`);
  }

  const versionRes = await fetchImpl('https://valorant-api.com/v1/version');
  const version = ((await versionRes.json()) as { data?: { riotClientVersion?: string } }).data?.riotClientVersion;

  const headers = {
    Authorization: `Bearer ${auth.accessToken}`,
    'X-Riot-Entitlements-JWT': auth.token,
    'X-Riot-ClientPlatform': CLIENT_PLATFORM,
    'X-Riot-ClientVersion': version ?? '',
  };
  const base = `https://pd.${shard}.a.pvp.net/store`;

  // Current community-documented call is v3 (POST, empty body). Fall back to the older v2 GET if
  // v3 is gone. Both are read-only.
  let res = await fetchImpl(`${base}/v3/storefront/${auth.subject}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  });
  if (STORE_FALLBACK_STATUSES.includes(res.status)) {
    res = await fetchImpl(`${base}/v2/storefront/${auth.subject}`, { headers, cache: 'no-store' });
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `Riot rejected the token (${res.status}). Re-login in the Riot Client, or check VALO_SHARD matches your account's region.`
    );
  }
  if (!res.ok) throw new Error(`Riot storefront returned ${res.status}. The endpoint may have changed.`);

  const store = mapStorefront((await res.json()) as RawStorefront, skins);
  return { ...store, account: auth.account };
}
