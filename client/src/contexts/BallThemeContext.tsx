/*
 * Ball Theme Context — visual styles for marbles
 *
 * 4 themes: Classic (glass), Flat (solid color), Billiard (numbered pool balls),
 * Sports (each color is a different sport ball).
 *
 * Follows the same pattern as BoardThemeContext.
 */

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type BallThemeName = 'classic' | 'flat' | 'billiard' | 'sports';

export interface MarbleColorSet {
  base: string;
  light: string;
  dark: string;
  glow: string;
}

export interface BallTheme {
  name: BallThemeName;
  label: string;
  getMarbleStyle: (colors: MarbleColorSet, index: number, isSelected: boolean, isPreview: boolean) => React.CSSProperties;
  getOverlays: (colors: MarbleColorSet, index: number) => ReactNode;
  /** Returns effective colors for effects (clearing animation, etc.). Sports overrides game colors with real ball colors. */
  getEffectColors?: (colors: MarbleColorSet, index: number) => MarbleColorSet;
}

// ─── Classic: Glass marble (original) ───────────────────────────────────────

const classicTheme: BallTheme = {
  name: 'classic',
  label: 'Classic',
  getMarbleStyle: (colors, _index, isSelected, isPreview) => ({
    background: `
      radial-gradient(circle at 35% 30%, ${colors.light}cc 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, ${colors.base} 0%, ${colors.dark} 100%)
    `,
    boxShadow: isSelected
      ? `0 4px 12px ${colors.glow}, 0 0 20px ${colors.glow}, inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`
      : isPreview ? 'none'
      : `0 3px 8px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`,
  }),
  getOverlays: () => (
    <div style={{
      position: 'absolute', top: '12%', left: '25%', width: '35%', height: '25%',
      borderRadius: '50%',
      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)',
      transform: 'rotate(-20deg)', pointerEvents: 'none',
    }} />
  ),
};

// ─── Flat: Solid color, no effects ──────────────────────────────────────────

const flatTheme: BallTheme = {
  name: 'flat',
  label: 'Flat',
  getMarbleStyle: (colors, _index, isSelected, isPreview) => ({
    background: colors.base,
    boxShadow: isSelected
      ? `0 0 0 3px white, 0 0 0 5px ${colors.base}, 0 4px 8px ${colors.glow}`
      : isPreview ? 'none'
      : `0 2px 4px rgba(0,0,0,0.25)`,
  }),
  getOverlays: () => null,
};

// ─── Billiard: Numbered pool balls ──────────────────────────────────────────

const billiardTheme: BallTheme = {
  name: 'billiard',
  label: 'Billiard',
  getMarbleStyle: (colors, index, isSelected, isPreview) => {
    const isStripe = index >= 4;
    return {
      background: isStripe
        ? `linear-gradient(to bottom, white 20%, ${colors.base} 20%, ${colors.base} 80%, white 80%)`
        : `radial-gradient(circle at 40% 35%, ${colors.light}88 0%, transparent 40%), ${colors.base}`,
      boxShadow: isSelected
        ? `0 4px 12px ${colors.glow}, 0 0 16px ${colors.glow}, inset 0 -2px 4px rgba(0,0,0,0.3)`
        : isPreview ? 'none'
        : `0 3px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)`,
    };
  },
  getOverlays: (_colors, index) => (
    <>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '42%', height: '42%', borderRadius: '50%', background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
      }}>
        <span style={{
          fontSize: 'clamp(5px, 1.2vw, 11px)', fontWeight: 800, color: '#1a1a1a',
          lineHeight: 1, fontFamily: 'Arial, sans-serif',
        }}>
          {index + 1}
        </span>
      </div>
      <div style={{
        position: 'absolute', top: '8%', left: '20%', width: '30%', height: '20%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, transparent 100%)',
        transform: 'rotate(-15deg)', pointerEvents: 'none',
      }} />
    </>
  ),
};

// ─── Sports: Each color is a real sport ball with authentic colors ──────────
// 0:red=Basketball, 1:blue=Baseball, 2:green=Tennis, 3:yellow=Soccer,
// 4:purple=Volleyball, 5:cyan=Football/Rugby, 6:coral=Bowling
//
// Each sport ball uses its REAL colors — the ball type itself is the identifier.

