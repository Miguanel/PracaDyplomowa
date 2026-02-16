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
    <div className="bg-black border border-gray-800 rounded-lg flex flex-col h-48 font-mono text-xs shadow-inner mt-4">
      <div className="bg-gray-900 p-2 border-b border-gray-800 flex items-center gap-2 text-gray-400">
        <Terminal size={12} />
        <span className="uppercase tracking-widest text-[10px]">Pseudocode History</span>
      </div>
      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        {codeHistory.length === 0 ? (
          <div className="text-gray-600 italic">Oczekiwanie na instrukcje...</div>
        ) : (
          codeHistory.map((line, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-gray-600 select-none">{index + 1}</span>
              <span className="text-green-400">{line}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};