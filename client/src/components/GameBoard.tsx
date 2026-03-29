/*
 * GameBoard Component — Themed 9x9 grid
 * Uses BoardThemeContext for all visual styling
 * Performance: memoized with Set-based position lookups
 */

import { type GameState, type Position } from '@/hooks/useGameEngine';
import { useBoardTheme, type BoardTheme } from '@/contexts/BoardThemeContext';
import Marble from './Marble';
import { memo, useMemo, useCallback } from 'react';

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
}

function posSetFrom(positions: Position[]): Set<string> {
  const s = new Set<string>();
  for (const p of positions) s.add(`${p.row},${p.col}`);
  return s;
}

interface CellButtonProps {
  row: number;
  col: number;
  marble: string | null;
  preview: string | null;
  isSelected: boolean;
  isClearing: boolean;
  isNewMarble: boolean;
  onCellClick: (row: number, col: number) => void;
  theme: BoardTheme;
}

const CellButton = memo(function CellButton({
  row, col, marble, preview, isSelected, isClearing, isNewMarble, onCellClick, theme,
}: CellButtonProps) {
  const handleClick = useCallback(() => onCellClick(row, col), [onCellClick, row, col]);

  return (
    <button
      onClick={handleClick}
      className="aspect-square flex items-center justify-center relative"
      style={{
        backgroundColor: isSelected ? theme.cellSelectedBg : theme.cellBg,
        boxShadow: isSelected ? theme.cellSelectedShadow : theme.cellShadow,
        transition: 'background-color 0.15s',
      }}
      aria-label={`Cell ${row},${col}${marble ? ` - ${marble} marble` : ''}${preview ? ` - ${preview} preview` : ''}`}
    >
      {marble && (
        <Marble
          color={marble as any}
          isSelected={isSelected}
          isClearing={isClearing}
          isNew={isNewMarble}
        />
      )}
      {!marble && preview && (
        <Marble
          color={preview as any}
          isPreview
        />
      )}
    </button>
  );
});

const GameBoard = memo(function GameBoard({ gameState, onCellClick }: GameBoardProps) {
  const { board, selectedPos, clearingCells, newMarbles } = gameState;
  const { theme } = useBoardTheme();

  const clearingSet = useMemo(() => posSetFrom(clearingCells), [clearingCells]);
  const newMarbleSet = useMemo(() => posSetFrom(newMarbles), [newMarbles]);

  const isImageBg = theme.boardFrameBg.includes('url(');

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        ...(isImageBg
          ? { backgroundImage: theme.boardFrameBg, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: theme.boardFrameBg }),
        padding: 'clamp(6px, 1.5vw, 10px)',
        boxShadow: theme.boardFrameShadow,
        border: theme.boardFrameBorder,
      }}
    >
      <div
        className="rounded-lg overflow-hidden"
        style={{
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4), inset 0 -1px 4px rgba(0,0,0,0.2)',
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(9, 1fr)',
            gap: '1px',
            backgroundColor: theme.boardGridBg,
            padding: '1px',
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              return (
                <CellButton
                  key={key}
                  row={r}
                  col={c}
                  marble={cell.marble}
                  preview={cell.preview}
                  isSelected={selectedPos?.row === r && selectedPos?.col === c}
                  isClearing={clearingSet.has(key)}
                  isNewMarble={newMarbleSet.has(key)}
                  onCellClick={onCellClick}
                  theme={theme}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

export default GameBoard;
