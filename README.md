Probeaufgabe Anacision – CSV Viewer

## Struktur

- [packages/frontend](packages/frontend): React + Vite CSV-Viewer mit Upload, Vorschau und Fehlerindikatoren
- [packages/backend](packages/backend): FastAPI (Python) REST-API für CSV-Upload und -Parsing

## Setup & Entwicklung

### Schnellstart mit Docker Compose (empfohlen)

```bash
# Images bauen und beide Services starten
docker compose build
docker compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api/health
```

### Lokale Entwicklung (Frontend + Backend separat)

**Frontend:**

```bash
npm install
npm run dev      # Vite dev-server auf Port 5173
npm run build    # Produktions-Build
npm run lint     # ESLint
npm run preview  # Lokaler Preview
```

**Backend (Python):**

Voraussetzung: Python 3.13+

```bash
# Abhängigkeiten installieren (virtuelle Umgebung)
cd packages/backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# oder
.venv\Scripts\activate     # Windows

# Abhängigkeiten installieren
pip install -r requirements.txt

# Backend starten (Port 3001)
python -m uvicorn app.main:app --host 0.0.0.0 --port 3001 --reload
```

Das Frontend läuft auf Port 5173 und nutzt einen Proxy zu `http://localhost:3001` (konfiguriert in `vite.config.ts`).

## Backend

Das Backend läuft auf Port 3001 und bietet folgende Endpunkte:

- `GET /api/health` – Health check
- `POST /api/upload` – CSV-Upload mit ID-basierter Speicherung (multipart/form-data, Feld: `file`)
- `GET /api/data/:id` – Paginierte, sortierte und gefilterte Daten abrufen

Das Backend läuft als FastAPI-App und kann lokal via `uvicorn` gestartet werden oder als Docker-Container über `docker compose`.

Das Backend parst hochgeladene CSV-Dateien, erkennt den Delimiter automatisch (Semikolon bevorzugt), speichert die Daten in einem In-Memory-Store (TTL 1h) und liefert Metadaten samt Fehlern zu ungültigen Zeilen zurück.

### Technologie

- **Framework**: FastAPI mit Pydantic für Request/Response-Validierung
- **Server**: Uvicorn (ASGI-Server)
- **Speicher**: In-Memory-Store mit 1h TTL (für Produktionsbetrieb auf Persistierung upgraden)
- **CSV-Parsing**: Custom-Parser mit Quote-Handling und Delimiter-Erkennung

### API-Endpunkte im Detail

#### `POST /api/upload`

- Erwartet: multipart/form-data mit Feld `file` (max 10 MB)
- Response (Beispiel):
  ```json
  {
    "id": "uuid-v4",
    "columns": ["Spalte1", "Spalte2"],
    "totalRows": 1000,
    "invalidRows": 5,
    "delimiter": ";",
    "errors": ["Zeile 10: ..."]
  }
  ```
- Daten werden 1 Stunde im Speicher gehalten

#### `GET /api/data/:id`

- Query-Parameter:
  - `page` (Standard: 1)
  - `pageSize` (Standard: 25)
  - `sortBy` (optional: Spaltenname)
  - `sortDirection` (optional: `asc` oder `desc`)
  - `search` (optional: Suchbegriff)
  - `searchColumn` (optional: Spaltenname oder `all`)
- Response (Beispiel):
  ```json
  {
    "rows": [["Wert1", "Wert2"], ...],
    "totalRows": 995
  }
  ```
  `totalRows` enthält die Anzahl der Treffer nach Anwendung von Suche/Filter; ungültige Zeilen bleiben in `invalidRows` aus dem Upload-Response ersichtlich.

## Frontend/API

- Backend: `http://localhost:3001`
- Frontend nutzt `VITE_API_BASE` (Standard: `/api`) für Proxy oder direkten Zugriff
- Upload: `POST /api/upload` (multipart/form-data, Feld `file`)
- Datenabruf: `GET /api/data/:id` (Pagination, Sortierung, Suche/Filter serverseitig)

### Architektur

Nur **Remote-Modus**: Nach dem Upload wird eine ID vergeben, alle Operationen (Pagination, Sortierung, Suche/Filter) laufen serverseitig. Der Client lädt immer nur die aktuelle Seite nach.

