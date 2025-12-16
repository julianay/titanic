"""
FastAPI Backend for Titanic XAI Demo
Provides REST API endpoints for model predictions and explanations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # Alternative React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
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


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Titanic XAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
