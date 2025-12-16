# AI Assistant Context

> **Purpose:** Comprehensive project documentation and coding conventions for AI assistants (Claude Code, GitHub Copilot, Cursor, etc.)

**Last Updated:** December 15, 2025
**Live Demo:** https://huggingface.co/spaces/bigpixel/titanic

## Quick Reference: Coding Conventions

### Data Encodings
- `sex`: `0` = Female, `1` = Male
- `pclass`: `1`, `2`, `3` (integers)
- Widget tuples: `(label, value)` format - e.g., `("Female", 0)`, `(2, 2)`

### Session State Variables (Streamlit)
- **Core State**: `chat_history`, `current_preset`, `selected_tab`
- **What-If Controls**: `whatif_sex`, `whatif_pclass`, `whatif_age`, `whatif_fare`
- **Pending Updates**: `whatif_updates` (dict or None)
- **Tutorial State**: `tutorial_active`, `tutorial_step`, `has_seen_tutorial`

### Key Functions
```python
# Chat/Response System
update_whatif_and_respond(sex, pclass, age, fare, user_message)  # Unified state updates
parse_passenger_query(text) -> dict | None                        # NL parsing
match_to_cohort(sex, pclass, age, fare) -> (str, dict)           # Cohort matching

# Tutorial System
initialize_tutorial_state()                                       # Setup session state
start_tutorial()                                                  # Begin 3-step walkthrough
advance_tutorial()                                                # Progress to next step
get_tutorial_highlight_mode()                                     # Current highlight state
get_tutorial_highlight_features()                                 # Features to highlight

# Data Pipeline
load_titanic_data()                                               # Load and preprocess
train_decision_tree()                                             # Train sklearn model
sklearn_tree_to_dict()                                            # Convert tree to nested dict
get_tree_for_visualization()                                      # Main entry point (cached)

# Visualizations
get_decision_tree_html(tree_json, preset_values_js, tutorial_highlight_mode)
get_feature_importance_html()                                     # Global importance chart
get_alternative_waterfall_html()                                  # Floating bar waterfall
get_standard_waterfall_html()                                     # Standard waterfall
```

### Type Safety Patterns
```python
# SHAP expected_value (handles binary + multi-class)
base_value = float(np.atleast_1d(explainer.expected_value)[0])
```

### Common Patterns
- **Caching**: Always use `@st.cache_resource` for models
- **State Updates**: Apply `whatif_updates` before widget rendering
- **Type Safety**: Use `np.atleast_1d()[0]` for SHAP values
- **Visualization**: Generate complete HTML pages with embedded CSS/JS
- **Tab Detection**: Check `st.session_state.selected_tab` string content

---

## Project Overview

**Purpose:** UX portfolio demo showcasing explainable AI techniques for Titanic survival prediction. Demonstrates design and data visualization skills through interactive model interpretation, combining technical implementation with user-centered design principles.

### Tech Stack

**Backend**
- **Python 3.13.5** (Docker container)
- **Streamlit 1.39.0** - Web app framework with native tabs
- **scikit-learn** - DecisionTreeClassifier (max_depth=4)
- **XGBoost** - Gradient boosting classifier
- **SHAP** - TreeExplainer for model interpretability
- **pandas/numpy** - Data manipulation
- **seaborn** - Titanic dataset source

