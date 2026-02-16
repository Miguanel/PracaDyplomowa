import React, { useEffect, useRef } from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { BookOpen, CheckCircle2, Circle, Info } from 'lucide-react';
import clsx from 'clsx';

export const AlgorithmGuide = () => {
  const { activeAlgorithm, currentStepIndex } = useMemoryStore();

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatyczne przewijanie do aktywnego kroku
  useEffect(() => {
    if (currentStepIndex >= 0 && stepRefs.current[currentStepIndex]) {
      stepRefs.current[currentStepIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentStepIndex]);

  if (!activeAlgorithm) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
        <BookOpen size={48} className="mb-4 opacity-20" />
        <p className="text-sm">Wybierz algorytm w Odtwarzaczu, aby zobaczyć przewodnik.</p>
      </div>
    );
  }

  // Paleta kolorów dla kolejnych grup (Faz)
  const groupColors = [
      { bg: "bg-blue-900/30", text: "text-blue-400", border: "border-blue-700/50" },
      { bg: "bg-purple-900/30", text: "text-purple-400", border: "border-purple-700/50" },
      { bg: "bg-emerald-900/30", text: "text-emerald-400", border: "border-emerald-700/50" },
      { bg: "bg-orange-900/30", text: "text-orange-400", border: "border-orange-700/50" },
      { bg: "bg-pink-900/30", text: "text-pink-400", border: "border-pink-700/50" },
  ];

  let currentGroup = "";
  let groupIndex = -1;

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white relative">

      {/* 1. WĄSKI, CZYSTY NAGŁÓWEK (Sticky) */}
      <div className="p-3 border-b border-gray-800 bg-gray-950 sticky top-0 z-20 shadow-md">
        <h3 className="text-blue-400 font-bold text-xs uppercase flex items-center gap-2">
          <BookOpen size={14} /> Przewodnik Narracyjny
        </h3>
      </div>

      {/* 2. OBSZAR PRZEWIJANY (Opis + Kroki) */}
      <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 pb-20">

        {/* KARTA WSTĘPU Z OPISEM FABULARNYM */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 mb-6 shadow-sm">
            <h4 className="text-white font-bold text-sm mb-2 text-indigo-400 flex items-center gap-2">
                {activeAlgorithm.title}
            </h4>
            <div className="text-gray-300 text-xs leading-relaxed flex gap-2.5 items-start">
                <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <span>{activeAlgorithm.description}</span>
            </div>
        </div>

        {/* LISTA KROKÓW */}
        {activeAlgorithm.steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isPast = index < currentStepIndex;

          // Logika wykrywania nowej grupy
          const stepGroup = step.group || "Kroki domyślne";
          const isNewGroup = stepGroup !== currentGroup;
          if (isNewGroup) {
              currentGroup = stepGroup;
              groupIndex++;
          }

          const theme = groupColors[groupIndex % groupColors.length];

          return (
            <React.Fragment key={index}>
              {/* NAGŁÓWEK GRUPY (Jeśli się zmieniła) */}
              {isNewGroup && (
                  <div className={clsx(
                      "mt-5 mb-3 px-3 py-2 rounded-r border-l-4 font-bold text-[10px] uppercase tracking-widest flex items-center shadow-sm",
                      theme.bg, theme.text, theme.border
                  )}>
                      {currentGroup}
                  </div>
              )}

              {/* WŁAŚCIWY KROK */}
              <div
                ref={el => { stepRefs.current[index] = el; }}
                className={clsx(
                  "mb-2 p-3 rounded border transition-all duration-300 text-xs leading-relaxed relative ml-2",
                  isActive
                    ? `bg-gray-800 border-l-4 shadow-lg scale-[1.02] z-10 ${theme.border}`
                    : "bg-gray-800/40 border-transparent border-l-4 border-l-transparent opacity-60 hover:opacity-100"
                )}
              >
                <div className="flex gap-3">
                  {/* Ikona Statusu */}
                  <div className="mt-0.5 shrink-0 flex flex-col items-center">
                      {isActive && <div className={clsx("w-4 h-4 rounded-full animate-pulse", theme.bg.replace('/30', ''))} />}
                      {isPast && <CheckCircle2 size={16} className={theme.text} />}
                      {!isActive && !isPast && <Circle size={16} className="text-gray-700" />}

                      {/* Pionowa linia łącząca kroki */}
                      {index < activeAlgorithm.steps.length - 1 && activeAlgorithm.steps[index+1].group === step.group && (
                          <div className="w-0.5 h-full bg-gray-800 mt-1"></div>
                      )}
                  </div>

                  {/* Treść KROKU */}
                  <div className="pb-1">
                      <div className="font-bold mb-1 flex items-center gap-2">
                          <span className={clsx(isActive ? "text-white" : "text-gray-500")}>
                              Krok {index + 1}:
                          </span>
                          <span className="font-mono bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-gray-400">
                              {step.cmd}
                          </span>
                      </div>

                      <p className={clsx("text-[11px]", isActive ? "text-gray-200" : "text-gray-500")}>
                          {step.explanation || "System wykonuje ukrytą operację..."}
                      </p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};