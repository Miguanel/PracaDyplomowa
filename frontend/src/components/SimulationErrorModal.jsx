import React from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { AlertTriangle, Terminal, XCircle } from 'lucide-react';

export default function SimulationErrorModal() {
    const simulationError = useMemoryStore((state) => state.simulationError);
    const clearSimulationError = useMemoryStore((state) => state.clearSimulationError);

    if (!simulationError) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all">
            {/* Główny kontener w stylu systemowych okien EduAlgo */}
            <div className="bg-[#0b0c10] border border-red-600/80 rounded-none shadow-[0_0_30px_rgba(220,38,38,0.25)] max-w-lg w-full mx-4 overflow-hidden font-sans">

                {/* Pasek nagłówka okna w stylu terminala */}
                <div className="bg-red-950/40 border-b border-red-900/50 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal size={15} className="text-red-500" />
                        <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
                            SYSTEM_EXCEPTION // KERNEL_HALT
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-red-600 inline-block"></span>
                        <span className="w-2.5 h-2.5 bg-yellow-600 inline-block"></span>
                        <span className="w-2.5 h-2.5 bg-gray-700 inline-block"></span>
                    </div>
                </div>

                {/* Zawartość modala */}
                <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2 bg-red-950/60 border border-red-800/50 text-red-500 shrink-0 mt-0.5">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold tracking-wide text-red-500 uppercase">
                                Krytyczny Błąd Pamięci (Segmentation Fault)
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Maszyna wirtualna wykryła naruszenie struktury wskaźników. Symulacja została wstrzymana.
                            </p>
                        </div>
                    </div>

                    {/* Pole z technicznym komunikatem błędu (styl konsoli) */}
                    <div className="bg-black border border-red-900/40 p-3.5 font-mono text-xs text-red-300 tracking-wide border-l-2 border-l-red-600">
                        <span className="text-gray-500 mr-2">&gt;&gt;</span>
                        {simulationError}
                    </div>

                    {/* Stopka z przyciskiem akcji w surowym, technicznym stylu */}
                    <div className="flex justify-end pt-2 border-t border-gray-900">
                        <button
                            onClick={clearSimulationError}
                            className="px-5 py-2 bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-600 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                        >
                            <XCircle size={14} />
                            Zrozumiałem, zamknij
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}