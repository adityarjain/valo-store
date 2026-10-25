'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { VpIcon } from './VpIcon';
import { Clock, Eye, Gift, Star, Heart } from 'lucide-react';
import { playSound } from '@/utils/audio';

export const BundleView: React.FC = () => {
  const { bundle, loading, setInspectSkin, preferences, toggleFavorite, toggleWishlist, isFavorite, isInWishlist } = useStore();

  if (loading || !bundle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-2 border-[#FF4655] border-t-transparent animate-spin rounded-full" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#8EA0B0]">
          LOADING FEATURED COLLECTION...
        </span>
      </div>
    );
  }

  const savingsVp = bundle.basePrice - bundle.price;

  return (
    <div className="flex flex-col gap-8">
      {/* Bundle Hero Header Showcase */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#111A24] via-[#192736] to-[#0D151D] border border-[#25394D] valo-clip-bottom-right p-6 sm:p-10 shadow-2xl">
        {/* Background tactical styling & glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4655]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-[#00F5D4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#FF4655] text-black font-mono font-bold text-[11px] tracking-wider uppercase valo-clip-top-right">
                FEATURED BUNDLE
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#00F5D4] bg-[#0E2C2C] px-2 py-0.5 border border-[#00F5D4]/30">
                <Clock className="w-3 h-3" />
                {bundle.remainingDays} DAYS REMAINING
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white uppercase">
              {bundle.displayName}
            </h1>

            <p className="text-sm text-[#A0B0C0] max-w-xl leading-relaxed">
              {bundle.description}
            </p>

            {/* Price & Bundle Savings */}
            <div className="flex flex-wrap items-center gap-4 mt-2 pt-4 border-t border-[#233547]">
              <div className="flex items-center gap-2">
                <VpIcon size={26} />
                <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                  {bundle.price.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-[#6A7885]">VP</span>
              </div>

              {bundle.discountPercent > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono line-through text-[#6A7885]">
                    {bundle.basePrice.toLocaleString()} VP
                  </span>
                  <span className="px-2 py-0.5 bg-[#00D692] text-black font-mono font-bold text-xs">
                    SAVE {savingsVp.toLocaleString()} VP ({bundle.discountPercent}%)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#FAD663] bg-[#2A2616] p-2 border border-[#FAD663]/30 max-w-md">
              <Gift className="w-4 h-4 shrink-0" />
              <span>COLLECTION BONUS: Melee weapon & player accessories included FREE.</span>
            </div>
          </div>

          {/* Large Hero Image */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[200px] sm:min-h-[260px]">
            {bundle.displayIcon && (
              <div className="relative w-full h-56 sm:h-72">
                <Image
                  src={bundle.displayIcon}
                  alt={bundle.displayName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)]"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bundle Items Showcase */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1E2D3B] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[#FF4655] font-mono text-xs font-bold tracking-widest uppercase">
              {'//'} 02 INCLUDED ITEMS
            </span>
            <span className="text-xs text-[#6A7885]">({bundle.items.length} COSMETICS)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {bundle.items.map((item, idx) => {
            const skin = item.skin;
            const isFav = isFavorite(skin.uuid);
            const isWish = isInWishlist(skin.uuid);

            return (
              <div
                key={item.id}
                onMouseEnter={() => playSound.hover(preferences.soundEffects)}
                className="group relative flex flex-col justify-between bg-[#121B24] hover:bg-[#162330] border border-[#213243] hover:border-[#38516B] transition-all p-3 valo-clip-bottom-right"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#6A7885] tracking-wider uppercase">
                    ITEM 0{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(skin.uuid)}
                      className={`p-1 ${isFav ? 'text-[#FAD663]' : 'text-[#506070] hover:text-white'}`}
                    >
                      <Star className={`w-3 h-3 ${isFav ? 'fill-[#FAD663]' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleWishlist(skin.uuid)}
                      className={`p-1 ${isWish ? 'text-[#FF4655]' : 'text-[#506070] hover:text-white'}`}
                    >
                      <Heart className={`w-3 h-3 ${isWish ? 'fill-[#FF4655]' : ''}`} />
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => setInspectSkin(skin)}
                  className="relative h-28 flex items-center justify-center cursor-pointer my-2"
                >
                  {skin.displayIcon && (
                    <Image
                      src={skin.displayIcon}
                      alt={skin.displayName}
                      fill
                      sizes="200px"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-[#1C2937]">
                  <h4 className="font-bold text-xs text-white truncate">{skin.displayName}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <VpIcon size={14} />
                      <span className="font-mono text-xs text-white font-bold">
                        {(item.price ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => setInspectSkin(skin)}
                      className="text-[10px] font-mono text-[#00F5D4] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
