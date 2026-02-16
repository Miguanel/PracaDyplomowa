from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Any, Dict, Optional
from app.services.memory_manager import memory_manager

router = APIRouter()


# --- MODELE DANYCH ---

class MallocRequest(BaseModel):
    label: str
    size: int
    fields: Dict[str, Any] = {}
    x: Optional[int] = None
    y: Optional[int] = None


class WriteRequest(BaseModel):
    source_address: str
    field_name: str
    target_address: Any


# NOWY MODEL
class VariableRequest(BaseModel):
    name: str
    address: str


# --- ENDPOINTY ---

@router.get("/dump")
async def get_dump():
    return {"memory_dump": memory_manager.get_state()}


@router.post("/malloc")
async def allocate(req: MallocRequest):
    try:
        addr = memory_manager.malloc(req.size, req.label, req.x, req.y)
        if req.fields:
            for k, v in req.fields.items():
                memory_manager.write(addr, k, v)
        return {"address": addr, "memory_dump": memory_manager.get_state()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/write")
async def write_pointer(req: WriteRequest):
    try:
        success = memory_manager.write(req.source_address, req.field_name, req.target_address)
        if not success:
            raise HTTPException(status_code=404, detail="Address not found")
        return {"status": "ok", "memory_dump": memory_manager.get_state()}
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


# NOWY ENDPOINT - OBSŁUGA KLIKNIĘCIA W WĘZEŁ
@router.post("/variable")
async def set_var(req: VariableRequest):
    try:
        success = memory_manager.set_variable(req.name, req.address)
        if not success:
            raise HTTPException(status_code=404, detail="Address not found in heap")
        return {"status": "ok", "memory_dump": memory_manager.get_state()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/free/{address}")
async def free_mem(address: str):
    success = memory_manager.free(address)
    if not success:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"status": "ok", "memory_dump": memory_manager.get_state()}


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
