'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { VpIcon } from './VpIcon';
import { Sparkles, Eye, Star, Heart, Lock, CheckCircle2 } from 'lucide-react';
import { playSound } from '@/utils/audio';

export const NightMarketSection: React.FC = () => {
  const {
    nightMarket,
    preferences,
    revealNightMarketCard,
    revealAllNightMarketCards,
    setInspectSkin,
    toggleFavorite,
    toggleWishlist,
    isFavorite,
    isInWishlist,
  } = useStore();

  if (!nightMarket || nightMarket.length === 0) {
    return null;
  }

  const revealedCount = nightMarket.filter((o) =>
    preferences.revealedNightMarketIds.includes(o.id)
  ).length;

  return (
    <div className="mt-8 border-t border-[#1E2D3B] pt-8 flex flex-col gap-6">
      {/* Night Market Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#171424] via-[#0E1622] to-[#121A26] p-5 border border-[#32284C] valo-clip-bottom-right shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#7928CA] to-[#FF0080] flex items-center justify-center text-white valo-clip-top-right shadow-lg shadow-[#7928CA]/30">
            <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF0080] uppercase">
                {'//'} SECRET ROTATION
              </span>
              <span className="px-1.5 py-0.2 bg-[#7928CA]/30 border border-[#7928CA] text-[#ECE8E1] text-[9px] font-mono">
                {revealedCount} OF {nightMarket.length} REVEALED
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wide text-white uppercase flex items-center gap-2">
              NIGHT.MARKET
            </h2>
          </div>
        </div>

        {revealedCount < nightMarket.length && (
          <button
            onClick={revealAllNightMarketCards}
            className="px-4 py-2 bg-[#7928CA] hover:bg-[#8A3CE6] text-white font-mono font-bold text-xs uppercase tracking-wider valo-clip-top-right transition-colors"
          >
            Reveal All 6 Cards
          </button>
        )}
      </div>

      {/* 6-Card Night Market Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {nightMarket.map((item, idx) => {
          const isRevealed = preferences.revealedNightMarketIds.includes(item.id);
          const skin = item.skin;
          const tier = skin.tier;
          const isFav = isFavorite(skin.uuid);
          const isWish = isInWishlist(skin.uuid);
          const canAfford = preferences.vpBalance >= item.discountedPrice;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isRevealed) {
                  revealNightMarketCard(item.id);
                }
              }}
              onMouseEnter={() => playSound.hover(preferences.soundEffects)}
              className={`relative min-h-[300px] flex flex-col justify-between border transition-all duration-500 cursor-pointer overflow-hidden valo-clip-bottom-right ${
                isRevealed
                  ? 'bg-[#101824] border-[#293E54] hover:border-[#4B7099] shadow-xl'
                  : 'bg-gradient-to-b from-[#181128] via-[#100D1C] to-[#0B0914] border-[#38265E] hover:border-[#7928CA] hover:shadow-2xl hover:shadow-[#7928CA]/30'
              }`}
            >
              {!isRevealed ? (
                /* Unrevealed Card Back */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none group">
                  <div className="w-16 h-24 border-2 border-[#7928CA]/60 flex items-center justify-center bg-[#17102C]/60 group-hover:scale-105 group-hover:border-[#FF0080] transition-all duration-300 valo-clip-diagonal relative">
                    <div className="w-10 h-16 border border-[#ECE8E1]/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#FF0080] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#8E78B8] uppercase tracking-widest mt-4">
                    SLOT 0{idx + 1}
                  </span>
                  <span className="font-mono font-bold text-xs text-white uppercase tracking-wider mt-1 group-hover:text-[#FF0080] transition-colors">
                    CLICK TO FLIP
                  </span>
                </div>
              ) : (
                /* Revealed Card Front */
                <div className="flex-1 flex flex-col justify-between p-3.5 animate-fadeIn">
                  {/* Top Bar: Discount Badge & Actions */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#00D692] text-black font-mono font-black text-xs valo-clip-top-right">
                      -{item.discountPercent}%
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFavorite(skin.uuid)}
                        className={`p-1 ${isFav ? 'text-[#FAD663]' : 'text-[#6A7885] hover:text-white'}`}
                      >
                        <Star className={`w-3 h-3 ${isFav ? 'fill-[#FAD663]' : ''}`} />
                      </button>
                      <button
                        onClick={() => toggleWishlist(skin.uuid)}
                        className={`p-1 ${isWish ? 'text-[#FF4655]' : 'text-[#6A7885] hover:text-white'}`}
                      >
                        <Heart className={`w-3 h-3 ${isWish ? 'fill-[#FF4655]' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Weapon Art */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectSkin(skin);
                    }}
                    className="relative h-28 my-2 flex items-center justify-center cursor-pointer group/art"
                  >
                    {skin.displayIcon && (
                      <Image
                        src={skin.displayIcon}
                        alt={skin.displayName}
                        fill
                        sizes="180px"
                        className="object-contain group-hover/art:scale-105 transition-transform duration-300 filter drop-shadow-md"
                        unoptimized
                      />
                    )}
                  </div>

                  {/* Titles & Prices */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1C2C3D]">
                    <span
                      className="text-[9px] font-mono font-bold uppercase"
                      style={{ color: tier.color }}
                    >
                      {tier.name}
                    </span>
                    <h4 className="font-bold text-xs text-white truncate" title={skin.displayName}>
                      {skin.displayName}
                    </h4>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5">
                        <VpIcon size={14} />
                        <span className="font-mono font-black text-xs text-[#00F5D4]">
                          {item.discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono line-through text-[#657788]">
                          {item.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      {canAfford && (
                        <span title="Affordable with current VP">
                          <CheckCircle2 className="w-3 h-3 text-[#00F5D4]" />
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectSkin(skin);
                      }}
                      className="mt-1 w-full py-1 bg-[#152332] hover:bg-[#FF4655] hover:text-black text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Inspect
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
