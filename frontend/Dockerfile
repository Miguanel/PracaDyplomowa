# ETAP 1: Kompilacja Artefaktów (Builder)
# Vite 7 wymaga Node.js 20.19+ (na node:18 build kończył się błędem)
FROM node:22-alpine AS builder

WORKDIR /app

# Pusty VITE_API_URL = zapytania względne /api/... obsługiwane przez proxy nginx
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Instalacja precyzyjna na podstawie pliku blokady (package-lock.json)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Kopiowanie logiki interfejsu (w tym React Flow i Zustand) i budowanie
COPY frontend/ .
RUN npm run build

# ETAP 2: Serwer Produkcyjny (Nginx)
FROM nginx:alpine

# Ukrycie sygnatury wersji serwera w nagłówkach HTTP (Zabezpieczenie przed skanowaniem podatności)
RUN sed -i 's/server_tokens on;/server_tokens off;/g' /etc/nginx/nginx.conf

# Usunięcie domyślnych zasobów
RUN rm -rf /usr/share/nginx/html/*

# Transfer wygenerowanych artefaktów z etapu budowania
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiowanie autorskiej konfiguracji routingu
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Uruchomienie demona Nginx na pierwszym planie
CMD ["nginx", "-g", "daemon off;"]