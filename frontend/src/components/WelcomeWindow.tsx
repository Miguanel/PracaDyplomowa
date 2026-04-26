// Ścieżka: src/components/WelcomeWindow.jsx
import { useState, useEffect } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { Cpu, Rocket, BookOpen, ShieldCheck, Terminal, Zap, Code2, Globe, Server, Play, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export const WelcomeWindow = ({ zIndexManager, onStartTutorial, onClose }) => {
  const [state, setState] = useState({
    x: window.innerWidth / 2 - 275,
    y: window.innerHeight / 2 - 240,
    w: 550,
    h: 490,
    minimized: false,
    pinned: false,
    z: 9999
  });

  const [backendStatus, setBackendStatus] = useState('waking'); // 'waking' | 'ready' | 'error'

  // ==========================================================================
  // SPRAWDZANIE STATUSU BACKENDU (Polling)
  // ==========================================================================
  useEffect(() => {
    let intervalId;

    const checkHealth = async () => {
      try {
        // PAMIĘTAJ: Zmień na prawdziwy URL API Twojego backendu na Renderze
        const response = await fetch('http://localhost:8000/', { method: 'GET' });

        if (response.ok) {
          setBackendStatus('ready');
          clearInterval(intervalId); // Zatrzymujemy sprawdzanie, gdy backend wstanie
        }
      } catch (error) {
        // Backend nadal śpi lub jest niedostępny
        setBackendStatus('waking');
      }
    };

    checkHealth(); // Pierwsze sprawdzenie od razu
    intervalId = setInterval(checkHealth, 3000); // Kolejne co 3 sekundy

    return () => clearInterval(intervalId);
  }, []);

  const handlePosChange = (id, x, y) => setState(prev => ({ ...prev, x, y }));
  const handleSizeChange = (id, size, pos) => setState(prev => ({ ...prev, w: size.w, h: size.h, x: pos.x, y: pos.y }));

  const MinimizedView = (
    <div className="p-2 bg-blue-900/20 shadow-inner flex items-center justify-between group cursor-pointer" onClick={() => setState(prev => ({...prev, minimized: false}))}>
        <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400">
            <Zap size={14} className="animate-pulse" />
            <span className="font-bold uppercase tracking-widest">System oczekuje na inicjalizację...</span>
        </div>
        <Rocket size={12} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
    </div>
  );

  const ExpandedView = (
    <div className="flex flex-col h-full w-full bg-[#0a0a0c] overflow-hidden nodrag">

      {/* SEKTOR 1: NAGŁÓWEK META */}
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

      {/* SEKTOR 2: TREŚĆ */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-5">

        {/* DYNAMICZNY PANEL STATUSU BACKENDU */}
        <div className={clsx(
            "flex items-center justify-between p-3 rounded-xl transition-all duration-700 ease-out border",
            backendStatus === 'waking'
                ? "bg-gray-900/80 border-gray-800"
                : "bg-green-900/20 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)] scale-[1.01]"
        )}>
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <Server size={16} className={backendStatus === 'waking' ? "text-gray-500" : "text-green-400"} />
                    <span className={clsx(
                        "text-xs font-mono font-bold uppercase tracking-wider transition-colors",
                        backendStatus === 'waking' ? "text-gray-300" : "text-green-400"
                    )}>
                        Silnik EduAlgo (Backend)
                    </span>
                </div>
                {backendStatus === 'waking' ? (
                    <span className="text-[10px] text-gray-500 mt-1 italic font-mono">
                        Darmowy serwer się wybudza. Proszę o cierpliwość...
                    </span>
                ) : (
                    <span className="text-[10px] text-green-300/80 mt-1 italic font-mono flex items-center gap-1 animate-in fade-in duration-500">
                        <CheckCircle2 size={12} className="text-green-400" />
                        Serwer wybudzony! System w pełni operacyjny.
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0 bg-black/40 px-2 py-1.5 rounded-lg border border-white/5">
                {backendStatus === 'waking' ? (
                    <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                        <span className="text-[10px] text-yellow-500 font-bold animate-pulse">BUDZENIE (~50s)</span>
                    </>
                ) : (
                    <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                        </span>
                        <span className="text-[11px] text-green-400 font-black tracking-widest">GOTOWY</span>
                    </>
                )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FeatureCard icon={<ShieldCheck className="text-green-400" size={16} />} title="Low-Level Memory" desc="Symulacja fizycznego zarządzania adresem w RAM." />
            <FeatureCard icon={<Code2 className="text-orange-400" size={16} />} title="Multi-Language" desc="Podgląd kodu w C++, Python, ASM i innych." />
            <FeatureCard icon={<Terminal className="text-indigo-400" size={16} />} title="Live Sandbox" desc="Bezpieczne testowanie własnych algorytmów." />
            <FeatureCard icon={<BookOpen className="text-purple-400" size={16} />} title="Narrative Guide" desc="Zrozum logiczne 'dlaczego' za każdym krokiem." />
        </div>

        <div className="relative p-4 bg-blue-900/5 border border-blue-900/30 rounded-xl overflow-hidden group hover:bg-blue-900/10 transition-colors">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe size={40} />
            </div>
            <p className="text-[11px] leading-relaxed text-blue-300/80 italic font-mono">
                "System EduAlgo został zaprojektowany, aby zdjąć maskę abstrakcji z programowania. Zobacz struktury danych takimi, jakimi widzi je procesor."
            </p>
        </div>
      </div>

      {/* SEKTOR 3: STOPKA (Przycisk Poradnika) */}
      <div className="shrink-0 p-4 bg-gray-950/50 border-t border-gray-800 flex flex-col gap-2">
        <button
          onClick={onStartTutorial}
          className={clsx(
            "group relative w-full overflow-hidden rounded-xl p-0.5 transition-all hover:scale-[1.01] active:scale-[0.99]",
            backendStatus === 'ready' ? "shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-in slide-in-from-bottom-2 duration-500" : ""
          )}
        >
          <div className={clsx(
              "absolute inset-0 animate-gradient-x",
              backendStatus === 'ready' ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"
          )}></div>
          <div className="relative flex items-center justify-center gap-3 bg-gray-900 px-6 py-3 rounded-[10px] transition-all group-hover:bg-transparent">
             <Play size={16} className={clsx("transition-colors", backendStatus === 'ready' ? "text-green-400 group-hover:text-white" : "text-blue-400 group-hover:text-white")} />
             <span className="text-xs font-black tracking-[0.15em] text-white uppercase group-hover:text-white shadow-black drop-shadow-md">
                Rozpocznij Poradnik
             </span>
          </div>
        </button>
        <button
            onClick={onClose}
            className="text-[10px] text-gray-500 hover:text-gray-300 font-bold tracking-widest uppercase transition-colors py-1"
        >
            Pomiń i wejdź do systemu
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

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-3 bg-gray-800/30 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
            {icon}
            <span className="text-[9px] font-black text-white uppercase tracking-tight">{title}</span>
        </div>
        <p className="text-[9px] text-gray-500 leading-tight">{desc}</p>
    </div>
);