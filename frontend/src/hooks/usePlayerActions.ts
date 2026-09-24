// Ścieżka: src/hooks/usePlayerActions.js
// Akcje sterowania odtwarzaniem algorytmu (START/STOP, krok, cofnij, reset).
// Wydzielone z PlayerWindow, aby te same przyciski działały w mobilnym pasku kroków.
import { useMemoryStore } from '../store/memoryStore';
import { usePlayerUi } from '../store/playerUiStore';
import { trackEvent } from '../services/analytics';

export const usePlayerActions = () => {
  const activeAlgorithm = useMemoryStore(s => s.activeAlgorithm);
  const currentStepIndex = useMemoryStore(s => s.currentStepIndex);
  const activeNodeId = useMemoryStore(s => s.activeNodeId);
  const isLoading = useMemoryStore(s => s.isLoading);
  const isPlaying = usePlayerUi(s => s.isPlaying);
  const setIsPlaying = usePlayerUi(s => s.setIsPlaying);

  // Algorytm jest zakończony dopiero po wykonaniu OSTATNIEGO kroku (dotarcie do węzła STOP)
  const isDone = !!activeAlgorithm && (activeNodeId === 'node-stop' || currentStepIndex >= activeAlgorithm.steps.length);

  const reset = async () => {
    setIsPlaying(false);
    await useMemoryStore.getState().resetMemory();
  };

  const stepForward = () => {
    setIsPlaying(false);
    useMemoryStore.getState().nextAlgoStep();
  };

  const togglePlay = () => {
    trackEvent('player', !isPlaying ? 'playback_start' : 'playback_pause');
    setIsPlaying(!isPlaying);
  };

  // Szybki rewind: odtworzenie algorytmu od zera do poprzedniego kroku
  const stepBack = async () => {
    setIsPlaying(false);
    const store = useMemoryStore.getState();
    if (!store.activeAlgorithm || store.currentStepIndex < 0 || store.isLoading) return;

    const algo = store.activeAlgorithm;
    const targetIndex = Math.min(store.currentStepIndex, algo.steps.length) - 1;

    await store.resetMemory();
    await store.loadAlgorithm(algo);

    for (let i = 0; i <= targetIndex; i++) {
      await useMemoryStore.getState().nextAlgoStep();
      if (useMemoryStore.getState().simulationError) break;
    }
  };

  return {
    activeAlgorithm, currentStepIndex, isLoading, isPlaying, isDone,
    canReset: !isLoading && !!activeAlgorithm,
    canStepBack: !!activeAlgorithm && !isPlaying && !isLoading && currentStepIndex >= 0,
    canPlay: !!activeAlgorithm && !isLoading && !isDone,
    canStepForward: !!activeAlgorithm && !isPlaying && !isLoading && !isDone,
    reset, stepForward, stepBack, togglePlay,
  };
};
