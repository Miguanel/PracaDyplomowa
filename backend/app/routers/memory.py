from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Any, Dict, Optional
from app.services.memory_manager import memory_manager

router = APIRouter()


# --- MODELE DANYCH (ZAKTUALIZOWANE POD KOMPILATOR WSKAŹNIKÓW) ---

class MallocRequest(BaseModel):
    label: str
    size: int
    fields: Dict[str, Any] = {}
    x: Optional[int] = None
    y: Optional[int] = None


class AssignPointerRequest(BaseModel):
    target_expression: str  # np. "curr"
    field_name: str         # np. "next"
    source_expression: str  # np. "prev->next"


class WriteValueRequest(BaseModel):
    target_expression: str  # np. "curr->next"
    field_name: str         # np. "val"
    value: Any              # np. 99


class VariableRequest(BaseModel):
    name: str               # np. "curr"
    source_expression: str  # np. "head->next"


class FreeRequest(BaseModel):
    target_expression: str  # np. "temp"


# --- ENDPOINTY ---

@router.get("/dump")
async def get_dump():
    return {"memory_dump": memory_manager.get_state()}


@router.post("/malloc")
async def allocate(req: MallocRequest):
    try:
        addr = memory_manager.malloc(req.size, req.label, req.x, req.y)
        # Inicjalizacja pól (np. przypisanie "val" w nowo powstałym węźle)
        if req.fields:
            for k, v in req.fields.items():
                # Używamy write_value, ponieważ adres zwracany z malloc to stała (np. "0x100")
                memory_manager.write_value(addr, k, v)
        return {"address": addr, "memory_dump": memory_manager.get_state()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assign_pointer")
async def assign_pointer(req: AssignPointerRequest):
    """Odpowiednik w C++: target_expression->field = source_expression;"""
    try:
        memory_manager.assign_pointer(req.target_expression, req.field_name, req.source_expression)
        return {"status": "ok", "memory_dump": memory_manager.get_state()}
    except ValueError as e:
        # Kod 422 - Unprocessable Entity (idealny dla błędów logicznych kompilatora)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/write_value")
async def write_value(req: WriteValueRequest):
    """Odpowiednik w C++: target_expression->field = value; (dla typów prostych)"""
    try:
        memory_manager.write_value(req.target_expression, req.field_name, req.value)
        return {"status": "ok", "memory_dump": memory_manager.get_state()}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/variable")
async def set_var(req: VariableRequest):
    """Odpowiednik w C++: Node* name = source_expression;"""
    try:
        memory_manager.set_variable(req.name, req.source_expression)
        return {"status": "ok", "memory_dump": memory_manager.get_state()}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/free")
async def free_mem(req: FreeRequest):
    """
    Zamienione z metody DELETE /free/{address} na POST /free.
    Pozwala to na bezpieczne przesyłanie znaków specjalnych w ciele JSON (np. "curr->next").
    """
    try:
        memory_manager.free(req.target_expression)
        return {"status": "ok", "memory_dump": memory_manager.get_state()}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset")
async def reset():
    memory_manager.reset()
    return {"memory_dump": memory_manager.get_state()}


@router.post("/restore")
async def restore_memory(dump: Dict[str, Any] = Body(...)):
    try:
        if "memory_dump" in dump:
            memory_manager.restore_state(dump["memory_dump"])
        else:
            memory_manager.restore_state(dump)
        return {"status": "restored", "memory_dump": memory_manager.get_state()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))