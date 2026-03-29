# Lines

A modern web recreation of the classic Lines 98 puzzle game, built with React 19, Vite 7, and Tailwind CSS 4.

Move colored marbles on a 9x9 grid to align 5 or more of the same color in a row, column, or diagonal. Clear lines to score points before the board fills up.

## Features

- **Classic gameplay** — 9x9 board, 7 marble colors, BFS pathfinding, line detection in 4 directions
- **Preview marbles** — Small translucent indicators show where the next 3 marbles will spawn
- **One-time undo** — Revert your last move once per turn
- **5 board themes** — Walnut, Oak, Cream, Grass, Sky (marble colors stay the same)
- **Sound effects** — Synthesized via Web Audio API with mute toggle
- **Balloon-pop animation** — Satisfying burst effect when lines are cleared
- **Responsive** — Works on mobile, tablet, and desktop
- **No backend** — Fully client-side, scores saved to localStorage

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

The dev server runs at `http://localhost:3000`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + inline styles |
| Animation | Framer Motion 12 |
| Audio | Web Audio API |
| Routing | Wouter |

## Play

[Play Lines](https://velvetmb.github.io/line/)

## License

MIT
