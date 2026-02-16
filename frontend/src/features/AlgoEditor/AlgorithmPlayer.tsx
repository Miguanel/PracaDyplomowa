import { useEffect, useState, useRef } from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import { ALGORITHMS_DB } from '../../data/algorithms';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, ChevronRight, ListMusic } from 'lucide-react';
import clsx from 'clsx';

export const AlgorithmPlayer = () => {
  const {
    // Pobieramy stan i funkcje z globalnego magazynu
    activeAlgorithm,    // <-- To jest kluczowe dla synchronizacji z Przewodnikiem
    currentStepIndex,   // <-- Wspólny licznik kroków
    loadAlgorithm,      // <-- Funkcja do aktywacji algorytmu w całym systemie
    nextAlgoStep,       // <-- Funkcja do wykonywania kroku
    resetMemory,
    customAlgorithms,
    fetchAlgorithms,
    isLoading
  } = useMemoryStore();

  const [selectedAlgoId, setSelectedAlgoId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Pobranie listy algorytmów przy starcie
  useEffect(() => {
    fetchAlgorithms();
  }, [fetchAlgorithms]);

  // Łączymy bazę wbudowaną z własnymi algorytmami do listy wyboru
  const allAlgorithms = [...ALGORITHMS_DB, ...(customAlgorithms || [])];

  // --- AUTO-SCROLL LISTY KROKÓW W ODTWARZACZU ---
  useEffect(() => {
    if (activeAlgorithm && listRef.current && currentStepIndex >= 0) {
        const children = listRef.current.children;
        // Znajdź element odpowiadający aktualnemu krokowi
        const activeElement = children[currentStepIndex] as HTMLElement;

        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
  }, [currentStepIndex, activeAlgorithm]);

  // --- PĘTLA ODTWARZANIA (PLAY LOOP) ---
  useEffect(() => {
    let interval: number;
    if (isPlaying && activeAlgorithm) {
      interval = window.setInterval(() => {
        // Sprawdzamy, czy nie jesteśmy na końcu
        if (currentStepIndex < activeAlgorithm.steps.length - 1) {
          nextAlgoStep(); // Wykonaj krok w globalnym stanie
        } else {
          setIsPlaying(false); // Koniec, zatrzymaj
        }
      }, 1000); // Prędkość: 1 sekunda na krok
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeAlgorithm, currentStepIndex, nextAlgoStep]);

  // --- OBSŁUGA WYBORU Z LISTY ---
  const handleSelectAlgo = (id: string) => {
      setSelectedAlgoId(id);
      setIsPlaying(false);

      if (!id) return;

      const algo = allAlgorithms.find(a => a.id === id);
      if (algo) {
          // 1. Resetujemy pamięć (czyścimy stertę i stos)
          resetMemory().then(() => {
              // 2. Ładujemy algorytm do GLOBALNEGO stanu
              // To sprawi, że AlgorithmGuide (po prawej) zobaczy dane i wyświetli opisy!
              loadAlgorithm(algo);
          });
      }
  };

  const handleReset = async () => {
    setIsPlaying(false);
    if (selectedAlgoId) {
        handleSelectAlgo(selectedAlgoId); // Przeładuj ten sam algorytm od zera
    } else {
        await resetMemory();
    }
  };

  // --- UI ---
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex flex-col gap-2 h-full w-full overflow-hidden shadow-xl">

      {/* NAGŁÓWEK */}
      <h3 className="text-green-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-gray-800 pb-2 shrink-0">
        <ListMusic size={14} /> Odtwarzacz
      </h3>

      {/* SELECT */}
      <select
        className="w-full bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 outline-none focus:border-green-500 cursor-pointer shrink-0"
        onChange={(e) => handleSelectAlgo(e.target.value)}
        value={selectedAlgoId}
        disabled={isPlaying}
      >
        <option value="">-- Wybierz Algorytm --</option>
        <optgroup label="Baza Wiedzy">
            {ALGORITHMS_DB.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </optgroup>
        {customAlgorithms && customAlgorithms.length > 0 && (
            <optgroup label="Moje Algorytmy">
                {customAlgorithms.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </optgroup>
        )}
      </select>

      {/* PRZYCISKI STEROWANIA */}
      <div className="grid grid-cols-3 gap-1 bg-gray-950/30 p-1 rounded border border-gray-800 shrink-0">
        <button
          onClick={handleReset}
          disabled={isLoading || !selectedAlgoId}
          className="flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCcw size={12} /> RESET
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={!activeAlgorithm || isLoading || (currentStepIndex >= (activeAlgorithm?.steps.length || 0) - 1)}
          className={clsx(
            "flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50",
            isPlaying ? "bg-yellow-600 hover:bg-yellow-500 text-white" : "bg-green-600 hover:bg-green-500 text-white"
          )}
        >
          {isPlaying ? <><Pause size={12}/> STOP</> : <><Play size={12}/> START</>}
        </button>

        <button
          onClick={() => { setIsPlaying(false); nextAlgoStep(); }}
          disabled={!activeAlgorithm || isPlaying || isLoading || (currentStepIndex >= (activeAlgorithm?.steps.length || 0) - 1)}
          className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          KROK <SkipForward size={12} />
        </button>
      </div>

      {/* LISTA KROKÓW (WIZUALIZACJA POSTĘPU) */}
      <div className="flex-1 min-h-0 relative flex flex-col bg-black/40 border border-gray-800 rounded">
        <div
            ref={listRef}
            className="overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1 absolute inset-0"
        >
            {!activeAlgorithm ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs italic opacity-60">
                    <Play size={24} className="mb-2" />
                    <span>Wybierz algorytm</span>
                </div>
            ) : (
                activeAlgorithm.steps.map((step, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isDone = idx < currentStepIndex;

                    return (
                        <div
                            key={idx}
                            className={clsx(
                                "text-[10px] font-mono p-1.5 rounded flex items-center gap-2 transition-all border-l-2 select-none",
                                isActive
                                    ? "bg-green-900/40 text-green-300 border-green-500 pl-2 shadow-sm"
                                    : isDone
                                        ? "text-gray-500 border-transparent opacity-50"
                                        : "text-gray-400 border-transparent hover:bg-gray-800"
                            )}
                        >
                            <div className="w-3 shrink-0 flex justify-center">
                                {isDone ? <CheckCircle2 size={10} className="text-green-700" /> :
                                isActive ? <ChevronRight size={10} className="text-green-400 animate-pulse" /> :
                                <span className="text-[9px] text-gray-700">{idx + 1}</span>}
                            </div>

                            <span className="truncate flex-1">
                                <span className={clsx("font-bold uppercase mr-1.5",
                                    step.cmd === 'ALLOC' ? 'text-green-500' :
                                    step.cmd === 'FREE' ? 'text-red-500' :
                                    step.cmd.includes('MATH') ? 'text-orange-400' :
                                    'text-blue-400'
                                )}>
                                    {step.cmd.replace('_', ' ')}
                                </span>
                                <span className="text-gray-300">
                                    {step.var_name}
                                    {step.cmd === 'COMPARE' ? (
                                        <span className="text-indigo-400 ml-1">
                                            {step.field_name} {step.val_payload?.rightValue ?? step.val_payload}
                                        </span>
                                    ) : (
                                        <>
                                            {step.field_name && <span className="text-yellow-500">→{step.field_name}</span>}
                                            {(step.source_var || step.val_payload !== undefined) && step.cmd !== 'ALLOC' && (
                                                <>
                                                    <span className="text-gray-500 mx-1">=</span>
                                                    <span className="text-purple-300">
                                                        {step.source_var || (typeof step.val_payload === 'object' ? '...' : step.val_payload)}
                                                    </span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </span>
                            </span>
                        </div>
                    );
                })
            )}
        </div>
      </div>

      {/* PASEK POSTĘPU */}
      {activeAlgorithm && activeAlgorithm.steps.length > 0 && (
          <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden shrink-0 mt-1">
              <div
                  className={clsx(
                      "h-full transition-all duration-300 ease-out",
                      currentStepIndex === activeAlgorithm.steps.length - 1 ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${((currentStepIndex + 1) / activeAlgorithm.steps.length) * 100}%` }}
              ></div>
          </div>
      )}

    </div>
  );
};