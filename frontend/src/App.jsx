// src/App.jsx
import './App.css';
import { useState, useEffect } from 'react';
import { EditorCanvas } from './features/StructureEditor/EditorCanvas';
import { useMemoryStore } from './store/memoryStore';
import { Cpu, PlusCircle, RotateCcw, HelpCircle, Info, Layout } from 'lucide-react';
import { TutorialOverlay } from './components/TutorialOverlay';
import { FloatingWindow } from './components/FloatingWindow';
import { WelcomeWindow } from './components/WelcomeWindow';

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

    initializeLayout({
      scene:   { x: 20, y: 70, w: wLeft, h: 150, pinned: false, minimized: false, z: 10 },
      player:  { x: 20, y: 240, w: wLeft, h: 320, pinned: false, minimized: false, z: 10 },
      builder: { x: 20, y: 580, w: wLeft, h: 300, pinned: false, minimized: false, z: 10 },
      opis:    { x: screenW - wRight - 20, y: 70, w: wRight, h: 180, pinned: false, minimized: false, z: 10 },
      guide:   { x: screenW - wRight - 20, y: 270, w: wRight, h: 340, pinned: false, minimized: false, z: 10 },
      console: { x: screenW - wRight - 20, y: 630, w: wRight, h: 250, pinned: false, minimized: false, z: 10 },
      ram:     { x: screenW / 2 - 250, y: screenH - 260, w: 500, h: 240, pinned: false, minimized: false, z: 10 }
    });

    const hasSeenTutorial = localStorage.getItem('edualgo_tutorial_completed');
    if (!hasSeenTutorial) setShowTutorial(true);

    const handleResize = () => applySmartClamp();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeLayout, applySmartClamp]);

  const activeAlgoTitle = activeAlgorithm?.title || memoryState?.algorithm?.title || "System w gotowości";
  const activeAlgoDesc = activeAlgorithm?.description || memoryState?.algorithm?.description || "Wybierz algorytm...";

  if (Object.keys(windowsData).length === 0) return <div className="h-screen w-screen bg-gray-950"></div>;

  return (
    <div className="relative h-screen w-screen bg-black text-white overflow-hidden font-sans">
      {showTutorial && <TutorialOverlay onComplete={() => setShowTutorial(false)} windowsData={windowsData} zIndexManager={bringToFront} />}

      <main className="tutorial-canvas absolute inset-0 z-0 bg-gray-950 flex flex-col">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none flex flex-col items-center">
             <Cpu size={250} />
             <h1 className="text-7xl font-black tracking-widest mt-6">EDUALGO</h1>
          </div>
          <EditorCanvas />
      </main>

      <header className="tutorial-header absolute top-0 left-0 right-0 h-14 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-[100] shadow-md pointer-events-auto">
        <div className="flex items-center gap-3">
          <Cpu className="text-green-500 w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <h1 className="text-lg font-bold tracking-wider text-gray-200">EDUALGO SYSTEM</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
              onClick={intelligentLayout}
              className="px-3 py-1.5 bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50 rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              <Layout size={14} /> UŁÓŻ OKNA
            </button>
          <button onClick={() => setShowTutorial(true)} className="px-3 py-1.5 bg-indigo-900/30 text-indigo-400 border border-indigo-800 hover:bg-indigo-900/50 rounded text-xs font-bold transition-all flex items-center gap-1.5">
              <HelpCircle size={14} /> PORADNIK
          </button>
          <button onClick={() => window.confirm("Zrestartować system?") && resetMemory()} className="px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 rounded text-xs font-bold transition-all flex items-center gap-1.5">
              <RotateCcw size={14} /> RESTART
          </button>
        </div>
      </header>

      {showWelcome && <WelcomeWindow zIndexManager={bringToFront} onClose={() => setShowWelcome(false)} />}

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
          <button onClick={() => allocateNode(newNodeLabel, parseInt(newNodeValue))} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded text-xs font-bold text-white transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">Stwórz Węzeł</button>
        </div>
      </FloatingWindow>

      <FloatingWindow id="opis" title="Opis Logiczny" icon={<Info size={14} className="text-indigo-400"/>}
         {...windowsData.opis} onPosChange={updatePos} onSizeChange={updateSize} onPinToggle={togglePin} onMinimizeToggle={toggleMinimize} zIndexManager={bringToFront}>
        <div className="absolute inset-0 p-4 flex flex-col nodrag bg-[#0a0a0c]">
            <h4 className="text-indigo-400 font-bold text-xs mb-2 uppercase tracking-tighter border-b border-gray-800 pb-2">{activeAlgoTitle}</h4>
            <div className="flex-1 text-xs text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar italic border-l-2 border-indigo-900/30 pl-3">{activeAlgoDesc}</div>
        </div>
      </FloatingWindow>

    </div>
  );
}