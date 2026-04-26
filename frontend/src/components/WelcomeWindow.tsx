// Ścieżka: src/components/WelcomeWindow.jsx
import { useState } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { Cpu, Rocket, BookOpen, ShieldCheck, Terminal, Zap, Code2, Globe } from 'lucide-react';
import clsx from 'clsx';

export const WelcomeWindow = ({ zIndexManager, onClose }) => {
  const [state, setState] = useState({
    x: window.innerWidth / 2 - 275,
    y: window.innerHeight / 2 - 225,
    w: 550,
    h: 450,
    minimized: false,
    pinned: false,
    z: 9999 // Zawsze na samym wierzchu przy starcie
  });

  const handlePosChange = (id, x, y) => setState(prev => ({ ...prev, x, y }));
  const handleSizeChange = (id, size, pos) => setState(prev => ({ ...prev, w: size.w, h: size.h, x: pos.x, y: pos.y }));

  // ==========================================================================
  // WIDOK: ZWINIĘTY
  // ==========================================================================
  const MinimizedView = (
    <div className="p-2 bg-blue-900/20 shadow-inner flex items-center justify-between group cursor-pointer" onClick={() => setState(prev => ({...prev, minimized: false}))}>
        <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400">
            <Zap size={14} className="animate-pulse" />
            <span className="font-bold uppercase tracking-widest">System oczekuje na inicjalizację...</span>
        </div>
        <Rocket size={12} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
    </div>
  );

  // ==========================================================================
  // WIDOK: ROZWINIĘTY (3 Sektory)
  // ==========================================================================
  const ExpandedView = (
    <div className="flex flex-col h-full w-full bg-[#0a0a0c] overflow-hidden nodrag">

      {/* SEKTOR 1: NAGŁÓWEK META (Przyklejony) */}
      <div className="shrink-0 p-6 bg-gradient-to-br from-blue-900/20 to-transparent border-b border-gray-800">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="relative p-4 bg-gray-900 border border-blue-500/50 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Cpu size={40} className="text-blue-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              EduAlgo <span className="text-blue-500 text-lg">v2.0</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <div className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] text-blue-400 font-bold tracking-tighter uppercase">Kernel Loaded</div>
                <div className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-[9px] text-green-400 font-bold tracking-tighter uppercase">Visualizer Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEKTOR 2: TREŚĆ (Scrollowana lista możliwości) */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6">

        <div className="grid grid-cols-2 gap-4">
            <FeatureCard
                icon={<ShieldCheck className="text-green-400" size={18} />}
                title="Low-Level Memory"
                desc="Symulacja fizycznego zarządzania adresem w RAM."
            />
            <FeatureCard
                icon={<Code2 className="text-orange-400" size={18} />}
                title="Multi-Language"
                desc="Podgląd kodu w C++, Python, ASM i innych."
            />
            <FeatureCard
                icon={<Terminal className="text-indigo-400" size={18} />}
                title="Live Sandbox"
                desc="Bezpieczne testowanie własnych algorytmów."
            />
            <FeatureCard
                icon={<BookOpen className="text-purple-400" size={18} />}
                title="Narrative Guide"
                desc="Zrozum logiczne 'dlaczego' za każdym krokiem."
            />
        </div>

        <div className="relative p-4 bg-blue-900/5 border border-blue-900/30 rounded-xl overflow-hidden group hover:bg-blue-900/10 transition-colors">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={40} />
            </div>
            <p className="text-[11px] leading-relaxed text-blue-300/80 italic font-mono">
                "System EduAlgo został zaprojektowany, aby zdjąć maskę abstrakcji z programowania. Zobacz struktury danych takimi, jakimi widzi je procesor."
            </p>
        </div>

        <div className="space-y-2">
            <span className="text-[9px] uppercase font-black text-gray-600 tracking-widest">Ostatnie aktualizacje</span>
            <ul className="text-[10px] text-gray-400 space-y-1 list-disc list-inside ml-1 font-mono">
                <li>Ulepszony system trasowania krawędzi (ReactFlow)</li>
                <li>Zintegrowany moduł Stack Dump w oknie RAM</li>
                <li>Dynamiczny system pozycjonowania okien</li>
            </ul>
        </div>
      </div>

      {/* SEKTOR 3: STOPKA (Przyklejony przycisk akcji) */}
      <div className="shrink-0 p-6 bg-gray-950/50 border-t border-gray-800">
        <button
          onClick={onClose}
          className="group relative w-full overflow-hidden rounded-xl p-0.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 animate-gradient-x"></div>
          <div className="relative flex items-center justify-center gap-3 bg-gray-900 px-6 py-3 rounded-[11px] transition-all group-hover:bg-transparent">
             <span className="text-xs font-black tracking-[0.2em] text-white uppercase group-hover:text-white">
                Inicjuj System EduAlgo
             </span>
             <Rocket size={18} className="text-blue-400 group-hover:text-white transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </div>
        </button>
      </div>

    </div>
  );

  return (
    <FloatingWindow
      id="welcome"
      title="System Boot Terminal"
      icon={<Rocket size={14} className="text-blue-400" />}
      {...state}
      onPosChange={handlePosChange}
      onSizeChange={handleSizeChange}
      onPinToggle={() => setState(prev => ({ ...prev, pinned: !prev.pinned }))}
      onMinimizeToggle={() => setState(prev => ({ ...prev, minimized: !prev.minimized }))}
      zIndexManager={zIndexManager}
      minimizedContent={MinimizedView}
    >
      {ExpandedView}
    </FloatingWindow>
  );
};

// Pomocniczy komponent karty cech
const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-3 bg-gray-800/30 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
            {icon}
            <span className="text-[10px] font-black text-white uppercase tracking-tight">{title}</span>
        </div>
        <p className="text-[9px] text-gray-500 leading-tight leading-relaxed">{desc}</p>
    </div>
);