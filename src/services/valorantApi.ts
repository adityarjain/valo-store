import { Skin, Chroma, SkinLevel } from '@/types/store';
import { getTierFromUuid, detectWeaponFromDisplayName, detectCollectionName } from '@/data/tierConstants';
import { CURATED_SKINS } from '@/data/curatedSkins';

let cachedSkins: Skin[] | null = null;

interface ApiChroma {
  uuid: string;
  displayName: string;
  displayIcon: string | null;
  fullRender: string | null;
  swatch: string | null;
  streamedVideo: string | null;
}

interface ApiLevel {
  uuid: string;
  displayName: string;
  levelItem: string | null;
  displayIcon: string | null;
  streamedVideo: string | null;
}

interface ApiSkin {
  uuid: string;
  displayName: string;
  themeUuid?: string;
  contentTierUuid: string | null;
  displayIcon: string | null;
  wallpaper: string | null;
  chromas?: ApiChroma[];
  levels?: ApiLevel[];
}

export async function fetchAllSkins(): Promise<Skin[]> {
  if (cachedSkins && cachedSkins.length > 0) {
    return cachedSkins;
  }

  // Try to load cached skins from localStorage in browser
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('valo_skins_cache_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 50) {
          cachedSkins = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  try {
    const res = await fetch('https://valorant-api.com/v1/weapons/skins', {
      next: { revalidate: 86400 }, // Cache 24h
    });

    if (!res.ok) {
      console.warn('Valorant API fetch failed with status:', res.status);
      return CURATED_SKINS;
    }

    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) {
      return CURATED_SKINS;
    }

    const rawList = json.data as ApiSkin[];

    // Filter out Standard (base default weapons without rarity tiers) and promotional dummy assets
    const parsedSkins: Skin[] = rawList
      .filter((s) => {
        if (!s.displayIcon) return false;
        if (s.displayName.startsWith('Standard ') || s.displayName === 'Melee') return false;
        if (s.displayName.includes('Random')) return false;
        return true;
      })
      .map((raw) => {
        const { weaponName, weaponType } = detectWeaponFromDisplayName(raw.displayName);
        const collectionName = detectCollectionName(raw.displayName);
        const tier = getTierFromUuid(raw.contentTierUuid);

        // Prices are NOT available from the Valorant-API cosmetics catalogue.
        // They are estimated from the tier's standard VP bracket plus known overrides.
        // Standard-tier skins (contentTierUuid === null or basePrice === 0) have no
        // purchase price — they are base-game default weapons.
        let defaultPrice: number | null = tier.basePrice > 0 ? tier.basePrice : null;

        if (defaultPrice !== null) {
          if (weaponType === 'Melee') {
            defaultPrice = tier.meleePrice > 0 ? tier.meleePrice : defaultPrice;
          }

          // Apply known per-collection price overrides (these are still estimates
          // sourced from community documentation, not the Riot store API).
          if (raw.displayName.includes('Spectrum')) {
            defaultPrice = weaponType === 'Melee' ? 5350 : 2675;
          } else if (raw.displayName.includes('Radiant Entertainment System')) {
            defaultPrice = weaponType === 'Melee' ? 5900 : 2975;
          } else if (
            raw.displayName.includes('Prelude to Chaos') ||
            raw.displayName.includes('ChronoVoid') ||
            raw.displayName.includes('Araxys') ||
            raw.displayName.includes('Cryostasis')
          ) {
            defaultPrice = weaponType === 'Melee' ? 4350 : 2175;
          } else if (raw.displayName.includes('Kuronami')) {
            defaultPrice = weaponType === 'Melee' ? 5350 : 2375;
          } else if (raw.displayName.includes('Elderflame')) {
            defaultPrice = weaponType === 'Melee' ? 4950 : 2475;
          } else if (raw.displayName.includes('Ignite Fan') || raw.displayName.includes('Misericórdia')) {
            defaultPrice = 4750;
          }
        }

        // priceStatus reflects the reliability of the price figure:
        // - 'estimated': inferred from tier bracket / community overrides (not from Riot API)
        // - 'unpriced':  no known purchase price (Standard / base-game skins)
        // 'verified' is reserved for future integration with an authoritative price source.
        const priceStatus: import('@/types/store').PriceStatus =
          defaultPrice !== null ? 'estimated' : 'unpriced';

        const chromas: Chroma[] = (raw.chromas || []).map((c) => ({
          uuid: c.uuid,
          displayName: c.displayName,
          displayIcon: c.displayIcon,
          fullRender: c.fullRender,
          swatch: c.swatch,
          streamedVideo: c.streamedVideo,
        }));

        const levels: SkinLevel[] = (raw.levels || []).map((l) => ({
          uuid: l.uuid,
          displayName: l.displayName,
          levelItem: l.levelItem,
          displayIcon: l.displayIcon,
          streamedVideo: l.streamedVideo,
        }));

        return {
          uuid: raw.uuid,
          displayName: raw.displayName,
          weaponType,
          weaponName,
          collectionName,
          contentTierUuid: raw.contentTierUuid,
          tier,
          displayIcon: raw.displayIcon || '',
          fullRender: raw.chromas?.[0]?.fullRender || raw.displayIcon || '',
          wallpaper: raw.wallpaper || null,
          chromas,
          levels,
          defaultPrice,
          priceStatus,
          priceNote:
            priceStatus === 'estimated'
              ? 'Estimated from the tier price bracket; not a Riot store price.'
              : 'No known purchase price.',
          themeUuid: raw.themeUuid,
        };
      });

    if (parsedSkins.length > 0) {
      cachedSkins = parsedSkins;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('valo_skins_cache_v3', JSON.stringify(parsedSkins));
        } catch {
          // localStorage might be full or quota exceeded, ignore safely
        }
      }
      return parsedSkins;
    }

    return CURATED_SKINS;
  } catch (err) {
    console.error('Error fetching valorant skins:', err);
    return CURATED_SKINS;
  }
}
