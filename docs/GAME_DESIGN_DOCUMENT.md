# Lines — Game Design Document

**Version:** 1.0  
**Date:** March 29, 2026  
**Author:** Manus AI

---

## 1. Overview

**Lines** is a modern web-based recreation of the classic Lines 98 puzzle game, originally developed by Olga Demina for Windows in 1998. The player moves colored marbles on a 9x9 grid, attempting to align five or more marbles of the same color in a row (horizontally, vertically, or diagonally) to clear them and earn points. After each move that does not result in a line clear, three new marbles spawn on the board. The game ends when the board is completely filled.

This implementation is a **static, client-only React application** with no backend dependency. All game state, scoring, and preferences are managed in-browser using React hooks and `localStorage`.

---

## 2. Design Philosophy

### 2.1 Chosen Aesthetic: "Glass Marbles on Wood"

The visual direction draws from **skeuomorphic realism**, evoking the tactile experience of playing with real glass marbles on a polished wooden board. Three design approaches were considered during brainstorming — Retro Arcade Cabinet, Glass Marbles on Wood, and Minimal Zen Garden — and the second was selected for its warmth, material richness, and broad appeal.

### 2.2 Core Design Principles

| Principle | Implementation |
|---|---|
| **Photorealistic materials** | CSS radial gradients simulate glass marble refraction with specular highlights, inner glow, and ambient shadow. Board textures use real wood-grain imagery. |
| **Depth and tactility** | Layered box-shadows, inset cell shadows, and subtle border highlights create a convincing 3D tabletop illusion. |
| **Warm, inviting palette** | Natural material tones — walnut, parchment, amber — form the default color story, with marble colors kept rich and saturated. |
| **Physics-inspired animation** | Spring-based bounce on new marble spawns, gentle breathing pulse on previews, and a balloon-pop burst on line clears all reinforce the physical metaphor. |

### 2.3 Typography

The typography system pairs two Google Fonts to balance elegance with readability:

- **Playfair Display** (serif) — Used for the game title and decorative headings. Its high contrast and refined letterforms evoke a premium tabletop game box.
- **Source Sans 3** (sans-serif) — Used for score labels, buttons, and instructional text. Its clean geometry ensures legibility at small sizes on mobile.

---

## 3. Game Rules

### 3.1 Board and Marbles

The game is played on a **9x9 square grid** containing **81 cells**. Marbles come in **7 colors**: red, blue, green, yellow, purple, cyan, and coral. The game begins with **5 randomly placed marbles**.

### 3.2 Turn Sequence

Each turn follows this sequence:

1. The player selects a marble by clicking it.
2. The player clicks an empty destination cell.
3. The game checks whether a valid path exists between the two cells using **BFS (Breadth-First Search)** — marbles can only travel through orthogonally adjacent empty cells (no diagonal movement, no jumping over other marbles).
4. If a valid path exists, the marble moves instantly to the destination.
5. The game checks for completed lines at the destination.

### 3.3 Line Clearing

After a marble lands, the game scans for lines of **5 or more** same-colored marbles in any of four directions: horizontal, vertical, diagonal-down-right, and diagonal-down-left. All qualifying marbles are removed simultaneously. A single move can clear multiple overlapping lines.

**Critical rule:** When a line is cleared, **no new marbles spawn that turn**. The existing preview positions remain unchanged and will spawn on the next non-clearing turn. This rewards the player for strategic play.

### 3.4 Spawning

When a move does **not** result in a line clear, three new marbles spawn at the positions indicated by the small translucent preview marbles on the board. After spawning, the game checks again for any lines formed by the newly placed marbles and clears them if found. New preview positions and colors are then generated for the next turn.

If a preview position is occupied (because the player moved a marble there), the game finds an alternative random empty cell for that marble.

### 3.5 Scoring

| Marbles Cleared | Points |
|---|---|
| 5 | 10 |
| 6 | 12 |
| 7+ | 10 + (n − 5) × (n − 4) |

This formula provides escalating rewards for longer lines, incentivizing the player to set up larger clears rather than settling for the minimum five.

### 3.6 Game Over

The game ends when the board is completely filled and no empty cells remain. The player's final score is displayed alongside their all-time best score.

---

## 4. Features

### 4.1 Preview Marbles

