// Ścieżka: src/features/AlgoEditor/ConsoleWindow.tsx
import { useEffect, useRef } from 'react';
import { FloatingWindow } from '../../components/FloatingWindow';
import { useMemoryStore } from '../../store/memoryStore';
import { TerminalSquare, Code } from 'lucide-react';
import clsx from 'clsx';
import { translateStep } from '../../utils/codeTranslators';
import { usePlayerUi, CONSOLE_LANGUAGES } from '../../store/playerUiStore';
import type { FloatingWindowProps, AlgoStep } from '../../assets/types';
import { trackEvent } from '../../services/analytics';

export const ConsoleWindow = ({ windowState, windowActions, zIndexManager }: FloatingWindowProps) => {
  const { activeAlgorithm, currentStepIndex } = useMemoryStore();
  // Język wspólny z mobilnym paskiem kroków
  const consoleTab = usePlayerUi(s => s.consoleTab);
  const setConsoleTab = usePlayerUi(s => s.setConsoleTab);
  const endOfLogRef = useRef<HTMLDivElement | null>(null);

  // ==========================================================================
  // AUTO-SCROLL (Przewijanie do najnowszej instrukcji)
  // ==========================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!windowState?.minimized && endOfLogRef.current) {
            endOfLogRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStepIndex, consoleTab, windowState?.h, windowState?.minimized]);

  // ==========================================================================
  // WIDOK: ZWINIĘTY
  // ==========================================================================
  const MinimizedView = (
    <div className="p-2 bg-gray-950 shadow-inner flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 bg-orange-900/10 p-1.5 rounded border border-orange-900/30">
            <Code size={14} className="shrink-0" />
            <span className="font-bold uppercase tracking-wider">
                AKTYWNY JĘZYK: <span className="text-white">{consoleTab}</span>
            </span>
        </div>
        <span className="text-gray-600 text-[10px] font-mono italic pr-2">
            Linie kodu: {currentStepIndex >= 0 ? currentStepIndex + 1 : 0}
        </span>
    </div>
  );

  // ==========================================================================
  // WIDOK: ROZWINIĘTY
  // ==========================================================================
  const ExpandedView = (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0c] nodrag">

        {/* SEKTOR 1: GÓRA (Taby języków - przyklejone) */}
        <div className="shrink-0 flex bg-gray-950 border-b border-gray-800 overflow-x-auto custom-scrollbar z-10 shadow-sm">
            {CONSOLE_LANGUAGES.map(tab => (
                <button
                    key={tab}
                    onClick={() => {
                        trackEvent('console', 'language_tab_click', tab);
                        setConsoleTab(tab);
                    }}
                    className={clsx(
                        "px-5 py-2.5 text-[10px] font-bold uppercase transition-all border-b-2 whitespace-nowrap",
                        consoleTab === tab
                            ? "border-blue-500 text-white bg-gray-900/80"
                            : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/50"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* SEKTOR 2: ŚRODEK (Przewijana lista przetłumaczonego kodu) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 font-mono text-[11px] bg-black/90 custom-scrollbar relative z-0">
            {!activeAlgorithm || currentStepIndex < 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 text-xs italic opacity-40">
                    <TerminalSquare size={32} className="mb-3" />
                    <span>Oczekiwanie na instrukcje...</span>
                </div>
            ) : (
                activeAlgorithm.steps.slice(0, currentStepIndex + 1).map((step: AlgoStep, idx: number) => {
                    const codeLines: string[] = translateStep(consoleTab, step);

                    const isCurrent = idx === currentStepIndex;

                    return (
                        <div key={idx} className={clsx(
                            "mb-2 pl-3 border-l-2 transition-all duration-300",
                            isCurrent ? "border-blue-500 bg-blue-900/20 py-1.5 shadow-sm" : "border-gray-800 opacity-50 hover:opacity-80"
                        )}>
                            {codeLines.map((line, i) => (
                                <div key={i} className={clsx(
                                    "whitespace-pre-wrap break-all",
                                    i === 0 ? "text-blue-300 font-bold" : "text-gray-400 italic mt-0.5",
                                    isCurrent && i === 0 && "text-blue-200"
                                )}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    );
                })
            )}
            {/* Niewidzialny element do kotwiczenia auto-scrolla */}
            <div ref={endOfLogRef} className="h-2" />
        </div>
    </div>
  );

  const dynamicTitle = (
    <span className="flex items-center gap-2">
      Konsola Systemowa
      {windowState?.minimized && (
        <>
          <span className="text-gray-600 font-normal">|</span>
          <span className="text-orange-400 text-[9px] uppercase tracking-wider truncate mt-0.5">
            Live Output
          </span>
        </>
      )}
    </span>
  );

  return (
    <FloatingWindow
      id="console"
      title={dynamicTitle}
      icon={<TerminalSquare size={14} className="text-orange-400" />}
      {...windowState}
      onPosChange={windowActions.updatePos}
      onSizeChange={windowActions.updateSize}
      onPinToggle={windowActions.togglePin}
      onMinimizeToggle={windowActions.toggleMinimize}
      zIndexManager={zIndexManager}
      minimizedContent={MinimizedView}
    >
      {ExpandedView}
    </FloatingWindow>
  );
};