**Frontend/Visualization**
- **D3.js v7** - Custom interactive visualizations (decision tree, SHAP charts)
- **Custom HTML/CSS** - Dark mode theme (#0e1117 background)
- **Streamlit Components** - For embedding D3 visualizations

**Deployment**
- **Docker** - Containerized deployment
- **Hugging Face Spaces** - Hosting platform (port 8501)
- **Git** - Dual remotes (GitHub + HuggingFace)

---

## File Structure

```
titanic/
├── app.py                          # Main application (625 lines)
├── src/
│   ├── config.py                   # Configuration constants
│   ├── tree_data.py                # ML pipeline & tree extraction
│   ├── tutorial.py                 # 3-step guided walkthrough system
│   ├── chat/
│   │   ├── cohort_patterns.py      # Priority-based pattern matching
│   │   └── response_generator.py   # NL parsing & response generation
│   └── visualizations/
│       ├── styles.css              # Shared dark mode styles
│       ├── decision_tree_viz.py    # D3.js tree HTML generator (595 lines)
│       └── shap_viz.py             # D3.js SHAP HTML generators (522 lines)
├── requirements.txt
├── Dockerfile
├── .streamlit/config.toml          # Theme configuration (accent color)
└── README.md / PROGRESS.md
```

---

## Core Components

### 1. Main Application (app.py)
- **Layout**: Two-column (75% viz / 25% controls)
- **Tabs**: Radio-style tab selector with performance metrics
  - Tab 1: Decision Tree (81% accuracy, 60% recall)
  - Tab 2: XGBoost with SHAP (80% accuracy, 72% recall)
- **Session State Management**: See Quick Reference above
- **Caching**: `@st.cache_resource` for models and data

### 2. Data Pipeline (tree_data.py)
- **Features**: 4 optimized features (sex, pclass, age, fare)
  - Reduced from 7 for ~50% faster SHAP computation
  - Removed: embarked, parch, sibsp (minimal predictive power)
- **Train/Test Split**: 80-20, stratified
- **Tree Structure**: Converts sklearn tree to nested dict format
- **Label Encoding**: Handles categorical variables (sex)
- **Visualization-Agnostic**: Returns dict structure usable by any viz library

### 3. Visualization System

**Decision Tree (decision_tree_viz.py)**
- **Node Style**: Donut charts (50% center hole)
  - Blue slice: died passengers
  - Green slice: survived passengers
  - Size proportional to sample count (sqrt scale)
- **Edge Widths**: Proportional to passenger flow (1-32px, sqrt scale)
- **Interactions**:
  - Hover: Gold path highlighting from root to node
  - Preset selection: Highlights active decision path
  - Tutorial mode: Step-by-step gold highlighting
- **HTML Generation**: Complete D3.js page with embedded CSS/JS
- **Key Parameters**: tree_json, preset_values_js, tutorial_highlight_mode

**SHAP Visualizations (shap_viz.py)**
- **Three Chart Types**:
  1. Global feature importance (horizontal bar chart, 25% width)
  2. Alternative waterfall (floating bars showing cumulative SHAP, 50% width)
  3. Standard waterfall (full width)
- **Tutorial Support**: Gold highlighting for specified features
- **Color Coding**: Green (positive SHAP), red (negative SHAP)
- **Shared Styles**: Loads from styles.css

### 4. Chat System

**Natural Language Parsing (response_generator.py)**
- **Query Parsing**: Extracts sex, pclass, age from natural language
  - Example: "show me a 40-year-old woman in 1st class"
  - Handles variations: child/elderly, 1st/first class, woman/female
- **Cohort Matching**: Priority-based pattern matching
  - Priority 3: first_class_child (most specific)
  - Priority 2: third_class_male, first_class, third_class
  - Priority 1: women, men (most general)
- **Tab-Aware Responses**: Different messages for Decision Tree vs XGBoost tabs
- **Unified State Update**: Single mechanism (update_whatif_and_respond)

**Cohort Patterns (cohort_patterns.py)**
- **Pattern Structure**: match_criteria, response, xgb_response
- **Historical Context**: Includes survival rates and statistics
- **Example**: Women (74% survival), Men (19% survival)

### 5. Tutorial System (tutorial.py)

**Auto-Start Behavior**
- Triggers on first page load (one-time per session)
- Tracks state: `tutorial_active`, `tutorial_step`, `has_seen_tutorial`

**3-Step Walkthrough**
- **Step 0**: Welcome message (sets passenger to 30yo woman, 1st class)
- **Step 1**: Explains first split (highlights based on tab)
  - Decision Tree: Highlights root split + left edge (sex feature)
  - XGBoost: Highlights sex feature in waterfall chart
- **Step 2**: Explains full path/final prediction
  - Decision Tree: Highlights complete path to prediction
  - XGBoost: Highlights sex + pclass features

**Tab-Aware System**
- `get_current_tab_type()`: Returns 'tree' or 'xgb'
- `get_tutorial_message(step)`: Returns contextual message
- `get_tutorial_highlight_mode()`: Returns 'first_split' / 'full_path' / None
- `get_tutorial_highlight_features()`: Returns list of features to highlight

**Controls**
- Manual progression: "Next" button
- Skip option: "Skip Tutorial" button
- Progress indicator: "Tutorial: Step X of 3"
- Integrates seamlessly above chat interface

### 6. Configuration (config.py)
- **PRESETS**: 4 quick exploration patterns
  - women_path, man_path, first_class_child, third_class_male
- **CLASS_AVG_FARES**: Historical averages (1st: £84, 2nd: £20, 3rd: £13)
- **FARE_RANGES**: Min/max by class for validation

### 7. Styling (styles.css)
- **Dark Mode**: Consistent #0e1117 background
- **Accent Color**: #218FCE (modern blue, not default red)
- **Typography**: 14px base, 24px h1, 20px h3
- **Form Controls**: Custom accent-color for radios, checkboxes, sliders
- **Transitions**: Smooth CSS animations throughout

---

## Architecture Decisions

### Feature Reduction (7 → 4)
**Rationale**: Performance optimization for free-tier deployment
- ~50% faster SHAP computation
- Only -0.1% accuracy loss
- Cleaner UX with fewer controls
- Better for what-if scenarios

### D3.js over Plotly
**Rationale**: Portfolio showcase value
- Greater control for custom interactions
- Demonstrates full-stack visualization skills
- Better for hover path highlighting
- Maintains Plotly fallback code (commented)

### Donut Chart Nodes
**Rationale**: Visual clarity
- Immediate class distribution visualization
- 50% center hole reduces visual weight
- More information density without text labels
- Aligns with common data viz patterns

### Proportional Edge Widths
**Rationale**: Encode passenger flow
- Thickness represents sample size
- sqrt scale prevents extreme differences
- Range: 1-32px
- Maintained during hover highlighting

### Tab-Aware Chat
**Rationale**: Context-specific guidance
- Decision Tree: Path explanations, survival statistics
- XGBoost: SHAP values, typical passenger descriptions
- Smooth switching mid-tutorial

### Unified State Management
**Rationale**: Eliminates double-click bug
- Single update mechanism (whatif_updates)
- Applied before widget rendering
- Consistent behavior across presets and chat

---

## Data Flow

### Initialization Flow
1. Load models and data (cached)
2. Initialize session state
3. Check tutorial state (auto-start if first visit)
4. Apply pending whatif_updates before rendering

### User Interaction Flow

**Preset Button Click**:
1. User clicks preset (e.g., "Women's path")
2. `update_whatif_and_respond()` called
3. Match to cohort pattern
4. Set `whatif_updates` in session state
5. Add messages to chat_history
6. Rerun triggers application of updates
7. Visualizations update with new path

**Chat Query**:
1. User types "show me a 40-year-old woman in 1st class"
2. `parse_passenger_query()` extracts parameters
3. `update_whatif_and_respond()` called
4. Same flow as preset button

**What-If Controls**:
1. User adjusts slider/radio
2. Streamlit widget updates session state
3. Smart fare update if class changed
4. Visualizations update in real-time

**Tutorial Progression**:
1. User clicks "Next" button
2. `advance_tutorial()` increments step
3. New message added to chat
4. Highlight mode updates based on tab
5. Visualizations apply gold highlighting

### Visualization Update Flow
1. Session state changes trigger rerun
2. `current_preset_values` extracted from whatif_* state
3. JSON prepared for D3.js
4. Tutorial highlight mode determined
5. HTML generated with new parameters
6. `components.html()` renders updated visualization

---

## Model Details

### Decision Tree
- **Max Depth**: 4
- **Min Samples Split**: 20
- **Min Samples Leaf**: 10
- **Features**: sex, pclass, age, fare
- **Performance**: 81% accuracy, 60% recall
- **Training**: 80% of data (stratified split)

### XGBoost
- **N Estimators**: 100
- **Max Depth**: 6
- **Learning Rate**: 0.1
- **Features**: sex, pclass, age, fare
- **Performance**: 80% accuracy, 72% recall
- **SHAP**: TreeExplainer with 200-sample computation

---

## Known Constraints & Optimizations

### Performance
- Features reduced to 4 for SHAP speed
- Sample size limited to 200 for SHAP
- Caching used for models and data
- Optimized for free-tier hosting

### UX
- No LLM integration (rule-based NL parsing only)
- Fixed cohort patterns (not truly conversational)
- Tutorial is linear (no branching paths)
- Mobile responsiveness basic

### Technical
- Donut charts not dynamically sized (fixed sqrt scale)
- Edge width scale hardcoded (1-32px range)
- Tab switching doesn't preserve scroll position
- Tutorial requires manual progression

---

## Recent Changes

### Session 14 (Dec 10) - Accent Color Standardization
- Added `.streamlit/config.toml` with #218FCE primary color
- Updated `styles.css` with CSS variable for accent
- Removed manual CSS injection from app.py
- Applied to buttons, radios, sliders, links

### Session 13 (Dec 10) - Tab-Aware Tutorial
- Dual-message system (tree_message vs xgb_message)
- XGBoost waterfall highlighting with gold glow
- Fixed What-If controls not updating on tutorial start
- Added `get_tutorial_highlight_features()` function

### Type Safety Fix (Dec 11)
- Fixed SHAP expected_value extraction
- Pattern: `float(np.atleast_1d(shap_explainer.expected_value)[0])`
- Handles both binary and multi-class cases

---

## Future Enhancement Ideas

### Completed
- ✅ Guided tutorial (Phase 1)
- ✅ Tab-aware messages with highlighting (Phase 1.5)

### Planned
- Tutorial Phase 2: Interactive (click nodes, adjust controls)
- Tutorial Phase 3: Personalized paths (data scientist vs manager)
- LLM-based chat (OpenAI/Anthropic)
- Model performance visualizations (ROC, confusion matrix)
- Downloadable reports (PDF/CSV)
- Batch prediction mode (CSV upload)
- Voice input capability
- Export conversation history

---

## Development Notes

### AI Assistant Context
- This is a **portfolio demo**, not production code
- Focus: UX design and data visualization skills
- Custom D3 visualizations are the key showcase
- Modular architecture with clear separation of concerns
- Human-readable labels throughout (decode categorical values)

### Deployment
```bash
# Local development
streamlit run app.py  # http://localhost:8501

# Deploy to HuggingFace
git push huggingface main
```

---

## Questions for LLM Assistance

When seeking technical advice, consider mentioning:
1. **Context**: Portfolio demo focused on UX/visualization
2. **Current Task**: What you're trying to accomplish
3. **Constraints**: Free-tier hosting, SHAP performance, UX polish priority
4. **Relevant Files**: Which components are involved
5. **State**: Current session state variables affected
6. **Desired Outcome**: UX improvement, performance, or feature addition

**Example**: "I want to add a feature where users can export the current decision path as an image. This would involve the decision_tree_viz.py file and possibly adding a button in app.py. I need to maintain the current dark mode styling and make sure it works with both regular paths and tutorial-highlighted paths."
