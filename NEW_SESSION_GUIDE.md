# Quick Start Guide for New AI Sessions

**Last Updated**: December 16, 2025
**Full Context**: See `AI_CONTEXT.md` for comprehensive documentation

---

## 🎯 What You Need to Know

### Current State
- ✅ **React + FastAPI stack** deployed to Hugging Face (production)
- ✅ **Streamlit app** still exists (local development only)
- ✅ React frontend has basic prediction UI with presets and color-coded results
- 🔲 **Missing features**: SHAP charts, decision tree viz, chat, tutorial (to be ported from Streamlit)

### Live URLs
- **Production**: https://huggingface.co/spaces/bigpixel/titanic
- **GitHub**: https://github.com/julianay/titanic
- **Local dev**: http://localhost:5173 (React) + http://localhost:8000 (FastAPI)

---

## ⚡ Quick Commands

### Start Development Environment
```bash
# Terminal 1: Backend
cd backend
./start_server.sh                    # Runs on port 8000

# Terminal 2: Frontend
cd frontend
npm run dev                          # Runs on port 5173
```

### Test Production Build Locally
```bash
# Build React
cd frontend && npm run build

# Start FastAPI (serves React + API)
cd ../backend
uvicorn main:app --host 0.0.0.0 --port 7860
# Open http://localhost:7860
```

### Deploy to Hugging Face
```bash
git add -A
git commit -m "Your changes"
git push origin main                 # GitHub
git push huggingface main            # HF Spaces (triggers rebuild)
```

### Run Streamlit (Legacy)
```bash
source venv/bin/activate
streamlit run app.py                 # Port 8501
```

---

## 📂 Key Files to Know

### React Frontend
```
frontend/
├── src/
│   ├── App.jsx                     # Main component
│   ├── components/
│   │   ├── Layout.jsx              # Two-column layout
│   │   ├── ControlPanel.jsx        # Inputs + presets
│   │   └── LoadingSpinner.jsx      # Loading indicator
│   ├── hooks/
│   │   └── usePredict.js           # API integration (500ms debounce, caching)
│   └── index.css                   # Tailwind + dark theme
├── .env                            # VITE_API_URL (empty for production)
└── package.json
```

### FastAPI Backend
```
backend/
├── main.py                         # FastAPI app + static file serving
├── models/
│   ├── decision_tree.py            # Decision tree + SHAP
│   └── xgboost_model.py            # XGBoost + SHAP
├── routes/
│   ├── predict.py                  # POST /api/predict
│   └── tree.py                     # GET /api/tree
└── requirements.txt                # Python 3.12 (NOT 3.13!)
```

### Deployment
```
Dockerfile                          # Multi-stage: Node.js → Python 3.12
.dockerignore                       # Excludes venv, node_modules, Streamlit
README.md                           # HF metadata (colorTo must be valid!)
```

### Documentation
```
docs/
├── FRONTEND.md                     # React guide
├── BACKEND.md                      # FastAPI guide
└── API.md                          # API reference

AI_CONTEXT.md                       # Full project context
PROGRESS.md                         # Development history
```

---

## 🔑 Important Facts

### Tech Stack
- **Frontend**: React 18, Vite 7.3.0, Tailwind CSS 3.4.0
- **Backend**: FastAPI 0.104.1, Python **3.12** (pandas incompatible with 3.13!)
- **ML Models**: scikit-learn (Decision Tree), XGBoost, SHAP
- **Deployment**: Docker multi-stage build, Hugging Face Spaces (port 7860)

### API Endpoints
```http
GET  /health                        # Health check
POST /api/predict                   # {"sex": 0, "pclass": 1, "age": 30, "fare": 84}
GET  /api/tree                      # Decision tree structure
GET  /docs                          # Interactive API docs
GET  /                              # React frontend (SPA)
```

### Data Encodings
- `sex`: `0` = Female, `1` = Male
- `pclass`: `1`, `2`, `3` (passenger class)
- `age`: `0-80` years
- `fare`: `£0-£100`

### Preset Passengers
- 🎭 **Women's path**: Female, 2nd, 30yo, £20 → ~92% survival
- 👨 **Men's path**: Male, 3rd, 30yo, £13 → ~14% survival
- 👶 **1st class child**: Female, 1st, 5yo, £84 → ~98% survival
- ⚓ **3rd class male**: Male, 3rd, 40yo, £8 → ~7% survival

---

## 🚨 Common Issues

### Frontend can't connect to backend
**Dev mode**: Set `VITE_API_URL=` in `frontend/.env` (empty uses window.location.origin)
**Production**: Ensure React build exists and FastAPI serves from `/app/static`

### Docker build fails with pandas errors
**Fix**: Dockerfile must use `python:3.12-slim` (NOT 3.13) - pandas 2.1.3 incompatible

### HF metadata validation error
**Fix**: Only use valid colors in README.md frontmatter:
- ✅ Valid: `red, yellow, green, blue, indigo, purple, pink, gray`
- ❌ Invalid: `cyan, orange, etc.`

### React build not updating
**Fix**: Delete `frontend/dist/` and run `npm run build` again

---

## 🎨 Design System

### Colors
- **Background**: `#0e1117` (dark mode)
- **Text**: `#fafafa` (light gray)
- **Accent**: `#218FCE` (blue)
- **Success**: Green (>70% survival)
- **Warning**: Yellow (40-70% survival)
- **Danger**: Red (<40% survival)

### Layout
- **Desktop**: Two columns (75% viz / 25% controls)
- **Mobile**: Single column, stacked vertically
- **Breakpoint**: 768px (Tailwind `md:`)

---

## 📋 Next Steps (Features to Port from Streamlit)

Current React stack has:
- ✅ Basic prediction UI
- ✅ Passenger input controls
- ✅ 4 quick presets
- ✅ Color-coded results
- ✅ Smart fare suggestions

Missing from Streamlit:
- 🔲 SHAP waterfall charts (D3.js visualizations)
- 🔲 Decision tree visualization (donut chart nodes)
- 🔲 Conversational chat (cohort exploration)
- 🔲 Model comparison (XGBoost vs Decision Tree tabs)
- 🔲 Interactive tutorial system

These can be added incrementally - all code exists in Streamlit app (`app.py`, `src/visualizations/`).

---

## 💡 Tips for AI Assistants

**When asked to add features**:
1. Check if it exists in Streamlit first (`app.py`, `src/`)
2. Adapt to React + FastAPI architecture
3. Maintain dark theme (#0e1117) and color system
4. Test locally before deploying to HF
5. Update `AI_CONTEXT.md` when adding major features

**When debugging**:
1. Check browser console for frontend errors
2. Check FastAPI logs for backend errors
3. Verify React build exists (`frontend/dist/`)
4. Test API directly: `curl http://localhost:8000/api/predict -X POST ...`
5. Check git remotes: `git remote -v`

**Before deploying**:
1. Test production build locally (port 7860)
2. Verify API endpoints work
3. Check HF metadata in README.md is valid
4. Commit to GitHub first, then push to HF

---

## 📞 Getting Help

- **Full context**: Read `AI_CONTEXT.md` (420+ lines of detailed documentation)
- **Frontend docs**: `docs/FRONTEND.md`
- **Backend docs**: `docs/BACKEND.md`
- **API reference**: `docs/API.md`
- **Progress history**: `PROGRESS.md`

---

**That's it! You're ready to start a new session.** 🚀
