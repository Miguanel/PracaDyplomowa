import { create } from 'zustand';

// Wyciągamy adres API ze zmiennych środowiskowych (Vite).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useMemoryStore = create((set, get) => ({
    memoryState: { heap: [], stack: {} },
    sandboxMemoryState: null,
    initialSandboxState: null,

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

    // --- IMPLEMENTACJA LIVE SYNC ---
    setDraftAlgorithm: (algo, stepIndex) => set({
      activeAlgorithm: algo,
      currentStepIndex: stepIndex
    }),

    clearAlgorithm: () => set({
      activeAlgorithm: null,
      currentStepIndex: -1
    }),

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

          set({
              memoryState: safeMemoryState,
              steps: [],
              currentStepIndex: -1,
              isPlaying: false,
              comparisonResult: null
          });
        } catch (error) {
          console.error("Błąd połączenia:", error);
          set({
              memoryState: { stack: {}, heap: [] },
              steps: [],
              currentStepIndex: -1,
              isPlaying: false,
              comparisonResult: null
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
            if (!response.ok) throw new Error(`Błąd alokacji`);
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
        } catch (err) { set({ error: err.message }); } finally { set({ isLoading: false }); }
    },

    connectNodes: async (sourceAddr, targetAddr, fieldName) => {
        try {
            const payload = {
                target_expression: sourceAddr,
                field_name: fieldName,
                source_expression: targetAddr
            };
            await fetch(`${API_URL}/api/memory/assign_pointer`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            await get().fetchMemory();
            set(state => ({ codeHistory: [...state.codeHistory, `${sourceAddr}->${fieldName} = ${targetAddr};`] }));
        } catch (err) { console.error("Connect err:", err); }
    },

    setVariable: async (name, address) => {
      try {
          await fetch(`${API_URL}/api/memory/variable`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: name, source_expression: address }),
          });
          await get().fetchMemory();
      } catch (err) { console.error("SetVariable error:", err); }
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
                         set(state => ({ codeHistory: [...state.codeHistory, `delete ${exprToFree};`] }));
                         try {
                             await fetch(`${API_URL}/api/memory/free`, {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ target_expression: exprToFree })
                             });
                             await get().fetchMemory();
                         } catch (err) { console.error("Free err", err); }
                    }
                    break;

                case 'SET_VAL':
                    const targetExprVal = instruction.var_name;
                    if (targetExprVal) {
                        await fetch(`${API_URL}/api/memory/write_value`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ target_expression: targetExprVal, field_name: 'val', value: instruction.val_payload })
                        });
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
                        await fetch(`${API_URL}/api/memory/assign_pointer`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ target_expression: targetExprNull, field_name: instruction.field_name, source_expression: "NULL" })
                        });
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
                    if (!leftAddrCmp) { console.warn(`[COMPARE] Zmienna ${leftVar} jest NULL`); break; }
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
                         await fetch(`${API_URL}/api/memory/write`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                source_address: targetAddrCmp,
                                field_name: 'val',
                                target_address: resultInt
                            })
                        });
                        await get().fetchMemory();
                        console.log(`[COMPARE] ${leftVal} ${operator} ${rightVal} = ${resultInt} -> Zapisano w ${targetVar}`);
                    } else {
                        console.warn(`[COMPARE] Nie znaleziono zmiennej docelowej: ${targetVar}. Wynik (${resultInt}) przepadł.`);
                    }
                    break;
            }
        } catch (e) { console.error("Step Error:", e); }
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
        set({ isSandboxMode: false, sandboxMemoryState: null, initialSandboxState: null });
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

    loadAlgorithm: (algo) => { set({ activeAlgorithm: algo, currentStepIndex: -1 }); },

    nextAlgoStep: async () => {
        const { activeAlgorithm, currentStepIndex, runAlgorithmStep } = get();
        if (!activeAlgorithm) return;
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < activeAlgorithm.steps.length) {
            await runAlgorithmStep(activeAlgorithm.steps[nextIndex]);
            set({ currentStepIndex: nextIndex });
        }
    },

}));