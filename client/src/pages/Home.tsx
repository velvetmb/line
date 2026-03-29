/*
 * Lines — Home Page
 * Integrates: game engine, board theme, ball theme, sound engine, settings panel
 *
 * Mobile-first layout:
 * - Mobile: compact header + score row, board fills width, controls below
 * - Desktop: side panel with score/controls, board centered
 */

import { useGameEngine } from '@/hooks/useGameEngine';
import { useSoundEngine } from '@/hooks/useSoundEngine';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import GameBoard from '@/components/GameBoard';
import ScorePanel from '@/components/ScorePanel';
import GameControls from '@/components/GameControls';
import GameOverDialog from '@/components/GameOverDialog';
import HowToPlay from '@/components/HowToPlay';
import SettingsPanel from '@/components/SettingsPanel';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function Home() {
  const { gameState, selectCell, undo, newGame } = useGameEngine();
  const sound = useSoundEngine();
  const { theme } = useBoardTheme();
  const [prevHighScore] = useState(() => gameState.highScore);

  const isNewHighScore = gameState.score > prevHighScore && gameState.score === gameState.highScore;

  // Track previous state for sound triggers
  const prevStateRef = useRef(gameState);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = gameState;

    if (gameState.clearingCells.length > 0 && prev.clearingCells.length === 0) {
      sound.playLineClear();
    }
  }, [gameState, sound]);

  const handleCellClick = useCallback((row: number, col: number) => {
    const cell = gameState.board[row][col];
    if (cell.marble && !(gameState.selectedPos?.row === row && gameState.selectedPos?.col === col)) {
      sound.playSelect();
    } else if (!cell.marble && gameState.selectedPos) {
      sound.playDrop();
    }
    selectCell(row, col);
  }, [gameState.board, gameState.selectedPos, selectCell, sound]);

  const handleUndo = useCallback(() => { undo(); }, [undo]);
  const handleNewGame = useCallback(() => { newGame(); }, [newGame]);

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overscrollBehavior = '';
      document.body.style.overflow = '';
    };
  }, []);

  const isImagePageBg = theme.pageBg.includes('url(');

  const settingsProps = {
    muted: sound.muted,
    volume: sound.volume,
    onToggleMute: sound.toggleMute,
    onVolumeChange: sound.setVolume,
  };

  return (
    <div
      className="min-h-[100dvh]"
      style={{
        ...(isImagePageBg
          ? { backgroundImage: theme.pageBg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
          : { background: theme.pageBg }),
      }}
    >
      {/* Overlay */}
      <div
        className="min-h-[100dvh] flex flex-col"
        style={{ backgroundColor: theme.pageOverlay }}
      >
        {/* Header */}
        <header className="py-1 sm:py-3 lg:py-6 text-center flex-shrink-0">
          <h1
            className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: theme.headerText,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            Lines
          </h1>
          <p
            className="text-xs sm:text-sm mt-0.5"
            style={{
              fontFamily: 'var(--font-body)',
              color: theme.headerSubtext,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            Classic Marble Puzzle
          </p>

        </header>

        {/* Main Content */}
        <main className="flex-1 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-8 flex justify-center">
          <div className="w-full max-w-5xl">

            {/* ===== DESKTOP LAYOUT (lg+) ===== */}
            <div className="hidden lg:flex gap-6 items-start justify-center">
              {/* Left side panel */}
              <div className="flex flex-col gap-4 w-56 flex-shrink-0">
                <ScorePanel score={gameState.score} highScore={gameState.highScore} />
                <GameControls canUndo={gameState.canUndo} onUndo={handleUndo} onNewGame={handleNewGame} />
                <HowToPlay />
                <SettingsPanel {...settingsProps} />
              </div>

              {/* Game Board */}
              <div className="flex-shrink-0" style={{ width: '500px' }}>
                <GameBoard gameState={gameState} onCellClick={handleCellClick} />
              </div>
            </div>

            {/* ===== MOBILE / TABLET LAYOUT (<lg) ===== */}
            <div className="lg:hidden flex flex-col items-center gap-1.5 sm:gap-3">
              <div className="w-full flex gap-2 sm:gap-3" style={{ maxWidth: 'min(100%, 420px)' }}>
                <div className="flex-1">
                  <ScorePanel score={gameState.score} highScore={gameState.highScore} />
                </div>
              </div>

              <div className="w-full" style={{ maxWidth: 'min(100%, 420px)' }}>
                <GameBoard gameState={gameState} onCellClick={handleCellClick} />
              </div>

              <div className="w-full" style={{ maxWidth: 'min(100%, 420px)' }}>
                <GameControls canUndo={gameState.canUndo} onUndo={handleUndo} onNewGame={handleNewGame} />
              </div>

              <div className="w-full" style={{ maxWidth: 'min(100%, 420px)' }}>
                <HowToPlay />
              </div>

              <div className="w-full" style={{ maxWidth: 'min(100%, 420px)' }}>
                <SettingsPanel {...settingsProps} />
              </div>
            </div>
          </div>
        </main>

        {/* Game Over Dialog */}
        <GameOverDialog
          isOpen={gameState.gameOver}
          score={gameState.score}
          highScore={gameState.highScore}
          isNewHighScore={isNewHighScore}
          onNewGame={handleNewGame}
        />
      </div>
    </div>
  );
}
