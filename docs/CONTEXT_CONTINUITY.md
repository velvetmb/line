# Lines — Context Continuity Guide

**Purpose:** This document provides everything needed to resume development of the Lines game in a new chat session. It captures the current state, architecture decisions, known issues, and the user's preferences so that a new assistant can pick up seamlessly.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project name** | `lines98` (directory), displayed as "Lines" in the UI |
| **Project path** | `/home/ubuntu/lines98` |
| **Project type** | Static frontend (React 19 + Vite 7 + Tailwind CSS 4) |
| **Package manager** | pnpm (v10.4.1) |
| **Dev server** | `pnpm dev` → `http://localhost:3000` |
| **Build** | `pnpm build` → output in `dist/public` |
| **Latest checkpoint** | `04681ee6` |

---

## 2. What the Game Is

Lines is a web recreation of the classic Lines 98 puzzle game. The player moves colored marbles on a 9x9 grid, aligning 5+ same-colored marbles in any direction (horizontal, vertical, diagonal) to clear them and score points. Three new marbles spawn after each non-clearing move. The game ends when the board fills completely.

**Key differentiators from the original:**
- Small translucent preview marbles on the board show where the next 3 marbles will appear
- One-time undo button (restores the board to before the last move)
- 5 visual board themes (Walnut, Oak, Cream, Grass, Sky)
- Synthesized sound effects via Web Audio API with mute toggle
- Balloon-pop clearing animation with confetti shards
- Fully responsive (mobile, tablet, desktop)

---

## 3. Architecture Overview

### 3.1 Provider Stack (App.tsx)

```
ErrorBoundary
  └─ ThemeProvider (defaultTheme="light")
       └─ BoardThemeProvider
            └─ TooltipProvider
                 └─ Toaster + Router
```

The `ThemeProvider` controls the shadcn/ui light/dark mode (set to "light" permanently). The `BoardThemeProvider` manages the 5 game-specific visual themes.

### 3.2 Core Files and Their Responsibilities

| File | Role |
|---|---|
| `client/src/hooks/useGameEngine.ts` | **All game logic.** Board state, BFS pathfinding, line detection, scoring, spawning, undo, game over detection. This is the single source of truth for game rules. |
| `client/src/hooks/useSoundEngine.ts` | Web Audio API sound synthesis. Three sounds: select, drop, lineClear. Mute toggle with localStorage persistence. |
| `client/src/contexts/BoardThemeContext.tsx` | Defines 5 themes as a `Record<BoardThemeName, BoardTheme>` with ~30 CSS properties each. Provides `useBoardTheme()` hook. Theme persists to localStorage. |
| `client/src/pages/Home.tsx` | Main page. Wires game engine + sound engine + theme. Handles sound trigger logic via `useEffect` comparing previous/current state. Contains both mobile and desktop layout branches. |
| `client/src/components/Marble.tsx` | Renders a single marble using CSS radial gradients. Handles 5 visual states: normal, selected (bounce), preview (pulse), new (spring entrance), clearing (balloon-pop burst). |
| `client/src/components/GameBoard.tsx` | Renders the 9x9 grid. Memoized. Converts clearing/new arrays to Sets for O(1) lookups. Each cell is a `CellButton` subcomponent. |
| `client/src/components/ScorePanel.tsx` | Displays current score and high score. Animated score counter via Framer Motion. |
| `client/src/components/GameControls.tsx` | Undo Move and New Game buttons. Undo disables when `canUndo` is false. |
| `client/src/components/ThemeSelector.tsx` | Row of 5 colored circle buttons for theme switching. |
| `client/src/components/MuteButton.tsx` | Speaker icon toggle for sound mute/unmute. |
| `client/src/components/GameOverDialog.tsx` | Animated modal overlay on game over. Shows score, best, optional "New High Score!" badge. |
| `client/src/components/HowToPlay.tsx` | Collapsible accordion with game rules text. |

### 3.3 External Assets

Only two external images are used, both hosted on CDN:

| Asset | CDN URL | Used by |
|---|---|---|
| Wood table background | `https://d2xsxph8kpxj0f.cloudfront.net/310519663320319140/n6MWLjWg8pGpnuJWjMRfmd/wood-table-bg-5uxoKjqushNKZXf2tBVAtW.webp` | Walnut theme (page bg + board frame) |
| Parchment texture | `https://d2xsxph8kpxj0f.cloudfront.net/310519663320319140/n6MWLjWg8pGpnuJWjMRfmd/parchment-texture-F5QXeNM2WWkUy3GwBto9iz.webp` | Walnut theme (panel backgrounds) |

