/*
 * MuteButton Component — Sound toggle icon button
 * Shows speaker icon when unmuted, muted icon when muted
 */

import { memo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MuteButtonProps {
  muted: boolean;
  onToggle: () => void;
  color?: string;
}

const MuteButton = memo(function MuteButton({ muted, onToggle, color = '#f5e6c8' }: MuteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
      style={{ color }}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
});

export default MuteButton;
