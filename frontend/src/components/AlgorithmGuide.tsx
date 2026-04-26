import React, { useEffect, useRef } from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { BookOpen, CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// KLOCEK 1: NAGŁÓWEK DO GÓRNEJ BELKI
// ============================================================================
export const GuideHeader = () => {
  const { activeAlgorithm, currentStepIndex } = useMemoryStore();

  if (!activeAlgorithm) return null;

  const currentStep = activeAlgorithm.steps[currentStepIndex];
  const activePhaseName = currentStep?.group || "Inicjalizacja";

  return (
    <div className="flex items-center gap-4">
        <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-0.5">Status Operacji</span>
            <div className="text-blue-400 font-black text-[10px] uppercase flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                {activePhaseName}
            </div>
        </div>
        <div className="text-[10px] font-mono text-gray-400 bg-black/40 px-2 py-1 rounded border border-gray-800">
            {currentStepIndex + 1} / {activeAlgorithm.steps.length}
        </div>
    </div>
  );
};

// ============================================================================
// KLOCEK 2: GŁÓWNA ZAWARTOŚĆ (Przewijana lista opisów)
// ============================================================================
export const AlgorithmGuide = () => {
  const { activeAlgorithm, currentStepIndex } = useMemoryStore();
  const stepRefs = useRef([]);
  const containerRef = useRef(null);

  // KULOODPORNA MATEMATYKA PRZEWIJANIA
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStepIndex >= 0 && stepRefs.current[currentStepIndex] && containerRef.current) {
        const activeElement = stepRefs.current[currentStepIndex];
        const container = containerRef.current;

        if (activeElement && container) {
           const targetScrollTop = activeElement.offsetTop - (container.clientHeight / 2) + (activeElement.clientHeight / 2);
           container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  if (!activeAlgorithm) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center opacity-30">
        <BookOpen size={48} className="mb-4" />
        <p className="text-sm uppercase tracking-widest font-bold">Wybierz algorytm, aby aktywować Przewodnik</p>
      </div>
    );
  }

  const groupColors = [
    { bg: "bg-blue-900/30", text: "text-blue-400", border: "border-blue-700/50" },
    { bg: "bg-purple-900/30", text: "text-purple-400", border: "border-purple-700/50" },
    { bg: "bg-emerald-900/30", text: "text-emerald-400", border: "border-emerald-700/50" },
    { bg: "bg-orange-900/30", text: "text-orange-400", border: "border-orange-700/50" },
    { bg: "bg-pink-900/30", text: "text-pink-400", border: "border-pink-700/50" },
  ];

  let lastGroup = "";
  let groupIdx = -1;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-20 bg-[#0a0a0c] relative">
      {activeAlgorithm.steps.map((step, index) => {
        const isNewGroup = step.group !== lastGroup;
        if (isNewGroup) {
          lastGroup = step.group;
          groupIdx++;
        }
        const theme = groupColors[groupIdx % groupColors.length];
        const isActive = index === currentStepIndex;
        const isPast = index < currentStepIndex;

        return (
          <React.Fragment key={index}>
            {isNewGroup && (
              <div className={clsx("px-3 py-1.5 rounded-r border-l-4 font-bold text-[9px] uppercase tracking-widest shadow-sm", theme.bg, theme.text, theme.border)}>
                {step.group}
              </div>
            )}

            <div
              ref={el => { stepRefs.current[index] = el; }}
              className={clsx(
                "p-3 rounded border transition-all duration-500 ml-2 relative",
                isActive ? `bg-gray-800 border-l-4 shadow-2xl scale-[1.02] z-10 ${theme.border}` : "bg-gray-800/20 border-transparent opacity-40"
              )}
            >
              <div className="flex gap-3">
                <div className="mt-1 shrink-0 flex flex-col items-center">
                  {isActive ? (
                      <div className={clsx("w-3 h-3 rounded-full animate-ping", theme.bg.replace('/30', ''))} />
                  ) : isPast ? (
                      <CheckCircle2 size={14} className={theme.text} />
                  ) : (
                      <Circle size={14} className="text-gray-700" />
                  )}
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
  );
};