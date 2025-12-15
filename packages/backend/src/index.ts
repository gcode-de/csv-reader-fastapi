import cors from "cors";
import express, { type Request, type Response } from "express";
import multer from "multer";
import { parseCsv } from "./csv.js";
import { csvStore } from "./store.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for memory storage (CSV files are typically small)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Nur CSV-Dateien sind erlaubt."));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// CSV upload endpoint
app.post("/api/upload", upload.single("file"), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Keine Datei hochgeladen." });
      return;
    }

    const csvText = req.file.buffer.toString("utf-8");
    const parsed = parseCsv(csvText);
    const id = csvStore.store(parsed);

    res.json({
      id,
      columns: parsed.columns,
      totalRows: parsed.totalRows,
      invalidRows: parsed.invalidRows,
      delimiter: parsed.delimiter,
      errors: parsed.errors.slice(0, 10),
    });
  } catch (error) {
    console.error("CSV parsing error:", error);
    const message = error instanceof Error ? error.message : "Fehler beim Parsen der CSV.";
    res.status(400).json({ error: message });
  }
});

// Get paginated CSV data
app.get("/api/data/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize as string) || 20));
  const sortBy = (req.query.sortBy as string) || null;
  const sortDirection = (req.query.sortDirection as string) === "desc" ? "desc" : "asc";
  const search = (req.query.search as string) || "";
  const searchColumn = (req.query.searchColumn as string) || "all";

  const data = csvStore.get(id);
  if (!data) {
    res.status(404).json({ error: "CSV-Daten nicht gefunden oder abgelaufen." });
    return;
  }

  let rows = data.rows;

  // Server-side filtering (search)
  if (search.trim()) {
    const searchTerm = search.toLowerCase();
    const columnIndex = searchColumn === "all" ? -1 : data.columns.indexOf(searchColumn);

    rows = rows.filter((row) => {
      if (columnIndex >= 0) {
        const cell = row[columnIndex] ?? "";
        return cell.toLowerCase().includes(searchTerm);
      }
      return row.some((cell) => (cell ?? "").toLowerCase().includes(searchTerm));
    });
  }

  // Server-side sorting
  if (sortBy) {
    const columnIndex = data.columns.indexOf(sortBy);
    if (columnIndex !== -1) {
      rows = [...rows].sort((a, b) => {
        const aValue = a[columnIndex] ?? "";
        const bValue = b[columnIndex] ?? "";

        const aNumber = Number(aValue);
        const bNumber = Number(bValue);
        const bothNumbers = !Number.isNaN(aNumber) && !Number.isNaN(bNumber);

        if (bothNumbers) {
          return sortDirection === "asc" ? aNumber - bNumber : bNumber - aNumber;
        }

        return sortDirection === "asc" ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
      });
    }
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = rows.slice(start, end);

  res.json({
    columns: data.columns,
    rows: pageRows,
    page,
    pageSize,
    totalRows: rows.length,
    totalPages: Math.ceil(rows.length / pageSize),
    hasMore: end < rows.length,
  });
});

// Error handler for multer
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "Datei zu groß (max 10 MB)." });
      return;
    }
  }
  res.status(500).json({ error: err.message || "Interner Serverfehler." });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
  console.log(`📊 CSV Upload: POST http://localhost:${PORT}/api/upload`);
  console.log(`📄 CSV Data: GET http://localhost:${PORT}/api/data/:id?page=1&pageSize=20`);
});
