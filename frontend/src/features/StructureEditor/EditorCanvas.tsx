import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background, Controls, useNodesState, useEdgesState,
  Node, Edge, Connection, MarkerType, NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMemoryStore } from '../../store/memoryStore';
import { StructureNode } from './StructureNode';

export const EditorCanvas = () => {
  const {
    memoryState,
    sandboxMemoryState,
    isSandboxMode,
    connectNodes,
    setVariable,
    isConnectionNew,
    isNodeNew
  } = useMemoryStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const nodeTypes = useMemo(() => ({ structureNode: StructureNode }), []);
  const activeState = (isSandboxMode && sandboxMemoryState) ? sandboxMemoryState : memoryState;

  useEffect(() => {
    if (!activeState) return;

    const varsByAddress: Record<string, string[]> = {};
    if (activeState.stack) {
        Object.entries(activeState.stack).forEach(([varName, address]) => {
            if (!varsByAddress[address]) varsByAddress[address] = [];
            varsByAddress[address].push(varName);
        });
    }

    // --- 1. WĘZŁY (NODES) ---
    const newNodes: Node[] = activeState.heap.map((block, index) => {
      const isNewInSandbox = isNodeNew(block.address);
      const existingNode = nodesRef.current.find(n => n.id === block.address);

      let position = { x: 0, y: 0 };
      if (existingNode) {
          position = existingNode.position;
      } else if (block.visual_x !== null && block.visual_x !== undefined) {
          position = { x: block.visual_x, y: block.visual_y };
      } else {
          position = { x: 50 + (index * 250), y: 100 };
      }

      return {
        id: block.address,
        type: 'structureNode',
        position: position,
        data: {
          address: block.address,
          val: block.data.val,
          variables: varsByAddress[block.address] || []
        },
        style: isNewInSandbox
          ? {
              border: '2px dashed #3b82f6',
              backgroundColor: '#1e3a8a',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
            }
          : {}
      };
    });
    setNodes(newNodes);

    // --- 2. KRAWĘDZIE (EDGES) ---
    const newEdges: Edge[] = [];
    activeState.heap.forEach((block) => {
      Object.entries(block.data).forEach(([fieldName, value]) => {
        if (typeof value === 'string' && value.startsWith('0x')) {

          const isNewLink = isConnectionNew(block.address, fieldName, value);
          const isPrev = fieldName === 'prev';

          // A. Kolor krawędzi
          let edgeColor = isPrev ? '#f97316' : '#facc15'; // Pomarańczowy dla prev, Żółty dla next
          if (isSandboxMode && isNewLink) edgeColor = '#3b82f6'; // Niebieski dla nowych w teście

          // B. Styl linii (Ciągła vs Przerywana)
          // React Flow: animated=true wymusza linię przerywaną.
          // Dlatego dla NEXT musimy dać animated=false.

          // Czy animować? (Tylko jeśli to NOWE połączenie w trybie testowym)
          const shouldAnimate = isSandboxMode && isNewLink;

          // Styl kreskowania:
          // '5, 5' = przerywana (dla prev)
          // '0'    = ciągła (dla next)
          const strokeDash = isPrev ? '5, 5' : '0';

          newEdges.push({
            id: `e-${block.address}-${fieldName}-${value}`,
            source: block.address,
            sourceHandle: fieldName,
            target: value,
            targetHandle: 'target',

            // WAŻNE: Wyłączamy animację globalną, włączamy tylko dla wyróżnienia zmian w sandboxie
            animated: shouldAnimate,

            style: {
                stroke: edgeColor,
                strokeWidth: (isSandboxMode && isNewLink) ? 4 : 2,
                opacity: (isSandboxMode && !isNewLink) ? 0.3 : 1,

                // Jeśli animacja jest wyłączona, ręcznie sterujemy kreskowaniem
                strokeDasharray: shouldAnimate ? undefined : strokeDash
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
            zIndex: (isSandboxMode && isNewLink) ? 10 : 0
          });
        }
      });
    });
    setEdges(newEdges);

  }, [activeState, isSandboxMode, isConnectionNew, isNodeNew, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target && params.sourceHandle) {
      connectNodes(params.source, params.target, params.sourceHandle);
    }
  }, [connectNodes]);

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    if (isSandboxMode) return;
    const varName = window.prompt(`Nazwa zmiennej dla ${node.data.address}:`, "temp");
    if (varName?.trim()) setVariable(varName.trim(), node.id);
  }, [setVariable, isSandboxMode]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {isSandboxMode && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600/90 text-white px-6 py-2 rounded-full text-xs font-bold pointer-events-none shadow-lg border border-indigo-400 animate-pulse">
            TRYB TESTOWY (SANDBOX)
         </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color={isSandboxMode ? "#1e1b4b" : "#111"} gap={25} size={1} />
        <Controls className="bg-gray-800 border-gray-700 fill-white" />
      </ReactFlow>
    </div>
  );
};