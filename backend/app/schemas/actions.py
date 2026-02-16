from pydantic import BaseModel
from typing import Dict, Any, Optional, Literal, Union


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


# 3. Model żądania ustawienia wskaźnika (Pointer) - TEGO BRAKOWAŁO
class PointerRequest(BaseModel):
    source_address: str  # np. "0x100"
    field_name: str  # np. "next"
    target_address: str  # np. "0x104"


# 4. Model instrukcji algorytmicznej (używany przez Interpreter i Kreator)
class Instruction(BaseModel):
    # Typ komendy: ASSIGN (przypisanie), ALLOC (nowy węzeł), FREE, SET_VAL
    cmd: Literal["ASSIGN_VAR", "ASSIGN_FIELD", "ALLOC", "FREE", "SET_VAL"]

    # Parametry opcjonalne (zależą od komendy)
    var_name: Optional[str] = None
    source_var: Optional[str] = None

    target_address: Optional[str] = None
    field_name: Optional[str] = None

    # Payload może być liczbą (dla SET_VAL) lub słownikiem (dla ALLOC {val, next, prev})
    val_payload: Optional[Union[int, str, Dict[str, Any], Any]] = None