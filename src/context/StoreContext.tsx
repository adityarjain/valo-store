'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  StoreProvider,
  ProviderStatus,
  DailyStoreResult,
  FeaturedBundle,
  NightMarketOffer,
  Skin,
  UserPreferences,
} from '@/types/store';
import { getStoreProvider, DemoStoreProvider } from '@/providers';
import { playSound } from '@/utils/audio';

interface StoreContextType {
  providerId: 'demo' | 'live';
  setProviderId: (id: 'demo' | 'live') => void;
  status: ProviderStatus | null;
  dailyStore: DailyStoreResult | null;
  bundle: FeaturedBundle | null;
  nightMarket: NightMarketOffer[];
  catalog: Skin[];
  loading: boolean;
  catalogLoading: boolean;
  error: string | null;
  preferences: UserPreferences;
  toggleFavorite: (skinUuid: string) => void;
  toggleWishlist: (skinUuid: string) => void;
  toggleOwned: (skinUuid: string) => void;
  isFavorite: (skinUuid: string) => boolean;
  isInWishlist: (skinUuid: string) => boolean;
  isOwned: (skinUuid: string) => boolean;
  revealNightMarketCard: (id: string) => void;
  revealAllNightMarketCards: () => void;
  clearAllPreferences: () => void;
  setVpBalance: (balance: number) => void;
  setSoundEffects: (enabled: boolean) => void;
  setScanlines: (enabled: boolean) => void;
  setActiveTab: (tab: 'store' | 'bundle' | 'catalog' | 'wishlist') => void;
  rerollSimulation: () => Promise<void>;
  refreshStore: () => Promise<void>;
  inspectSkin: Skin | null;
  setInspectSkin: (skin: Skin | null) => void;
  securityModalOpen: boolean;
  setSecurityModalOpen: (open: boolean) => void;
  simulationOffset: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  soundEffects: true,
  scanlines: true,
  vpBalance: 2475,
  favorites: [
    'd8d5d7a1-4d81-8560-54bc-0692ab40f69b', // Kuronami Vandal
  ],
  wishlist: ['d8d5d7a1-4d81-8560-54bc-0692ab40f69b'],
  owned: ['3cc39f94-443e-e0e1-39be-21a9c9f3b0aa'], // Sample owned skin
  revealedNightMarketIds: [],
  activeTab: 'store',
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreContextProvider({ children }: { children: React.ReactNode }) {
  const [providerId, setProviderIdState] = useState<'demo' | 'live'>('demo');
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [dailyStore, setDailyStore] = useState<DailyStoreResult | null>(null);
  const [bundle, setBundle] = useState<FeaturedBundle | null>(null);
  const [nightMarket, setNightMarket] = useState<NightMarketOffer[]>([]);
  const [catalog, setCatalog] = useState<Skin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectSkin, setInspectSkinState] = useState<Skin | null>(null);
  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);
  const [simulationOffset, setSimulationOffset] = useState<number>(0);

  // Local-only preferences persisted to localStorage
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('valo_store_prefs_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_PREFERENCES, ...parsed };
        }
      } catch (err) {
        console.error('Failed to read preferences from localStorage:', err);
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Save preferences changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('valo_store_prefs_v2', JSON.stringify(preferences));
      } catch (err) {
        console.error('Failed to save preferences to localStorage:', err);
      }
    }
  }, [preferences]);

  const provider = useMemo(() => getStoreProvider(providerId), [providerId]);

  const loadStoreData = useCallback(async (prov: StoreProvider) => {
    setLoading(true);
    setError(null);

    try {
      const provStatus = await prov.getStatus();
      setStatus(provStatus);

      const [offersRes, bundleRes, nmRes] = await Promise.all([
        prov.getDailyOffers(),
        prov.getFeaturedBundle(),
        prov.getNightMarketOffers ? prov.getNightMarketOffers() : Promise.resolve({ data: [] }),
      ]);

      if (offersRes.error) {
        setError(offersRes.error);
      } else if (offersRes.data) {
        setDailyStore(offersRes.data);
      }

      if (bundleRes.data) {
        setBundle(bundleRes.data);
      }

      if (nmRes.data) {
        setNightMarket(nmRes.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalogData = useCallback(async (prov: StoreProvider) => {
    setCatalogLoading(true);
    try {
      const catalogRes = await prov.getCatalog();
      if (catalogRes.data) {
        setCatalog(catalogRes.data);
      }
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  // Async load data on provider mount or change
  useEffect(() => {
    let isCancelled = false;

    async function initializeProvider() {
      setLoading(true);
      setError(null);

      try {
        const provStatus = await provider.getStatus();
        if (isCancelled) return;
        setStatus(provStatus);

        const [offersRes, bundleRes, catalogRes, nmRes] = await Promise.all([
          provider.getDailyOffers(),
          provider.getFeaturedBundle(),
          provider.getCatalog(),
          provider.getNightMarketOffers ? provider.getNightMarketOffers() : Promise.resolve({ data: [] }),
        ]);

        if (isCancelled) return;

        if (offersRes.error) {
          setError(offersRes.error);
        } else if (offersRes.data) {
          setDailyStore(offersRes.data);
        }

        if (bundleRes.data) {
          setBundle(bundleRes.data);
        }

        if (catalogRes.data) {
          setCatalog(catalogRes.data);
        }

        if (nmRes.data) {
          setNightMarket(nmRes.data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to initialize store provider');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setCatalogLoading(false);
        }
      }
    }

    initializeProvider();

    return () => {
      isCancelled = true;
    };
  }, [provider]);

  const setProviderId = (id: 'demo' | 'live') => {
    playSound.click(preferences.soundEffects);
    setProviderIdState(id);
  };

  const rerollSimulation = async () => {
    if (provider instanceof DemoStoreProvider) {
      playSound.click(preferences.soundEffects);
      const nextOffset = simulationOffset + 1;
      provider.setSeedOffset(nextOffset);
      setSimulationOffset(nextOffset);
      await loadStoreData(provider);
    }
  };

  const refreshStore = async () => {
    playSound.click(preferences.soundEffects);
    await loadStoreData(provider);
    await loadCatalogData(provider);
  };

  const toggleFavorite = (skinUuid: string) => {
    const isFav = preferences.favorites.includes(skinUuid);
    playSound.favorite(preferences.soundEffects, !isFav);
    setPreferences((prev) => {
      const exists = prev.favorites.includes(skinUuid);
      const nextFavorites = exists
        ? prev.favorites.filter((id) => id !== skinUuid)
        : [...prev.favorites, skinUuid];
      return { ...prev, favorites: nextFavorites };
    });
  };

  const toggleWishlist = (skinUuid: string) => {
    playSound.click(preferences.soundEffects);
    setPreferences((prev) => {
      const exists = prev.wishlist.includes(skinUuid);
      const nextWishlist = exists
        ? prev.wishlist.filter((id) => id !== skinUuid)
        : [...prev.wishlist, skinUuid];
      return { ...prev, wishlist: nextWishlist };
    });
  };

  const toggleOwned = (skinUuid: string) => {
    playSound.click(preferences.soundEffects);
    setPreferences((prev) => {
      const exists = prev.owned.includes(skinUuid);
      const nextOwned = exists
        ? prev.owned.filter((id) => id !== skinUuid)
        : [...prev.owned, skinUuid];
      return { ...prev, owned: nextOwned };
    });
  };

  const revealNightMarketCard = (id: string) => {
    playSound.inspect(preferences.soundEffects);
    setPreferences((prev) => {
      if (prev.revealedNightMarketIds.includes(id)) return prev;
      return {
        ...prev,
        revealedNightMarketIds: [...prev.revealedNightMarketIds, id],
      };
    });
  };

  const revealAllNightMarketCards = () => {
    playSound.favorite(preferences.soundEffects, true);
    setPreferences((prev) => ({
      ...prev,
      revealedNightMarketIds: nightMarket.map((o) => o.id),
    }));
  };

  const clearAllPreferences = () => {
    playSound.click(preferences.soundEffects);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('valo_store_prefs_v2');
        localStorage.removeItem('valo_skins_cache_v2');
      } catch {
        // ignore
      }
    }
    setPreferences(DEFAULT_PREFERENCES);
  };

  const isFavorite = (skinUuid: string) => preferences.favorites.includes(skinUuid);
  const isInWishlist = (skinUuid: string) => preferences.wishlist.includes(skinUuid);
  const isOwned = (skinUuid: string) => preferences.owned.includes(skinUuid);

  const setVpBalance = (vpBalance: number) => {
    setPreferences((prev) => ({ ...prev, vpBalance: Math.max(0, vpBalance) }));
  };

  const setSoundEffects = (soundEffects: boolean) => {
    setPreferences((prev) => ({ ...prev, soundEffects }));
  };

  const setScanlines = (scanlines: boolean) => {
    setPreferences((prev) => ({ ...prev, scanlines }));
  };

  const setActiveTab = (activeTab: 'store' | 'bundle' | 'catalog' | 'wishlist') => {
    playSound.click(preferences.soundEffects);
    setPreferences((prev) => ({ ...prev, activeTab }));
  };

  const setInspectSkin = (skin: Skin | null) => {
    if (skin) {
      playSound.inspect(preferences.soundEffects);
    } else {
      playSound.click(preferences.soundEffects);
    }
    setInspectSkinState(skin);
  };

  return (
    <StoreContext.Provider
      value={{
        providerId,
        setProviderId,
        status,
        dailyStore,
        bundle,
        nightMarket,
        catalog,
        loading,
        catalogLoading,
        error,
        preferences,
        toggleFavorite,
        toggleWishlist,
        toggleOwned,
        isFavorite,
        isInWishlist,
        isOwned,
        revealNightMarketCard,
        revealAllNightMarketCards,
        clearAllPreferences,
        setVpBalance,
        setSoundEffects,
        setScanlines,
        setActiveTab,
        rerollSimulation,
        refreshStore,
        inspectSkin,
        setInspectSkin,
        securityModalOpen,
        setSecurityModalOpen,
        simulationOffset,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreContextProvider');
  }
  return ctx;
}
