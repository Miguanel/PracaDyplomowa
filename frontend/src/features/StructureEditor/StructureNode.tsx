import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Tag } from 'lucide-react';
import clsx from 'clsx';

// Definicja typów danych węzła
interface NodeData {
  address: string;
  val: number | object;
  variables: string[];
}

export const StructureNode = memo(({ data, selected }: NodeProps<NodeData>) => {

  const displayVal = typeof data.val === 'object' && data.val !== null && 'val' in data.val
    ? (data.val as any).val
    : data.val;

  return (
    // Wrapper (relative)
    <div className="relative group">

      {/* --- 1. GŁÓWNY BLOK WĘZŁA --- */}
      <div
        className={clsx(
          "relative w-40 bg-gray-900 border-2 rounded-lg transition-all duration-300",
          selected
            ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-105 z-40"
            : "border-gray-600 shadow-xl hover:border-gray-500 z-30"
        )}
      >

        {/* PORT WEJŚCIOWY (TARGET) - NA GÓRZE (Teraz ma tu dużo miejsca) */}
        <Handle
            type="target"
            position={Position.Top}
            id="target"
            className="!w-3.5 !h-3.5 !bg-blue-500 !border-2 !border-gray-900 !-top-2.5 !left-1/2 !-translate-x-1/2 transition-all hover:scale-125 hover:!bg-blue-400 z-50"
        />

        {/* --- NAGŁÓWEK (ADRES) --- */}
        <div className="bg-white/5 px-2 py-1.5 border-b border-white/10 flex justify-between items-center rounded-t-md">
          <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">PTR</span>
          <span className="text-[10px] text-pink-500 font-bold font-mono">{data.address}</span>
        </div>

        {/* --- BODY (WARTOŚĆ) --- */}
        <div className="h-16 flex items-center justify-center bg-gradient-to-b from-transparent to-black/30 relative">
            <span className="text-3xl font-black text-white drop-shadow-md font-mono">
                {displayVal}
            </span>
            <span className="absolute top-1 left-2 text-[8px] text-gray-600 font-mono uppercase">val</span>
        </div>

        {/* --- STOPKA (POINTERS NEXT/PREV) --- */}
        <div className="grid grid-cols-2 border-t border-white/10 bg-black/40 text-[9px] font-bold text-gray-400 uppercase tracking-wider divide-x divide-white/10 rounded-b-md">

          {/* Sekcja PREV */}
          <div className="relative py-1.5 text-center hover:bg-white/5 transition-colors group/prev rounded-bl-md">
            <span className="group-hover/prev:text-orange-400 transition-colors">PREV</span>
            <Handle
              type="source"
              position={Position.Left}
              id="prev"
              className="!w-3 !h-3 !bg-orange-500 !border-2 !border-gray-900 !-left-2 !top-1/2 !-translate-y-1/2 transition-all hover:scale-125 hover:!bg-orange-400"
            />
          </div>

          {/* Sekcja NEXT */}
          <div className="relative py-1.5 text-center hover:bg-white/5 transition-colors group/next rounded-br-md">
            <span className="group-hover/next:text-yellow-400 transition-colors">NEXT</span>
            <Handle
              type="source"
              position={Position.Right}
              id="next"
              className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-gray-900 !-right-2 !top-1/2 !-translate-y-1/2 transition-all hover:scale-125 hover:!bg-yellow-400"
            />
          </div>
        </div>

      </div>

      {/* --- 2. ETYKIETY ZMIENNYCH (Teraz pod węzłem) --- */}
      {/* top-full: Zaczynają się pod dolną krawędzią węzła.
          mt-2: Mały odstęp od węzła.
          flex-col: Układamy trójkąt, a pod nim tagi.
      */}
      {data.variables.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[200px] flex flex-col items-center pointer-events-none z-50">

          {/* Trójkąt wskazujący W GÓRĘ (na węzeł) */}
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-purple-600 mb-0.5"></div>

          {/* Lista Tagów */}
          <div className="flex flex-wrap justify-center gap-1">
            {data.variables.map((varName) => (
              <div
                key={varName}
                className="flex items-center gap-1 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded shadow-md border border-purple-400 whitespace-nowrap animate-in slide-in-from-top-2 fade-in duration-300"
              >
                <Tag size={10} className="stroke-[3]" />
                {varName}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
});

StructureNode.displayName = 'StructureNode';