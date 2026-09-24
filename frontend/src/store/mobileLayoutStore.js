// Ścieżka: src/store/mobileLayoutStore.js
// Stan układu mobilnego: który panel jest aktywny i jak wysoko wysunięty jest arkusz (bottom sheet).
import { create } from 'zustand';

export const MOBILE_PANELS = ['player', 'guide', 'ram', 'console', 'builder', 'scene', 'opis'];

export const useMobileLayout = create((set, get) => ({
  activePanel: 'player',
  sheet: 'half', // 'half' | 'full' | 'closed'

  // Otwiera wskazany panel (jeśli arkusz był schowany - wysuwa go do połowy)
  openPanel: (id) => set({ activePanel: id, sheet: get().sheet === 'closed' ? 'half' : get().sheet }),

  // Kliknięcie w aktywną zakładkę chowa arkusz, aby odsłonić całą wizualizację
  toggleFromNav: (id) => {
    const { activePanel, sheet } = get();
    if (activePanel === id && sheet !== 'closed') set({ sheet: 'closed' });
    else set({ activePanel: id, sheet: sheet === 'closed' ? 'half' : sheet });
  },

  setSheet: (sheet) => set({ sheet }),
  toggleFull: () => set({ sheet: get().sheet === 'full' ? 'half' : 'full' }),
}));
