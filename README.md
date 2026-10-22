# Private VALORANT Store Viewer

A polished, local-only VALORANT cosmetic store dashboard built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

Designed for players who want to inspect daily store rotations, flip mystery Night Market cards, preview weapon skin chromas and finisher VFX, search by weapon/collection/rarity/price, and track wishlist affordability without ever exposing their Riot Games credentials or session cookies to third-party web services.

---

## Pages & Feature Highlights

### 1. Dashboard (Daily Store & Night Market)
- **Daily Rotation**: 4 offer slots with high-resolution weapon art, official rarity tiers, and authentic VP prices.
- **Refresh Countdown**: Real-time timer counting down to the official daily store refresh (**00:00:00 UTC**).
- **Interactive Night Market**: 6 mystery cards with randomized secret discounts (between -18% and -48%). Click any card to flip and reveal the weapon, discount badge, and slashed VP price.
- **Affordability Indicators**: Real-time feedback calculating whether your current simulated VP balance can cover any or all daily store offers.
- **Rotation Simulator**: "Simulate Next Day" button to test daily rotation changes with deterministic consistency.

### 2. Searchable Skin Catalogue
- **Live Search**: Instant keyword search matching skin names, weapon types, or collections.
- **Collection Filter**: Filter by skinline (*Kuronami, Reaver, Prime, Oni, Glitchpop, Araxys, Ion, Sovereign, ChronoVoid, etc.*).
- **Weapon Category Pills**: Filter by weapon class (*Rifles, Sidearms, Melee, Snipers, SMGs, Shotguns, Heavy*).
- **Rarity Tier Filter**: Filter by official VALORANT tiers (*Select, Deluxe, Premium, Exclusive, Ultra Edition*).
- **Max Price Slider**: Real-time price ceiling filter.
- **Inventory Toggles**: Quick filter by Favourites, Wishlist, or Owned items.

### 3. Personal Wishlist & Owned Inventory
- **Dual Tabs**: Switch between desired Wishlist items and tracked Owned Inventory items.
- **Financial Shortfall Calculator**: Compares total wishlist cost against your wallet VP balance to calculate needed VP.
- **Store Match Alert**: Highlights whenever a wishlisted cosmetic appears in today's daily store rotation.
- **Data Privacy**: All items saved exclusively to your browser's `localStorage`.
- **Reset Preferences**: "Reset Local Data" button with confirmation modal to clear all saved state anytime.

### 4. Skin Detail Page (`/skin/[id]`) & Quick Inspect Modal
- **High-Res Weapon Art**: Rendered with glowing rarity backdrops and 3D hover interactions.
- **Chroma Variant Swatches**: Interactive swatch picker to swap weapon colors (e.g. Variant 1 Purple, Variant 2 White, Variant 3 Black).
- **Level Upgrade Progression**: Level 1 (Base), Level 2 (VFX), Level 3 (Animations), Level 4 (Finisher).
- **In-Game Video Player**: Streams authentic finisher and animation video previews directly from official CDN media.
- **Deep Linking**: Accessible both as a fast modal inspector and as a dedicated page route at `/skin/[id]`.

---

## Security Boundaries & Account Safety

This application is engineered with non-negotiable security boundaries:

| Security Rule | Implementation |
| --- | --- |
| **No Password Collection** | The app **never** asks for, inputs, or processes Riot passwords, usernames, or MFA codes. |
| **No Cookie Scraping** | Does not extract browser cookies, session tokens (`ssid`), or client tokens. |
| **No Private API Calls** | Does not invoke undocumented Riot client endpoints or automate purchases. |
| **Zero Telemetry** | No analytics, trackers, or remote credential brokers. |
| **Localhost-Only Binding** | Development and start scripts are strictly bound to `127.0.0.1` (`-H 127.0.0.1`). |
| **Local-Only Preferences** | Favourites, wishlist items, owned statuses, and wallet balance live solely in `localStorage`. |

---

## Why Official Live Store Retrieval is Disabled

### Riot Games API Limitations
Riot Games' official developer portal (`developer.riotgames.com`) provides public API endpoints for **Esports data**, **competitive leaderboards**, and **game content metadata**.

> [!IMPORTANT]
> **Riot Games does not provide public player storefront endpoints or an authorized OAuth2 scope for viewing personal daily store rotations.**

