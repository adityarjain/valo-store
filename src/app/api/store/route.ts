import { NextRequest, NextResponse } from 'next/server';
import { fetchAllSkins } from '@/services/valorantApi';
import { fetchLiveStore, readLocalAuth, type LiveStore } from '@/server/riotLocalStore';

export const dynamic = 'force-dynamic';

const LOCAL_HOST = /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/;
const MAX_TTL_MS = 5 * 60 * 1000; // don't hit Riot more than once per 5 minutes...
const MIN_TTL_MS = 30 * 1000;
// ...but never keep a store past its rotation. Cached per account (PUUID), so switching the
// logged-in Riot account never shows the previous account's store.
let cache: { puuid: string; expires: number; store: LiveStore } | null = null;

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(req: NextRequest) {
  if (process.env.VALO_LIVE !== '1') {
    return json({ error: 'Live mode is off. Set VALO_LIVE=1 in .env.local and restart.' }, 403);
  }
  // Local-only: refuse other hosts (DNS rebinding) and cross-site requests.
  if (!LOCAL_HOST.test(req.headers.get('host') ?? '') || req.headers.get('sec-fetch-site') === 'cross-site') {
    return json({ error: 'Live store is only available from this machine.' }, 403);
  }

  try {
    const auth = await readLocalAuth(); // cheap, local, and tells us who is logged in right now
    if (cache && cache.puuid === auth.subject && Date.now() < cache.expires) return json(cache.store);

    const store = await fetchLiveStore(auth, await fetchAllSkins());
    const ttl = Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, store.daily.remainingSeconds * 1000));
    cache = { puuid: auth.subject, expires: Date.now() + ttl, store };
    return json(store);
  } catch (err) {
    // Messages come from riotLocalStore and never contain tokens.
    return json({ error: err instanceof Error ? err.message : 'Live store request failed.' }, 502);
  }
}
