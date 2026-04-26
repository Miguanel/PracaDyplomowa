import './App.css';
import { useState, useEffect } from 'react';
import { MemoryGrid } from './components/MemoryGrid';
import { EditorCanvas } from './features/StructureEditor/EditorCanvas';
import { AlgorithmBuilder } from './features/AlgoEditor/AlgorithmBuilder';
import { AlgorithmPlayer } from './features/AlgoEditor/AlgorithmPlayer';
import { AlgorithmGuide } from './components/AlgorithmGuide';
import { useMemoryStore } from './store/memoryStore';
import { Cpu, PlusCircle, RotateCcw, Play, Wrench, TerminalSquare, HelpCircle, BookOpen, Info, FileCode, Coffee, Terminal, Binary } from 'lucide-react';
import clsx from 'clsx';
import { TutorialOverlay } from './components/TutorialOverlay';

// IMPORTY NOWYCH PLIKÓW (Pamiętaj, by istniały w tych folderach z rozszerzeniem .js / .jsx!)
import { FloatingWindow } from './components/FloatingWindow';
import { WelcomeWindow } from './components/WelcomeWindow';
import { languageTemplates } from './utils/codeTranslators';

export default function App() {
  const { allocateNode, isLoading, resetMemory, memoryState, activeAlgorithm } = useMemoryStore();

  // Usunięto generyki <'pseudo' | 'cpp' | ...>
  const [consoleTab, setConsoleTab] = useState('cpp');
  const [newNodeLabel, setNewNodeLabel] = useState(`Node_${Math.floor(Math.random() * 1000)}`);
  const [newNodeValue, setNewNodeValue] = useState(Math.floor(Math.random() * 100).toString());

  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true); // Stan dla okna budzenia backendu
  const [topZ, setTopZ] = useState(20);

  const getNextZ = () => { setTopZ(prev => prev + 1); return topZ + 1; };

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('edualgo_tutorial_completed');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, []);

  const activeAlgoTitle = activeAlgorithm?.title || memoryState?.algorithm?.title || "System w gotowości";
  const activeAlgoDesc = activeAlgorithm?.description || memoryState?.algorithm?.description || "Wybierz algorytm, aby poznać jego logikę.";

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1400;
  const rightColX = screenW - 420;

  return (
    <div className="relative h-screen w-screen bg-black text-white overflow-hidden font-sans">

      {showTutorial && <TutorialOverlay onComplete={() => setShowTutorial(false)} setActiveTab={() => {}} />}

      <main className="absolute inset-0 z-0 bg-gray-950 flex flex-col">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none flex flex-col items-center">
             <Cpu size={250} />
             <h1 className="text-7xl font-black tracking-widest mt-6">EDUALGO</h1>
          </div>
          <EditorCanvas />
      </main>

      <header className="absolute top-0 left-0 right-0 h-14 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-[100] shadow-md pointer-events-auto">
        <div className="flex items-center gap-3">
          <Cpu className="text-green-500 w-8 h-8 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <h1 className="text-lg font-bold tracking-wider text-gray-200">EDUALGO SYSTEM</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowTutorial(true)} className="px-3 py-1.5 bg-indigo-900/30 text-indigo-400 border border-indigo-800 rounded text-xs font-bold transition-all"><HelpCircle size={16} /> PORADNIK</button>
          <button onClick={() => window.confirm("Reset?") && resetMemory()} className="px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-800 rounded text-xs font-bold transition-all"><RotateCcw size={16} /> RESTART</button>
        </div>
      </header>

      {/* --- OBIEKT POWITALNY (WAKE-UP BACKEND) --- */}
      {showWelcome && (
        <WelcomeWindow
           zIndexManager={getNextZ}
           onClose={() => setShowWelcome(false)}
        />
      )}

      {/* LEWA SZAFA */}
      <FloatingWindow id="scene" title="Edytor Sceny" icon={<PlusCircle size={14} className="text-purple-400"/>}
        defaultX={20} defaultY={70} defaultWidth={340} defaultHeight={180} zIndexManager={getNextZ} className="tutorial-scene">
        <div className="p-4 space-y-3 h-full overflow-y-auto">
          <div className="flex gap-2 nodrag">
            <input type="text" value={newNodeLabel} onChange={(e) => setNewNodeLabel(e.target.value)} placeholder="Etykieta" className="w-1/2 bg-gray-950 text-xs p-2 rounded border border-gray-700" />
            <input type="number" value={newNodeValue} onChange={(e) => setNewNodeValue(e.target.value)} placeholder="Val" className="w-1/2 bg-gray-950 text-xs p-2 rounded border border-gray-700" />
          </div>
          <button onClick={() => allocateNode(newNodeLabel, parseInt(newNodeValue))} disabled={isLoading} className="nodrag w-full bg-purple-600 hover:bg-purple-500 py-2 rounded text-xs font-bold text-white transition-colors">Stwórz Węzeł</button>
        </div>
      </FloatingWindow>

      <FloatingWindow id="player" title="Odtwarzacz" icon={<Play size={14} className="text-green-400"/>}
        defaultX={20} defaultY={270} defaultWidth={420} defaultHeight={280} zIndexManager={getNextZ} className="tutorial-player">
        <div className="flex-1 p-2 nodrag"><AlgorithmPlayer /></div>
      </FloatingWindow>

      <FloatingWindow id="builder" title="Kreator" icon={<Wrench size={14} className="text-blue-400"/>}
        defaultX={20} defaultY={570} defaultWidth={420} defaultHeight={300} zIndexManager={getNextZ} className="tutorial-builder">
        <div className="flex-1 p-2 nodrag"><AlgorithmBuilder /></div>
      </FloatingWindow>

      {/* PRAWA SZAFA */}
      <FloatingWindow id="opis" title="Opis Logiczny" icon={<Info size={14} className="text-indigo-400"/>}
        defaultX={rightColX} defaultY={70} defaultWidth={400} defaultHeight={220} zIndexManager={getNextZ}>
        <div className="p-4 h-full flex flex-col nodrag">
            <h4 className="text-indigo-400 font-bold text-xs mb-2 uppercase tracking-tighter">{activeAlgoTitle}</h4>
            <div className="flex-1 text-xs text-gray-300 leading-relaxed overflow-y-auto italic border-l-2 border-indigo-900/30 pl-3">{activeAlgoDesc}</div>
        </div>
      </FloatingWindow>

      <FloatingWindow id="guide" title="Przewodnik" icon={<BookOpen size={14} className="text-blue-400"/>}
        defaultX={rightColX} defaultY={310} defaultWidth={400} defaultHeight={220} zIndexManager={getNextZ} className="tutorial-guide">
        <div className="nodrag h-full w-full"><AlgorithmGuide /></div>
      </FloatingWindow>

      <FloatingWindow id="console" title="Konsola" icon={<TerminalSquare size={14} className="text-orange-400"/>}
        defaultX={rightColX} defaultY={550} defaultWidth={400} defaultHeight={260} zIndexManager={getNextZ} className="tutorial-console">
        <div className="flex bg-gray-950 border-b border-gray-800 shrink-0 overflow-x-auto nodrag">
            {['cpp', 'java', 'python', 'asm'].map(tab => (
                <button key={tab} onClick={() => setConsoleTab(tab)}
                  className={clsx("px-4 py-2 text-[10px] font-bold uppercase transition-all border-b-2", consoleTab === tab ? "border-blue-500 text-white bg-gray-900" : "border-transparent text-gray-600")}>
                  {tab}
                </button>
            ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] bg-black/60 nodrag">
            {(memoryState?.steps || []).slice(0, (memoryState?.currentStepIndex || 0) + 1).map((step, idx) => {
                const translator = languageTemplates[consoleTab];
                const codeLines = translator?.[step.type]?.(step.params?.name || step.params?.from || "node", step.params?.value || step.params?.to || "0") || [`// Step: ${step.type}`];
                return (
                  <div key={idx} className={clsx("mb-2 pl-3 border-l-2", idx === memoryState.currentStepIndex ? "border-blue-500 bg-blue-500/10 text-white font-bold" : "border-gray-800 text-gray-500")}>
                    {codeLines.map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                );
            })}
            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
        </div>
      </FloatingWindow>

      <FloatingWindow id="ram" title="RAM" icon={<Cpu size={14} className="text-green-400"/>}
        defaultX={screenW / 2 - 200} defaultY={window.innerHeight - 320} defaultWidth={400} defaultHeight={300} zIndexManager={getNextZ}>
        <div className="h-full w-full nodrag overflow-hidden"><MemoryGrid /></div>
      </FloatingWindow>
    </div>
  );
}