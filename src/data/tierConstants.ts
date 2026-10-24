import { TierInfo, RarityTierName } from '@/types/store';

export const RARITY_TIERS: Record<RarityTierName, TierInfo> = {
  Select: {
    uuid: '12683d76-48d7-84a3-4e09-6985794f0445',
    name: 'Select',
    devName: 'Select',
    color: '#5A9FE2',
    bgGlow: 'rgba(90, 159, 226, 0.25)',
    borderColor: '#5A9FE2',
    displayIcon: 'https://media.valorant-api.com/contenttiers/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png',
    basePrice: 875,
    meleePrice: 1750,
  },
  Deluxe: {
    uuid: '0cebb8be-46d7-c12a-d306-e9907bfc5a25',
    name: 'Deluxe',
    devName: 'Deluxe',
    color: '#00D692',
    bgGlow: 'rgba(0, 214, 146, 0.25)',
    borderColor: '#00D692',
    displayIcon: 'https://media.valorant-api.com/contenttiers/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png',
    basePrice: 1275,
    meleePrice: 2550,
  },
  Premium: {
    uuid: '60bca009-4182-7998-dee7-b8a2558dc369',
    name: 'Premium',
    devName: 'Premium',
    color: '#D1548D',
    bgGlow: 'rgba(209, 84, 141, 0.25)',
    borderColor: '#D1548D',
    displayIcon: 'https://media.valorant-api.com/contenttiers/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png',
    basePrice: 1775,
    meleePrice: 3550,
  },
  Exclusive: {
    uuid: 'e046854e-406c-37f4-6607-19a9ba8426fc',
    name: 'Exclusive',
    devName: 'Exclusive',
    color: '#F5955B',
    bgGlow: 'rgba(245, 149, 91, 0.25)',
    borderColor: '#F5955B',
    displayIcon: 'https://media.valorant-api.com/contenttiers/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png',
    basePrice: 2175,
    meleePrice: 4350,
  },
  Ultra: {
    uuid: '411e4a55-4e59-7757-41f0-86a53f101bb5',
    name: 'Ultra',
    devName: 'Ultra',
    color: '#FAD663',
    bgGlow: 'rgba(250, 214, 99, 0.25)',
    borderColor: '#FAD663',
    displayIcon: 'https://media.valorant-api.com/contenttiers/411e4a55-4e59-7757-41f0-86a53f101bb5/displayicon.png',
    basePrice: 2475,
    meleePrice: 4950,
  },
  Standard: {
    uuid: 'standard',
    name: 'Standard',
    devName: 'Standard',
    color: '#8B97A0',
    bgGlow: 'rgba(139, 151, 160, 0.15)',
    borderColor: '#8B97A0',
    displayIcon: '',
    basePrice: 0,
    meleePrice: 0,
  },
};

export const TIER_BY_UUID: Record<string, TierInfo> = {
  '12683d76-48d7-84a3-4e09-6985794f0445': RARITY_TIERS.Select,
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': RARITY_TIERS.Deluxe,
  '60bca009-4182-7998-dee7-b8a2558dc369': RARITY_TIERS.Premium,
  'e046854e-406c-37f4-6607-19a9ba8426fc': RARITY_TIERS.Exclusive,
  '411e4a55-4e59-7757-41f0-86a53f101bb5': RARITY_TIERS.Ultra,
};

export const WEAPON_CATEGORIES: Record<string, string[]> = {
  Rifles: ['Vandal', 'Phantom', 'Guardian', 'Bulldog'],
  Sidearms: ['Classic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff'],
  Melee: ['Melee', 'Knife', 'Sword', 'Karambit', 'Dagger', 'Axe', 'Kunai', 'Blade', 'Claw', 'Bat', 'Fan', 'Scythe', 'Hammer'],
  Snipers: ['Operator', 'Marshal', 'Outlaw'],
  SMGs: ['Spectre', 'Stinger'],
  Shotguns: ['Judge', 'Bucky'],
  Heavy: ['Odin', 'Ares'],
};

