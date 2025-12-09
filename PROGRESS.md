# Titanic Explainable AI - Project Progress

**Last Updated:** 2025-12-08

---

## 📋 Project Overview

This is a **UX portfolio demo** showcasing explainable AI techniques for the Titanic survival prediction problem. The focus is on demonstrating design and data visualization skills, not production-level code.

**Live Demo:** https://huggingface.co/spaces/bigpixel/titanic

---

## ✅ Completed Features

### Interactive XAI Explorer (`app_pie_version.py`)
- ✅ Two-column layout (visualization 75%, chat 25%)
- ✅ Tab-based interface with performance metrics in labels:
  - **Decision Tree tab**: 81% accuracy, 60% recall
  - **XGBoost tab**: 80% accuracy, 72% recall
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

### 2025-12-08 (Session 7 - What-If UX Improvements)
- **WHAT-IF CONTROLS ENHANCEMENTS** (`app_pie_version.py`)
  - **Fixed widget initialization warning**:
    - Removed explicit `value` parameters from age and fare sliders
    - Eliminated "widget created with default value" warning on app load
    - Widgets now use session state values exclusively (initialized at startup)
  - **Auto-update fare when class changes** (NEW):
    - When user selects a passenger class, fare automatically updates to historical average:
      - 1st class → £84 (average fare)
      - 2nd class → £20 (average fare)
      - 3rd class → £13 (average fare)
    - Implemented using `on_change` callback on passenger class radio button
    - User can still manually adjust fare after auto-update for edge case exploration
    - Provides realistic starting point while maintaining exploration freedom
  - **Contextual hint for unusual fare/class combinations** (NEW):
    - Shows warning when fare is outside typical range for selected class:
      - 1st class typical: £30-500
      - 2nd class typical: £10-30
      - 3rd class typical: £0-15
    - Uses ⚠️ triangle icon with small caption text
    - Example: "⚠️ £100.00 is unusually high for 3rd class (typical: £0-£15)"
    - Non-intrusive educational hint that doesn't prevent exploration
    - Demonstrates attention to historical accuracy while allowing counterfactual scenarios
  - **Design rationale**:
    - Fare and class remain independent controls (reflects model's feature independence)
    - Allows users to test which feature has stronger predictive power
    - Educational value: shows models can reason about correlated features independently
    - Enables counterfactual exploration (e.g., "what if 3rd class passenger paid 1st class prices?")

### 2025-12-08 (Session 6 - Project Cleanup)
- **PROJECT SIMPLIFICATION: Removed unused files**
  - **Context**: User is only using `app_pie_version.py` as the main application
  - **Deleted files**:
    - `app.py` - Alternative gradient node version (no longer needed)
    - `src/streamlit_app.py` - Standalone SHAP what-if demo (not used by main app)
    - `src/pages/decision_tree.py` - Standalone decision tree page (not used by main app)
    - `src/pages/model_comparison.py` - Model comparison page (not used by main app)
    - `src/pages/` directory - Removed entirely (no longer needed)
  - **Remaining files**:
    - `app_pie_version.py` - Main application with tree, XGBoost, and SHAP visualizations
    - `src/tree_data.py` - Supporting data module used by main app
  - **Result**: Streamlined codebase focused on single comprehensive application
  - **Benefits**:
    - Clearer project structure
    - Reduced maintenance burden
    - Eliminates confusion about which file to run
    - All features consolidated in one place
  - **Dockerfile fix**: Removed reference to deleted `app.py` file

### 2025-12-08 (Session 5 - ONGOING - CRITICAL BUG)
- **CRITICAL BUG TO FIX**: Chat preset buttons require double-click after using what-if controls
  - **Problem**: When user adjusts what-if sliders/radio buttons, then clicks a chat preset button, it requires TWO clicks to work
  - **Root cause**: Unclear - tried multiple approaches:
    - Approach 1: Used `on_change` callbacks on widgets → caused double-click issue
    - Approach 2: Removed callbacks, checked values during render and modified state → caused reruns, still double-click
    - Approach 3: Removed `st.rerun()` from button handlers → WORSE - now buttons don't work on first click even without using what-if
    - Approach 4: Restored `st.rerun()` - buttons work on first click normally, but still double-click after using what-if
  - **Current state**: `st.rerun()` restored in button handlers (lines ~1422, ~1457)
  - **Code locations**:
    - Button handlers: Lines ~1394-1422 (preset buttons), ~1427-1457 (chat input)
    - What-if widget creation: Lines ~1322-1379
    - What-if update logic: Lines ~211-217 (applies `whatif_updates` BEFORE columns - IMPORTANT!)
  - **Session state variables involved**:
    - `whatif_sex`, `whatif_pclass`, `whatif_age`, `whatif_fare` - widget values
    - `whatif_updates` - pending updates from button clicks (dict with sex/pclass/age/fare)
    - `current_preset` - tracks which preset was last selected (for label display)
  - **Desired behavior**:
    1. User uses what-if controls → tree updates immediately ✅ WORKS
    2. User clicks chat preset button → updates what-if controls AND tree on FIRST click ❌ REQUIRES 2 CLICKS AFTER USING WHAT-IF
    3. User manually changes what-if after chat → tree updates, label shows "What-If Scenario" ✅ WORKS
  - **Key insight**: Streamlit widgets with `key` parameter auto-store values in session state, but you can't modify that state AFTER widget is created in same run
  - **Recent fix applied**: Moved `whatif_updates` application to BEFORE `st.columns()` (lines 211-217) - this fixed D3 waterfall sync issue
  - **D3 waterfall was one click behind**: XGBoost D3 waterfalls were reading old session state because `whatif_updates` was applied in col2 AFTER col1 rendered. Fixed by applying updates before columns are created.
  - **Next approach to try**: Unknown - may need to rethink the entire what-if/chat integration approach

### 2025-12-08 (Session 5)
- **MAJOR VISUAL ENHANCEMENTS: Proportional Edge Widths & What-If Controls** (`app_pie_version.py`)
  - **Proportional stroke widths for decision tree edges** (NEW):
    - Edge thickness now represents the number of passengers flowing through each split
    - **Scale implementation**: `d3.scaleSqrt()` with domain `[0, maxSamples]` and range `[1, 32]`
    - Square root scale prevents extreme thickness differences while maintaining clear visual hierarchy
    - **Thickest edges**: Root split (sex) with ~571 passengers total
    - **Thinnest edges**: Leaf nodes with small passenger groups (10-50 passengers)
    - **Stroke attributes**: `stroke-linecap: round`, `stroke-opacity: 0.6` for polished appearance
    - **Legend added**: "Edge thickness represents the number of passengers following that path" below tree title
    - **Highlighted paths**: Maintain proportional widths (no fixed override) to show passenger flow even when highlighted
    - Color changes on highlight (green for survival, red for death, gold for hover) but width stays proportional
  - **Donut charts instead of pie charts** (VISUAL CHANGE):
    - Converted filled pie charts to donut style for cleaner, more modern look
    - Changed `innerRadius` from `0` to `radius * 0.5` (50% donut hole)
    - Reduces visual clutter while preserving class distribution information
    - Same color scheme: Blue (#5b8db8) for died, Green (#52b788) for survived
  - **What-If Scenario controls** (NEW FEATURE):
    - Added interactive controls in right column (col2) above chat interface
    - **Control layout**: Inline labels using `st.columns([1, 4])` for compact design
    - **Sex**: Radio buttons (Female/Male) - horizontal layout, label on same line
    - **Passenger Class**: Radio buttons (1/2/3) - horizontal layout, label on same line
    - **Age**: Slider (0-80 years, default 30) - label on same line
    - **Fare**: Slider (£0-£500, default £15, step 0.5) - label on same line
    - All controls use `label_visibility="collapsed"` with markdown labels in left column
  - **What-If functionality** (IMPLEMENTATION):
    - Controls use session state keys: `whatif_sex`, `whatif_pclass`, `whatif_age`, `whatif_fare`
    - Initialized with defaults: Female, 2nd class, age 30, fare £15
    - **Decision Tree**: Path updates in real-time based on what-if values
    - **XGBoost tab**: Both waterfall charts update to show SHAP values for custom passenger
    - Caption shows: "Analyzing: Male, 3rd class, age 43, fare £15.00" (example)
    - Chart title shows "What-If Scenario" instead of preset label
    - **Session state logic**: Reads from `st.session_state.whatif_*` when no preset is active
    - Clicking preset buttons clears what-if and uses preset values instead
  - **UI cleanup**:
    - Removed all custom CSS styling for radio buttons (reverted to Streamlit defaults)
    - Session 4's tab styling removed - tabs now use standard Streamlit radio appearance
    - Removed description text above what-if controls for more compact layout
    - Right column now starts directly with "🔮 What-If Scenario" section
  - **Bug fixes**:
    - Fixed what-if updates not triggering tree path changes
    - Issue: Controls in col2 rendered after col1 tried to read values
    - Solution: Read widget values from session state in col1 (values auto-stored via `key` parameter)
    - Removed unused `highlighted_path` session state variable

### 2025-12-07 (Session 4)
- **MAJOR IMPROVEMENTS: Alternative Waterfall Chart & Tab-Aware Chat** (`app_pie_version.py`)
  - **Alternative waterfall chart visualization** (NEW):
    - Added floating bar waterfall chart alongside traditional horizontal bar chart
    - Shows cumulative SHAP impact progression from base value to final prediction
    - Features on Y-axis (vertical), cumulative SHAP values on X-axis (horizontal)
    - **Floating bars**: Each bar positioned at its cumulative value, not anchored at zero
    - **Connector lines**: Dashed lines (#888, 3px dash) show flow between contributions
    - **Color scheme**: Green (#52b788) for positive, red (#e76f51) for negative, gray (#666) for base
    - **Layout**: Two-column display (1:2 ratio) - Global importance (25%) + Waterfall (50%)
    - Chart dimensions: 650x300px for waterfall, 280x300px for global chart
    - Title displays base value → final prediction (e.g., "Base Value: -0.386 → Final Prediction: -1.012")
  - **Tab tracking with radio buttons** (REPLACED st.tabs):
    - Replaced `st.tabs()` with `st.radio()` to enable tab selection tracking
    - **Fixed disappearing tree bug**: Conditional rendering eliminates iframe re-render issues
    - Custom CSS styles radio buttons to look like tabs (rounded corners, hover effects, active state)
    - Green bottom border (#4CAF50) on selected tab for clear visual feedback
    - Tab options include performance metrics in labels for quick comparison
  - **Tab-aware chat responses**:
    - Chat responses now adapt based on which model tab is selected
    - **Decision Tree tab**: Shows tree path explanations (e.g., "Here's the typical path women took...")
    - **XGBoost tab**: Shows SHAP explanations with typical passenger details (e.g., "I'm using a typical woman passenger: female, 2nd class, age 30, fare £15...")
    - Each preset includes both `response` (tree) and `xgb_response` (SHAP) text
    - Passenger descriptions appear in chart captions (e.g., "Analyzing: Typical woman: Female, 2nd class, age 30, fare £15")
  - **Dynamic chat descriptions**:
    - Chat header description changes based on selected tab
    - Decision Tree: "Explore how the Decision Tree makes transparent, rule-based predictions..."
    - XGBoost: "Explore how XGBoost makes predictions and what drives them using SHAP explanations..."
  - **Typical passenger documentation**:
    - Added `passenger_desc` field to each preset (e.g., "Typical man: Male, 3rd class, age 30, fare £10")
    - Passenger characteristics displayed in waterfall chart captions
    - Clear explanation of which specific passenger is being analyzed for SHAP values
  - **UX improvements**:
    - Alternative waterfall given 2x the space of global chart for better visibility
    - Chart titles synchronized across both waterfall visualizations
    - Standard waterfall chart renamed to "Standard Waterfall Chart" to distinguish from alternative
    - Improved left margin (100px) on alternative waterfall for longer feature labels

### 2025-12-07 (Session 3)
- **NEW EXPERIMENTAL VERSION: Pie Chart Nodes** (`app_pie_version.py`)
  - Created experimental version to test pie chart visualization vs gradient circles
  - **Pie chart implementation**:
    - Each node displays class distribution as a two-slice pie chart
    - Blue slice (#5b8db8): Died passengers (uses `d.data.class_0`)
    - Green slice (#52b788): Survived passengers (uses `d.data.class_1`)
    - Same node sizing: `Math.sqrt(d.data.samples) * 2` radius
    - Replaces gradient-filled circles from original version
  - **Hover path highlighting** (NEW FEATURE):
    - Added `getPathToNode()` function to trace from any node to root
    - Hovering over a node highlights the entire decision path leading to it
    - Gold color scheme (#ffd700) for hover state vs white for preset selection
    - Path highlighting includes nodes, links, labels, and edge labels
    - Temporary highlighting clears on mouseout
  - **Label positioning optimizations**:
    - Node labels: White text (#fafafa) with opacity behavior (40% default, 100% active, 85% hover)
    - Leaf node labels: Positioned on right side of pie charts (`radius + 10px`) with left alignment
    - Internal node labels: Positioned below circles (`radius + 15px`) with center alignment
    - Edge labels: White text with same opacity behavior as node labels
    - Edge labels on hover: Shift up 16px (`translateY(-16px)`) for better readability when highlighted
  - **Layout adjustments**:
    - Increased right margin from 80px to 150px to prevent label clipping
    - Tree drawing area compressed to accommodate right-aligned labels
    - SVG size unchanged (full container width)
  - **Visual indicators**:
    - Orange "PIE CHART VERSION" badge in header
    - Updated subtitle to explain pie chart nodes
    - Page title updated to distinguish from gradient version
  - **Comparison approach**:
    - Original `app.py` remains unchanged with gradient circles
    - Users can run both versions side-by-side for comparison
    - Both versions share same functionality (chat, SHAP tabs, presets)

### 2025-12-07 (Session 2)
- **Bug fixes for tab switching and preset highlighting**:
  - **Fixed**: Decision Tree clears existing SVG before re-rendering to prevent duplicate renders
  - **Fixed**: Preset highlighting now updates immediately when clicking suggestion buttons (restored `st.rerun()` calls)
  - **Fixed**: JavaScript initialization uses retry logic to handle tab visibility issues
  - **Added**: MD5 hash of preset in HTML meta tag to force component re-render when preset changes
  - **Added**: Unique container div ID based on preset hash for better browser cache invalidation
  - **Known issue**: Decision Tree visualization doesn't display when switching from XGBoost tab to Decision Tree tab
    - Workaround: Click any preset button to display the tree with highlighting
    - Tree displays correctly on initial load and when presets are selected
    - Issue is specific to Streamlit's `components.html()` iframe re-rendering behavior
  - **Restored**: `st.rerun()` after preset changes to ensure immediate UI updates

### 2025-12-07 (Session 1)
- **MAJOR UPDATE: Tab-based interface with XGBoost SHAP explanations** (`app.py`)
  - **Replaced model comparison cards with tabs**:
    - Tab 1: Decision Tree (81% accuracy, 60% recall)
    - Tab 2: XGBoost (80% accuracy, 72% recall)
    - Performance metrics integrated into tab labels for quick comparison
  - **XGBoost SHAP visualizations**:
    - **Global feature importance**: D3.js horizontal bar chart showing mean absolute SHAP values
    - **Individual waterfall chart**: D3.js waterfall showing SHAP contribution breakdown for cohort representatives
    - Green (#52b788) bars for positive SHAP values (push toward survival)
    - Red (#e76f51) bars for negative SHAP values (push toward death)
    - Dynamic updates based on chat exploration (linked to preset patterns)
  - **Tab-specific default behavior**:
    - Decision Tree tab: No default path on load (clean slate)
    - XGBoost tab: Pre-selected woman's path as default (typical 30-year-old in 2nd class)
    - Preserves different UX patterns for different model types
  - **Cohort-based SHAP explanations**:
    - Uses representative passenger values for each demographic group
    - More interpretable than averaging SHAP values across entire cohorts
    - Example: "woman's path" = {pclass: 2, sex: 0, age: 30, fare: 20}
  - **Updated copy from Figma design**:
    - New chat column description emphasizing comparison and pattern exploration
    - Clearer labeling of tabs and visualizations
- **UI refinements and fixes**:
  - **Typography updates**:
    - Title (h1): 24px with 0 padding
    - Subtitle (h3): 20px
    - Body text: 14px across all components (chat messages, buttons, markdown)
    - Applied to root elements (`html, body, .stApp`) for consistency
  - **Layout adjustments**:
    - Column ratio changed from 70/30 to 75/25 (visualization gets more space)
    - Reduced main content padding for maximum visibility
    - Chat column description moved to top for better alignment
  - **Critical fix: Chat column clipping issue**:
    - Problem: Description text at top of chat column was being clipped and invisible
    - Root cause: Insufficient padding-top combined with h1 default padding
    - Solution: Increased `.block-container` padding-top to 4rem AND removed h1 padding (0)
    - Tried multiple approaches (sticky positioning, viewport heights, margins) before identifying padding as the issue
  - **Chat history**: Reduced to 300px scrollable container (from 400px)
  - **Dark mode consistency**: All D3 visualizations match dark theme (#0e1117 background)
- **Technical implementation notes**:
  - XGBoost model: 100 estimators, max_depth=6, learning_rate=0.1
  - SHAP TreeExplainer with sample size of 200 for global plots
  - Waterfall chart uses cumulative positioning for stacked bar effect
  - Base value + sum of SHAP values = final prediction
  - All visualizations use `st.markdown()` with HTML/JS for D3 embedding

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
- **Interactive XAI Explorer (app_pie_version.py)** - Single comprehensive application, fully functional
- All visualizations rendering correctly
  - Decision Tree with donut chart nodes and proportional edge widths
  - XGBoost with dual waterfall SHAP visualizations
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
- [x] ✅ **COMPLETED**: Add SHAP explanations for XGBoost (implemented in Tab 2 of app_pie_version.py)
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
| `app_pie_version.py` | Main application - Interactive XAI Explorer with Decision Tree & XGBoost SHAP |
| `src/tree_data.py` | ML pipeline & tree extraction module |
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
2. **Single application** (`app_pie_version.py`): Interactive XAI Explorer with tabs
   - Tab 1: Decision Tree with D3.js donut chart node visualization
   - Tab 2: XGBoost with SHAP explanations (global + dual waterfall charts)
   - 75/25 two-column layout (visualization left, what-if controls + chat right)
   - Dark mode UI throughout
   - What-If controls for real-time exploration
   - Tab-aware chat with context-specific responses
3. **Supporting module** (`src/tree_data.py`): ML pipeline and tree extraction
4. Features reduced to 4 for performance (sex, pclass, age, fare)
5. Custom D3 visualizations are the key portfolio showcase
6. Deployed live on HuggingFace Spaces

### Common Commands
```bash
# Activate virtual environment
source venv/bin/activate

# Run the application
streamlit run app_pie_version.py

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
