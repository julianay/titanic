#!/bin/bash
# Start the Titanic XAI FastAPI server

cd "$(dirname "$0")"

echo "Starting Titanic XAI API server..."
echo "API will be available at: http://localhost:8000"
echo "Interactive docs at: http://localhost:8000/docs"
echo ""

# Activate venv and start server
../venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
