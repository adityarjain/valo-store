'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { Chroma, SkinLevel, Skin } from '@/types/store';
import { VpIcon } from './VpIcon';
import { X, Star, Heart, Film, Play, Layers, Sparkles } from 'lucide-react';
import { playSound } from '@/utils/audio';
import { hasPrice, PRICE_UNAVAILABLE } from '@/utils/price';

interface InspectContentProps {
  skin: Skin;
  price?: number;
  onClose: () => void;
}

const SkinInspectModalContent: React.FC<InspectContentProps> = ({ skin, price, onClose }) => {
  const { preferences, toggleFavorite, toggleWishlist, isFavorite, isInWishlist } = useStore();

  const [selectedChromaIndex, setSelectedChromaIndex] = useState<number>(0);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  const isFav = isFavorite(skin.uuid);
  const isWish = isInWishlist(skin.uuid);
  const tier = skin.tier;

  const chromas = skin.chromas || [];
  const levels = skin.levels || [];
  const currentChroma: Chroma | undefined = chromas[selectedChromaIndex];
  const currentLevel: SkinLevel | undefined = levels[selectedLevelIndex];

  const activeImage =
    currentChroma?.fullRender || currentChroma?.displayIcon || skin.fullRender || skin.displayIcon;

  const videoUrl = currentLevel?.streamedVideo || levels.find((l) => l.streamedVideo)?.streamedVideo;

  const handleSelectChroma = (idx: number) => {
    playSound.hover(preferences.soundEffects);
    setSelectedChromaIndex(idx);
    setShowVideo(false);
  };

  const handleSelectLevel = (idx: number) => {
    playSound.click(preferences.soundEffects);
    setSelectedLevelIndex(idx);
  };

  return (
    <div
      className="relative w-full max-w-4xl bg-[#0F1722] border border-[#243547] valo-clip-bottom-right shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      style={{
        boxShadow: `0 0 50px -10px ${tier.bgGlow || 'rgba(0,0,0,0.8)'}`,
      }}
    >
      {/* Top Header Bar */}
      <div className="p-4 bg-[#0B1017] border-b border-[#1A2633] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider valo-clip-top-right"
            style={{ backgroundColor: tier.color, color: '#000000' }}
          >
            {tier.name} EDITION
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-[#6E7E8F]">
              {skin.weaponName} {'//'} {skin.weaponType}
            </span>
            <h2 className="text-base sm:text-lg font-bold font-mono text-white tracking-wide">
              {currentChroma?.displayName || skin.displayName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(skin.uuid)}
            className={`p-2 transition-colors ${
              isFav ? 'text-[#FAD663] bg-[#2A2B1E]' : 'text-[#6A7885] hover:text-white bg-[#15222E]'
            }`}
            title="Toggle Favorite"
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-[#FAD663]' : ''}`} />
          </button>

          <button
            onClick={() => toggleWishlist(skin.uuid)}
            className={`p-2 transition-colors ${
              isWish ? 'text-[#FF4655] bg-[#35191E]' : 'text-[#6A7885] hover:text-white bg-[#15222E]'
            }`}
            title="Toggle Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWish ? 'fill-[#FF4655]' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-[#8EA0B0] hover:text-white hover:bg-[#1A2838] transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Main Showcase (Image or Video) */}
        <div className="relative min-h-[240px] sm:min-h-[300px] flex items-center justify-center bg-gradient-to-b from-[#131E2A] via-[#0E1620] to-[#0B0F15] border border-[#1E2E3E] p-6 valo-clip-top-right overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 pointer-events-none blur-3xl"
            style={{
              background: `radial-gradient(circle, ${tier.color} 0%, transparent 70%)`,
            }}
          />

          {showVideo && videoUrl ? (
            <div className="relative w-full h-full max-h-[340px] flex items-center justify-center z-10">
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className="max-h-[320px] w-auto border border-[#2B3E52] shadow-2xl"
              />
            </div>
          ) : (
            <div className="relative w-full h-56 sm:h-72 z-10 flex items-center justify-center">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={skin.displayName}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]"
                  unoptimized
                />
              ) : (
                <div className="font-mono text-xs text-gray-500">PREVIEW UNAVAILABLE</div>
              )}
            </div>
          )}

          {videoUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1015]/90 hover:bg-[#FF4655] hover:text-black text-white font-mono text-xs uppercase tracking-wider border border-[#2A3C4E] transition-colors"
            >
              {showVideo ? (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Skin Model</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#FF4655] group-hover:text-black" />
                  <span>Watch In-Game VFX Video</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Chroma Variants & Levels Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Chroma Variants */}
          <div className="flex flex-col gap-2 bg-[#121B24] p-4 border border-[#1E2E3E]">
            <span className="text-[11px] font-mono text-[#6E7E8F] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F5D4]" />
              CHROMATIC VARIANTS ({chromas.length})
            </span>

            {chromas.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {chromas.map((chroma, idx) => {
                  const isSelected = selectedChromaIndex === idx;
                  return (
                    <button
                      key={chroma.uuid}
                      onClick={() => handleSelectChroma(idx)}
                      className={`group relative flex items-center gap-2 p-1.5 border transition-all ${
                        isSelected
                          ? 'bg-[#1C2C3C] border-[#00F5D4] text-white shadow-md'
                          : 'bg-[#0E161F] border-[#223344] text-[#8EA0B0] hover:text-white hover:bg-[#152330]'
                      }`}
                      title={chroma.displayName}
                    >
                      {chroma.swatch ? (
                        <div className="relative w-6 h-6 shrink-0 border border-[#2C3E50]">
                          <Image
                            src={chroma.swatch}
                            alt={chroma.displayName}
                            fill
                            sizes="24px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-[#253648] flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                      <span className="text-xs font-mono pr-1 truncate max-w-[130px]">
                        {idx === 0 ? 'Default' : `Variant ${idx}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#6A7885]">No additional chromas for this tier.</p>
            )}
          </div>

          {/* Right: Skin Levels Progression */}
          <div className="flex flex-col gap-2 bg-[#121B24] p-4 border border-[#1E2E3E]">
            <span className="text-[11px] font-mono text-[#6E7E8F] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#FAD663]" />
              UPGRADE LEVELS ({levels.length})
            </span>

            {levels.length > 0 ? (
              <div className="flex flex-col gap-1.5 mt-1">
                {levels.map((lvl, idx) => {
                  const isSelected = selectedLevelIndex === idx;
                  const levelDescription =
                    lvl.levelItem?.replace('EEquippableSkinLevelItem::', '') ||
                    (idx === 0
                      ? 'Base Weapon Model'
                      : idx === 1
                      ? 'Custom VFX & Sound Effects'
                      : idx === 2
                      ? 'Inspect & Reload Animations'
                      : 'Finisher & Kill Banner');

                  return (
                    <div
                      key={lvl.uuid}
                      onClick={() => handleSelectLevel(idx)}
                      className={`flex items-center justify-between p-2 border cursor-pointer text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-[#1C2C3C] border-[#FAD663] text-white'
                          : 'bg-[#0E161F] border-[#203141] text-[#8EA0B0] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#0B0F15] border border-[#2B3E52] flex items-center justify-center text-[10px] text-[#FAD663]">
                          L{idx + 1}
                        </span>
                        <span>{levelDescription}</span>
                      </div>
                      {lvl.streamedVideo && (
                        <span title="Video preview available">
                          <Film className="w-3 h-3 text-[#00F5D4]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#6A7885]">Standard un-upgradable weapon.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Footer: Price & Actions */}
      <div className="p-4 bg-[#0B1017] border-t border-[#1A2633] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <VpIcon size={22} />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#6E7E8F] uppercase">OFFER PRICE</span>
            <span className="font-mono font-bold text-lg text-white">
              {hasPrice(price ?? skin.defaultPrice)
                ? `${(price ?? skin.defaultPrice)!.toLocaleString()} VP`
                : PRICE_UNAVAILABLE}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleWishlist(skin.uuid)}
            className={`flex-1 sm:flex-initial px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold border transition-colors flex items-center justify-center gap-1.5 ${
              isWish
                ? 'bg-[#35191E] border-[#FF4655] text-[#FF4655]'
                : 'bg-[#152330] border-[#283C50] text-white hover:bg-[#1E3347]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-[#FF4655]' : ''}`} />
            <span>{isWish ? 'On Wishlist' : 'Add to Wishlist'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FF4655] hover:bg-[#FF5E6D] text-black font-mono font-bold text-xs uppercase tracking-widest valo-clip-top-right transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export const SkinInspectModal: React.FC = () => {
  const { inspectSkin, inspectPrice, setInspectSkin } = useStore();

  if (!inspectSkin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <SkinInspectModalContent
        key={inspectSkin.uuid}
        skin={inspectSkin}
        price={inspectPrice}
        onClose={() => setInspectSkin(null)}
      />
    </div>
  );
};
