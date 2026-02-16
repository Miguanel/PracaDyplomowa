import './App.css';
import { useState } from 'react'; // WAŻNE: Dodano import useState
import { MemoryGrid } from './components/MemoryGrid';
import { EditorCanvas } from './features/StructureEditor/EditorCanvas';
import { AlgorithmBuilder } from './features/AlgoEditor/AlgorithmBuilder';
import { AlgorithmPlayer } from './features/AlgoEditor/AlgorithmPlayer';
import { ConsoleLog } from './components/ConsoleLog';
import { AlgorithmGuide } from './components/AlgorithmGuide';
import { useMemoryStore } from './store/memoryStore';
import { Cpu, PlusCircle, RotateCcw, Play, Wrench, TerminalSquare } from 'lucide-react';
import clsx from 'clsx'; // Import clsx do łatwego łączenia klas

function App() {
  const { allocateNode, isLoading, resetMemory } = useMemoryStore();

  // NOWOŚĆ: Stan przechowujący informację o tym, która zakładka jest aktywna
  const [activeTab, setActiveTab] = useState<'player' | 'builder' | 'console'>('player');

  const handleAddNode = () => {
    const randomVal = Math.floor(Math.random() * 100);
    const label = `Node_${Math.floor(Math.random() * 1000)}`;
    allocateNode(label, randomVal);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden font-sans">

      {/* 1. HEADER */}
      <header className="h-14 shrink-0 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <Cpu className="text-green-500 w-8 h-8" />
          <h1 className="text-lg font-bold tracking-wider text-gray-200">EDUALGO SYSTEM</h1>
        </div>
        <button
          onClick={() => window.confirm("Czy na pewno chcesz zrestartować pamięć?") && resetMemory()}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900 rounded text-xs font-bold transition-colors"
        >
          <RotateCcw size={16} /> RESTART
        </button>
      </header>

      {/* 2. GŁÓWNY UKŁAD */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* --- LEWY PANEL (Z SYSTEMEM ZAKŁADEK) --- */}
        <aside className="w-[450px] min-w-[450px] bg-gray-900 border-r border-gray-700 flex flex-col h-full z-20 shadow-xl">

          {/* Nagłówek i przycisk */}
          <div className="shrink-0 p-4 border-b border-gray-800 bg-gray-900">
              <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                 Edytor Sceny
              </h3>
              <button
                onClick={handleAddNode}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <PlusCircle size={16} /> {isLoading ? "TWORZENIE..." : "DODAJ WĘZEŁ"}
              </button>
          </div>

          {/* ZAKŁADKI (TABS) */}
          <div className="flex border-b border-gray-800 bg-gray-950 shrink-0">
             <button
                onClick={() => setActiveTab('player')}
                className={clsx("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 transition-colors border-b-2", activeTab === 'player' ? "border-green-500 text-green-400 bg-gray-900" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800")}
             >
                <Play size={14} /> Odtwarzacz
             </button>
             <button
                onClick={() => setActiveTab('builder')}
                className={clsx("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 transition-colors border-b-2", activeTab === 'builder' ? "border-blue-500 text-blue-400 bg-gray-900" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800")}
             >
                <Wrench size={14} /> Kreator
             </button>
             <button
                onClick={() => setActiveTab('console')}
                className={clsx("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 transition-colors border-b-2", activeTab === 'console' ? "border-orange-500 text-orange-400 bg-gray-900" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800")}
             >
                <TerminalSquare size={14} /> Konsola
             </button>
          </div>

          {/* OBSZAR TREŚCI ZAKŁADKI */}
          {/* Używamy position: absolute dla dzieci i display: none dla nieaktywnych zakładek.
              Dzięki temu nie niszczymy stanu (wpisanego tekstu) w formularzach! */}
          <div className="flex-1 relative bg-black/20 p-3">

             {/* Widok Odtwarzacza */}
             <div className={clsx("absolute inset-3 flex flex-col", activeTab === 'player' ? "block" : "hidden")}>
                <AlgorithmPlayer />
             </div>

             {/* Widok Kreatora */}
             <div className={clsx("absolute inset-3 flex flex-col", activeTab === 'builder' ? "block" : "hidden")}>
                <AlgorithmBuilder />
             </div>

             {/* Widok Konsoli */}
             <div className={clsx("absolute inset-3 flex flex-col bg-gray-900 border border-gray-700 rounded overflow-hidden", activeTab === 'console' ? "block" : "hidden")}>
                <ConsoleLog />
             </div>

          </div>

        </aside>

        {/* --- ŚRODEK (CANVAS) --- */}
        <main className="flex-1 relative bg-gray-950 overflow-hidden flex flex-col">
             <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded text-[10px] text-gray-500 font-mono border border-gray-800 pointer-events-none">
                WIZUALIZACJA STRUKTURY
             </div>
             <div className="flex-1 w-full h-full">
                <EditorCanvas />
             </div>
        </main>

        {/* --- PRAWY PANEL (Pamięć + Przewodnik) --- */}
        <aside className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full z-10 shadow-xl">
          <div className="h-[40%] border-b border-gray-700 flex flex-col overflow-hidden">
             <div className="p-2 bg-gray-950 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800">
                Pamięć Fizyczna (Heap/Stack)
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                <MemoryGrid />
             </div>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-900">
             <AlgorithmGuide />
          </div>
        </aside>

      </div>
    </div>
  );
}

export default App;