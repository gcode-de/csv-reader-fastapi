export type CsvData = {
  columns: string[];
  rows: string[][];
  totalRows: number;
  invalidRows: number;
  delimiter: string;
  errors: string[];
};

export type ParsedRow = {
  cells: string[];
  isValid: boolean;
  error?: string;
};
