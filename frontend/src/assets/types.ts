// Ścieżka: src/assets/types.ts
// Wspólne typy domenowe frontendu (odwzorowanie struktur z backendu FastAPI i danych algorytmów).
import type { ReactNode } from 'react';

// --- PAMIĘĆ (odpowiedź /api/memory/*) ---
export interface MemoryBlockData {
  val: unknown;
  next?: string | null;
  prev?: string | null;
  [field: string]: unknown;
}

export interface MemoryBlock {
  address: string;              // np. "0x64"
  label?: string;
  size: number;
  data: MemoryBlockData;
  visual_x?: number | null;
  visual_y?: number | null;
}

export interface MemoryState {
  heap: MemoryBlock[];
  stack: Record<string, string>; // nazwa zmiennej -> adres (lub "NULL")
}

// --- ALGORYTMY (src/data/algorithms.js, Kreator) ---
export interface ComparePayload {
  targetNode?: string;
  compareMode?: 'number' | 'variable';
  rightValue?: string | number;
}

export interface AllocPayload {
  val: number | string;
  x?: number;
  y?: number;
}

export interface AlgoStep {
  cmd: string;
  var_name?: string;
  field_name?: string;
  source_var?: string;
  val_payload?: AllocPayload | ComparePayload | number | string;
  group?: string;
  section?: string;
  explanation?: string;
  label?: string;
}

export interface Algorithm {
  id: string;
  title: string;
  description: string;
  codeLines?: string[];
  steps: AlgoStep[];
}

// --- OKNA (useWindowManager) ---
export interface WindowState {
  x: number;
  y: number;
  w: number;
  h: number;
  pinned: boolean;
  minimized: boolean;
  z: number;
}

export interface WindowActions {
  updatePos: (id: string, x: number, y: number, isDrop?: boolean) => void;
  updateSize: (id: string, size: { w: number; h: number }, pos: { x: number; y: number }) => void;
  togglePin: (id: string) => void;
  toggleMinimize: (id: string) => void;
}

export interface FloatingWindowProps {
  windowState: WindowState;
  windowActions: WindowActions;
  zIndexManager: (id: string) => void;
  children?: ReactNode;
}

// --- KREATOR (graf React Flow z blokami algorytmu) ---
export type AlgoNodeData = AlgoStep & { [key: string]: unknown };
export type AlgoFlowNode = import('@xyflow/react').Node<AlgoNodeData>;
