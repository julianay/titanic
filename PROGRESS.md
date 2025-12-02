# Titanic Explainable AI - Project Progress

**Last Updated:** 2025-12-02

---

## 📋 Project Overview

This is a **UX portfolio demo** showcasing explainable AI techniques for the Titanic survival prediction problem. The focus is on demonstrating design and data visualization skills, not production-level code.

**Live Demo:** https://huggingface.co/spaces/bigpixel/titanic

---

## ✅ Completed Features

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
- Both pages fully functional and deployed
- All visualizations rendering correctly
- What-if scenarios working in real-time
- Docker deployment healthy on Hugging Face Spaces
- Git repository synced to GitHub

### Known Issues
- None currently identified

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
| `src/streamlit_app.py` | Main SHAP explanations page |
| `src/tree_data.py` | ML pipeline & tree extraction module |
| `src/pages/decision_tree.py` | D3.js Decision Tree visualization |
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

# Run locally
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
