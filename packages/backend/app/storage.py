from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional

@dataclass
class CsvData:
    columns: List[str]
    rows: List[List[str]]
    totalRows: int
    invalidRows: int
    delimiter: str
    errors: List[str]

@dataclass
class StoredCsv:
    id: str
    data: CsvData
    uploadedAt: datetime

class CsvStore:
    def __init__(self) -> None:
        self._data: Dict[str, StoredCsv] = {}
        self._max_age = timedelta(hours=1)

    def generate_id(self) -> str:
        from uuid import uuid4
        return f"csv_{uuid4().hex}"

    def store(self, data: CsvData) -> str:
        id_ = self.generate_id()
        self._data[id_] = StoredCsv(id=id_, data=data, uploadedAt=datetime.utcnow())
        self._cleanup()
        return id_

    def get(self, id_: str) -> Optional[CsvData]:
        entry = self._data.get(id_)
        if not entry:
            return None
        if datetime.utcnow() - entry.uploadedAt > self._max_age:
            del self._data[id_]
            return None
        return entry.data

    def _cleanup(self) -> None:
        now = datetime.utcnow()
        expired = [id_ for id_, entry in self._data.items() if now - entry.uploadedAt > self._max_age]
        for id_ in expired:
            del self._data[id_]

csv_store = CsvStore()
