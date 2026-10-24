import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VALORANT Store Viewer | Private & Local-Only Cosmetic Dashboard',
  description:
    'Inspect VALORANT store rotations, calculate VP prices, track wishlist cosmetics, and preview weapon chromas locally without sharing credentials.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark bg-[#0B0E14] text-[#ECE8E1] h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0E14] text-[#ECE8E1]">{children}</body>
    </html>
  );
}
