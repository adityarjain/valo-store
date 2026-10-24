import {
  StoreProvider,
  ProviderStatus,
  StoreResult,
  DailyStoreResult,
  FeaturedBundle,
  Skin,
} from '@/types/store';

export class LiveStoreProvider implements StoreProvider {
  id = 'live';
  name = 'Live Riot Store Provider (Official API)';
  description = 'Direct integration with Riot Games official player storefront API.';

  async getStatus(): Promise<ProviderStatus> {
    return {
      state: 'unavailable',
      isAvailable: false,
      mode: 'live',
      providerName: 'Live Riot Store Provider (Disabled by Security Policy)',
      version: '1.0.0-disabled',
      message: 'Live personal store retrieval is currently disabled.',
      details:
        "Riot Games' official public developer API does not offer endpoints for personal daily store rotations or player inventory without unofficial client authentication. In accordance with strict security standards, this application never requests or stores your Riot password, MFA credentials, or session cookies.",
    };
  }

  async getDailyOffers(): Promise<StoreResult<DailyStoreResult>> {
    const status = await this.getStatus();
    return {
      status,
      error:
        'Live store retrieval unavailable: Official Riot Games API does not expose personal daily storefront endpoints. To protect your account integrity, password and cookie scraping are prohibited.',
    };
  }

  async getFeaturedBundle(): Promise<StoreResult<FeaturedBundle>> {
    const status = await this.getStatus();
    return {
      status,
      error: 'Featured bundle via Live Provider is disabled pending official Riot OAuth2 storefront support.',
    };
  }

  async getCatalog(): Promise<StoreResult<Skin[]>> {
    const status = await this.getStatus();
    return {
      status,
      error: 'Catalog via Live Provider is unavailable.',
    };
  }
}
