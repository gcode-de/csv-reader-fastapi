from pydantic import BaseModel
from typing import List, Optional

class UploadResponse(BaseModel):
    id: str
    columns: List[str]
    totalRows: int
    invalidRows: int
    delimiter: str
    errors: List[str] = []
    rows: Optional[List[List[str]]] = None

class DataResponse(BaseModel):
    columns: List[str]
    rows: List[List[str]]
    page: int
    pageSize: int
    totalRows: int
    totalPages: int
    hasMore: bool
