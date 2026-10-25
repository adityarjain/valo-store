'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { StatusBanner } from './StatusBanner';
import { Navbar } from './Navbar';
import { DailyStoreView } from './DailyStoreView';
import { BundleView } from './BundleView';
import { CatalogueView } from './CatalogueView';
import { WishlistView } from './WishlistView';
import { SkinInspectModal } from './SkinInspectModal';
import { SecurityModal } from './SecurityModal';
import { ShieldCheck } from 'lucide-react';

export const StoreViewerApp: React.FC = () => {
  const { preferences, setSecurityModalOpen } = useStore();

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#0B0E14] text-[#ECE8E1] tactical-grid-bg ${
        preferences.scanlines ? 'scanlines-overlay' : ''
      }`}
    >
      {/* Top Security & Status Banner */}
      <StatusBanner />

      {/* Main Tactical Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {preferences.activeTab === 'store' && <DailyStoreView />}
        {preferences.activeTab === 'bundle' && <BundleView />}
        {preferences.activeTab === 'catalog' && <CatalogueView />}
        {preferences.activeTab === 'wishlist' && <WishlistView />}
      </main>

      {/* Global Interactive Modals */}
      <SkinInspectModal />
      <SecurityModal />

      {/* Tactical Footer */}
      <footer className="border-t border-[#162330] bg-[#0A0D12] py-8 text-xs font-mono text-[#5E6F80]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF4655]" />
              <span className="font-bold text-white tracking-widest uppercase">
                VALORANT COSMETIC STORE VIEWER {'//'} LOCALHOST
              </span>
            </div>
            <p className="text-[11px] text-[#4A5968] text-center md:text-left">
              Running locally on your MacBook. Zero telemetry, zero passwords stored, zero cookies transmitted.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="text-[#8EA0B0] hover:text-[#00F5D4] transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
              Security Architecture
            </button>
            <span>•</span>
            <span className="text-[#657788]">
              Powered by{' '}
              <a
                href="https://valorant-api.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#8EA0B0] hover:underline"
              >
                Valorant-API.com
              </a>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 pt-4 border-t border-[#121B24] text-[10px] text-[#445363] text-center">
          VALORANT Store Viewer isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or
          opinions of Riot Games or anyone officially involved in producing or managing Riot Games
          properties. Riot Games, and all associated properties are trademarks or registered
          trademarks of Riot Games, Inc.
        </div>
      </footer>
    </div>
  );
};
