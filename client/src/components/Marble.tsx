/*
 * Marble Component — Glass marble rendering
 * 
 * Clearing animation: Balloon-pop burst effect
 * - Marble inflates slightly then bursts
 * - Colored confetti/shards fly outward
 * - Quick flash at center
 * - Satisfying "pop" feel
 */

import { type MarbleColor } from '@/hooks/useGameEngine';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

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

function getMarbleStyle(style: typeof MARBLE_STYLES.red, isSelected: boolean, isPreview: boolean): React.CSSProperties {
  const marbleSize = isPreview ? '40%' : '75%';
  return {
    width: marbleSize,
    height: marbleSize,
    borderRadius: '50%',
    position: 'relative' as const,
    background: `
      radial-gradient(circle at 35% 30%, ${style.light}cc 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, ${style.base} 0%, ${style.dark} 100%)
    `,
    boxShadow: isSelected
      ? `0 4px 12px ${style.glow}, 0 0 20px ${style.glow}, inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`
      : isPreview
        ? 'none'
        : `0 3px 8px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`,
    opacity: isPreview ? 0.45 : 1,
  };
}

const highlightStyle: React.CSSProperties = {
  position: 'absolute',
  top: '12%',
  left: '25%',
  width: '35%',
  height: '25%',
  borderRadius: '50%',
  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)',
  transform: 'rotate(-20deg)',
  pointerEvents: 'none',
};

// Generate random confetti shard angles and distances
const SHARD_COUNT = 10;
const SHARD_ANGLES = Array.from({ length: SHARD_COUNT }, (_, i) => {
  const base = (360 / SHARD_COUNT) * i;
  return base + (Math.random() - 0.5) * 30;
});
const SHARD_DISTANCES = Array.from({ length: SHARD_COUNT }, () => 18 + Math.random() * 16);
const SHARD_SIZES = Array.from({ length: SHARD_COUNT }, () => 2 + Math.random() * 4);
const SHARD_ROTATIONS = Array.from({ length: SHARD_COUNT }, () => Math.random() * 360);

const Marble = memo(function Marble({ color, isSelected = false, isPreview = false, isNew = false, isClearing = false }: MarbleProps) {
  const style = MARBLE_STYLES[color];
  const marbleStyle = getMarbleStyle(style, isSelected, isPreview);

  // Balloon-pop clearing animation
  if (isClearing) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: '75%', height: '75%' }}>
        {/* Main marble: inflate then burst */}
        <motion.div
          style={{
            ...marbleStyle,
            width: '100%',
            height: '100%',
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: [1, 1.3, 0],
            opacity: [1, 1, 0],
            borderRadius: ['50%', '45%', '50%'],
          }}
          transition={{
            duration: 0.35,
            times: [0, 0.4, 1],
            ease: [0.2, 0, 0.3, 1],
          }}
        >
          <div style={highlightStyle} />
        </motion.div>

        {/* Pop flash — bright white burst at the moment of pop */}
        <motion.div
          style={{
            position: 'absolute',
            width: '140%',
            height: '140%',
            borderRadius: '50%',
            background: `radial-gradient(circle, white 0%, ${style.light} 30%, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1.6], opacity: [0, 0.9, 0] }}
          transition={{
            duration: 0.3,
            times: [0, 0.3, 1],
            delay: 0.12,
            ease: 'easeOut',
          }}
        />

        {/* Confetti shards — irregular pieces flying outward */}
        {SHARD_ANGLES.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const dist = SHARD_DISTANCES[i];
          const size = SHARD_SIZES[i];
          const isLight = i % 3 === 0;
          const isDark = i % 3 === 2;
          const shardColor = isLight ? style.light : isDark ? style.dark : style.base;

          return (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: size,
                height: size * (0.6 + Math.random() * 0.8),
                backgroundColor: shardColor,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                boxShadow: `0 0 3px ${style.glow}`,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              animate={{
                x: Math.cos(rad) * dist,
                y: Math.sin(rad) * dist + 8, // slight gravity
                opacity: 0,
                scale: 0.3,
                rotate: SHARD_ROTATIONS[i],
              }}
              transition={{
                duration: 0.45,
                delay: 0.12 + Math.random() * 0.05,
                ease: [0.2, 0, 0.3, 1],
              }}
            />
          );
        })}

        {/* Expanding ring — like a balloon's pressure wave */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `2px solid ${style.base}`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 2.5, opacity: [0, 0.6, 0] }}
          transition={{
            duration: 0.4,
            delay: 0.12,
            ease: 'easeOut',
          }}
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
        <div style={highlightStyle} />
      </motion.div>
    );
  }

  if (isSelected) {
    return (
      <motion.div
        style={marbleStyle}
        animate={{
          y: [0, -5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div style={highlightStyle} />
      </motion.div>
    );
  }

  if (isPreview) {
    return (
      <motion.div
        style={marbleStyle}
        animate={{
          opacity: [0.3, 0.55, 0.3],
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div style={highlightStyle} />
      </motion.div>
    );
  }

  return (
    <div style={marbleStyle}>
      <div style={highlightStyle} />
    </div>
  );
});

export default Marble;
