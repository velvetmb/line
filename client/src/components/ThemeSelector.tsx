/*
 * ThemeSelector Component — Compact theme picker
 * Shows 5 color swatches representing each board theme
 * Current theme is highlighted with a ring
 */

import { memo } from 'react';
import { useBoardTheme, THEMES, type BoardThemeName } from '@/contexts/BoardThemeContext';

const THEME_SWATCHES: { name: BoardThemeName; color: string; label: string }[] = [
  { name: 'walnut', color: '#5c3d2e', label: 'Walnut' },
  { name: 'oak', color: '#b8956e', label: 'Oak' },
  { name: 'cream', color: '#e8e0d4', label: 'Cream' },
  { name: 'grass', color: '#6aad6a', label: 'Grass' },
  { name: 'sky', color: '#6aacda', label: 'Sky' },
];

const ThemeSelector = memo(function ThemeSelector() {
  const { themeName, setTheme } = useBoardTheme();

  return (
    <div className="flex items-center gap-2">
      {THEME_SWATCHES.map(({ name, color, label }) => {
        const isActive = themeName === name;
        return (
          <button
            key={name}
            onClick={() => setTheme(name)}
            className="relative rounded-full transition-all duration-200"
            style={{
              width: 28,
              height: 28,
              backgroundColor: color,
              boxShadow: isActive
                ? `0 0 0 2px white, 0 0 0 4px ${color}, 0 2px 8px rgba(0,0,0,0.3)`
                : '0 1px 4px rgba(0,0,0,0.3)',
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
              border: name === 'cream' ? '1px solid rgba(0,0,0,0.15)' : 'none',
            }}
            aria-label={`${label} theme`}
            title={label}
          />
        );
      })}
    </div>
  );
});

export default ThemeSelector;
