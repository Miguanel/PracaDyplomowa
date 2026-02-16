// To odwzorowuje strukturę MemoryBlock z Pythona
export interface MemoryBlock {
  address: string;      // "0x100"
  label: string;        // "Node A"
  size: number;
  data: Record<string, any>; // {"val": 10, "next": null}
  is_freed: boolean;
}

// To jest odpowiedź z API (MemoryResponse)
export interface MemoryState {
  heap: MemoryBlock[];
  stack: Record<string, string>; // Zmienne globalne
}

export interface ApiResponse {
  status: string;
  allocated_address: string;
  memory_dump: MemoryState;
}