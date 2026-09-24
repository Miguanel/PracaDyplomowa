// Ścieżka: src/features/AlgoEditor/PlayerControls.tsx
// Przyciski sterowania odtwarzaniem - wspólne dla okna Odtwarzacza i mobilnego paska kroków.
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import clsx from 'clsx';
import { usePlayerActions } from '../../hooks/usePlayerActions';

interface PlayerControlsProps {
  size?: 'sm' | 'md';
}

export const PlayerControls = ({ size = 'sm' }: PlayerControlsProps) => {
  const p = usePlayerActions();
  const md = size === 'md';
  const iconBtn = clsx(
    "rounded transition-colors disabled:opacity-30 flex items-center justify-center",
    md ? "w-9 h-9 !p-0 bg-gray-800/80" : "p-1.5"
  );

  return (
    <div className={clsx("flex items-center nodrag", md ? "gap-1.5" : "gap-1.5")}>
      <button onClick={p.reset} disabled={!p.canReset} title="Resetuj System" aria-label="Resetuj" className={clsx(iconBtn, "hover:bg-gray-700 text-gray-400 hover:text-white")}>
        <RotateCcw size={md ? 16 : 12} />
      </button>

      <button onClick={p.stepBack} disabled={!p.canStepBack} title="Krok do tyłu" aria-label="Krok do tyłu" className={clsx(iconBtn, "hover:bg-gray-700 text-gray-400 hover:text-white")}>
        <SkipBack size={md ? 16 : 12} />
      </button>

      <button
        onClick={p.togglePlay}
        disabled={!p.canPlay}
        className={clsx(
          "flex items-center justify-center gap-1 rounded-full font-black tracking-wider transition-all disabled:opacity-30 border",
          md ? "h-9 !px-4 !py-0 text-[11px]" : "px-3 py-1 text-[10px]",
          p.isPlaying ? "bg-yellow-600 hover:bg-yellow-500 text-yellow-50 border-yellow-500 shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                      : "bg-green-600/90 hover:bg-green-500 text-green-50 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
        )}
      >
        {p.isPlaying ? <Pause size={md ? 12 : 10} fill="currentColor" /> : <Play size={md ? 12 : 10} fill="currentColor" />}
        {p.isPlaying ? "STOP" : "START"}
      </button>

      <button onClick={p.stepForward} disabled={!p.canStepForward} title="Krok do przodu" aria-label="Krok do przodu" className={clsx(iconBtn, "hover:bg-blue-600/30 text-blue-400 hover:text-blue-300")}>
        <SkipForward size={md ? 18 : 14} />
      </button>
    </div>
  );
};
