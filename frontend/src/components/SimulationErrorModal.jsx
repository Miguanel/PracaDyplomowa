import React from 'react';
import { useMemoryStore } from '../store/memoryStore'; // Dopasuj ścieżkę do swojego store

export default function SimulationErrorModal() {
    const simulationError = useMemoryStore((state) => state.simulationError);
    const clearSimulationError = useMemoryStore((state) => state.clearSimulationError);

    if (!simulationError) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity">
            <div className="bg-slate-900 border border-red-600 rounded-xl shadow-2xl shadow-red-900/50 p-6 max-w-md w-full mx-4 transform animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-500 uppercase tracking-wide">Krytyczny Błąd Pamięci</h3>
                        <p className="text-sm text-slate-400">Symulator został awaryjnie zatrzymany.</p>
                    </div>
                </div>

                <div className="bg-black/50 border border-red-900/50 rounded-lg p-4 mb-6 font-mono text-sm text-red-300 break-words">
                    {simulationError}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={clearSimulationError}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-red-900/30"
                    >
                        Zrozumiałem, zamknij
                    </button>
                </div>
            </div>
        </div>
    );
}