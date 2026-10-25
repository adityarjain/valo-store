import {
  StoreProvider,
  ProviderStatus,
  StoreResult,
  DailyStoreResult,
  FeaturedBundle,
  NightMarketOffer,
  Skin,
  StoreOffer,
  CatalogFilters,
} from '@/types/store';
import { CURATED_SKINS } from '@/data/curatedSkins';
import { fetchAllSkins } from '@/services/valorantApi';
import { createRng, stringToSeed, getNextUtcMidnight } from '@/utils/seedRandom';
import { hasPrice, comparePrice, sumKnown } from '@/utils/price';

export class DemoStoreProvider implements StoreProvider {
  id = 'demo';
  name = 'Demo Store Provider';
  description = 'Local deterministic store rotation simulation using official cosmetic catalog data.';

  private simulationSeedOffset = 0;

  async getStatus(): Promise<ProviderStatus> {
    return {
      state: 'success',
      isAvailable: true,
      mode: 'demo',
      providerName: 'Demo Store Provider (Offline / Simulation)',
      version: '1.2.0',
      message: 'Running in local simulation mode. Real cosmetics catalog with a deterministic, simulated daily rotation.',
      details:
        'Weapon models, sound/video previews, and tiers come from the VALORANT cosmetics catalog. VP prices are estimates, not Riot store prices. No Riot login or credentials required.',
    };
  }

  setSeedOffset(offset: number) {
    this.simulationSeedOffset = offset;
  }

  getSeedOffset(): number {
    return this.simulationSeedOffset;
  }

  async getDailyOffers(): Promise<StoreResult<DailyStoreResult>> {
    const status = await this.getStatus();
    const timing = getNextUtcMidnight();

    let allSkins: Skin[];
    try {
      allSkins = await fetchAllSkins();
    } catch {
      allSkins = CURATED_SKINS;
    }

    if (!allSkins || allSkins.length < 4) {
      allSkins = CURATED_SKINS;
    }

    // Filter candidate skins that have displayIcon and tier
    const eligibleSkins = allSkins.filter(
      (s) => s.displayIcon && s.tier.name !== 'Standard' && hasPrice(s.defaultPrice) && s.defaultPrice > 0
    );

    // Create seed based on rotationDate + offset
    const seedString = `store_rotation_${timing.rotationDate}_offset_${this.simulationSeedOffset}`;
    const seed = stringToSeed(seedString);
    const rng = createRng(seed);

    // Pick 4 diverse offers
    const selectedSkins: Skin[] = [];
    const usedCategories = new Set<string>();
    const usedUuids = new Set<string>();

    const shuffled = [...eligibleSkins];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (const skin of shuffled) {
      if (selectedSkins.length >= 4) break;
      if (usedUuids.has(skin.uuid)) continue;

      if (!usedCategories.has(skin.weaponType) || selectedSkins.length >= 3) {
        selectedSkins.push(skin);
        usedCategories.add(skin.weaponType);
        usedUuids.add(skin.uuid);
      }
    }

    for (const skin of shuffled) {
      if (selectedSkins.length >= 4) break;
      if (!usedUuids.has(skin.uuid)) {
        selectedSkins.push(skin);
        usedUuids.add(skin.uuid);
      }
    }

    const offers: StoreOffer[] = selectedSkins.map((skin, idx) => ({
      id: `offer_${timing.rotationDate}_${idx}_${skin.uuid}`,
      skin,
      price: skin.defaultPrice,
      originalPrice: skin.defaultPrice,
      featured: idx === 0,
    }));

    return {
      status,
      data: {
        offers,
        expiresAt: timing.expiresAt,
        remainingSeconds: timing.remainingSeconds,
        isDemo: true,
        source: 'demo',
        lastUpdated: new Date().toISOString(),
        rotationDate: timing.rotationDate,
      },
    };
  }

  async getFeaturedBundle(): Promise<StoreResult<FeaturedBundle>> {
    const status = await this.getStatus();
    const allSkins = await fetchAllSkins();

    const kuronamiSkins = allSkins.filter((s) => s.displayName.toLowerCase().includes('kuronami'));
    const bundleItems: Skin[] = kuronamiSkins.length >= 3 ? kuronamiSkins : CURATED_SKINS.slice(0, 5);

    // If any item has an unknown price the bundle total is unknown, never a partial sum.
    const { total, unknown } = sumKnown(bundleItems.map((s) => s.defaultPrice));
    const basePrice = unknown === 0 && total > 0 ? total : null;
    const bundlePrice = basePrice === null ? null : Math.round(basePrice * 0.67);
    const discountPercent =
      basePrice === null || bundlePrice === null ? null : Math.round(((basePrice - bundlePrice) / basePrice) * 100);

    const expiresDate = new Date(Date.now() + 11 * 86400 * 1000);

    const bundle: FeaturedBundle = {
      uuid: 'bundle-kuronami-edition',
      displayName: 'KURONAMI // COLLECTION',
      description: 'Master the ancient storms. Includes custom equip, inspect, reload animations, and water-strike finisher.',
      price: bundlePrice,
      basePrice,
      discountPercent,
      displayIcon:
        bundleItems[0]?.fullRender ||
        bundleItems[0]?.displayIcon ||
        'https://media.valorant-api.com/weaponskins/d8d5d7a1-4d81-8560-54bc-0692ab40f69b/displayicon.png',
      items: bundleItems.map((skin, idx) => ({
        id: `bundle_item_${idx}_${skin.uuid}`,
        skin,
        price: skin.defaultPrice,
        originalPrice: skin.defaultPrice,
      })),
      expiresAt: expiresDate.toISOString(),
      remainingDays: 11,
    };

    return {
      status,
      data: bundle,
    };
  }

