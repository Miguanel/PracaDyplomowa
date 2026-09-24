// Ścieżka: src/store/mobileLayoutStore.js
// Stan układu mobilnego:
//  - strips: które panele są widoczne jako kompaktowe paski (kroki u góry, RAM na dole),
//  - activePanel + sheet: który panel jest otwarty w pełnym widoku (arkusz) i jak wysoko.
import { create } from 'zustand';

// Panele, które na telefonie mają postać paska z bieżącym krokiem
export const STRIP_PANELS = ['player', 'guide', 'console', 'ram'] as const;
export type StripPanel = typeof STRIP_PANELS[number];
export type SheetState = 'half' | 'full' | 'closed';

const isStripPanel = (id: string): id is StripPanel => (STRIP_PANELS as readonly string[]).includes(id);

interface MobileLayoutState {
  strips: Record<StripPanel, boolean>;
  activePanel: string;
  sheet: SheetState;
  toggleStrip: (id: StripPanel) => void;
  openPanel: (id: string) => void;
  toggleFromRail: (id: string) => void;
  setSheet: (sheet: SheetState) => void;
  toggleFull: () => void;
}

export const useMobileLayout = create<MobileLayoutState>()((set, get) => ({
  strips: { player: true, guide: true, console: true, ram: true },

  activePanel: 'player',
  sheet: 'closed',

  toggleStrip: (id) => set({ strips: { ...get().strips, [id]: !get().strips[id] } }),

  // Otwiera pełny widok panelu (jeśli arkusz był schowany - wysuwa go do połowy)
  openPanel: (id) => set({ activePanel: id, sheet: get().sheet === 'closed' ? 'half' : get().sheet }),

  // Zakładka na prawej krawędzi:
  //  - panele "krokowe" (Odtwarzacz, Narracja, Kod, RAM) włączają / wyłączają swój pasek,
  //  - pozostałe (Kreator, Scena, Opis) otwierają / zamykają pełny panel.
  toggleFromRail: (id) => {
    const { activePanel, sheet, strips } = get();
    const isOpen = activePanel === id && sheet !== 'closed';
    if (isOpen) { set({ sheet: 'closed' }); return; }
    if (isStripPanel(id)) {
      set({ strips: { ...strips, [id]: !strips[id] } });
      return;
    }
    // Kreator potrzebuje dużo miejsca - otwieramy go od razu na pełną wysokość
    set({ activePanel: id, sheet: id === 'builder' ? 'full' : (sheet === 'closed' ? 'half' : sheet) });
  },

  setSheet: (sheet) => set({ sheet }),
  toggleFull: () => set({ sheet: get().sheet === 'full' ? 'half' : 'full' }),
}));
