#!/bin/sh
set -e

echo "Starting CSV Viewer FastAPI backend on port 3001..."

exec /app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 3001
