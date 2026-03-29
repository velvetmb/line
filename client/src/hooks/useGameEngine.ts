/*
 * Lines Game Engine Hook
 * Design: Glass Marbles on Wood — skeuomorphic, tactile board game
 * 
 * Core mechanics:
 * - 9x9 grid, 7 marble colors
 * - BFS pathfinding for movement
 * - Line detection (horizontal, vertical, diagonal) for 5+ matches
 * - 3 preview marbles shown before each turn
 * - One-time undo per move
 * - Score tracking with high score persistence
 * 
 * Key rule: When lines are cleared, NO new balls spawn that turn.
 * The existing preview positions remain unchanged for the next turn.
 * Balls only spawn when a move does NOT result in a line clear.
 */

import { useState, useCallback, useRef } from 'react';

export type MarbleColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'coral';

export interface Cell {
  marble: MarbleColor | null;
  preview: MarbleColor | null;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Cell[][];
  score: number;
  highScore: number;
  selectedPos: Position | null;
  nextColors: MarbleColor[];
  nextPositions: Position[];
  gameOver: boolean;
  canUndo: boolean;
  movePath: Position[];
  clearingCells: Position[];
  newMarbles: Position[];
}

interface UndoState {
  board: Cell[][];
  score: number;
  nextColors: MarbleColor[];
  nextPositions: Position[];
}

const BOARD_SIZE = 9;
const COLORS: MarbleColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'coral'];
const MIN_LINE = 5;
const BALLS_PER_TURN = 3;
const INITIAL_BALLS = 5;
// Animation timing — must match Marble component clearing animation duration
const CLEAR_ANIMATION_MS = 550;

function getRandomColor(): MarbleColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ marble: null, preview: null }))
  );
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map(row => row.map(cell => ({ ...cell })));
}

function getEmptyCells(board: Cell[][]): Position[] {
  const empty: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c].marble) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findPath(board: Cell[][], from: Position, to: Position): Position[] | null {
  if (from.row === to.row && from.col === to.col) return [from];
  if (board[to.row][to.col].marble) return null;

  const visited = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(false)
  );
  const parent = Array.from({ length: BOARD_SIZE }, () =>
    Array<Position | null>(BOARD_SIZE).fill(null)
  );

  const queue: Position[] = [from];
  visited[from.row][from.col] = true;

  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.row === to.row && curr.col === to.col) {
      const path: Position[] = [];
      let node: Position | null = to;
      while (node) {
        path.unshift(node);
        if (node.row === from.row && node.col === from.col) break;
        node = parent[node.row][node.col];
      }
      return path;
    }

    for (const { dr, dc } of dirs) {
      const nr = curr.row + dr;
      const nc = curr.col + dc;
      if (
        nr >= 0 && nr < BOARD_SIZE &&
        nc >= 0 && nc < BOARD_SIZE &&
        !visited[nr][nc] &&
        !board[nr][nc].marble
      ) {
        visited[nr][nc] = true;
        parent[nr][nc] = curr;
        queue.push({ row: nr, col: nc });
      }
    }
  }

  return null;
}

function findLines(board: Cell[][]): Position[] {
  const toRemove = new Set<string>();

  const directions = [
    { dr: 0, dc: 1 },  // horizontal
    { dr: 1, dc: 0 },  // vertical
    { dr: 1, dc: 1 },  // diagonal down-right
    { dr: 1, dc: -1 }, // diagonal down-left
  ];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const color = board[r][c].marble;
      if (!color) continue;

      for (const { dr, dc } of directions) {
        const line: Position[] = [{ row: r, col: c }];
        let nr = r + dr;
        let nc = c + dc;
        while (
          nr >= 0 && nr < BOARD_SIZE &&
          nc >= 0 && nc < BOARD_SIZE &&
          board[nr][nc].marble === color
        ) {
          line.push({ row: nr, col: nc });
          nr += dr;
          nc += dc;
        }

        if (line.length >= MIN_LINE) {
          for (const pos of line) {
            toRemove.add(`${pos.row},${pos.col}`);
          }
        }
      }
    }
  }

  return Array.from(toRemove).map(key => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });
}