### The Danger of Third-Party Tools
Third-party mobile apps, Discord bots, and unofficial web services that display your personal store operate by asking you for your Riot username and password, or requiring you to paste your private session cookies (`ssid`, `sub`). These tools:
1. **Violate Riot Games Terms of Service.**
2. Expose your Riot account to credential theft, account selling, and unauthorized purchases.
3. Can result in permanent account bans.

### Our Solution: Safe Modular Provider
Instead of risking your account, this viewer uses a modular `StoreProvider` interface:
- **`DemoStoreProvider` (Active)**: Generates deterministic, authentic daily store rotations seeded by date, using real weapon skins, official rarity tiers, and authentic VP prices.
- **`LiveStoreProvider` (Disabled)**: Safely reports an `unavailable` state with complete security context. If Riot Games ever provides an authorized OAuth2 storefront scope in the future, it can be integrated with zero UI rewrite.

---

## Architecture Overview

```
valo-store-viewer/
├── src/
│   ├── app/
│   │   ├── globals.css              # Tactical theme tokens, polygon clips, scanlines
│   │   ├── layout.tsx               # Root layout with metadata
│   │   ├── page.tsx                 # App entry point (Dashboard)
│   │   └── skin/
│   │       └── [id]/page.tsx        # Dedicated Skin Detail page
│   ├── components/
│   │   ├── BundleView.tsx           # Featured collection showcase
│   │   ├── CatalogueView.tsx        # Searchable cosmetic catalogue with collection/price filters
│   │   ├── CountdownTimer.tsx       # Live 00:00 UTC countdown timer
│   │   ├── DailyStoreView.tsx       # 4-card daily store grid & Night Market container
│   │   ├── Navbar.tsx               # Header tabs, VP wallet editor, audio toggles
│   │   ├── NightMarketSection.tsx   # 6-card flip reveal Night Market section
│   │   ├── OfferCard.tsx            # Weapon card with tier glow & inspect trigger
│   │   ├── SecurityModal.tsx        # Security & privacy policy modal
│   │   ├── SkinInspectModal.tsx     # Chroma variant & level VFX inspector
│   │   ├── StatusBanner.tsx         # Demo vs. Live mode status banner
│   │   ├── StoreViewerApp.tsx       # Main tabbed view container
│   │   ├── VpIcon.tsx               # Scalable vector VP & Radianite icons
│   │   └── WishlistView.tsx         # Wishlist & owned inventory manager with reset action
│   ├── context/
│   │   └── StoreContext.tsx         # React context, preferences persistence, audio
│   ├── data/
│   │   ├── curatedSkins.ts          # Curated offline-ready skin dataset
│   │   └── tierConstants.ts         # Rarity tiers, VP pricing rules, category & collection maps
│   ├── providers/
│   │   ├── DemoStoreProvider.ts     # Deterministic date-seeded store & Night Market rotation
│   │   ├── LiveStoreProvider.ts     # Disabled provider documenting API limits
│   │   └── index.ts                 # Provider registry
│   ├── services/
│   │   └── valorantApi.ts           # Valorant-API.com client with caching
│   ├── types/
│   │   └── store.ts                 # StoreProvider, Skin, Offer TypeScript definitions
│   └── utils/
│       ├── audio.ts                 # Web Audio API sound synthesis
│       └── seedRandom.ts            # Deterministic PRNG & UTC midnight calculations
└── README.md                        # Setup, architecture, security, and limitations
```

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The server will start bound strictly to `127.0.0.1:3000`. Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### 3. Production Build
Verify TypeScript compilation and static page generation:
```bash
npm run build
```

### 4. Run Linting
Check ESLint standards:
```bash
npm run lint
```

---

## Attribution & Legal

- **Data & Images**: Weapon skin images, sound effects, chromas, and metadata are sourced from [Valorant-API.com](https://valorant-api.com), an independent community project.
- **Legal Disclaimer**: VALORANT Store Viewer is an independent, non-commercial educational project created under Riot Games' "[Legal Jibber Jabber](https://www.riotgames.com/en/legal)" policy. It is not endorsed by or affiliated with Riot Games, Inc. VALORANT and all associated assets are trademarks or registered trademarks of Riot Games, Inc.
# valo-store