const SPORT_COLORS: Record<number, MarbleColorSet> = {
  0: { base: '#e87121', light: '#f5a062', dark: '#1a0800', glow: 'rgba(232, 113, 33, 0.6)' },  // Basketball orange-brown
  1: { base: '#f0ead8', light: '#fffef8', dark: '#c8bfa8', glow: 'rgba(200, 60, 60, 0.5)' },   // Baseball cream-white
  2: { base: '#c6d831', light: '#e4f060', dark: '#7a8a10', glow: 'rgba(198, 216, 49, 0.6)' },   // Tennis neon yellow-green
  3: { base: '#f2f2f2', light: '#ffffff', dark: '#222222', glow: 'rgba(120, 120, 120, 0.4)' },   // Soccer white
  4: { base: '#1a56a8', light: '#e8eef8', dark: '#0c2d5e', glow: 'rgba(26, 86, 168, 0.6)' },    // Volleyball blue
  5: { base: '#7a4422', light: '#b87a4a', dark: '#2a1008', glow: 'rgba(122, 68, 34, 0.6)' },     // Football brown leather
  6: { base: '#cc1133', light: '#ff6670', dark: '#550011', glow: 'rgba(204, 17, 51, 0.6)' },     // Bowling red
};

const sportsOverlays: Record<number, () => ReactNode> = {
  // Basketball — black seam lines (horizontal, vertical, two curved)
  0: () => {
    const lc = 'rgba(0,0,0,0.55)';
    return (
      <>
        <div style={{ position: 'absolute', top: '5%', left: '49%', width: '2px', height: '90%', background: lc, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '49%', left: '5%', width: '90%', height: '2px', background: lc, pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', top: '5%', left: '10%', width: '40%', height: '90%',
          borderRadius: '50%', border: `1.5px solid ${lc}`,
          borderColor: `transparent ${lc} transparent transparent`, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '5%', left: '50%', width: '40%', height: '90%',
          borderRadius: '50%', border: `1.5px solid ${lc}`,
          borderColor: `transparent transparent transparent ${lc}`, pointerEvents: 'none',
        }} />
        {/* Pebbled texture hint */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Baseball — red stitching arcs on cream ball
  1: () => {
    const sc = '#cc2222';
    const stitches = (baseTop: number, baseLeft: number, count: number, angle: number) =>
      Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        const top = baseTop + Math.sin(t * Math.PI) * 18;
        const left = baseLeft + (t - 0.5) * 28;
        return (
          <div key={`s-${baseLeft}-${i}`} style={{
            position: 'absolute', top: `${top}%`, left: `${left}%`,
            width: '6%', height: '1.5px', background: sc,
            transform: `rotate(${angle + (t - 0.5) * 60}deg)`, pointerEvents: 'none',
          }} />
        );
      });
    return (
      <>
        {/* Left curve */}
        <div style={{
          position: 'absolute', top: '-10%', left: '15%', width: '50%', height: '120%',
          borderRadius: '50%', border: `1.5px solid ${sc}`,
          borderColor: `transparent ${sc} transparent transparent`,
          transform: 'rotate(10deg)', pointerEvents: 'none',
        }} />
        {stitches(25, 55, 6, 80)}
        {/* Right curve */}
        <div style={{
          position: 'absolute', top: '-10%', left: '35%', width: '50%', height: '120%',
          borderRadius: '50%', border: `1.5px solid ${sc}`,
          borderColor: `transparent transparent transparent ${sc}`,
          transform: 'rotate(-10deg)', pointerEvents: 'none',
        }} />
        {stitches(25, 20, 6, -80)}
        {/* Subtle highlight */}
        <div style={{
          position: 'absolute', top: '8%', left: '20%', width: '35%', height: '22%', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, transparent 100%)',
          transform: 'rotate(-20deg)', pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Tennis — silver/white curved seam lines on neon felt
  2: () => (
    <>
      <div style={{
        position: 'absolute', top: '-15%', left: '20%', width: '55%', height: '130%',
        borderRadius: '50%', border: '2.5px solid rgba(210,210,210,0.7)',
        borderColor: 'transparent rgba(210,210,210,0.7) transparent transparent',
        transform: 'rotate(15deg)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '-15%', left: '25%', width: '55%', height: '130%',
        borderRadius: '50%', border: '2.5px solid rgba(210,210,210,0.7)',
        borderColor: 'transparent transparent transparent rgba(210,210,210,0.7)',
        transform: 'rotate(-15deg)', pointerEvents: 'none',
      }} />
      {/* Felt fuzz texture */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, transparent 45%)',
        pointerEvents: 'none',
      }} />
    </>
  ),

  // Soccer — black pentagons on white ball
  3: () => {
    const ps = (top: string, left: string, size: string, rot: number): React.CSSProperties => ({
      position: 'absolute', top, left, width: size, height: size,
      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      background: '#1a1a1a', transform: `rotate(${rot}deg)`, pointerEvents: 'none',
    });
    return (
      <>
        <div style={ps('10%', '35%', '24%', 0)} />
        <div style={ps('32%', '8%', '20%', 48)} />
        <div style={ps('32%', '66%', '20%', -32)} />
        <div style={ps('60%', '18%', '20%', 18)} />
        <div style={ps('60%', '56%', '20%', -48)} />
        {/* Panel edge lines */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 28%, rgba(255,255,255,0.45) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Volleyball — white curved stripes on blue ball (Mikasa-style)
  4: () => {
    const sc = 'rgba(255,255,255,0.85)';
    return (
      <>
        {/* Three curved panel stripes at ~120° intervals */}
        {[0, 120, 240].map(rot => (
          <div key={rot} style={{
            position: 'absolute', top: '-20%', left: '28%', width: '44%', height: '140%',
            borderRadius: '50%', pointerEvents: 'none',
            borderLeft: `3px solid ${sc}`,
            borderRight: `3px solid ${sc}`,
            borderTop: 'none', borderBottom: 'none',
            transform: `rotate(${rot}deg)`,
          }} />
        ))}
        {/* Subtle yellow accent stripe on one panel (like Mikasa) */}
        <div style={{
          position: 'absolute', top: '15%', left: '32%', width: '36%', height: '28%',
          borderRadius: '50%',
          background: 'rgba(255, 220, 50, 0.2)',
          transform: 'rotate(10deg)', pointerEvents: 'none',
        }} />
        {/* Highlight */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Football/Rugby — brown leather with white laces
  5: () => (
    <>
      {/* Lace line */}
      <div style={{
        position: 'absolute', top: '22%', left: '47%', width: '5%', height: '56%',
        background: 'rgba(255,255,255,0.75)', borderRadius: '2px', pointerEvents: 'none',
      }} />
      {/* Cross laces */}
      {[28, 36, 44, 52, 60, 68].map(top => (
        <div key={top} style={{
          position: 'absolute', top: `${top}%`, left: '34%', width: '32%', height: '2px',
          background: 'rgba(255,255,255,0.6)', pointerEvents: 'none',
        }} />
      ))}
      {/* Highlight */}
      <div style={{
        position: 'absolute', top: '8%', left: '20%', width: '32%', height: '20%', borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </>
  ),

  // Bowling — three finger holes on glossy red
  6: () => {
    const hs = (top: string, left: string): React.CSSProperties => ({
      position: 'absolute', top, left, width: '16%', height: '16%', borderRadius: '50%',
      background: '#550011',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7), inset 0 -1px 2px rgba(255,255,255,0.1)',
      pointerEvents: 'none',
    });
    return (
      <>
        <div style={hs('18%', '42%')} />
        <div style={hs('38%', '28%')} />
        <div style={hs('38%', '56%')} />
        {/* Strong glossy highlight */}
        <div style={{
          position: 'absolute', top: '6%', left: '16%', width: '40%', height: '28%', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(-20deg)', pointerEvents: 'none',
        }} />
      </>
    );
  },
};

const sportsStyles: Record<number, (sc: MarbleColorSet, isSelected: boolean, isPreview: boolean) => React.CSSProperties> = {
  // Basketball — matte pebbled texture
  0: (sc, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 40% 35%, ${sc.light}55 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${sc.base} 0%, ${sc.dark} 120%)`,
    boxShadow: isSelected ? `0 4px 12px ${sc.glow}, 0 0 16px ${sc.glow}, inset 0 -2px 4px rgba(0,0,0,0.25)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.25)`,
  }),
  // Baseball — smooth leather white/cream
  1: (sc, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 35% 30%, ${sc.light} 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${sc.base} 0%, ${sc.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${sc.glow}, 0 0 16px ${sc.glow}, inset 0 -2px 4px rgba(0,0,0,0.12)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.12)`,
  }),
  // Tennis — matte felt, no gloss
  2: (sc, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 45% 40%, ${sc.light}55 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${sc.base} 0%, ${sc.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 10px ${sc.glow}, 0 0 14px ${sc.glow}, inset 0 0 8px rgba(255,255,255,0.1)` : isPreview ? 'none' : `0 2px 6px rgba(0,0,0,0.3), inset 0 0 8px rgba(255,255,255,0.1)`,
  }),
  // Soccer — clean white sphere
  3: (sc, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 35% 28%, ${sc.light} 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${sc.base} 0%, #d0d0d0 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${sc.glow}, 0 0 14px ${sc.glow}, inset 0 -2px 4px rgba(0,0,0,0.15)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)`,
  }),
  // Volleyball — blue sphere
  4: (sc, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 35% 28%, ${sc.light}44 0%, transparent 45%), radial-gradient(circle at 50% 50%, ${sc.base} 0%, ${sc.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${sc.glow}, 0 0 18px ${sc.glow}, inset 0 -3px 6px rgba(0,0,0,0.25)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.25)`,
  }),
  // Football — leather with subtle grain
  5: (sc, isSelected, isPreview) => ({
    background: `radial-gradient(ellipse at 38% 32%, ${sc.light}66 0%, transparent 42%), radial-gradient(circle at 50% 50%, ${sc.base} 0%, ${sc.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${sc.glow}, 0 0 16px ${sc.glow}, inset 0 -3px 6px rgba(0,0,0,0.3)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.3)`,
  }),
  // Bowling — very glossy, shiny
  6: (sc, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 28% 22%, ${sc.light}cc 0%, transparent 38%), radial-gradient(circle at 50% 50%, ${sc.base} 0%, ${sc.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 14px ${sc.glow}, 0 0 22px ${sc.glow}, inset 0 -4px 8px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.2)` : isPreview ? 'none' : `0 4px 10px rgba(0,0,0,0.45), inset 0 -4px 8px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.2)`,
  }),
};

const sportsTheme: BallTheme = {
  name: 'sports',
  label: 'Sports',
  getMarbleStyle: (_colors, index, isSelected, isPreview) => {
    const sc = SPORT_COLORS[index] ?? SPORT_COLORS[0];
    const styleFn = sportsStyles[index];
    if (styleFn) return styleFn(sc, isSelected, isPreview);
    return classicTheme.getMarbleStyle(sc, index, isSelected, isPreview);
  },
  getOverlays: (_colors, index) => {
    const overlayFn = sportsOverlays[index];
    if (overlayFn) return overlayFn();
    return classicTheme.getOverlays(SPORT_COLORS[index] ?? SPORT_COLORS[0], index);
  },
  getEffectColors: (_colors, index) => SPORT_COLORS[index] ?? SPORT_COLORS[0],
};

// ─── Theme Registry ─────────────────────────────────────────────────────────

export const BALL_THEMES: Record<BallThemeName, BallTheme> = {
  classic: classicTheme,
  flat: flatTheme,
  billiard: billiardTheme,
  sports: sportsTheme,
};

export const BALL_THEME_NAMES: BallThemeName[] = ['classic', 'flat', 'billiard', 'sports'];

// ─── Context ────────────────────────────────────────────────────────────────

interface BallThemeContextValue {
  themeName: BallThemeName;
  theme: BallTheme;
  setTheme: (name: BallThemeName) => void;
}

const BallThemeContext = createContext<BallThemeContextValue>({
  themeName: 'classic',
  theme: classicTheme,
  setTheme: () => {},
});

export function BallThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<BallThemeName>(() => {
    try {
      const saved = localStorage.getItem('lines_ball_theme') as BallThemeName;
      if (saved && BALL_THEMES[saved]) return saved;
    } catch {}
    return 'classic';
  });

  const setTheme = useCallback((name: BallThemeName) => {
    setThemeName(name);
    try { localStorage.setItem('lines_ball_theme', name); } catch {}
  }, []);

  return (
    <BallThemeContext.Provider value={{ themeName, theme: BALL_THEMES[themeName], setTheme }}>
      {children}
    </BallThemeContext.Provider>
  );
}

export function useBallTheme() {
  return useContext(BallThemeContext);
}
