'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { VpIcon } from './VpIcon';
import {
  Sparkles,
  Layers,
  Heart,
  ShoppingBag,
  Volume2,
  VolumeX,
  Tv,
  Shield,
  Edit2,
  Check,
} from 'lucide-react';

interface NavItem {
  id: 'store' | 'bundle' | 'catalog' | 'wishlist';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

export const Navbar: React.FC = () => {
  const {
    preferences,
    setActiveTab,
    setVpBalance,
    setSoundEffects,
    setScanlines,
    setSecurityModalOpen,
  } = useStore();

  const [isEditingVp, setIsEditingVp] = useState(false);
  const [vpInputValue, setVpInputValue] = useState(preferences.vpBalance.toString());

  const handleVpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(vpInputValue, 10);
    if (!isNaN(val)) {
      setVpBalance(val);
    }
    setIsEditingVp(false);
  };

  const navItems: NavItem[] = [
    { id: 'store', label: '// 01 DAILY STORE', icon: ShoppingBag, badge: null },
    { id: 'bundle', label: '// 02 BUNDLE', icon: Sparkles, badge: null },
    { id: 'catalog', label: '// 03 CATALOGUE', icon: Layers, badge: null },
    {
      id: 'wishlist',
      label: '// 04 WISHLIST',
      icon: Heart,
      badge: preferences.wishlist.length > 0 ? preferences.wishlist.length : null,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0B0E14]/95 border-b border-[#1E2D3B] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('store')}>
            <div className="w-8 h-8 bg-[#FF4655] flex items-center justify-center font-black text-white text-base tracking-tighter valo-clip-top-right">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-widest text-sm text-white font-mono flex items-center gap-1.5">
                VALORANT <span className="text-[#FF4655] font-light">STORE</span>
              </span>
              <span className="text-[9px] font-mono tracking-wider text-[#6A7885]">
                LOCAL-ONLY {'//'} ZERO-CREDENTIAL
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = preferences.activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-[#152330] border-b-2 border-[#FF4655]'
                    : 'text-[#8EA0B0] hover:text-white hover:bg-[#111A24]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF4655]' : 'text-[#6A7885]'}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 bg-[#FF4655] text-white text-[10px] rounded-full font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: VP Balance & Controls */}
        <div className="flex items-center gap-3">
          {/* VP Balance Widget */}
          <div className="relative">
            {isEditingVp ? (
              <form onSubmit={handleVpSubmit} className="flex items-center gap-1 bg-[#152330] px-2 py-1 border border-[#FF4655]">
                <VpIcon size={16} />
                <input
                  type="number"
                  value={vpInputValue}
                  onChange={(e) => setVpInputValue(e.target.value)}
                  className="w-18 bg-black text-white text-xs font-mono px-1 py-0.5 border border-[#3A4B5C] outline-none"
                  autoFocus
                  min="0"
                />
                <button type="submit" className="text-[#00F5D4] hover:text-white p-0.5">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div
                onClick={() => {
                  setVpInputValue(preferences.vpBalance.toString());
                  setIsEditingVp(true);
                }}
                className="group flex items-center gap-2 bg-[#121E2A] hover:bg-[#182736] border border-[#233547] px-3 py-1.5 cursor-pointer transition-all valo-clip-top-right"
                title="Click to edit your simulated VP balance"
              >
                <VpIcon size={18} />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-[#6A7885] leading-none">MY VP</span>
                  <span className="text-xs font-mono font-bold text-white group-hover:text-[#FF4655] transition-colors">
                    {preferences.vpBalance.toLocaleString()}
                  </span>
                </div>
                <Edit2 className="w-2.5 h-2.5 text-[#6A7885] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </div>
            )}
          </div>

          {/* Quick preference buttons */}
          <div className="flex items-center border border-[#1E2D3B] bg-[#0E151E]">
            <button
              onClick={() => setSoundEffects(!preferences.soundEffects)}
              className={`p-2 transition-colors ${
                preferences.soundEffects ? 'text-[#00F5D4] hover:bg-[#15222E]' : 'text-[#506070] hover:bg-[#15222E]'
              }`}
              title={preferences.soundEffects ? 'Tactical Audio: Enabled' : 'Tactical Audio: Muted'}
            >
              {preferences.soundEffects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setScanlines(!preferences.scanlines)}
              className={`p-2 border-l border-[#1E2D3B] transition-colors ${
                preferences.scanlines ? 'text-[#FF4655] hover:bg-[#15222E]' : 'text-[#506070] hover:bg-[#15222E]'
              }`}
              title={preferences.scanlines ? 'CRT Scanlines: ON' : 'CRT Scanlines: OFF'}
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSecurityModalOpen(true)}
              className="p-2 border-l border-[#1E2D3B] text-[#8EA0B0] hover:text-white hover:bg-[#15222E] transition-colors"
              title="Security Architecture & Info"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-[#1E2D3B] bg-[#0E151E] px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = preferences.activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 shrink-0 py-2 px-3 font-mono text-[11px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'text-white bg-[#152330] border-b-2 border-[#FF4655]'
                  : 'text-[#8EA0B0]'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-[#FF4655]' : 'text-[#6A7885]'}`} />
              <span>{item.id.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
