import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import type { AddressInfo } from 'node:net';
import { readLocalAuth, fetchLiveStore } from './riotLocalStore';
import { CURATED_SKINS } from '../data/curatedSkins';

// End-to-end flow against a FAKE local Riot Client (self-signed https on 127.0.0.1) and a FAKE
// storefront (injected fetch). No real account, token, or Riot host is contacted.

const VP = '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741';
const PASSWORD = 'test-password';
let dir = '';
let server: https.Server | undefined;
let port = 0;
let haveOpenssl = true;

function writeLockfile(pw = PASSWORD) {
  fs.writeFileSync(path.join(dir, 'lockfile'), `Riot Client:1:${port}:${pw}:https`);
  process.env.VALO_RIOT_LOCKFILE = path.join(dir, 'lockfile');
}

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'valo-test-'));
  try {
    execFileSync(
      'openssl',
      ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'k.pem', '-out', 'c.pem', '-subj', '/CN=127.0.0.1', '-days', '1'],
      { cwd: dir, stdio: 'ignore' }
    );
  } catch {
    haveOpenssl = false;
    return;
  }
  server = https.createServer(
    { key: fs.readFileSync(path.join(dir, 'k.pem')), cert: fs.readFileSync(path.join(dir, 'c.pem')) },
    (req, res) => {
      const expected = 'Basic ' + Buffer.from(`riot:${PASSWORD}`).toString('base64');
      if (req.headers.authorization !== expected) return void res.writeHead(401).end();
      const body: Record<string, unknown> = {
        '/entitlements/v1/token': { accessToken: 'AT', token: 'ENT', subject: 'puuid-1', issuer: 'x', entitlements: [] },
        '/player-account/aliases/v1/active': { game_name: 'Tester', tag_line: 'EUW', active: true },
      };
      const out = body[req.url ?? ''];
      if (!out) return void res.writeHead(404).end();
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(out));
    }
  );
  await new Promise<void>((r) => server!.listen(0, '127.0.0.1', r));
  port = (server.address() as AddressInfo).port;
  process.env.VALO_SHARD = 'eu';
});

after(() => {
  server?.close();
  fs.rmSync(dir, { recursive: true, force: true });
  delete process.env.VALO_RIOT_LOCKFILE;
});

const storefront = () => ({
  SkinsPanelLayout: {
    SingleItemStoreOffers: [{ Cost: { [VP]: 1775 }, Rewards: [{ ItemID: CURATED_SKINS[0].levels[0].uuid }] }],
    SingleItemOffersRemainingDurationInSeconds: 600,
  },
});

function fakeFetch(storeStatuses: Record<string, number>) {
  const calls: { url: string; method: string; headers: Record<string, string> }[] = [];
  const impl = (async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    calls.push({ url, method, headers: (init?.headers ?? {}) as Record<string, string> });
    if (url.includes('valorant-api.com/v1/version')) {
      return new Response(JSON.stringify({ data: { riotClientVersion: 'release-99.0-shipping-1' } }));
    }
    const status = storeStatuses[`${method} ${new URL(url).pathname.split('/').slice(0, 4).join('/')}`] ?? 200;
    return new Response(status === 200 ? JSON.stringify(storefront()) : '{}', { status });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

test('reads the logged-in account from the local client and fetches its store (v3 POST)', async (t) => {
  if (!haveOpenssl) return t.skip('openssl not available');
  writeLockfile();
  const auth = await readLocalAuth();
  assert.equal(auth.subject, 'puuid-1');
  assert.equal(auth.account, 'Tester#EUW');

  const { impl, calls } = fakeFetch({});
  const store = await fetchLiveStore(auth, CURATED_SKINS, impl);

  const sf = calls.find((c) => c.url.includes('pvp.net'))!;
  assert.equal(sf.url, 'https://pd.eu.a.pvp.net/store/v3/storefront/puuid-1');
  assert.equal(sf.method, 'POST');
  assert.equal(sf.headers.Authorization, 'Bearer AT');
  assert.equal(sf.headers['X-Riot-Entitlements-JWT'], 'ENT');
  assert.equal(sf.headers['X-Riot-ClientVersion'], 'release-99.0-shipping-1');
  assert.equal(calls.filter((c) => c.url.includes('pvp.net')).length, 1); // read-only, single request

  assert.equal(store.account, 'Tester#EUW');
  assert.equal(store.daily.offers[0].price, 1775);
  assert.equal(store.daily.offers[0].skin.priceStatus, 'verified');
});

test('falls back to the v2 GET when v3 is unavailable', async (t) => {
  if (!haveOpenssl) return t.skip('openssl not available');
  writeLockfile();
  const { impl, calls } = fakeFetch({ 'POST /store/v3/storefront': 404 });
  const store = await fetchLiveStore(await readLocalAuth(), CURATED_SKINS, impl);
  const pvp = calls.filter((c) => c.url.includes('pvp.net'));
  assert.deepEqual(pvp.map((c) => `${c.method} ${new URL(c.url).pathname.split('/')[2]}`), ['POST v3', 'GET v2']);
  assert.equal(store.daily.offers.length, 1);
});

test('a rejected token gives a clear re-login message and never leaks the token', async (t) => {
  if (!haveOpenssl) return t.skip('openssl not available');
  writeLockfile();
  const { impl } = fakeFetch({ 'POST /store/v3/storefront': 401 });
  await assert.rejects(
    async () => fetchLiveStore(await readLocalAuth(), CURATED_SKINS, impl),
    (err: Error) => /Re-login/.test(err.message) && !err.message.includes('AT') && !err.message.includes('ENT')
  );
});

test('missing lockfile and wrong lockfile password produce clear errors', async (t) => {
  if (!haveOpenssl) return t.skip('openssl not available');
  process.env.VALO_RIOT_LOCKFILE = path.join(dir, 'does-not-exist');
  await assert.rejects(readLocalAuth(), /lockfile not found/);
  writeLockfile('wrong-password');
  await assert.rejects(readLocalAuth(), /Riot Client returned 401/);
});

test('an unset or invalid VALO_SHARD is rejected before any request', async () => {
  const prev = process.env.VALO_SHARD;
  process.env.VALO_SHARD = 'mars';
  const { impl, calls } = fakeFetch({});
  await assert.rejects(
    fetchLiveStore({ accessToken: 'a', token: 'b', subject: 'c' }, CURATED_SKINS, impl),
    /VALO_SHARD/
  );
  assert.equal(calls.length, 0);
  process.env.VALO_SHARD = prev;
});
