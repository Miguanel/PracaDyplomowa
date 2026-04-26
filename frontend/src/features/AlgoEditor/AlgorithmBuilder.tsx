import { useState, useEffect } from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import type { AlgorithmInstruction } from '../../store/memoryStore';
import { ALGORITHMS_DB } from '../../data/algorithms';
import { Save, Plus, Layers, Info, Play, Pause, SkipForward, RotateCcw, Trash2, X, BookOpen, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { INSTRUCTION_DEFS } from './instructionDefinitions';
import type { InstructionType } from './instructionDefinitions';
import clsx from 'clsx';
// --- KOMPONENTY POMOCNICZE ---



interface InputVarSmartProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  listId: string;
  availableVars: string[];
  fullWidth?: boolean;
}

const InputVarSmart = ({ value, onChange, placeholder, listId, availableVars, fullWidth = false }: InputVarSmartProps) => (
  <div className={clsx("relative group", fullWidth ? "w-full" : "w-auto")}>
    <input
        list={listId}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className={clsx(
            "bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 text-center placeholder-gray-500 focus:border-blue-500 outline-none font-mono transition-all",
            fullWidth ? "w-full" : "w-24"
        )}
        autoComplete="off"
    />
    <datalist id={listId}>
        {availableVars.map(v => <option key={v} value={v} />)}
    </datalist>
  </div>
);

interface InputValProps {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  width?: string;
}

const InputVal = ({ value, onChange, placeholder = "Val", width = "w-20" }: InputValProps) => (
  <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`bg-gray-800 text-white text-xs p-2 rounded border border-gray-600 text-center placeholder-gray-500 focus:border-blue-500 outline-none font-mono ${width}`}
  />
);

interface SelectFieldProps {
  value: string;
  onChange: (val: string) => void;
}

const SelectField = ({ value, onChange }: SelectFieldProps) => (
  <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-700 text-yellow-400 font-mono text-xs p-2 rounded border border-gray-600 outline-none cursor-pointer hover:bg-gray-600"
  >
      <option value="next">-&gt; next</option>
      <option value="prev">-&gt; prev</option>
  </select>
);

// --- GŁÓWNY KOMPONENT ---

