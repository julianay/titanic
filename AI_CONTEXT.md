# AI Assistant Context

> **Purpose:** Comprehensive project documentation and coding conventions for AI assistants (Claude Code, GitHub Copilot, Cursor, etc.)

**Last Updated:** December 21, 2025 (ChatPanel Improvements)
**Live Demo:** https://huggingface.co/spaces/bigpixel/titanic (React + FastAPI)
**Status:** ✅ Production - React frontend with all features deployed

---

## 🚀 Current Stack: React + FastAPI (Production)

**Deployed:** December 16, 2025
**Status:** ✅ Live on Hugging Face Spaces
**Architecture:** React frontend + FastAPI backend (single Docker container)

### Quick Start for New Sessions

```bash
# Development mode (separate servers)
# Terminal 1: Backend
cd backend && ./start_server.sh  # Port 8000

# Terminal 2: Frontend
cd frontend && npm run dev        # Port 5173

# Production mode (together)
cd frontend && npm run build
cd ../backend && uvicorn main:app --host 0.0.0.0 --port 7860
```

---

## 🌐 Git Repositories & Deployment

### Git Remotes (Dual Setup)

This project uses **two git remotes**:

1. **GitHub** (Source of Truth)
   - Remote: `origin`
   - URL: https://github.com/julianay/titanic
   - Purpose: Code hosting, version control, collaboration

2. **Hugging Face Spaces** (Production Deployment)
   - Remote: `huggingface`
   - URL: https://huggingface.co/spaces/bigpixel/titanic
   - Purpose: Live demo, automatic Docker deployment

### Verify Remotes

```bash
git remote -v

# Should show:
# origin        https://github.com/julianay/titanic.git (fetch)
# origin        https://github.com/julianay/titanic.git (push)
# huggingface   https://huggingface.co/spaces/bigpixel/titanic (fetch)
# huggingface   https://huggingface.co/spaces/bigpixel/titanic (push)
```

### Deployment Workflow

**Standard deployment (commit to both):**
```bash
git add -A
git commit -m "Your changes"
git push origin main         # Push to GitHub
git push huggingface main    # Push to HF → triggers auto-rebuild
```

**What happens on Hugging Face:**
1. Detects new commit on `main` branch
2. Runs Docker multi-stage build:
   - Stage 1: Builds React app with Node.js
   - Stage 2: Copies build + runs FastAPI with Python 3.12
3. Deploys to: https://huggingface.co/spaces/bigpixel/titanic
4. Build takes ~2-3 minutes
5. App runs on port 7860

**Important Notes:**
- ⚠️ **Always push to GitHub first** (source of truth)
- ✅ HF Spaces auto-rebuilds on every push to `main`
- ✅ No manual build steps needed on HF
- ✅ Uses `Dockerfile` in root directory

### Adding the HF Remote (if missing)

```bash
git remote add huggingface https://huggingface.co/spaces/bigpixel/titanic
```

---

### Tech Stack

**Frontend**
- **React 18** with Vite 7.3.0
- **Tailwind CSS 3.4.0** (dark theme)
- **D3.js 7.9.0** for interactive visualizations
- **Custom hooks**: usePredict, useFetchTree, usePredictBoth, useSHAPExplanation, useGlobalImportance
- **Features**: Real-time predictions, D3 visualizations, model comparison, chat interface

**Backend**
- **FastAPI 0.104.1** with Uvicorn
- **Python 3.12** (NOT 3.13 - pandas incompatible)
- **scikit-learn** (Decision Tree model)
- **XGBoost + SHAP** (advanced model with explanations)
- **Serves React static files** from `/app/static`

**Deployment**
- **Docker multi-stage build** (Node.js → Python)
- **Hugging Face Spaces** (port 7860)
- **Dual Git remotes**: GitHub + HuggingFace

### File Structure (React + FastAPI)

