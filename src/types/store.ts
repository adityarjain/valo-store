export type RarityTierName = 'Select' | 'Deluxe' | 'Premium' | 'Exclusive' | 'Ultra' | 'Standard';

export interface TierInfo {
  uuid: string;
  name: RarityTierName;
  devName: string;
  color: string;
  bgGlow: string;
  borderColor: string;
  displayIcon: string;
  basePrice: number;
  meleePrice: number;
}

export interface Chroma {
  uuid: string;
  displayName: string;
  displayIcon: string | null;
  fullRender: string | null;
  swatch: string | null;
  streamedVideo: string | null;
}

export interface SkinLevel {
  uuid: string;
  displayName: string;
  levelItem: string | null;
  displayIcon: string | null;
  streamedVideo: string | null;
}

export type PriceStatus = 'verified' | 'estimated' | 'unpriced';

export interface Skin {
  uuid: string;
  displayName: string;
  weaponType: string; // e.g. 'Rifle', 'Sidearm', 'Sniper', 'Melee', 'SMG', 'Heavy', 'Shotgun'
  weaponName: string; // e.g. 'Vandal', 'Phantom', 'Melee', 'Sheriff'
  collectionName: string; // e.g. 'Kuronami', 'Reaver', 'Prime', 'Oni'
  contentTierUuid: string | null;
  tier: TierInfo;
  displayIcon: string;
  fullRender?: string;
  wallpaper?: string | null;
  chromas: Chroma[];
  levels: SkinLevel[];
  defaultPrice: number | null; // null if unknown/unverified
  priceStatus: PriceStatus;
  priceNote?: string;
  themeUuid?: string;
}

export interface StoreOffer {
  id: string;
  skin: Skin;
  price: number | null;
  originalPrice?: number | null;
  discountPercent?: number;
  featured?: boolean;
}

export interface NightMarketOffer {
  id: string;
  skin: Skin;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  isRevealed: boolean;
}

export interface DailyStoreResult {
  offers: StoreOffer[];
  expiresAt: string; // ISO 8601 string
  remainingSeconds: number;
  isDemo: boolean;
  source: 'demo' | 'live';
  lastUpdated: string;
  rotationDate: string; // YYYY-MM-DD
}

export interface FeaturedBundle {
  uuid: string;
  displayName: string;
  description: string;
  price: number;
  basePrice: number;
  discountPercent: number;
  displayIcon: string;
  items: StoreOffer[];
  expiresAt: string;
  remainingDays: number;
}

export type ProviderState = 'loading' | 'success' | 'unavailable' | 'error';

export interface ProviderStatus {
  state: ProviderState;
  isAvailable: boolean;
  mode: 'demo' | 'live';
  providerName: string;
  version: string;
  message: string;
  details?: string;
  isLiveApi?: boolean;
  itemCount?: number;
}

export interface StoreResult<T> {
  data?: T;
  error?: string;
  status: ProviderStatus;
}

export interface StoreProvider {
  id: string;
  name: string;
  description: string;
  getStatus(): Promise<ProviderStatus>;
  getDailyOffers(): Promise<StoreResult<DailyStoreResult>>;
  getFeaturedBundle(): Promise<StoreResult<FeaturedBundle>>;
  getCatalog(filters?: CatalogFilters): Promise<StoreResult<Skin[]>>;
  getNightMarketOffers?(): Promise<StoreResult<NightMarketOffer[]>>;
}

export interface CatalogFilters {
  search?: string;
  weaponCategory?: string;
  weaponName?: string;
  collection?: string;
  tier?: RarityTierName;
  minPrice?: number;
  maxPrice?: number;
  priceFilter?: 'all' | 'verified' | 'unpriced';
  favoritesOnly?: boolean;
  wishlistOnly?: boolean;
  ownedOnly?: boolean;
  sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'tier-desc';
}

export interface UserPreferences {
  soundEffects: boolean;
  scanlines: boolean;
  vpBalance: number;
  favorites: string[]; // skin UUIDs
  wishlist: string[]; // skin UUIDs
  owned: string[]; // skin UUIDs
  revealedNightMarketIds: string[]; // IDs of flipped cards
  activeTab: 'store' | 'bundle' | 'catalog' | 'wishlist';
}
