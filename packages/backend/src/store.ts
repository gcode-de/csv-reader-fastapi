import type { CsvData } from "./types.js";

type StoredCsv = {
  id: string;
  data: CsvData;
  uploadedAt: Date;
};

class CsvStore {
  private data = new Map<string, StoredCsv>();
  private readonly MAX_AGE_MS = 1000 * 60 * 60; // 1 hour

  generateId(): string {
    return `csv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  store(csvData: CsvData): string {
    const id = this.generateId();
    this.data.set(id, {
      id,
      data: csvData,
      uploadedAt: new Date(),
    });
    this.cleanup();
    return id;
  }

  get(id: string): CsvData | null {
    const entry = this.data.get(id);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.uploadedAt.getTime() > this.MAX_AGE_MS) {
      this.data.delete(id);
      return null;
    }

    return entry.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, entry] of this.data.entries()) {
      if (now - entry.uploadedAt.getTime() > this.MAX_AGE_MS) {
        this.data.delete(id);
      }
    }
  }
}

export const csvStore = new CsvStore();
