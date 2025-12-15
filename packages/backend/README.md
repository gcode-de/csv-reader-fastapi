# Backend

Express-basierte REST-API für CSV-Upload und -Parsing.

## Entwicklung

```bash
npm run dev    # Startet tsx watch auf Port 3001
npm run build  # TypeScript kompilieren
npm run start  # Produktionsbuild starten
```

## Endpunkte

### `GET /api/health`

Health check – gibt `{ status: "ok", timestamp: "..." }` zurück.

### `POST /api/upload`

CSV-Upload via multipart/form-data (Feld: `file`).

**Response:**

```json
{
  "columns": ["Name", "Vorname", "Strasse", "Ort", "Alter"],
  "rows": [["Yang", "Paloma", "...", "Bell", "88"], ...],
  "totalRows": 205,
  "invalidRows": 3,
  "delimiter": ";",
  "errors": ["Zeile 14: Erwartete 5 Spalten, gefunden 4", ...]
}
```

## Features

- Automatische Delimiter-Erkennung (Semikolon bevorzugt, Komma als Fallback)
- Quote-Handling für escape-Sequenzen in CSV
- Fehlersammlung für ungültige Zeilen (bis zu 10 werden zurückgegeben)
- CORS aktiviert für Frontend-Integration
- Dateigröße limitiert auf 10 MB
