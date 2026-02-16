import { create } from 'zustand';

// --- TYPY DANYCH ---
export interface MemoryBlock {
  address: string;
  size: number;
  data: any;
  label?: string;
  visual_x?: number;
  visual_y?: number;
}

export interface MemoryState {
  heap: MemoryBlock[];
  stack: Record<string, string>;
}

export interface AlgorithmInstruction {
  cmd: "ASSIGN_VAR" | "ASSIGN_FIELD" | "ALLOC" | "FREE" | "SET_VAL" | "MATH_ADD" | "COPY_VAL" | "CHECK_NULL" | "STEP_FORWARD" | "SET_FIELD_NULL" | "COMPARE";
  var_name: string;
  source_var?: string;
  field_name?: string;
  val_payload?: any;
  explanation?: string;
  group?: string;
}

export interface AlgorithmDef {
  id: string;
  title: string;
  description: string;
  codeLines: string[];
  steps: AlgorithmInstruction[];
}

interface MemoryStore {
  memoryState: MemoryState;
  sandboxMemoryState: MemoryState | null;
  initialSandboxState: MemoryState | null;

  codeHistory: string[];
  isLoading: boolean;
  error: string | null;

  algorithms: AlgorithmDef[];
  customAlgorithms: AlgorithmDef[];
  activeAlgorithm: AlgorithmDef | null;
  currentStepIndex: number;

  isSandboxMode: boolean;

  fetchMemory: () => Promise<void>;
  resetMemory: () => Promise<void>;

  allocateNode: (label: string, val: any) => Promise<void>;
  connectNodes: (sourceAddr: string, targetAddr: string, fieldName: string) => Promise<void>;
  setVariable: (name: string, address: string) => Promise<void>;

  fetchAlgorithms: () => Promise<void>;
  saveCustomAlgorithm: (algo: AlgorithmDef) => Promise<void>;
  loadAlgorithm: (algo: AlgorithmDef) => void;
  nextAlgoStep: () => Promise<void>;

  runAlgorithmStep: (instruction: AlgorithmInstruction) => Promise<void>;

  enterSandboxMode: () => Promise<void>;
  exitSandboxMode: () => void;
  executeSandboxStep: (instruction: AlgorithmInstruction) => Promise<void>;

  isConnectionNew: (sourceAddr: string, field: string, targetAddr: string) => boolean;
  isNodeNew: (address: string) => boolean;
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
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
    isSandboxMode: false,

    fetchMemory: async () => {
        try {
            const res = await fetch('http://localhost:8000/api/memory/dump');
            if (!res.ok) return;
            const data = await res.json();
            const isSandbox = get().isSandboxMode;
            const currentStack = isSandbox ? (get().sandboxMemoryState?.stack || {}) : get().memoryState.stack;
            const mergedStack = { ...currentStack, ...(data.memory_dump.stack || {}) };
            const newState = { heap: data.memory_dump.heap, stack: mergedStack };
            if (isSandbox) set({ sandboxMemoryState: newState });
            else set({ memoryState: newState });
        } catch (e) { console.error("Fetch error:", e); }
    },

