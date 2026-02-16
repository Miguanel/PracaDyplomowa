from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

# Importujemy routery
from app.routers import projects, simulation, memory

# Importujemy nowy menedżer pamięci (Singleton), żeby Sandbox mógł z niego korzystać
from app.services.memory_manager import memory_manager

# --- Jeśli masz stary plik engine/interpreter.py, to import może zostać,
# --- ale pamiętaj, że teraz używamy memory_manager zamiast VirtualRAM.
# from app.engine.interpreter import LogicEngine
# from app.schemas.actions import Instruction

app = FastAPI(
    title="EduAlgo API",
    description="Silnik edukacyjny struktur danych",
    version="2.0"
)

# --- KONFIGURACJA CORS ---
origins = ["*"] # W produkcji podaj konkretny adres, np. "http://localhost:5173"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REJESTRACJA ROUTERÓW ---
# To tutaj dzieje się magia. Cała logika pamięci jest teraz w pliku routers/memory.py
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulations"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])

# --- MODELE DANYCH (ALGORYTMY) ---
# Te modele służą tylko do zapisu algorytmów w bazie "algorithm_db"
class AlgorithmModel(BaseModel):
    id: str
    title: str
    description: str
    codeLines: List[str] = []
    steps: List[Dict[str, Any]]

# --- BAZA DANYCH (In-Memory) ---
# Przechowuje zapisane przez użytkownika algorytmy
algorithm_db: Dict[str, AlgorithmModel] = {}

# --- ENDPOINTY PODSTAWOWE ---

@app.get("/")
def root():
    return {"status": "EduAlgo Backend is Running", "version": "2.0"}

# --- ENDPOINTY ALGORYTMÓW (CRUD) ---

@app.get("/api/algorithms")
def get_algorithms():
    """Zwraca listę zapisanych algorytmów"""
    return list(algorithm_db.values())

@app.post("/api/algorithms")
def save_algorithm(algo: AlgorithmModel):
    """Zapisuje nowy algorytm"""
    algorithm_db[algo.id] = algo
    return {"status": "saved", "id": algo.id}

# --- ENDPOINTY SANDBOXA (OPCJONALNE) ---
# Uwaga: Frontend w wersji którą zrobiliśmy (AlgorithmBuilder/Player)
# steruje logiką sam (wysyłając proste komendy malloc/write/free).
# Poniższe endpointy są potrzebne tylko jeśli chcesz wykonywać logikę "krok po kroku"
# w całości po stronie Pythona (przez LogicEngine).
# Na razie możemy je uprościć, aby nie powodowały błędów.

@app.post("/api/sandbox/init")
def init_sandbox():
    """
    Inicjalizuje sandbox. W obecnej architekturze Frontend po prostu
    kopiuje stan, ale możemy tu zresetować osobny stan sandboxa w memory_managerze
    jeśli byśmy go zaimplementowali.
    """
    # W najprostszej wersji zwracamy po prostu obecny stan
    return {
        "status": "Sandbox ready",
        "memory_dump": memory_manager.get_state()
    }

# --- UWAGA ---
# Usunąłem bezpośrednie definicje:
# - /api/memory/malloc
# - /api/memory/write
# - /api/memory/reset
# - /api/memory/variable
#
# Dlaczego? Bo teraz są one obsługiwane przez linię:
# app.include_router(memory.router, ...)
#
# To eliminuje konflikt "Split Brain" (podwójnego stanu pamięci).