/*
 * Lines — Home Page
 * Integrates: game engine, board theme, sound engine, mute toggle, theme selector
 * 
 * Sounds simplified: select (pick marble), drop (place marble), lineClear (Switch click)
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
import ThemeSelector from '@/components/ThemeSelector';
import MuteButton from '@/components/MuteButton';
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

    // Line clear sound — Nintendo Switch click
    if (gameState.clearingCells.length > 0 && prev.clearingCells.length === 0) {
      sound.playLineClear();
    }
  }, [gameState, sound]);

  // Wrapped handlers that play sounds
  const handleCellClick = useCallback((row: number, col: number) => {
    const cell = gameState.board[row][col];
    if (cell.marble && !(gameState.selectedPos?.row === row && gameState.selectedPos?.col === col)) {
      // Selecting a marble
      sound.playSelect();
    } else if (!cell.marble && gameState.selectedPos) {
      // Dropping a marble (attempting move)
      sound.playDrop();
    }
    selectCell(row, col);
  }, [gameState.board, gameState.selectedPos, selectCell, sound]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleNewGame = useCallback(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overscrollBehavior = '';
      document.body.style.overflow = '';
    };
  }, []);

  const isImagePageBg = theme.pageBg.includes('url(');

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
        <header className="py-2 sm:py-4 lg:py-6 text-center flex-shrink-0 relative">
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

          {/* Theme selector + Mute — top right on desktop, below title on mobile */}
          <div className="flex items-center justify-center gap-3 mt-2 sm:mt-3 lg:absolute lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:mt-0">
            <ThemeSelector />
            <MuteButton muted={sound.muted} onToggle={sound.toggleMute} color={theme.headerText} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8 flex justify-center">
          <div className="w-full max-w-5xl">

            {/* ===== DESKTOP LAYOUT (lg+) ===== */}
            <div className="hidden lg:flex gap-6 items-start justify-center">
              {/* Left side panel */}
              <div className="flex flex-col gap-4 w-56 flex-shrink-0">
                <ScorePanel
                  score={gameState.score}
                  highScore={gameState.highScore}
                />
                <GameControls
                  canUndo={gameState.canUndo}
                  onUndo={handleUndo}
                  onNewGame={handleNewGame}
                />
                <HowToPlay />
              </div>

              {/* Game Board */}
              <div className="flex-shrink-0" style={{ width: '500px' }}>
                <GameBoard
                  gameState={gameState}
                  onCellClick={handleCellClick}
                />
              </div>
            </div>

            {/* ===== MOBILE / TABLET LAYOUT (<lg) ===== */}
            <div className="lg:hidden flex flex-col items-center gap-2 sm:gap-3">
              {/* Score row */}
              <div className="w-full flex gap-2 sm:gap-3" style={{ maxWidth: 'min(100%, 420px)' }}>
                <div className="flex-1">
                  <ScorePanel
                    score={gameState.score}
                    highScore={gameState.highScore}
                  />
                </div>
              </div>

              {/* Game Board */}
              <div className="w-full" style={{ maxWidth: 'min(100%, 420px)' }}>
                <GameBoard
                  gameState={gameState}
                  onCellClick={handleCellClick}
                />
              </div>

              {/* Controls below board */}
              <div className="w-full" style={{ maxWidth: 'min(100%, 420px)' }}>
                <GameControls
                  canUndo={gameState.canUndo}
                  onUndo={handleUndo}
                  onNewGame={handleNewGame}
                />
              </div>

              {/* How to Play */}
              <div className="w-full" style={{ maxWidth: 'min(100%, 420px)' }}>
                <HowToPlay />
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
