'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StoreContextProvider, useStore } from '@/context/StoreContext';
import { Navbar } from '@/components/Navbar';
import { StatusBanner } from '@/components/StatusBanner';
import { SecurityModal } from '@/components/SecurityModal';
import { VpIcon } from '@/components/VpIcon';
import {
  ArrowLeft,
  Star,
  Heart,
  CheckCircle2,
  Film,
  Play,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { playSound } from '@/utils/audio';

function SkinDetailPageContent() {
  const params = useParams();
  const skinId = params?.id as string;

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
  } = useStore();

  const [selectedChromaIndex, setSelectedChromaIndex] = useState(0);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const skin = useMemo(() => {
    return catalog.find((s) => s.uuid === skinId);
  }, [catalog, skinId]);

  if (catalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <div className="w-12 h-12 border-2 border-[#FF4655] border-t-transparent animate-spin rounded-full" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#8EA0B0]">
          LOADING COSMETIC SPECIFICATIONS...
        </span>
      </div>
    );
  }

  if (!skin) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-[#111822] border border-[#213346] text-center valo-clip-bottom-right">
        <h2 className="font-mono font-bold text-lg text-white uppercase mb-2">Skin Not Found</h2>
        <p className="text-xs text-[#7B8B9B] mb-6">
          The requested weapon skin UUID ({skinId}) could not be located in the current database.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF4655] text-black font-mono font-bold text-xs uppercase valo-clip-top-right"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isFav = isFavorite(skin.uuid);
  const isWish = isInWishlist(skin.uuid);
  const owned = isOwned(skin.uuid);
  const tier = skin.tier;

  const chromas = skin.chromas || [];
  const levels = skin.levels || [];
  const currentChroma = chromas[selectedChromaIndex];
  const currentLevel = levels[selectedLevelIndex];

  const activeImage =
    currentChroma?.fullRender || currentChroma?.displayIcon || skin.fullRender || skin.displayIcon;

  const videoUrl = currentLevel?.streamedVideo || levels.find((l) => l.streamedVideo)?.streamedVideo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Top Breadcrumbs & Back */}
      <div className="flex items-center justify-between border-b border-[#1E2D3B] pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8EA0B0] hover:text-[#00F5D4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO STOREFRONT</span>
        </Link>

        <div className="text-[11px] font-mono text-[#6A7885]">
          <span>CATALOGUE</span> {'//'} <span className="text-white">{skin.collectionName}</span> {'//'}{' '}
          <span className="text-[#FF4655]">{skin.weaponName}</span>
        </div>
      </div>

      {/* Main Showcase Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Large Render & Video */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative min-h-[340px] sm:min-h-[440px] flex items-center justify-center bg-gradient-to-b from-[#131E2A] via-[#0E1620] to-[#0A0E14] border border-[#1E2E3E] p-8 valo-clip-top-right overflow-hidden shadow-2xl">
            {/* Tier Glow */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none blur-3xl"
              style={{
                background: `radial-gradient(circle, ${tier.color} 0%, transparent 70%)`,
              }}
            />

            {showVideo && videoUrl ? (
              <div className="relative w-full h-full max-h-[380px] flex items-center justify-center z-10">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-[360px] w-auto border border-[#2B3E52] shadow-2xl"
                />
              </div>
            ) : (
              <div className="relative w-full h-72 sm:h-96 z-10 flex items-center justify-center">
                {activeImage ? (
                  <Image
                    src={activeImage}
                    alt={skin.displayName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-contain filter drop-shadow-[0_25px_30px_rgba(0,0,0,0.9)]"
                    unoptimized
                  />
                ) : (
                  <div className="font-mono text-xs text-gray-500">PREVIEW UNAVAILABLE</div>
                )}
              </div>
            )}

            {/* Video preview button overlay */}
            {videoUrl && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1015]/90 hover:bg-[#FF4655] hover:text-black text-white font-mono text-xs uppercase tracking-wider border border-[#2A3C4E] transition-colors"
              >
                {showVideo ? (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Weapon Model</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#FF4655]" />
                    <span>Watch In-Game VFX Video</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Chromatic Variants Palette */}
          {chromas.length > 0 && (
            <div className="bg-[#101822] p-5 border border-[#1E2E3E] valo-clip-bottom-right">
              <span className="text-[11px] font-mono text-[#6E7E8F] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#00F5D4]" />
                CHROMATIC VARIANTS ({chromas.length})
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {chromas.map((chroma, idx) => {
                  const isSelected = selectedChromaIndex === idx;
                  return (
                    <button
                      key={chroma.uuid}
                      onClick={() => {
                        playSound.hover(preferences.soundEffects);
                        setSelectedChromaIndex(idx);
                        setShowVideo(false);
                      }}
                      className={`flex items-center gap-2 p-2 border transition-all ${
                        isSelected
                          ? 'bg-[#1C2C3C] border-[#00F5D4] text-white shadow-lg shadow-[#00F5D4]/10'
                          : 'bg-[#0E161F] border-[#223344] text-[#8EA0B0] hover:text-white hover:bg-[#152330]'
                      }`}
                    >
                      {chroma.swatch ? (
                        <div className="relative w-8 h-8 shrink-0 border border-[#2C3E50]">
                          <Image
                            src={chroma.swatch}
                            alt={chroma.displayName}
                            fill
                            sizes="32px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[#253648] flex items-center justify-center font-mono text-xs">
                          {idx + 1}
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-xs font-mono font-bold text-white">
                          {idx === 0 ? 'Base Edition' : `Variant ${idx}`}
                        </div>
                        <div className="text-[10px] font-mono text-[#6A7885] truncate max-w-[120px]">
                          {chroma.displayName.split('\n')[1] || chroma.displayName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Details, Price, Upgrades & Actions */}
        <div className="flex flex-col gap-6">
          {/* Title & Metadata Card */}
          <div className="bg-[#121B24] border border-[#213243] p-6 valo-clip-top-right flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span
                className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider valo-clip-top-right"
                style={{ backgroundColor: tier.color, color: '#000000' }}
              >
                {tier.name} EDITION
              </span>

              {owned && (
                <span className="px-2 py-0.5 bg-[#00D692]/20 border border-[#00D692] text-[#00D692] text-xs font-mono font-bold">
                  IN OWNED INVENTORY
                </span>
              )}
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#6E7E8F]">
                {skin.collectionName} {'//'} {skin.weaponType}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide mt-1">
                {currentChroma?.displayName || skin.displayName}
              </h1>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#1C2C3D]">
              <VpIcon size={24} />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-[#6E7E8F] uppercase">STANDARD PRICE</span>
                <span className="font-mono font-black text-2xl text-white">
                  {(skin.defaultPrice ?? 0).toLocaleString()} VP
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(skin.uuid)}
                  className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    isWish
                      ? 'bg-[#35191E] border-[#FF4655] text-[#FF4655]'
                      : 'bg-[#152330] border-[#283C50] text-white hover:bg-[#1E3347]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-[#FF4655]' : ''}`} />
                  <span>{isWish ? 'On Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={() => toggleFavorite(skin.uuid)}
                  className={`p-2.5 border transition-colors ${
                    isFav
                      ? 'bg-[#2A2B1E] border-[#FAD663] text-[#FAD663]'
                      : 'bg-[#152330] border-[#283C50] text-[#6A7885] hover:text-white'
                  }`}
                  title="Toggle Favorite"
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-[#FAD663]' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => toggleOwned(skin.uuid)}
                className={`w-full py-2.5 font-mono text-xs uppercase tracking-wider font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  owned
                    ? 'bg-[#102B25] border-[#00F5D4] text-[#00F5D4]'
                    : 'bg-[#152330] border-[#283C50] text-[#8EA0B0] hover:text-white hover:bg-[#1E3347]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{owned ? 'Marked as Owned' : 'Mark as Owned'}</span>
              </button>
            </div>
          </div>

          {/* Level Upgrades Card */}
          {levels.length > 0 && (
            <div className="bg-[#121B24] border border-[#213243] p-5 valo-clip-bottom-right flex flex-col gap-3">
              <span className="text-[11px] font-mono text-[#6E7E8F] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FAD663]" />
                LEVEL PROGRESSION ({levels.length} LEVELS)
              </span>

              <div className="flex flex-col gap-2">
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
                      onClick={() => {
                        playSound.click(preferences.soundEffects);
                        setSelectedLevelIndex(idx);
                      }}
                      className={`flex items-center justify-between p-2.5 border cursor-pointer text-xs font-mono transition-colors ${
                        isSelected
                          ? 'bg-[#1C2C3C] border-[#FAD663] text-white'
                          : 'bg-[#0E161F] border-[#203141] text-[#8EA0B0] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 bg-[#0B0F15] border border-[#2B3E52] flex items-center justify-center text-[10px] text-[#FAD663] font-bold">
                          L{idx + 1}
                        </span>
                        <span>{levelDescription}</span>
                      </div>
                      {lvl.streamedVideo && (
                        <span title="Video available">
                          <Film className="w-3 h-3 text-[#00F5D4]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security & Data Notice */}
          <div className="p-3.5 bg-[#0E151E] border border-[#1E2A36] text-[11px] font-mono text-[#6A7885] space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span>COMMUNITY CATALOG ATTRIBUTION</span>
            </div>
            <p>
              Metadata & assets sourced from Valorant-API.com. All preferences and owned markers are
              saved in your local browser only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkinDetailPage() {
  return (
    <StoreContextProvider>
      <div className="min-h-screen flex flex-col bg-[#0B0E14] text-[#ECE8E1] tactical-grid-bg">
        <StatusBanner />
        <Navbar />
        <main className="flex-1">
          <SkinDetailPageContent />
        </main>
        <SecurityModal />
      </div>
    </StoreContextProvider>
  );
}
