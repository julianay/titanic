# Titanic Explainable AI - Project Progress

**Last Updated:** 2025-12-11

---

## 📋 Project Overview

This is a **UX portfolio demo** showcasing explainable AI techniques for the Titanic survival prediction problem. The focus is on demonstrating design and data visualization skills, not production-level code.

**Live Demo:** https://huggingface.co/spaces/bigpixel/titanic

---

## ✅ Completed Features

### Interactive XAI Explorer (`app.py`)
- ✅ Two-column layout (visualization 75%, chat 25%)
- ✅ Tab-based interface with performance metrics in labels:
  - **Decision Tree tab**: 81% accuracy, 60% recall
  - **XGBoost tab**: 80% accuracy, 72% recall
- ✅ **Guided Tutorial (Phase 1 MVP + Tab-Aware Enhancement)**:
  - 3-step walkthrough for first-time users
  - Auto-starts on first page load, one-time experience per session
  - Manual "Next" button progression with "Skip Tutorial" option
  - **Tab-aware messages**: Different explanations for Decision Tree vs XGBoost tabs
  - **Decision Tree**: Gold path highlighting (first split → full path)
  - **XGBoost**: Gold feature highlighting in waterfall chart (sex → sex + pclass)
  - Tutorial controls integrate seamlessly with chat interface
  - Preset buttons hidden during tutorial mode
  - What-If controls update immediately to show tutorial passenger
- ✅ Natural language query interpretation with keyword matching
- ✅ 4 preset exploration patterns:
  - Women's path (high survival)
  - Men's path (low survival)
  - 1st class child (best odds)
  - 3rd class male (worst odds)
- ✅ **Decision Tree visualization** (Tab 1):
  - D3.js interactive tree with donut chart nodes
  - Proportional edge widths showing passenger flow (1-32px range)
  - Hover path highlighting with gold color
  - No default path on initial load
  - Real-time updates based on chat conversation and what-if controls
- ✅ **XGBoost SHAP explanations** (Tab 2):
  - Global feature importance (D3.js horizontal bar chart)
  - Dual waterfall charts (standard + alternative floating bar style)
  - Individual explanations for cohort representatives
  - Pre-selected woman's path as default (typical 30-year-old in 2nd class)
  - Dynamic updates based on chat exploration and what-if controls
  - Green/red color coding for positive/negative SHAP values
- ✅ **What-If Scenario controls**:
  - Interactive sliders and radio buttons (Sex, Class, Age, Fare)
  - Inline label layout for compact design
  - Real-time tree path and SHAP value updates
  - Automatically clears when preset buttons are clicked
  - Smart fare updates when class changes (1st: £84, 2nd: £20, 3rd: £13)
  - Contextual hints for unusual fare/class combinations
- ✅ **Tab-aware chat interface**:
  - Context-specific responses based on selected tab
  - Scrollable chat history (300px container)
  - Suggestion buttons that act as quick queries
  - Decision Tree responses: path explanations and survival statistics
  - XGBoost responses: SHAP explanations with typical passenger details
