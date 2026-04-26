import { useRef } from 'react';
import clsx from 'clsx';
import { GripHorizontal, Maximize2, Minimize2, Pin, PinOff } from 'lucide-react';

export const FloatingWindow = ({
  id, title, icon,
  x, y, w, h, pinned, minimized, z, // PROPSY POPRAWNIE ODBIERANE Z APP.JSX
  onPosChange, onSizeChange, onPinToggle, onMinimizeToggle,
  children, minimizedContent, zIndexManager, className,
  headerControls, footerContent
}) => {
  const windowRef = useRef(null);

  const bringToFront = () => zIndexManager(id);

  // --- FIZYKA DRAG ---
  const handleDragStart = (e) => {
    if (pinned || e.target.closest('.nodrag') || e.target.closest('.resizer')) return;
    e.preventDefault();
    bringToFront();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = x;
    const initialPosY = y;

    const handleDrag = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      onPosChange(id, initialPosX + deltaX, initialPosY + deltaY, false);
    };

    const handleDrop = () => {
      onPosChange(id, parseFloat(windowRef.current.style.left) || x, parseFloat(windowRef.current.style.top) || y, true);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDrop);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDrop);
  };

  // --- FIZYKA RESIZE ---
  const handleResizeStart = (e, dir) => {
    if (pinned) return;
    e.preventDefault();
    e.stopPropagation();
    bringToFront();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = w;
    const startH = h;
    const startPosX = x;
    const startPosY = y;

    const handleResizeDrag = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      let newW = startW, newH = startH, newX = startPosX, newY = startPosY;

      if (dir === 'se' || dir === 'ne') newW = Math.max(250, startW + deltaX);
      else { newW = Math.max(250, startW - deltaX); if (newW > 250) newX = startPosX + deltaX; }

      if (dir === 'se' || dir === 'sw') newH = Math.max(150, startH + deltaY);
      else { newH = Math.max(150, startH - deltaY); if (newH > 150) newY = startPosY + deltaY; }

      onSizeChange(id, { w: newW, h: newH }, { x: newX, y: newY }, false);
    };

    const handleResizeDrop = () => {
      onSizeChange(id,
         { w: parseFloat(windowRef.current.style.width) || w, h: parseFloat(windowRef.current.style.height) || h },
         { x: parseFloat(windowRef.current.style.left) || x, y: parseFloat(windowRef.current.style.top) || y },
      true);
      document.removeEventListener('mousemove', handleResizeDrag);
      document.removeEventListener('mouseup', handleResizeDrop);
    };

    document.addEventListener('mousemove', handleResizeDrag);
    document.addEventListener('mouseup', handleResizeDrop);
  };

  return (
    <div
      ref={windowRef}
      onPointerDown={bringToFront}
      data-id={id}
      style={{
          left: x,
          top: y,
          width: w,
          height: minimized ? 'auto' : h,
          zIndex: z
      }}
      className={clsx(
        "floating-window absolute flex flex-col bg-gray-900/95 backdrop-blur-md border shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ease-out group",
        pinned
          ? "border-blue-950 shadow-[0_0_25px_rgba(3,7,18,0.7),_inset_0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-900/40"
          : "border-gray-700 shadow-2xl shadow-black",
        minimized ? "opacity-95" : "opacity-100",
        className
      )}
    >
      <div onMouseDown={handleDragStart} className={clsx("shrink-0 px-3 py-1.5 bg-gray-950/80 border-b border-gray-800 flex justify-between items-center transition-colors z-20 relative", pinned ? "cursor-not-allowed" : "cursor-move hover:bg-gray-900")}>
         <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
            <GripHorizontal size={14} className={pinned ? "text-red-900/50" : "text-gray-600"} />
            <span className="flex items-center gap-1.5">{icon} {title}</span>
         </div>
         <div className="flex items-center gap-2">
            {headerControls && (
                <div className="nodrag flex items-center pr-2 border-r border-gray-700/50 mr-1">
                    {headerControls}
                </div>
            )}
            <button onClick={() => onPinToggle(id)} className={clsx("nodrag p-1 transition-colors", pinned ? "text-red-400 hover:text-red-300" : "text-gray-500 hover:text-white")} title={pinned ? "Odblokuj okno" : "Zablokuj okno"}>
                {pinned ? <Pin size={12} className="fill-current rotate-45" /> : <PinOff size={12} />}
            </button>
            <button onClick={() => onMinimizeToggle(id)} className="nodrag text-gray-500 hover:text-white p-1 transition-colors" title={minimized ? "Rozwiń" : "Zwiń"}>
                {minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            </button>
         </div>
      </div>

      {!minimized ? (
        <div className="flex-1 flex flex-col relative min-h-0 w-full h-full bg-black/40">
           <div className="flex-1 flex flex-col min-h-0 w-full h-full overflow-hidden relative">
              {children}
           </div>
           {footerContent && (
               <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 relative z-20">
                   {footerContent}
               </div>
           )}
        </div>
      ) : (
        <div className="w-full bg-black/30 border-t border-gray-800">
           {minimizedContent}
           <div className="hidden">{children}</div>
        </div>
      )}

      {!minimized && !pinned && (
        <>
          <div onMouseDown={(e) => handleResizeStart(e, 'se')} className="resizer absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[100] opacity-50 hover:opacity-100"><div className="w-full h-full border-b-2 border-r-2 border-gray-500" /></div>
          <div onMouseDown={(e) => handleResizeStart(e, 'sw')} className="resizer absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-[100] opacity-50 hover:opacity-100"><div className="w-full h-full border-b-2 border-l-2 border-gray-500" /></div>
          <div onMouseDown={(e) => handleResizeStart(e, 'nw')} className="resizer absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-[100] opacity-50 hover:opacity-100"><div className="w-full h-full border-t-2 border-l-2 border-gray-500" /></div>
          <div onMouseDown={(e) => handleResizeStart(e, 'ne')} className="resizer absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-[100] opacity-50 hover:opacity-100"><div className="w-full h-full border-t-2 border-r-2 border-gray-500" /></div>
        </>
      )}
    </div>
  );
};