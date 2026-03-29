/*
 * Board Theme Context — 5 visual themes for the game board
 * Walnut (default), Oak, Cream, Grass, Sky
 * 
 * Each theme defines: page background, board frame, cell colors,
 * grid line color, panel styling, text colors, overlay tint
 * Marble colors remain the same across all themes.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type BoardThemeName = 'walnut' | 'oak' | 'cream' | 'grass' | 'sky';

export interface BoardTheme {
  name: BoardThemeName;
  label: string;
  // Page background
  pageBg: string; // CSS background value (gradient or solid)
  pageOverlay: string; // overlay on top of page bg
  // Board
  boardFrameBg: string; // board outer frame background
  boardFrameBorder: string;
  boardFrameShadow: string;
  boardGridBg: string; // grid line color
  cellBg: string; // normal cell
  cellSelectedBg: string; // selected cell
  cellSelectedShadow: string;
  cellShadow: string;
  // Panels (score, controls, how-to-play)
  panelBg: string; // CSS background
  panelBorder: string;
  panelShadow: string;
  panelTextPrimary: string;
  panelTextSecondary: string;
  panelTextMuted: string;
  panelDivider: string;
  // Buttons
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnDisabledBg: string;
  btnDisabledText: string;
  btnAccentBg: string;
  btnAccentText: string;
  // Header
  headerText: string;
  headerSubtext: string;
  // Game over dialog
  dialogBg: string;
  dialogBorder: string;
  dialogText: string;
  dialogMuted: string;
  dialogAccent: string;
}

const WALNUT_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663320319140/n6MWLjWg8pGpnuJWjMRfmd/wood-table-bg-5uxoKjqushNKZXf2tBVAtW.webp';
const PARCHMENT_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663320319140/n6MWLjWg8pGpnuJWjMRfmd/parchment-texture-F5QXeNM2WWkUy3GwBto9iz.webp';

export const THEMES: Record<BoardThemeName, BoardTheme> = {
  walnut: {
    name: 'walnut',
    label: 'Walnut',
    pageBg: `url(${WALNUT_BG})`,
    pageOverlay: 'rgba(0,0,0,0.3)',
    boardFrameBg: `url(${WALNUT_BG})`,
    boardFrameBorder: '2px solid rgba(139, 105, 20, 0.4)',
    boardFrameShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    boardGridBg: 'rgba(30, 18, 10, 0.7)',
    cellBg: 'rgba(92, 61, 46, 0.65)',
    cellSelectedBg: 'rgba(196, 162, 101, 0.4)',
    cellSelectedShadow: 'inset 0 0 12px rgba(196, 162, 101, 0.3), inset 0 1px 3px rgba(0,0,0,0.2)',
    cellShadow: 'inset 0 1px 3px rgba(0,0,0,0.25), inset 0 -1px 1px rgba(255,255,255,0.04)',
    panelBg: `url(${PARCHMENT_BG})`,
    panelBorder: '1px solid rgba(139, 105, 20, 0.25)',
    panelShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
    panelTextPrimary: '#3d2b1f',
    panelTextSecondary: '#5c3d2e',
    panelTextMuted: '#7a5c3e',
    panelDivider: 'rgba(122, 92, 62, 0.3)',
    btnPrimaryBg: 'rgba(92, 61, 46, 0.85)',
    btnPrimaryText: '#f5e6c8',
    btnDisabledBg: 'rgba(92, 61, 46, 0.25)',
    btnDisabledText: 'rgba(122, 92, 62, 0.4)',
    btnAccentBg: 'rgba(139, 105, 20, 0.85)',
    btnAccentText: '#f5e6c8',
    headerText: '#f5e6c8',
    headerSubtext: 'rgba(245, 230, 200, 0.6)',
    dialogBg: 'linear-gradient(135deg, #5c3d2e 0%, #3d2b1f 100%)',
    dialogBorder: '2px solid rgba(196, 162, 101, 0.4)',
    dialogText: '#f5e6c8',
    dialogMuted: 'rgba(245, 230, 200, 0.6)',
    dialogAccent: '#eab308',
  },
  oak: {
    name: 'oak',
    label: 'Oak',
    pageBg: 'linear-gradient(145deg, #c4a882 0%, #a08060 30%, #8b6e50 70%, #7a5e42 100%)',
    pageOverlay: 'rgba(0,0,0,0.08)',
    boardFrameBg: 'linear-gradient(135deg, #b8956e 0%, #9a7a58 100%)',
    boardFrameBorder: '2px solid rgba(180, 150, 100, 0.5)',
    boardFrameShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
    boardGridBg: 'rgba(80, 55, 35, 0.6)',
    cellBg: 'rgba(160, 130, 90, 0.55)',
    cellSelectedBg: 'rgba(220, 195, 150, 0.5)',
    cellSelectedShadow: 'inset 0 0 12px rgba(220, 195, 150, 0.3), inset 0 1px 3px rgba(0,0,0,0.15)',
    cellShadow: 'inset 0 1px 3px rgba(0,0,0,0.2), inset 0 -1px 1px rgba(255,255,255,0.06)',
    panelBg: 'linear-gradient(135deg, #e8d5be 0%, #d4c0a5 100%)',
    panelBorder: '1px solid rgba(180, 150, 100, 0.3)',
    panelShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
    panelTextPrimary: '#4a3520',
    panelTextSecondary: '#6b5030',
    panelTextMuted: '#8a7050',
    panelDivider: 'rgba(140, 110, 70, 0.3)',
    btnPrimaryBg: 'rgba(100, 75, 50, 0.8)',
    btnPrimaryText: '#f0e0c8',
    btnDisabledBg: 'rgba(100, 75, 50, 0.2)',
    btnDisabledText: 'rgba(140, 110, 70, 0.4)',
    btnAccentBg: 'rgba(160, 120, 60, 0.85)',
    btnAccentText: '#f0e0c8',
    headerText: '#f5edd8',
    headerSubtext: 'rgba(245, 237, 216, 0.65)',
    dialogBg: 'linear-gradient(135deg, #8b6e50 0%, #6b5030 100%)',
    dialogBorder: '2px solid rgba(200, 170, 120, 0.4)',
    dialogText: '#f5edd8',
    dialogMuted: 'rgba(245, 237, 216, 0.6)',
    dialogAccent: '#d4a843',
  },
  cream: {
    name: 'cream',
    label: 'Cream',
    pageBg: 'linear-gradient(145deg, #f5f0e8 0%, #e8e0d4 30%, #ddd5c8 70%, #d0c8b8 100%)',
    pageOverlay: 'rgba(0,0,0,0)',
    boardFrameBg: 'linear-gradient(135deg, #c8bfb0 0%, #b5aa98 100%)',
    boardFrameBorder: '2px solid rgba(180, 170, 150, 0.5)',
    boardFrameShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
    boardGridBg: 'rgba(160, 148, 130, 0.5)',
    cellBg: 'rgba(230, 222, 210, 0.8)',
    cellSelectedBg: 'rgba(200, 185, 160, 0.6)',
    cellSelectedShadow: 'inset 0 0 12px rgba(200, 185, 160, 0.4), inset 0 1px 3px rgba(0,0,0,0.1)',
    cellShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), inset 0 -1px 1px rgba(255,255,255,0.3)',
    panelBg: 'linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)',
    panelBorder: '1px solid rgba(180, 170, 150, 0.3)',
    panelShadow: '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
    panelTextPrimary: '#3a3530',
    panelTextSecondary: '#5a5248',
    panelTextMuted: '#8a8070',
    panelDivider: 'rgba(160, 148, 130, 0.3)',
    btnPrimaryBg: 'rgba(90, 82, 72, 0.75)',
    btnPrimaryText: '#f5f0e8',
    btnDisabledBg: 'rgba(90, 82, 72, 0.15)',
    btnDisabledText: 'rgba(140, 130, 115, 0.4)',
    btnAccentBg: 'rgba(160, 140, 100, 0.8)',
    btnAccentText: '#f5f0e8',
    headerText: '#4a4238',
    headerSubtext: 'rgba(74, 66, 56, 0.55)',
    dialogBg: 'linear-gradient(135deg, #5a5248 0%, #3a3530 100%)',
    dialogBorder: '2px solid rgba(200, 190, 170, 0.3)',
    dialogText: '#f5f0e8',
    dialogMuted: 'rgba(245, 240, 232, 0.6)',
    dialogAccent: '#c4a265',
  },
  grass: {
    name: 'grass',
    label: 'Grass',
    pageBg: 'linear-gradient(145deg, #8bc48a 0%, #72b572 30%, #5ea35e 70%, #4d944d 100%)',
    pageOverlay: 'rgba(0,0,0,0.05)',
    boardFrameBg: 'linear-gradient(135deg, #6aad6a 0%, #559955 100%)',
    boardFrameBorder: '2px solid rgba(140, 200, 120, 0.5)',
    boardFrameShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
    boardGridBg: 'rgba(40, 70, 35, 0.45)',
    cellBg: 'rgba(90, 150, 80, 0.45)',
    cellSelectedBg: 'rgba(170, 220, 150, 0.5)',
    cellSelectedShadow: 'inset 0 0 12px rgba(170, 220, 150, 0.35), inset 0 1px 3px rgba(0,0,0,0.15)',
    cellShadow: 'inset 0 1px 3px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.08)',
    panelBg: 'linear-gradient(135deg, #f0f7ec 0%, #dcecd4 100%)',
    panelBorder: '1px solid rgba(120, 180, 100, 0.35)',
    panelShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
    panelTextPrimary: '#2a4a22',
    panelTextSecondary: '#3d6832',
    panelTextMuted: '#5a8a4f',
    panelDivider: 'rgba(90, 138, 79, 0.25)',
    btnPrimaryBg: 'rgba(60, 110, 50, 0.8)',
    btnPrimaryText: '#eaf5e0',
    btnDisabledBg: 'rgba(60, 110, 50, 0.18)',
    btnDisabledText: 'rgba(90, 138, 79, 0.4)',
    btnAccentBg: 'rgba(100, 165, 80, 0.85)',
    btnAccentText: '#eaf5e0',
    headerText: '#f0f7ec',
    headerSubtext: 'rgba(240, 247, 236, 0.7)',
    dialogBg: 'linear-gradient(135deg, #5a9a50 0%, #3d6832 100%)',
    dialogBorder: '2px solid rgba(170, 220, 150, 0.35)',
    dialogText: '#eaf5e0',
    dialogMuted: 'rgba(234, 245, 224, 0.65)',
    dialogAccent: '#a0d880',
  },
  sky: {
    name: 'sky',
    label: 'Sky',
    pageBg: 'linear-gradient(145deg, #8ec5e8 0%, #72b5dd 30%, #5da5d2 70%, #4a95c5 100%)',
    pageOverlay: 'rgba(0,0,0,0.03)',
    boardFrameBg: 'linear-gradient(135deg, #6aacda 0%, #5598c8 100%)',
    boardFrameBorder: '2px solid rgba(140, 200, 240, 0.5)',
    boardFrameShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18)',
    boardGridBg: 'rgba(30, 65, 100, 0.4)',
    cellBg: 'rgba(100, 160, 210, 0.4)',
    cellSelectedBg: 'rgba(170, 220, 250, 0.5)',
    cellSelectedShadow: 'inset 0 0 12px rgba(170, 220, 250, 0.35), inset 0 1px 3px rgba(0,0,0,0.12)',
    cellShadow: 'inset 0 1px 3px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.1)',
    panelBg: 'linear-gradient(135deg, #eef5fb 0%, #d8eaf5 100%)',
    panelBorder: '1px solid rgba(120, 190, 240, 0.3)',
    panelShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
    panelTextPrimary: '#1e4060',
    panelTextSecondary: '#2d6090',
    panelTextMuted: '#5090b8',
    panelDivider: 'rgba(80, 144, 184, 0.25)',
    btnPrimaryBg: 'rgba(50, 100, 150, 0.8)',
    btnPrimaryText: '#e8f2fa',
    btnDisabledBg: 'rgba(50, 100, 150, 0.18)',
    btnDisabledText: 'rgba(80, 144, 184, 0.4)',
    btnAccentBg: 'rgba(90, 165, 220, 0.85)',
    btnAccentText: '#e8f2fa',
    headerText: '#f0f7fc',
    headerSubtext: 'rgba(240, 247, 252, 0.7)',
    dialogBg: 'linear-gradient(135deg, #5a9ec8 0%, #2d6090 100%)',
    dialogBorder: '2px solid rgba(170, 220, 250, 0.35)',
    dialogText: '#e8f2fa',
    dialogMuted: 'rgba(232, 242, 250, 0.65)',
    dialogAccent: '#80ccf0',
  },
};

interface BoardThemeContextValue {
  theme: BoardTheme;
  themeName: BoardThemeName;
  setTheme: (name: BoardThemeName) => void;
}

const BoardThemeContext = createContext<BoardThemeContextValue>({
  theme: THEMES.walnut,
  themeName: 'walnut',
  setTheme: () => {},
});

export function BoardThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<BoardThemeName>(() => {
    try {
      const saved = localStorage.getItem('lines_theme') as BoardThemeName;
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return 'walnut';
  });

  const setTheme = useCallback((name: BoardThemeName) => {
    setThemeName(name);
    try { localStorage.setItem('lines_theme', name); } catch {}
  }, []);

  return (
    <BoardThemeContext.Provider value={{ theme: THEMES[themeName], themeName, setTheme }}>
      {children}
    </BoardThemeContext.Provider>
  );
}

export function useBoardTheme() {
  return useContext(BoardThemeContext);
}