All other themes use CSS gradients only.

### 3.4 localStorage Keys

| Key | Value | Purpose |
|---|---|---|
| `lines_highscore` | Integer string | Persisted high score |
| `lines_theme` | `walnut` / `oak` / `cream` / `grass` / `sky` | Selected board theme |
| `lines_muted` | `true` / `false` | Sound mute state |

Legacy key `lines98_highscore` is also read (but not written) for backward compatibility.

---

## 4. User Preferences and Design Decisions

These are preferences the user explicitly stated during development. Respect them in future iterations.

| Decision | Rationale |
|---|---|
| **Sound effects are minimal** — only select, drop, and line clear. No sounds for marble movement, spawning, undo, or game over. | User found the original full sound set "too much" and requested simplification. |
| **Line clear sound is a Nintendo Switch Joy-Con-style "click"** | User specifically requested this iconic, satisfying sound. |
| **Clearing a line does NOT count as a "move"** — no new marbles spawn after a clear. | User explicitly stated: "Don't assume a win is a move." Preview positions persist until the next non-clearing move. |
| **No "Next 3" indicator in the scoreboard** — previews are shown only as small marbles on the board. | User requested removal of the redundant text-based indicator. |
| **Game renamed from "Lines 98" to "Lines"** | User preference for a cleaner name. |
| **Grass and Sky themes should be light/pastel** — not dark. | User found the original dark green/blue themes "too dark." Current versions use bright pastel gradients. |

---

## 5. Game Engine Internals — Quick Reference

### 5.1 Constants

| Constant | Value |
|---|---|
| `BOARD_SIZE` | 9 |
| `COLORS` | `['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'coral']` |
| `MIN_LINE` | 5 |
| `BALLS_PER_TURN` | 3 |
| `INITIAL_BALLS` | 5 |
| `CLEAR_ANIMATION_MS` | 550 |

### 5.2 State Shape (`GameState`)

```typescript
interface GameState {
  board: Cell[][];          // 9x9 grid, each cell has { marble: color|null, preview: color|null }
  score: number;
  highScore: number;
  selectedPos: Position | null;  // Currently selected marble position
  nextColors: MarbleColor[];     // Colors for next 3 spawns
  nextPositions: Position[];     // Positions for next 3 spawns
  gameOver: boolean;
  canUndo: boolean;
  movePath: Position[];          // BFS path of last move (for potential animation)
  clearingCells: Position[];     // Cells currently being cleared (triggers animation)
  newMarbles: Position[];        // Cells where new marbles just spawned (triggers animation)
}
```

### 5.3 Turn Flow (Pseudocode)

```
Player clicks cell(row, col):
  IF cell has marble → select it (set selectedPos)
  IF cell is empty AND a marble is selected:
    Run BFS from selectedPos to (row, col)
    IF no path → do nothing
    IF path exists:
      Save undo state
      Move marble to destination
      Check for lines at destination
      IF lines found:
        Remove matched marbles, add score
        Keep existing preview positions (DO NOT spawn)
        Trigger clearing animation
      ELSE:
        Spawn 3 marbles at preview positions
        Check for lines formed by new marbles (clear if found)
        Generate new preview positions
        Check for game over (no empty cells)
```

---

## 6. Iteration History (Summary)

