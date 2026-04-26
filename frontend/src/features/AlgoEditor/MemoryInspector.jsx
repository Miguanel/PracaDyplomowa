import { useMemoryStore } from '../../store/memoryStore';
import { Cpu, Tag, ArrowRight, ArrowLeft, Database, CornerDownRight } from 'lucide-react';
import clsx from 'clsx';

export const MemoryInspector = () => {
  const {
    memoryState,
    sandboxMemoryState,
    isSandboxMode
  } = useMemoryStore();

  // Wybór stanu (Prawda vs Symulacja)
  const activeState = (isSandboxMode && sandboxMemoryState) ? sandboxMemoryState : memoryState;

  // Funkcja pomocnicza: Znajdź wszystkie nazwy zmiennych dla danego adresu
  const getVariablesForAddress = (address: string) => {
    if (!activeState.stack) return [];
    return Object.entries(activeState.stack)
      .filter(([_, addr]) => addr === address)
      .map(([name]) => name);
  };

  return (
    <div className={clsx(
      "border rounded-lg flex flex-col h-full overflow-hidden shadow-xl transition-colors",
      isSandboxMode ? "bg-slate-900 border-indigo-500" : "bg-gray-950 border-gray-700"
    )}>

      {/* NAGŁÓWEK */}
      <h3 className={clsx(
        "font-bold text-xs uppercase flex items-center gap-2 p-3 border-b shrink-0",
        isSandboxMode ? "text-indigo-400 border-indigo-900/50" : "text-purple-400 border-gray-800"
      )}>
        <Cpu size={16} />
        {isSandboxMode ? "DEBUGGER PAMIĘCI (SANDBOX)" : "SYSTEMOWY ZRZUT PAMIĘCI (RAM)"}
      </h3>

      {/* ZAWARTOŚĆ - LISTA BLOKÓW */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">

        {/* Pusta pamięć? */}
        {(!activeState.heap || activeState.heap.length === 0) && (
            <div className="text-gray-600 text-xs italic text-center mt-10 flex flex-col items-center gap-2">
                <Database size={24} className="opacity-20" />
                <span>Pamięć sterty jest pusta (NULL).</span>
            </div>
        )}

        {/* Iteracja po węzłach (Heap) */}
        {activeState.heap.map((block) => {
          const variables = getVariablesForAddress(block.address);

          return (
            <div
              key={block.address}
              className={clsx(
                "rounded border p-2 text-xs font-mono relative group transition-all",
                isSandboxMode
                  ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50"
                  : "bg-gray-900/50 border-gray-800 hover:border-purple-500/50"
              )}
            >
              {/* ADRES + ZMIENNE (STACK) */}
              <div className="flex justify-between items-start mb-2 border-b border-gray-700/50 pb-1">
                <span className="text-gray-500 select-all font-bold tracking-wide">
                  {block.address}
                </span>

                {/* Etykiety Zmiennych */}
                <div className="flex flex-wrap gap-1 justify-end max-w-[70%]">
                  {variables.length > 0 ? variables.map(v => (
                    <span key={v} className={clsx(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm",
                      isSandboxMode ? "bg-indigo-600 text-white" : "bg-purple-700 text-purple-100"
                    )}>
                      <Tag size={10} /> {v}
                    </span>
                  )) : (
                    <span className="text-gray-700 text-[10px] italic">Brak referencji</span>
                  )}
                </div>
              </div>

              {/* DANE WĘZŁA (FIELDS) */}
              <div className="grid grid-cols-1 gap-1">

                {/* 1. WARTOŚĆ (VAL) */}
                <div className="flex items-center justify-between bg-black/20 px-2 py-1 rounded">
                    <span className="text-blue-300 font-bold">val</span>
                    <span className="text-white font-bold text-sm">{block.data.val}</span>
                </div>

                {/* 2. POINTERY (NEXT / PREV) */}
                {/* NEXT */}
                <div className="flex items-center justify-between bg-black/20 px-2 py-1 rounded mt-1">
                    <span className="text-yellow-500 flex items-center gap-1">
                        next <ArrowRight size={10} />
                    </span>
                    {block.data.next ? (
                        <span className="text-yellow-300 cursor-pointer hover:underline decoration-yellow-500/50 underline-offset-2">
                            {block.data.next}
                        </span>
                    ) : (
                        <span className="text-gray-600">NULL</span>
                    )}
                </div>

                {/* PREV (Specjalne traktowanie dla prev) */}
                <div className="flex items-center justify-between bg-black/20 px-2 py-1 rounded">
                    <span className="text-orange-500 flex items-center gap-1">
                        prev <ArrowLeft size={10} />
                    </span>
                    {block.data.prev ? (
                        <span className="text-orange-300 cursor-pointer hover:underline decoration-orange-500/50 underline-offset-2">
                            {block.data.prev}
                        </span>
                    ) : (
                        <span className="text-gray-600">NULL</span>
                    )}
                </div>

              </div>

              {/* Ozdobnik w tle */}
              <div className="absolute -right-2 -bottom-2 text-[50px] opacity-[0.03] pointer-events-none rotate-12">
                 <CornerDownRight />
              </div>
            </div>
          );
        })}
      </div>

      {/* STOPKA: DEBUG STOSU (Tylko lista zmiennych) */}
      <div className="p-2 bg-black/20 border-t border-gray-800 text-[10px] text-gray-500 font-mono flex flex-wrap gap-2 items-center">
         <span className="uppercase font-bold opacity-50">Stack Table:</span>
         {Object.entries(activeState.stack || {}).map(([key, val]) => (
             <span key={key} className="hover:text-gray-300 transition-colors">
                 {key}=<span className="text-gray-600">{val}</span>
             </span>
         ))}
      </div>

    </div>
  );
};
