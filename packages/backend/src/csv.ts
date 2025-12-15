import type { CsvData } from "./types.js";

/**
 * Split a CSV line respecting quoted fields
 */
export function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      const isEscapedQuote = inQuotes && line[i + 1] === '"';
      if (isEscapedQuote) {
        current += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

/**
 * Detect CSV delimiter (prefer semicolon, fallback to comma)
 */
export function detectDelimiter(firstLine: string): string {
  return firstLine.includes(";") ? ";" : ",";
}

/**
 * Parse CSV text into structured data with error tracking
 */
export function parseCsv(text: string): CsvData {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (!lines.length) {
    throw new Error("CSV-Datei ist leer.");
  }

  const delimiter = detectDelimiter(lines[0]);
  const columns = splitCsvLine(lines[0], delimiter);

  if (!columns.length) {
    throw new Error("Konnte Header nicht lesen.");
  }

  const rows: string[][] = [];
  const errors: string[] = [];
  let invalidRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = splitCsvLine(line, delimiter);

    if (cells.length !== columns.length) {
      invalidRows++;
      errors.push(`Zeile ${i + 1}: Erwartete ${columns.length} Spalten, gefunden ${cells.length}`);
      continue;
    }

    rows.push(cells);
  }

  return {
    columns,
    rows,
    totalRows: rows.length + invalidRows,
    invalidRows,
    delimiter,
    errors,
  };
}
