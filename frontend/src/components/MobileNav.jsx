// Ścieżka: src/components/MobileNav.jsx
// Dolny pasek nawigacji widoczny tylko na smartfonach - przełącza panele systemu.
import clsx from 'clsx';
import { Play, BookOpen, Cpu, TerminalSquare, Wrench, PlusCircle, Info } from 'lucide-react';
import { useMobileLayout } from '../store/mobileLayoutStore';
import { trackEvent } from '../services/analytics';

const TABS = [
  { id: 'player',  label: 'Odtwórz',    Icon: Play,           color: 'text-green-400' },
  { id: 'guide',   label: 'Narracja', Icon: BookOpen,       color: 'text-blue-400' },
  { id: 'ram',     label: 'RAM',        Icon: Cpu,            color: 'text-green-400' },
  { id: 'console', label: 'Kod',        Icon: TerminalSquare, color: 'text-orange-400' },
  { id: 'builder', label: 'Kreator',    Icon: Wrench,         color: 'text-blue-400' },
  { id: 'scene',   label: 'Scena',      Icon: PlusCircle,     color: 'text-purple-400' },
  { id: 'opis',    label: 'Opis',       Icon: Info,           color: 'text-indigo-400' },
];

export const MobileNav = () => {
  const activePanel = useMobileLayout(s => s.activePanel);
  const sheet = useMobileLayout(s => s.sheet);
  const toggleFromNav = useMobileLayout(s => s.toggleFromNav);

  return (
    <nav className="mobile-nav tutorial-mobile-nav fixed left-0 right-0 bottom-0 z-[210] bg-gray-950/95 backdrop-blur-md border-t border-gray-800 flex" aria-label="Panele systemu">
      {TABS.map(({ id, label, Icon, color }) => {
        const isActive = activePanel === id && sheet !== 'closed';
        return (
          <button
            key={id}
            onClick={() => {
              trackEvent('ui', 'mobile_panel_toggle', id);
              toggleFromNav(id);
            }}
            aria-pressed={isActive}
            className={clsx(
              "mobile-nav-btn flex-1 min-w-0 flex flex-col items-center justify-center gap-1 transition-colors",
              isActive ? "bg-gray-900 text-white" : "text-gray-500"
            )}
          >
            <Icon size={18} className={isActive ? color : undefined} />
            <span className="text-[10px] leading-none font-semibold truncate max-w-full px-0.5">{label}</span>
            <span className={clsx("h-0.5 w-6 rounded-full", isActive ? "bg-blue-500" : "bg-transparent")} />
          </button>
        );
      })}
    </nav>
  );
};
