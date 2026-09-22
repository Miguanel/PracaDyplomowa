# ETAP 1: Kompilacja Artefaktów (Builder)
FROM node:18-alpine AS builder

WORKDIR /app

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