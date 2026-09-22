import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

// Wyciągamy adres API ze zmiennych środowiskowych (Vite).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useMemoryStore = create((set, get) => ({
    nodes: [],
    edges: [],
    activeNodeId: null, // Śledzi, który węzeł aktualnie się wykonuje
    updateNodeData: (nodeId, newData) => set((state) => ({
        nodes: state.nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
        )
    })),
    memoryState: { heap: [], stack: {} },
    sandboxMemoryState: null,
    initialSandboxState: null,

    simulationError: null,
    setSimulationError: (msg) => set({ simulationError: msg }),
    clearSimulationError: () => set({ simulationError: null }),

    removeAlgorithmStep: async (stepIndexToRemove) => {
        const { activeAlgorithm, recompileSandboxAlgorithm, isPlaying, setIsPlaying } = get();
        if (!activeAlgorithm || !activeAlgorithm.steps) return;

        if (isPlaying) setIsPlaying(false);

        const newSteps = activeAlgorithm.steps.filter((_, idx) => idx !== stepIndexToRemove);
        const updatedAlgo = { ...activeAlgorithm, steps: newSteps };
        await recompileSandboxAlgorithm(updatedAlgo);
    },

    codeHistory: [],
    isLoading: false,
    error: null,

    algorithms: [],
    customAlgorithms: [],
    activeAlgorithm: null,
    currentStepIndex: -1,
    highlightedAddress: null,
    setHighlightedAddress: (addr) => set({ highlightedAddress: addr }),

    isSandboxMode: false,
    isPlaying: false,
    setIsPlaying: (val) => set({ isPlaying: val }),

    buildGraphFromAlgorithm: (algo) => {
        const generatedNodes = [{
            id: 'node-start',
            type: 'startNode',
            position: { x: 400, y: 50 },
            data: { label: 'START' }
        }];
        const generatedEdges = [];
        let prevId = 'node-start';
        let prevWasCondition = false;

        if (algo.steps && Array.isArray(algo.steps)) {
            algo.steps.forEach((step, idx) => {
                const nodeId = `node-${idx}`;
                const isCond = step.cmd === 'COMPARE' || step.cmd === 'CHECK_NULL'; // CHECK_NULL też jest warunkiem!

                generatedNodes.push({
                    id: nodeId,
                    type: isCond ? 'conditionNode' : 'actionNode',
                    position: { x: 400, y: 150 + idx * 180 },
                    data: { ...step, label: step.cmd }
                });

                const newEdge = {
                    id: `edge-${prevId}-${nodeId}`,
                    source: prevId,
                    target: nodeId,
                    type: 'smoothstep',
                    animated: true
                };

                if (prevWasCondition) {
                    newEdge.sourceHandle = 'true';
                }

                generatedEdges.push(newEdge);
                prevId = nodeId;
                prevWasCondition = isCond;
            });
        }

        const stopNodeId = 'node-stop';
        const stopY = 150 + ((algo.steps ? algo.steps.length : 0) * 180);

        generatedNodes.push({
            id: stopNodeId,
            type: 'actionNode',
            position: { x: 400, y: stopY },
            data: { label: 'STOP', cmd: 'STOP', explanation: 'Koniec scenariusza. Algorytm wykonany pomyślnie.' }
        });

        generatedEdges.push({
            id: `edge-${prevId}-${stopNodeId}`,
            source: prevId,
            target: stopNodeId,
            type: 'smoothstep',
            animated: true
        });

        set({ nodes: generatedNodes, edges: generatedEdges, activeAlgorithm: algo });
    },

    hardResetPlayback: async () => {
        set({ isPlaying: false, activeNodeId: null, currentStepIndex: -1, simulationError: null });
        const { isSandboxMode, exitSandboxMode } = get();
        if (isSandboxMode) {
            await exitSandboxMode();
        }
    },

    onNodesChange: changes => set({ nodes: applyNodeChanges(changes, get().nodes) }),
    onEdgesChange: changes => set({ edges: applyEdgeChanges(changes, get().edges) }),

    loadAlgorithm: async (algo) => {
        await get().hardResetPlayback();
        get().buildGraphFromAlgorithm(algo);
        set({ currentStepIndex: -1 });
    },

    setDraftAlgorithm: (algo, stepIndex) => set({
      activeAlgorithm: algo,
      currentStepIndex: stepIndex
    }),

    clearAlgorithm: () => set({
      activeAlgorithm: null,
      currentStepIndex: -1
    }),

    recompileSandboxAlgorithm: async (updatedAlgo) => {
        set({ isLoading: true });
        try {
            set({ activeAlgorithm: updatedAlgo });
            await get().resetMemory();
            await get().enterSandboxMode();
        } catch (error) {
            console.error("Błąd rekompilacji Sandboxa:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMemory: async () => {
        try {
            const res = await fetch(`${API_URL}/api/memory/dump`);
            if (!res.ok) return;
            const data = await res.json();
            const memoryData = data?.memory_dump ? data.memory_dump : data;

            const isSandbox = get().isSandboxMode;
            const currentStack = isSandbox ? (get().sandboxMemoryState?.stack || {}) : get().memoryState.stack;
            const mergedStack = { ...currentStack, ...(memoryData?.stack || {}) };
            const newState = {
                heap: Array.isArray(memoryData?.heap) ? memoryData.heap : [],
                stack: mergedStack
            };

            if (isSandbox) set({ sandboxMemoryState: newState });
            else set({ memoryState: newState });
        } catch (e) { console.error("Fetch error:", e); }
    },

    resetMemory: async () => {
        set({ isLoading: true });
        const targetUrl = `${API_URL}/api/memory/reset`;

        try {
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const text = await res.text();
            let parsed;
            try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = null; }

            const memoryData = parsed?.memory_dump ? parsed.memory_dump : parsed;
            const safeMemoryState = {
                stack: memoryData?.stack || {},
                heap: Array.isArray(memoryData?.heap) ? memoryData.heap : []
            };

            set({
                memoryState: safeMemoryState,
                sandboxMemoryState: null,
                initialSandboxState: null,
                isSandboxMode: false,
                currentStepIndex: -1,
                activeNodeId: null,
                isPlaying: false,
                codeHistory: []
            });

            const currentAlgo = get().activeAlgorithm;
            if (currentAlgo) {
                get().buildGraphFromAlgorithm(currentAlgo);
            } else {
                set({ nodes: [], edges: [] });
            }

        } catch (error) {
            console.error("Błąd połączenia:", error);
            set({
                memoryState: { stack: {}, heap: [] },
                sandboxMemoryState: null,
                initialSandboxState: null,
                isSandboxMode: false,
                currentStepIndex: -1,
                activeNodeId: null,
                isPlaying: false,
                codeHistory: []
            });
        } finally {
            set({ isLoading: false });
        }
    },

    allocateNode: async (label, val) => {
        set({ isLoading: true, error: null });
        try {
            let valueToSend = val;
            let posX = undefined, posY = undefined;
            if (typeof val === 'object' && val !== null) {
                if ('val' in val) valueToSend = val.val;
                if ('x' in val) posX = val.x;
                if ('y' in val) posY = val.y;
            }
            const payload = {
                label: label,
                size: 8,
                fields: { val: valueToSend, next: null, prev: null },
                ...(posX !== undefined && posX !== null && { x: posX }),
                ...(posY !== undefined && posY !== null && { y: posY })
            };
            const response = await fetch(`${API_URL}/api/memory/malloc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || `Błąd alokacji węzła ${label}`);
            }
            const data = await response.json();
            const memoryData = data?.memory_dump ? data.memory_dump : data;
            const newHeap = Array.isArray(memoryData?.heap) ? memoryData.heap : [];

            let createdNode = [...newHeap].reverse().find((b) =>
                (b.data && b.data.label === label) || b.label === label
            );
            if (!createdNode && newHeap.length > 0) createdNode = newHeap[newHeap.length - 1];

            const isSandbox = get().isSandboxMode;
            const currentStack = isSandbox ? (get().sandboxMemoryState?.stack || {}) : get().memoryState.stack;
            const mergedStack = { ...currentStack, ...(memoryData?.stack || {}) };
            if (createdNode) mergedStack[label] = createdNode.address;

            const newState = { heap: newHeap, stack: mergedStack };
            if (isSandbox) set({ sandboxMemoryState: newState });
            else set({ memoryState: newState });

            const code = `${label} = new Node(${payload.fields.val});`;
            set(state => ({ codeHistory: [...state.codeHistory, code] }));
        } catch (err) {
            set({ error: err.message, simulationError: err.message });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    connectNodes: async (sourceAddr, targetAddr, fieldName) => {
        const payload = {
            target_expression: sourceAddr,
            field_name: fieldName,
            source_expression: targetAddr
        };
        let response;
        try {
            response = await fetch(`${API_URL}/api/memory/assign_pointer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (netErr) {
            throw new Error(`Błąd sieciowy podczas operacji na wskaźniku: ${netErr.message}`);
        }

        if (!response.ok) {
            let errorDetail = `Błąd dowiązania: ${sourceAddr}->${fieldName} = ${targetAddr}`;
            try {
                const errJson = await response.json();
                if (errJson && errJson.detail) errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
            } catch (parseErr) {}
            throw new Error(errorDetail);
        }

        await get().fetchMemory();
        set(state => ({ codeHistory: [...state.codeHistory, `${sourceAddr}->${fieldName} = ${targetAddr};`] }));
    },

    setVariable: async (name, address) => {
        const response = await fetch(`${API_URL}/api/memory/variable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, source_expression: address }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || `Nie można przypisać zmiennej: ${name}`);
        }
        await get().fetchMemory();
    },

    runAlgorithmStep: async (instruction) => {
        const { allocateNode, connectNodes } = get();
        const state = get().isSandboxMode ? get().sandboxMemoryState : get().memoryState;
        if (!state) return;

        // OCHRONA 1: HEAP EXHAUSTION (Nieskończona pętla)
        if (state.heap.length > 50) {
            get().setSimulationError("Stack/Heap Overflow: Przekroczono limit pamięci sterty (max 50 węzłów). Prawdopodobnie wystąpiła nieskończona pętla z alokacją!");
            return null;
        }

        console.log("▶ Krok:", instruction.cmd, instruction.var_name);

        // SYSTEM WALIDACJI WSKAŹNIKÓW - Weryfikacja stosu i sterty w locie
        const getAddr = (v) => state.stack[v];
        const isValid = (addr) => state.heap.some(n => n.address === addr);
        const requireValid = (varName) => {
            const addr = getAddr(varName);
            // OCHRONA 2: Null Pointer
            if (!addr) throw new Error(`Null Pointer Dereference: Odwołanie do wskaźnika '${varName}', który jest NULL (lub niezainicjowany).`);
            // OCHRONA 3 & 4: Dangling Pointer / Use-After-Free
            if (!isValid(addr)) throw new Error(`Dangling Pointer: Wskaźnik '${varName}' wskazuje na usunięty obszar pamięci (Use-After-Free)!`);
            return addr;
        };

        try {
            switch (instruction.cmd) {
                case 'ALLOC':
                    // OCHRONA 5: Memory Leak
                    const existingAddr = getAddr(instruction.var_name);
                    if (existingAddr && isValid(existingAddr)) {
                        throw new Error(`Memory Leak (Wyciek Pamięci): Zmienna '${instruction.var_name}' już przechowuje alokację. Użyj FREE przed ponowną alokacją!`);
                    }
                    await allocateNode(instruction.var_name, instruction.val_payload);
                    break;

                case 'ASSIGN_FIELD':
                    requireValid(instruction.var_name);
                    // OCHRONA 6: Dangling Target Connection
                    if (instruction.source_var && instruction.source_var !== "NULL") {
                        requireValid(instruction.source_var);
                    }
                    await connectNodes(instruction.var_name, instruction.source_var || "NULL", instruction.field_name);
                    break;

                case 'ASSIGN_VAR':
                    if (instruction.source_var && instruction.source_var !== "NULL") {
                        requireValid(instruction.source_var);
                    }
                    await get().setVariable(instruction.var_name, instruction.source_var || "NULL");
                    set(s => ({ codeHistory: [...s.codeHistory, `${instruction.var_name} = ${instruction.source_var || "NULL"};`] }));
                    break;

                case 'FREE':
                    requireValid(instruction.var_name); // Wyłapuje Double Free i Null Free
                    const exprToFree = instruction.var_name;
                    if (exprToFree) {
                         const response = await fetch(`${API_URL}/api/memory/free`, {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ target_expression: exprToFree })
                         });
                         if (!response.ok) {
                             const err = await response.json().catch(() => ({}));
                             throw new Error(err.detail || `Próba usunięcia nieistniejącego wskaźnika: ${exprToFree}`);
                         }
                         set(s => ({ codeHistory: [...s.codeHistory, `delete ${exprToFree};`] }));
                         await get().fetchMemory();
                    }
                    break;

                case 'SET_VAL':
                    requireValid(instruction.var_name);
                    const targetExprVal = instruction.var_name;
                    if (targetExprVal) {
                        const response = await fetch(`${API_URL}/api/memory/write_value`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ target_expression: targetExprVal, field_name: 'val', value: instruction.val_payload })
                        });
                        if (!response.ok) {
                             const err = await response.json().catch(() => ({}));
                             throw new Error(err.detail || `Błąd nadpisania wartości dla: ${targetExprVal}`);
                        }
                        await get().fetchMemory();
                    }
                    break;

                case 'STEP_FORWARD':
                    requireValid(instruction.var_name);
                    const stepVar = instruction.var_name;
                    const stepField = instruction.field_name;
                    if (stepVar && stepField) {
                        const newExpression = `${stepVar}->${stepField}`;
                        await get().setVariable(stepVar, newExpression);
                        set(s => ({ codeHistory: [...s.codeHistory, `${stepVar} = ${newExpression};`] }));
                    }
                    break;

                case 'SET_FIELD_NULL':
                    requireValid(instruction.var_name);
                    const targetExprNull = instruction.var_name;
                    if (targetExprNull && instruction.field_name) {
                        const response = await fetch(`${API_URL}/api/memory/assign_pointer`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ target_expression: targetExprNull, field_name: instruction.field_name, source_expression: "NULL" })
                        });
                        if (!response.ok) {
                             const err = await response.json().catch(() => ({}));
                             throw new Error(err.detail || `Nie można ustawić NULL dla: ${targetExprNull}->${instruction.field_name}`);
                        }
                        await get().fetchMemory();
                    }
                    break;

                case 'CHECK_NULL':
                    // OCHRONA 7: Logika CHECK_NULL (zwraca true gdy węzeł jest Null lub Dangling, co nakieruje na IF=PRAWDA)
                    const addrToCheck = getAddr(instruction.var_name);
                    const isNull = !addrToCheck || !isValid(addrToCheck);
                    console.log(`[CHECK] ${instruction.var_name} ${isNull ? 'JEST NULL' : '!= NULL'}`);
                    return isNull; // Poprawiony zwrot wartości boolean do sterowania krawędzią

                case 'COMPARE':
                    requireValid(instruction.var_name);
                    const payloadCmp = instruction.val_payload || {};
                    const leftVar = instruction.var_name;
                    const operator = instruction.field_name;
                    const targetVar = payloadCmp.targetNode || "temp";
                    const compareMode = payloadCmp.compareMode || "number";
                    const rightValueRaw = payloadCmp.rightValue;

                    // OCHRONA 8: Typowanie COMPARE
                    if (compareMode === 'variable' && rightValueRaw) {
                        requireValid(rightValueRaw);
                    }

                    const leftAddrCmp = state.stack[leftVar];
                    const leftNode = state.heap.find(n => n.address === leftAddrCmp);
                    const leftVal = leftNode ? parseInt(leftNode.data.val) : 0;

                    let rightVal = 0;
                    if (compareMode === 'variable') {
                        const rightAddrCmp = state.stack[rightValueRaw];
                        const rightNode = state.heap.find(n => n.address === rightAddrCmp);
                        rightVal = rightNode ? parseInt(rightNode.data.val) : 0;
                    } else {
                        rightVal = parseInt(rightValueRaw) || 0;
                    }

                    let resultBool = false;
                    if (operator === '>') resultBool = leftVal > rightVal;
                    if (operator === '<') resultBool = leftVal < rightVal;
                    if (operator === '>=') resultBool = leftVal >= rightVal;
                    if (operator === '<=') resultBool = leftVal <= rightVal;
                    if (operator === '==') resultBool = leftVal == rightVal;
                    if (operator === '!=') resultBool = leftVal != rightVal;

                    const resultInt = resultBool ? 1 : 0;
                    const targetAddrCmp = state.stack[targetVar];
                    if (targetAddrCmp) {
                         const response = await fetch(`${API_URL}/api/memory/write`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                source_address: targetAddrCmp,
                                field_name: 'val',
                                target_address: resultInt
                            })
                        });
                        if (!response.ok) {
                             const err = await response.json().catch(()=>({}));
                             throw new Error(err.detail || `Błąd zapisu wyniku porównania`);
                        }
                        await get().fetchMemory();
                    }
                    return resultBool;
            }
            return true;
        } catch (e) {
            console.error("Krytyczny Błąd Kroku:", e.message);
            get().setSimulationError(e.message);
            return null; // Flaga awarii
        }
    },

    enterSandboxMode: async () => {
        try {
            const currentState = get().memoryState;
            const snapshot = JSON.parse(JSON.stringify(currentState));
            set({ isSandboxMode: true, sandboxMemoryState: snapshot, initialSandboxState: snapshot });
        } catch (e) { console.error(e); }
    },

    exitSandboxMode: async () => {
        const originalState = get().memoryState;
        set({ isSandboxMode: false, sandboxMemoryState: null, initialSandboxState: null, isPlaying: false });
        try {
            await fetch(`${API_URL}/api/memory/restore`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(originalState)
            });
            await get().fetchMemory();
        } catch (e) { console.error("Restore error:", e); }
    },

    executeSandboxStep: async (instruction) => {
        await get().runAlgorithmStep(instruction);
    },

    isConnectionNew: (sourceAddr, field, targetAddr) => {
        const { isSandboxMode, initialSandboxState } = get();
        if (!isSandboxMode || !initialSandboxState) return false;
        const initialNode = initialSandboxState.heap.find(n => n.address === sourceAddr);
        if (!initialNode) return true;
        const initialTarget = initialNode.data[field];
        return initialTarget !== targetAddr;
    },

    isNodeNew: (address) => {
        const { isSandboxMode, initialSandboxState } = get();
        if (!isSandboxMode || !initialSandboxState) return false;
        const existed = initialSandboxState.heap.some(n => n.address === address);
        return !existed;
    },

    fetchAlgorithms: async () => {
        try {
            const res = await fetch(`${API_URL}/api/algorithms`);
            if (res.ok) set({ customAlgorithms: await res.json() });
        } catch (err) { console.warn("Fetch algorithms error"); }
    },

    saveCustomAlgorithm: async (algo) => {
        set(state => ({ customAlgorithms: [...state.customAlgorithms, algo] }));
        try {
            await fetch(`${API_URL}/api/algorithms`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(algo)
            });
        } catch (e) { console.error("Save error"); }
    },

    nextAlgoStep: async () => { await get().nextGraphStep(); },

    nextGraphStep: async () => {
        const { nodes, edges, activeNodeId, runAlgorithmStep, isSandboxMode, enterSandboxMode } = get();
        if (!nodes.length) return;

        if (!isSandboxMode) await enterSandboxMode();

        let currentNodeId = activeNodeId;

        if (!currentNodeId) {
            const startNode = nodes.find(n => n.type === 'startNode');
            if (!startNode) return;
            set({ activeNodeId: startNode.id, currentStepIndex: -1 });
            return;
        }

        const currentNode = nodes.find(n => n.id === currentNodeId);
        if (!currentNode) {
            await get().hardResetPlayback();
            return;
        }

        if (currentNode.id === 'node-stop' || currentNode.data?.label === 'STOP') {
            set({ isPlaying: false, activeNodeId: currentNode.id });
            console.log("Dotarto do węzła STOP. Zatrzymano symulację.");
            return;
        }

        let conditionResult = true;
        if (currentNode.type !== 'startNode') {
             const stepResult = await runAlgorithmStep(currentNode.data);

             if (stepResult === null) {
                 console.error("Symulacja przerwana z powodu błędu operacji w pamięci.");
                 set({ isPlaying: false, activeNodeId: currentNode.id });
                 return;
             }

             conditionResult = stepResult;
        }

        let nextEdge = edges.find(e => e.source === currentNodeId);

        if (currentNode.type === 'conditionNode') {
             const handle = conditionResult ? 'true' : 'false';
             nextEdge = edges.find(e => e.source === currentNodeId && e.sourceHandle === handle);
        }

        // OCHRONA 9: Dangling Edge (Rozłączony graf)
        if (nextEdge) {
            const nextNodeIndex = nodes.findIndex(n => n.id === nextEdge.target);
            const realStepIndex = nextNodeIndex > 0 ? nextNodeIndex - 1 : -1;
            set({ activeNodeId: nextEdge.target, currentStepIndex: realStepIndex });
        } else {
            console.log("Koniec algorytmu (Brak drogi). Zatrzymano symulator.");
            // Generujemy błąd na Modalu, chyba że celowo skończył graf bez stopu (edukacyjne karcenie):
            if (currentNode.type !== 'startNode') {
                get().setSimulationError(`Missing Return/Stop: Graf urwał się niespodziewanie! Brak połączenia z kolejnym blokiem operacyjnym lub blokiem STOP z węzła '${currentNode.data?.cmd || 'START'}'.`);
            }
            set({ isPlaying: false });
        }
    },
}));