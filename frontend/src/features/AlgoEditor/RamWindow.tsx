// Ścieżka: src/features/AlgoEditor/RamWindow.tsx
import React, { useMemo } from 'react';
import { FloatingWindow } from '../../components/FloatingWindow';
import { useMemoryStore } from '../../store/memoryStore';
import { Cpu, Tag, ArrowRight, ArrowLeft, Database, CornerDownRight, Layers } from 'lucide-react';
import clsx from 'clsx';

export const RamWindow = ({ windowState, windowActions, zIndexManager }) => {
  const {
    memoryState,
    sandboxMemoryState,
    isSandboxMode,
    highlightedAddress,
    setHighlightedAddress
  } = useMemoryStore();

  const activeState = (isSandboxMode && sandboxMemoryState) ? sandboxMemoryState : memoryState;

  // ==========================================================================
  // LOGIKA GRUPOWANIA ZMIENNYCH (STACK DUMP)
  // Grupujemy wszystkie zmienne globalne według adresu, na który wskazują.
  // ==========================================================================
  const stackGrouped = useMemo(() => {
    const groups = {};
    if (activeState?.stack) {
        Object.entries(activeState.stack).forEach(([varName, address]) => {
            const addr = address || "NULL";
            if (!groups[addr]) groups[addr] = [];
            groups[addr].push(varName);
        });
    }
    return groups;
  }, [activeState?.stack]);

  // ==========================================================================
  // KOMPONENT: ULEPSZONY STACK DUMP (Pionowa lista)
  // Będzie używany zarówno na dole okna, jak i w widoku zwiniętym!
  // ==========================================================================
  const ImprovedStackDump = (
    // Zmieniono max-h-[160px] na dopasowanie elastyczne
    <div className="flex flex-col w-full bg-gray-950 font-mono text-[10px] overflow-y-auto custom-scrollbar nodrag">
        <div className="flex justify-between items-center p-2 border-b border-gray-800 bg-gray-900/50 shrink-0 sticky top-0 z-10">
            <span className="uppercase font-bold text-gray-500 text-[9px] flex items-center gap-1.5">
                <Layers size={12} className={isSandboxMode ? "text-indigo-400" : "text-green-500"} />
                Zrzut Stosu (Zmienne)
            </span>
            <span className="text-[9px] text-gray-600 font-bold">
                Łącznie: {Object.keys(activeState?.stack || {}).length}
            </span>
        </div>

        <div className="p-2 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar max-h-[160px]">
            {Object.keys(stackGrouped).length === 0 ? (
                <span className="italic text-gray-600 flex justify-center py-2">Brak zmiennych globalnych</span>
            ) : (
                Object.entries(stackGrouped).map(([addr, vars]) => (
                    <div key={addr} className="flex items-start gap-2 bg-black/40 p-1.5 rounded border border-gray-800/50 hover:border-gray-700 transition-colors">
                        <span className={clsx(
                            "font-bold shrink-0 mt-0.5 min-w-[3.5rem]",
                            addr === "NULL" ? "text-gray-600" : "text-pink-500"
                        )}>
                            {addr}
                        </span>
                        <span className="text-gray-700 mt-0.5">→</span>
                        <div className="flex flex-wrap gap-1">
                            {vars.map(v => (
                                <span key={v} className={clsx(
                                    "px-1.5 py-0.5 rounded shadow-sm border font-bold tracking-wider",
                                    isSandboxMode
                                      ? "bg-indigo-900/30 border-indigo-700/50 text-indigo-300"
                                      : "bg-green-900/20 border-green-800/50 text-green-400"
                                )}>
                                    {v}
                                </span>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  // ==========================================================================
  // WIDOK: ZWINIĘTY (Teraz to po prostu ulepszony Stack Dump)
  // ==========================================================================
  const MinimizedView = (
    <div className="w-full">
        {ImprovedStackDump}
    </div>
  );

  // ==========================================================================
  // WIDOK: ROZWINIĘTY
  // ==========================================================================
  const ExpandedView = (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0c] nodrag">

      {/* SEKTOR 1: GÓRA (Tytuł Trybu) */}
      <div className={clsx(
        "shrink-0 p-2.5 border-b flex items-center gap-2 text-[10px] font-bold uppercase shadow-sm z-10",
        isSandboxMode ? "bg-slate-900/90 text-indigo-400 border-indigo-900/50" : "bg-gray-950 text-green-400 border-gray-800"
      )}>
        <Cpu size={14} />
        {isSandboxMode ? "DEBUGGER PAMIĘCI (SANDBOX)" : "SYSTEMOWY ZRZUT PAMIĘCI (RAM)"}
      </div>

      {/* SEKTOR 2: ŚRODEK (Przewijana lista bloków sterty - usunięto poziomy scrollbar!) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar space-y-3 relative z-0">
        {(!activeState?.heap || activeState.heap.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 text-xs italic opacity-50">
                <Database size={32} className="mb-3" />
                <span>Pamięć sterty jest pusta (NULL).</span>
                <span className="text-[10px] mt-1">Zaalokuj obiekty, aby zobaczyć dane.</span>
            </div>
        ) : (
            activeState.heap.map((block) => {
              // Tu pobieramy tylko po to, by pokazać małe etykietki na samym bloku
              const variables = stackGrouped[block.address] || [];

              return (
                <div
                  key={block.address}
                  onClick={() => setHighlightedAddress(highlightedAddress === block.address ? null : block.address)}
                  className={clsx(
                    "rounded border p-2 text-xs font-mono relative group transition-all duration-200 cursor-pointer w-full",
                    highlightedAddress === block.address
                      ? "scale-[1.02] border-blue-500 bg-blue-900/30 shadow-[0_0_15px_rgba(59,130,246,0.4)] z-10"
                      : isSandboxMode
                        ? "bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 hover:scale-[1.01]"
                        : "bg-gray-800/40 border-gray-700 hover:border-green-500/50 hover:bg-gray-800 hover:scale-[1.01]"
                  )}
                >
                  <div className="flex justify-between items-start mb-2 border-b border-white/5 pb-2">
                    <span className="text-pink-500 select-all font-bold tracking-wide text-sm shrink-0">
                      {block.address}
                    </span>

                    <div className="flex flex-wrap gap-1 justify-end min-w-0 ml-2">
                      {variables.length > 0 ? variables.map(v => (
                        <span key={v} className={clsx(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm animate-in fade-in zoom-in duration-300",
                          isSandboxMode ? "bg-indigo-600 text-white" : "bg-purple-600 text-white"
                        )}>
                          <Tag size={10} /> {v}
                        </span>
                      )) : (
                        <span className="text-gray-600 text-[10px] italic pt-0.5">Garbage?</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex items-center justify-between bg-black/30 px-2 py-1.5 rounded border border-white/5">
                        <span className="text-blue-400 font-bold">val</span>
                        <span className="text-white font-bold text-sm truncate ml-2">{block.data.val}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col bg-black/30 px-2 py-1 rounded border border-white/5 overflow-hidden">
                            <span className="text-orange-500 flex items-center gap-1 text-[10px] uppercase font-bold mb-0.5">
                                <ArrowLeft size={10} /> prev
                            </span>
                            <span className={clsx("truncate", block.data.prev ? "text-orange-300 hover:underline decoration-orange-500/50" : "text-gray-600")}>
                                {block.data.prev || "NULL"}
                            </span>
                        </div>

                        <div className="flex flex-col bg-black/30 px-2 py-1 rounded border border-white/5 overflow-hidden">
                            <span className="text-yellow-500 flex items-center gap-1 text-[10px] uppercase font-bold mb-0.5">
                                next <ArrowRight size={10} />
                            </span>
                            <span className={clsx("truncate", block.data.next ? "text-yellow-300 hover:underline decoration-yellow-500/50" : "text-gray-600")}>
                                {block.data.next || "NULL"}
                            </span>
                        </div>
                    </div>
                  </div>

                  <div className="absolute -right-2 -bottom-2 text-[60px] opacity-[0.02] pointer-events-none rotate-12 text-white">
                     <CornerDownRight />
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* SEKTOR 3: DÓŁ (Wstrzykujemy gotowy ulepszony Stack Dump) */}
      <div className="shrink-0 border-t border-gray-800 z-20 bg-gray-950">
         {ImprovedStackDump}
      </div>

    </div>
  );

  const dynamicTitle = (
    <span className="flex items-center gap-2">
      RAM
      {windowState?.minimized && (
        <>
          <span className="text-gray-600 font-normal">|</span>
          <span className="text-gray-400 text-[9px] uppercase tracking-wider truncate max-w-[180px] mt-0.5">
             Tylko Stos
          </span>
        </>
      )}
    </span>
  );

  return (
    <FloatingWindow
      id="ram"
      title={dynamicTitle}
      icon={<Cpu size={14} className={isSandboxMode ? "text-indigo-400" : "text-green-400"} />}
      {...windowState}
      onPosChange={windowActions.updatePos}
      onSizeChange={windowActions.updateSize}
      onPinToggle={windowActions.togglePin}
      onMinimizeToggle={windowActions.toggleMinimize}
      zIndexManager={zIndexManager}
      minimizedContent={MinimizedView}
      className={isSandboxMode ? "border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : ""}
    >
      {ExpandedView}
    </FloatingWindow>
  );
};