// Ścieżka: src/features/AlgoEditor/TutorialOverlay.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Info } from 'lucide-react';
import clsx from 'clsx';

export const TutorialOverlay = ({ onComplete, windowsData, zIndexManager }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const steps = useMemo(() => [
    {
      target: 'center',
      placement: 'center',
      title: 'Witaj w EduAlgo v2.0! 👋',
      content: 'Właśnie uruchomiłeś zaawansowany system wizualizacji struktur danych. Pozwól, że w kilku krokach pokażę Ci jak opanować ten terminal.'
    },
    {
      target: '[data-id="scene"]',
      placement: 'smart',
      title: '1. Edytor Sceny',
      content: 'Tutaj zaczyna się życie. Możesz ręcznie alokować węzły (ALLOC) i zarządzać ich wartościami. Spróbuj dodać pierwszy węzeł po zakończeniu tutorialu.'
    },
    {
      target: '[data-id="builder"]',
      placement: 'smart',
      title: '2. Kreator Własny',
      content: 'Serce eksperymentów! Tutaj układasz algorytm klocek po klocku, testując go w bezpiecznym środowisku Sandbox.'
    },
    {
      target: '[data-id="player"]',
      placement: 'smart',
      title: '3. Odtwarzacz Algorytmów',
      content: 'Twój panel dowodzenia. Wybierz algorytm z bazy, użyj przycisków START/KROK i obserwuj jak system manipuluje pamięcią w czasie rzeczywistym.'
    },
    {
      target: '[data-id="ram"]',
      placement: 'top',
      title: '4. Podgląd Pamięci RAM',
      content: 'Widok niskopoziomowy. Sterta (Heap) pokazuje fizyczne bloki, a dolny Zrzut Stosu (Stack Dump) grupuje Twoje zmienne tak jak w debuggerach systemowych.'
    },
    {
      target: '[data-id="guide"]',
      placement: 'smart',
      title: '5. Przewodnik Narracyjny',
      content: 'Matematyczna intuicja. Zamiast suchego kodu, tutaj przeczytasz fabularyzowane opisy tego, co aktualnie dzieje się w logice algorytmu.'
    },
    {
      target: '[data-id="console"]',
      placement: 'smart',
      title: '6. Wielojęzyczna Konsola',
      content: 'Tłumacz kodu. Wybierz zakładkę (C++, Python, ASM), aby zobaczyć jak aktualny krok algorytmu wyglądałby w konkretnym języku programowania.'
    },
    {
      target: 'header.tutorial-header > div:last-child',
      placement: 'bottom',
      title: '7. Zarządzanie Terminalem',
      content: 'Jeśli okna się pogubią, kliknij "UŁÓŻ OKNA". Przycisk "RESTART" całkowicie czyści pamięć i przywraca system do zera.'
    }
  ], []);

  const step = steps[currentStep];

  // ==========================================================================
  // WYCIĄGANIE ID OKNA (Dla kuloodpornego CSS)
  // ==========================================================================
  const targetMatch = step.target.match(/\[data-id="(.*?)"\]/);
  const targetId = targetMatch ? targetMatch[1] : null;

  // Informujemy też Reacta, żeby po wyłączeniu tutorialu okno zostało na wierzchu
  useEffect(() => {
    if (targetId && zIndexManager) {
      zIndexManager(targetId);
    }
  }, [targetId, zIndexManager]);

  const measureTarget = useCallback(() => {
    if (step.target === 'center') {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    measureTarget();
    window.addEventListener('resize', measureTarget);
    return () => window.removeEventListener('resize', measureTarget);
  }, [measureTarget, windowsData]);

  const isCenter = step.target === 'center' || !targetRect;

  // ==========================================================================
  // POZYCJONOWANIE DYMKA
  // ==========================================================================
  let popoverLeft = window.innerWidth / 2;
  let popoverTop = window.innerHeight / 2;
  let popoverTransform = 'translate(-50%, -50%)';

  if (!isCenter && targetRect) {
    const pWidth = 320;
    const gap = 30;

    let activePlacement = step.placement;

    // Logika SMART: omijanie okna po stronie, gdzie jest więcej miejsca
    if (activePlacement === 'smart') {
      const spaceLeft = targetRect.left;
      const spaceRight = window.innerWidth - targetRect.right;

      if (targetRect.width > window.innerWidth * 0.6) {
         activePlacement = 'top';
      } else {
         activePlacement = spaceRight > spaceLeft ? 'right' : 'left';
      }
    }

    if (activePlacement === 'bottom') {
        popoverLeft = targetRect.left + (targetRect.width / 2) - (pWidth / 2);
        popoverTop = targetRect.bottom + gap;
        popoverTransform = 'none';
    }
    else if (activePlacement === 'top') {
        popoverLeft = targetRect.left + (targetRect.width / 2) - (pWidth / 2);
        popoverTop = targetRect.top - gap;
        popoverTransform = 'translateY(-100%)';
    }
    else if (activePlacement === 'right') {
        popoverLeft = targetRect.right + gap;
        popoverTop = targetRect.top + (targetRect.height / 2) - 120;
        popoverTransform = 'none';
    }
    else if (activePlacement === 'left') {
        popoverLeft = targetRect.left - pWidth - gap;
        popoverTop = targetRect.top + (targetRect.height / 2) - 120;
        popoverTransform = 'none';
    }

    // Blokady kolizyjne
    popoverLeft = Math.max(20, Math.min(window.innerWidth - pWidth - 20, popoverLeft));

    if (popoverTransform === 'translateY(-100%)') {
        popoverTop = Math.max(250, popoverTop);
    } else if (popoverTransform === 'none') {
        popoverTop = Math.max(80, Math.min(window.innerHeight - 280, popoverTop));
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">

      {/* KULOODPORNY Z-INDEX OVERRIDE */}
      {targetId && (
        <style>{`
          [data-id="${targetId}"] {
            z-index: 9998 !important;
            box-shadow: 0 0 30px rgba(59,130,246,0.3) !important;
          }
        `}</style>
      )}

      {/* SMART BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-500"
        style={{
          clipPath: isCenter
            ? 'none'
            : `polygon(0% 0%, 0% 100%, ${targetRect?.left}px 100%, ${targetRect?.left}px ${targetRect?.top}px, ${targetRect?.right}px ${targetRect?.top}px, ${targetRect?.right}px ${targetRect?.bottom}px, ${targetRect?.left}px ${targetRect?.bottom}px, ${targetRect?.left}px 100%, 100% 100%, 100% 0%)`
        }}
      />

      {/* SPOTLIGHT BORDER */}
      {!isCenter && targetRect && (
        <div
          className="absolute border-2 border-blue-500 rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500 animate-pulse"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* TUTORIAL CARD */}
      <div
        className={clsx(
            "absolute bg-gray-950 border border-blue-500/50 shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-2xl p-6 w-[320px] pointer-events-auto transition-all duration-500 ease-out",
            isCenter ? "opacity-100 scale-110" : "opacity-100 scale-100"
        )}
        style={{
          left: `${popoverLeft}px`,
          top: `${popoverTop}px`,
          transform: popoverTransform,
        }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Info size={140} />
        </div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] text-blue-400 font-bold uppercase tracking-tighter">
                    EduAlgo Tutorial • {currentStep + 1}/{steps.length}
                </div>
                <button onClick={onComplete} className="text-gray-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <h3 className="text-xl font-black text-white mb-2 tracking-tight">{step.title}</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed mb-8">
                {step.content}
            </p>

            <div className="flex justify-between items-center">
                <button
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex items-center gap-1 text-gray-600 hover:text-white disabled:opacity-0 transition-all font-bold text-[10px]"
                >
                    <ChevronLeft size={14} /> WSTECZ
                </button>

                <div className="flex gap-1">
                    {steps.map((_, i) => (
                        <div key={i} className={clsx(
                            "w-1 h-1 rounded-full transition-all",
                            i === currentStep ? "bg-blue-500 w-3" : "bg-gray-800"
                        )} />
                    ))}
                </div>

                {currentStep === steps.length - 1 ? (
                    <button
                        onClick={onComplete}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-[10px] font-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center gap-2"
                    >
                        GOTOWE <Check size={14} />
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-black transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2"
                    >
                        DALEJ <ChevronRight size={14} />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};