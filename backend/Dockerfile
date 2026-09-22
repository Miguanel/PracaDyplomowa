# Zastosowanie lekkiej wersji środowiska uruchomieniowego
FROM python:3.10-slim

# Blokada buforowania logów i generowania plików .pyc (Optymalizacja I/O)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Utworzenie izolowanego użytkownika systemowego (Zabezpieczenie typu Least Privilege)
RUN addgroup --system edugroup && adduser --system --group eduuser

# Ustalenie katalogu roboczego
WORKDIR /app

# Optymalizacja warstw cache'owania – instalacja zależności przed kodem aplikacji
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiowanie struktury rdzenia obliczeniowego
COPY backend/ .

# Zmiana właściciela plików na użytkownika nieuprzywilejowanego
RUN chown -R eduuser:edugroup /app

# Przełączenie kontekstu wykonawczego
USER eduuser

# Deklaracja portu nasłuchującego dla serwera ASGI
EXPOSE 8000

# Komenda startowa uruchamiająca serwer Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]