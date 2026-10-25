'use client';

import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt?: string;
  onRefresh?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onRefresh,
  className = '',
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!expiresAt) {
      const now = new Date();
      const nextUtc = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
      );
      return Math.max(0, Math.floor((nextUtc.getTime() - now.getTime()) / 1000));
    }
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    const targetTime = expiresAt
      ? new Date(expiresAt).getTime()
      : new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate() + 1,
            0,
            0,
            0,
            0
          )
        ).getTime();

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Daily cycle is 86400 seconds
  const dayProgressPercent = Math.min(100, Math.max(0, ((86400 - secondsLeft) / 86400) * 100));

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#131D28] border border-[#233242] px-4 py-2.5 valo-clip-top-right ${className}`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#FF4655] animate-pulse" />
        <span className="text-xs uppercase font-mono tracking-widest text-[#8B97A0]">
          DAILY REFRESH IN
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 font-mono font-bold text-lg text-white bg-[#0B0E14] px-2.5 py-0.5 border border-[#2B3B4B]">
          <span className="text-[#ECE8E1]">{pad(hours)}</span>
          <span className="text-[#FF4655] animate-pulse">:</span>
          <span className="text-[#ECE8E1]">{pad(minutes)}</span>
          <span className="text-[#FF4655] animate-pulse">:</span>
          <span className="text-[#FF4655]">{pad(seconds)}</span>
        </div>

        <div className="hidden md:flex flex-col w-24">
          <div className="h-1 bg-[#1A2633] w-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF4655] to-[#FAD663] transition-all duration-1000"
              style={{ width: `${dayProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#6A7885] mt-0.5">00:00 UTC RESET</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh timer check"
            className="p-1 text-[#8B97A0] hover:text-[#ECE8E1] hover:bg-[#1E2B38] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
