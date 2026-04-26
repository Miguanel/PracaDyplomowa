from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_projects():
    return [{"id": "1", "name": "Demo Project", "description": "Przykładowy projekt"}]

@router.post("/")
async def create_project(project: dict):
    return {"status": "created", "project": project}