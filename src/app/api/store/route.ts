import { NextRequest, NextResponse } from 'next/server';
import { fetchAllSkins } from '@/services/valorantApi';
import { fetchLiveStore, type LiveStore } from '@/server/riotLocalStore';

export const dynamic = 'force-dynamic';

const LOCAL_HOST = /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/;
const TTL_MS = 5 * 60 * 1000; // don't hit Riot more than once per 5 minutes
let cache: { at: number; store: LiveStore } | null = null;

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

  if (cache && Date.now() - cache.at < TTL_MS) return json(cache.store);

  try {
    const store = await fetchLiveStore(await fetchAllSkins());
    cache = { at: Date.now(), store };
    return json(store);
  } catch (err) {
    // Messages come from riotLocalStore and never contain tokens.
    return json({ error: err instanceof Error ? err.message : 'Live store request failed.' }, 502);
  }
}
