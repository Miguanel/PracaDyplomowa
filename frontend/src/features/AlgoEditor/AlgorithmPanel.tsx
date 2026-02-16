import { useState } from 'react';
import { useMemoryStore, AlgorithmInstruction } from '../../store/memoryStore';
import { Play, ArrowRight, CornerDownRight, Link, Trash2 } from 'lucide-react';

export const AlgorithmPanel = () => {
  const { executeStep, resetMemory } = useMemoryStore(); // Zakładam, że dodamy resetMemory później

  // Stan lokalny
  const [targetVar, setTargetVar] = useState("curr");
  const [sourceVar, setSourceVar] = useState("head");

  // Stan dla modyfikacji wskaźników
  const [modVar, setModVar] = useState("curr");      // Czyj wskaźnik zmieniamy?
  const [modField, setModField] = useState("next");  // Które pole? (next/prev)
  const [modSource, setModSource] = useState("temp"); // Na co ma wskazywać?

  // 1. Inicjalizacja (curr = head)
  const handleAssignVar = () => {
    executeStep({ cmd: "ASSIGN_VAR", var_name: targetVar, source_var: sourceVar });
  };

  // 2. Trawersacja (curr = curr->next)
  const handleTraverse = () => {
    executeStep({
      cmd: "ASSIGN_VAR",
      var_name: targetVar,
      source_var: targetVar,
      field_name: "next"
    });
  };

  // 3. NOWE: Modyfikacja (curr->next = temp)
  const handlePointerMod = () => {
    executeStep({
      cmd: "ASSIGN_FIELD",
      var_name: modVar,    // Np. "curr"
      field_name: modField, // Np. "next"
      source_var: modSource // Np. "temp" (weź adres z temp)
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 shadow-xl">
      <h3 className="text-green-400 font-mono text-sm border-b border-gray-700 pb-2 mb-2 uppercase tracking-wider flex justify-between">
        Konsola Operacyjna
      </h3>

      {/* BLOK 1: Inicjalizacja */}
      <div className="bg-black/40 p-3 rounded border border-gray-800">
        <div className="text-xs text-gray-500 mb-2 font-mono">1. Przypisanie Zmiennej</div>
        <div className="flex items-center gap-2">
          <input value={targetVar} onChange={(e) => setTargetVar(e.target.value)} className="bg-gray-800 text-white w-14 p-1 text-center font-mono rounded border border-gray-600 text-sm" />
          <span className="text-gray-400">=</span>
          <input value={sourceVar} onChange={(e) => setSourceVar(e.target.value)} className="bg-gray-800 text-white w-14 p-1 text-center font-mono rounded border border-gray-600 text-sm" />
          <button onClick={handleAssignVar} className="ml-auto bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded transition-colors"><Play size={14} /></button>
        </div>
      </div>

      {/* BLOK 2: Trawersacja */}
      <div className="bg-black/40 p-3 rounded border border-gray-800">
        <div className="text-xs text-gray-500 mb-2 font-mono">2. Przesunięcie</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-300 font-mono">{targetVar}</span>
          <span className="text-gray-400">=</span>
          <span className="text-green-300 font-mono">{targetVar}</span>
          <span className="text-yellow-500 text-xs">→next</span>
          <button onClick={handleTraverse} className="ml-auto bg-purple-600 hover:bg-purple-500 text-white p-1.5 rounded transition-colors"><CornerDownRight size={14} /></button>
        </div>
      </div>

      {/* BLOK 3: NOWE - Łączenie (Pointer Modification) */}
      <div className="bg-black/40 p-3 rounded border border-green-900/30 border-l-2 border-l-green-500">
        <div className="text-xs text-gray-500 mb-2 font-mono">3. Zmiana Wskaźnika (Link)</div>
        <div className="flex items-center gap-1 text-sm flex-wrap">
          <input value={modVar} onChange={(e) => setModVar(e.target.value)} className="bg-gray-800 text-white w-12 p-1 text-center font-mono rounded border border-gray-600 text-xs" />
          <span className="text-yellow-500 text-xs">→</span>
          <select value={modField} onChange={(e) => setModField(e.target.value)} className="bg-gray-800 text-yellow-500 text-xs p-1 rounded border border-gray-600">
            <option value="next">next</option>
            <option value="prev">prev</option>
          </select>
          <span className="text-gray-400">=</span>
          <input value={modSource} onChange={(e) => setModSource(e.target.value)} className="bg-gray-800 text-white w-12 p-1 text-center font-mono rounded border border-gray-600 text-xs" />

          <button onClick={handlePointerMod} className="ml-auto bg-green-700 hover:bg-green-600 text-white p-1.5 rounded transition-colors flex items-center gap-1 w-full justify-center mt-2">
            <Link size={14} /> POŁĄCZ
          </button>
        </div>
      </div>

    </div>
  );
};