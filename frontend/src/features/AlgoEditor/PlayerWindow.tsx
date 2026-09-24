// Ścieżka: src/features/AlgoEditor/PlayerWindow.tsx
import { useEffect, useRef } from 'react';
import { FloatingWindow } from '../../components/FloatingWindow';
import { useMemoryStore } from '../../store/memoryStore';
import { usePlayerUi } from '../../store/playerUiStore';
import { usePlayerActions } from '../../hooks/usePlayerActions';
import { PlayerControls } from './PlayerControls';
import { ALGORITHMS_DB } from '../../data/algorithms';
import { Play, CheckCircle2, ChevronRight, Database } from 'lucide-react';
import clsx from 'clsx';
import { trackEvent } from '../../services/analytics';
import type { FloatingWindowProps, AlgoStep, ComparePayload } from '../../assets/types';

export const PlayerWindow = ({ windowState, windowActions, zIndexManager }: FloatingWindowProps) => {
  const {
    activeAlgorithm,
    currentStepIndex,
    nextAlgoStep,
    resetMemory,
    loadAlgorithm,
    customAlgorithms,
    fetchAlgorithms
  } = useMemoryStore();

  const isPlaying = usePlayerUi(s => s.isPlaying);
  const setIsPlaying = usePlayerUi(s => s.setIsPlaying);
  const { isDone } = usePlayerActions();
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // --- LOGIKA ODTWARZANIA ---
  useEffect(() => { fetchAlgorithms(); }, [fetchAlgorithms]);

  // Autoodtwarzanie: jedyny timer w aplikacji (okno jest zawsze zamontowane, także na telefonie)
  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying && activeAlgorithm) {
      interval = window.setInterval(() => {
        const s = useMemoryStore.getState();
        const finished = s.activeNodeId === 'node-stop' || s.currentStepIndex >= activeAlgorithm.steps.length;
        if (s.isStepping) return; // poprzedni krok jeszcze trwa (wolny backend)
        if (!finished && !s.simulationError) nextAlgoStep();
        else setIsPlaying(false);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [isPlaying, activeAlgorithm, nextAlgoStep, setIsPlaying]);

  // Autoscroll do aktywnego kroku
  useEffect(() => {
    const timer = setTimeout(() => {
      // Wykonuj tylko jeśli okno NIE JEST zminimalizowane
      if (!windowState?.minimized && activeAlgorithm && stepRefs.current[currentStepIndex] && currentStepIndex >= 0) {
        const activeElement = stepRefs.current[currentStepIndex];
        if (activeElement) {
           activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStepIndex, activeAlgorithm, windowState?.h, windowState?.minimized]);

  const handleSelectAlgo = (id: string) => {
    if (!id) return;
    const allAlgorithms = [...ALGORITHMS_DB, ...(customAlgorithms || [])];
    const algo = allAlgorithms.find(a => a.id === id);
    if (algo) {
        trackEvent('player', 'algorithm_run', algo.title);
        setIsPlaying(false);
        resetMemory().then(() => loadAlgorithm(algo));
    }
  };

  // ==========================================================================
  // WIDOK: NAGŁÓWEK
  // ==========================================================================
  const HeaderControls = <PlayerControls />;

  // ==========================================================================
  // WIDOK: ZWINIĘTY
  // ==========================================================================
  const MinimizedView = (
    <div className="p-2 bg-gray-950 shadow-inner">
        {activeAlgorithm && currentStepIndex >= 0 && currentStepIndex < activeAlgorithm.steps.length ? (
            <div className="flex items-center gap-2 text-[10px] font-mono text-green-400 bg-green-900/10 p-1.5 rounded border border-green-900/30">
                <ChevronRight size={14} className="animate-pulse shrink-0" />
                <span className="font-bold uppercase tracking-wider">{activeAlgorithm.steps[currentStepIndex].cmd}</span>
                <span className="truncate text-gray-300">{activeAlgorithm.steps[currentStepIndex].var_name}</span>
            </div>
        ) : (
            <div className="text-[10px] text-gray-600 italic py-1 pl-2">System gotowy...</div>
        )}
    </div>
  );

  // ==========================================================================
  // WIDOK: ROZWINIĘTY (Idealny Flexbox, Sektory przyklejone)
  // ==========================================================================
  const ExpandedView = (
    <div className="h-full w-full flex flex-col min-h-0 bg-[#0a0a0c] nodrag">

      {/* SEKTOR 1: GÓRA (Przyklejony) */}
      <div className="shrink-0 p-2 bg-gray-900/50 border-b border-gray-800 z-10">
         <select
            className="w-full bg-gray-950 text-gray-200 text-[11px] font-bold p-1.5 rounded border border-indigo-900/50 outline-none focus:border-indigo-500 cursor-pointer shadow-inner"
            onChange={(e) => handleSelectAlgo(e.target.value)}
            value={activeAlgorithm?.id || ""}
         >
            <option value="" disabled>-- Wybierz algorytm --</option>
            <optgroup label="Baza Wiedzy EduAlgo">
                {ALGORITHMS_DB.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </optgroup>
            {customAlgorithms?.length > 0 && (
                <optgroup label="Twoje Projekty">
                    {customAlgorithms.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </optgroup>
            )}
         </select>
      </div>

      {/* SEKTOR 2: ŚRODEK (Osobny kontener ze scrollem) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar relative">
         <div className="flex flex-col gap-1.5 pb-10">
            {!activeAlgorithm ? (
               <div className="h-full flex flex-col items-center justify-center py-10 text-gray-600 text-xs italic">
                  <Database size={32} className="mb-3 opacity-20" />
                  <span>Wybierz algorytm z listy powyżej</span>
               </div>
            ) : (
               activeAlgorithm.steps.map((step: AlgoStep, idx: number) => {
                   const isActive = idx === currentStepIndex;
                   const isPast = idx < currentStepIndex;
                   return (
                       <div key={idx} ref={(el) => { stepRefs.current[idx] = el; }} className={clsx("text-[10px] font-mono p-2 rounded flex items-center gap-2 transition-all border-l-2 select-none", isActive ? "bg-green-900/30 text-green-300 border-green-500 shadow-md scale-[1.01]" : isPast ? "text-gray-500 border-transparent opacity-40" : "text-gray-400 border-transparent hover:bg-gray-800")}>
                           <div className="w-4 shrink-0 flex justify-center">
                               {isPast ? <CheckCircle2 size={12} className="text-green-700" /> : isActive ? <ChevronRight size={12} className="text-green-400 animate-pulse" /> : <span className="text-[9px] text-gray-600">{idx + 1}</span>}
                           </div>
                           <span className="truncate flex-1">
                               <span className={clsx("font-bold uppercase mr-2", step.cmd === 'ALLOC' ? 'text-green-500' : step.cmd === 'FREE' ? 'text-red-500' : step.cmd.includes('MATH') ? 'text-orange-400' : 'text-blue-400')}>{step.cmd.replace('_', ' ')}</span>
                               <span className="text-gray-300">
                                   {step.var_name}
                                   {step.cmd === 'COMPARE' ? (
                                       <span className="text-indigo-400 ml-1">{step.field_name} {(step.val_payload as ComparePayload | undefined)?.rightValue ?? String(step.val_payload ?? '')}</span>
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

      {/* SEKTOR 3: DÓŁ (Przyklejony Pasek Postępu) */}
      <div className="shrink-0 w-full h-1.5 bg-gray-950 z-10">
          {activeAlgorithm && activeAlgorithm.steps.length > 0 && (
             <div
                 className={clsx("h-full transition-all duration-300 ease-out", isDone ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-blue-500 shadow-[0_0_8px_#3b82f6]")}
                 style={{ width: `${Math.min(100, (Math.min(currentStepIndex, activeAlgorithm.steps.length) / activeAlgorithm.steps.length) * 100)}%` }}
             ></div>
          )}
      </div>
    </div>
  );

  return (
    <FloatingWindow
      id="player"
      title="Odtwarzacz"
      icon={<Play size={14} className="text-green-400" />}
      {...windowState}
      onPosChange={windowActions.updatePos}
      onSizeChange={windowActions.updateSize}
      onPinToggle={windowActions.togglePin}
      onMinimizeToggle={windowActions.toggleMinimize}
      zIndexManager={zIndexManager}
      headerControls={HeaderControls}
      minimizedContent={MinimizedView}
    >
      {ExpandedView}
    </FloatingWindow>
  );
};