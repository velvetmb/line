/*
 * GameControls Component — Themed control panel
 * Undo and New Game buttons styled by current board theme
 */

import { memo } from 'react';
import { Undo2, RotateCcw } from 'lucide-react';
import { useBoardTheme } from '@/contexts/BoardThemeContext';

interface GameControlsProps {
  canUndo: boolean;
  onUndo: () => void;
  onNewGame: () => void;
}

const GameControls = memo(function GameControls({ canUndo, onUndo, onNewGame }: GameControlsProps) {
  const { theme } = useBoardTheme();
  const isImageBg = theme.panelBg.includes('url(');

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        ...(isImageBg
          ? { backgroundImage: theme.panelBg, backgroundSize: 'cover', backgroundPosition: 'bottom center' }
          : { background: theme.panelBg }),
        boxShadow: theme.panelShadow,
        border: theme.panelBorder,
      }}
    >
      <div className="p-3 sm:p-4 flex flex-row lg:flex-col gap-2 sm:gap-2.5">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 lg:w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-lg font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: canUndo ? theme.btnPrimaryBg : theme.btnDisabledBg,
            color: canUndo ? theme.btnPrimaryText : theme.btnDisabledText,
            boxShadow: canUndo
              ? '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
              : 'none',
            cursor: canUndo ? 'pointer' : 'not-allowed',
          }}
        >
          <Undo2 size={15} />
          <span className="hidden sm:inline">Undo Move</span>
          <span className="sm:hidden">Undo</span>
        </button>

        {/* New Game Button */}
        <button
          onClick={onNewGame}
          className="flex-1 lg:w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-lg font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 hover:brightness-110"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: theme.btnAccentBg,
            color: theme.btnAccentText,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <RotateCcw size={15} />
          New Game
        </button>
      </div>
    </div>
  );
});

export default GameControls;