Small, translucent marbles appear on the board showing where the next three marbles will spawn and what colors they will be. These previews pulse gently with a breathing animation (opacity oscillating between 0.3 and 0.55, scale between 0.9 and 1.05) to distinguish them from placed marbles without being distracting.

### 4.2 One-Time Undo

The player may undo their most recent move exactly once. Pressing "Undo Move" restores the board, score, and preview positions to the state before the last move. The undo state is stored in a `useRef` to avoid unnecessary re-renders. Once used, the undo button disables until the next move.

### 4.3 Sound Effects

All sounds are synthesized at runtime using the **Web Audio API** — no external audio files are required. The sound system is deliberately minimal:

| Sound | Trigger | Character |
|---|---|---|
| **Select** | Clicking a marble | Soft sine-wave click, 800 Hz descending to 600 Hz over 60 ms |
| **Drop** | Placing a marble on an empty cell | Gentle low thud, 280 Hz descending to 160 Hz over 80 ms |
| **Line Clear** | Clearing 5+ aligned marbles | Nintendo Switch Joy-Con-inspired "click" — a 4-layer composite of sharp square-wave transient, bright sine resonance, sub-harmonic body, and high-pass filtered noise burst |

A **mute toggle** (speaker icon) in the header persists the muted state to `localStorage`.

### 4.4 Board Themes

Five visual themes change the page background, board frame, cell colors, panel styling, button colors, and text colors. **Marble colors remain identical across all themes** to preserve gameplay clarity.

| Theme | Character |
|---|---|
| **Walnut** (default) | Rich dark wood grain with parchment panels — the classic tabletop feel |
| **Oak** | Lighter warm wood tones with tan panels — casual and approachable |
| **Cream** | Neutral off-white and warm gray — clean, minimal, modern |
| **Grass** | Pastel green gradient — fresh, outdoor garden feel |
| **Sky** | Soft sky-blue gradient — airy and calming |

Theme selection persists to `localStorage` and is managed through a React Context (`BoardThemeContext`).

### 4.5 Responsive Layout

The layout adapts to three breakpoints:

| Viewport | Layout |
|---|---|
| **Mobile** (< 640px) | Compact header, horizontal score row, board fills width (max 420px), controls stacked below |
| **Tablet** (640px–1023px) | Same as mobile with slightly larger spacing |
| **Desktop** (1024px+) | Side panel (score, controls, how-to-play) on the left, 500px board on the right |

The mobile layout uses `100dvh` for full viewport height and `overscrollBehavior: none` to prevent pull-to-refresh interference on touch devices.

### 4.6 Game Over Dialog

An animated modal overlay appears when the board fills. It displays the final score, best score, and an optional "New High Score!" badge with a pulsing animation. The dialog uses `framer-motion` for spring-based entrance and fade-out exit.

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 + inline styles for dynamic theming |
| Animation | Framer Motion 12 |
| Audio | Web Audio API (no external files) |
| Routing | Wouter (lightweight) |
| UI primitives | shadcn/ui + Radix UI |
| State | React hooks (`useState`, `useCallback`, `useRef`) |
| Persistence | `localStorage` for high score, theme, and mute state |

### 5.2 File Structure (Game-Specific Files)

```
client/
  index.html                      # Entry HTML with Google Fonts
  src/
    App.tsx                        # Root component with provider stack
    index.css                      # Global theme variables and Tailwind config
    pages/
      Home.tsx                     # Main game page — layout, sound wiring, event handlers
    components/
      GameBoard.tsx                # 9x9 grid with themed cells and marble rendering
      Marble.tsx                   # Glass marble with selection, preview, spawn, and pop animations
      ScorePanel.tsx               # Score and high score display
      GameControls.tsx             # Undo and New Game buttons
      GameOverDialog.tsx           # Animated game-over modal
      HowToPlay.tsx                # Collapsible rules panel
      ThemeSelector.tsx            # 5-swatch theme picker
      MuteButton.tsx               # Sound toggle icon button
    hooks/
      useGameEngine.ts             # Core game logic — board state, BFS, line detection, scoring
      useSoundEngine.ts            # Web Audio API synthesized sounds with mute toggle
    contexts/
      BoardThemeContext.tsx         # 5 theme definitions and React Context provider
```

