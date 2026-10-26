'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { OfferCard } from './OfferCard';
import { CountdownTimer } from './CountdownTimer';
import { NightMarketSection } from './NightMarketSection';
import { VpIcon } from './VpIcon';
import { hasPrice, sumKnown } from '@/utils/price';
import { EstMark } from '@/components/EstMark';
import {
  RotateCcw,
  Sparkles,
  Heart,
  ShieldAlert,
  Shuffle,
} from 'lucide-react';

export const DailyStoreView: React.FC = () => {
  const {
    dailyStore,
    loading,
    error,
    preferences,
    rerollSimulation,
    refreshStore,
    setProviderId,
    providerId,
    setSecurityModalOpen,
    simulationOffset,
  } = useStore();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 border-2 border-[#FF4655] border-t-transparent animate-spin rounded-full" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#8EA0B0]">
          SYNCHRONIZING ROTATION OFFERS...
        </span>
      </div>
    );
  }

  // Live provider unavailable state
  if (providerId === 'live' || error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-[#151D26] border border-[#FF4655]/40 valo-clip-top-right">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#FF4655]/10 border border-[#FF4655] text-[#FF4655]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#FF4655] text-black font-mono font-bold text-xs uppercase">
                SECURITY BARRIER
              </span>
              <h2 className="text-xl font-bold text-white font-mono">
                Live Store Unavailable
              </h2>
            </div>
            <p className="text-sm text-[#A0B0C0] leading-relaxed">
              {error ??
                'Live mode reads your store through the Riot Client on this machine. See the README to enable it.'}
            </p>
            <div className="p-4 bg-[#0B0F15] border-l-2 border-[#FF4655] text-xs font-mono text-[#8EA0B0] space-y-1">
              <div>{'//'} LIVE MODE (UNOFFICIAL, OPT-IN)</div>
              <div>• No password inputs, no cookies</div>
              <div>• Token read from your local Riot Client, never stored or logged</div>
              <div>• Not supported by Riot: account risk can&apos;t be ruled out</div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setProviderId('demo')}
                className="px-5 py-2.5 bg-[#FF4655] hover:bg-[#FF5E6D] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all valo-clip-top-right"
              >
                Switch to Demo Mode
              </button>
              <button
                onClick={() => setSecurityModalOpen(true)}
                className="px-4 py-2.5 bg-[#1B2937] hover:bg-[#25384B] text-white font-mono text-xs uppercase tracking-wider transition-all border border-[#2D4359]"
              >
                Learn More in Security Docs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const offers = dailyStore?.offers || [];
  const { total: totalStoreVp, unknown: unpricedOffers } = sumKnown(offers.map((off) => off.price));
  const affordableOffersCount = offers.filter(
    (off) => hasPrice(off.price) && preferences.vpBalance >= off.price
  ).length;

  // Check if any daily offer is on the user's wishlist
  const wishlistHits = offers.filter((off) => preferences.wishlist.includes(off.skin.uuid));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Store Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#1E2D3B] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#FF4655] font-mono text-xs font-bold tracking-widest uppercase">
              {'//'} 01 STOREFRONT
            </span>
            <span className="text-[#4E5D6C] text-xs">•</span>
            <span className="text-[#8EA0B0] font-mono text-xs tracking-wider">
              ROTATION DATE: {dailyStore?.rotationDate}
            </span>
            {simulationOffset > 0 && (
              <span className="px-1.5 py-0.2 bg-[#FAD663]/20 border border-[#FAD663] text-[#FAD663] text-[10px] font-mono">
                SIMULATION +{simulationOffset} DAYS
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase font-mono text-white flex items-center gap-2">
            DAILY OFFERS
          </h1>
          <p className="text-xs text-[#7B8B9B] max-w-xl mt-1">
            4 unique weapon skins generated daily from the VALORANT cosmetic registry. Rotates
            automatically every day at 00:00 UTC.
          </p>
        </div>

        {/* Refresh Countdown & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <CountdownTimer expiresAt={dailyStore?.expiresAt} onRefresh={refreshStore} />

          <button
            onClick={rerollSimulation}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#172533] hover:bg-[#FF4655] hover:text-black text-white font-mono text-xs tracking-wider uppercase border border-[#2B3E52] transition-colors valo-clip-top-right self-stretch sm:self-auto justify-center"
            title="Simulate the next daily rotation cycle"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Simulate Next Day</span>
          </button>
        </div>
      </div>

      {/* Wishlist Match Alert Banner */}
      {wishlistHits.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-[#3D141C] to-[#1F1424] border-l-4 border-[#FF4655] border-y border-r border-[#FF4655]/30 flex items-center justify-between gap-3 valo-clip-top-right">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF4655]/20 text-[#FF4655] rounded-full">
              <Heart className="w-5 h-5 fill-[#FF4655]" />
            </div>
            <div>
              <div className="font-mono font-bold text-xs uppercase text-white flex items-center gap-2">
                <span>WISHLIST ITEM DETECTED IN TODAY&apos;S ROTATION!</span>
              </div>
              <p className="text-xs text-[#FFA0AA]">
                {wishlistHits.map((h) => h.skin.displayName).join(', ')} is currently available in
                your store slots.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-[#FAD663]">
            <Sparkles className="w-4 h-4" />
            LUCKY ROTATION
          </div>
        </div>
      )}

      {/* 4-Card Daily Store Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {offers.map((offer, idx) => (
          <OfferCard key={offer.id} offer={offer} slotIndex={idx} />
        ))}
      </div>

      {/* Bottom Storefront Analytics & Affordability Bar */}
      <div className="mt-4 p-4 bg-[#111A24] border border-[#1E2D3B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase tracking-wider">
              TOTAL STORE VALUE
            </span>
            <div className="flex items-center gap-1.5">
              <VpIcon size={16} />
              <span className="font-mono font-bold text-white text-base">
                {totalStoreVp.toLocaleString()} VP
                {unpricedOffers > 0 && ` + ${unpricedOffers} unpriced`}
                <EstMark status={offers.some((o) => o.skin.priceStatus === 'estimated') ? 'estimated' : undefined} />
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-[#1F2F3F]" />

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase tracking-wider">
              AFFORDABLE WITH YOUR VP
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm">
              <span className="text-[#00F5D4] font-bold">
                {affordableOffersCount} of {offers.length}
              </span>
              <span className="text-[#8EA0B0]">items</span>
            </div>
          </div>

          <div className="h-8 w-px bg-[#1F2F3F] hidden sm:block" />

          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-mono text-[#6A7885] uppercase tracking-wider">
              YOUR BALANCE
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm text-[#ECE8E1]">
              <VpIcon size={14} />
              <span>{preferences.vpBalance.toLocaleString()} VP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => refreshStore()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172533] hover:bg-[#203345] text-xs font-mono text-[#8EA0B0] hover:text-white border border-[#2B3E52] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Night Market Section */}
      <NightMarketSection />
    </div>
  );
};