    resetMemory: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch('http://localhost:8000/api/memory/reset', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                const cleanState = data.memory_dump;
                set({
                    memoryState: cleanState,
                    sandboxMemoryState: get().isSandboxMode ? cleanState : null,
                    codeHistory: [],
                    error: null,
                    currentStepIndex: -1,
                    activeAlgorithm: null
                });
            }
        } catch (err) { console.error("Reset err:", err); }
        finally { set({ isLoading: false }); }
    },

    allocateNode: async (label, val) => {
        set({ isLoading: true, error: null });
        try {
            let valueToSend = val;
            let posX: number | undefined = undefined;
            let posY: number | undefined = undefined;
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
            const response = await fetch('http://localhost:8000/api/memory/malloc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`Błąd alokacji`);
            const data = await response.json();
            const newHeap = data.memory_dump.heap || [];
            let createdNode = [...newHeap].reverse().find((b: any) =>
                (b.data && b.data.label === label) || b.label === label
            );
            if (!createdNode && newHeap.length > 0) createdNode = newHeap[newHeap.length - 1];
            const isSandbox = get().isSandboxMode;
            const currentStack = isSandbox ? (get().sandboxMemoryState?.stack || {}) : get().memoryState.stack;
            const mergedStack = { ...currentStack, ...(data.memory_dump.stack || {}) };
            if (createdNode) mergedStack[label] = createdNode.address;
            const newState = { heap: newHeap, stack: mergedStack };
            if (isSandbox) set({ sandboxMemoryState: newState });
            else set({ memoryState: newState });
            const code = `${label} = new Node(${payload.fields.val});`;
            set(state => ({ codeHistory: [...state.codeHistory, code] }));
        } catch (err: any) { set({ error: err.message }); } finally { set({ isLoading: false }); }
    },

    connectNodes: async (sourceAddr, targetAddr, fieldName) => {
        try {
            const payload = { source_address: sourceAddr, field_name: fieldName, target_address: targetAddr };
            await fetch('http://localhost:8000/api/memory/write', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            await get().fetchMemory();
            set(state => ({ codeHistory: [...state.codeHistory, `Nodes[${sourceAddr}]->${fieldName} = ${targetAddr};`] }));
        } catch (err) { console.error("Connect err:", err); }
    },

    setVariable: async (name, address) => {
      try {
          await fetch('http://localhost:8000/api/memory/variable', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, address }),
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
                    const sAddr = state.stack[instruction.var_name];
                    const tAddr = state.stack[instruction.source_var || ""];
                    if (sAddr && tAddr && instruction.field_name) await connectNodes(sAddr, tAddr, instruction.field_name);
                    break;
                case 'ASSIGN_VAR':
                    const srcAddr = state.stack[instruction.source_var || ""];
                    if (srcAddr) {
                        const newStack = { ...state.stack, [instruction.var_name]: srcAddr };
                        const newState = { ...state, stack: newStack };
                        if (get().isSandboxMode) set({ sandboxMemoryState: newState });
                        else set({ memoryState: newState });
                    }
                    break;
                case 'FREE':
                    const addrToFree = state.stack[instruction.var_name];
                    if (addrToFree) {
                         const currentStack = { ...state.stack };
                         delete currentStack[instruction.var_name];
                         const newHeap = state.heap.filter(b => b.address !== addrToFree);
                         const newState = { heap: newHeap, stack: currentStack };
                         if (get().isSandboxMode) set({ sandboxMemoryState: newState });
                         else set({ memoryState: newState });
                         set(state => ({ codeHistory: [...state.codeHistory, `delete ${instruction.var_name};`] }));
                         try {
                             await fetch(`http://localhost:8000/api/memory/free/${addrToFree}`, { method: 'DELETE' });
                             await get().fetchMemory();
                         } catch (err) {}
                    }
                    break;
                case 'SET_VAL':
                    const nodeAddrSet = state.stack[instruction.var_name];
                    if (nodeAddrSet) {
                        await fetch('http://localhost:8000/api/memory/write', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ source_address: nodeAddrSet, field_name: 'val', target_address: instruction.val_payload })
                        });
                        await get().fetchMemory();
                    }
                    break;
                case 'MATH_ADD':
                    const nodeAddrAdd = state.stack[instruction.var_name];
                    if (nodeAddrAdd) {
                        const node = state.heap.find(n => n.address === nodeAddrAdd);
                        if (node) {
                            const currentVal = parseInt(node.data.val) || 0;
                            const addingVal = parseInt(instruction.val_payload) || 0;
                            const newVal = currentVal + addingVal;
                            await fetch('http://localhost:8000/api/memory/write', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ source_address: nodeAddrAdd, field_name: 'val', target_address: newVal })
                            });
                            await get().fetchMemory();
                        }
                    }
                    break;
                case 'COPY_VAL':
                    const destAddr = state.stack[instruction.var_name];
                    const srcDataAddr = state.stack[instruction.source_var || ""];
                    if (destAddr && srcDataAddr) {
                        const srcNode = state.heap.find(n => n.address === srcDataAddr);
                        if (srcNode) {
                            const valToCopy = srcNode.data.val;
                            await fetch('http://localhost:8000/api/memory/write', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ source_address: destAddr, field_name: 'val', target_address: valToCopy })
                            });
                            await get().fetchMemory();
                        }
                    }
                    break;
                case 'STEP_FORWARD':
                    const currentAddr = state.stack[instruction.var_name];
                    if (currentAddr) {
                        const node = state.heap.find(n => n.address === currentAddr);
                        if (node && instruction.field_name) {
                            const nextAddr = node.data[instruction.field_name];
                            if (nextAddr !== undefined) {
                                const newStack = { ...state.stack };
                                if (nextAddr === null) delete newStack[instruction.var_name];
                                else newStack[instruction.var_name] = nextAddr;
                                const newState = { ...state, stack: newStack };
                                if (get().isSandboxMode) set({ sandboxMemoryState: newState });
                                else set({ memoryState: newState });
                            }
                        }
                    }
                    break;
                case 'SET_FIELD_NULL':
                    const nodeAddrNull = state.stack[instruction.var_name];
                    if (nodeAddrNull && instruction.field_name) {
                        await fetch('http://localhost:8000/api/memory/write', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ source_address: nodeAddrNull, field_name: instruction.field_name, target_address: null })
                        });
                        await get().fetchMemory();
                    }
                    break;
                case 'CHECK_NULL':
                    const ptrAddr = state.stack[instruction.var_name];
                    if (!ptrAddr) console.log(`[CHECK] ${instruction.var_name} JEST NULL`);
                    else console.log(`[CHECK] ${instruction.var_name} != NULL`);
                    break;

                // --- NOWA LOGIKA COMPARE Z ZAPISEM WYNIKU ---
                case 'COMPARE':
                    // 1. Zdefiniuj obiekty
                    const payloadCmp = instruction.val_payload || {};
                    const leftVar = instruction.var_name;
                    const operator = instruction.field_name;

                    // Dane z payloadu
                    const targetVar = payloadCmp.targetNode || "temp";
                    const compareMode = payloadCmp.compareMode || "number"; // "variable" lub "number"
                    const rightValueRaw = payloadCmp.rightValue;

                    // 2. Pobierz Wartość Lewa (Node A)
                    const leftAddrCmp = state.stack[leftVar];
                    if (!leftAddrCmp) { console.warn(`[COMPARE] Zmienna ${leftVar} jest NULL`); break; }
                    const leftNode = state.heap.find(n => n.address === leftAddrCmp);
                    const leftVal = leftNode ? parseInt(leftNode.data.val) : 0;

                    // 3. Pobierz Wartość Prawa (Node B lub Liczba)
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

                    // 4. Oblicz Wynik (0 lub 1)
                    let resultBool = false;
                    if (operator === '>') resultBool = leftVal > rightVal;
                    if (operator === '<') resultBool = leftVal < rightVal;
                    if (operator === '>=') resultBool = leftVal >= rightVal;
                    if (operator === '<=') resultBool = leftVal <= rightVal;
                    if (operator === '==') resultBool = leftVal == rightVal;
                    if (operator === '!=') resultBool = leftVal != rightVal;

                    const resultInt = resultBool ? 1 : 0;

                    // 5. Zapisz Wynik do Target Node
                    const targetAddrCmp = state.stack[targetVar];
                    if (targetAddrCmp) {
                         await fetch('http://localhost:8000/api/memory/write', {
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
            await fetch('http://localhost:8000/api/memory/restore', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(originalState)
            });
            await get().fetchMemory();
        } catch (e) { console.error("Restore error:", e); }
    },

    executeSandboxStep: async (instruction) => {
        await get().runAlgorithmStep(instruction);
    },

    isConnectionNew: (sourceAddr: string, field: string, targetAddr: string) => {
        const { isSandboxMode, initialSandboxState } = get();
        if (!isSandboxMode || !initialSandboxState) return false;
        const initialNode = initialSandboxState.heap.find(n => n.address === sourceAddr);
        if (!initialNode) return true;
        const initialTarget = initialNode.data[field];
        return initialTarget !== targetAddr;
    },

    isNodeNew: (address: string) => {
        const { isSandboxMode, initialSandboxState } = get();
        if (!isSandboxMode || !initialSandboxState) return false;
        const existed = initialSandboxState.heap.some(n => n.address === address);
        return !existed;
    },

    fetchAlgorithms: async () => {
        try {
            const res = await fetch('http://localhost:8000/api/algorithms');
            if (res.ok) set({ customAlgorithms: await res.json() });
        } catch (err) { console.warn("Fetch algorithms error"); }
    },

    saveCustomAlgorithm: async (algo) => {
        set(state => ({ customAlgorithms: [...state.customAlgorithms, algo] }));
        try {
            await fetch('http://localhost:8000/api/algorithms', {
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