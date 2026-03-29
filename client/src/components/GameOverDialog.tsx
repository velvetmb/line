/*
 * GameOverDialog Component — Themed game over overlay
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useBoardTheme } from '@/contexts/BoardThemeContext';

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onNewGame: () => void;
}

export default function GameOverDialog({ isOpen, score, highScore, isNewHighScore, onNewGame }: GameOverDialogProps) {
  const { theme } = useBoardTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full mx-4"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              background: theme.dialogBg,
              border: theme.dialogBorder,
            }}
          >
            <div className="p-8 text-center space-y-6">
              <div>
                <h2
                  className="text-3xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: theme.dialogText }}
                >
                  Game Over
                </h2>
                {isNewHighScore && (
                  <motion.div
                    className="text-sm font-semibold uppercase tracking-widest"
                    style={{ color: theme.dialogAccent }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    New High Score!
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <div
                    className="text-xs uppercase tracking-widest"
                    style={{ color: theme.dialogMuted }}
                  >
                    Final Score
                  </div>
                  <div
                    className="text-5xl font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: theme.dialogText }}
                  >
                    {score.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs uppercase tracking-widest"
                    style={{ color: theme.dialogMuted }}
                  >
                    Best Score
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: theme.dialogMuted }}
                  >
                    {highScore.toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={onNewGame}
                className="w-full py-3 px-6 rounded-lg font-semibold text-base uppercase tracking-wider transition-all duration-200 hover:opacity-90"
                style={{
                  fontFamily: 'var(--font-body)',
                  backgroundColor: theme.dialogAccent,
                  color: theme.panelTextPrimary,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                Play Again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
