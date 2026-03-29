/*
 * SettingsPanel — Collapsible settings with Board Theme, Ball Style, and Volume
 * Follows the same panel pattern as HowToPlay.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { useBoardTheme, THEMES, type BoardThemeName } from '@/contexts/BoardThemeContext';
import { useBallTheme, BALL_THEME_NAMES, BALL_THEMES, type BallThemeName } from '@/contexts/BallThemeContext';

const THEME_SWATCHES: { name: BoardThemeName; color: string; label: string }[] = [
  { name: 'walnut', color: '#5c3d2e', label: 'Walnut' },
  { name: 'oak', color: '#b8956e', label: 'Oak' },
  { name: 'cream', color: '#e8e0d4', label: 'Cream' },
  { name: 'grass', color: '#6aad6a', label: 'Grass' },
  { name: 'sky', color: '#6aacda', label: 'Sky' },
];

interface SettingsPanelProps {
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
}

export default function SettingsPanel({ muted, volume, onToggleMute, onVolumeChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme: boardTheme, themeName: boardThemeName, setTheme: setBoardTheme } = useBoardTheme();
  const { themeName: ballThemeName, setTheme: setBallTheme } = useBallTheme();
  const isImageBg = boardTheme.panelBg.includes('url(');

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg"
      style={{
        ...(isImageBg
          ? { backgroundImage: boardTheme.panelBg, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: boardTheme.panelBg }),
        border: boardTheme.panelBorder,
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 transition-colors"
        style={{ color: boardTheme.panelTextPrimary }}
      >
        <span
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-body)', color: boardTheme.panelTextMuted }}
        >
          Settings
        </span>
        {isOpen
          ? <ChevronUp size={18} color={boardTheme.panelTextMuted} />
          : <ChevronDown size={18} color={boardTheme.panelTextMuted} />
        }
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">

          {/* ── Board Theme ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ fontFamily: 'var(--font-body)', color: boardTheme.panelTextMuted }}
            >
              Board Theme
            </p>
            <div className="flex items-center gap-2">
              {THEME_SWATCHES.map(({ name, color, label }) => {
                const isActive = boardThemeName === name;
                return (
                  <button
                    key={name}
                    onClick={() => setBoardTheme(name)}
                    className="relative rounded-full transition-all duration-200"
                    style={{
                      width: 28, height: 28, backgroundColor: color,
                      boxShadow: isActive
                        ? `0 0 0 2px white, 0 0 0 4px ${color}, 0 2px 8px rgba(0,0,0,0.3)`
                        : '0 1px 4px rgba(0,0,0,0.3)',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      border: name === 'cream' ? '1px solid rgba(0,0,0,0.15)' : 'none',
                    }}
                    aria-label={`${label} board theme`}
                    title={label}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Ball Style ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ fontFamily: 'var(--font-body)', color: boardTheme.panelTextMuted }}
            >
              Ball Style
            </p>
            <div className="flex flex-wrap gap-2">
              {BALL_THEME_NAMES.map(name => {
                const bt = BALL_THEMES[name];
                const isActive = ballThemeName === name;
                return (
                  <button
                    key={name}
                    onClick={() => setBallTheme(name)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200"
                    style={{
                      fontFamily: 'var(--font-body)',
                      background: isActive ? boardTheme.btnPrimaryBg : 'rgba(128,128,128,0.15)',
                      color: isActive ? boardTheme.btnPrimaryText : boardTheme.panelTextSecondary,
                      boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                    aria-label={`${bt.label} ball style`}
                  >
                    {bt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Volume Control ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ fontFamily: 'var(--font-body)', color: boardTheme.panelTextMuted }}
            >
              Volume
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleMute}
                className="p-1 rounded transition-colors hover:bg-white/10 flex-shrink-0"
                aria-label={muted ? 'Unmute' : 'Mute'}
                style={{ color: boardTheme.panelTextSecondary }}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (muted && v > 0) onToggleMute();
                  onVolumeChange(v);
                }}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${boardTheme.btnPrimaryBg} ${muted ? 0 : volume}%, rgba(128,128,128,0.3) ${muted ? 0 : volume}%)`,
                  accentColor: boardTheme.btnPrimaryBg,
                }}
                aria-label="Volume level"
              />
              <span
                className="text-xs w-8 text-right tabular-nums"
                style={{ fontFamily: 'var(--font-body)', color: boardTheme.panelTextMuted }}
              >
                {muted ? 0 : volume}
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
