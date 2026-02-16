from fastapi import APIRouter

# Tutaj też musi być zdefiniowany 'router'
router = APIRouter()

@router.get("/")
async def get_simulation_status():
    return {"status": "idle", "message": "Simulation router is working"}

@router.post("/start")
async def start_simulation():
    return {"status": "started"}