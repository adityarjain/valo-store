import {
  StoreProvider,
  ProviderStatus,
  StoreResult,
  DailyStoreResult,
  FeaturedBundle,
  NightMarketOffer,
  Skin,
} from '@/types/store';
import { fetchAllSkins } from '@/services/valorantApi';

interface LivePayload {
  daily: DailyStoreResult;
  nightMarket: NightMarketOffer[];
  account?: string;
}

// Talks only to this app's own /api/store route (local, opt-in, see src/server/riotLocalStore.ts).
// The browser never sees Riot tokens.
export class LiveStoreProvider implements StoreProvider {
  id = 'live';
  name = 'Live Store (local Riot Client, unofficial)';
  description = 'Reads your own store through the Riot Client running on this machine. Unofficial and opt-in.';

  private inflight: Promise<{ data?: LivePayload; error?: string }> | null = null;
  private fetchedAt = 0;

  private load() {
    // share one request between the status/offers/night-market calls of a single load
    if (!this.inflight || Date.now() - this.fetchedAt > 30_000) {
      this.fetchedAt = Date.now();
      this.inflight = fetch('/api/store', { cache: 'no-store' })
        .then(async (res) => {
          const body = await res.json();
          return res.ok ? { data: body as LivePayload } : { error: (body.error as string) ?? 'Live store failed.' };
        })
        .catch(() => ({ error: 'Could not reach the local live-store route.' }));
    }
    return this.inflight;
  }

  async getStatus(): Promise<ProviderStatus> {
    const { data, error } = await this.load();
    return {
      state: data ? 'success' : 'unavailable',
      isAvailable: !!data,
      mode: 'live',
      isLiveApi: true,
      providerName: 'Live Store (local Riot Client, unofficial)',
      version: '1.0.0',
      message: data
        ? `Showing the real store for ${data.account ?? 'the account logged in to the Riot Client'}.`
        : error ?? 'Live store unavailable.',
      details:
        'Unofficial: Riot does not support this. No password or cookies are used; the access token is read from your local Riot Client, stays on this machine, and is only sent to Riot for one read-only storefront request.',
    };
  }

  async getDailyOffers(): Promise<StoreResult<DailyStoreResult>> {
    const status = await this.getStatus();
    const { data, error } = await this.load();
    if (!data) return { status, error };
    const remainingSeconds = Math.max(0, Math.floor((Date.parse(data.daily.expiresAt) - Date.now()) / 1000));
    return { status, data: { ...data.daily, remainingSeconds } };
  }

  async getNightMarketOffers(): Promise<StoreResult<NightMarketOffer[]>> {
    const status = await this.getStatus();
    const { data, error } = await this.load();
    return data ? { status, data: data.nightMarket } : { status, error };
  }

  async getFeaturedBundle(): Promise<StoreResult<FeaturedBundle>> {
    return { status: await this.getStatus(), error: 'Featured bundles are not read in live mode.' };
  }

  // The skin catalogue is public metadata, no account involved.
  async getCatalog(): Promise<StoreResult<Skin[]>> {
    return { status: await this.getStatus(), data: await fetchAllSkins() };
  }
}