| Version | Changes |
|---|---|
| **v1** (checkpoint `43485e35`) | Initial implementation — full game logic, glass marble rendering, wood theme, BFS pathfinding, line detection, preview marbles, undo, score tracking. |
| **v2** (checkpoint `5ead5d5a`) | Mobile responsive layout, smoother clearing animation (sparkle burst), removed Next indicator from scoreboard, renamed to "Lines", performance optimizations (memoization, Set lookups). |
| **v3** (checkpoint `0ec348b8`) | Added sound effects (Web Audio API), balloon-pop clearing animation, 5 board themes with theme selector, mute button. |
| **v4** (checkpoint `04681ee6`) | Simplified sounds (removed move/spawn/undo/gameOver), fixed spawning bug (clears don't regenerate previews), lightened Grass and Sky themes. |

---

## 7. Pending Improvements

These are features discussed but not yet implemented. They are ordered by estimated impact:

| Feature | Complexity | Notes |
|---|---|---|
| **Path animation** | Medium | Animate marble sliding cell-by-cell along BFS path. Path data already in `gameState.movePath`. Needs ~80ms step-through loop. |
| **Score combo text** | Low | Floating "+10" label near cleared lines. Use Framer Motion `AnimatePresence`. |
| **Statistics tracker** | Medium | Local top-10 scores, games played, avg score. All in localStorage. |
| **Keyboard navigation** | Medium | Arrow keys for cell selection, Enter to confirm. Needs focus management. |
| **Difficulty modes** | Medium | Fewer colors (easy), more balls per turn (hard), grid size options. |
| **Richer sounds** | Low | Replace Web Audio synthesis with base64-encoded audio samples for higher fidelity. |
| **Drag-and-drop** | High | Touch gesture for marble movement on mobile. Needs pointer event handling. |

---

## 8. How to Resume Development

### 8.1 Setup

```bash
cd /home/ubuntu/lines98
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:3000`.

### 8.2 Key Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Production build to `dist/public` |
| `pnpm check` | TypeScript type checking |
| `pnpm format` | Prettier formatting |

### 8.3 Making Changes

**To modify game rules or logic:** Edit `client/src/hooks/useGameEngine.ts`. All game constants are at the top of the file.

**To modify visuals/animations:** Edit `client/src/components/Marble.tsx` for marble rendering, `client/src/components/GameBoard.tsx` for the grid.

**To add/modify themes:** Edit `client/src/contexts/BoardThemeContext.tsx`. Each theme is a flat object with ~30 CSS property strings. Add a new entry to the `THEMES` record and update `BoardThemeName` union type. Also add a swatch entry in `client/src/components/ThemeSelector.tsx`.

**To modify sounds:** Edit `client/src/hooks/useSoundEngine.ts`. Each sound is a function that creates Web Audio oscillators/buffers.

**To modify layout:** Edit `client/src/pages/Home.tsx`. The file contains separate `lg:` (desktop) and `lg:hidden` (mobile) layout branches.

### 8.4 Important Caveats

- The `vite.config.ts` contains Manus-specific plugins (`vite-plugin-manus-runtime`, `vitePluginManusDebugCollector`) that are dev-only and should be removed or replaced for standalone Git deployment.
- The `package.json` includes many unused shadcn/ui dependencies from the template scaffold. These can be pruned for a cleaner Git repo.
- The `server/index.ts` is a minimal Express static file server used only for production serving. It is not needed if deploying to a static host (Netlify, Vercel, GitHub Pages).

---

## 9. Files to Exclude from Git (Suggested .gitignore)

```
node_modules/
dist/
.manus-logs/
*.md (development notes — ideas.md, observations.md, todo.md, etc.)
```

The `docs/` folder (containing this file and the Game Design Document) **should** be included in Git.

---

## 10. Ads Integration Guide

This section provides a complete roadmap for adding advertisements to the Lines game. There are two distinct paths depending on the platform: **web ads** (for the browser version) and **mobile ads** (for the Capacitor-wrapped Android/iOS app).

### 10.1 Web Ads (Browser Version)

**Difficulty: Easy** — Approximately 1–2 hours of work.

The simplest approach for the web version is **Google AdSense**, which serves display ads (banners, auto-sized units) on websites. For a single-page React app like Lines, the integration is straightforward.

**Step-by-step:**

1. **Create an AdSense account** at [adsense.google.com](https://adsense.google.com). You will need a Google account and a domain where the game is hosted (e.g., `lines.manus.space` or your custom domain). AdSense requires site review, which can take 1–14 days.

2. **Add the AdSense script** to `client/index.html`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
   Replace `ca-pub-XXXXXXXXXXXXXXXX` with your AdSense publisher ID.

3. **Create an AdBanner React component** at `client/src/components/AdBanner.tsx`:
   ```tsx
   import { useEffect, useRef } from 'react';
   
   interface AdBannerProps {
     slot: string;
     format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
     className?: string;
   }
   
   export default function AdBanner({ slot, format = 'auto', className }: AdBannerProps) {
     const adRef = useRef<HTMLDivElement>(null);
     const pushed = useRef(false);
   
     useEffect(() => {
       if (!pushed.current && adRef.current) {
         try {
           ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
           pushed.current = true;
         } catch (e) {
           console.error('AdSense error:', e);
         }
       }
     }, []);
   
     return (
       <div ref={adRef} className={className}>
         <ins
           className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive="true"
         />
       </div>
     );
   }
   ```

4. **Place ads in the layout** — The best positions for a game like Lines are:
   - **Below the game board** on mobile (between board and controls)
   - **Below the side panel** on desktop (under the How to Play section)
   - **On the Game Over dialog** (above the Play Again button)
   
   Avoid placing ads that overlap or distract from active gameplay.

5. **Create ad slots** in your AdSense dashboard — one for each placement. Use "Display ads" with responsive sizing.

**Alternatives to AdSense:**

| Service | Best For | Notes |
|---|---|---|
| **Google AdSense** | General web monetization | Most popular, requires site review, good eCPM |
| **Media.net** | Yahoo/Bing contextual ads | Good AdSense alternative, similar setup |
| **Playwire** | HTML5 game monetization | Specialized for browser games, higher eCPMs for gaming traffic |
| **Carbon Ads** | Developer/tech audience | Clean, non-intrusive single ads, invite-only |

**Important considerations:**
- AdSense has strict policies against placing ads that could be accidentally clicked during gameplay. Keep ads away from interactive game elements.
- Single-page apps (SPAs) like React need the `adsbygoogle.push({})` call in a `useEffect` to initialize ads after component mount.
- Ad revenue depends heavily on traffic volume. For a casual game, expect $1–5 per 1,000 page views (RPM).

### 10.2 Mobile Ads (Capacitor App)

**Difficulty: Medium** — Requires Capacitor setup first (see Section 11), then ~2–3 hours for ads.

For the mobile (Android/iOS) version, use **Google AdMob** via the community Capacitor plugin. AdMob supports richer ad formats than web AdSense.

**Step-by-step:**

1. **Install the AdMob plugin:**
   ```bash
   npm install @capacitor-community/admob
   npx cap update
   ```

2. **Configure AdMob app IDs** in native config files:
   - Android: Add `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-XXXXXXXX~YYYYYYYY"/>` to `android/app/src/main/AndroidManifest.xml`
   - iOS: Add `GADApplicationIdentifier` key to `ios/App/App/Info.plist`

3. **Initialize AdMob** in your app entry point:
   ```tsx
   import { AdMob } from '@capacitor-community/admob';
   
   // Call once on app start
   await AdMob.initialize({ initializeForTesting: false });
   ```

4. **Recommended ad formats for Lines:**

   | Format | When to Show | Implementation |
   |---|---|---|
   | **Banner** | Persistent at bottom of screen during gameplay | `AdMob.showBanner({ adId: '...', position: 'BOTTOM_CENTER' })` |
   | **Interstitial** | After every 3rd game over (not every time) | `AdMob.showInterstitial({ adId: '...' })` |
   | **Rewarded** | "Watch ad to undo again" or "Watch ad to continue" | `AdMob.showRewardVideoAd({ adId: '...' })` |

   The **rewarded ad** model works particularly well for Lines — offer players a second undo or a "remove 5 random marbles" power-up in exchange for watching a short video ad.

5. **Create ad units** in the [AdMob console](https://admob.google.com) — one per format per platform.

---

## 11. Mobile Publishing Guide (Android / iOS)

This section provides a complete roadmap for wrapping the Lines web game as a native mobile app using **Capacitor** and publishing it to the Google Play Store and Apple App Store.

### 11.1 Overview

**Difficulty: Medium** — The Capacitor wrapping itself takes ~1 hour. The store submission process takes 2–5 hours per platform (mostly filling out forms and waiting for review).

Capacitor is an open-source native runtime that wraps web apps in a native WebView container, giving them access to native device APIs and allowing distribution through app stores. Since Lines is already a responsive, performant web app, it is an ideal candidate for Capacitor wrapping — no code rewrite is needed.

### 11.2 Prerequisites

| Requirement | Android | iOS |
|---|---|---|
| **Development machine** | Any OS (Windows, Mac, Linux) | macOS only (Xcode requirement) |
| **IDE** | Android Studio (free) | Xcode (free, Mac App Store) |
| **Developer account** | Google Play Console — $25 one-time fee | Apple Developer Program — $99/year |
| **Signing** | Upload keystore (generated locally) | Provisioning profile + certificate (via Xcode) |

### 11.3 Step-by-Step: Adding Capacitor

1. **Install Capacitor in the project:**
   ```bash
   cd /home/ubuntu/lines98
   pnpm add @capacitor/core @capacitor/cli
   npx cap init "Lines" "com.yourname.lines" --web-dir=dist/public
   ```
   This creates a `capacitor.config.ts` file in the project root.

2. **Build the web app:**
   ```bash
   pnpm build
   ```

3. **Add native platforms:**
   ```bash
   pnpm add @capacitor/ios @capacitor/android
   npx cap add android
   npx cap add ios
   ```
   This creates `android/` and `ios/` directories in the project.

4. **Sync web assets to native projects:**
   ```bash
   npx cap sync
   ```
   Run this after every `pnpm build` to copy the latest web build into the native projects.

5. **Open in native IDE:**
   ```bash
   npx cap open android   # Opens Android Studio
   npx cap open ios       # Opens Xcode
   ```

### 11.4 Capacitor Configuration

The `capacitor.config.ts` should be configured for a game:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.lines',
  appName: 'Lines',
  webDir: 'dist/public',
  server: {
    // For production, don't set url — it uses the bundled web assets
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
```

### 11.5 App Store Assets Needed

Before submitting, you will need to prepare:

| Asset | Android (Play Store) | iOS (App Store) |
|---|---|---|
| **App icon** | 512x512 PNG | 1024x1024 PNG (no alpha) |
| **Screenshots** | Min 2 per device type (phone, tablet) | 6.7", 6.5", 5.5" iPhone + iPad sizes |
| **Feature graphic** | 1024x500 PNG (Play Store listing) | Not required |
| **Description** | Short (80 char) + Full (4000 char) | Subtitle (30 char) + Description (4000 char) |
| **Privacy policy** | Required URL | Required URL |
| **Content rating** | IARC questionnaire in Play Console | Age rating questionnaire in App Store Connect |

### 11.6 Publishing to Google Play Store

1. Sign in to [Google Play Console](https://play.google.com/console)
2. Create a new app, fill in details (name, description, category: "Puzzle")
3. In Android Studio: Build → Generate Signed Bundle (AAB format)
4. Upload the AAB to the Production track in Play Console
5. Complete the content rating questionnaire, privacy policy, and store listing
6. Submit for review (typically 1–3 days for first submission)

### 11.7 Publishing to Apple App Store

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with your Bundle ID (`com.yourname.lines`)
3. In Xcode: Product → Archive, then Distribute App → App Store Connect
4. In App Store Connect: fill in metadata, upload screenshots, set pricing (Free)
5. Submit for review (typically 1–2 days, but first submissions can take up to a week)

### 11.8 Key Considerations for Mobile

**What works out of the box:**
- The entire game UI (it is already responsive and touch-friendly)
- localStorage persistence (works in Capacitor WebView)
- Web Audio API sounds (supported on both Android and iOS WebView)
- All CSS animations and Framer Motion

**What may need adjustment:**
- **Safe areas** — Add `viewport-fit=cover` to the HTML meta tag and use `env(safe-area-inset-*)` CSS to handle notches and home indicators on modern phones.
- **Status bar** — Use `@capacitor/status-bar` plugin to control status bar color/style to match the game theme.
- **Splash screen** — Use `@capacitor/splash-screen` plugin for a branded launch screen.
- **Back button (Android)** — By default, the hardware back button navigates the WebView history. Since Lines is a single-page game, you may want to intercept it to show a "Quit game?" dialog instead.
- **Offline support** — The Capacitor-wrapped app bundles all web assets locally, so it works offline by default. The CDN-hosted images (wood texture, parchment) should be bundled locally for the mobile version to ensure offline play.

**Estimated timeline for mobile publishing:**

| Task | Time |
|---|---|---|
| Add Capacitor + configure | 1 hour |
| Prepare app icons and screenshots | 2 hours |
| Android build + Play Store submission | 2 hours |
| iOS build + App Store submission | 3 hours |
| Review wait time | 1–7 days |
| **Total active work** | **~8 hours** |

---

## 12. Future Session Quick-Start Prompts

Copy-paste these prompts into a new chat to quickly resume specific tasks. Each prompt references this document and the Game Design Document for full context.

### 12.1 Add Web Ads

> I have a Lines puzzle game (React 19 + Vite 7). Please read the docs at `docs/CONTEXT_CONTINUITY.md` (Section 10.1) and `docs/GAME_DESIGN_DOCUMENT.md` for full context. I want to add Google AdSense banner ads to the web version. Place them below the game board on mobile and below the side panel on desktop. Do not place ads that interfere with gameplay.

### 12.2 Publish to Mobile (Android + iOS)

> I have a Lines puzzle game (React 19 + Vite 7). Please read the docs at `docs/CONTEXT_CONTINUITY.md` (Sections 11 and 10.2) and `docs/GAME_DESIGN_DOCUMENT.md` for full context. I want to wrap this as a native mobile app using Capacitor and prepare it for Google Play Store and Apple App Store submission. Also integrate AdMob rewarded ads (offer a second undo in exchange for watching an ad). Bundle the CDN images locally for offline play.

### 12.3 General Development Continuation

> I have a Lines puzzle game (React 19 + Vite 7). Please read `docs/CONTEXT_CONTINUITY.md` and `docs/GAME_DESIGN_DOCUMENT.md` for full project context, architecture, user preferences, and pending improvements before making any changes.
