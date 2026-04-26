// Ścieżka: src/features/AlgoEditor/BuilderWindow.jsx
import React from 'react';
import { FloatingWindow } from '../../components/FloatingWindow';
import { Wrench } from 'lucide-react';
import { AlgorithmBuilder } from './AlgorithmBuilder'; // Import komponentu z logiką budowania
import clsx from 'clsx';

export const BuilderWindow = ({ windowState, windowActions, zIndexManager }) => {
  // ==========================================================================
  // WIDOK: ZWINIĘTY
  // ==========================================================================
  const MinimizedView = (
    <div className="p-2 bg-gray-950 shadow-inner flex items-center justify-between group cursor-pointer" onClick={() => windowActions.toggleMinimize('builder')}>
        <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400">
            <Wrench size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="font-bold uppercase tracking-widest">Kreator Sandbox...</span>
        </div>
    </div>
  );

  // ==========================================================================
  // WIDOK: ROZWINIĘTY
  // ==========================================================================
  const ExpandedView = (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0c] nodrag">
        {/* Kontener zajmujący całą przestrzeń okna */}
        <div className="flex-1 min-h-0 w-full overflow-hidden relative">
            <AlgorithmBuilder />
        </div>
    </div>
  );

  const dynamicTitle = (
    <span className="flex items-center gap-2">
      Kreator Algorytmów
      {windowState?.minimized && (
        <>
          <span className="text-gray-600 font-normal">|</span>
          <span className="text-blue-400 text-[9px] uppercase tracking-wider truncate mt-0.5">
            Sandbox Mode
          </span>
        </>
      )}
    </span>
  );

  return (
    <FloatingWindow
      id="builder"
      title={dynamicTitle}
      icon={<Wrench size={14} className="text-blue-400" />}
      {...windowState}
      onPosChange={windowActions.updatePos}
      onSizeChange={windowActions.updateSize}
      onPinToggle={windowActions.togglePin}
      onMinimizeToggle={windowActions.toggleMinimize}
      zIndexManager={zIndexManager}
      minimizedContent={MinimizedView}
    >
      {ExpandedView}
    </FloatingWindow>
  );
};