### 5.3 Game Engine (`useGameEngine`)

The game engine is a single custom React hook that encapsulates all game logic. It exposes four values: `gameState` (the full board, score, selection, animations), `selectCell` (click handler), `undo`, and `newGame`.

**Key algorithms:**

- **BFS Pathfinding** — Standard breadth-first search on a 9x9 grid with 4-directional movement. Returns the shortest path or `null` if no valid path exists. Time complexity is O(81) worst case.
- **Line Detection** — Iterates every cell in 4 directions (horizontal, vertical, two diagonals), extending runs of matching colors. Uses a `Set<string>` to deduplicate positions across overlapping lines.
- **Preview Management** — On game init and after each non-clearing move, 3 random empty cells are selected and assigned random colors. These persist across clearing turns.

### 5.4 Performance Optimizations

All presentational components (`GameBoard`, `Marble`, `ScorePanel`, `GameControls`, `HowToPlay`, `ThemeSelector`, `MuteButton`) are wrapped in `React.memo` to prevent unnecessary re-renders. The `GameBoard` converts `clearingCells` and `newMarbles` arrays into `Set<string>` for O(1) membership checks per cell. All event handlers are stabilized with `useCallback`.

### 5.5 Animation System

Animations are handled by Framer Motion with the following effects:

| Animation | Technique |
|---|---|
| **Marble selection** | Continuous y-bounce (0 → −5 → 0) and scale pulse (1 → 1.05 → 1) at 0.8s period |
| **New marble spawn** | Spring entrance from scale 0 + y offset −10, stiffness 400, damping 15 |
| **Preview pulse** | Opacity 0.3–0.55, scale 0.9–1.05, 2s period |
| **Balloon-pop clear** | 4-layer composite: marble inflates to 1.3x then shrinks to 0; white radial flash expands; 10 colored confetti shards fly outward with gravity; expanding ring pressure wave |

---

## 6. External Assets

The game uses two externally hosted images (served via CDN) for the Walnut theme:

| Asset | Purpose |
|---|---|
| `wood-table-bg.webp` | Page background and board frame texture |
| `parchment-texture.webp` | Score panel and controls panel background |

All other themes use CSS gradients and require no external assets. The marble rendering is entirely CSS-based (radial gradients + box shadows).

---

## 7. Considerations for Future Improvement

### 7.1 Path Animation

Currently, marbles teleport instantly from origin to destination. Animating the marble sliding cell-by-cell along the BFS path would significantly enhance the tactile feel. The path data is already available in `gameState.movePath` — it would require a step-through animation loop with ~80ms per cell.

### 7.2 Score Combo Feedback

A floating "+10" or "Combo!" label that rises from cleared lines would provide immediate visual feedback on points earned. This could use Framer Motion's `AnimatePresence` with a y-offset exit animation.

### 7.3 Sound Enhancements

The current Web Audio API synthesis is lightweight but limited. Future iterations could use pre-recorded audio samples (stored as base64 data URIs or small hosted files) for richer marble-rolling and glass-clinking effects.

### 7.4 Difficulty Modes

Adding selectable difficulty levels — such as fewer colors (easier, more frequent matches), more balls per turn (harder, faster board fill), or a larger/smaller grid — would extend replayability.

### 7.5 Statistics and Leaderboard

A local statistics panel tracking total games played, average score, longest line cleared, and a top-10 scores list with timestamps would give players long-term goals. All data can remain in `localStorage`.

### 7.6 Accessibility

The game currently uses `aria-label` on all cells for screen reader support. Further improvements could include keyboard navigation (arrow keys to move selection, Enter to confirm), high-contrast mode, and reduced-motion preferences that disable animations.

### 7.7 Mobile Touch Gestures

Adding swipe-to-move or drag-and-drop for marble movement on touch devices could make the mobile experience more intuitive than the current tap-to-select, tap-to-place flow.

---

## 8. Known Limitations

- The game is **client-only** — scores and preferences are stored in `localStorage` and will be lost if browser data is cleared.
- The BFS pathfinding does not animate the path traversal (marbles teleport).
- Sound synthesis quality depends on the device's audio hardware and Web Audio API implementation.
- The game does not support multiplayer or online leaderboards.