### Frontend-Features

- CSV-Upload mit Vorschau (Dateiname, Delimiter, gültige/ungültige Zeilen)
- Serverseitige Pagination, Sortierung und Suche/Filter (mit Debounce im Frontend)
- Suchfeld + Spaltenfilter (werden als Query-Params übergeben)
- Pagination mit konfigurierbarer Seitengröße (10/20/50/100)
- Dark-Mode-Unterstützung
- Fehleranzeige für ungültige Zeilen aus dem Upload
- Upload, Vorschau, Suche/Filter pro Spalte, Sortierung, Pagination

### Fehlerbehandlung

Ungültige Zeilen (falsche Spaltenzahl) werden übersprungen und im `errors`-Array dokumentiert (bis zu 10 Fehler werden zurückgegeben). Das Frontend zeigt diese Hinweise unterhalb der Tabelle an.

## Demo-Daten

- Beispiel: [packages/frontend/public/people.csv](packages/frontend/public/people.csv) (Semikolon-getrennt, enthält absichtlich fehlerhafte Zeilen zum Testen).

## Docker & Deployment

### Docker Compose (Lokal)

Beide Services (Frontend und Backend) werden zusammen gestartet:

```bash
docker compose build      # Baue beide Images
docker compose up -d      # Starte im Hintergrund
docker compose logs -f    # Logs anschauen
docker compose down       # Herunterfahren
```

- **Frontend**: http://localhost:3000 (Nginx mit SPA-Fallback)
- **Backend**: http://localhost:3001 (FastAPI)

### Individual Docker Images

Für separate Deployments:

**Backend:**

```bash
docker build -f Dockerfile . -t csv-viewer-backend:latest
docker run -p 3001:3001 csv-viewer-backend:latest
```

**Frontend:**

```bash
docker build -f packages/frontend/Dockerfile packages/frontend -t csv-viewer-frontend:latest
docker run -p 3000:80 csv-viewer-frontend:latest
```

### CI/CD (GitHub Actions)

Automatische Builds und Pushes zu DockerHub:

- **Branch `dev`**: Build ohne Push (Test-Images in der Cache)
- **Branch `main`**: Build + Push zu `${DOCKERHUB_REPO}:backend-latest`, `backend-${SHA}`, `frontend-latest`, `frontend-${SHA}`

Secrets erforderlich:

- `DOCKER_USER`: DockerHub Benutzername
- `DOCKER_PASSWORD`: DockerHub Access Token
- `DOCKERHUB_REPO`: Ziel-Repository (z. B. `yourname/csv-viewer`)

## Demo-Daten

- Beispiel: [packages/frontend/public/people.csv](packages/frontend/public/people.csv) (Semikolon-getrennt, enthält absichtlich fehlerhafte Zeilen zum Testen).

## Improvement-Ideen (priorisiert)

- (P1) E2E-/API-Smoke-Tests: Upload → Pagination → Suche/Filter (z.B. Playwright/Cypress) plus minimaler Backend-Testlauf.
- (P1) Server-Härtung: Rate-Limiting, konsistente Fehlerpayloads (`{ error, details? }`), Logging (structured), Input-Validation vor Parsing.
- (P1) Persistenz statt In-Memory (Redis oder SQLite) inkl. TTL-Cleanup, um Speicher zu schützen und Daten nicht zu verlieren.
- (P1) Streaming-Parsing großer CSVs (z.B. `csv-parse`/Streams), um RAM zu reduzieren und früh invalidierte Zeilen abzuweisen.
- (P1) Frontend-Resilienz: Skeleton/Spinner bei Pagination, Debounce + AbortController für Such-Requests, klarere Fehler-Badges.
- (P2) Spaltenbreiten konstanter machen, wo sinnvoll
- (P2) Drag & Drop-Ablegebereich für CSV-Dateien im Frontend
- (P2) Design-Optimierungen und bessere Responsiveness
- (P2) Loading-Indikator während Server-Pagination
- (P2) Frontend & Backend: Unit-/Integration-Tests ergänzend zu den Smoke-Tests
