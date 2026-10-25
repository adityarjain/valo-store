'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { RarityTierName } from '@/types/store';
import { RARITY_TIERS, WEAPON_CATEGORIES } from '@/data/tierConstants';
import { VpIcon } from './VpIcon';
import {
  Search,
  Filter,
  Star,
  Heart,
  Eye,
  X,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { playSound } from '@/utils/audio';

export const CatalogueView: React.FC = () => {
  const {
    catalog,
    catalogLoading,
    preferences,
    toggleFavorite,
    toggleWishlist,
    toggleOwned,
    isFavorite,
    isInWishlist,
    isOwned,
    setInspectSkin,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<RarityTierName | 'All'>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyWishlist, setOnlyWishlist] = useState(false);
  const [onlyOwned, setOnlyOwned] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(6000);
  const [sortBy, setSortBy] = useState<'name-asc' | 'price-asc' | 'price-desc' | 'tier-desc'>('tier-desc');
  const [displayLimit, setDisplayLimit] = useState(24);

  const categories = ['All', ...Object.keys(WEAPON_CATEGORIES)];
  const tiers: (RarityTierName | 'All')[] = [
    'All',
    'Ultra',
    'Exclusive',
    'Premium',
    'Deluxe',
    'Select',
  ];

  // Distinct collections extracted from catalog
  const collections = useMemo(() => {
    const set = new Set<string>();
    for (const s of catalog) {
      if (s.collectionName && s.collectionName !== 'Standard') {
        set.add(s.collectionName);
      }
    }
    return ['All', ...Array.from(set).sort()];
  }, [catalog]);

  // Filtering and sorting logic
  const filteredCatalog = useMemo(() => {
    return catalog.filter((skin) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = skin.displayName.toLowerCase().includes(q);
        const matchesWeapon = skin.weaponName.toLowerCase().includes(q);
        const matchesType = skin.weaponType.toLowerCase().includes(q);
        const matchesColl = skin.collectionName.toLowerCase().includes(q);
        if (!matchesName && !matchesWeapon && !matchesType && !matchesColl) return false;
      }

      // Weapon Category
      if (selectedCategory !== 'All' && skin.weaponType !== selectedCategory) {
        return false;
      }

      // Collection
      if (selectedCollection !== 'All' && skin.collectionName.toLowerCase() !== selectedCollection.toLowerCase()) {
        return false;
      }

      // Rarity Tier
      if (selectedTier !== 'All' && skin.tier.name !== selectedTier) {
        return false;
      }

      // Max price
      if ((skin.defaultPrice ?? 0) > maxPriceFilter) {
        return false;
      }

      // Favorites only
      if (onlyFavorites && !preferences.favorites.includes(skin.uuid)) {
        return false;
      }

      // Wishlist only
      if (onlyWishlist && !preferences.wishlist.includes(skin.uuid)) {
        return false;
      }

      // Owned only
      if (onlyOwned && !preferences.owned.includes(skin.uuid)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.displayName.localeCompare(b.displayName);
      }
      if (sortBy === 'price-asc') {
        return (a.defaultPrice ?? 0) - (b.defaultPrice ?? 0);
      }
      if (sortBy === 'price-desc') {
        return (b.defaultPrice ?? 0) - (a.defaultPrice ?? 0);
      }
      if (sortBy === 'tier-desc') {
        return (b.tier.basePrice || 0) - (a.tier.basePrice || 0);
      }
      return 0;
    });
  }, [
    catalog,
    search,
    selectedCategory,
    selectedCollection,
    selectedTier,
    maxPriceFilter,
    onlyFavorites,
    onlyWishlist,
    onlyOwned,
    sortBy,
    preferences.favorites,
    preferences.wishlist,
    preferences.owned,
  ]);

  const visibleSkins = filteredCatalog.slice(0, displayLimit);

  const handleResetFilters = () => {
    playSound.click(preferences.soundEffects);
    setSearch('');
    setSelectedCategory('All');
    setSelectedCollection('All');
    setSelectedTier('All');
    setMaxPriceFilter(6000);
    setOnlyFavorites(false);
    setOnlyWishlist(false);
    setOnlyOwned(false);
    setSortBy('tier-desc');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#1E2D3B] pb-6">
        <div>
          <span className="text-[#FF4655] font-mono text-xs font-bold tracking-widest uppercase">
            {'//'} 03 COSMETICS DATABASE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase font-mono text-white mt-1">
            SKIN CATALOGUE
          </h1>
          <p className="text-xs text-[#7B8B9B] max-w-xl mt-1">
            Browse official VALORANT weapon skins, filter by collection and weapon tier, inspect chromatic
            variants, and track owned items.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-[#8EA0B0]">
            Showing <strong className="text-white">{filteredCatalog.length}</strong> cosmetics
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 bg-[#101822] border border-[#1F2F3F] p-4 valo-clip-top-right">
        {/* Row 1: Search input + Toggles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6A7885] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, weapon, or collection (e.g. Kuronami, Reaver, Prime)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0F15] text-white pl-9 pr-8 py-2 text-xs font-mono border border-[#233547] focus:border-[#FF4655] outline-none placeholder-[#506070]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6A7885] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Collection Dropdown */}
            <div className="relative">
              <select
                value={selectedCollection}
                onChange={(e) => {
                  playSound.click(preferences.soundEffects);
                  setSelectedCollection(e.target.value);
                }}
                className="bg-[#0B0F15] text-white text-xs font-mono px-3 py-2 border border-[#253648] outline-none appearance-none pr-8 cursor-pointer max-w-[150px] truncate"
              >
                <option value="All">All Collections</option>
                {collections.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6A7885] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Favorites toggle */}
            <button
              onClick={() => {
                playSound.click(preferences.soundEffects);
                setOnlyFavorites(!onlyFavorites);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono border transition-colors ${
                onlyFavorites
                  ? 'bg-[#2A2B1E] border-[#FAD663] text-[#FAD663]'
                  : 'bg-[#15222E] border-[#253648] text-[#8EA0B0] hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-[#FAD663]' : ''}`} />
              <span>Favs ({preferences.favorites.length})</span>
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={() => {
                playSound.click(preferences.soundEffects);
                setOnlyWishlist(!onlyWishlist);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono border transition-colors ${
                onlyWishlist
                  ? 'bg-[#35191E] border-[#FF4655] text-[#FF4655]'
                  : 'bg-[#15222E] border-[#253648] text-[#8EA0B0] hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyWishlist ? 'fill-[#FF4655]' : ''}`} />
              <span>Wish ({preferences.wishlist.length})</span>
            </button>

            {/* Owned toggle */}
            <button
              onClick={() => {
                playSound.click(preferences.soundEffects);
                setOnlyOwned(!onlyOwned);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono border transition-colors ${
                onlyOwned
                  ? 'bg-[#102B25] border-[#00F5D4] text-[#00F5D4]'
                  : 'bg-[#15222E] border-[#253648] text-[#8EA0B0] hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Owned ({preferences.owned.length})</span>
            </button>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-[#0B0F15] text-white text-xs font-mono px-3 py-2 border border-[#253648] outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="tier-desc">Sort: Rarity</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#6A7885] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Price Slider & Category Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          {/* Weapon Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono w-full sm:w-auto">
            <span className="text-[10px] text-[#6A7885] uppercase tracking-wider mr-1 shrink-0">
              CATEGORY:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound.click(preferences.soundEffects);
                  setSelectedCategory(cat);
                }}
                className={`px-2.5 py-1 shrink-0 uppercase tracking-wider text-[11px] transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#FF4655] text-black font-bold'
                    : 'bg-[#15212C] text-[#8EA0B0] hover:text-white hover:bg-[#1A2A38]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Max Price Range Slider */}
          <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[11px] text-[#8EA0B0]">
            <span>Max Price:</span>
            <input
              type="range"
              min="875"
              max="6000"
              step="100"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(parseInt(e.target.value, 10))}
              className="accent-[#FF4655] cursor-pointer w-24"
            />
            <span className="text-white font-bold">{maxPriceFilter.toLocaleString()} VP</span>
          </div>
        </div>

        {/* Row 3: Rarity Tier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-[10px] text-[#6A7885] uppercase tracking-wider mr-1 shrink-0">
            RARITY:
          </span>
          {tiers.map((t) => {
            const isSelected = selectedTier === t;
            const tierMeta = t !== 'All' ? RARITY_TIERS[t] : null;
            return (
              <button
                key={t}
                onClick={() => {
                  playSound.click(preferences.soundEffects);
                  setSelectedTier(t);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 shrink-0 uppercase tracking-wider text-[11px] border transition-colors ${
                  isSelected
                    ? 'bg-[#182B3A] text-white border-white font-bold'
                    : 'bg-[#131D26] text-[#7A8A9A] border-[#1E2D3B] hover:text-white'
                }`}
                style={{
                  borderLeftColor: tierMeta ? tierMeta.color : undefined,
                  borderLeftWidth: tierMeta ? '3px' : undefined,
                }}
              >
                {t}
              </button>
            );
          })}

          {(selectedCategory !== 'All' ||
            selectedCollection !== 'All' ||
            selectedTier !== 'All' ||
            maxPriceFilter < 6000 ||
            onlyFavorites ||
            onlyWishlist ||
            onlyOwned ||
            search) && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-[11px] text-[#FF4655] hover:underline uppercase shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalogue Skin Grid */}
      {catalogLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-2 border-[#FF4655] border-t-transparent animate-spin rounded-full" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#8EA0B0]">
            INDEXING VALORANT ARSENAL...
          </span>
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-[#111922] border border-[#1E2D3B] p-8 text-center">
          <Filter className="w-8 h-8 text-[#506070]" />
          <h3 className="font-mono font-bold text-base text-white uppercase">No Cosmetics Found</h3>
          <p className="text-xs text-[#7A8A9A] max-w-sm">
            Try adjusting your search keywords, collection filter, or max price slider.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 px-4 py-2 bg-[#FF4655] text-black font-mono font-bold text-xs uppercase"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleSkins.map((skin) => {
            const isFav = isFavorite(skin.uuid);
            const isWish = isInWishlist(skin.uuid);
            const owned = isOwned(skin.uuid);
            const tierColor = skin.tier.color || '#5A9FE2';

            return (
              <div
                key={skin.uuid}
                onMouseEnter={() => playSound.hover(preferences.soundEffects)}
                className={`group relative flex flex-col justify-between bg-[#121B24] hover:bg-[#162330] border ${
                  owned ? 'border-[#00D692]/60' : 'border-[#213243]'
                } hover:border-[#38516B] transition-all p-3.5 valo-clip-bottom-right`}
              >
                {/* Top tier pill & status */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: tierColor }}
                    >
                      {skin.tier.name}
                    </span>
                    {owned && (
                      <span className="px-1.5 py-0.2 bg-[#00D692]/20 border border-[#00D692] text-[#00D692] text-[9px] font-mono font-bold">
                        OWNED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleOwned(skin.uuid)}
                      className={`p-1 ${owned ? 'text-[#00F5D4]' : 'text-[#4A5A6A] hover:text-white'}`}
                      title={owned ? 'Mark as not owned' : 'Mark as owned'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(skin.uuid)}
                      className={`p-1 ${isFav ? 'text-[#FAD663]' : 'text-[#506070] hover:text-white'}`}
                      title="Favorite"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-[#FAD663]' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleWishlist(skin.uuid)}
                      className={`p-1 ${isWish ? 'text-[#FF4655]' : 'text-[#506070] hover:text-white'}`}
                      title="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-[#FF4655]' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Skin image preview */}
                <div
                  onClick={() => setInspectSkin(skin)}
                  className="relative h-32 flex items-center justify-center cursor-pointer my-2"
                >
                  {skin.displayIcon && (
                    <Image
                      src={skin.displayIcon}
                      alt={skin.displayName}
                      fill
                      sizes="250px"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  )}
                </div>

                {/* Details and Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#1C2937]">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#6E7E8F]">
                      {skin.collectionName} {'//'} {skin.weaponName}
                    </span>
                    <h4 className="font-bold text-xs text-white truncate">{skin.displayName}</h4>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <VpIcon size={14} />
                      <span className="font-mono text-xs text-white font-bold">
                        {(skin.defaultPrice ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setInspectSkin(skin)}
                        className="text-[11px] font-mono text-[#00F5D4] hover:text-white flex items-center gap-1 px-2 py-0.5 bg-[#142330] hover:bg-[#1E3447] border border-[#243B50]"
                        title="Quick Inspect"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>

                      <Link
                        href={`/skin/${skin.uuid}`}
                        className="text-[11px] font-mono text-[#8EA0B0] hover:text-white p-1 hover:bg-[#1E3447] border border-transparent hover:border-[#243B50]"
                        title="Open Dedicated Page"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {filteredCatalog.length > displayLimit && (
        <div className="flex justify-center my-6">
          <button
            onClick={() => setDisplayLimit((prev) => prev + 24)}
            className="px-6 py-2.5 bg-[#172533] hover:bg-[#FF4655] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-widest border border-[#2B3E52] transition-colors valo-clip-top-right"
          >
            Load More Cosmetics (+24)
          </button>
        </div>
      )}
    </div>
  );
};
