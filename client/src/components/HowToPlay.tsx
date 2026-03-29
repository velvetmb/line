/*
 * HowToPlay Component — Themed collapsible instructions
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useBoardTheme } from '@/contexts/BoardThemeContext';

export default function HowToPlay() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useBoardTheme();
  const isImageBg = theme.panelBg.includes('url(');

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg"
      style={{
        ...(isImageBg
          ? { backgroundImage: theme.panelBg, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: theme.panelBg }),
        border: theme.panelBorder,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 transition-colors"
        style={{ color: theme.panelTextPrimary }}
      >
        <span
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-body)', color: theme.panelTextMuted }}
        >
          How to Play
        </span>
        {isOpen
          ? <ChevronUp size={18} color={theme.panelTextMuted} />
          : <ChevronDown size={18} color={theme.panelTextMuted} />
        }
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2" style={{ color: theme.panelTextSecondary }}>
          <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            <strong>Goal:</strong> Align 5 or more marbles of the same color in a line (horizontal, vertical, or diagonal) to clear them and score points.
          </p>
          <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            <strong>Move:</strong> Click a marble to select it, then click an empty cell to move it there. A clear path must exist.
          </p>
          <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            <strong>Turns:</strong> After each move (without a match), 3 new marbles appear at the preview positions shown as small translucent marbles.
          </p>
          <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            <strong>Undo:</strong> You can undo your last move once. Use it wisely!
          </p>
          <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            <strong>Game Over:</strong> The game ends when the board is completely full.
          </p>
        </div>
      )}
    </div>
  );
}
