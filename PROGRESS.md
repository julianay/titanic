# Titanic Explainable AI - Project Progress

**Last Updated:** 2025-12-02

---

## 📋 Project Overview

This is a **UX portfolio demo** showcasing explainable AI techniques for the Titanic survival prediction problem. The focus is on demonstrating design and data visualization skills, not production-level code.

**Live Demo:** https://huggingface.co/spaces/bigpixel/titanic

---

## ✅ Completed Features

### Chat-Based XAI Explorer (`app.py`) **NEW!**
- ✅ Two-column layout (visualization 70%, chat 30%)
- ✅ Natural language query interpretation with keyword matching
- ✅ 4 preset exploration patterns:
  - Women's path (high survival)
  - Men's path (low survival)
  - 1st class child (best odds)
  - 3rd class male (worst odds)
- ✅ Dynamic path highlighting in D3 tree based on chat
- ✅ Scrollable chat history with smart height (grows as needed)
- ✅ Model comparison cards (Decision Tree vs XGBoost)
- ✅ Suggestion buttons that act as quick queries
- ✅ Full-width tree visualization (700px height)
- ✅ No default path on initial load
- ✅ Responsive layout

### Core Application
- ✅ Streamlit multi-page app architecture
- ✅ Docker containerization for Hugging Face Spaces deployment
- ✅ Clean modular codebase with separation of concerns

### Page 1: SHAP Explanations (`src/streamlit_app.py`)
- ✅ RandomForest classifier (100 estimators, max_depth=4)
- ✅ Global SHAP feature importance visualization
- ✅ Local SHAP explanations for individual passengers
- ✅ What-if scenario controls (passenger class, sex, age, fare)
- ✅ Real-time prediction probability display
- ✅ Two-column responsive layout
- ✅ Training data preview

### Page 2: Decision Tree Visualization (`src/pages/decision_tree.py`)
- ✅ Custom D3.js interactive tree (hierarchical layout)
- ✅ Real-time path tracing through decision nodes
- ✅ What-if sidebar controls for passenger characteristics
- ✅ Color-coded nodes:
  - Green gradient for survival probability
  - Blue/red for death probability
  - Size proportional to sample count
- ✅ Animated predictions with pulsing final leaf node
- ✅ Dimmed inactive paths (30% opacity)
- ✅ Edge labels with human-readable values ("female"/"male")
- ✅ Hover tooltips showing:
  - Split rules
  - Sample counts
  - Survival rates
  - Probability distributions
- ✅ Feature importance expander with model feature weights
- ✅ Model metrics dashboard (accuracy, samples, features)
- ✅ Educational expander explaining decision tree mechanics
- ✅ Smooth CSS transitions and animations

### Page 3: Model Comparison - DT vs XGBoost (`src/pages/model_comparison.py`) **NEW!**
- ✅ Side-by-side comparison of Decision Tree vs XGBoost models
- ✅ Performance metrics comparison (accuracy, precision, recall, F1-score)
- ✅ Confusion matrices for both models
- ✅ Delta indicators showing XGBoost performance gains
- ✅ SHAP global feature importance for XGBoost (summary plot)
- ✅ SHAP individual explanations (waterfall plot)
- ✅ What-if scenarios for both models simultaneously
- ✅ Side-by-side prediction comparison
- ✅ Educational content on accuracy-interpretability tradeoff
- ✅ Technical details expander
- ✅ Demonstrates why XGBoost needs SHAP for interpretability

### Data Pipeline (`src/tree_data.py`)
- ✅ Modular, visualization-agnostic tree extraction
- ✅ Categorical encoding/decoding for human-readable output
- ✅ Four optimized features: `sex`, `pclass`, `age`, `fare`
- ✅ Data preprocessing with missing value handling
- ✅ Efficient Streamlit caching (@st.cache_resource)

---

## 🎯 Design Decisions & Optimizations

### Feature Selection (7 → 4 features)
**Removed:** `embarked`, `parch`, `sibsp`

**Rationale:**
- Minimal predictive power (low SHAP values)
- ~50% faster SHAP computation for what-if scenarios
- Cleaner UX with fewer input controls
- Better performance on free-tier hosting
- Trade-off: Only -0.1% accuracy loss

### Visualization: D3.js over Plotly
**Chosen:** Custom D3.js implementation

