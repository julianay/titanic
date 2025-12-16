# Multi-stage build for React + FastAPI deployment
# Stage 1: Build React frontend
FROM node:20-slim AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build React app for production
RUN npm run build

# Stage 2: Python environment with FastAPI
FROM python:3.13.5-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy React build from frontend-builder stage to /app/static
# This matches the path checked in main.py: Path("/app/static")
COPY --from=frontend-builder /frontend/dist /app/static

# Expose port 7860 (Hugging Face Spaces standard)
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:7860/health || exit 1

# Run FastAPI server
# Note: Using 0.0.0.0 to accept connections from outside the container
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
