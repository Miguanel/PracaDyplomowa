from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
# Importujemy routery
from .routers import projects, simulation, memory

# Importujemy nowy menedżer pamięci (Singleton), żeby Sandbox mógł z niego korzystać
from .services.memory_manager import memory_manager

# --- Jeśli masz stary plik engine/interpreter.py, to import może zostać,
# --- ale pamiętaj, że teraz używamy memory_manager zamiast VirtualRAM.
# from app.engine.interpreter import LogicEngine
# from app.schemas.actions import Instruction

app = FastAPI(
    title="Interaktywny System Wspomagania Edukacji w Zakresie Algorytmów i Struktur Danych Liniowych – Struktur Dynamicznych",
    description="Silnik edukacyjny struktur danych",
    version="2.0"
)

# --- KONFIGURACJA CORS ---
# Lista dozwolonych adresów (dodaj zarówno lokalne środowisko, jak i produkcję)
origins = [
    "http://localhost:5173",            # Lokalne środowisko deweloperskie Vite
    "http://localhost:3000",            # Alternatywne lokalne środowisko
    "https://edualgo-app.onrender.com"  # Twój frontend na Renderze
]
# Dodatkowe adresy z konfiguracji (np. docker-compose: ALLOWED_ORIGINS=http://localhost)
origins += [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],                # Zezwala na wszystkie metody (GET, POST, PUT, DELETE, OPTIONS itp.)
    allow_headers=["*"],                # Zezwala na wszystkie nagłówki
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
    return {"status": "Interaktywny System Wspomagania Edukacji w Zakresie Algorytmów i Struktur Danych Liniowych – Struktur Dynamicznych - Backend został uruchomiony", "version": "2.0"}

@app.get("/api/health")
def health():
    """Lekki endpoint do sprawdzania dostępności backendu (ekran powitalny, proxy nginx)"""
    return {"status": "ok"}

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