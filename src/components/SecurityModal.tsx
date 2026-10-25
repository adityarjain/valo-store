'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import {
  ShieldCheck,
  Lock,
  X,
  AlertTriangle,
  Code2,
  HardDrive,
} from 'lucide-react';

export const SecurityModal: React.FC = () => {
  const { securityModalOpen, setSecurityModalOpen } = useStore();

  if (!securityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#0F1722] border border-[#243547] valo-clip-bottom-right shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#0B1017] border-b border-[#1A2633] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#FF4655]/15 border border-[#FF4655] text-[#FF4655]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white tracking-wide">
                SECURITY ARCHITECTURE & PRIVACY POLICY
              </h2>
              <span className="text-[10px] font-mono text-[#6E7E8F]">
                LOCAL-ONLY {'//'} ZERO-CREDENTIAL MANDATE
              </span>
            </div>
          </div>

          <button
            onClick={() => setSecurityModalOpen(false)}
            className="p-1.5 text-[#8EA0B0] hover:text-white hover:bg-[#1A2838] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#A0B0C0] font-sans leading-relaxed">
          {/* Card 1: Zero-Credential Guarantee */}
          <div className="bg-[#121B24] border border-[#1E2E3E] p-4 valo-clip-top-right">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-sm mb-2">
              <ShieldCheck className="w-4 h-4 text-[#00F5D4]" />
              <span>1. Zero Credential Ingestion or Persistence</span>
            </div>
            <p>
              This application is built with a non-negotiable security boundary: <strong>it will never ask you to enter your Riot password, username, or multi-factor authentication (MFA) codes</strong>. It does not perform memory scraping, browser-cookie extraction, or undocumented network interception.
            </p>
          </div>

          {/* Card 2: Riot API Scope Limitations */}
          <div className="bg-[#121B24] border border-[#1E2E3E] p-4 valo-clip-top-right">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-sm mb-2">
              <AlertTriangle className="w-4 h-4 text-[#FAD663]" />
              <span>2. Why Official Riot Live Store Tracking Does Not Exist</span>
            </div>
            <p>
              Riot Games&apos; official public Developer Portal API provides endpoints for Esports metadata, competitive leaderboards, and general game content. <strong>Riot does not provide public player storefront endpoints or an authorized OAuth2 scope for viewing player daily store rotations</strong>.
            </p>
            <p className="mt-2 text-[#7E8E9E]">
              Unofficial tools and third-party Discord bots that claim to fetch your live store require extracting your secret session cookies (<code className="text-[#FF4655]">ssid</code>, <code className="text-[#FF4655]">sub</code>) or storing your credentials on external servers. This violates Riot Games Terms of Service and creates massive account hijack risks.
            </p>
          </div>

          {/* Card 3: Modular Architecture */}
          <div className="bg-[#121B24] border border-[#1E2E3E] p-4 valo-clip-top-right">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-sm mb-2">
              <Code2 className="w-4 h-4 text-[#00F5D4]" />
              <span>3. Modular StoreProvider Architecture</span>
            </div>
            <p>
              All storefront components render against a strictly typed <code className="text-[#00F5D4]">StoreProvider</code> TypeScript interface. The current active provider is <code className="text-white">DemoStoreProvider</code>, which generates authentic deterministic rotations. A placeholder <code className="text-white">LiveStoreProvider</code> is included in the codebase, safely reporting an <code className="text-[#FF8591]">unavailable</code> status until an official authorized Riot OAuth2 integration is possible.
            </p>
          </div>

          {/* Card 4: Localhost Privacy */}
          <div className="bg-[#121B24] border border-[#1E2E3E] p-4 valo-clip-top-right">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-sm mb-2">
              <HardDrive className="w-4 h-4 text-[#5A9FE2]" />
              <span>4. Localhost Sandbox & Zero Telemetry</span>
            </div>
            <p>
              This app runs exclusively on your local machine at <code className="text-white">localhost:3000</code>. It contains <strong>zero third-party tracking scripts, zero telemetry, and zero external credential brokers</strong>. Your favorites and wishlist are stored solely in your local browser&apos;s <code className="text-white">localStorage</code>.
            </p>
          </div>

          {/* Card 5: Public API Attribution */}
          <div className="p-3 bg-[#0B0F15] border-l-2 border-[#506070] text-[11px] text-[#708090]">
            <strong>Attribution Notice:</strong> VALORANT Store Viewer is an independent local tool created under Riot Games&apos; &quot;Legal Jibber Jabber&quot; policy using cosmetic metadata from the community-driven Valorant-API. It is not endorsed by or affiliated with Riot Games.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0B1017] border-t border-[#1A2633] flex justify-end">
          <button
            onClick={() => setSecurityModalOpen(false)}
            className="px-5 py-2 bg-[#FF4655] hover:bg-[#FF5E6D] text-black font-mono font-bold text-xs uppercase tracking-widest valo-clip-top-right transition-colors"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
