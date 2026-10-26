'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, ShieldAlert, ArrowRightLeft, Lock } from 'lucide-react';

export const StatusBanner: React.FC = () => {
  const { providerId, setProviderId, setSecurityModalOpen, status } = useStore();

  const isDemo = providerId === 'demo';
  const liveOk = !isDemo && status?.state === 'success';

  return (
    <div
      className={`border-b transition-colors ${
        isDemo
          ? 'bg-[#0E1A24]/90 border-[#1F3142] text-[#8EA0B0]'
          : 'bg-[#2B1115]/90 border-[#6B1F27] text-[#FFA8B0]'
      } px-4 py-2 text-xs backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {isDemo ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#172E40] text-[#00F5D4] font-mono font-bold tracking-wider text-[11px] valo-clip-top-right border-l-2 border-[#00F5D4]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
              DEMO / SIMULATION
            </span>
          ) : liveOk ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#3A2F12] text-[#FAD663] font-mono font-bold tracking-wider text-[11px] valo-clip-top-right border-l-2 border-[#FAD663]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FAD663]" />
              LIVE / UNOFFICIAL
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#4A171D] text-[#FF4655] font-mono font-bold tracking-wider text-[11px] valo-clip-top-right border-l-2 border-[#FF4655]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF4655]" />
              LIVE UNAVAILABLE
            </span>
          )}

          <p className="text-[12px] leading-tight">
            {isDemo ? (
              <span>
                <strong className="text-white">Deterministic Daily Rotation.</strong> Real
                cosmetics with estimated prices, loaded without requesting or storing Riot credentials.
              </span>
            ) : (
              <span>
                <strong className="text-white">{liveOk ? 'Your real store.' : 'Live unavailable.'}</strong>{' '}
                {status?.message} No password or cookies are used; Riot does not support this method.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setProviderId(isDemo ? 'live' : 'demo')}
            className="flex items-center gap-1 text-[11px] font-mono uppercase text-[#ECE8E1] hover:text-[#00F5D4] px-2 py-1 bg-[#14212D] hover:bg-[#1C2F40] border border-[#273B4D] transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3" />
            Switch to {isDemo ? 'Live Provider' : 'Demo Mode'}
          </button>

          <button
            onClick={() => setSecurityModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-mono uppercase text-[#8EA0B0] hover:text-white px-2 py-1 hover:bg-[#1A2633] transition-colors"
          >
            <Lock className="w-3 h-3 text-[#FF4655]" />
            Security & Docs
          </button>
        </div>
      </div>
    </div>
  );
};
