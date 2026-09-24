// Ścieżka: src/components/MobileStepBar.tsx
// Górny pasek kroków na telefonie: kompaktowe widoki Odtwarzacza (ze START), Narracji i Kodu.
// Pokazuje bieżący krok ze wszystkich tych okien naraz, bez zasłaniania wizualizacji pamięci.
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Maximize2, Play, BookOpen, TerminalSquare, ListMusic } from 'lucide-react';
import { useMemoryStore } from '../store/memoryStore';
import { useMobileLayout } from '../store/mobileLayoutStore';
import { usePlayerUi, CONSOLE_LANGUAGES } from '../store/playerUiStore';
import { PlayerControls } from '../features/AlgoEditor/PlayerControls';
import { AlgorithmSelect } from '../features/AlgoEditor/AlgorithmSelect';
import { translateStep, LANGUAGE_LABELS } from '../utils/codeTranslators';
import { useCssVarHeight } from '../hooks/useCssVarHeight';
import type { AlgoStep } from '../assets/types';

const cmdColor = (cmd: string) =>
  cmd === 'ALLOC' ? 'text-green-400' : cmd === 'FREE' ? 'text-red-400' : cmd.includes('COMPARE') || cmd.includes('CHECK') ? 'text-orange-400' : 'text-blue-400';

const StepText = ({ step }: { step: AlgoStep }) => (
  <span className="font-mono">
    <span className={clsx("font-bold mr-1.5", cmdColor(step.cmd))}>{step.cmd.replace('_', ' ')}</span>
    <span className="text-gray-200">{step.var_name}</span>
    {step.field_name && step.cmd !== 'COMPARE' && <span className="text-yellow-500">→{step.field_name}</span>}
    {step.cmd === 'COMPARE' && <span className="text-indigo-300 ml-1">{step.field_name} {String((step.val_payload as { rightValue?: unknown })?.rightValue ?? '')}</span>}
    {step.cmd !== 'ALLOC' && step.cmd !== 'COMPARE' && step.source_var && (
      <><span className="text-gray-600 mx-1">=</span><span className="text-purple-300">{step.source_var}</span></>
    )}
  </span>
);

const ExpandBtn = ({ id, label }: { id: string; label: string }) => {
  const openPanel = useMobileLayout(s => s.openPanel);
  return (
    <button onClick={() => openPanel(id)} className="mobile-icon-btn shrink-0 !w-8 !h-8" aria-label={`Rozwiń: ${label}`} title={`Rozwiń: ${label}`}>
      <Maximize2 size={14} />
    </button>
  );
};

export const MobileStepBar = () => {
  const strips = useMobileLayout(s => s.strips);
  const activeAlgorithm = useMemoryStore(s => s.activeAlgorithm);
  const currentStepIndex = useMemoryStore(s => s.currentStepIndex);
  const consoleTab = usePlayerUi(s => s.consoleTab);
  const setConsoleTab = usePlayerUi(s => s.setConsoleTab);

  const ref = useRef<HTMLDivElement | null>(null);
  useCssVarHeight(ref, '--hud-h', '--hud-w');

  const total = activeAlgorithm?.steps.length ?? 0;
  const isFinished = !!activeAlgorithm && currentStepIndex >= total;
  const step: AlgoStep | undefined = activeAlgorithm && currentStepIndex >= 0 ? activeAlgorithm.steps[currentStepIndex] : undefined;

  // Automatyczne przewinięcie długiej linii kodu do początku przy zmianie kroku
  const codeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (codeRef.current) codeRef.current.scrollLeft = 0; }, [currentStepIndex, consoleTab]);

  const anyVisible = strips.player || strips.guide || strips.console;

  const codeLines = step ? translateStep(consoleTab, step) : [];
  const nextLang = CONSOLE_LANGUAGES[(CONSOLE_LANGUAGES.indexOf(consoleTab) + 1) % CONSOLE_LANGUAGES.length];

  return (
    <div ref={ref} className={clsx("mobile-stepbar fixed left-0 z-[190] bg-gray-950/95 backdrop-blur-md border-b border-gray-800 shadow-lg divide-y divide-gray-800/80", !anyVisible && "hidden")}>
      {/* --- ODTWARZACZ --- */}
      {strips.player && (
        <div data-strip="player" className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <PlayerControls size="md" />
            <div className="flex-1 min-w-0 text-right">
              {activeAlgorithm ? (
                <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">
                  <span className="hidden min-[380px]:inline">krok </span><span className="text-white font-bold">{Math.max(0, Math.min(currentStepIndex + 1, total))}</span>/{total}
                </span>
              ) : null}
            </div>
            <ExpandBtn id="player" label="Odtwarzacz" />
          </div>
          {/* Wybór / zmiana scenariusza - zawsze dostępny bezpośrednio na pasku */}
          <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
            <ListMusic size={13} className="text-indigo-400 shrink-0" />
            <AlgorithmSelect
              placeholder="Wybierz scenariusz..."
              className={clsx(
                "flex-1 min-w-0 truncate !text-[12px] font-bold rounded-md border px-2 py-1 bg-gray-900",
                activeAlgorithm ? "text-gray-200 border-gray-700" : "text-indigo-200 border-indigo-700 bg-indigo-950/60"
              )}
            />
          </div>
          {activeAlgorithm && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] leading-tight min-w-0">
              <Play size={11} className="text-green-400 shrink-0" />
              <div className="truncate">
                {isFinished
                  ? <span className="text-green-400 font-bold">Zakończono ✓ <span className="text-gray-400 font-normal">- wybierz kolejny scenariusz powyżej</span></span>
                  : step ? <StepText step={step} /> : <span className="text-gray-500 italic">Naciśnij START lub krok →</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- NARRACJA --- */}
      {strips.guide && (
        <div data-strip="guide" className="flex items-start gap-2 px-2 py-1.5">
          <BookOpen size={13} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-black uppercase tracking-wider text-blue-400 truncate">
              {!activeAlgorithm ? 'Narracja' : isFinished ? 'Zakończono' : (step?.group || 'Inicjalizacja')}
            </div>
            <p className="mobile-guide-text text-[11px] leading-snug text-gray-300 line-clamp-2">
              {!activeAlgorithm ? 'Wybierz algorytm, aby zobaczyć opis kroków.' : isFinished ? 'Algorytm wykonany w całości.' : (step?.explanation || 'Oczekiwanie na instrukcje...')}
            </p>
          </div>
          <ExpandBtn id="guide" label="Narracja" />
        </div>
      )}

      {/* --- KOD --- */}
      {strips.console && (
        <div data-strip="console" className="flex items-center gap-2 px-2 py-1">
          <TerminalSquare size={13} className="text-orange-400 shrink-0" />
          <button
            onClick={() => setConsoleTab(nextLang)}
            className="shrink-0 !px-1.5 !py-0.5 !text-[9px] font-black uppercase !rounded !border !border-orange-800 !bg-orange-950/50 text-orange-300 min-w-[44px]"
            title="Zmień język"
          >
            {LANGUAGE_LABELS[consoleTab as keyof typeof LANGUAGE_LABELS] || consoleTab}
          </button>
          <div ref={codeRef} className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap font-mono text-[11px] text-blue-200 no-scrollbar">
            {codeLines.length > 0 ? codeLines[0] : <span className="text-gray-600 italic">{activeAlgorithm && isFinished ? '// koniec programu' : '// brak instrukcji'}</span>}
          </div>
          <ExpandBtn id="console" label="Kod" />
        </div>
      )}
    </div>
  );
};
