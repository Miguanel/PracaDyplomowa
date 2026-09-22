import { useState, useCallback, useEffect } from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import { ALGORITHMS_DB } from '../../data/algorithms';
import { Save, Plus, BookOpen, Trash2, Settings, Play, SkipForward, RotateCcw } from 'lucide-react';
import { ReactFlow, Controls, Background, addEdge, Handle, Position, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { INSTRUCTION_DEFS } from './instructionDefinitions';
import clsx from 'clsx';

// --- 1. DEFINICJE AUTORSKICH WĘZŁÓW Z EFEKTEM GLOW ---

const StartNode = ({ data, id }: any) => {
  const activeNodeId = useMemoryStore((s: any) => s.activeNodeId);
  const isActive = activeNodeId === id;
  return (
    <div className={clsx(
      "px-6 py-3 rounded-lg text-white font-bold flex items-center justify-center min-w-[120px] transition-all duration-300",
      isActive ? "bg-green-600 border-4 border-green-300 shadow-[0_0_20px_rgba(74,222,128,0.8)] scale-110 z-50" : "bg-green-700 border-2 border-green-500 shadow-lg shadow-green-900/50"
    )}>
      {data.label || 'START'}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-300 border-2 border-gray-900" />
    </div>
  );
};

const ActionNode = ({ data, id }: any) => {
  const activeNodeId = useMemoryStore((s: any) => s.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div className={clsx(
      "rounded-lg text-white w-64 flex flex-col overflow-hidden transition-all duration-300",
      isActive ? "bg-gray-800 border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-105 z-50" : "bg-gray-800 border-2 border-blue-500 shadow-xl shadow-blue-900/20"
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 border-2 border-gray-900" />
      <div className={clsx("px-3 py-2 flex justify-between items-center", isActive ? "bg-yellow-900/50 border-b border-yellow-500/50" : "bg-blue-900/50 border-b border-gray-700")}>
        <span className={clsx("font-bold text-xs", isActive ? "text-yellow-300" : "text-blue-300")}>{data.cmd}</span>
        <span className="text-[9px] text-gray-500">{id}</span>
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
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400 border-2 border-gray-900" />
    </div>
  );
};

const ConditionNode = ({ data, id }: any) => {
  const activeNodeId = useMemoryStore((s: any) => s.activeNodeId);
  const isActive = activeNodeId === id;

  return (
    <div className={clsx(
      "rounded-lg text-white w-64 flex flex-col overflow-hidden transition-all duration-300",
      isActive ? "bg-gray-800 border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-105 z-50" : "bg-gray-800 border-2 border-purple-500 shadow-xl shadow-purple-900/20"
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-400 border-2 border-gray-900" />
      <div className={clsx("px-3 py-2 flex justify-between items-center", isActive ? "bg-yellow-900/50 border-b border-yellow-500/50" : "bg-purple-900/50 border-b border-gray-700")}>
        <span className={clsx("font-bold text-xs", isActive ? "text-yellow-300" : "text-purple-300")}>WARUNEK (IF)</span>
        <span className="text-[9px] text-gray-500">{id}</span>
      </div>
      <div className="p-3 flex flex-col gap-2 bg-gray-900/90">
        <div className="text-xs font-mono text-center bg-black/50 py-1 rounded border border-gray-700">
          {data.var_name} <span className="text-purple-400">{data.field_name || '=='}</span> {data.val_payload?.rightValue ?? 'NULL'}
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
      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-green-500 border-2 border-gray-900" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 bg-red-500 border-2 border-gray-900" style={{ left: '70%' }} />
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
    loadAlgorithm, customAlgorithms, saveCustomAlgorithm,
    updateNodeData, nextGraphStep, exitSandboxMode,
    isPlaying, setIsPlaying
  } = useMemoryStore();

  const [algoName, setAlgoName] = useState("");
  const [algoDesc, setAlgoDesc] = useState("");
  const [selectedCmd, setSelectedCmd] = useState("ASSIGN_VAR");

  const [cmdInputs, setCmdInputs] = useState<Record<string, string>>({});

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const onNodeClick = useCallback((_: any, node: Node) => setSelectedNodeId(node.id), []);
  const onPaneClick = useCallback(() => setSelectedNodeId(null), []);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
        interval = setInterval(() => {
            useMemoryStore.getState().nextGraphStep();
        }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const onConnect = useCallback((params: Connection | Edge) => {
    useMemoryStore.setState((state: any) => {
      const filteredEdges = state.edges.filter((e: Edge) => {
        const currentHandle = e.sourceHandle || '';
        const newHandle = params.sourceHandle || '';
        return !(e.source === params.source && currentHandle === newHandle);
      });
      return { edges: addEdge({ ...params, animated: true, type: 'smoothstep' }, filteredEdges) };
    });
  }, []);

  const importAlgorithm = (algoId: string) => {
    let algoToImport = ALGORITHMS_DB.find(a => a.id === algoId) || customAlgorithms.find(a => a.id === algoId);
    if (algoToImport) {
      setAlgoName(algoToImport.title);
      setAlgoDesc(algoToImport.description);
      loadAlgorithm(algoToImport);
      setSelectedNodeId(null);
    }
  };

  const spawnNode = () => {
    const isCondition = selectedCmd === 'COMPARE' || selectedCmd === 'CHECK_NULL';

    const nodeData: any = {
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

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: isCondition ? 'conditionNode' : 'actionNode',
      position: { x: 400, y: 150 },
      data: nodeData,
    };
    useMemoryStore.setState((state: any) => ({ nodes: [...state.nodes, newNode] }));
    setCmdInputs({});
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col w-full h-full bg-gray-950 text-white font-sans overflow-hidden">
      <div className="bg-gray-900 border-b border-gray-800 p-2 flex justify-center gap-2 shadow-lg z-20">
        <button onClick={() => { setIsPlaying(false); useMemoryStore.setState({activeNodeId: null, currentStepIndex: -1}); exitSandboxMode(); }} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded"><RotateCcw size={16} /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white flex justify-center items-center rounded">
          {isPlaying ? "PAUZA" : <Play size={16} fill="currentColor" />}
        </button>
        <button onClick={() => useMemoryStore.getState().nextGraphStep()} disabled={isPlaying} className="p-2 bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 rounded"><SkipForward size={16} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex flex-col bg-gray-900 border-r border-gray-800 shadow-2xl z-10 shrink-0">

          {selectedNode ? (
            <div className="p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 h-full overflow-y-auto">
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
                      value={selectedNode.data.source_var || selectedNode.data.val_payload?.rightValue || ''}
                      onChange={e => {
                        if (selectedNode.type === 'conditionNode') {
                            updateNodeData(selectedNode.id, { val_payload: { ...selectedNode.data.val_payload, rightValue: e.target.value } });
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
            <div className="flex flex-col h-full animate-in fade-in">
              <div className="p-4 border-b border-gray-800 bg-gray-950 flex flex-col gap-3">
                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2"><BookOpen size={14} /> Import z Biblioteki</span>
                <select onChange={(e) => importAlgorithm(e.target.value)} defaultValue="" className="w-full bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700 outline-none focus:border-indigo-500">
                  <option value="" disabled>-- Wybierz scenariusz --</option>
                  {ALGORITHMS_DB.map(algo => <option key={algo.id} value={algo.id}>{algo.title}</option>)}
                </select>
              </div>

              <div className="p-4 flex flex-col gap-3 border-b border-gray-800">
                <input value={algoName} onChange={(e) => setAlgoName(e.target.value)} placeholder="Tytuł Algorytmu" className="w-full bg-gray-950 text-white font-bold p-2.5 rounded border border-gray-800 outline-none focus:border-blue-500" />
                <textarea value={algoDesc} onChange={(e) => setAlgoDesc(e.target.value)} placeholder="Fabuła algorytmu..." className="w-full bg-gray-950 text-gray-300 text-xs p-2.5 rounded border border-gray-800 outline-none focus:border-blue-500 resize-none h-24 custom-scrollbar" />
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
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
                      <option key={cmd} value={cmd}>{(INSTRUCTION_DEFS as any)[cmd].label || cmd}</option>
                  ))}
                </select>

                <div className="flex flex-col gap-2 mt-1">
                    {(INSTRUCTION_DEFS as any)[selectedCmd]?.inputs?.map((inputKey: string) => (
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

        {/* GŁÓWNE PŁÓTNO (React Flow Canvas) */}
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
            fitView
            theme="dark"
            minZoom={0.2}
            className="bg-black"
          >
            <Background color="#222" gap={16} />

          </ReactFlow>
        </div>
      </div>
    </div>
  );
};