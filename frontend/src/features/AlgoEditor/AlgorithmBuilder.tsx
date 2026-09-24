import { useState, useCallback, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import { ALGORITHMS_DB } from '../../data/algorithms';
import { Plus, BookOpen, Settings, Play, SkipForward, RotateCcw } from 'lucide-react';
import { ReactFlow, Background, Controls, addEdge, Handle, Position, PanOnScrollMode } from '@xyflow/react';
import type { Connection, Edge, NodeProps, ReactFlowInstance } from '@xyflow/react';
import type { AlgoFlowNode, AlgoNodeData, ComparePayload } from '../../assets/types';
import '@xyflow/react/dist/style.css';
import { INSTRUCTION_DEFS } from './instructionDefinitions';
import clsx from 'clsx';
import { useIsMobile } from '../../hooks/useIsMobile';

// --- 1. DEFINICJE AUTORSKICH WĘZŁÓW Z EFEKTEM GLOW ---

const StartNode = ({ data, id }: NodeProps<AlgoFlowNode>) => {
  const activeNodeId = useMemoryStore((s) => s.activeNodeId);
  const isActive = activeNodeId === id;
  return (
    <div className={clsx(
      "px-6 py-3 rounded-lg text-white font-bold flex items-center justify-center min-w-[120px] transition-all duration-300",
      isActive ? "bg-green-600 border-4 border-green-300 shadow-[0_0_20px_rgba(74,222,128,0.8)] scale-110 z-50" : "bg-green-700 border-2 border-green-500 shadow-lg shadow-green-900/50"
    )}>
      {data.label || 'START'}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: '12px', height: '12px' }}
        className="bg-green-300 border-2 border-gray-900 rounded-full cursor-pointer"
      />
    </div>
  );
};

