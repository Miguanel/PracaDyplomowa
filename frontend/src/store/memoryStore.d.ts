// Ścieżka: src/store/memoryStore.d.ts
// Deklaracja typów dla store'a pamięci (implementacja w memoryStore.js).
import type { UseBoundStore, StoreApi } from 'zustand';
import type { Edge, NodeChange, EdgeChange } from '@xyflow/react';
import type { Algorithm, AlgoStep, AlgoFlowNode, MemoryState } from '../assets/types';

export interface MemoryStoreState {
  nodes: AlgoFlowNode[];
  edges: Edge[];
  activeNodeId: string | null;
  updateNodeData: (nodeId: string, newData: Record<string, unknown>) => void;

  memoryState: MemoryState;
  sandboxMemoryState: MemoryState | null;
  initialSandboxState: MemoryState | null;

  simulationError: string | null;
  setSimulationError: (msg: string | null) => void;
  clearSimulationError: () => void;

  removeAlgorithmStep: (stepIndex: number) => Promise<void>;
  codeHistory: string[];
  isLoading: boolean;
  error: string | null;

  algorithms: Algorithm[];
  customAlgorithms: Algorithm[];
  activeAlgorithm: Algorithm | null;
  currentStepIndex: number;
  highlightedAddress: string | null;
  setHighlightedAddress: (addr: string | null) => void;

  isSandboxMode: boolean;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  isStepping: boolean;

  buildGraphFromAlgorithm: (algo: Algorithm) => void;
  hardResetPlayback: () => Promise<void>;
  onNodesChange: (changes: NodeChange<AlgoFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  loadAlgorithm: (algo: Algorithm) => Promise<void>;
  setDraftAlgorithm: (algo: Algorithm, stepIndex: number) => void;
  clearAlgorithm: () => void;
  recompileSandboxAlgorithm: (algo: Algorithm) => Promise<void>;

  fetchMemory: () => Promise<void>;
  resetMemory: () => Promise<void>;
  allocateNode: (label: string, val: unknown) => Promise<void>;
  connectNodes: (sourceAddr: string, targetAddr: string, fieldName: string) => Promise<void>;
  setVariable: (name: string, address: string) => Promise<void>;
  runAlgorithmStep: (instruction: AlgoStep) => Promise<boolean | null | undefined>;

  enterSandboxMode: () => Promise<void>;
  exitSandboxMode: () => Promise<void>;
  executeSandboxStep: (instruction: AlgoStep) => Promise<void>;
  isConnectionNew: (sourceAddr: string, field: string, targetAddr: string) => boolean;
  isNodeNew: (address: string) => boolean;

  fetchAlgorithms: () => Promise<void>;
  saveCustomAlgorithm: (algo: Algorithm) => Promise<void>;
  nextAlgoStep: () => Promise<void>;
  nextGraphStep: () => Promise<void>;
}

export declare const useMemoryStore: UseBoundStore<StoreApi<MemoryStoreState>>;
