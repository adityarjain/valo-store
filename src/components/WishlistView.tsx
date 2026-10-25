'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { VpIcon } from './VpIcon';
import { hasPrice, sumKnown, PRICE_UNAVAILABLE } from '@/utils/price';
import { EstMark } from '@/components/EstMark';
import {
  Heart,
  Trash2,
  Eye,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const WishlistView: React.FC = () => {
  const {
    catalog,
    preferences,
    toggleWishlist,
    toggleOwned,
    isOwned,
    clearAllPreferences,
    dailyStore,
    setInspectSkin,
    setActiveTab,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'wishlist' | 'owned'>('wishlist');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const wishlistedSkins = catalog.filter((skin) => preferences.wishlist.includes(skin.uuid));
  const ownedSkins = catalog.filter((skin) => preferences.owned.includes(skin.uuid));

  // Skins with an unknown price are left out of the totals (and reported), never counted as 0 VP.
  const { total: totalWishlistVp, unknown: unpricedWishlistCount } = sumKnown(
    wishlistedSkins.map((s) => s.defaultPrice)
  );
  const shortfallVp = Math.max(0, totalWishlistVp - preferences.vpBalance);
  const canAffordAll = preferences.vpBalance >= totalWishlistVp && unpricedWishlistCount === 0;

  // Check if any wishlisted skin is currently in daily store
  const storeSkinUuids = (dailyStore?.offers || []).map((o) => o.skin.uuid);
  const availableInStore = wishlistedSkins.filter((s) => storeSkinUuids.includes(s.uuid));

  const displayList = activeSubTab === 'wishlist' ? wishlistedSkins : ownedSkins;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#1E2D3B] pb-6">
        <div>
          <span className="text-[#FF4655] font-mono text-xs font-bold tracking-widest uppercase">
            {'//'} 04 PERSONAL ARSENAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase font-mono text-white mt-1">
            WISHLIST & OWNED INVENTORY
          </h1>
          <p className="text-xs text-[#7B8B9B] max-w-xl mt-1">
            Track your desired cosmetic wishlist, manage owned skins locally, and calculate required
            Valorant Points. All data is kept strictly in your local browser storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#261215] hover:bg-[#FF4655] hover:text-black text-[#FF8591] font-mono text-xs uppercase tracking-wider border border-[#521E24] transition-colors valo-clip-top-right"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Local Data</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#172533] hover:bg-[#FF4655] hover:text-black text-white font-mono text-xs uppercase tracking-wider border border-[#2B3E52] transition-colors valo-clip-top-right"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub Tabs: Wishlist vs Owned */}
      <div className="flex items-center gap-2 border-b border-[#1E2D3B]">
        <button
          onClick={() => setActiveSubTab('wishlist')}
          className={`px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'wishlist'
              ? 'text-white bg-[#152330] border-b-2 border-[#FF4655]'
              : 'text-[#8EA0B0] hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeSubTab === 'wishlist' ? 'text-[#FF4655]' : ''}`} />
          <span>WISHLIST ({wishlistedSkins.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('owned')}
          className={`px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeSubTab === 'owned'
              ? 'text-white bg-[#152330] border-b-2 border-[#00F5D4]'
              : 'text-[#8EA0B0] hover:text-white'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${activeSubTab === 'owned' ? 'text-[#00F5D4]' : ''}`} />
          <span>OWNED INVENTORY ({ownedSkins.length})</span>
        </button>
      </div>

      {/* Wishlist VP Analytics Summary (Only shown for Wishlist tab) */}
      {activeSubTab === 'wishlist' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#111922] border border-[#1F2F3F] p-4 valo-clip-top-right">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase tracking-wider">
              TOTAL WISHLIST COST
            </span>
            <div className="flex items-center gap-2 mt-1">
              <VpIcon size={20} />
              <span className="font-mono font-bold text-xl text-white">
                {totalWishlistVp.toLocaleString()} VP
                <EstMark status={wishlistedSkins.some((s) => s.priceStatus === 'estimated') ? 'estimated' : undefined} />
              </span>
              {unpricedWishlistCount > 0 && (
                <span className="text-[10px] font-mono text-[#FAD663]">
                  +{unpricedWishlistCount} unpriced, not counted
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase tracking-wider">
              CURRENT VP BALANCE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <VpIcon size={20} />
              <span className="font-mono font-bold text-xl text-[#00F5D4]">
                {preferences.vpBalance.toLocaleString()} VP
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase tracking-wider">
              FINANCIAL STATUS
            </span>
            <div className="mt-1 font-mono text-xs">
              {canAffordAll ? (
                <span className="text-[#00F5D4] font-bold">
                  ✓ YOU CAN AFFORD ALL {wishlistedSkins.length} ITEMS
                </span>
              ) : shortfallVp === 0 ? (
                <span className="text-[#FAD663] font-bold">
                  PRICE UNKNOWN FOR {unpricedWishlistCount} ITEM{unpricedWishlistCount === 1 ? '' : 'S'}
                </span>
              ) : (
                <span className="text-[#FF8591] font-bold">
                  SHORTFALL: {shortfallVp.toLocaleString()} VP NEEDED
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Available in store banner */}
      {activeSubTab === 'wishlist' && availableInStore.length > 0 && (
        <div className="p-4 bg-[#2E161C] border border-[#FF4655] flex items-center justify-between gap-4 valo-clip-top-right">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#FF4655] shrink-0" />
            <div>
              <h4 className="font-mono font-bold text-xs uppercase text-white">
                {availableInStore.length} WISHLIST ITEM(S) AVAILABLE TODAY!
              </h4>
              <p className="text-xs text-[#FFA0AA]">
                {availableInStore.map((s) => s.displayName).join(', ')} is currently active in your
                daily store slots.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('store')}
            className="px-3 py-1.5 bg-[#FF4655] text-black font-mono font-bold text-xs uppercase hover:bg-white transition-colors shrink-0"
          >
            Go to Store
          </button>
        </div>
      )}

      {/* Items List */}
      {displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 bg-[#111922] border border-[#1E2D3B] p-8 text-center">
          {activeSubTab === 'wishlist' ? (
            <>
              <Heart className="w-10 h-10 text-[#506070]" />
              <h3 className="font-mono font-bold text-base text-white uppercase">Your Wishlist is Empty</h3>
              <p className="text-xs text-[#7A8A9A] max-w-sm">
                Save skins you want to acquire by clicking the heart icon on any weapon in the Daily Store
                or Catalogue.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-10 h-10 text-[#506070]" />
              <h3 className="font-mono font-bold text-base text-white uppercase">No Owned Skins Tracked</h3>
              <p className="text-xs text-[#7A8A9A] max-w-sm">
                Mark skins you already own in VALORANT by clicking the checkmark icon on any card in the
                Catalogue.
              </p>
            </>
          )}

          <button
            onClick={() => setActiveTab('catalog')}
            className="mt-3 px-5 py-2.5 bg-[#FF4655] text-black font-mono font-bold text-xs uppercase valo-clip-top-right"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map((skin) => {
            const inStoreToday = storeSkinUuids.includes(skin.uuid);
            const owned = isOwned(skin.uuid);

            return (
              <div
                key={skin.uuid}
                className={`relative flex flex-col justify-between bg-[#121B24] border ${
                  inStoreToday ? 'border-[#FF4655] shadow-lg shadow-[#FF4655]/20' : 'border-[#213243]'
                } p-4 valo-clip-bottom-right`}
              >
                {inStoreToday && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#FF4655] text-black font-mono font-bold text-[9px] uppercase tracking-wider z-10">
                    IN STORE TODAY
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{ color: skin.tier.color }}
                  >
                    {skin.tier.name} EDITION
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle owned */}
                    <button
                      onClick={() => toggleOwned(skin.uuid)}
                      className={`p-1 transition-colors ${
                        owned ? 'text-[#00F5D4]' : 'text-[#506070] hover:text-white'
                      }`}
                      title={owned ? 'Mark as not owned' : 'Mark as owned'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle wishlist */}
                    <button
                      onClick={() => toggleWishlist(skin.uuid)}
                      className="text-[#6A7885] hover:text-[#FF4655] p-1 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

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
                      className="object-contain hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-[#1C2937]">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#6E7E8F]">
                      {skin.collectionName} {'//'} {skin.weaponName}
                    </span>
                    <h4 className="font-bold text-xs text-white truncate">{skin.displayName}</h4>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <VpIcon size={14} />
                      <span className="font-mono text-xs text-white font-bold">
                        {hasPrice(skin.defaultPrice) ? `${skin.defaultPrice.toLocaleString()} VP` : PRICE_UNAVAILABLE}
                        {hasPrice(skin.defaultPrice) && <EstMark status={skin.priceStatus} note={skin.priceNote} />}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setInspectSkin(skin)}
                        className="text-[11px] font-mono text-[#00F5D4] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>

                      <Link
                        href={`/skin/${skin.uuid}`}
                        className="text-[11px] font-mono text-[#8EA0B0] hover:text-white p-1"
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

      {/* Clear Preferences Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#131B24] border border-[#FF4655] p-6 valo-clip-bottom-right shadow-2xl">
            <div className="flex items-center gap-2 text-[#FF4655] font-mono font-bold text-sm mb-3">
              <AlertTriangle className="w-5 h-5" />
              <span>CLEAR ALL LOCAL PREFERENCES?</span>
            </div>
            <p className="text-xs text-[#A0B0C0] leading-relaxed mb-6 font-sans">
              This will remove all locally stored favorites, wishlisted skins, owned flags, and simulated
              VP balance from your browser&apos;s localStorage. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 bg-[#1A2735] hover:bg-[#25374A] text-white font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllPreferences();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 bg-[#FF4655] hover:bg-[#FF5E6D] text-black font-mono font-bold text-xs uppercase valo-clip-top-right"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
