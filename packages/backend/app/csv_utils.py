from typing import List, Tuple


def split_csv_line(line: str, delimiter: str) -> List[str]:
    cells: List[str] = []
    current = []
    in_quotes = False
    i = 0
    while i < len(line):
        char = line[i]
        if char == '"':
            # Handle escaped quotes inside quoted fields
            is_escaped_quote = in_quotes and i + 1 < len(line) and line[i + 1] == '"'
            if is_escaped_quote:
                current.append('"')
                i += 2
                continue
            in_quotes = not in_quotes
            i += 1
            continue
        if char == delimiter and not in_quotes:
            cells.append(''.join(current).strip())
            current = []
            i += 1
            continue
        current.append(char)
        i += 1
    cells.append(''.join(current).strip())
    return cells


def detect_delimiter(first_line: str) -> str:
    return ';' if ';' in first_line else ','


def parse_csv(text: str) -> Tuple[List[str], List[List[str]], int, int, str, List[str]]:
    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        raise ValueError("CSV-Datei ist leer.")
    delimiter = detect_delimiter(lines[0])
    columns = split_csv_line(lines[0], delimiter)
    if not columns:
        raise ValueError("Konnte Header nicht lesen.")
    rows: List[List[str]] = []
    errors: List[str] = []
    invalid_rows = 0
    for idx, line in enumerate(lines[1:], start=2):
        cells = split_csv_line(line, delimiter)
        if len(cells) != len(columns):
            invalid_rows += 1
            errors.append(f"Zeile {idx}: Erwartete {len(columns)} Spalten, gefunden {len(cells)}")
            continue
        rows.append(cells)
    total_rows = len(rows) + invalid_rows
    return columns, rows, total_rows, invalid_rows, delimiter, errors
