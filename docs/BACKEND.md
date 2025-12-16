# Backend Documentation

**FastAPI Backend for Titanic XAI Explorer**

REST API providing model predictions and explanations using Decision Tree and XGBoost models.

---

## Quick Start

```bash
# One-time setup: Install dependencies
cd backend
../venv/bin/pip install -r requirements-fastapi-only.txt

# Start server (every time)
./start_server.sh

# Server runs at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

---

## Project Structure

```
backend/
├── main.py                 # FastAPI app with CORS
├── models/
│   ├── decision_tree.py    # Decision tree model + SHAP
│   └── xgboost_model.py    # XGBoost model + SHAP
├── routes/
│   ├── predict.py          # POST /api/predict
│   └── tree.py             # GET /api/tree
├── start_server.sh         # Server startup script
├── requirements.txt        # All dependencies
└── test_api.py             # API tests
```

---

## API Endpoints

See [API.md](./API.md) for detailed API reference.

**Quick Reference:**
- `GET /health` - Health check
- `POST /api/predict` - Get prediction + survival probability
- `GET /api/tree` - Get decision tree structure for visualization

---

## Models

### Decision Tree
- Simple, interpretable model
- Located in `models/decision_tree.py`
- Features: Sex, Pclass, Age, Fare
- Returns tree structure for visualization

### XGBoost
- Advanced gradient boosting model
- Located in `models/xgboost_model.py`
- Higher accuracy than Decision Tree
- SHAP explanations for predictions

Both models are trained on the Titanic dataset and provide:
- Binary prediction (0 = died, 1 = survived)
- Probability score
- Survival rate percentage

---

## Development

### Running Tests

```bash
cd backend
pytest test_api.py -v
```

### Adding New Endpoints

1. Create route file in `routes/`
2. Define FastAPI router
3. Import in `main.py`
4. Add to `app.include_router()`

Example:
```python
# routes/new_endpoint.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/new", tags=["new"])

@router.get("/")
async def new_endpoint():
    return {"message": "Hello"}
```

```python
# main.py
from routes.new_endpoint import router as new_router
app.include_router(new_router)
```

### Environment Variables

None currently required. Server defaults:
- Host: `0.0.0.0`
- Port: `8000`
- Reload: `True` (development mode)

---

## CORS Configuration

CORS is enabled for all origins to allow frontend access:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production**: Restrict `allow_origins` to specific domains.

---

## Troubleshooting

### Port 8000 already in use

```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in start_server.sh
uvicorn main:app --port 8001
```

### Module not found errors

```bash
# Reinstall dependencies
../venv/bin/pip install -r requirements.txt
```

### Models not loading

Check that you're running from the `backend/` directory:
```bash
pwd  # Should show .../backend
```

---

## Tips & Best Practices

### Cheatsheet

**Start/Stop Server:**
```bash
./start_server.sh          # Start
Ctrl+C                     # Stop
```

**Check if running:**
```bash
curl http://localhost:8000/health
```

**View logs:**
- Server logs appear in terminal
- Watch for errors on startup

**Test endpoints:**
```bash
# Health check
curl http://localhost:8000/health

# Prediction
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"sex": 0, "pclass": 1, "age": 30, "fare": 84}'

# Tree structure
curl http://localhost:8000/api/tree
```

---

## Next Steps

- See [API.md](./API.md) for detailed API documentation
- See [FRONTEND.md](./FRONTEND.md) for frontend integration
- See main [README.md](../README.md) for project overview
