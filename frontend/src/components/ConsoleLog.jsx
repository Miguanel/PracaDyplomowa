import { useEffect, useRef } from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { Terminal } from 'lucide-react';

export const ConsoleLog = () => {
  const { codeHistory } = useMemoryStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll na dół
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [codeHistory]);

  return (
    // ZMIANY: Usunięto sztywne h-48 i mt-4. Wstawiono h-full i w-full.
    <div className="bg-[#0a0a0a] flex flex-col h-full w-full font-mono text-xs shadow-inner">

      {/* NAGŁÓWEK - shrink-0 zapobiega jego spłaszczaniu */}
      <div className="bg-gray-950 p-2.5 border-b border-gray-800 flex items-center gap-2 text-gray-400 shrink-0 shadow-sm z-10">
        <Terminal size={14} className="text-orange-500" />
        <span className="uppercase tracking-widest text-[10px] font-bold">Pseudocode History</span>
      </div>

      {/* OBSZAR LOGÓW - flex-1 każe mu zająć całą resztę dostępnej wysokości */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {codeHistory.length === 0 ? (
          <div className="text-gray-600 italic flex items-center justify-center h-full opacity-50">
            Oczekiwanie na instrukcje...
          </div>
        ) : (
          codeHistory.map((line, index) => (
            <div
              key={index}
              className="flex gap-3 hover:bg-white/5 py-0.5 px-1.5 rounded transition-colors"
            >
              <span className="text-gray-600 select-none min-w-[1.5rem] text-right border-r border-gray-800 pr-2">
                {index + 1}
              </span>
              <span className="text-green-400 tracking-wide break-all">
                {line}
              </span>
            </div>
          ))
        )}
        {/* Niewidzialny element do auto-scrollowania */}
        <div ref={bottomRef} className="h-2" />
      </div>

    </div>
  );
};