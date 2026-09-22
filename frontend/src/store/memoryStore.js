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

    codeHistory: [],
    isLoading: false,
    error: null,

    algorithms: [],
    customAlgorithms: [],
    activeAlgorithm: null,
    currentStepIndex: -1,
    highlightedAddress: null,
    setHighlightedAddress: (addr) => set({ highlightedAddress: addr }),

    // --- FLAGI ODTWARZACZA ---
    isSandboxMode: false,
    isPlaying: false,
    setIsPlaying: (val) => set({ isPlaying: val }),

    // ZMIANA 1: Ekstrakcja logiki rysowania grafu, aby nie blokowała resetu
    // ZMODYFIKOWANA: Buduje graf ze Startem oraz automatycznym węzłem STOP na końcu
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
                const isCond = step.cmd === 'COMPARE';

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

        // DODANE: Automatyczny węzeł STOP na samym końcu
        const stopNodeId = 'node-stop';
        const stopY = 150 + ((algo.steps ? algo.steps.length : 0) * 180);

        generatedNodes.push({
            id: stopNodeId,
            type: 'actionNode', // Możesz zostawić jako actionNode lub stworzyć dedykowany stopNode
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

    // Twardy reset musi czyścić również błędy
    hardResetPlayback: async () => {
        set({ isPlaying: false, activeNodeId: null, currentStepIndex: -1, simulationError: null });
        const { isSandboxMode, exitSandboxMode } = get();
        if (isSandboxMode) {
            await exitSandboxMode();
        }
    },

    onNodesChange: changes => set({ nodes: applyNodeChanges(changes, get().nodes) }),
    onEdgesChange: changes => set({ edges: applyEdgeChanges(changes, get().edges) }),

    // ZMIANA 1 cd.: Zabezpieczenie przed nakładaniem się grafów przy przełączaniu
    loadAlgorithm: async (algo) => {
        await get().hardResetPlayback();
        get().buildGraphFromAlgorithm(algo);
        set({ currentStepIndex: -1 });
    },

    // --- IMPLEMENTACJA LIVE SYNC ---
    setDraftAlgorithm: (algo, stepIndex) => set({
      activeAlgorithm: algo,
      currentStepIndex: stepIndex
    }),

    clearAlgorithm: () => set({
      activeAlgorithm: null,
      currentStepIndex: -1
    }),

    // ZMIANA 3: Silnik rekompilacji w locie dla trybu Sandbox
    recompileSandboxAlgorithm: async (updatedAlgo) => {
        set({ isLoading: true });
        try {
            set({ activeAlgorithm: updatedAlgo });

            // 1. Zerujemy maszynę i rysujemy zaktualizowany graf (nowe krawędzie)
            await get().resetMemory();

            // 2. Automatycznie wchodzimy z powrotem w tryb eksperymentalny
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

            // BEZPIECZNE ROZPAKOWANIE
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

    // ZMIANA 2: Naprawiony przycisk RESTART (czyści backend, płótno, historię kodu i stany Sandboxa)
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
            try {
                parsed = text ? JSON.parse(text) : null;
            } catch (e) {
                parsed = null;
            }

            const memoryData = parsed?.memory_dump ? parsed.memory_dump : parsed;

            const safeMemoryState = {
                stack: memoryData?.stack || {},
                heap: Array.isArray(memoryData?.heap) ? memoryData.heap : []
            };

            // Twardy reset pamięci i całkowite opuszczenie ewentualnych trybów brudnych
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

            // Odświeżenie płótna z zachowaniem obecnego algorytmu (jeśli jakiś był)
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
            let posX = undefined;
            let posY = undefined;
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
            set({ error: err.message });
            throw err; // Zabezpieczenie: Wyrzucamy błąd wyżej, by zatrzymać odtwarzacz!
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
        const response = await fetch(`${API_URL}/api/memory/assign_pointer`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || `Błąd dowiązania wskaźnika: ${sourceAddr}->${fieldName} = ${targetAddr}`);
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

        console.log("▶ Krok:", instruction.cmd, instruction.var_name);

        try {
            switch (instruction.cmd) {
                case 'ALLOC': await allocateNode(instruction.var_name, instruction.val_payload); break;

                case 'ASSIGN_FIELD':
                    const targetExprField = instruction.var_name;
                    const sourceExprField = instruction.source_var || "NULL";
                    if (targetExprField && instruction.field_name) {
                        await connectNodes(targetExprField, sourceExprField, instruction.field_name);
                    }
                    break;

                case 'ASSIGN_VAR':
                    const targetVarName = instruction.var_name;
                    const sourceExprVar = instruction.source_var || "NULL";
                    if (targetVarName) {
                        await get().setVariable(targetVarName, sourceExprVar);
                        set(state => ({ codeHistory: [...state.codeHistory, `${targetVarName} = ${sourceExprVar};`] }));
                    }
                    break;

                case 'FREE':
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
                         set(state => ({ codeHistory: [...state.codeHistory, `delete ${exprToFree};`] }));
                         await get().fetchMemory();
                    }
                    break;

                case 'SET_VAL':
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
                    const stepVar = instruction.var_name;
                    const stepField = instruction.field_name;
                    if (stepVar && stepField) {
                        const newExpression = `${stepVar}->${stepField}`;
                        await get().setVariable(stepVar, newExpression);
                        set(state => ({ codeHistory: [...state.codeHistory, `${stepVar} = ${newExpression};`] }));
                    }
                    break;

                case 'SET_FIELD_NULL':
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
                    const ptrAddr = state.stack[instruction.var_name];
                    if (!ptrAddr) console.log(`[CHECK] ${instruction.var_name} JEST NULL`);
                    else console.log(`[CHECK] ${instruction.var_name} != NULL`);
                    break;

                case 'COMPARE':
                    const payloadCmp = instruction.val_payload || {};
                    const leftVar = instruction.var_name;
                    const operator = instruction.field_name;

                    const targetVar = payloadCmp.targetNode || "temp";
                    const compareMode = payloadCmp.compareMode || "number";
                    const rightValueRaw = payloadCmp.rightValue;

                    const leftAddrCmp = state.stack[leftVar];
                    if (!leftAddrCmp) { throw new Error(`Zmienna na stosie nie istnieje: ${leftVar}`); }
                    const leftNode = state.heap.find(n => n.address === leftAddrCmp);
                    const leftVal = leftNode ? parseInt(leftNode.data.val) : 0;

                    let rightVal = 0;
                    if (compareMode === 'variable') {
                        const rightAddrCmp = state.stack[rightValueRaw];
                        if (rightAddrCmp) {
                            const rightNode = state.heap.find(n => n.address === rightAddrCmp);
                            rightVal = rightNode ? parseInt(rightNode.data.val) : 0;
                        }
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
            return null; // Zwracamy NULL, jako flagę uwięzienia błędu!
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

    // --- ALIAS DLA STAREJ STRZAŁKI PLAY ---
    nextAlgoStep: async () => { await get().nextGraphStep(); },

    nextGraphStep: async () => {
        const { nodes, edges, activeNodeId, runAlgorithmStep, isSandboxMode, enterSandboxMode } = get();
        if (!nodes.length) return;

        if (!isSandboxMode) await enterSandboxMode();

        let currentNodeId = activeNodeId;

        // UWAGA: Usunięto wadliwy blok "Auto-Restart", który powodował zapętlanie
        // po usunięciu węzła i zerwaniu krawędzi (nadpisywał currentNodeId = null).

        // 1. WEJŚCIE W START
        if (!currentNodeId) {
            const startNode = nodes.find(n => n.type === 'startNode');
            if (!startNode) return;
            // POPRAWKA: START to tylko wizualny punkt. Nie jest prawdziwym krokiem kodu, więc index to -1.
            set({ activeNodeId: startNode.id, currentStepIndex: -1 });
            return;
        }

        const currentNode = nodes.find(n => n.id === currentNodeId);
        if (!currentNode) {
            await get().hardResetPlayback();
            return;
        }

        // TWARDA BLOKADA: Jeśli dotarliśmy do węzła STOP, natychmiast zatrzymujemy odtwarzanie i NIE resetujemy wskaźnika.
        if (currentNode.id === 'node-stop' || currentNode.data?.label === 'STOP') {
            set({ isPlaying: false, activeNodeId: currentNode.id });
            console.log("Dotarto do węzła STOP. Zatrzymano symulację.");
            return;
        }

        let conditionResult = true;
        if (currentNode.type !== 'startNode') {
             const stepResult = await runAlgorithmStep(currentNode.data);

             // WYKRYCIE BŁĘDU KRYTYCZNEGO
             if (stepResult === null) {
                 console.error("Symulacja przerwana z powodu błędu operacji w pamięci.");
                 set({ isPlaying: false, activeNodeId: currentNode.id });
                 return; // Silnik zatrzymany natychmiast na błędnym bloku
             }

             conditionResult = stepResult;
        }

        let nextEdge = edges.find(e => e.source === currentNodeId);

        if (currentNode.type === 'conditionNode') {
             const handle = conditionResult ? 'true' : 'false';
             nextEdge = edges.find(e => e.source === currentNodeId && e.sourceHandle === handle);
        }

        // 2. PRZEJŚCIE DO NASTĘPNEGO KROKU
        if (nextEdge) {
            const nextNodeIndex = nodes.findIndex(n => n.id === nextEdge.target);

            // POPRAWKA (Synchronizacja przesunięcia):
            // Węzeł START to nodes[0]. Pierwszy krok (np. ALLOC) to nodes[1].
            // Translator chce indeks 0 dla pierwszego kroku, więc zawsze odejmujemy 1!
            const realStepIndex = nextNodeIndex > 0 ? nextNodeIndex - 1 : -1;

            set({ activeNodeId: nextEdge.target, currentStepIndex: realStepIndex });
        } else {
            console.log("Koniec algorytmu (Brak drogi). Zatrzymano symulator.");
            // Zatrzymujemy zegar, ale NIE czyścimy activeNodeId, aby ostatni węzeł nadal świecił!
            set({ isPlaying: false });
        }
    },
}));