from pydantic import BaseModel
from typing import Dict, Any, Optional, Union, List

# 1. Model odpowiedzi po alokacji pamięci
class MemoryResponse(BaseModel):
    status: str
    allocated_address: str
    memory_dump: Dict[str, Any]

# 2. Model żądania alokacji (malloc)
class MallocRequest(BaseModel):
    label: str
    size: int
    fields: Dict[str, Any]

# 3. Model żądania ustawienia wskaźnika (Pointer)
class PointerRequest(BaseModel):
    source_address: str
    field_name: str
    target_address: str

# 4. Zaktualizowany model instrukcji (wspiera operacje logiczne)
class Instruction(BaseModel):
    cmd: str  # Typy m.in.: ASSIGN_VAR, ASSIGN_FIELD, ALLOC, FREE, SET_VAL, COMPARE, STEP_FORWARD, SET_FIELD_NULL
    var_name: Optional[str] = None
    source_var: Optional[str] = None
    target_address: Optional[str] = None
    field_name: Optional[str] = None
    val_payload: Optional[Union[int, str, Dict[str, Any], Any]] = None
    explanation: Optional[str] = None

# --- NOWE MODELE DLA ARCHITEKTURY GRAFOWEJ (REACT FLOW) ---

class GraphNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Instruction

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class GraphAlgorithm(BaseModel):
    id: str
    title: str
    description: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]