**Rationale:**
- Greater control for custom interactions and animations
- Demonstrates full-stack visualization skills for portfolio
- Custom implementation vs. off-the-shelf library template
- Fallback Plotly code included (commented) for easy switching

### Visual Design Principles
- **Color Coding:** Green (survival) vs. Blue/Red (death)
- **Opacity Changes:** Inactive paths at 30%, active at 100%
- **Animation:** Pulsing on final nodes for visual attention
- **Responsive Transitions:** Smooth UX with CSS transitions
- **Human-Readable Labels:** Decoded categorical values throughout

---

## 🚀 Recent Changes

### 2025-12-06
- **NEW: Chat-Based XAI Explorer** (`app.py`)
  - Two-column layout: visualization (75%) + chat interface (25%)
  - **Dark mode UI**: Complete dark theme for left column matching Streamlit's native chat interface
    - Dark background (#0e1117) for body and tree SVG
    - Light text colors for readability (#fafafa, #d0d0d0, #a0a0a0)
    - Adjusted node/link colors for dark background visibility
  - Natural language exploration with keyword matching
  - 4 preset patterns: women, men, 1st class child, 3rd class male
  - Dynamic path highlighting based on conversation
  - Scrollable chat history (400px container) with suggestions and input below
  - Tree starts with no default path highlighted
  - Full-width D3 tree visualization (700px height, no clipping)
  - Model comparison cards at the top
  - **Optimized layout**: Reduced main content padding by 50% for maximum visibility
- **Removed** `app_simplified.py` (replaced by app.py)

### 2025-12-04
- **CRITICAL FIX: Added proper train/test split to all pages**
  - Fixed `streamlit_app.py`: Now trains RandomForest on 80% of data, evaluates on 20% test set
  - Fixed `tree_data.py`: Implements train/test split in `get_tree_for_visualization()`
  - Fixed `decision_tree.py`: Displays test accuracy instead of training accuracy
  - Verified `model_comparison.py`: Already correctly implemented with train/test split
  - All models now use stratified 80-20 split with random_state=42
  - All accuracy metrics now reflect **test set performance**, not training performance
  - Added visual indicators showing train/test split sizes

### 2025-12-02
- **Added new Model Comparison page** (`src/pages/model_comparison.py`)
  - Demonstrates accuracy-interpretability tradeoff with DT vs XGBoost
  - Side-by-side performance metrics with delta indicators
  - Confusion matrices for both models
  - SHAP global and local explanations for XGBoost
  - What-if scenarios comparing both models simultaneously
  - Educational content on when to use each model type
- **Updated requirements.txt**
  - Added `xgboost` package for gradient boosting model
- **Updated PROGRESS.md**
  - Documented new page features and capabilities

### 2025-11-27
- Updated README.md with new local development setup
  - Added explicit `python3 -m pip install --upgrade pip` step
  - Standardized use of `python3 -m pip` for consistency
- Created PROGRESS.md to track project state and work history

### Previous Sessions (Context)
- Built Decision Tree visualization page with D3.js
- Implemented real-time path tracing and animations
- Optimized feature set from 7 to 4 features
- Deployed to Hugging Face Spaces with Docker
- Created comprehensive README documentation

---

## 🔄 Current State

### Working Features
- **Chat-based explorer (app.py)** - Primary demo, fully functional
- **Multi-page app** - All 3 pages fully functional (SHAP, Decision Tree, Model Comparison)
- All visualizations rendering correctly
- What-if scenarios working in real-time
- Chat interface with natural language exploration
- Docker deployment healthy on Hugging Face Spaces
- Git repository synced to GitHub and Hugging Face

### Known Issues
- ✅ **RESOLVED** (2025-12-04): All models now use proper train/test split. Previously, models were training on 100% of data, resulting in invalid accuracy metrics.

### Technical Debt
- None currently identified (project is clean for portfolio demo purposes)

---

## 📝 Future Enhancement Ideas

### Potential Features
- [ ] Add SHAP explanations to Decision Tree page (combine both techniques)
- [ ] Side-by-side comparison: Decision Tree vs. RandomForest predictions
- [ ] Model performance metrics page:
  - Confusion matrix
  - ROC curve / AUC
  - Precision-Recall curves
- [ ] Feature importance comparison across models
- [ ] Downloadable prediction reports (PDF/CSV)
- [ ] Additional ML models:
  - Logistic Regression (simple baseline)
  - Gradient Boosting (XGBoost/LightGBM)
  - Neural Network (small MLP)
- [ ] Counterfactual explanations (e.g., "Change age from 30 to 12 to survive")
- [ ] Batch prediction mode (upload CSV of passengers)
- [ ] Data exploration page with EDA visualizations
- [ ] Model training interface (let users adjust hyperparameters)

### UX/Design Enhancements
- [ ] Dark mode toggle
- [ ] Mobile-responsive improvements
- [ ] Animation speed controls
- [ ] Export visualizations as PNG/SVG
- [ ] Guided tour / onboarding for first-time users
- [ ] A/B test different color schemes for accessibility

### Performance Optimizations
- [ ] Lazy loading for D3.js tree (only render visible nodes for very deep trees)
- [ ] SHAP value pre-computation for common scenarios
- [ ] WebAssembly for faster model inference (if switching from sklearn)

---

## 🧱 Tech Stack Summary

| Category | Technologies |
|----------|-------------|
| **Backend** | Python 3.13, scikit-learn, SHAP, pandas, numpy |
| **Frontend** | Streamlit 1.39, D3.js v7, CSS3 animations |
| **Visualization** | matplotlib 3.8.4, seaborn, plotly (fallback) |
| **Deployment** | Docker, Hugging Face Spaces (port 8501) |
| **Version Control** | Git (GitHub + HuggingFace remotes) |
| **Development** | VS Code, Python virtual environment |

---

## 📂 Key Files Reference

| File | Purpose |
|------|---------|
| `app.py` | **NEW** Chat-based XAI Explorer (recommended) |
| `src/streamlit_app.py` | Multi-page: SHAP explanations page |
| `src/tree_data.py` | ML pipeline & tree extraction module |
| `src/pages/decision_tree.py` | Multi-page: D3.js Decision Tree visualization |
| `src/pages/model_comparison.py` | Multi-page: DT vs XGBoost comparison |
| `requirements.txt` | Python dependencies |
| `Dockerfile` | Docker configuration for deployment |
| `README.md` | Project documentation |
| `PROGRESS.md` | This file - work tracking & notes |

---

## 🎓 Learning Resources & References

### Explainable AI
- SHAP documentation: https://shap.readthedocs.io/
- Interpretable ML Book: https://christophm.github.io/interpretable-ml-book/

### D3.js Tree Layouts
- D3 Hierarchy: https://github.com/d3/d3-hierarchy
- Tree Layout Examples: https://observablehq.com/@d3/tree

### Streamlit Multi-Page Apps
- Streamlit docs: https://docs.streamlit.io/develop/concepts/multipage-apps

---

## 💡 Notes for Future Sessions

### Context Recovery
If you lose session context, remember:
1. This is a **portfolio demo**, not production code
2. Two pages: SHAP (RandomForest) + Decision Tree (D3.js)
3. Features reduced to 4 for performance (sex, pclass, age, fare)
4. Custom D3 visualization is the key portfolio showcase
5. Deployed live on HuggingFace Spaces

### Common Commands
```bash
# Activate virtual environment
source venv/bin/activate

# Run chat-based explorer (recommended)
streamlit run app.py

# OR run multi-page version
streamlit run src/streamlit_app.py

# Access app
http://localhost:8501

# Install new dependencies
python3 -m pip install package-name
python3 -m pip freeze > requirements.txt

# Git operations
git status
git add .
git commit -m "message"
git push origin main
git push huggingface main  # Deploy to HF Spaces
```

### Architecture Principles
- Keep data pipeline visualization-agnostic (`tree_data.py`)
- Cache models and data with `@st.cache_resource`
- Use human-readable labels (decode categorical variables)
- Prioritize UX polish (animations, colors, tooltips)
- Document design decisions in README

---

## 🤔 Questions & Decisions Log

### Q: Why not use LIME instead of SHAP?
**A:** SHAP provides global + local explanations in one framework, better for portfolio demo showcasing both perspectives.

### Q: Why Titanic dataset?
**A:** Well-known, small, interpretable features, good for educational demos. Easy for portfolio reviewers to understand context.

### Q: Why Streamlit vs. React/Flask?
**A:** Faster prototyping for data apps, built-in components for ML demos, easier deployment to HF Spaces.

### Q: Why not use sklearn's plot_tree()?
**A:** Custom D3.js shows greater technical depth and design skills for UX portfolio.

---

**End of Progress File**