function calculateScore(removedCount: number): number {
  if (removedCount <= 0) return 0;
  if (removedCount === 5) return 10;
  if (removedCount === 6) return 12;
  return 10 + (removedCount - 5) * (removedCount - 4);
}

function getHighScore(): number {
  try {
    return parseInt(localStorage.getItem('lines_highscore') || localStorage.getItem('lines98_highscore') || '0', 10);
  } catch {
    return 0;
  }
}

function saveHighScore(score: number) {
  try {
    localStorage.setItem('lines_highscore', score.toString());
  } catch {
    // ignore
  }
}

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>(() => initGame());
  const undoRef = useRef<UndoState | null>(null);
  const animatingRef = useRef(false);

  function initGame(): GameState {
    const board = createEmptyBoard();
    const emptyCells = shuffleArray(getEmptyCells(board));

    // Place initial balls
    for (let i = 0; i < INITIAL_BALLS && i < emptyCells.length; i++) {
      const pos = emptyCells[i];
      board[pos.row][pos.col].marble = getRandomColor();
    }

    // Check for any initial lines
    const initialLines = findLines(board);
    for (const pos of initialLines) {
      board[pos.row][pos.col].marble = null;
    }

    // Generate next preview
    const { colors: nextColors, positions: nextPositions } = generateNextPreview(board);

    // Place preview markers
    for (let i = 0; i < nextPositions.length; i++) {
      board[nextPositions[i].row][nextPositions[i].col].preview = nextColors[i];
    }

    return {
      board,
      score: initialLines.length > 0 ? calculateScore(initialLines.length) : 0,
      highScore: getHighScore(),
      selectedPos: null,
      nextColors,
      nextPositions,
      gameOver: false,
      canUndo: false,
      movePath: [],
      clearingCells: [],
      newMarbles: [],
    };
  }

  function generateNextPreview(board: Cell[][]): { colors: MarbleColor[]; positions: Position[] } {
    const emptyCells = shuffleArray(getEmptyCells(board));
    const count = Math.min(BALLS_PER_TURN, emptyCells.length);
    const colors: MarbleColor[] = [];
    const positions: Position[] = [];

    for (let i = 0; i < count; i++) {
      colors.push(getRandomColor());
      positions.push(emptyCells[i]);
    }

    return { colors, positions };
  }

  const selectCell = useCallback((row: number, col: number) => {
    if (animatingRef.current) return;

    setGameState(prev => {
      if (prev.gameOver) return prev;

      const cell = prev.board[row][col];

      // If clicking on a marble, select it
      if (cell.marble) {
        return {
          ...prev,
          selectedPos: { row, col },
          movePath: [],
        };
      }

      // If no marble selected, do nothing
      if (!prev.selectedPos) return prev;

      // Try to move the selected marble to this cell
      const path = findPath(prev.board, prev.selectedPos, { row, col });
      if (!path) return prev; // No valid path

      // Save undo state
      undoRef.current = {
        board: cloneBoard(prev.board),
        score: prev.score,
        nextColors: [...prev.nextColors],
        nextPositions: prev.nextPositions.map(p => ({ ...p })),
      };

      // Start move
      animatingRef.current = true;

      const newBoard = cloneBoard(prev.board);
      const fromPos = prev.selectedPos;
      const marbleColor = newBoard[fromPos.row][fromPos.col].marble!;

      // Move the marble
      newBoard[fromPos.row][fromPos.col].marble = null;
      newBoard[row][col].marble = marbleColor;

      // Clear preview from destination if it was a preview cell
      if (newBoard[row][col].preview) {
        newBoard[row][col].preview = null;
      }

      // Check for lines at destination
      const lines = findLines(newBoard);

      if (lines.length > 0) {
        // Lines found! Remove them and score.
        // KEY RULE: When lines clear, do NOT spawn new balls this turn.
        // Keep the existing preview positions unchanged.
        const newScore = prev.score + calculateScore(lines.length);
        const newHighScore = Math.max(newScore, prev.highScore);
        saveHighScore(newHighScore);

        // Remove matched marbles
        for (const pos of lines) {
          newBoard[pos.row][pos.col].marble = null;
        }

        // Keep existing previews — do NOT regenerate them.
        // Just make sure the preview markers are still on the board.
        // Some preview cells might have been cleared (if they were part of the line),
        // so re-apply the existing preview data to the board.
        // First clear all preview markers
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            newBoard[r][c].preview = null;
          }
        }
        // Re-apply existing previews (only if the cell is still empty)
        const keptColors: MarbleColor[] = [];
        const keptPositions: Position[] = [];
        for (let i = 0; i < prev.nextPositions.length; i++) {
          const pos = prev.nextPositions[i];
          if (!newBoard[pos.row][pos.col].marble) {
            newBoard[pos.row][pos.col].preview = prev.nextColors[i];
            keptColors.push(prev.nextColors[i]);
            keptPositions.push(pos);
          }
        }

        setTimeout(() => {
          animatingRef.current = false;
        }, CLEAR_ANIMATION_MS);

        return {
          ...prev,
          board: newBoard,
          score: newScore,
          highScore: newHighScore,
          selectedPos: null,
          nextColors: keptColors,
          nextPositions: keptPositions,
          canUndo: true,
          movePath: path,
          clearingCells: lines,
          newMarbles: [],
        };
      }

      // No lines — spawn new balls at preview positions
      // Clear old previews first
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          newBoard[r][c].preview = null;
        }
      }

      // Place the next balls at the preview positions
      const spawnedPositions: Position[] = [];
      for (let i = 0; i < prev.nextColors.length; i++) {
        const pos = prev.nextPositions[i];
        if (!newBoard[pos.row][pos.col].marble) {
          newBoard[pos.row][pos.col].marble = prev.nextColors[i];
          spawnedPositions.push(pos);
        } else {
          // Position occupied, find another empty cell
          const empty = getEmptyCells(newBoard);
          if (empty.length > 0) {
            const altPos = empty[Math.floor(Math.random() * empty.length)];
            newBoard[altPos.row][altPos.col].marble = prev.nextColors[i];
            spawnedPositions.push(altPos);
          }
        }
      }

      // Check for lines formed by new balls
      const newLines = findLines(newBoard);
      let newScore = prev.score;
      if (newLines.length > 0) {
        newScore += calculateScore(newLines.length);
        for (const pos of newLines) {
          newBoard[pos.row][pos.col].marble = null;
        }
      }

      const newHighScore = Math.max(newScore, prev.highScore);
      saveHighScore(newHighScore);

      // Check game over
      const emptyCells = getEmptyCells(newBoard);
      const isGameOver = emptyCells.length === 0;

      // Generate new previews for next turn
      let nextColors: MarbleColor[] = [];
      let nextPositions: Position[] = [];
      if (!isGameOver) {
        const preview = generateNextPreview(newBoard);
        nextColors = preview.colors;
        nextPositions = preview.positions;
        for (let i = 0; i < nextPositions.length; i++) {
          newBoard[nextPositions[i].row][nextPositions[i].col].preview = nextColors[i];
        }
      }

      setTimeout(() => {
        animatingRef.current = false;
      }, 300);

      return {
        ...prev,
        board: newBoard,
        score: newScore,
        highScore: newHighScore,
        selectedPos: null,
        nextColors,
        nextPositions,
        gameOver: isGameOver,
        canUndo: true,
        movePath: path,
        clearingCells: newLines.length > 0 ? newLines : [],
        newMarbles: spawnedPositions,
      };
    });
  }, []);

  const undo = useCallback(() => {
    if (!undoRef.current || animatingRef.current) return;

    setGameState(prev => {
      if (!prev.canUndo || !undoRef.current) return prev;

      const saved = undoRef.current;
      undoRef.current = null;

      return {
        ...prev,
        board: saved.board,
        score: saved.score,
        selectedPos: null,
        nextColors: saved.nextColors,
        nextPositions: saved.nextPositions,
        gameOver: false,
        canUndo: false,
        movePath: [],
        clearingCells: [],
        newMarbles: [],
      };
    });
  }, []);

  const newGame = useCallback(() => {
    animatingRef.current = false;
    undoRef.current = null;
    setGameState(initGame());
  }, []);

  return {
    gameState,
    selectCell,
    undo,
    newGame,
  };
}
