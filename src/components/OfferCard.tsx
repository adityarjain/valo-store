'use client';

import React from 'react';
import Image from 'next/image';
import { StoreOffer } from '@/types/store';
import { useStore } from '@/context/StoreContext';
import { VpIcon } from './VpIcon';
import { Star, Heart, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { playSound } from '@/utils/audio';

interface OfferCardProps {
  offer: StoreOffer;
  slotIndex?: number;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, slotIndex = 0 }) => {
  const {
    preferences,
    toggleFavorite,
    toggleWishlist,
    isFavorite,
    isInWishlist,
    setInspectSkin,
  } = useStore();

  const skin = offer.skin;
  const isFav = isFavorite(skin.uuid);
  const isWish = isInWishlist(skin.uuid);
  const canAfford = preferences.vpBalance >= (offer.price ?? 0);
  const vpDiff = (offer.price ?? 0) - preferences.vpBalance;

  const tier = skin.tier;
  const tierColor = tier.color || '#5A9FE2';

  const handleInspect = () => {
    setInspectSkin(skin, offer.price ?? undefined);
  };

  return (
    <div
      onMouseEnter={() => playSound.hover(preferences.soundEffects)}
      className="group relative flex flex-col justify-between bg-[#121B24] hover:bg-[#162330] border border-[#213243] hover:border-[#38516B] transition-all duration-300 valo-clip-bottom-right overflow-hidden shadow-lg hover:shadow-2xl"
      style={{
        boxShadow: `0 8px 30px -10px ${tier.bgGlow || 'rgba(0,0,0,0.5)'}`,
      }}
    >
      {/* Top Tier Accent Bar & Header */}
      <div
        className="h-1.5 w-full transition-all duration-300"
        style={{ backgroundColor: tierColor }}
      />

      <div className="p-4 flex items-center justify-between border-b border-[#1B2937]/70 bg-[#0E161F]">
        <div className="flex items-center gap-2">
          {tier.displayIcon ? (
            <div className="relative w-4 h-4 shrink-0">
              <Image
                src={tier.displayIcon}
                alt={tier.name}
                fill
                sizes="16px"
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: tierColor }}
            />
          )}
          <span
            className="text-[10px] font-mono font-bold tracking-wider uppercase"
            style={{ color: tierColor }}
          >
            {tier.name} EDITION
          </span>
        </div>

        {/* Slot Number Tag */}
        <span className="text-[10px] font-mono text-[#506070] tracking-widest">
          SLOT 0{slotIndex + 1}
        </span>
      </div>

      {/* Weapon Image Showcase Area */}
      <div
        onClick={handleInspect}
        className="relative h-48 sm:h-56 flex items-center justify-center p-4 cursor-pointer overflow-hidden bg-gradient-to-b from-transparent via-[#14212D]/40 to-transparent"
      >
        {/* Subtle radial tier ambient background */}
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-2xl"
          style={{
            background: `radial-gradient(circle, ${tierColor} 0%, transparent 70%)`,
          }}
        />

        {/* Weapon Display Art */}
        <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-2deg]">
          {skin.displayIcon ? (
            <Image
              src={skin.displayIcon}
              alt={skin.displayName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-contain filter drop-shadow-[0_12px_15px_rgba(0,0,0,0.8)]"
              unoptimized
            />
          ) : (
            <div className="text-xs font-mono text-gray-500">IMAGE UNAVAILABLE</div>
          )}
        </div>

        {/* Quick Action Overlay (Top right of weapon preview) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-10"
        >
          <button
            onClick={() => toggleFavorite(skin.uuid)}
            className={`p-1.5 transition-colors ${
              isFav
                ? 'text-[#FAD663] bg-[#2A2B20] border border-[#FAD663]'
                : 'text-[#6A7885] hover:text-white bg-[#0F1822]/80 hover:bg-[#1B2937]'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-[#FAD663]' : ''}`} />
          </button>

          <button
            onClick={() => toggleWishlist(skin.uuid)}
            className={`p-1.5 transition-colors ${
              isWish
                ? 'text-[#FF4655] bg-[#35181E] border border-[#FF4655]'
                : 'text-[#6A7885] hover:text-white bg-[#0F1822]/80 hover:bg-[#1B2937]'
            }`}
            title={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-[#FF4655]' : ''}`} />
          </button>
        </div>

        {/* Hover Inspect Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B1015]/90 border border-[#2B3B4B] px-3 py-1 text-[10px] font-mono uppercase text-[#ECE8E1] flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-[#FF4655]" />
          <span>Click to Inspect</span>
        </div>
      </div>

      {/* Card Footer: Titles & Price */}
      <div className="p-4 bg-[#0F1720] border-t border-[#1C2B3A] flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E7E8F]">
            {skin.weaponName} {'//'} {skin.weaponType}
          </span>
          <h3 className="font-bold text-sm sm:text-base text-white tracking-wide truncate group-hover:text-[#ECE8E1]">
            {skin.displayName}
          </h3>
        </div>

        {/* Price & Balance Indicator */}
        <div className="flex items-center justify-between pt-1 border-t border-[#182431]">
          <div className="flex items-center gap-1.5">
            <VpIcon size={18} />
            <span className="font-mono font-bold text-base text-white">
              {(offer.price ?? 0).toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[#6A7885]">VP</span>
          </div>

          <div className="text-right">
            {canAfford ? (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#00F5D4] bg-[#0E2625] px-1.5 py-0.5 border border-[#00F5D4]/30">
                <CheckCircle2 className="w-3 h-3" />
                AFFORDABLE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#FF8591] bg-[#2E1418] px-1.5 py-0.5 border border-[#FF4655]/30">
                <AlertCircle className="w-3 h-3" />
                -{vpDiff.toLocaleString()} VP
              </span>
            )}
          </div>
        </div>

        {/* Inspect & Variants Button */}
        <button
          onClick={handleInspect}
          className="w-full py-2 bg-[#172432] hover:bg-[#FF4655] text-xs font-mono font-bold tracking-widest uppercase text-white hover:text-black transition-all flex items-center justify-center gap-1.5 valo-clip-top-right mt-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Chroma & VFX</span>
        </button>
      </div>
    </div>
  );
};
