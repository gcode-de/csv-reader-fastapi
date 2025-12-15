export type CsvPreview = {
  columns: string[];
  rows: string[][];
  totalRows: number;
  invalidRows: number;
  delimiter: string;
  source: "backend" | "client" | "sample";
  filename?: string;
  errors?: string[];
};

export type UploadResponse = Partial<CsvPreview> & {
  id?: string;
  columns: string[];
  rows?: string[][];
};
