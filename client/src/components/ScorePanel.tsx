/*
 * ScorePanel Component — Themed score display
 * Shows score and high score, styled by current board theme
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoardTheme } from '@/contexts/BoardThemeContext';

interface ScorePanelProps {
  score: number;
  highScore: number;
}

const ScorePanel = memo(function ScorePanel({ score, highScore }: ScorePanelProps) {
  const { theme } = useBoardTheme();
  const isImageBg = theme.panelBg.includes('url(');

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        ...(isImageBg
          ? { backgroundImage: theme.panelBg, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: theme.panelBg }),
        boxShadow: theme.panelShadow,
        border: theme.panelBorder,
      }}
    >
      <div className="p-3 sm:p-5" style={{ color: theme.panelTextPrimary }}>
        <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-3 lg:gap-4">
          {/* Score */}
          <div className="text-center flex-1">
            <div
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-body)', color: theme.panelTextMuted }}
            >
              Score
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={score}
                className="text-2xl sm:text-4xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: theme.panelTextPrimary }}
                initial={{ scale: 1.3, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {score.toLocaleString()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.panelDivider}, transparent)` }} />
          <div className="lg:hidden w-px self-stretch" style={{ background: `linear-gradient(180deg, transparent, ${theme.panelDivider}, transparent)` }} />

          {/* High Score */}
          <div className="text-center flex-1">
            <div
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-body)', color: theme.panelTextMuted }}
            >
              Best
            </div>
            <div
              className="text-xl sm:text-2xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: theme.panelTextSecondary }}
            >
              {highScore.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ScorePanel;
