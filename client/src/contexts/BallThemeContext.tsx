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

// ─── Sports: Each color is a different sport ball ───────────────────────────
// 0:red=Basketball, 1:blue=Baseball, 2:green=Tennis, 3:yellow=Soccer,
// 4:purple=Football/Rugby, 5:cyan=Bowling, 6:coral=Volleyball

const sportsOverlays: Record<number, (colors: MarbleColorSet) => ReactNode> = {
  // Basketball (red) — seam lines
  0: (colors) => {
    const lc = `${colors.dark}99`;
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
        <div style={{
          position: 'absolute', top: '10%', left: '22%', width: '30%', height: '20%', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, transparent 100%)', pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Baseball (blue) — stitching arcs
  1: (colors) => {
    const sc = colors.dark;
    const stitches = (baseTop: number, baseLeft: number, count: number, angle: number) =>
      Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        const top = baseTop + Math.sin(t * Math.PI) * 18;
        const left = baseLeft + (t - 0.5) * 28;
        return (
          <div key={`s-${baseLeft}-${i}`} style={{
            position: 'absolute', top: `${top}%`, left: `${left}%`,
            width: '6%', height: '2px', background: sc,
            transform: `rotate(${angle + (t - 0.5) * 60}deg)`, pointerEvents: 'none', opacity: 0.7,
          }} />
        );
      });
    return (
      <>
        <div style={{
          position: 'absolute', top: '-10%', left: '15%', width: '50%', height: '120%',
          borderRadius: '50%', border: `1.5px solid ${sc}88`,
          borderColor: `transparent ${sc}88 transparent transparent`,
          transform: 'rotate(10deg)', pointerEvents: 'none',
        }} />
        {stitches(25, 55, 5, 80)}
        <div style={{
          position: 'absolute', top: '-10%', left: '35%', width: '50%', height: '120%',
          borderRadius: '50%', border: `1.5px solid ${sc}88`,
          borderColor: `transparent transparent transparent ${sc}88`,
          transform: 'rotate(-10deg)', pointerEvents: 'none',
        }} />
        {stitches(25, 20, 5, -80)}
        <div style={{
          position: 'absolute', top: '8%', left: '20%', width: '35%', height: '22%', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, transparent 100%)',
          transform: 'rotate(-20deg)', pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Tennis (green) — felt seam curves
  2: () => (
    <>
      <div style={{
        position: 'absolute', top: '-15%', left: '20%', width: '55%', height: '130%',
        borderRadius: '50%', border: '2px solid rgba(255,255,255,0.55)',
        borderColor: 'transparent rgba(255,255,255,0.55) transparent transparent',
        transform: 'rotate(15deg)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '-15%', left: '25%', width: '55%', height: '130%',
        borderRadius: '50%', border: '2px solid rgba(255,255,255,0.55)',
        borderColor: 'transparent transparent transparent rgba(255,255,255,0.55)',
        transform: 'rotate(-15deg)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25) 0%, transparent 45%)',
        pointerEvents: 'none',
      }} />
    </>
  ),

  // Soccer (yellow) — pentagon patches
  3: (colors) => {
    const ps = (top: string, left: string, size: string, rot: number): React.CSSProperties => ({
      position: 'absolute', top, left, width: size, height: size,
      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      background: `${colors.dark}cc`, transform: `rotate(${rot}deg)`, pointerEvents: 'none',
    });
    return (
      <>
        <div style={ps('8%', '35%', '22%', 0)} />
        <div style={ps('30%', '10%', '18%', 45)} />
        <div style={ps('30%', '68%', '18%', -30)} />
        <div style={ps('60%', '20%', '18%', 15)} />
        <div style={ps('60%', '58%', '18%', -45)} />
        <div style={{
          position: 'absolute', top: '8%', left: '22%', width: '35%', height: '22%', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 100%)',
          transform: 'rotate(-20deg)', pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Football/Rugby (purple) — oval shape with laces
  4: () => (
    <>
      {/* Lace line down center */}
      <div style={{
        position: 'absolute', top: '25%', left: '48%', width: '4%', height: '50%',
        background: 'rgba(255,255,255,0.7)', borderRadius: '2px', pointerEvents: 'none',
      }} />
      {/* Cross laces */}
      {[30, 38, 46, 54, 62].map(top => (
        <div key={top} style={{
          position: 'absolute', top: `${top}%`, left: '36%', width: '28%', height: '2px',
          background: 'rgba(255,255,255,0.6)', pointerEvents: 'none',
        }} />
      ))}
      <div style={{
        position: 'absolute', top: '10%', left: '22%', width: '30%', height: '18%', borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </>
  ),

  // Bowling (cyan) — three finger holes
  5: (colors) => {
    const hs = (top: string, left: string): React.CSSProperties => ({
      position: 'absolute', top, left, width: '16%', height: '16%', borderRadius: '50%',
      background: colors.dark,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), inset 0 -1px 2px rgba(255,255,255,0.1)',
      pointerEvents: 'none',
    });
    return (
      <>
        <div style={hs('18%', '42%')} />
        <div style={hs('38%', '28%')} />
        <div style={hs('38%', '56%')} />
        <div style={{
          position: 'absolute', top: '8%', left: '18%', width: '38%', height: '25%', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(-20deg)', pointerEvents: 'none',
        }} />
      </>
    );
  },

  // Volleyball (coral) — curved panel lines
  6: (colors) => {
    const lc = `${colors.dark}88`;
    return (
      <>
        {/* Three curved panel lines at 120° intervals */}
        {[0, 120, 240].map(rot => (
          <div key={rot} style={{
            position: 'absolute', top: '-20%', left: '30%', width: '40%', height: '140%',
            borderRadius: '50%', border: `1.5px solid ${lc}`,
            borderColor: `${lc} transparent transparent transparent`,
            transform: `rotate(${rot}deg)`, pointerEvents: 'none',
          }} />
        ))}
        <div style={{
          position: 'absolute', top: '10%', left: '22%', width: '30%', height: '20%', borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </>
    );
  },
};

const sportsStyles: Record<number, (colors: MarbleColorSet, isSelected: boolean, isPreview: boolean) => React.CSSProperties> = {
  // Basketball — slightly matte
  0: (colors, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 40% 35%, ${colors.light}66 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${colors.base} 0%, ${colors.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${colors.glow}, 0 0 16px ${colors.glow}, inset 0 -2px 4px rgba(0,0,0,0.2)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.35), inset 0 -2px 4px rgba(0,0,0,0.2)`,
  }),
  // Baseball — light/white tinted
  1: (colors, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 35% 30%, white 0%, transparent 45%), radial-gradient(circle at 50% 50%, ${colors.light}ee 0%, ${colors.base}88 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${colors.glow}, 0 0 16px ${colors.glow}, inset 0 -2px 4px rgba(0,0,0,0.15)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.15)`,
  }),
  // Tennis — matte felt
  2: (colors, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 50% 50%, ${colors.light}44 0%, transparent 60%), radial-gradient(circle at 50% 50%, ${colors.base} 0%, ${colors.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 10px ${colors.glow}, 0 0 14px ${colors.glow}, inset 0 0 8px rgba(255,255,255,0.15)` : isPreview ? 'none' : `0 2px 6px rgba(0,0,0,0.3), inset 0 0 8px rgba(255,255,255,0.15)`,
  }),
  // Soccer — standard sphere
  3: (colors, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 35% 30%, ${colors.light}aa 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${colors.base} 0%, ${colors.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${colors.glow}, 0 0 16px ${colors.glow}, inset 0 -2px 4px rgba(0,0,0,0.2)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)`,
  }),
  // Football/Rugby — slightly elongated look via gradient
  4: (colors, isSelected, isPreview) => ({
    background: `radial-gradient(ellipse at 40% 35%, ${colors.light}88 0%, transparent 45%), radial-gradient(circle at 50% 50%, ${colors.base} 0%, ${colors.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${colors.glow}, 0 0 16px ${colors.glow}, inset 0 -3px 6px rgba(0,0,0,0.3)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.3)`,
  }),
  // Bowling — very glossy
  5: (colors, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 30% 25%, ${colors.light}dd 0%, transparent 40%), radial-gradient(circle at 50% 50%, ${colors.base} 0%, ${colors.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 14px ${colors.glow}, 0 0 22px ${colors.glow}, inset 0 -4px 8px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.25)` : isPreview ? 'none' : `0 4px 10px rgba(0,0,0,0.45), inset 0 -4px 8px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.25)`,
  }),
  // Volleyball — smooth sphere
  6: (colors, isSelected, isPreview) => ({
    background: `radial-gradient(circle at 35% 30%, ${colors.light}bb 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${colors.base} 0%, ${colors.dark} 100%)`,
    boxShadow: isSelected ? `0 4px 12px ${colors.glow}, 0 0 18px ${colors.glow}, inset 0 -3px 6px rgba(0,0,0,0.25)` : isPreview ? 'none' : `0 3px 8px rgba(0,0,0,0.35), inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.15)`,
  }),
};

const sportsTheme: BallTheme = {
  name: 'sports',
  label: 'Sports',
  getMarbleStyle: (colors, index, isSelected, isPreview) => {
    const styleFn = sportsStyles[index];
    if (styleFn) return styleFn(colors, isSelected, isPreview);
    return classicTheme.getMarbleStyle(colors, index, isSelected, isPreview);
  },
  getOverlays: (colors, index) => {
    const overlayFn = sportsOverlays[index];
    if (overlayFn) return overlayFn(colors);
    return classicTheme.getOverlays(colors, index);
  },
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
