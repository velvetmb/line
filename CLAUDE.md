# Lines

## Overview
Web recreation of the classic Lines 98 puzzle game. Move colored marbles on a 9x9 grid, align 5+ same-colored marbles to clear them and score points. Three new marbles spawn after each non-clearing move. Game ends when the board fills.

## Tech Stack
- React 19 + TypeScript + Vite 7
- Tailwind CSS 4 + Framer Motion 12
- Radix UI + shadcn/ui components
- Web Audio API for synthesized sound effects
- No backend — fully client-side, localStorage for persistence
- Package manager: pnpm

## Build & Run
- `pnpm install` — install dependencies
- `pnpm dev` — dev server at http://localhost:3000
- `pnpm build` — production build to dist/public
- `pnpm check` — TypeScript type checking

## Key Files
| File | What it does |
|---|---|
| `client/src/hooks/useGameEngine.ts` | ALL game logic — board state, BFS pathfinding, line detection, scoring, spawning, undo, game over |
| `client/src/hooks/useSoundEngine.ts` | Web Audio API sound synthesis (select, drop, lineClear) |
| `client/src/contexts/BoardThemeContext.tsx` | 5 visual themes (Walnut, Oak, Cream, Grass, Sky) with ~30 CSS props each |
| `client/src/pages/Home.tsx` | Main page — wires game engine + sound + theme, separate mobile/desktop layouts |
| `client/src/components/Marble.tsx` | Marble rendering with 5 visual states (normal, selected, preview, new, clearing) |
| `client/src/components/GameBoard.tsx` | 9x9 grid rendering |

## Design Decisions (respect these)
- Only 3 sounds: select, drop, lineClear — user found more sounds "too much"
- Clearing a line is NOT a move — no new marbles spawn after a clear
- Preview marbles shown on-board only — no "Next 3" text indicator
- Grass and Sky themes must stay light/pastel — user rejected dark versions
- Line clear sound is a Nintendo Switch Joy-Con-style "click"

## Pending Features
See `docs/CONTEXT_CONTINUITY.md` Section 7 for full list. Top items: path animation, score combo text, statistics tracker.

## External Assets
Two CDN images used by Walnut theme only (wood table bg + parchment texture). All other themes use CSS gradients.
