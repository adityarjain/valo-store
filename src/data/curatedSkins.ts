import { Skin, Chroma, SkinLevel } from '@/types/store';
import { getTierFromUuid, detectWeaponFromDisplayName, detectCollectionName } from './tierConstants';
import rawSkins from './rawSkins.json';

interface RawSkinItem {
  uuid: string;
  displayName: string;
  contentTierUuid: string | null;
  displayIcon: string | null;
  chromas?: Chroma[];
  levels?: SkinLevel[];
  wallpaper?: string | null;
}

export const CURATED_SKINS: Skin[] = (rawSkins as RawSkinItem[]).map((raw) => {
  const { weaponName, weaponType } = detectWeaponFromDisplayName(raw.displayName);
  const collectionName = detectCollectionName(raw.displayName);
  const tier = getTierFromUuid(raw.contentTierUuid);

  // Calculate authentic Valorant Point (VP) price based on tier & melee vs weapon
  // These are tier-bracket estimates plus community-documented overrides, not Riot store prices.
  // A tier with no price bracket (Standard) stays null instead of becoming 0 VP.
  let defaultPrice: number | null = tier.basePrice > 0 ? tier.basePrice : null;
  if (defaultPrice !== null && weaponType === 'Melee') {
    defaultPrice = tier.meleePrice || 3550;
  }
  // Specific known skin price overrides where applicable
  if (defaultPrice === null) {
    // no purchase price, keep unknown
  } else if (raw.displayName.includes('Spectrum')) {
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
    chromas: raw.chromas || [],
    levels: raw.levels || [],
    defaultPrice,
    priceStatus: defaultPrice !== null ? ('estimated' as const) : ('unpriced' as const),
    priceNote:
      defaultPrice !== null
        ? 'Estimated from the tier price bracket; not a Riot store price.'
        : 'No known purchase price.',
  };
});

export const POPULAR_SKIN_UUIDS = CURATED_SKINS.map((s) => s.uuid);
