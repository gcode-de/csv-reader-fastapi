from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from .csv_utils import parse_csv
from .storage import CsvData, csv_store
from .models import UploadResponse, DataResponse

app = FastAPI()

# CORS (entwicklungsfreundlich; bei Bedarf einschränken)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    from datetime import datetime
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)):
    if not (file.filename.endswith(".csv") or file.content_type == "text/csv"):
        raise HTTPException(status_code=400, detail="Nur CSV-Dateien sind erlaubt.")
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")
    try:
        columns, rows, totalRows, invalidRows, delimiter, errors = parse_csv(text)
        data = CsvData(
            columns=columns,
            rows=rows,
            totalRows=totalRows,
            invalidRows=invalidRows,
            delimiter=delimiter,
            errors=errors,
        )
        id_ = csv_store.store(data)
        # Frontend lädt erste Seite separat; rows optional weglassen
        return UploadResponse(
            id=id_,
            columns=columns,
            totalRows=totalRows,
            invalidRows=invalidRows,
            delimiter=delimiter,
            errors=errors[:10],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/data/{id}", response_model=DataResponse)
async def get_data(
    id: str,
    page: int = 1,
    pageSize: int = 20,
    sortBy: str | None = None,
    sortDirection: str = "asc",
    search: str = "",
    searchColumn: str = "all",
):
    data = csv_store.get(id)
    if data is None:
        raise HTTPException(status_code=404, detail="CSV-Daten nicht gefunden oder abgelaufen.")

    rows: List[List[str]] = data.rows

    # Filter
    term = (search or "").strip().lower()
    if term:
        if searchColumn != "all" and searchColumn in data.columns:
            col_idx = data.columns.index(searchColumn)
            rows = [r for r in rows if (r[col_idx] or "").lower().find(term) != -1]
        else:
            rows = [r for r in rows if any((c or "").lower().find(term) != -1 for c in r)]

    # Sortierung
    if sortBy and sortBy in data.columns:
        col_idx = data.columns.index(sortBy)
        def key_fn(r: List[str]):
            val = r[col_idx] or ""
            try:
                return float(val)
            except ValueError:
                return val
        reverse = sortDirection == "desc"
        rows = sorted(rows, key=key_fn, reverse=reverse)

    # Pagination
    page = max(1, page)
    pageSize = max(1, min(100, pageSize))
    start = (page - 1) * pageSize
    end = start + pageSize
    page_rows = rows[start:end]

    total_rows_filtered = len(rows)
    total_pages = (total_rows_filtered + pageSize - 1) // pageSize
    has_more = end < total_rows_filtered

    return DataResponse(
        columns=data.columns,
        rows=page_rows,
        page=page,
        pageSize=pageSize,
        totalRows=total_rows_filtered,
        totalPages=total_pages,
        hasMore=has_more,
    )
