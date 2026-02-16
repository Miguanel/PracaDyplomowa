from fastapi import APIRouter

# To jest ta zmienna, której brakowało!
router = APIRouter()

# Przykładowy endpoint (zwraca puste projekty na start)
@router.get("/")
async def get_projects():
    return [{"id": "1", "name": "Demo Project", "description": "Przykładowy projekt"}]

@router.post("/")
async def create_project(project: dict):
    return {"status": "created", "project": project}