  async getNightMarketOffers(): Promise<StoreResult<NightMarketOffer[]>> {
    const status = await this.getStatus();
    const timing = getNextUtcMidnight();

    let allSkins: Skin[];
    try {
      allSkins = await fetchAllSkins();
    } catch {
      allSkins = CURATED_SKINS;
    }

    if (!allSkins || allSkins.length < 6) {
      allSkins = CURATED_SKINS;
    }

    // In VALORANT Night Market, skins from Select, Deluxe, and Premium are eligible
    const eligibleSkins = allSkins.filter(
      (s): s is typeof s & { defaultPrice: number } =>
        !!s.displayIcon &&
        ['Select', 'Deluxe', 'Premium'].includes(s.tier.name) &&
        hasPrice(s.defaultPrice) &&
        s.defaultPrice > 0
    );

    const seedString = `store_nightmarket_${timing.rotationDate}_offset_${this.simulationSeedOffset}`;
    const seed = stringToSeed(seedString);
    const rng = createRng(seed);

    const shuffled = [...eligibleSkins];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, 6);
    const discountPool = [18, 24, 32, 41, 27, 36, 45, 19, 30, 48];

    const offers: NightMarketOffer[] = selected.map((skin, idx) => {
      const discountIdx = Math.floor(rng() * discountPool.length);
      const discountPercent = discountPool[discountIdx];
      const originalPrice = skin.defaultPrice; // eligibleSkins only contains priced skins
      const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

      return {
        id: `nm_${timing.rotationDate}_${idx}_${skin.uuid}`,
        skin,
        originalPrice,
        discountPercent,
        discountedPrice,
        isRevealed: false,
      };
    });

    return {
      status,
      data: offers,
    };
  }

  async getCatalog(filters?: CatalogFilters): Promise<StoreResult<Skin[]>> {
    const status = await this.getStatus();
    let skins: Skin[];
    try {
      skins = await fetchAllSkins();
    } catch {
      skins = CURATED_SKINS;
    }

    if (!skins || skins.length === 0) {
      skins = CURATED_SKINS;
    }

    let filtered = [...skins];

    // Search query filter
    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.displayName.toLowerCase().includes(q) ||
          s.weaponName.toLowerCase().includes(q) ||
          s.weaponType.toLowerCase().includes(q) ||
          s.collectionName.toLowerCase().includes(q) ||
          s.tier.name.toLowerCase().includes(q)
      );
    }

    // Weapon Category filter
    if (filters?.weaponCategory && filters.weaponCategory !== 'All') {
      filtered = filtered.filter((s) => s.weaponType === filters.weaponCategory);
    }

    // Specific Weapon Name filter
    if (filters?.weaponName && filters.weaponName !== 'All') {
      filtered = filtered.filter((s) => s.weaponName === filters.weaponName);
    }

    // Collection filter
    if (filters?.collection && filters.collection !== 'All') {
      filtered = filtered.filter((s) => s.collectionName.toLowerCase() === filters.collection!.toLowerCase());
    }

    // Tier filter
    if (filters?.tier) {
      filtered = filtered.filter((s) => s.tier.name === filters.tier);
    }

    // Min / Max Price
    if (typeof filters?.minPrice === 'number') {
      // Unknown prices can't satisfy a price bound, so they are excluded rather than treated as 0.
      filtered = filtered.filter((s) => hasPrice(s.defaultPrice) && s.defaultPrice >= filters.minPrice!);
    }
    if (typeof filters?.maxPrice === 'number') {
      filtered = filtered.filter((s) => hasPrice(s.defaultPrice) && s.defaultPrice <= filters.maxPrice!);
    }

    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'name-asc':
          filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.displayName.localeCompare(a.displayName));
          break;
        case 'price-asc':
          filtered.sort((a, b) => comparePrice(a.defaultPrice, b.defaultPrice));
          break;
        case 'price-desc':
          filtered.sort((a, b) => comparePrice(a.defaultPrice, b.defaultPrice, -1));
          break;
        case 'tier-desc':
          filtered.sort((a, b) => (b.tier.basePrice || 0) - (a.tier.basePrice || 0));
          break;
      }
    }

    return {
      status,
      data: filtered,
    };
  }
}