export const AlgorithmBuilder = () => {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Delikatne opóźnienie wyzwala animację po załadowaniu DOM
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const {
      customAlgorithms,
      fetchAlgorithms,
      saveCustomAlgorithm,
      memoryState,
      enterSandboxMode,
      exitSandboxMode,
      executeSandboxStep,
      isSandboxMode,
      loadAlgorithm,
      setDraftAlgorithm,
      clearAlgorithm,
  } = useMemoryStore();

  // STANY NOWEGO UI
  const [showLibrary, setShowLibrary] = useState(false);

  const [algoName, setAlgoName] = useState("");
  const [algoDesc, setAlgoDesc] = useState("");
  const [steps, setSteps] = useState<AlgorithmInstruction[]>([]);
  const [selectedCmd, setSelectedCmd] = useState<InstructionType>("ASSIGN_VAR");

  const [inputs, setInputs] = useState({
    var_name: "",
    source_var: "",
    val_payload: "",
    x: "",
    y: "",
    compareTarget: "",
    explanation: ""
  });

  const [group, setGroup] = useState("Faza 1");
  const availableVars = Object.keys(memoryState.stack || {});
  const [selectedField, setSelectedField] = useState<string>("next");

  const [previewIndex, setPreviewIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { fetchAlgorithms(); }, [fetchAlgorithms]);
  useEffect(() => { if (previewIndex >= steps.length) setPreviewIndex(steps.length - 1);},[steps.length, previewIndex]);

  // --- LOGIKA TESTOWANIA ---
  const handleExitSandbox = () => {
      setIsPlaying(false);
      setPreviewIndex(-1);
      exitSandboxMode();
  };

  const runNextStep = async () => {
      if (!isSandboxMode) await enterSandboxMode();
      const nextIdx = previewIndex + 1;
      if (nextIdx < steps.length) {
          const stepToRun = steps[nextIdx];
          try {
              await executeSandboxStep(stepToRun);
              setPreviewIndex(nextIdx);
          } catch (e) {
              console.error(e);
              setIsPlaying(false);
              handleExitSandbox();
          }
      } else {
          setIsPlaying(false);
      }
  };

  useEffect(() => {
      let interval: number | undefined;
      if (isPlaying) {
          interval = window.setInterval(() => {
              if (previewIndex < steps.length - 1) runNextStep();
              else setIsPlaying(false);
          }, 800);
      }
      return () => clearInterval(interval);
  }, [isPlaying, previewIndex, steps, isSandboxMode]);

  useEffect(() => {
    setDraftAlgorithm({
      id: 'draft',
      title: algoName || 'Kreator: Nowy Algorytm',
      description: algoDesc || 'Krótki opis scenariusza edukacyjnego...',
      codeLines: [],
      steps: steps
    }, previewIndex);
  }, [algoName, algoDesc, steps, previewIndex, setDraftAlgorithm]);

  useEffect(() => {
    return () => { clearAlgorithm(); };
  }, [clearAlgorithm]);

  // --- HANDLERS ---
  const handleCmdChange = (cmd: string) => {
    setSelectedCmd(cmd as InstructionType);
    setInputs({ var_name: "", source_var: "", val_payload: "", x: "", y: "", compareTarget: "", explanation: "" });
    if (cmd === "ASSIGN_FIELD" || cmd === "STEP_FORWARD" || cmd === "SET_FIELD_NULL") setSelectedField("next");
    else if (cmd === "COMPARE") setSelectedField("==");
    else setSelectedField("");
  };

  const addStep = () => {
    if (isSandboxMode) handleExitSandbox();
    const def = INSTRUCTION_DEFS[selectedCmd];
    const newStep: any = { cmd: def.cmd, explanation: inputs.explanation, group: group };

    if (def.inputs.includes("var_name") && !inputs.var_name) return alert("Wpisz zmienną!");

    if (def.inputs.includes("var_name")) newStep.var_name = inputs.var_name;
    if (def.inputs.includes("source_var")) newStep.source_var = inputs.source_var;
    if (def.inputs.includes("field_name")) newStep.field_name = selectedField;
    if (inputs.explanation) newStep.explanation = inputs.explanation;

    if (def.cmd === "ALLOC") {
        const val = parseInt(inputs.val_payload) || 0;
        const posX = inputs.x ? parseInt(inputs.x) : undefined;
        const posY = inputs.y ? parseInt(inputs.y) : undefined;
        newStep.val_payload = {
            val: val, next: null, prev: null,
            ...(posX !== undefined && { x: posX }),
            ...(posY !== undefined && { y: posY })
        };
    } else if (def.cmd === "COMPARE") {
        newStep.val_payload = {
            targetNode: inputs.compareTarget || "result",
            compareMode: inputs.source_var ? "variable" : "number",
            rightValue: inputs.source_var ? inputs.source_var : (parseInt(inputs.val_payload) || 0)
        };
        delete newStep.source_var;
    } else if (def.inputs.includes("val_payload")) {
        newStep.val_payload = parseInt(inputs.val_payload) || 0;
    }

    setSteps([...steps, newStep]);
    setInputs(prev => ({ ...prev, explanation: "" }));
  };

  const handleRemoveStep = (indexToRemove: number) => {
      if (isSandboxMode) handleExitSandbox();
      const newSteps = steps.filter((_, i) => i !== indexToRemove);
      setSteps(newSteps);
      if (previewIndex >= newSteps.length) setPreviewIndex(newSteps.length - 1);
  };

  const importAlgorithm = (algoId: string) => {
    if (!algoId) return;
    if (isSandboxMode) handleExitSandbox();

    let algoToImport = ALGORITHMS_DB.find(a => a.id === algoId);
    if (!algoToImport) algoToImport = customAlgorithms.find(a => a.id === algoId);

    if (algoToImport) {
        setAlgoName(algoToImport.title);
        setAlgoDesc(algoToImport.description);
        setSteps([...algoToImport.steps]);
        loadAlgorithm(algoToImport);
        setShowLibrary(false); // Zwijamy po wybraniu
    }
  };

  const handleSave = () => {
    if (!algoName) return alert("Podaj nazwę algorytmu!");
    saveCustomAlgorithm({
      id: algoName.toLowerCase().replace(/\s/g, '_'),
      title: algoName,
      description: algoDesc || "Algorytm użytkownika",
      codeLines: [],
      steps: steps
    });
    alert("Pomyślnie zapisano do Twoich Algorytmów!");
    setSteps([]);
    setAlgoName("");
    setAlgoDesc("");
    handleExitSandbox();
  };

  const currentDef = INSTRUCTION_DEFS[selectedCmd];
  const groupedOptions = Object.values(INSTRUCTION_DEFS).reduce((acc, def) => {
      if (!acc[def.category]) acc[def.category] = [];
      acc[def.category].push(def);
      return acc;
  }, {} as Record<string, typeof INSTRUCTION_DEFS[keyof typeof INSTRUCTION_DEFS][]>);

  const handleNextPhase = () => {
      const match = group.match(/(.*?)(\d+)(\s*)$/);
      if (match) {
          const num = parseInt(match[2], 10);
          setGroup(`${match[1]}${num + 1}${match[3]}`);
      } else {
          setGroup(group ? `${group} 2` : "Faza 1");
      }
  };

  return (
    <div className="flex flex-col h-full w-full">

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">

        {/* --- 1. BIBLIOTEKA (ZWIJANA) --- */}
        <div className="shrink-0">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="w-full flex items-center justify-between p-2 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-800/50 rounded transition-colors"
          >
            <span className="flex items-center gap-2 text-xs font-bold tracking-wider">
               <BookOpen size={16} /> DODAJ ALGORYTM Z BIBLIOTEKI
            </span>
            {showLibrary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showLibrary && (
            <div className="mt-2 p-3 bg-gray-950 border border-indigo-900/50 rounded shadow-inner animate-in fade-in duration-200">
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Wybierz gotowy szablon</label>
              <select
                onChange={(e) => importAlgorithm(e.target.value)}
                defaultValue=""
                className="w-full bg-gray-900 text-gray-300 text-xs p-2 rounded border border-gray-700 outline-none focus:border-indigo-500"
              >
                <option value="" disabled>-- Kliknij, aby wybrać --</option>
                <optgroup label="Baza Wiedzy EduAlgo">
                    {ALGORITHMS_DB.map(algo => (
                        <option key={algo.id} value={algo.id}>{algo.title}</option>
                    ))}
                </optgroup>
                <optgroup label="Twoje Zapisane Algorytmy">
                    {customAlgorithms.map(algo => (
                        <option key={algo.id} value={algo.id}>{algo.title}</option>
                    ))}
                </optgroup>
              </select>
            </div>
          )}
        </div>

        {/* --- 2. NAZWA I OPIS (META) --- */}
        <div className="flex flex-col gap-2 shrink-0">
           <input
             value={algoName}
             onChange={(e) => setAlgoName(e.target.value)}
             placeholder="Tytuł (np. Sortowanie Bąbelkowe)"
             className="w-full bg-gray-950 text-white font-bold p-2.5 rounded border border-gray-800 outline-none focus:border-blue-500 focus:bg-gray-900 transition-colors"
           />
           <textarea
             value={algoDesc}
             onChange={(e) => setAlgoDesc(e.target.value)}
             placeholder="Opisz fabułę algorytmu. Ten tekst pojawi się w Przewodniku Narracyjnym na samym początku..."
             className="w-full bg-gray-950 text-gray-300 text-xs p-2.5 rounded border border-gray-800 outline-none focus:border-blue-500 focus:bg-gray-900 transition-colors resize-none custom-scrollbar"
             rows={2}
           />
        </div>

        {/* --- 3. FORMULARZ DODAWANIA KROKU --- */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-sm shrink-0">
            <div className="p-3 border-b border-gray-800 bg-gray-800/20">
                <select
                    value={selectedCmd}
                    onChange={e => handleCmdChange(e.target.value)}
                    className="bg-gray-950 text-sm p-2 rounded border border-gray-700 text-blue-300 font-bold w-full focus:border-blue-500 outline-none cursor-pointer hover:bg-gray-900 transition-colors"
                >
                     {Object.entries(groupedOptions).map(([category, options]) => (
                        <optgroup key={category} label={category}>
                            {options.map(def => (
                                <option key={def.cmd} value={def.cmd}>{def.label}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <div className="mt-2 text-[10px] text-gray-500 flex gap-1 items-center bg-black/40 p-1.5 rounded">
                    <Info size={12} className="text-blue-400" />
                    <span className="font-mono text-gray-400">{currentDef.syntax}</span>
                </div>
            </div>

            <div className="p-4 bg-black/20">
                {/* 1. COMPARE - NOWY UKŁAD PIONOWY (KARTY) */}
                {selectedCmd === "COMPARE" ? (
                    <div className="flex flex-col gap-3">
                        {/* Karta Wyniku */}
                        <div className="flex items-center justify-between bg-gray-800/40 p-2 rounded border border-gray-700/50">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Zmienna docelowa</span>
                            <div className="flex items-center gap-2">
                                 <span className="text-gray-500">=</span>
                                 <InputVarSmart listId="l_cmp_target" availableVars={availableVars} placeholder="res" value={inputs.compareTarget} onChange={v => setInputs({...inputs, compareTarget: v})} />
                            </div>
                        </div>

                        {/* Karta Logiki */}
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-700 relative mt-1">
                            <span className="absolute -top-2 left-3 bg-gray-900 text-[9px] text-gray-500 px-1">WARUNEK</span>
                            <div className="flex flex-col gap-2 mt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500">Lewa strona</span>
                                    <div className="flex items-center gap-1">
                                        <InputVarSmart listId="l_cmp_left" availableVars={availableVars} placeholder="Var A" value={inputs.var_name} onChange={v => setInputs({...inputs, var_name: v})} />
                                        <span className="text-gray-600 text-[10px]">-&gt;val</span>
                                    </div>
                                </div>

                                <div className="flex justify-center my-1 relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                                    <select
                                        value={selectedField}
                                        onChange={e => setSelectedField(e.target.value)}
                                        className="relative z-10 bg-gray-700 text-white font-mono text-xs py-1 px-4 rounded-full border border-gray-600 outline-none cursor-pointer shadow-sm hover:bg-gray-600"
                                    >
                                        <option value="==">==</option><option value="!=">!=</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500">Prawa strona</span>
                                    {inputs.source_var ? (
                                         <div className="flex items-center gap-1">
                                             <InputVarSmart listId="l_cmp_right_var" availableVars={availableVars} placeholder="Var B" value={inputs.source_var} onChange={v => setInputs({...inputs, source_var: v})} />
                                             <button onClick={() => setInputs({...inputs, source_var: ""})} className="p-1 bg-red-900/30 text-red-400 rounded hover:bg-red-900/60 border border-red-900/50 text-[10px]" title="Zmień na liczbę">123</button>
                                         </div>
                                    ) : (
                                         <div className="flex items-center gap-1">
                                            <InputVal value={inputs.val_payload} onChange={v => setInputs({...inputs, val_payload: v})} placeholder="Liczba" />
                                            <span className="text-[10px] text-gray-600">lub</span>
                                            <InputVarSmart listId="l_cmp_right_var_hidden" availableVars={availableVars} placeholder="Var" value="" onChange={v => setInputs({...inputs, source_var: v})} />
                                         </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // 2. INNE INSTRUKCJE
                    <div className="flex flex-col gap-3">
                        {selectedCmd === "ALLOC" && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Etykieta zmiennej</span>
                                    <InputVarSmart listId="l_alloc" availableVars={availableVars} placeholder="ptr" value={inputs.var_name} onChange={v => setInputs({...inputs, var_name: v})} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Wartość przechowywana</span>
                                    <InputVal value={inputs.val_payload} onChange={v => setInputs({...inputs, val_payload: v})} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                                    <InputVal width="w-full" placeholder="Pozycja X (opcjonalnie)" value={inputs.x} onChange={v => setInputs({...inputs, x: v})} />
                                    <InputVal width="w-full" placeholder="Pozycja Y (opcjonalnie)" value={inputs.y} onChange={v => setInputs({...inputs, y: v})} />
                                </div>
                            </>
                        )}

                        {(selectedCmd === "FREE" || selectedCmd === "CHECK_NULL") && (
                            <div className="flex items-center justify-between">
                                 <span className={clsx("text-xs font-bold", selectedCmd === "FREE" ? "text-red-400" : "text-gray-400")}>
                                    {selectedCmd === "FREE" ? "Skasuj węzeł (delete)" : "Warunek if (NULL)"}
                                 </span>
                                 <InputVarSmart listId="l_single" availableVars={availableVars} placeholder="Zmienna" value={inputs.var_name} onChange={v => setInputs({...inputs, var_name: v})} />
                            </div>
                        )}

                        {selectedCmd === "SET_VAL" && (
                            <div className="flex items-center gap-2">
                                 <InputVarSmart listId="l_setval" availableVars={availableVars} placeholder="Zmienna" value={inputs.var_name} onChange={v => setInputs({...inputs, var_name: v})} />
                                 <span className="text-gray-500">.val =</span>
                                 <InputVal value={inputs.val_payload} onChange={v => setInputs({...inputs, val_payload: v})} />
                            </div>
                        )}

                        {selectedCmd === "ASSIGN_VAR" && (
                             <div className="flex items-center justify-between">
                                 <InputVarSmart listId="l_assign_target" availableVars={availableVars} placeholder="Cel" value={inputs.var_name} onChange={v => setInputs({...inputs, var_name: v})} />
                                 <span className="text-gray-500">=</span>
                                 <InputVarSmart listId="l_assign_source" availableVars={availableVars} placeholder="Źródło" value={inputs.source_var} onChange={v => setInputs({...inputs, source_var: v})} />
                             </div>
                        )}

                        {selectedCmd === "ASSIGN_FIELD" && (
                             <div className="flex flex-col gap-2">
                                 <div className="flex items-center gap-2">
                                     <InputVarSmart listId="l_field_target" availableVars={availableVars} placeholder="Kto" value={inputs.var_name} onChange={v => setInputs({...inputs, var_name: v})} />
                                     <SelectField value={selectedField} onChange={setSelectedField} />
                                 </div>
                                 <div className="flex items-center gap-2 justify-end">
                                     <span className="text-gray-500">=</span>
                                     <InputVarSmart listId="l_field_source" availableVars={availableVars} placeholder="Na co" value={inputs.source_var} onChange={v => setInputs({...inputs, source_var: v})} />
                                 </div>
                             </div>
                        )}

                         {(selectedCmd === "STEP_FORWARD" || selectedCmd === "SET_FIELD_NULL" || selectedCmd === "MATH_ADD" || selectedCmd === "COPY_VAL") && (
                             <div className="text-gray-500 text-xs italic text-center py-2">
                                 <div className="flex items-center justify-center gap-2 mt-2 not-italic">
                                    <InputVarSmart listId="l_generic" availableVars={availableVars} placeholder="Var" value={inputs.var_name} onChange={v => setInputs({...inputs, var_name: v})} />
                                    {selectedCmd !== "SET_FIELD_NULL" && selectedCmd !== "STEP_FORWARD" && (
                                         <InputVal value={inputs.val_payload || inputs.source_var} onChange={v => setInputs({...inputs, val_payload: v, source_var: v})} />
                                    )}
                                 </div>
                             </div>
                         )}
                    </div>
                )}

                {/* NARRACJA KROKU */}
                <div className="mt-4 pt-3 border-t border-gray-800/50 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Nazwa Etapu (Faza)</label>
                            <button type="button" onClick={handleNextPhase} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px] uppercase font-bold transition-colors">
                                <Plus size={10} /> +1
                            </button>
                        </div>
                        <input
                            placeholder="Np. Faza 1: Inicjalizacja..."
                            value={group}
                            onChange={e => setGroup(e.target.value)}
                            className="w-full bg-gray-900/50 text-blue-300 text-xs p-2 rounded border border-gray-700 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold">Tekst w Przewodniku Narracyjnym</label>
                        <textarea
                            value={inputs.explanation}
                            onChange={e => setInputs({...inputs, explanation: e.target.value})}
                            placeholder="Wytłumacz, dlaczego ten krok ma miejsce..."
                            className="w-full bg-gray-900/50 text-gray-300 text-xs p-2 rounded border border-gray-700 outline-none focus:border-blue-500 min-h-[50px] resize-none"
                        />
                    </div>
                </div>

                <button onClick={addStep} className="w-full mt-4 bg-blue-700 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 text-xs font-bold shadow-lg transition-colors border border-blue-500/50">
                    <Plus size={16}/> DODAJ KROK DO LISTY
                </button>
            </div>
        </div>

        {/* --- 4. LISTA KROKÓW (Z PŁYNNĄ ANIMACJĄ WEJŚCIA) --- */}
        <div className={clsx(
            "bg-black/50 p-0 rounded-lg border border-gray-800 overflow-hidden flex flex-col shrink-0 transform transition-all duration-700 ease-out",
            isMounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}>
            <div className="p-2.5 bg-gray-900 border-b border-gray-800 flex justify-between items-center shadow-md z-10">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Code size={14} className="text-gray-500" /> Dodane Kroki Algorytmu
                 </span>
                 <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700 shadow-inner">
                    {steps.length}
                 </span>
            </div>
            {/* Ograniczona wysokość z płynnym powiększaniem */}
            <div className="p-2 overflow-y-auto max-h-[350px] min-h-[100px] font-mono text-xs space-y-1 custom-scrollbar relative">
                {steps.length === 0 ? <span className="text-gray-700 italic flex justify-center items-center h-20">Jeszcze nic tu nie ma.</span> : (
                    steps.map((s, i) => {
                        const isCurrent = i === previewIndex;
                        const def = INSTRUCTION_DEFS[s.cmd];
                        return (
                            <div key={i} className={clsx(
                                "relative pl-8 pr-2 py-2 rounded border transition-all duration-300 group",
                                isCurrent ? "bg-blue-900/30 border-blue-500/50 scale-[1.01] shadow-lg z-10" : "border-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50"
                            )}>
                                <span className="absolute left-2 top-2 text-gray-600 text-[10px] w-4 text-right font-bold">{i+1}.</span>
                                <div className="text-gray-300 break-all leading-relaxed">
                                    <span className={clsx("font-bold mr-1.5", def?.color)}>{s.cmd}</span>

                                    {s.cmd === 'COMPARE' ? (
                                        <span className="text-indigo-300">
                                            <span className="text-yellow-400 font-bold">{s.val_payload.targetNode}</span> =
                                            ({s.var_name} <span className="text-white mx-0.5">{s.field_name}</span>
                                            {s.val_payload.compareMode === 'variable' ? s.val_payload.rightValue : s.val_payload.rightValue})
                                        </span>
                                    ) : (
                                        <span>
                                            {s.var_name}
                                            {s.cmd === 'ALLOC' && ` = new(${typeof s.val_payload === 'object' ? s.val_payload.val : s.val_payload})`}
                                            {s.cmd === 'ASSIGN_VAR' && ` = ${s.source_var}`}
                                            {s.cmd === 'ASSIGN_FIELD' && `->${s.field_name} = ${s.source_var}`}
                                            {s.cmd === 'SET_VAL' && `->val = ${s.val_payload}`}
                                        </span>
                                    )}
                                </div>
                                {s.explanation && (
                                    <div className="text-[9px] text-gray-400 mt-1.5 truncate italic border-l-2 border-indigo-900/50 pl-2 bg-black/20 p-1 rounded">
                                        {s.explanation}
                                    </div>
                                )}
                                <button onClick={() => handleRemoveStep(i)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:scale-110 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

      </div>

      {/* --- 5. FOOTER (PRZYKLEJONY DO DOŁU) --- */}
      <div className="shrink-0 p-4 border-t border-gray-800 bg-gray-900/95 space-y-3 z-10 shadow-[0_-4px_15px_rgba(0,0,0,0.3)]">
         <div className="flex gap-2 items-center">
             <div className="flex bg-black/40 border border-gray-800 rounded overflow-hidden">
                 <button onClick={() => { setPreviewIndex(-1); setIsPlaying(false); }} title="Od nowa" className="p-2 bg-gray-800 hover:bg-gray-700 text-white transition-colors border-r border-gray-700"><RotateCcw size={16} /></button>
                 <button onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pauza" : "Odtwarzaj test"} className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white flex justify-center transition-colors">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                 </button>
                 <button onClick={runNextStep} disabled={isPlaying || previewIndex >= steps.length - 1} title="Krok do przodu" className="p-2 bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 transition-colors border-l border-gray-700"><SkipForward size={16} /></button>
             </div>
             <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-500 text-white p-2 rounded flex items-center justify-center gap-2 text-xs font-bold shadow-lg transition-all border border-green-500/50">
                <Save size={16} /> ZAPISZ I KOMPILUJ DO BIBLIOTEKI
             </button>
         </div>
      </div>

    </div>
  );
};