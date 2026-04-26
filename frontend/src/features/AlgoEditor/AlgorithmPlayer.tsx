// Ścieżka: src/features/AlgoEditor/AlgorithmPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import { ALGORITHMS_DB } from '../../data/algorithms';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, CheckCircle2, ChevronRight, Database } from 'lucide-react';
import clsx from 'clsx';

export const AlgorithmPlayer = () => {
  const {
    activeAlgorithm,
    currentStepIndex,
    nextAlgoStep,
    resetMemory,
    isLoading,
    loadAlgorithm,
    customAlgorithms,
    fetchAlgorithms
  } = useMemoryStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const stepRefs = useRef([]);
  const scrollContainerRef = useRef(null);

  // --- LOGIKA ODTWARZANIA ---
  useEffect(() => {
    fetchAlgorithms();
  }, [fetchAlgorithms]);

  useEffect(() => {
    let interval;
    if (isPlaying && activeAlgorithm) {
      interval = window.setInterval(() => {
        if (currentStepIndex < activeAlgorithm.steps.length - 1) {
            nextAlgoStep();
        } else {
            setIsPlaying(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeAlgorithm, currentStepIndex, nextAlgoStep]);

  // Autoscroll do aktywnego kroku
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeAlgorithm && stepRefs.current[currentStepIndex] && scrollContainerRef.current && currentStepIndex >= 0) {
        const activeElement = stepRefs.current[currentStepIndex];
        const container = scrollContainerRef.current;
        if (activeElement && container) {
           const targetScrollTop = activeElement.offsetTop - (container.clientHeight / 2) + (activeElement.clientHeight / 2);
           container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStepIndex, activeAlgorithm]);

  const handleReset = async () => {
    setIsPlaying(false);
    await resetMemory();
  };

  const handleSelectAlgo = (id) => {
    if (!id) return;
    const allAlgorithms = [...ALGORITHMS_DB, ...(customAlgorithms || [])];
    const algo = allAlgorithms.find(a => a.id === id);
    if (algo) resetMemory().then(() => loadAlgorithm(algo));
  };

  // --- LOGIKA COFANIA (Szybki Rewind) ---
  const handleStepBack = async () => {
    setIsPlaying(false);
    if (!activeAlgorithm || currentStepIndex < 0 || isLoading) return;

    // Docelowy krok to obecny minus jeden
    const targetIndex = currentStepIndex - 1;

    // 1. Resetujemy system i ładujemy algorytm od nowa (index = -1)
    await resetMemory();
    loadAlgorithm(activeAlgorithm);

    // 2. Błyskawicznie przewijamy system do docelowego kroku
    for (let i = 0; i <= targetIndex; i++) {
        await nextAlgoStep();
    }
  };

  const isDone = currentStepIndex >= (activeAlgorithm?.steps.length || 0) - 1;

  return (
    <div className="flex flex-col h-full w-full">
      {/* =========================================================
          SEKTOR 1: GÓRA (Wybór algorytmu i przyciski - Przyklejony)
          ========================================================= */}
      <div className="shrink-0 p-2 bg-gray-900/80 border-b border-gray-800 nodrag flex flex-col gap-2 shadow-sm relative z-10">
         <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Lista rozwijana z src/data/algorithms.js */}
            <select
                className="w-full sm:flex-1 bg-gray-950 text-gray-200 text-[11px] font-bold p-1.5 rounded border border-indigo-900/50 outline-none focus:border-indigo-500 cursor-pointer shadow-inner"
                onChange={(e) => handleSelectAlgo(e.target.value)}
                value={activeAlgorithm?.id || ""}
            >
                <option value="" disabled>-- Wybierz algorytm --</option>
                <optgroup label="Baza Wiedzy EduAlgo">
                    {ALGORITHMS_DB.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </optgroup>
                {customAlgorithms?.length > 0 && (
                    <optgroup label="Twoje Projekty (Kreator)">
                        {customAlgorithms.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </optgroup>
                )}
            </select>

            {/* Przyciski sterujące */}
            <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={handleReset} disabled={isLoading || !activeAlgorithm} title="Resetuj System" className="p-1.5 rounded bg-gray-950 border border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors disabled:opacity-30">
                    <RotateCcw size={12} />
                </button>

                {/* NOWY PRZYCISK: KROK W TYŁ */}
                <button onClick={handleStepBack} disabled={!activeAlgorithm || isPlaying || isLoading || currentStepIndex < 0} title="Krok do tyłu" className="p-1.5 rounded bg-gray-950 border border-gray-700 hover:bg-blue-900/50 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-30">
                    <SkipBack size={14} />
                </button>

                <button onClick={() => setIsPlaying(!isPlaying)} disabled={!activeAlgorithm || isLoading || isDone} className={clsx(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all disabled:opacity-30 border",
                        isPlaying ? "bg-yellow-600 hover:bg-yellow-500 text-yellow-50 border-yellow-500 shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                                  : "bg-green-600/90 hover:bg-green-500 text-green-50 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                    )}>
                    {isPlaying ? <Pause size={10} fill="currentColor"/> : <Play size={10} fill="currentColor"/>}
                    {isPlaying ? "STOP" : "START"}
                </button>

                <button onClick={() => { setIsPlaying(false); nextAlgoStep(); }} disabled={!activeAlgorithm || isPlaying || isLoading || isDone} title="Krok do przodu" className="p-1.5 rounded bg-gray-950 border border-gray-700 hover:bg-blue-900/50 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-30">
                    <SkipForward size={14} />
                </button>
            </div>
         </div>
      </div>

      {/* =========================================================
          SEKTOR 2: ŚRODEK (Dynamiczna lista scrollowana)
          ========================================================= */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-0 bg-[#0a0a0c] relative nodrag">
         <div className="flex flex-col gap-1.5 pb-10">
            {!activeAlgorithm ? (
               <div className="flex flex-col items-center justify-center py-10 text-gray-600 text-xs italic">
                  <Database size={32} className="mb-3 opacity-20" />
                  <span>Załaduj algorytm z górnej listy</span>
               </div>
            ) : (
               activeAlgorithm.steps.map((step, idx) => {
                   const isActive = idx === currentStepIndex;
                   const isDone = idx < currentStepIndex;
                   return (
                       <div key={idx} ref={(el) => { stepRefs.current[idx] = el; }} className={clsx("text-[10px] font-mono p-2 rounded flex items-center gap-2 transition-all border-l-2 select-none", isActive ? "bg-green-900/30 text-green-300 border-green-500 shadow-md scale-[1.01]" : isDone ? "text-gray-500 border-transparent opacity-40" : "text-gray-400 border-transparent hover:bg-gray-800")}>
                           <div className="w-4 shrink-0 flex justify-center">
                               {isDone ? <CheckCircle2 size={12} className="text-green-700" /> : isActive ? <ChevronRight size={12} className="text-green-400 animate-pulse" /> : <span className="text-[9px] text-gray-600">{idx + 1}</span>}
                           </div>
                           <span className="truncate flex-1">
                               <span className={clsx("font-bold uppercase mr-2", step.cmd === 'ALLOC' ? 'text-green-500' : step.cmd === 'FREE' ? 'text-red-500' : step.cmd.includes('MATH') ? 'text-orange-400' : 'text-blue-400')}>{step.cmd.replace('_', ' ')}</span>
                               <span className="text-gray-300">
                                   {step.var_name}
                                   {step.cmd === 'COMPARE' ? (
                                       <span className="text-indigo-400 ml-1">{step.field_name} {step.val_payload?.rightValue ?? step.val_payload}</span>
                                   ) : (
                                       <>{step.field_name && <span className="text-yellow-500">→{step.field_name}</span>}{(step.source_var || step.val_payload !== undefined) && step.cmd !== 'ALLOC' && (<><span className="text-gray-600 mx-1">=</span><span className="text-purple-300">{step.source_var || (typeof step.val_payload === 'object' ? '...' : step.val_payload)}</span></>)}</>
                                   )}
                               </span>
                           </span>
                       </div>
                   );
               })
            )}
         </div>
      </div>

      {/* =========================================================
          SEKTOR 3: DÓŁ (Przyklejony pasek postępu)
          ========================================================= */}
      <div className="shrink-0 w-full h-1.5 bg-gray-950">
          {activeAlgorithm && activeAlgorithm.steps.length > 0 && (
             <div
                 className={clsx("h-full transition-all duration-300 ease-out", currentStepIndex === activeAlgorithm.steps.length - 1 ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-blue-500 shadow-[0_0_8px_#3b82f6]")}
                 style={{ width: `${((currentStepIndex + 1) / activeAlgorithm.steps.length) * 100}%` }}
             ></div>
          )}
      </div>
    </div>
  );
};