```
titanic/
├── frontend/                      # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Two-column responsive layout
│   │   │   ├── ControlPanel.jsx   # Passenger inputs + presets
│   │   │   ├── ChatPanel.jsx      # Natural language chat
│   │   │   ├── ModelComparisonView.jsx  # Side-by-side comparison
│   │   │   ├── PredictionCard.jsx # Prediction display
│   │   │   ├── ComparisonSummary.jsx  # Agreement summary
│   │   │   ├── LoadingSkeleton.jsx # Loading states
│   │   │   ├── ErrorBoundary.jsx  # Error handling
│   │   │   └── visualizations/
│   │   │       ├── DecisionTreeViz.jsx  # Vertical D3 tree viz
│   │   │       ├── DecisionTreeVizHorizontal.jsx  # Horizontal D3 tree viz
│   │   │       ├── SHAPWaterfall.jsx # SHAP chart
│   │   │       └── GlobalFeatureImportance.jsx
│   │   ├── hooks/
│   │   │   ├── usePredict.js      # API integration (500ms debounce)
│   │   │   └── useTutorial.js     # Tutorial state management
│   │   ├── utils/
│   │   │   ├── cohortPatterns.js  # NL query parsing
│   │   │   └── visualizationColors.js  # Centralized color system
│   │   ├── App.jsx                # Main component
│   │   └── index.css              # Tailwind + dark theme
│   ├── .env                       # VITE_API_URL (empty for production)
│   ├── package.json
│   └── vite.config.js
├── backend/                       # FastAPI server
│   ├── main.py                    # App + static file serving
│   ├── models/
│   │   ├── decision_tree.py       # Decision tree + SHAP
│   │   └── xgboost_model.py       # XGBoost + SHAP
│   ├── routes/
│   │   ├── predict.py             # POST /api/predict, /api/predict/both
│   │   ├── tree.py                # GET /api/tree
│   │   └── explain.py             # GET /api/explain/*
│   ├── requirements.txt
│   └── start_server.sh
├── Dockerfile                     # Multi-stage: Node → Python
├── .dockerignore                  # Excludes venv, node_modules
└── docs/                          # Documentation
    ├── FRONTEND.md                # React frontend guide
    ├── BACKEND.md                 # FastAPI backend guide
    └── API.md                     # API reference
```

### API Endpoints

**Base URL (Production)**: `https://bigpixel-titanic.hf.space`
**Base URL (Local)**: `http://localhost:7860` (production mode) or `http://localhost:8000` (dev)

```http
GET  /health                       # Health check
POST /api/predict                  # Get prediction + probability
POST /api/predict/both             # Get predictions from both models
GET  /api/tree                     # Get decision tree structure
POST /api/explain/shap             # Get SHAP explanation
GET  /api/explain/global-importance  # Get global feature importance
GET  /docs                         # Interactive API docs (Swagger)
GET  /                             # React frontend (SPA)
```

**Example Request**:
```bash
curl -X POST http://localhost:7860/api/predict \
  -H "Content-Type: application/json" \
  -d '{"sex": 0, "pclass": 1, "age": 30, "fare": 84}'

# Response: {"prediction": 1, "probability": 1.0, "survival_rate": 100.0}
```

### React Components