export const ALL_WEAPONS = [
  'Vandal',
  'Phantom',
  'Melee',
  'Operator',
  'Sheriff',
  'Ghost',
  'Classic',
  'Spectre',
  'Bulldog',
  'Guardian',
  'Marshal',
  'Outlaw',
  'Judge',
  'Bucky',
  'Frenzy',
  'Shorty',
  'Ares',
  'Odin',
  'Stinger',
];

export function getTierFromUuid(uuid: string | null): TierInfo {
  if (!uuid) return RARITY_TIERS.Standard;
  return TIER_BY_UUID[uuid] || RARITY_TIERS.Premium;
}

export function detectWeaponFromDisplayName(displayName: string): { weaponName: string; weaponType: string } {
  for (const [category, weapons] of Object.entries(WEAPON_CATEGORIES)) {
    for (const weapon of weapons) {
      if (displayName.toLowerCase().includes(weapon.toLowerCase())) {
        return { weaponName: weapon, weaponType: category };
      }
    }
  }
  const meleeKeywords = ['knife', 'karambit', 'blade', 'axe', 'sword', 'dagger', 'kunai', 'claw', 'scythe', 'bat', 'mace', 'fan', 'katana', 'hammer', 'staff'];
  for (const kw of meleeKeywords) {
    if (displayName.toLowerCase().includes(kw)) {
      return { weaponName: 'Melee', weaponType: 'Melee' };
    }
  }
  return { weaponName: 'Weapon', weaponType: 'Other' };
}

export function detectCollectionName(displayName: string): string {
  // Strip common weapon suffixes
  const weaponSuffixes = [
    'Vandal', 'Phantom', 'Operator', 'Sheriff', 'Ghost', 'Classic', 'Spectre',
    'Bulldog', 'Guardian', 'Marshal', 'Outlaw', 'Judge', 'Bucky', 'Frenzy',
    'Shorty', 'Ares', 'Odin', 'Stinger', 'Knife', 'Karambit', 'Blade', 'Axe',
    'Sword', 'Dagger', 'Kunai', 'Claw', 'Scythe', 'Bat', 'Mace', 'Fan', 'Katana',
    'Hammer', 'Melee'
  ];

  let cleaned = displayName.trim();
  for (const weapon of weaponSuffixes) {
    const regex = new RegExp(`\\s+${weapon}$`, 'i');
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, '').trim();
      break;
    }
  }

  // Handle special melee names like "Kuronami no Yaiba" -> "Kuronami", "Soulstrife Scythe" -> "Soulstrife"
  if (cleaned.toLowerCase().startsWith('kuronami')) return 'Kuronami';
  if (cleaned.toLowerCase().startsWith('reaver')) return 'Reaver';
  if (cleaned.toLowerCase().startsWith('prime')) return 'Prime';
  if (cleaned.toLowerCase().startsWith('oni')) return 'Oni';
  if (cleaned.toLowerCase().startsWith('glitchpop')) return 'Glitchpop';
  if (cleaned.toLowerCase().startsWith('araxys')) return 'Araxys';
  if (cleaned.toLowerCase().startsWith('ion')) return 'Ion';
  if (cleaned.toLowerCase().startsWith('chronovoid')) return 'ChronoVoid';
  if (cleaned.toLowerCase().startsWith('prelude to chaos')) return 'Prelude to Chaos';
  if (cleaned.toLowerCase().startsWith('magepunk')) return 'Magepunk';
  if (cleaned.toLowerCase().startsWith('neo frontier')) return 'Neo Frontier';
  if (cleaned.toLowerCase().startsWith('spectrum')) return 'Spectrum';
  if (cleaned.toLowerCase().startsWith('sovereign')) return 'Sovereign';
  if (cleaned.toLowerCase().startsWith('radiant entertainment')) return 'Radiant Entertainment System';
  if (cleaned.toLowerCase().startsWith('elderflame')) return 'Elderflame';
  if (cleaned.toLowerCase().startsWith('rgx 11z pro')) return 'RGX 11z Pro';
  if (cleaned.toLowerCase().startsWith('singularity')) return 'Singularity';
  if (cleaned.toLowerCase().startsWith('gaia')) return "Gaia's Vengeance";
  if (cleaned.toLowerCase().startsWith('xenohunter')) return 'Xenohunter';
  if (cleaned.toLowerCase().startsWith('origin')) return 'Origin';

  return cleaned || 'Standard';
}
