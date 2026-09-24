// src/App.jsx
import './App.css';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { EditorCanvas } from './features/StructureEditor/EditorCanvas';
import { useMemoryStore } from './store/memoryStore';
import { Cpu, PlusCircle, RotateCcw, HelpCircle, Info, Layout } from 'lucide-react';
import { TutorialOverlay } from './components/TutorialOverlay';
import { FloatingWindow } from './components/FloatingWindow';
import { WelcomeWindow } from './components/WelcomeWindow';
import SimulationErrorModal from './components/SimulationErrorModal';
import { initAnalytics, trackEvent } from './services/analytics';
import { MobileNav } from './components/MobileNav';
import { useIsMobile } from './hooks/useIsMobile';
import { useMobileLayout } from './store/mobileLayoutStore';

// ZREFAKTORYZOWANE OKNA MODULARNE
import { PlayerWindow } from './features/AlgoEditor/PlayerWindow';
import { GuideWindow } from './features/AlgoEditor/GuideWindow';
import { RamWindow } from './features/AlgoEditor/RamWindow';
import { ConsoleWindow } from './features/AlgoEditor/ConsoleWindow';
import { BuilderWindow } from './features/AlgoEditor/BuilderWindow';

// MANAGER OKIEN
import { useWindowManager } from './hooks/useWindowManager.jsx';