**Layout.jsx**
- Two-column responsive design (80% left, 20% right)
- Stacks vertically on mobile (<768px)
- Dark theme (#0e1117 background, #fafafa text)

**ControlPanel.jsx**
- Passenger inputs: Sex (radio), Class (radio), Age (slider), Fare (slider)
- **Smart fare suggestions**: Auto-adjust when class changes (1st: £84, 2nd: £20, 3rd: £13)
- **Unusual fare badge**: Shows if fare >30% different from class average
- **4 Quick presets**:
  - 🎭 Women's path: Female, 2nd, age 30, £20 (~92% survival)
  - 👨 Men's path: Male, 3rd, age 30, £13 (~14% survival)
  - 👶 1st class child: Female, 1st, age 5, £84 (~98% survival)
  - ⚓ 3rd class male: Male, 3rd, age 40, £8 (~7% survival)
- **Active state detection**: Highlights currently active preset

**ChatPanel.jsx**
- Natural language query parsing with cohort comparisons
- Educational responses with survival statistics
- Chip-styled suggestion buttons (3 presets + tutorial button)
- Smart visibility: chips stay visible until user types custom message
- Show/hide toggle for chips to maximize chat space
- Scrollable message history with inline tutorial controls

**ModelComparisonView.jsx**
- **Layout**: Side-by-side display with Decision Tree (70%) and XGBoost (30%)
- **XGBoost section**: Stacked vertically (waterfall on top, global importance below)
- Real-time prediction updates
- **Comparison mode**: Dual SHAP waterfall charts stacked vertically for cohort explanations

**D3 Visualizations**
- DecisionTree.jsx - Interactive tree with donut chart nodes
- SHAPWaterfall.jsx - SHAP value waterfall chart (fully responsive with ResizeObserver)
- GlobalFeatureImportance.jsx - Feature importance bar chart

**Custom Hooks**
- **usePredict**: 500ms debouncing, request cancellation, retry logic, caching
- **useFetchTree**: Loads decision tree structure
- **usePredictBoth**: Gets predictions from both models
- **useSHAPExplanation**: Fetches SHAP values
- **useGlobalImportance**: Gets global feature importance

### Deployment Architecture

**Docker Multi-Stage Build**:
1. **Stage 1 (Node.js)**: Build React frontend
   - `npm ci` → `npm run build`
   - Output: `frontend/dist/`
2. **Stage 2 (Python 3.12)**: Setup FastAPI
   - Install Python dependencies
   - Copy backend source
   - Copy React build to `/app/static`
   - Run `uvicorn main:app --host 0.0.0.0 --port 7860`

**FastAPI Static File Serving**:
```python
# In production (Docker): /app/static
# In development: ../frontend/dist
STATIC_DIR = Path("/app/static") if Path("/app/static").exists() else Path(__file__).parent.parent / "frontend" / "dist"

# Mount assets directory
app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"))

# Serve index.html for all non-API routes (SPA routing)
@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    if full_path.startswith(("api/", "docs", "health")):
        return {"error": "Not found"}
    return FileResponse(STATIC_DIR / "index.html")
```

### Development Workflow

**Local Development (Separate Servers)**:
```bash
# Backend (port 8000)
cd backend
./start_server.sh

# Frontend (port 5173)
cd frontend
npm run dev

# Frontend makes API calls to http://localhost:8000
```

**Production Testing (Single Server)**:
```bash
# Build React
cd frontend
npm run build

# Start FastAPI (serves both API + React)
cd ../backend
uvicorn main:app --host 0.0.0.0 --port 7860

# Test at http://localhost:7860
```

*For deployment, see the [Git Repositories & Deployment](#-git-repositories--deployment) section above.*

### Environment Variables

**Frontend (.env)**:
```env
# Leave empty for production (uses window.location.origin)
# Set for development with separate backend
VITE_API_URL=
```

**Backend**: No environment variables required (defaults work for both dev + production)

### Color-Coded Prediction Results

React displays predictions with intuitive colors:
- **Green** (>70%): High survival chance - green background and text
- **Yellow** (40-70%): Medium survival chance - yellow background and text
- **Red** (<40%): Low survival chance - red background and text

### Common Issues & Solutions

**Issue**: Frontend can't connect to backend
- **Dev mode**: Check `VITE_API_URL` is empty or points to `http://localhost:8000`
- **Production mode**: Ensure React build exists and backend is serving from `/app/static`

**Issue**: Docker build fails with pandas errors
- **Solution**: Use Python 3.12 (NOT 3.13) - pandas 2.1.3 incompatible with 3.13

**Issue**: Hugging Face metadata validation error
- **Solution**: Only use allowed colors in README.md frontmatter:
  - Valid: `red, yellow, green, blue, indigo, purple, pink, gray`
  - Invalid: `cyan, orange, etc.`

**Issue**: React build not updating
- **Solution**: Delete `frontend/dist/` and run `npm run build` again

**Issue**: Need to check git remotes or deploy
- **Solution**: See [Git Repositories & Deployment](#-git-repositories--deployment) section for complete workflow

**Issue**: "What if?" controls not updating visualizations
- **Fixed**: December 20, 2025 (Evening)
- **Solution**: Added `setHasQuery(true)` and `setActiveComparison(null)` to `handleChange` in App.jsx
- **Details**: When sliders/radio buttons changed, passenger data updated but visualizations didn't show because `hasQuery` flag wasn't set

---

## 🎯 Completed Features (All Ported from Streamlit)

### ✅ Phase 1-7 Complete
- ✅ D3.js decision tree visualization with donut chart nodes
- ✅ SHAP waterfall charts
- ✅ Global feature importance visualization
- ✅ Model comparison (Decision Tree vs XGBoost)
- ✅ Prediction cards with color coding
- ✅ Comparison summary showing model agreement
- ✅ Loading skeletons and error boundaries
- ✅ Chat interface for natural language exploration
- ✅ Natural language query parsing with cohort patterns
- ✅ Educational responses with survival statistics

### 📋 Optional Future Enhancements
- Interactive tutorial/guidance system
- Accessibility improvements (ARIA labels, keyboard nav)
- Performance optimization
- Additional responsive breakpoints
- Export visualizations as PNG/SVG

---

## 🔑 Data Encodings & Model Details

### Data Encodings
- `sex`: `0` = Female, `1` = Male
- `pclass`: `1`, `2`, `3` (passenger class)
- `age`: `0-80` years
- `fare`: `£0-£100`

### Model Performance
**Decision Tree**
- Accuracy: 81%
- Recall: 60%
- Max depth: 4
- Features: sex, pclass, age, fare

**XGBoost**
- Accuracy: 80%
- Recall: 72%
- N estimators: 100
- Features: sex, pclass, age, fare

---

## 🎨 Design System & Centralized Colors

### Centralized Color System

**All colors are defined in**: `frontend/src/utils/visualizationColors.js`

This single file exports:
- `TREE_COLORS` - Decision tree visualization colors
- `SHAP_COLORS` - SHAP visualization colors (aligned with tree colors)
- `UI_COLORS` - UI card colors (prediction results)
- `TREE_EFFECTS` - Drop shadow effects for different states
- `TREE_OPACITY` - Opacity values for inactive/hover/active states

**Core Color Palette**:
- **Survived/Positive**: `#B8F06E` (light green) - Tree survived class, SHAP positive impact, high probability UI
- **Died/Negative**: `#F09A48` (orange) - Tree died class, SHAP negative impact, low probability UI
- **Tutorial/Highlight**: `#ffd700` (gold) - Tutorial mode, hover effects, shared comparison paths
- **Uncertain**: `#fbbf24` (yellow) - Medium probability UI cards (40-70%)

**Semantic Consistency**:
- Green anywhere = survived/positive/high survival
- Orange anywhere = died/negative/low survival
- Gold anywhere = attention/highlight/tutorial

**Components Using Color System** (7 total):
- Visualizations: `DecisionTreeViz.jsx`, `DecisionTreeVizHorizontal.jsx`, `SHAPWaterfall.jsx`, `GlobalFeatureImportance.jsx`
- UI Cards: `PredictionCard.jsx`, `SinglePredictionCard.jsx`, `ComparisonCard.jsx`

### UI Theme Colors
- **Background**: `#0e1117` (dark mode)
- **Text**: `#fafafa` (light gray)
- **Borders**: `#1f2937` (gray-800)
- **Primary Accent**: `#218FCE` (blue) - Buttons, links, input focus

### Typography
- Base font: 14px
- H1: 24px bold
- H3: 20px medium

### Layout
- **Main layout**: Two columns (80% left / 20% right)
  - Left column (80%): Decision Tree (70%) + XGBoost (30%) side-by-side
  - Right column (20%): Controls + Chat (fixed to viewport)
- **XGBoost visualizations**: Stacked vertically (waterfall on top, global importance below)
- Mobile: Single column, stacked vertically
- Breakpoint: 768px (Tailwind `md:` and `lg:`)

---

## 💡 Development Notes for AI Assistants

### When Adding Features
1. Maintain dark theme (#0e1117) and color system
2. Use Tailwind CSS utilities
3. Follow existing component patterns
4. Test locally before deploying to HF

### When Debugging
1. Check browser console for frontend errors
2. Check FastAPI logs for backend errors
3. Verify React build exists (`frontend/dist/`)
4. Test API directly: `curl http://localhost:8000/api/predict -X POST ...`
5. Check git remotes: `git remote -v`

### Before Deploying
1. Test production build locally (port 7860)
2. Verify API endpoints work
3. Check HF metadata in README.md is valid
4. Commit to GitHub first, then push to HF

---

## 📚 Documentation References

### Navigation

- **📋 DOCUMENTATION_INDEX.md** - **CENTRAL HUB** for navigating all documentation
  - Quick start guides by use case
  - Complete file organization
  - Documentation by scenario ("I want to...")
  - Key concepts and design principles

### For AI Assistants

- **🤖 ASSISTANT_GUIDE.md** - **START HERE** for routine UI changes and simple tasks
  - Step-by-step patterns for common tasks
  - Styling guide with copy-paste examples
  - What to change vs what to avoid
  - Designed for GitHub Copilot, Cursor, and simpler assistants

- **📝 Changelogs** - Recent changes by date
  - CHANGELOG_DEC21_2025.md - Alternative layout, ChatPanel improvements
  - CHANGELOG_DEC20_2025.md - Layout restructuring, tree fixes

### Component Documentation

- **Frontend guide**: `docs/FRONTEND.md`
- **Backend guide**: `docs/BACKEND.md`
- **API reference**: `docs/API.md`

### Feature Documentation

- **COHORT_COMPARISON_FEATURE.md** - Natural language cohort comparisons with dual path visualization
  - Dynamic comparison parsing ("1st class women vs 3rd class men")
  - Side-by-side prediction cards
  - Dual path visualization on decision tree (blue vs orange paths)
  - **Dec 20, 2025 (PM)**: Dual SHAP waterfall charts - side-by-side feature contribution explanations for both cohorts
  - **Dec 20, 2025 (AM)**: Fixed bug where comparison paths persisted when switching to single path queries
  - **Dec 20, 2025 (Evening)**: Fixed "What if?" controls not updating visualizations (App.jsx handleChange)

- **DECISION_TREE_FEATURES.md** - **CONSOLIDATED** decision tree visualization features
  - Variable stroke widths (edge thickness based on passenger counts)
  - Selective path highlighting (tutorial modes)
  - Dual path visualization (comparison mode)
  - Usage examples and technical implementation

- **TUTORIAL_FEATURE.md** - Interactive tutorial system

### Historical

- **Historical progress**: `docs/archive/IMPLEMENTATION_PROGRESS.md`

---

## 📝 Recent Changes

### December 21, 2025
**ChatPanel Improvements**:
- **Fixed**: Suggestion chips no longer disappear when tutorial starts
- **Smart Visibility**: Chips remain visible during tutorial and when clicking suggestions
- **Auto-hide Logic**: Chips only hide after user types and submits their own custom message
- **Show/Hide Toggle**: Added "hide/show" link next to "Try asking:" label
  - Users can collapse chips to maximize chat space
  - Toggle state persists during session
- **Files changed**: `ChatPanel.jsx`, `CHANGELOG_DEC21_2025.md`, `docs/FRONTEND.md`

**Alternative Layout & Multi-page Setup**:
- Added `index-alt.html` with horizontal decision tree (left-to-right orientation)
- Multi-page Vite configuration for side-by-side layout comparison
- Horizontal tree uses `DecisionTreeVizHorizontal.jsx` with scroll wheel zoom disabled
- Files: `AppAlt.jsx`, `ModelComparisonViewAlt.jsx`, `vite.config.js`

**Centralized Color System**:
- All colors moved to `visualizationColors.js` (single source of truth)
- Green (#B8F06E) = survived/positive, Orange (#F09A48) = died/negative
- Gold (#ffd700) = tutorial/highlights
- 7 components now use centralized colors (4 visualizations + 3 UI cards)

### December 20, 2025 (Late Evening)
**Layout Restructuring**:
- Changed main layout from 70/30 to 80/20 split (visualizations get 80%, chat gets 20%)
- Restructured left column to show Decision Tree (70%) and XGBoost (30%) side-by-side
- XGBoost visualizations now stack vertically (waterfall on top, global importance below)
- Updated comparison mode to stack dual waterfalls vertically instead of side-by-side
- Files changed: `Layout.jsx`, `ModelComparisonView.jsx`

---

**Last Updated:** December 21, 2025 (ChatPanel Improvements)
**Status:** Production-ready with all features complete