- ✅ Full-width visualizations (700px height)
- ✅ Dark mode UI with cohesive theme (#0e1117 background)
- ✅ Optimized typography (24px title, 20px h3, 14px body)
- ✅ Responsive layout

### Core Application
- ✅ Streamlit single-page application
- ✅ Docker containerization for Hugging Face Spaces deployment
- ✅ Clean modular codebase with separation of concerns
- ✅ Modular visualization package (`src/visualizations/`) with reusable components
- ✅ Modular chat system (`src/chat/`) with NL parsing and cohort matching
- ✅ Configuration module (`src/config.py`) for centralized constants

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

## 🚀 Recent Changes (Last 7 Days)

### 2025-12-11 - Type Safety & AI Assistant Context
- **Type safety fix for SHAP expected_value** (`app.py`):
  - Fixed type checker warnings at lines 322, 431 (base_value extraction)
  - Used `float(np.atleast_1d(shap_explainer.expected_value)[0])` pattern
  - Handles both binary classification (float) and multi-class (array) cases
  - Eliminates all VS Code type warnings without functional changes
- **AI Assistant Context documentation** (NEW):
  - Created `AI_CONTEXT.md` for consistent coding conventions across AI tools
  - Supports Claude Code, GitHub Copilot, and Cursor
  - Documents data encodings, session state patterns, key functions, and architecture
  - Provides type safety patterns and module organization reference

### 2025-12-10 (Session 14 - Styling: Accent Color & Streamlit Theme)
- **Accent color update**: Standardized interactive accents to `#218FCE` across the app.
  - **Streamlit theme**: Added `.streamlit/config.toml` with `primaryColor = "#218FCE"` and dark-theme values so native widgets (radios, sliders, buttons) adopt the blue accent in supported Streamlit versions.
  - **Visualization styles**: Updated `src/visualizations/styles.css` to centralize accent variables and shared dark-mode styling for D3 visualizations.
  - **Removed manual injection**: Deleted previous CSS/JS injection from `app.py` in favor of the supported theme file and scoped CSS in visualizations to avoid fragile DOM hacks.
  - **Result**: Buttons and many native widgets use the configured blue accent; visualizations continue to load shared styles via `get_base_styles()`.
  - **Notes**: If a widget still shows the old color due to browser/Streamlit variations, a hard reload and Streamlit restart will pick up the theme; if issues persist we can add minimal, well-scoped fallbacks.

### 2025-12-10 (Session 13 - Tutorial Enhancement: Tab-Aware Messages & XGBoost Highlighting)
- **TAB-AWARE TUTORIAL SYSTEM** (`src/tutorial.py`, `src/visualizations/shap_viz.py`, `app.py`)
  - **Problem fixed**: Tutorial was showing tree-specific messages on XGBoost tab and not updating What-If controls properly
  - **Dual-message system**: Each tutorial step now has both `tree_message` and `xgb_message`
    - Decision Tree messages explain path splits and survival rates
    - XGBoost messages explain SHAP values and feature contributions
  - **Helper functions**:
    - `get_current_tab_type()` - Detects which tab is selected ('tree' or 'xgb')
    - `get_tutorial_message(step_num)` - Returns appropriate message for current tab
    - `get_tutorial_highlight_features()` - Returns features to highlight in waterfall chart
  - **What-If controls fix**: Tutorial now sets session state values directly
    - Fixed: Controls now update immediately when tutorial starts
    - Previously: Required rerun before charts showed tutorial passenger
    - Now sets both `whatif_updates` AND direct state variables (whatif_sex, whatif_pclass, etc.)
  - **XGBoost waterfall chart highlighting** (NEW):
    - Step 1: Highlights `sex` feature with gold glow
    - Step 2: Highlights `sex` and `pclass` features with gold glow
    - New CSS class: `.bar-tutorial-highlight` with gold stroke and drop-shadow
    - Feature labels also highlighted in gold when tutorial is active
  - **Visualization updates** (`src/visualizations/shap_viz.py`):
    - `get_alternative_waterfall_html()` now accepts `highlight_features` parameter
    - JavaScript applies `bar-tutorial-highlight` class to matching features
    - Y-axis labels get `tutorial-highlight` class for gold text
    - Matches Decision Tree gold color (#ffd700) for consistency
  - **Benefits**:
    - ✅ Tutorial works seamlessly on both tabs
    - ✅ Messages automatically adapt to current tab
    - ✅ Users can switch tabs mid-tutorial and get contextual guidance
    - ✅ Visual highlighting on both tree and SHAP visualizations
    - ✅ What-If controls update immediately on tutorial start
    - ✅ Consistent gold highlighting across all visualizations

### 2025-12-10 (Session 12 - Tutorial Feature: Phase 1 MVP)
- **TUTORIAL SYSTEM IMPLEMENTATION** (`src/tutorial.py`, `app.py`)
  - **New module**: `src/tutorial.py` with complete tutorial state management
    - **Tutorial step definitions**: 3-step guided walkthrough with messages, highlighting modes, and UI controls
    - **Tutorial passenger**: 30-year-old woman in 1st class (sex=0, pclass=1, age=30, fare=£84)
    - **Core functions**: `initialize_tutorial_state()`, `should_auto_start_tutorial()`, `start_tutorial()`, `skip_tutorial()`, `advance_tutorial()`, `get_tutorial_highlight_mode()`, `render_tutorial_controls()`
  - **Tutorial flow (3 steps)**:
    - **Step 0 - Welcome**: Introduces app and sets tutorial passenger values
    - **Step 1 - First Split**: Highlights root node and left edge (female path) with gold color
    - **Step 2 - Final Prediction**: Highlights complete path to leaf node
  - **App integration**: Auto-start on first visit, session state tracking, tutorial controls rendered in right column
  - **Decision tree visualization updates** (`src/visualizations/decision_tree_viz.py`):
    - **New CSS styles**: Gold/yellow tutorial highlighting with glow effect (`.tutorial-highlight` class)
    - **New JavaScript function**: `applyTutorialHighlight()` supports `first_split` and `full_path` modes
    - **Priority logic**: Tutorial highlighting takes precedence over preset highlighting

---

## 📜 Historical Changes Summary (Dec 6-10)

### Sessions 10-11: Code Refactoring - Configuration & Styles Modules
- Created `src/config.py` for centralized constants (PRESETS, CLASS_AVG_FARES, FARE_RANGES)
- Created `src/visualizations/styles.css` for shared dark mode styles
- Added `get_base_styles()` helper function to eliminate ~80 lines of duplicate CSS
- Improved maintainability with single source of truth for styling

### Sessions 8-9: Code Refactoring - Modular Architecture
- Extracted chat system into `src/chat/` package (~244 lines from app.py):
  - `cohort_patterns.py`: 6 cohort patterns with match criteria and responses
  - `response_generator.py`: NL parsing, cohort matching, state updates
- Extracted visualizations into `src/visualizations/` package (~845 lines from app.py):
  - `decision_tree_viz.py`: D3.js decision tree HTML generation
  - `shap_viz.py`: 3 SHAP visualization functions (global, alternative waterfall, standard waterfall)
- **Result**: app.py reduced from ~1,900 to 625 lines (67% reduction)

### Sessions 5-7: What-If Controls & UX Improvements
- Added What-If Scenario controls (Sex, Class, Age, Fare) with inline labels
- Implemented proportional edge widths (1-32px range) showing passenger flow
- Converted to donut chart nodes (50% center hole) for cleaner visuals
- Added smart fare updates when class changes
- Added contextual hints for unusual fare/class combinations
- Fixed widget initialization warnings

### Sessions 1-4: Core Features & Tab Interface
- Built tab-based interface (Decision Tree + XGBoost SHAP)
- Implemented alternative waterfall chart with floating bars
- Added tab-aware chat responses (path explanations vs SHAP explanations)
- Created D3.js visualizations for global importance and waterfall charts
- Fixed tab switching issues with radio buttons instead of st.tabs()
- Added hover path highlighting for decision tree

### Dec 6: Initial Chat-Based Explorer
- Two-column layout with dark mode UI
- Natural language exploration with keyword matching
- 4 preset patterns for common cohorts
- Dynamic path highlighting based on conversation

---

## 🔄 Current State

### Working Features
- **Interactive XAI Explorer (app.py)** - Single comprehensive application, fully functional
- All visualizations rendering correctly
  - Decision Tree with donut chart nodes and proportional edge widths
  - XGBoost with dual waterfall SHAP visualizations
  - Tab-aware guided tutorial with gold highlighting
- What-if scenario controls working in real-time
- Tab-aware chat interface with natural language exploration
- Preset exploration patterns (4 demographic cohorts)
- Docker deployment healthy on Hugging Face Spaces
- Git repository synced to GitHub and Hugging Face

### Known Issues
- ⚠️ **Tab switching issue** (2025-12-07): Decision Tree visualization doesn't display when switching from XGBoost tab back to Decision Tree tab
  - **Workaround**: Click any preset button to display the tree with highlighting
  - **Root cause**: Streamlit's `components.html()` iframe doesn't reliably re-render when tab visibility changes
  - **Impact**: Low - users can still interact with presets to view the tree
  - Tree displays correctly on initial page load and when any preset is clicked
- ✅ **RESOLVED** (2025-12-04): All models now use proper train/test split. Previously, models were training on 100% of data, resulting in invalid accuracy metrics.

### Technical Debt
- Tab switching re-render issue could be resolved by moving to a full React/D3 implementation instead of iframe-based components

---

## 📝 Future Enhancement Ideas

### Potential Features
- [x] ✅ **COMPLETED**: Add SHAP explanations for XGBoost (implemented in Tab 2 of app.py)
- [x] ✅ **COMPLETED (Phase 1)**: Guided tutorial for first-time users with 3-step walkthrough
- [x] ✅ **COMPLETED (Phase 1.5)**: Tab-aware tutorial messages with XGBoost waterfall highlighting
- [ ] **Tutorial Phase 2**: Interactive tutorial with user interactions (click nodes, adjust controls)
- [ ] **Tutorial Phase 3**: Personalized tutorial paths based on user interests (data scientist vs. manager)
- [ ] Upgrade to LLM-based chat (OpenAI/Anthropic) for true conversational AI
- [ ] Add more sophisticated pattern matching for natural language queries
- [ ] Support compound queries ("show me wealthy women")
- [ ] Model performance metrics visualization:
  - Confusion matrix
  - ROC curve / AUC
  - Precision-Recall curves
- [ ] Downloadable prediction reports (PDF/CSV)
- [ ] Counterfactual explanations (e.g., "Change age from 30 to 12 to survive")
- [ ] Batch prediction mode (upload CSV of passengers)
- [ ] Data exploration page with EDA visualizations
- [ ] Voice input capability for chat interface
- [ ] Export conversation history

### UX/Design Enhancements
- [ ] Dark mode toggle
- [ ] Mobile-responsive improvements
- [ ] Animation speed controls
- [ ] Export visualizations as PNG/SVG
- [x] ✅ **COMPLETED (Phase 1)**: Guided tour / onboarding for first-time users
- [x] ✅ **COMPLETED (Phase 1.5)**: Tab-aware tutorial with contextual highlighting
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
| `app.py` | Main application - Interactive XAI Explorer with Decision Tree & XGBoost SHAP (615 lines) |
| `AI_CONTEXT.md` | AI assistant coding conventions and architecture patterns (generic for Copilot/Cursor/Claude) |
| `src/config.py` | Configuration constants (PRESETS, CLASS_AVG_FARES, FARE_RANGES) |
| `src/tree_data.py` | ML pipeline & tree extraction module |
| `src/tutorial.py` | Tutorial system - 3-step guided walkthrough with state management and UI controls |
| `src/chat/cohort_patterns.py` | Cohort matching patterns with priorities and response templates |
| `src/chat/response_generator.py` | Natural language parsing and chat response generation (4 functions) |
| `src/chat/__init__.py` | Chat package initialization |
| `src/visualizations/styles.css` | Shared dark mode CSS styles for all visualizations |
| `src/visualizations/decision_tree_viz.py` | Modular D3.js decision tree HTML generation with tutorial highlighting support |
| `src/visualizations/shap_viz.py` | Modular D3.js SHAP visualization HTML generation (3 functions, get_base_styles()) |
| `src/visualizations/__init__.py` | Visualization package exports |
| `src/__init__.py` | Source package initialization |
| `requirements.txt` | Python dependencies |
| `Dockerfile` | Docker configuration for deployment |
| `.streamlit/config.toml` | Streamlit theme configuration (accent color, dark mode) |
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
2. **Single application** (`app.py`): Interactive XAI Explorer with tabs
   - Tab 1: Decision Tree with D3.js donut chart node visualization
   - Tab 2: XGBoost with SHAP explanations (global + dual waterfall charts)
   - 75/25 two-column layout (visualization left, what-if controls + chat right)
   - Dark mode UI throughout
   - What-If controls for real-time exploration
   - Tab-aware chat with context-specific responses
   - Guided tutorial for first-time users (auto-starts, 3 steps)
3. **Supporting modules**:
   - `src/config.py`: Application configuration constants (presets, fare ranges)
   - `src/tree_data.py`: ML pipeline and tree extraction
   - `src/visualizations/`: Decision tree and SHAP visualization HTML generators (with shared styles.css)
   - `src/chat/`: Cohort patterns and natural language chat response system
   - `src/tutorial.py`: Tutorial state management and controls
4. Features reduced to 4 for performance (sex, pclass, age, fare)
5. Custom D3 visualizations are the key portfolio showcase
6. Deployed live on HuggingFace Spaces

### Common Commands
```bash
# Activate virtual environment
source venv/bin/activate

# Run the application
streamlit run app.py

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
- Modular code organization: separate packages for visualizations, chat logic, configuration, and tutorial
- Centralized configuration: All constants in `src/config.py` for easy maintenance
- Shared styling: Common CSS in `src/visualizations/styles.css` to eliminate duplication
- Cache models and data with `@st.cache_resource`
- Use human-readable labels (decode categorical variables)
- Prioritize UX polish (animations, colors, tooltips)
- Document design decisions in README
- Type safety patterns: Use `np.atleast_1d()[0]` for SHAP expected_value
- AI assistant context: Keep `AI_CONTEXT.md` updated for coding conventions

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