export default function App() {
  const { allocateNode, isLoading, resetMemory, memoryState, activeAlgorithm } = useMemoryStore();
  const {
    windowsData, intelligentLayout, initializeLayout, bringToFront, updatePos,
    updateSize, togglePin, toggleMinimize, applySmartClamp
  } = useWindowManager();

  const isMobile = useIsMobile();
  const mobileSheet = useMobileLayout(s => s.sheet);

  const windowActions = {
    updatePos, updateSize, togglePin, toggleMinimize
  };

  const [newNodeLabel, setNewNodeLabel] = useState(`Node_${Math.floor(Math.random() * 100)}`);
  const [newNodeValue, setNewNodeValue] = useState(Math.floor(Math.random() * 100).toString());
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // --- INICJALIZACJA OKIEN ---
  useEffect(() => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const wLeft = Math.min(400, screenW * 0.3);
    const wRight = Math.min(420, screenW * 0.3);

    // Odpalenie silnika analitycznego
    initAnalytics();

    // Układ bazowy zaprojektowano dla wysokości ~900px. Na niższych ekranach (np. laptop 1366x768)
    // kolumny wychodziły poza ekran - skalujemy je proporcjonalnie do dostępnej wysokości.
    const f = Math.min(1, (screenH - 90) / 810);
    const col = (y, h) => ({ y: Math.round(70 + (y - 70) * f), h: Math.max(120, Math.round(h * f)) });
    const ramW = Math.min(500, screenW - 2 * wLeft - 60);

    initializeLayout({
      scene:   { x: 20, ...col(70, 150), w: wLeft, pinned: false, minimized: false, z: 10 },
      player:  { x: 20, ...col(240, 320), w: wLeft, pinned: false, minimized: false, z: 10 },
      builder: { x: 20, ...col(580, 300), w: wLeft, pinned: false, minimized: false, z: 10 },
      opis:    { x: screenW - wRight - 20, ...col(70, 180), w: wRight, pinned: false, minimized: false, z: 10 },
      guide:   { x: screenW - wRight - 20, ...col(270, 340), w: wRight, pinned: false, minimized: false, z: 10 },
      console: { x: screenW - wRight - 20, ...col(630, 250), w: wRight, pinned: false, minimized: false, z: 10 },
      ram:     { x: screenW / 2 - ramW / 2, y: screenH - Math.round(260 * f), w: ramW, h: Math.max(160, Math.round(240 * f)), pinned: false, minimized: false, z: 10 }
    });

    //const hasSeenTutorial = localStorage.getItem('edualgo_tutorial_completed');
    //if (!hasSeenTutorial) setShowTutorial(true);

    const handleResize = () => applySmartClamp();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeLayout, applySmartClamp]);

  const activeAlgoTitle = activeAlgorithm?.title || memoryState?.algorithm?.title || "System w gotowości";
  const activeAlgoDesc = activeAlgorithm?.description || memoryState?.algorithm?.description || "Wybierz algorytm...";

  if (Object.keys(windowsData).length === 0) return <div className="h-screen w-screen bg-gray-950"></div>;

  return (
    <div
      className="app-root relative h-dvh w-full bg-black text-white overflow-hidden font-sans"
      data-mobile={isMobile ? "true" : "false"}
      data-sheet={isMobile ? mobileSheet : undefined}
      // scrollIntoView() (autoscroll list kroków) potrafił przewinąć cały kontener aplikacji,
      // chowając nagłówek - kontener nigdy nie powinien być przewijany
      onScroll={(e) => { if (e.currentTarget.scrollTop || e.currentTarget.scrollLeft) { e.currentTarget.scrollTop = 0; e.currentTarget.scrollLeft = 0; } }}
    >
      {showTutorial && <TutorialOverlay onComplete={() => setShowTutorial(false)} windowsData={windowsData} zIndexManager={bringToFront} />}

      <main className={clsx("tutorial-canvas z-0 bg-gray-950 flex flex-col", isMobile ? "mobile-canvas-area" : "absolute inset-0")}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none flex flex-col items-center">
             <Cpu size={isMobile ? 120 : 250} />
             <h1 className={clsx("font-black tracking-widest mt-6 whitespace-nowrap", isMobile ? "text-3xl" : "text-7xl")}>EduAlgo System</h1>
          </div>
          <EditorCanvas />
      </main>

      <header className={clsx(
        "tutorial-header absolute top-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between z-[100] shadow-md pointer-events-auto",
        isMobile ? "h-12 px-3" : "h-14 px-6"
      )}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Cpu className={clsx("text-green-500 shrink-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]", isMobile ? "w-6 h-6" : "w-8 h-8")} />
          <h1 className={clsx("font-bold tracking-wider text-gray-200 truncate", isMobile ? "text-sm" : "text-lg")}>EDUALGO SYSTEM</h1>
        </div>
        <div className={clsx("flex items-center shrink-0", isMobile ? "gap-2" : "gap-3")}>
          {!isMobile && (
          <button
              onClick={() => {
                trackEvent('ui', 'window_layout_auto');
                intelligentLayout();
              }}
              className="px-3 py-1.5 bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50 rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              <Layout size={14} /> UŁÓŻ OKNA
            </button>
          )}
          <button
              onClick={() => {
                  trackEvent('tutorial', 'tutorial_manual_start', 'header_button');
                  setShowTutorial(true);
              }}
              aria-label="Poradnik"
              className={clsx("bg-indigo-900/30 text-indigo-400 border border-indigo-800 hover:bg-indigo-900/50 rounded text-xs font-bold transition-all flex items-center gap-1.5", isMobile ? "p-2" : "px-3 py-1.5")}
          >
              <HelpCircle size={isMobile ? 16 : 14} /> {!isMobile && "PORADNIK"}
          </button>
          <button
              onClick={() => {
                  if (window.confirm("Zrestartować system?")) {
                      trackEvent('sandbox', 'memory_reset', 'header_button');
                      resetMemory();
                  }
              }}
              aria-label="Restart"
              className={clsx("bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 rounded text-xs font-bold transition-all flex items-center gap-1.5", isMobile ? "p-2" : "px-3 py-1.5")}
          >
              <RotateCcw size={isMobile ? 16 : 14} /> {!isMobile && "RESTART"}
          </button>
        </div>
      </header>

      {showWelcome && (
          <WelcomeWindow
            zIndexManager={bringToFront}
            onStartTutorial={() => {
              setShowWelcome(false); // Zamyka okno powitalne
              setShowTutorial(true); // Uruchamia poradnik
            }}
            onClose={() => setShowWelcome(false)} // Samo zamknięcie (Pomiń)
          />
        )}

      {/* --- ZREFAKTORYZOWANE OKNA MODULARNE --- */}
      <PlayerWindow
          windowState={windowsData.player}
          windowActions={windowActions}
          zIndexManager={bringToFront}
      />

      <GuideWindow
          windowState={windowsData.guide}
          windowActions={windowActions}
          zIndexManager={bringToFront}
      />

      <ConsoleWindow
          windowState={windowsData.console}
          windowActions={windowActions}
          zIndexManager={bringToFront}
      />

      <RamWindow
          windowState={windowsData.ram}
          windowActions={windowActions}
          zIndexManager={bringToFront}
      />

      <BuilderWindow
          windowState={windowsData.builder}
          windowActions={windowActions}
          zIndexManager={bringToFront}
      />

      {/* --- POZOSTAŁE OKNA (Czekające na refaktoryzację) --- */}

      <FloatingWindow id="scene" title="Edytor Sceny" icon={<PlusCircle size={14} className="text-purple-400"/>}
         {...windowsData.scene} onPosChange={updatePos} onSizeChange={updateSize} onPinToggle={togglePin} onMinimizeToggle={toggleMinimize} zIndexManager={bringToFront}>
        <div className="absolute inset-0 p-4 space-y-3 bg-[#0a0a0c] nodrag">
          <div className="flex gap-2">
            <input type="text" value={newNodeLabel} onChange={(e) => setNewNodeLabel(e.target.value)} placeholder="Etykieta" className="w-1/2 bg-gray-950 text-xs p-2 rounded border border-gray-700 outline-none focus:border-purple-500" />
            <input type="number" value={newNodeValue} onChange={(e) => setNewNodeValue(e.target.value)} placeholder="Val" className="w-1/2 bg-gray-950 text-xs p-2 rounded border border-gray-700 outline-none focus:border-purple-500" />
          </div>
          <button
              onClick={() => {
                  trackEvent('sandbox', 'node_allocated', newNodeLabel);
                  allocateNode(newNodeLabel, parseInt(newNodeValue));
              }}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded text-xs font-bold text-white transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
              Stwórz Węzeł
          </button>
        </div>
      </FloatingWindow>

      <FloatingWindow id="opis" title="Opis Logiczny" icon={<Info size={14} className="text-indigo-400"/>}
         {...windowsData.opis} onPosChange={updatePos} onSizeChange={updateSize} onPinToggle={togglePin} onMinimizeToggle={toggleMinimize} zIndexManager={bringToFront}>
        <div className="absolute inset-0 p-4 flex flex-col nodrag bg-[#0a0a0c]">
            <h4 className="text-indigo-400 font-bold text-xs mb-2 uppercase tracking-tighter border-b border-gray-800 pb-2">{activeAlgoTitle}</h4>
            <div className="flex-1 text-xs text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar italic border-l-2 border-indigo-900/30 pl-3">{activeAlgoDesc}</div>
        </div>
      </FloatingWindow>

      {isMobile && <MobileNav />}

      <SimulationErrorModal />

    </div>
  );
}