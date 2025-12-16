"""
FastAPI Backend for Titanic XAI Demo
Provides REST API endpoints for model predictions and explanations.
Serves React frontend from static files.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path
import uvicorn

from routes import predict, tree


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    # Startup: Load models
    print("Loading models...")
    from models.decision_tree import get_trained_model
    from models.xgboost_model import load_xgboost_model

    # Models are loaded via module-level cache, just trigger loading
    get_trained_model()
    load_xgboost_model()
    print("Models loaded successfully!")

    yield

    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Titanic XAI API",
    description="Explainable AI API for Titanic survival predictions with Decision Tree and XGBoost models",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS (allow all origins for HF deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Titanic XAI API is running"
    }


# Include routers
app.include_router(predict.router, prefix="/api", tags=["predictions"])
app.include_router(tree.router, prefix="/api", tags=["tree"])


# Determine static files path (production vs development)
# In production (Docker), frontend build is copied to /app/static
# In development, it's at ../frontend/dist
STATIC_DIR = Path("/app/static") if Path("/app/static").exists() else Path(__file__).parent.parent / "frontend" / "dist"

# Mount static files (only if build exists)
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    # Serve index.html for root and all non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        """Serve React app for all non-API routes."""
        # Don't intercept API, docs, or health routes
        if full_path.startswith(("api/", "docs", "redoc", "openapi.json", "health")):
            return {"error": "Not found"}

        # Serve index.html for all other routes (React Router handles routing)
        index_file = STATIC_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "React build not found. Run 'npm run build' in frontend/"}
else:
    # Fallback API info endpoint when React build doesn't exist
    @app.get("/")
    async def root():
        """Root endpoint with API information."""
        return {
            "message": "Titanic XAI API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health",
            "note": "React frontend not built. Run 'cd frontend && npm run build'"
        }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
