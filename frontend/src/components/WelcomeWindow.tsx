// Ścieżka: src/components/WelcomeWindow.jsx
import { useState, useEffect, useCallback } from 'react';
import { FloatingWindow } from './FloatingWindow';
import { Cpu, Rocket, BookOpen, ShieldCheck, Terminal, Zap, Code2, Globe, Server, Play, CheckCircle2, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// ⚠️ WAŻNE: WPISZ TUTAJ SWÓJ ADRES BACKENDU Z RENDER.COM
// Zwróć uwagę, żeby usunąć znak ukośnika "/" na samym końcu adresu!
// ============================================================================
const BACKEND_URL = 'https://edualgo-backend.onrender.com';

export const WelcomeWindow = ({ zIndexManager, onStartTutorial, onClose }) => {
  const FIXED_WIDTH = 550;
  const FIXED_HEIGHT = 600;

  const [state, setState] = useState({
    x: window.innerWidth / 2 - FIXED_WIDTH / 2,
    y: window.innerHeight / 2 - FIXED_HEIGHT / 2,
    w: FIXED_WIDTH,
    h: FIXED_HEIGHT,
    minimized: false,
    pinned: false,
    z: 9999
  });

  // Statusy: 'checking' | 'sleeping' | 'waking' | 'ready'
  const [backendStatus, setBackendStatus] = useState('checking');

  // --- FUNKCJA SPRAWDZAJĄCA ---
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/`, { method: 'GET' });
      if (response.ok) {
        setBackendStatus('ready');
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }, []);

  // --- LOGIKA POLLINGU ---
  useEffect(() => {
    let intervalId;

    if (backendStatus === 'checking') {
      checkHealth().then(isUp => {
        if (!isUp) setBackendStatus('sleeping');
      });
    }

    // Jeśli kliknięto wybudzanie, sprawdzaj co 3 sekundy czy już wstał
    if (backendStatus === 'waking') {
      intervalId = setInterval(async () => {
        const isUp = await checkHealth();
        if (isUp) clearInterval(intervalId);
      }, 3000);
    }

    return () => clearInterval(intervalId);
  }, [backendStatus, checkHealth]);

  // --- WYMUSZONE BUDZENIE (NOWA KARTA) ---
  const handleWakeBackend = () => {
    setBackendStatus('waking');
    // Bezpośrednie uderzenie w serwer wymusza na Renderze start kontenera
    window.open(`${BACKEND_URL}/`, '_blank', 'noopener,noreferrer');
  };

  const handlePosChange = (id, x, y) => setState(prev => ({ ...prev, x, y }));
  const handleSizeChange = () => {};

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
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0c] overflow-hidden nodrag rounded-lg">

      {/* SEKTOR 1: NAGŁÓWEK META */}
      <div className="shrink-0 p-6 bg-gradient-to-br from-blue-900/20 to-transparent border-b border-gray-800 relative z-10">
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
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-5 relative z-0">

        {/* DYNAMICZNY PANEL STATUSU BACKENDU */}
        <div className={clsx(
            "flex items-center justify-between p-4 rounded-xl transition-all duration-700 ease-out border",
            backendStatus === 'ready'
              ? "bg-green-900/20 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
              : "bg-gray-900/80 border-gray-800"
        )}>
            <div className="flex flex-col gap-1 w-full max-w-[280px]">
                <div className="flex items-center gap-2">
                    <Server size={16} className={clsx(
                      backendStatus === 'ready' ? "text-green-400" : "text-gray-500"
                    )} />
                    <span className={clsx(
                        "text-xs font-mono font-bold uppercase tracking-wider",
                        backendStatus === 'ready' ? "text-green-400" : "text-gray-300"
                    )}>
                        Status Silnika (Backend)
                    </span>
                </div>
                <span className="text-[10px] font-mono italic">
                    {backendStatus === 'checking' && "Inicjalizacja połączenia..."}
                    {backendStatus === 'sleeping' && <span className="text-gray-500">Silnik aktualnie śpi. Wymagane twarde wybudzenie (nowa karta).</span>}
                    {backendStatus === 'waking' && <span className="text-yellow-500 animate-pulse">Nowa karta została otwarta. Oczekuję na uruchomienie maszyny...</span>}
                    {backendStatus === 'ready' && <span className="text-green-400">Połączenie nawiązane. Backend w pełni operacyjny. Możesz zamknąć drugą kartę.</span>}
                </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {backendStatus === 'sleeping' && (
                <button
                  onClick={handleWakeBackend}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black tracking-widest transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  OBUDŹ BACKEND <ExternalLink size={12} />
                </button>
              )}

              {backendStatus !== 'sleeping' && (
                <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                    {backendStatus === 'ready' ? (
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                          </span>
                          <span className="text-[10px] text-green-400 font-black tracking-widest">GOTOWY</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            "h-2 w-2 rounded-full",
                            backendStatus === 'waking' ? "bg-yellow-500 animate-pulse" : "bg-gray-700"
                          )}></span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {backendStatus === 'waking' ? "BUDZENIE..." : "SPRAWDZAM..."}
                          </span>
                        </div>
                    )}
                </div>
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

      {/* SEKTOR 3: STOPKA */}
      <div className="shrink-0 p-4 bg-gray-950 border-t border-gray-800 flex flex-col gap-2 relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button
          onClick={onStartTutorial}
          className={clsx(
            "group relative w-full overflow-hidden rounded-xl p-0.5 transition-all hover:scale-[1.01] active:scale-[0.99]",
            backendStatus === 'ready' ? "shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "opacity-50 grayscale cursor-not-allowed"
          )}
          disabled={backendStatus !== 'ready'}
        >
          <div className={clsx(
              "absolute inset-0 animate-gradient-x",
              backendStatus === 'ready' ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500" : "bg-gray-700"
          )}></div>
          <div className="relative flex items-center justify-center gap-3 bg-gray-900 px-6 py-3 rounded-[10px] transition-all group-hover:bg-transparent">
             <Play size={16} className={clsx("transition-colors", backendStatus === 'ready' ? "text-green-400 group-hover:text-white" : "text-gray-500")} />
             <span className="text-xs font-black tracking-[0.15em] text-white uppercase shadow-black drop-shadow-md">
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
      w={FIXED_WIDTH}
      h={FIXED_HEIGHT}
      onPosChange={handlePosChange}
      onSizeChange={handleSizeChange}
      onPinToggle={() => setState(prev => ({ ...prev, pinned: !prev.pinned }))}
      onMinimizeToggle={() => setState(prev => ({ ...prev, minimized: !prev.minimized }))}
      zIndexManager={zIndexManager}
      minimizedContent={MinimizedView}
      className="disable-resizer"
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