// Ścieżka: src/components/MobileRail.jsx
// Pionowy pasek zakładek na prawej krawędzi ekranu (tylko smartfony).
// Odtwarzacz / Narracja / Kod / RAM - włączają kompaktowe paski z bieżącym krokiem,
// Kreator / Scena / Opis - otwierają pełny panel.
import clsx from 'clsx';
import { Play, BookOpen, Cpu, TerminalSquare, Wrench, PlusCircle, Info } from 'lucide-react';
import { useMobileLayout, STRIP_PANELS } from '../store/mobileLayoutStore';
import { trackEvent } from '../services/analytics';

const TABS = [
  { id: 'player',  label: 'Odtwórz',  Icon: Play,           color: 'text-green-400' },
  { id: 'guide',   label: 'Narracja', Icon: BookOpen,       color: 'text-blue-400' },
  { id: 'console', label: 'Kod',      Icon: TerminalSquare, color: 'text-orange-400' },
  { id: 'ram',     label: 'RAM',      Icon: Cpu,            color: 'text-green-400' },
  { id: 'builder', label: 'Kreator',  Icon: Wrench,         color: 'text-blue-400' },
  { id: 'scene',   label: 'Scena',    Icon: PlusCircle,     color: 'text-purple-400' },
  { id: 'opis',    label: 'Opis',     Icon: Info,           color: 'text-indigo-400' },
];

export const MobileRail = () => {
  const activePanel = useMobileLayout(s => s.activePanel);
  const sheet = useMobileLayout(s => s.sheet);
  const strips = useMobileLayout(s => s.strips);
  const toggleFromRail = useMobileLayout(s => s.toggleFromRail);

  return (
    <nav className="mobile-rail tutorial-mobile-rail fixed right-0 bottom-0 z-[210] bg-gray-950/95 backdrop-blur-md border-l border-gray-800 flex flex-col" aria-label="Panele systemu">
      {TABS.map(({ id, label, Icon, color }, i) => {
        const isSheetOpen = activePanel === id && sheet !== 'closed';
        const isStrip = (STRIP_PANELS as readonly string[]).includes(id);
        const isStripOn = isStrip && strips[id as keyof typeof strips];
        const isActive = isSheetOpen || isStripOn;
        return (
          <button
            key={id}
            onClick={() => {
              trackEvent('ui', 'mobile_rail_toggle', id);
              toggleFromRail(id);
            }}
            aria-pressed={isActive}
            title={isStrip ? `${label}: pokaż / ukryj pasek` : `${label}: otwórz panel`}
            className={clsx(
              "mobile-rail-btn relative flex-1 max-h-[68px] min-h-0 w-full flex flex-col items-center justify-center gap-1 transition-colors",
              i === 4 && "border-t border-gray-800",
              isSheetOpen ? "bg-gray-800 text-white" : isActive ? "text-gray-200" : "text-gray-600"
            )}
          >
            <span className={clsx("absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-l", isActive ? "bg-blue-500" : "bg-transparent")} />
            <Icon size={18} className={isActive ? color : undefined} />
            <span className="text-[9px] leading-none font-semibold truncate max-w-full px-0.5">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
