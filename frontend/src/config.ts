// Ścieżka: src/config.js
// Adres backendu (FastAPI):
//  - VITE_API_URL ustawione (np. Render)  -> ten adres,
//  - VITE_API_URL="" (pusty, Docker + nginx) -> ścieżki względne /api/... (proxy nginx),
//  - brak zmiennej (npm run dev)          -> lokalny serwer http://localhost:8000.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// Endpoint do sprawdzania, czy backend działa (ekran powitalny)
export const HEALTH_URL = API_URL ? `${API_URL}/` : '/api/health';
