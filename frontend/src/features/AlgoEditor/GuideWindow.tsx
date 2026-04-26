// Ścieżka: src/features/AlgoEditor/GuideWindow.tsx
import React, { useEffect, useRef } from 'react';
import { FloatingWindow } from '../../components/FloatingWindow';
import { useMemoryStore } from '../../store/memoryStore';
import { BookOpen, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

export const GuideWindow = ({ windowState, windowActions, zIndexManager }) => {
  const { activeAlgorithm, currentStepIndex } = useMemoryStore();
  const stepRefs = useRef([]);

  // ==========================================================================
  // KULOODPORNY AUTO-SCROLL
  // ==========================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!windowState?.minimized && currentStepIndex >= 0 && stepRefs.current[currentStepIndex]) {
        const activeElement = stepRefs.current[currentStepIndex];
        if (activeElement) {
           activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentStepIndex, activeAlgorithm, windowState?.h, windowState?.minimized]);

  const currentStep = activeAlgorithm?.steps[currentStepIndex];
  const activePhaseName = currentStep?.group || "Inicjalizacja";
  const currentExplanation = currentStep?.explanation || "Oczekiwanie na instrukcje...";

  // ==========================================================================
  // WIDOK: NAGŁÓWEK
  // ==========================================================================
  const HeaderControls = (!windowState?.minimized && activeAlgorithm) ? (
    <div className="flex items-center gap-4">
        <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-0.5">Status</span>
            <div className="text-blue-400 font-black text-[10px] uppercase flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                {activePhaseName}
            </div>
        </div>
        <div className="text-[10px] font-mono text-gray-400 bg-black/40 px-2 py-1 rounded border border-gray-800">
            {currentStepIndex + 1} / {activeAlgorithm.steps.length}
        </div>
    </div>
  ) : null;

  // ==========================================================================
  // WIDOK: ZWINIĘTY
  // ==========================================================================
  const MinimizedView = (
    <div className="p-2 bg-gray-950 shadow-inner">
        {activeAlgorithm && currentStepIndex >= 0 ? (
            <div className="flex items-start gap-2 text-[11px] text-gray-300 bg-blue-900/10 p-2 rounded border border-blue-900/30">
                <BookOpen size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <span className="italic leading-relaxed line-clamp-2">
                    {currentExplanation}
                </span>
            </div>
        ) : (
            <div className="text-[10px] text-gray-600 italic py-1 pl-2">Wybierz algorytm z Odtwarzacza...</div>
        )}
    </div>
  );

  // ==========================================================================
  // WIDOK: ROZWINIĘTY (Idealny Flexbox dla głównej listy)
  // ==========================================================================
  const groupColors = [
    { bg: "bg-blue-900/30", text: "text-blue-400", border: "border-blue-700/50" },
    { bg: "bg-purple-900/30", text: "text-purple-400", border: "border-purple-700/50" },
    { bg: "bg-emerald-900/30", text: "text-emerald-400", border: "border-emerald-700/50" },
    { bg: "bg-orange-900/30", text: "text-orange-400", border: "border-orange-700/50" },
  ];

  let lastGroup = "";
  let groupIdx = -1;

  const ExpandedView = (
    <div className="h-full w-full flex flex-col min-h-0 bg-[#0a0a0c] nodrag">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 pb-20 relative">
        {!activeAlgorithm ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center opacity-30">
             <BookOpen size={48} className="mb-4" />
             <p className="text-sm uppercase tracking-widest font-bold">Wybierz algorytm, aby aktywować Przewodnik</p>
           </div>
        ) : (
          <div className="space-y-4">
              {activeAlgorithm.steps.map((step, index) => {
                const isNewGroup = step.group !== lastGroup;
                if (isNewGroup) { lastGroup = step.group; groupIdx++; }
                const theme = groupColors[groupIdx % groupColors.length];
                const isActive = index === currentStepIndex;
                const isPast = index < currentStepIndex;

                return (
                  <React.Fragment key={index}>
                    {isNewGroup && (
                      <div className={clsx("px-3 py-1.5 rounded-r border-l-4 font-bold text-[9px] uppercase tracking-widest shadow-sm w-fit", theme.bg, theme.text, theme.border)}>
                        {step.group}
                      </div>
                    )}
                    <div ref={el => { stepRefs.current[index] = el; }} className={clsx("p-3 rounded border transition-all duration-500 ml-2 relative", isActive ? `bg-gray-800 border-l-4 shadow-2xl scale-[1.02] z-10 ${theme.border}` : "bg-gray-800/20 border-transparent opacity-40")}>
                      <div className="flex gap-3">
                        <div className="mt-1 shrink-0 flex flex-col items-center">
                          {isActive ? <div className={clsx("w-3 h-3 rounded-full animate-ping", theme.bg.replace('/30', ''))} /> : isPast ? <CheckCircle2 size={14} className={theme.text} /> : <Circle size={14} className="text-gray-700" />}
                        </div>
                        <div>
                          <div className="font-bold text-[10px] mb-1 flex items-center gap-2">
                            <span className={isActive ? "text-white" : "text-gray-600"}>KROK {index + 1}</span>
                            <code className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-blue-400 border border-gray-800">{step.cmd}</code>
                          </div>
                          <p className={clsx("text-[11px] leading-relaxed", isActive ? "text-gray-200" : "text-gray-500")}>
                            {step.explanation || "System wykonuje instrukcję..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );

  const dynamicTitle = (
    <span className="flex items-center gap-2">
      Przewodnik
      {windowState?.minimized && activeAlgorithm && (
        <>
          <span className="text-gray-600 font-normal">|</span>
          <span className="text-blue-400 text-[9px] uppercase tracking-wider truncate max-w-[180px] mt-0.5">
            {activePhaseName}
          </span>
        </>
      )}
    </span>
  );

  return (
    <FloatingWindow
      id="guide"
      title={dynamicTitle}
      icon={<BookOpen size={14} className="text-blue-400" />}
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