// Ścieżka: src/components/MobileRamStrip.tsx
// Kompaktowy podgląd pamięci RAM na dole ekranu telefonu:
// poziomo przewijana lista bloków sterty (adres, wartość, next/prev, zmienne).
import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { Cpu, Maximize2, Tag } from 'lucide-react';
import { useMemoryStore } from '../store/memoryStore';
import { useMobileLayout } from '../store/mobileLayoutStore';
import { useCssVarHeight } from '../hooks/useCssVarHeight';

const shortAddr = (v: unknown) => (typeof v === 'string' && v.startsWith('0x') ? v : 'NULL');

export const MobileRamStrip = () => {
  const visible = useMobileLayout(s => s.strips.ram);
  const openPanel = useMobileLayout(s => s.openPanel);
  const memoryState = useMemoryStore(s => s.memoryState);
  const sandboxMemoryState = useMemoryStore(s => s.sandboxMemoryState);
  const isSandboxMode = useMemoryStore(s => s.isSandboxMode);
  const highlightedAddress = useMemoryStore(s => s.highlightedAddress);
  const setHighlightedAddress = useMemoryStore(s => s.setHighlightedAddress);

  const ref = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  useCssVarHeight(ref, '--ram-h');

  const activeState = (isSandboxMode && sandboxMemoryState) ? sandboxMemoryState : memoryState;
  const heap = activeState?.heap ?? [];
  const varCount = Object.keys(activeState?.stack ?? {}).length;

  const varsByAddr = useMemo(() => {
    const groups: Record<string, string[]> = {};
    Object.entries(activeState?.stack ?? {}).forEach(([name, addr]) => {
      const key = addr || 'NULL';
      (groups[key] ||= []).push(name);
    });
    return groups;
  }, [activeState]);

  // Nowo zaalokowany blok - przewijamy listę na koniec
  const heapCount = heap.length;
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
  }, [heapCount]);

  return (
    <div ref={ref} className={clsx("mobile-ramstrip fixed left-0 bottom-0 z-[190] bg-gray-950/95 backdrop-blur-md border-t", isSandboxMode ? "border-indigo-800/70" : "border-gray-800", !visible && "hidden")}>
      <div className="flex items-center gap-2 pl-2 pr-1 pt-1">
        <Cpu size={12} className={isSandboxMode ? "text-indigo-400" : "text-green-400"} />
        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex-1 truncate">
          RAM · sterta: <span className="text-white">{heap.length}</span> · zmienne: <span className="text-white">{varCount}</span>
          {isSandboxMode && <span className="text-indigo-400"> · sandbox</span>}
        </span>
        <button onClick={() => openPanel('ram')} className="mobile-icon-btn shrink-0 !w-7 !h-7" aria-label="Rozwiń: RAM" title="Rozwiń: RAM">
          <Maximize2 size={13} />
        </button>
      </div>

      <div ref={listRef} className="flex gap-1.5 overflow-x-auto px-2 pb-1.5 pt-1 no-scrollbar snap-x">
        {heap.length === 0 ? (
          <div className="w-full text-center text-[10px] italic text-gray-600 py-3">Sterta pusta (NULL) - zaalokuj węzły, aby zobaczyć pamięć.</div>
        ) : heap.map((block) => {
          const vars = varsByAddr[block.address] || [];
          const isHi = highlightedAddress === block.address;
          return (
            <button
              key={block.address}
              onClick={() => setHighlightedAddress(isHi ? null : block.address)}
              className={clsx(
                "snap-start shrink-0 w-[104px] !p-1.5 !rounded-md !border text-left font-mono transition-colors",
                isHi ? "!border-blue-500 !bg-blue-900/40" : isSandboxMode ? "!border-slate-700 !bg-slate-900/70" : "!border-gray-700 !bg-gray-900/70"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-pink-500">{block.address}</span>
                <span className="text-[13px] font-black text-white leading-none">{String(block.data.val)}</span>
              </div>
              <div className="flex justify-between text-[8.5px] mt-0.5 leading-tight">
                <span className="text-orange-400">←{shortAddr(block.data.prev)}</span>
                <span className="text-yellow-400">{shortAddr(block.data.next)}→</span>
              </div>
              <div className="flex gap-0.5 mt-0.5 overflow-hidden h-[14px]">
                {vars.length > 0 ? vars.map(v => (
                  <span key={v} className={clsx("inline-flex items-center gap-0.5 px-1 rounded text-[8.5px] font-bold text-white shrink-0", isSandboxMode ? "bg-indigo-600" : "bg-purple-600")}>
                    <Tag size={7} />{v}
                  </span>
                )) : <span className="text-[8.5px] italic text-gray-600">brak wskaźnika</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
