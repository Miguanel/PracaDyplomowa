import { useMemoryStore } from '../store/memoryStore';
import { Cpu, Tag, ArrowRight, ArrowLeft, Database, CornerDownRight } from 'lucide-react';
import clsx from 'clsx';

export const MemoryGrid = () => {
  const {
    memoryState,
    sandboxMemoryState,
    isSandboxMode
  } = useMemoryStore();

  // 1. Wybór stanu: Czy pokazujemy prawdę, czy symulację?
  const activeState = (isSandboxMode && sandboxMemoryState) ? sandboxMemoryState : memoryState;

  // 2. Funkcja pomocnicza: Znajdź wszystkie nazwy zmiennych dla danego adresu
  // Przeszukujemy Stos (Stack), aby znaleźć kto wskazuje na dany adres sterty
  const getVariablesForAddress = (address: string) => {
    if (!activeState?.stack) return [];
    return Object.entries(activeState.stack)
      .filter(([_, addr]) => addr === address)
      .map(([name]) => name);
  };

  return (
    <div className={clsx(
      "border rounded-lg flex flex-col h-full overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-colors duration-500",
      isSandboxMode
        ? "bg-slate-900 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        : "bg-gray-900 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
    )}>

      {/* NAGŁÓWEK */}
      <h3 className={clsx(
        "font-mono font-bold text-xs uppercase flex items-center gap-2 p-3 border-b shrink-0",
        isSandboxMode ? "text-indigo-400 border-indigo-900/50" : "text-green-400 border-gray-800"
      )}>
        <Cpu size={16} />
        {isSandboxMode ? "DEBUGGER PAMIĘCI (SANDBOX MODE)" : "SYSTEMOWY ZRZUT PAMIĘCI (RAM)"}
      </h3>

      {/* ZAWARTOŚĆ - LISTA BLOKÓW */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">

        {/* Pusta pamięć? */}
        {(!activeState?.heap || activeState.heap.length === 0) && (
            <div className="text-gray-600 text-xs italic text-center mt-10 flex flex-col items-center gap-2 opacity-50">
                <Database size={32} />
                <span>Pamięć sterty jest pusta (NULL).</span>
                <span className="text-[10px]">Zaalokuj obiekty, aby zobaczyć dane.</span>
            </div>
        )}

        {/* Iteracja po węzłach (Heap) */}
        {activeState?.heap.map((block) => {
          const variables = getVariablesForAddress(block.address);

          return (
            <div
              key={block.address}
              className={clsx(
                "rounded border p-2 text-xs font-mono relative group transition-all hover:scale-[1.01] duration-200",
                isSandboxMode
                  ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800"
                  : "bg-gray-800/40 border-gray-700 hover:border-green-500/50 hover:bg-gray-800"
              )}
            >
              {/* LINIA 1: ADRES + ZMIENNE (STACK TAGS) */}
              <div className="flex justify-between items-start mb-2 border-b border-white/5 pb-2">
                <span className="text-pink-500 select-all font-bold tracking-wide text-sm">
                  {block.address}
                </span>

                {/* Etykiety Zmiennych (Multilabeling) */}
                <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                  {variables.length > 0 ? variables.map(v => (
                    <span key={v} className={clsx(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm animate-in fade-in zoom-in duration-300",
                      isSandboxMode ? "bg-indigo-600 text-white" : "bg-purple-600 text-white"
                    )}>
                      <Tag size={10} /> {v}
                    </span>
                  )) : (
                    <span className="text-gray-600 text-[10px] italic pt-0.5">Brak referencji (Gargabe?)</span>
                  )}
                </div>
              </div>

              {/* LINIA 2: DANE WĘZŁA (FIELDS) */}
              <div className="grid grid-cols-1 gap-1.5">

                {/* 1. WARTOŚĆ (VAL) */}
                <div className="flex items-center justify-between bg-black/30 px-2 py-1.5 rounded border border-white/5">
                    <span className="text-blue-400 font-bold">val</span>
                    <span className="text-white font-bold text-sm">{block.data.val}</span>
                </div>

                {/* 2. POINTERY (NEXT / PREV) */}
                <div className="grid grid-cols-2 gap-2">
                    {/* PREV */}
                    <div className="flex flex-col bg-black/30 px-2 py-1 rounded border border-white/5">
                        <span className="text-orange-500 flex items-center gap-1 text-[10px] uppercase font-bold mb-0.5">
                            <ArrowLeft size={10} /> prev
                        </span>
                        {block.data.prev ? (
                            <span className="text-orange-300 cursor-pointer hover:underline decoration-orange-500/50 truncate">
                                {block.data.prev}
                            </span>
                        ) : (
                            <span className="text-gray-600">NULL</span>
                        )}
                    </div>

                    {/* NEXT */}
                    <div className="flex flex-col bg-black/30 px-2 py-1 rounded border border-white/5">
                        <span className="text-yellow-500 flex items-center gap-1 text-[10px] uppercase font-bold mb-0.5">
                            next <ArrowRight size={10} />
                        </span>
                        {block.data.next ? (
                            <span className="text-yellow-300 cursor-pointer hover:underline decoration-yellow-500/50 truncate">
                                {block.data.next}
                            </span>
                        ) : (
                            <span className="text-gray-600">NULL</span>
                        )}
                    </div>


                </div>

              </div>

              {/* Ozdobnik w tle */}
              <div className="absolute -right-2 -bottom-2 text-[60px] opacity-[0.02] pointer-events-none rotate-12 text-white">
                 <CornerDownRight />
              </div>
            </div>
          );
        })}
      </div>

      {/* STOPKA: DEBUG STOSU (Tylko lista zmiennych) */}
      <div className="p-2 bg-black/20 border-t border-gray-800 text-[10px] text-gray-500 font-mono overflow-x-auto whitespace-nowrap custom-scrollbar">
         <span className="uppercase font-bold opacity-50 mr-2 text-[9px]">Stack Dump:</span>
         {Object.entries(activeState?.stack || {}).map(([key, val]) => (
             <span key={key} className="inline-block mr-3 hover:text-gray-300 transition-colors cursor-help group relative">
                 <span className={isSandboxMode ? "text-indigo-400" : "text-green-600"}>{key}</span>
                 <span className="text-gray-600">=</span>
                 <span className="text-gray-400">{val}</span>
             </span>
         ))}
      </div>

    </div>
  );
};