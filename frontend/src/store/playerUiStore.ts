// Ścieżka: src/store/playerUiStore.js
// Wspólny stan interfejsu Odtwarzacza i Konsoli - używany zarówno przez okna,
// jak i przez mobilny pasek kroków (MobileStepBar), aby oba widoki były zsynchronizowane.
import { create } from 'zustand';

export const CONSOLE_LANGUAGES = ['cpp', 'python', 'java', 'c', 'javascript', 'csharp', 'assembler', 'pseudo'];

interface PlayerUiState {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  consoleTab: string;
  setConsoleTab: (consoleTab: string) => void;
}

export const usePlayerUi = create<PlayerUiState>()((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  consoleTab: 'cpp',
  setConsoleTab: (consoleTab) => set({ consoleTab }),
}));