const ActionNode = ({ data, id }: NodeProps<AlgoFlowNode>) => {
  const activeNodeId = useMemoryStore((s) => s.activeNodeId);
  const removeAlgorithmStep = useMemoryStore((s) => s.removeAlgorithmStep);
  const isActive = activeNodeId === id;

  const stepIndex = parseInt(id.replace('node-', ''), 10);
  const isDeletable = !isNaN(stepIndex);

  const handleDelete = (e: ReactMouseEvent) => {
      e.stopPropagation();
      if (isDeletable) {
          removeAlgorithmStep(stepIndex);
      }
  };

  return (
    <div className={clsx(
      "rounded-lg text-white w-64 flex flex-col transition-all duration-300",
      isActive ? "bg-gray-800 border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-105 z-50" : "bg-gray-800 border-2 border-blue-500 shadow-xl shadow-blue-900/20"
    )}>
      {/* Punkt wejścia (Top) - stabilny, bez animacji zmiany pozycji */}
      <Handle
          type="target"
          position={Position.Top}
          style={{ width: '12px', height: '12px' }}
          className="bg-blue-500 border-2 border-gray-900 rounded-full cursor-pointer hover:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
        />

      {/* Pasek nagłówka z wbudowanym, wyraźnym przyciskiem usuwania (X) */}
      <div className={clsx("px-3 py-2 flex justify-between items-center", isActive ? "bg-yellow-900/50 border-b border-yellow-500/50" : "bg-blue-900/50 border-b border-gray-700")}>
        <div className="flex items-center gap-2">
            <span className={clsx("font-bold text-xs", isActive ? "text-yellow-300" : "text-blue-300")}>{data.cmd}</span>
            <span className="text-[9px] text-gray-500 font-mono">{id}</span>
        </div>

        {isDeletable && (
            <button
                onClick={handleDelete}
                className="w-5 h-5 bg-red-900/80 hover:bg-red-600 text-red-200 hover:text-white rounded flex items-center justify-center transition-colors border border-red-700 cursor-pointer shadow-sm"
                title="Usuń ten krok"
            >
                <span className="text-xs font-bold leading-none">×</span>
            </button>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 bg-gray-900/90">
        <div className="text-xs font-mono text-gray-300">
            {data.var_name && <span>Var: <span className="text-yellow-400">{data.var_name}</span></span>}
            {data.source_var && <span className="ml-2">Src: <span className="text-purple-400">{data.source_var}</span></span>}
        </div>
        {data.explanation && (
          <div className="text-[10px] text-gray-400 italic border-l-2 border-blue-500/50 pl-2 mt-1">
            {data.explanation}
          </div>
        )}
        {data.section && (
          <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 text-right">
            {data.section}
          </div>
        )}
      </div>

      {/* Punkt wyjścia (Bottom) - stabilny */}
      <Handle
          type="source"
          position={Position.Bottom}
          style={{ width: '12px', height: '12px' }}
          className="bg-blue-500 border-2 border-gray-900 rounded-full cursor-pointer hover:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
      />
    </div>
  );
};

const ConditionNode = ({ data, id }: NodeProps<AlgoFlowNode>) => {
  const activeNodeId = useMemoryStore((s) => s.activeNodeId);
  const removeAlgorithmStep = useMemoryStore((s) => s.removeAlgorithmStep);
  const isActive = activeNodeId === id;

  const stepIndex = parseInt(id.replace('node-', ''), 10);
  const isDeletable = !isNaN(stepIndex);

  const handleDelete = (e: ReactMouseEvent) => {
      e.stopPropagation();
      if (isDeletable) {
          removeAlgorithmStep(stepIndex);
      }
  };

  return (
    <div className={clsx(
      "rounded-lg text-white w-64 flex flex-col transition-all duration-300",
      isActive ? "bg-gray-800 border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-105 z-50" : "bg-gray-800 border-2 border-purple-500 shadow-xl shadow-purple-900/20"
    )}>
      <Handle
          type="target"
          position={Position.Top}
          style={{ width: '12px', height: '12px' }}
          className="bg-purple-500 border-2 border-gray-900 rounded-full cursor-pointer hover:bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
        />

      <div className={clsx("px-3 py-2 flex justify-between items-center", isActive ? "bg-yellow-900/50 border-b border-yellow-500/50" : "bg-purple-900/50 border-b border-gray-700")}>
        <div className="flex items-center gap-2">
            <span className={clsx("font-bold text-xs", isActive ? "text-yellow-300" : "text-purple-300")}>WARUNEK (IF)</span>
            <span className="text-[9px] text-gray-500 font-mono">{id}</span>
        </div>

        {isDeletable && (
            <button
                onClick={handleDelete}
                className="w-5 h-5 bg-red-900/80 hover:bg-red-600 text-red-200 hover:text-white rounded flex items-center justify-center transition-colors border border-red-700 cursor-pointer shadow-sm"
                title="Usuń ten krok"
            >
                <span className="text-xs font-bold leading-none">×</span>
            </button>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 bg-gray-900/90">
        <div className="text-xs font-mono text-center bg-black/50 py-1 rounded border border-gray-700">
          {data.var_name} <span className="text-purple-400">{data.field_name || '=='}</span> {String((data.val_payload as ComparePayload | undefined)?.rightValue ?? 'NULL')}
        </div>
        {data.explanation && (
          <div className="text-[10px] text-gray-400 italic border-l-2 border-purple-500/50 pl-2 mt-1">
            {data.explanation}
          </div>
        )}
        {data.section && (
          <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 text-right">
            {data.section}
          </div>
        )}
      </div>

      {/* Punkty Prawda / Fałsz na dole - stabilne */}
      <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          style={{ width: '12px', height: '12px', left: '30%' }}
          className="bg-green-500 border-2 border-gray-900 rounded-full cursor-pointer shadow-[0_0_8px_rgba(34,197,94,0.8)]"
      />
      <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          style={{ width: '12px', height: '12px', left: '70%' }}
          className="bg-red-500 border-2 border-gray-900 rounded-full cursor-pointer shadow-[0_0_8px_rgba(239,68,68,0.8)]"
      />

      <div className="flex justify-between px-6 pb-1 text-[9px] font-bold text-gray-500 bg-gray-900">
          <span className="text-green-500/70">PRAWDA</span>
          <span className="text-red-500/70">FAŁSZ</span>
      </div>
    </div>
  );
};

const nodeTypes = { startNode: StartNode, actionNode: ActionNode, conditionNode: ConditionNode };

// --- 2. GŁÓWNY KOMPONENT KREATORA ---

export const AlgorithmBuilder = () => {
  const {
    nodes, edges, onNodesChange, onEdgesChange,
    loadAlgorithm, customAlgorithms,
    updateNodeData, exitSandboxMode,
    isPlaying, setIsPlaying, resetMemory
  } = useMemoryStore();
  const activeAlgorithmId = useMemoryStore(s => s.activeAlgorithm?.id);
  const activeNodeId = useMemoryStore(s => s.activeNodeId);

  // --- WIDOK GRAFU ---
  // Graf scenariusza jest wysoki (pionowy łańcuch bloków). Wcześniej fitView pokazywał całość
  // w skali 0.2 (nieczytelne), a kółko myszy tylko próbowało zoomować, więc nie dało się
  // przewinąć grafu w dół. Teraz: kółko/touchpad przewija, Ctrl+kółko zoomuje,
  // start od pierwszych bloków w czytelnej skali, a podczas wykonania widok podąża za aktywnym blokiem.
  const rfRef = useRef<ReactFlowInstance<AlgoFlowNode, Edge> | null>(null);
  const focusStart = useCallback(() => {
    const inst = rfRef.current;
    if (!inst) return;
    const first = useMemoryStore.getState().nodes.slice(0, 4).map(n => ({ id: n.id }));
    if (first.length) inst.fitView({ nodes: first, maxZoom: 0.9, minZoom: 0.4, padding: 0.2, duration: 250 });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(focusStart, 120);
    return () => window.clearTimeout(t);
  }, [activeAlgorithmId, focusStart]);

  useEffect(() => {
    const inst = rfRef.current;
    if (!inst || !activeNodeId) return;
    const node = useMemoryStore.getState().nodes.find(n => n.id === activeNodeId);
    if (!node) return;
    const w = node.measured?.width ?? 256;
    const h = node.measured?.height ?? 100;
    inst.setCenter(node.position.x + w / 2, node.position.y + h / 2, { zoom: Math.max(inst.getZoom(), 0.5), duration: 300 });
  }, [activeNodeId]);

  const [algoName, setAlgoName] = useState("");
  const [algoDesc, setAlgoDesc] = useState("");
  const [selectedCmd, setSelectedCmd] = useState("ASSIGN_VAR");

  const [cmdInputs, setCmdInputs] = useState<Record<string, string>>({});

  // TRYB MOBILNY: zamiast panelu bocznego 320px + grafu (brak miejsca) - przełącznik zakładek
  const isMobile = useIsMobile();
  // Tryb kompaktowy także w wąskim oknie na komputerze (domyślnie 400px) - wcześniej panel
  // boczny zajmował 320px, a graf dostawał ~80px szerokości i nie dało się go przeglądać
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [rootWidth, setRootWidth] = useState(1000);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => setRootWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const compact = isMobile || rootWidth < 640;
  const [mobileTab, setMobileTab] = useState<'edit' | 'graph'>('edit');

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const onNodeClick = useCallback((_: ReactMouseEvent, node: AlgoFlowNode) => {
    setSelectedNodeId(node.id);
    if (compact) setMobileTab('edit'); // w trybie kompaktowym od razu pokazujemy właściwości bloku
  }, [compact]);
  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying) {
        interval = window.setInterval(() => {
            useMemoryStore.getState().nextGraphStep();
        }, 1200);
    }
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const onConnect = useCallback((params: Connection | Edge) => {
    useMemoryStore.setState((state) => {
      const filteredEdges = state.edges.filter((e: Edge) => {
        const currentHandle = e.sourceHandle || '';
        const newHandle = params.sourceHandle || '';
        return !(e.source === params.source && currentHandle === newHandle);
      });
      return { edges: addEdge({ ...params, animated: true, type: 'smoothstep' }, filteredEdges) };
    });
  }, []);

  const importAlgorithm = async (algoId: string) => {
    const algoToImport = ALGORITHMS_DB.find(a => a.id === algoId) || customAlgorithms.find(a => a.id === algoId);
    if (algoToImport) {
      setAlgoName(algoToImport.title);
      setAlgoDesc(algoToImport.description);
      setSelectedNodeId(null);
      // Czysta pamięć przed nowym scenariuszem - wcześniej zostawały zmienne z poprzedniego
      // uruchomienia i Sandbox zgłaszał fałszywy "Memory Leak" już przy drugim ALLOC
      setIsPlaying(false);
      await resetMemory();
      await loadAlgorithm(algoToImport);
    }
  };

  const spawnNode = () => {
    const isCondition = selectedCmd === 'COMPARE' || selectedCmd === 'CHECK_NULL';

    const nodeData: AlgoNodeData = {
      cmd: selectedCmd,
      explanation: cmdInputs.explanation || '',
      section: cmdInputs.section || '',
      var_name: cmdInputs.var_name || 'Zmienna'
    };

    Object.keys(cmdInputs).forEach(key => {
        if (key === 'val_payload' && isCondition) {
            nodeData[key] = { rightValue: cmdInputs[key] };
        } else if (key !== 'explanation' && key !== 'section') {
            nodeData[key] = cmdInputs[key];
        }
    });

    const newNode: AlgoFlowNode = {
      id: `node-${Date.now()}`,
      type: isCondition ? 'conditionNode' : 'actionNode',
      position: { x: 400, y: 150 },
      data: nodeData,
    };
    useMemoryStore.setState((state) => ({ nodes: [...state.nodes, newNode] }));
    setCmdInputs({});
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const showSidebar = !compact || mobileTab === 'edit';
  const showGraph = !compact || mobileTab === 'graph';

  return (
    <div ref={rootRef} className="flex flex-col w-full h-full bg-gray-950 text-white font-sans overflow-hidden">
      <div className="bg-gray-900 border-b border-gray-800 p-2 flex justify-center gap-2 shadow-lg z-20">
        <button onClick={() => { setIsPlaying(false); useMemoryStore.setState({activeNodeId: null, currentStepIndex: -1}); exitSandboxMode(); }} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded"><RotateCcw size={16} /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white flex justify-center items-center rounded">
          {isPlaying ? "PAUZA" : <Play size={16} fill="currentColor" />}
        </button>
        <button onClick={() => useMemoryStore.getState().nextGraphStep()} disabled={isPlaying} className="p-2 bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 rounded"><SkipForward size={16} /></button>
        <span
          className="self-center ml-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-700"
          title="Kreator wykonuje algorytm w trybie testowym - po wyjściu (reset) pamięć wraca do stanu sprzed testu"
        >
          SANDBOX
        </span>
      </div>

      {compact && (
        <div className="shrink-0 grid grid-cols-2 bg-gray-950 border-b border-gray-800 text-[11px] font-bold uppercase tracking-wider">
          {([['edit', 'Edycja bloków'], ['graph', `Graf (${nodes.length})`]] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`!rounded-none !border-0 !border-b-2 py-2.5 ${mobileTab === tab ? '!border-blue-500 text-white !bg-gray-900' : '!border-transparent text-gray-500 !bg-transparent'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {showSidebar && (
        <div className={compact ? "w-full flex flex-col bg-gray-900 z-10 min-h-0" : "w-80 flex flex-col bg-gray-900 border-r border-gray-800 shadow-2xl z-10 shrink-0"}>

          {selectedNode ? (
            <div className="p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 h-full min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-xs font-bold text-yellow-500 flex items-center gap-2"><Settings size={14}/> Właściwości Węzła</span>
                <button onClick={() => setSelectedNodeId(null)} className="text-gray-500 hover:text-white text-xs">Zamknij</button>
              </div>

              {selectedNode.type !== 'startNode' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase">Komenda</label>
                    <span className="bg-gray-950 p-2 text-sm text-blue-300 font-bold border border-gray-800 rounded">{selectedNode.data.cmd}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase">Główna Zmienna (Cel/Lewa strona)</label>
                    <input
                      value={selectedNode.data.var_name || ''}
                      onChange={e => updateNodeData(selectedNode.id, { var_name: e.target.value })}
                      className="bg-gray-800 text-xs p-2 border border-gray-700 rounded outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase">Źródło / Prawa strona</label>
                    <input
                      value={selectedNode.data.source_var || String((selectedNode.data.val_payload as ComparePayload | undefined)?.rightValue ?? '')}
                      onChange={e => {
                        if (selectedNode.type === 'conditionNode') {
                            updateNodeData(selectedNode.id, { val_payload: { ...(selectedNode.data.val_payload as ComparePayload | undefined), rightValue: e.target.value } });
                        } else {
                            updateNodeData(selectedNode.id, { source_var: e.target.value });
                        }
                      }}
                      className="bg-gray-800 text-xs p-2 border border-gray-700 rounded outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase">Sekcja</label>
                    <input
                      value={selectedNode.data.section || ''}
                      onChange={e => updateNodeData(selectedNode.id, { section: e.target.value })}
                      className="bg-gray-800 text-xs p-2 border border-gray-700 rounded outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase">Tekst Narracyjny (Fabuła)</label>
                    <textarea
                      value={selectedNode.data.explanation || ''}
                      onChange={e => updateNodeData(selectedNode.id, { explanation: e.target.value })}
                      className="bg-gray-800 text-xs p-2 border border-gray-700 rounded outline-none focus:border-yellow-500 h-24 resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0 overflow-y-auto overscroll-contain custom-scrollbar animate-in fade-in">
              <div className="shrink-0 p-4 border-b border-gray-800 bg-gray-950 flex flex-col gap-3">
                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2"><BookOpen size={14} /> Import z Biblioteki</span>
                <select onChange={(e) => importAlgorithm(e.target.value)} defaultValue="" className="w-full bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700 outline-none focus:border-indigo-500">
                  <option value="" disabled>-- Wybierz scenariusz --</option>
                  {ALGORITHMS_DB.map(algo => <option key={algo.id} value={algo.id}>{algo.title}</option>)}
                </select>
              </div>

              <div className="shrink-0 p-4 flex flex-col gap-3 border-b border-gray-800">
                <input value={algoName} onChange={(e) => setAlgoName(e.target.value)} placeholder="Tytuł Algorytmu" className="w-full bg-gray-950 text-white font-bold p-2.5 rounded border border-gray-800 outline-none focus:border-blue-500" />
                <textarea value={algoDesc} onChange={(e) => setAlgoDesc(e.target.value)} placeholder="Fabuła algorytmu..." className="w-full bg-gray-950 text-gray-300 text-xs p-2.5 rounded border border-gray-800 outline-none focus:border-blue-500 resize-none h-24 custom-scrollbar" />
              </div>

              {/* Cały panel boczny przewija się jako jedna lista - wcześniej ta sekcja dostawała 0px wysokości i nie dało się zjechać w dół */}
              <div className="shrink-0 p-4 flex flex-col gap-3">
                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Dodaj blok operacyjny</span>

                <select
                  value={selectedCmd}
                  onChange={e => {
                      setSelectedCmd(e.target.value);
                      setCmdInputs({});
                  }}
                  className="bg-gray-800 text-sm p-2 rounded border border-gray-700 text-blue-300 font-bold w-full outline-none"
                >
                  {Object.keys(INSTRUCTION_DEFS).map(cmd => (
                      <option key={cmd} value={cmd}>{INSTRUCTION_DEFS[cmd].label || cmd}</option>
                  ))}
                </select>

                <div className="flex flex-col gap-2 mt-1">
                    {INSTRUCTION_DEFS[selectedCmd]?.inputs?.map((inputKey: string) => (
                        <div key={inputKey} className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">{inputKey.replace('_', ' ')}</label>
                            <input
                                value={cmdInputs[inputKey] || ''}
                                onChange={e => setCmdInputs({ ...cmdInputs, [inputKey]: e.target.value })}
                                placeholder={`Wprowadź ${inputKey}...`}
                                className="bg-gray-900/50 text-xs p-2 border border-gray-700 rounded outline-none focus:border-blue-500 text-white w-full"
                            />
                        </div>
                    ))}
                </div>

                {/* UNIWERSALNE POLA DLA KAŻDEGO BLOKU */}
                <div className="flex flex-col gap-2 mt-2 border-t border-gray-800 pt-3 mb-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider">Sekcja Kroku (Opcjonalnie)</label>
                        <input
                            value={cmdInputs.section || ''}
                            onChange={e => setCmdInputs({ ...cmdInputs, section: e.target.value })}
                            placeholder="np. Inicjalizacja, Pętla 1..."
                            className="bg-gray-900/50 text-xs p-2 border border-gray-700 rounded outline-none focus:border-blue-500 text-white w-full"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider">Opis kroku (Fabuła)</label>
                        <textarea
                            value={cmdInputs.explanation || ''}
                            onChange={e => setCmdInputs({ ...cmdInputs, explanation: e.target.value })}
                            placeholder="Opisz działanie w tym kroku..."
                            className="bg-gray-900/50 text-xs p-2 border border-gray-700 rounded outline-none focus:border-blue-500 text-white w-full h-16 resize-none custom-scrollbar"
                        />
                    </div>
                </div>

                <button onClick={spawnNode} className="w-full bg-blue-700 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 text-xs font-bold shadow-lg transition-colors border border-blue-500/50 mt-auto">
                  <Plus size={16}/> UMIEŚĆ NA GRAFIE
                </button>
              </div>
            </div>
          )}
        </div>

        )}

        {/* GŁÓWNE PŁÓTNO (React Flow Canvas) */}
        {showGraph && (
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onInit={(inst) => { rfRef.current = inst; window.setTimeout(focusStart, 120); }}
            panOnScroll
            panOnScrollMode={PanOnScrollMode.Free}
            minZoom={0.2}
            maxZoom={1.5}
            className="bg-black"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#222" gap={16} />
            <Controls showInteractive={false} position="bottom-right" className="builder-controls" />

          </ReactFlow>
        </div>
        )}
      </div>
    </div>
  );
};