/*
 * Marble Component — renders marbles using the active ball theme
 *
 * Clearing animation: Balloon-pop burst effect
 * - Marble inflates slightly then bursts
 * - Colored confetti/shards fly outward
 * - Quick flash at center
 * - Satisfying "pop" feel
 */

import { type MarbleColor } from '@/hooks/useGameEngine';
import { useBallTheme } from '@/contexts/BallThemeContext';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface MarbleProps {
  color: MarbleColor;
  isSelected?: boolean;
  isPreview?: boolean;
  isNew?: boolean;
  isClearing?: boolean;
}

const MARBLE_STYLES: Record<MarbleColor, { base: string; light: string; dark: string; glow: string }> = {
  red:    { base: '#dc2626', light: '#fca5a5', dark: '#7f1d1d', glow: 'rgba(220, 38, 38, 0.6)' },
  blue:   { base: '#2563eb', light: '#93c5fd', dark: '#1e3a5f', glow: 'rgba(37, 99, 235, 0.6)' },
  green:  { base: '#16a34a', light: '#86efac', dark: '#14532d', glow: 'rgba(22, 163, 74, 0.6)' },
  yellow: { base: '#eab308', light: '#fef08a', dark: '#854d0e', glow: 'rgba(234, 179, 8, 0.6)' },
  purple: { base: '#9333ea', light: '#d8b4fe', dark: '#581c87', glow: 'rgba(147, 51, 234, 0.6)' },
  cyan:   { base: '#06b6d4', light: '#a5f3fc', dark: '#164e63', glow: 'rgba(6, 182, 212, 0.6)' },
  coral:  { base: '#f97316', light: '#fed7aa', dark: '#9a3412', glow: 'rgba(249, 115, 22, 0.6)' },
};

const COLOR_INDEX: Record<MarbleColor, number> = {
  red: 0, blue: 1, green: 2, yellow: 3, purple: 4, cyan: 5, coral: 6,
};

// Sparkle particles — pre-computed for consistent rendering
const SPARKLE_COUNT = 12;
const SPARKLE_ANGLES = Array.from({ length: SPARKLE_COUNT }, (_, i) => {
  const base = (360 / SPARKLE_COUNT) * i;
  return base + (Math.random() - 0.5) * 25;
});
const SPARKLE_DISTANCES = Array.from({ length: SPARKLE_COUNT }, () => 16 + Math.random() * 20);
const SPARKLE_SIZES = Array.from({ length: SPARKLE_COUNT }, () => 2 + Math.random() * 3.5);
const SPARKLE_DELAYS = Array.from({ length: SPARKLE_COUNT }, () => 0.06 + Math.random() * 0.08);

const Marble = memo(function Marble({ color, isSelected = false, isPreview = false, isNew = false, isClearing = false }: MarbleProps) {
  const { theme } = useBallTheme();
  const gameColors = MARBLE_STYLES[color];
  const index = COLOR_INDEX[color];
  // For effects (clearing sparkles etc.), use theme-specific colors if available
  const colors = theme.getEffectColors ? theme.getEffectColors(gameColors, index) : gameColors;

  const marbleSize = isPreview ? '40%' : '75%';
  const themeStyle = theme.getMarbleStyle(gameColors, index, isSelected, isPreview);

  const marbleStyle: React.CSSProperties = {
    width: marbleSize,
    height: marbleSize,
    borderRadius: '50%',
    position: 'relative',
    opacity: isPreview ? 0.45 : 1,
    overflow: 'hidden',
    ...themeStyle,
  };

  // Pop clearing animation — glow → inflate → burst with shockwave + sparkles
  if (isClearing) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: '75%', height: '75%' }}>
        {/* Soft glow behind marble before it pops */}
        <motion.div
          style={{
            position: 'absolute', width: '160%', height: '160%', borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1.5], opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.4, times: [0, 0.35, 1], ease: 'easeOut' }}
        />

        {/* Main marble: glow bright → inflate → pop away */}
        <motion.div
          style={{ ...marbleStyle, width: '100%', height: '100%' }}
          initial={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
          animate={{
            scale: [1, 1.15, 1.35, 0],
            opacity: [1, 1, 1, 0],
            filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1.8)', 'brightness(2)'],
          }}
          transition={{
            duration: 0.38,
            times: [0, 0.25, 0.5, 1],
            ease: [0.25, 0, 0.3, 1],
          }}
        >
          {theme.getOverlays(gameColors, index)}
        </motion.div>

        {/* White flash at the pop moment */}
        <motion.div
          style={{
            position: 'absolute', width: '120%', height: '120%', borderRadius: '50%',
            background: `radial-gradient(circle, white 0%, ${colors.light} 40%, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1.8], opacity: [0, 0.95, 0] }}
          transition={{ duration: 0.25, times: [0, 0.35, 1], delay: 0.18, ease: 'easeOut' }}
        />

        {/* Shockwave ring — expands outward from the pop */}
        <motion.div
          style={{
            position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
            border: `2.5px solid ${colors.base}`,
            boxShadow: `0 0 6px ${colors.glow}`,
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 2.2, 3], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.4, times: [0, 0.5, 1], delay: 0.18, ease: 'easeOut' }}
        />

        {/* Second softer ring — slight delay for layered effect */}
        <motion.div
          style={{
            position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
            border: `1.5px solid ${colors.light}`,
          }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.8, 2.6], opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.35, times: [0, 0.5, 1], delay: 0.24, ease: 'easeOut' }}
        />

        {/* Sparkle particles — small glowing dots that fly outward */}
        {SPARKLE_ANGLES.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const dist = SPARKLE_DISTANCES[i];
          const size = SPARKLE_SIZES[i];
          const sparkleColor = i % 3 === 0 ? 'white' : i % 3 === 1 ? colors.light : colors.base;
          return (
            <motion.div
              key={i}
              style={{
                position: 'absolute', width: size, height: size,
                backgroundColor: sparkleColor, borderRadius: '50%',
                boxShadow: `0 0 ${size}px ${colors.glow}`,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos(rad) * dist,
                y: Math.sin(rad) * dist,
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: 0.4,
                times: [0, 0.3, 1],
                delay: SPARKLE_DELAYS[i],
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Color splash — faint colored ring that fades */}
        <motion.div
          style={{
            position: 'absolute', width: '200%', height: '200%', borderRadius: '50%',
            background: `radial-gradient(circle, transparent 30%, ${colors.glow} 50%, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 0.8, 1.2], opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.45, times: [0, 0.35, 1], delay: 0.15, ease: 'easeOut' }}
        />
      </div>
    );
  }

  if (isNew) {
    return (
      <motion.div
        style={marbleStyle}
        initial={{ scale: 0, y: -10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {theme.getOverlays(gameColors, index)}
      </motion.div>
    );
  }

  if (isSelected) {
    return (
      <motion.div
        style={marbleStyle}
        animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {theme.getOverlays(gameColors, index)}
      </motion.div>
    );
  }

  if (isPreview) {
    return (
      <motion.div
        style={marbleStyle}
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {theme.getOverlays(gameColors, index)}
      </motion.div>
    );
  }

  return (
    <div style={marbleStyle}>
      {theme.getOverlays(gameColors, index)}
    </div>
  );
});

export default Marble;
