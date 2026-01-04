# Changelog

All notable changes to the Titanic Explainable AI project.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [2026-01-04] - What If Comparison Mode & Smart Editing

### Added
- **Comparison Mode in What If Modal** - Create side-by-side scenario comparisons
  - Click "compare scenarios" link in header to enable comparison mode
  - Two-column layout: Scenario A and Scenario B with independent controls
  - Compare button creates comparison visualization
  - File: frontend/src/components/WhatIfCard.jsx

- **Edit Link in Cohort Header** - Quick access to modify current passenger/comparison
  - Edit link with pencil icon appears next to "Showing: ..." text
  - Opens What If modal pre-populated with current state
  - File: frontend/src/components/ModelComparisonView.jsx

- **Smart Modal Initialization** - Modal detects and displays current context
  - Editing single passenger: Opens in single mode with current values
  - Editing comparison: Opens in comparison mode with both cohorts
  - Preserves all parameter values when editing
  - Files: App.jsx, WhatIfCard.jsx, WhatIfModal.jsx

### Changed
- **Automatic Fare Updates** - Fare now auto-adjusts when changing passenger class
  - 1st class → £84, 2nd class → £20, 3rd class → £13
  - Users can still manually adjust fare if needed
  - Fare suggestion appears if manually set to unusual value
  - File: frontend/src/components/WhatIfCard.jsx

- **Comparison Flow** - Streamlined comparison creation
  - Changed from Compare button to "compare scenarios" text link
  - Link styled in blue and bold for visibility
  - Side-by-side layout makes it clear you're comparing two scenarios
  - Files: WhatIfCard.jsx, App.jsx

---

## [2026-01-04] - What If Modal & UI Cleanup

### Added
- **WhatIfModal Component** - New modal wrapper for What If parameter controls
  - Displays WhatIfCard in a centered overlay with backdrop
  - Closes on backdrop click, X button, or Apply
  - File: frontend/src/components/WhatIfModal.jsx

### Changed
- **What If UI Pattern** - Converted from in-chat card to modal dialog
  - Previously: WhatIfCard appeared as a message in ChatPanel
  - Now: Opens in modal overlay when "What If?" chip clicked
  - Simplified state management in App.jsx (no more chat message updates)
  - Removed whatif message type from ChatPanel rendering

### Removed
- **Hidden UI Elements** - Edge thickness message and zoom controls
  - Added `hidden` class to edge thickness explanation text
  - Added `hidden` class to zoom controls (+, −, Reset buttons)
  - Elements remain in code for easy restoration
  - Files: DecisionTreeViz.jsx:930,935 and DecisionTreeVizHorizontal.jsx:879,884

---

## [2026-01-03] - Codebase Cleanup & UI Refinements

### Changed
- **Removed redundant initial chat message** - Only displays prediction card on initial load, removed duplicate "Showing: ..." text message
- **Consolidated "Alt" files into main files** - Removed AppAlt.jsx, ModelComparisonViewAlt.jsx, and main-alt.jsx
  - Updated index.html to load main.jsx instead of main-alt.jsx
  - Replaced old App.jsx with the active version
  - Standard naming now follows React conventions

### Fixed
- **UI Styling - Centralized Colors**
  - Chat input and Send button now use `UI_COLORS` constants instead of hardcoded Tailwind classes
  - Added onFocus/onBlur handlers for input border color using `UI_COLORS.inputBorderFocus`
  - Send button uses `UI_COLORS.buttonPrimaryBg` with hover handlers
- **Tutorial Buttons** - Replaced hardcoded bg-blue-600/bg-blue-700 with `UI_COLORS.buttonPrimaryBg` and hover handlers
- **Sparkles Icon** - Replaced ✨ emoji with Heroicons SVG for consistent sizing and color control
  - Icon color driven by `UI_COLORS.chatIconColor`
  - Applied to all assistant message types

### Removed
- frontend/src/AppAlt.jsx
- frontend/src/main-alt.jsx
- frontend/src/components/ModelComparisonViewAlt.jsx
- Redundant welcome message on initial chat load

---

## [2026-01-02] - Decision Tree Critical Fixes & UX Enhancements

### Fixed
- **CRITICAL: Donut Charts Not Rendering** (Class Count Calculation Bug)
  - sklearn's tree_.value returns proportions, not counts
  - Fixed by multiplying proportions by samples: `int(value[0] * samples)`
  - Restores all donut chart visualizations across the decision tree
  - File: backend/models/decision_tree.py:117-119

### Added
- **Currency Symbols for Fare Values**
  - Added £ prefix to all fare edge labels
  - Rounded to nearest integer for cleaner display
  - Example: "≤ 28.9" → "≤ £29"
  - File: backend/models/decision_tree.py:172-175

- **Age Units with "yrs" Suffix**
  - Added "yrs" suffix to all age edge labels
  - Rounded to nearest integer for natural age representation
  - Example: "≤ 16.5" → "≤ 16 yrs"
  - File: backend/models/decision_tree.py:176-179

- **Cohort Display Header**
  - Added prominent h3 heading above visualizations showing current cohort
  - Supports both single cohort and comparison mode display
  - Color-coded comparison labels match visualization colors
  - File: frontend/src/components/ModelComparisonView.jsx

- **Chat Message Sectioning**
  - Grouped messages into sections (user request + assistant response)
  - Distinct background styling for newest section vs previous sections
  - Newest: bg-gray-800 bg-opacity-40 (lighter)
  - Previous: bg-gray-900 bg-opacity-20 (darker)
  - File: frontend/src/components/ChatPanel.jsx

### Changed
- **Edge Label Format** - Complete decision tree labels now display as:
  - sex: "female" / "male"
  - pclass: "1st class" / "2nd & 3rd class"
  - fare: "≤ £149" / "> £149"
  - age: "≤ 16 yrs" / "> 16 yrs"

---

## [2025-12-22] - What-If Feature & Tree Label Improvements

### Added
- **What-If Feature - Chat Integration**
  - New WhatIfCard.jsx component - Interactive card that appears in chat with all passenger controls
  - Added "🔮 What If?" suggestion chip to ChatPanel
  - All controls from original accordion: sex, pclass, age, fare
  - Real-time fare suggestions based on passenger class
  - "Apply Changes" button to commit updates
  - Removed ControlPanel accordion from right sidebar

### Fixed
- **Race Condition in Slider Updates**
  - Changed handleWhatIfChange to use chat message as source of truth instead of state
  - Prevents incomplete data from being sent to API
  - Replaced ES2023 findLastIndex() with manual loop for browser compatibility

- **Data Type Parsing**
  - Changed slider value parsing from parseInt to parseFloat
  - Matches backend Pydantic validation expecting floats for age and fare

### Changed
- **Tree Label Improvements**
  - Updated passenger class split labels to be user-friendly
  - "≤ 1.5" → "1st class" vs "2nd & 3rd class"
  - "≤ 2.5" → "1st & 2nd class" vs "3rd class"
  - File: backend/models/decision_tree.py

- **Layout Ratio Adjustments**
  - SHAP Waterfall: 70% width (increased from 50%)
  - Global Feature Importance: 30% width (decreased from 50%)
  - More space for detailed waterfall chart information

---

## [2025-12-21] - Alternative Layout & Centralized Styling

### Added
- **Alternative Layout Implementation**
  - New multi-page setup with index-alt.html
  - DecisionTreeVizHorizontal.jsx - Horizontal (left-to-right) tree orientation
  - ModelComparisonViewAlt.jsx - Vertical stacking layout
  - Decision tree full width at top, XGBoost cards in row below

- **Centralized Color System**
  - Created frontend/src/utils/visualizationColors.js
  - Single source of truth for all colors across 7 components
  - Survived/Positive: #B8F06E (light green)
  - Died/Negative: #F09A48 (orange)
  - Tutorial/Highlight: #ffd700 (gold)

- **SHAP Waterfall Improvements**
  - Redesigned to use vertical bars with horizontal feature labels
  - Removed feature values from axis labels (e.g., "sex=0" → "sex")
  - Rotated labels at -45° to prevent overlap
  - Descriptive chart title with passenger information
  - Smart value label positioning (inside/outside bars based on height)

### Changed
- **Chat Panel Improvements**
  - Suggestion chips now styled as rounded pills
  - Smart visibility: chips stay visible until user types custom message
  - Added show/hide toggle link
  - Removed redundant preset chips

- **Tutorial Improvements**
  - Removed TutorialControls.jsx blue box component
  - Tutorial controls now appear inline in chat messages
  - Next/Skip buttons display directly below tutorial text

- **Tree Path Coloring Rule (CRITICAL)**
  - Tree path colors ALWAYS reflect leaf outcome (survived/died), not cohort or mode
  - Green (#B8F06E) = leads to "Survived" (class 1)
  - Orange (#F09A48) = leads to "Died" (class 0)
  - Applied across all modes: single-path, comparison, tutorial

- **Default Passenger State**
  - Changed from 30-year-old woman to 8-year-old female child in 1st class, £84 fare
  - Differentiates from tutorial (30-year-old) and presets

### Fixed
- **Styling Refactoring**
  - Renamed visualizationColors.js → visualizationStyles.js
  - Added comprehensive styling constants (typography, sizing, spacing)
  - FONTS, FONT_WEIGHTS, TREE_STROKE, TREE_SIZING, SHAP_SIZING constants
  - Replaced all hard-coded "magic numbers" in D3 visualizations

- **Leaf Node Labels**
  - Removed "Survived"/"Died" labels from leaf nodes by default
  - Labels only appear when path is highlighted (tutorial/comparison mode)
  - Label colors match highlight state

- **Global Feature Importance Responsiveness**
  - Removed hardcoded 280px width
  - Dynamically measures container width
  - Window resize support with event listener
  - Chart fits perfectly in both single and comparison modes

---

## [2025-12-20] - Layout Restructuring & Critical Bug Fixes

### Fixed
- **Comparison Detection for "kids vs elderly"**
  - Extended pattern to recognize "kids", "children", "elderly", "seniors"
  - Fixed regex: `/\b(child(ren)?|kids?)\s+(vs\.?|versus|against|and|or)\s+(adults?|elderly|seniors?)\b/i`
  - File: frontend/src/utils/cohortPatterns.js:211-225

- **Tutorial Highlighting on Decision Tree**
  - Decision tree now receives passengerValues when tutorial is active
  - Updated condition: `passengerValues={hasQuery || highlightMode ? passengerData : null}`
  - File: frontend/src/components/ModelComparisonView.jsx:61

- **Sex Feature Missing from SHAP Waterfall**
  - Backend now returns explicit "Base" entry in waterfall data
  - Fixed mislabeling where "sex" was shown as "Base"
  - File: backend/models/xgboost_model.py:138-161

### Added
- **Interactive Zoom and Pan for Decision Tree**
  - Mouse scroll wheel to zoom (30-300% range)
  - Click and drag to pan
  - Control buttons: +, −, Reset
  - Cursor feedback (grab/grabbing)
  - Compatible with tutorial, comparison, and hover effects

### Changed
- **Layout Restructuring**
  - Main layout: 70/30 → 80/20 split (visualizations get 80%)
  - Left column: Decision Tree (70%) + XGBoost (30%) side-by-side
  - XGBoost visualizations stack vertically (waterfall on top, global importance below)
  - Comparison mode: dual waterfalls stack vertically

- **Decision Tree Orientation**
  - Changed from horizontal (left-to-right) to vertical (top-to-bottom)
  - Root node at top, leaf nodes at bottom
  - Changed from d3.linkHorizontal() to d3.linkVertical()
  - Updated margins and coordinate mappings

---

## Earlier Changes (Pre-December 2025)

### Added
- React + FastAPI architecture (deployed December 16, 2025)
- D3.js decision tree visualization with donut chart nodes
- SHAP waterfall charts
- Global feature importance visualization
- Model comparison (Decision Tree vs XGBoost)
- Natural language chat interface
- Cohort comparison feature with dual path visualization
- Tutorial system with progressive highlighting
- Docker multi-stage build for Hugging Face Spaces
- Dual git remotes (GitHub + HuggingFace)

### Core Features
- Prediction cards with color coding
- Comparison summary showing model agreement
- Loading skeletons and error boundaries
- Natural language query parsing with cohort patterns
- Educational responses with survival statistics
- Variable stroke widths for decision tree edges
- Selective path highlighting modes

---

## API Changes

### [2025-12-20] - SHAP Waterfall Response Format
**Breaking Change**: /api/explain/shap response now includes explicit "Base" entry

**Before:**
```json
{
  "waterfall_data": [
    {"feature": "sex", "value": 2.388, ...},
    {"feature": "pclass", "value": 1.660, ...}
  ]
}
```

**After:**
```json
{
  "waterfall_data": [
    {"feature": "Base", "value": 0.0, ...},
    {"feature": "sex", "value": 2.388, ...},
    {"feature": "pclass", "value": 1.660, ...}
  ]
}
```

---

## Documentation

- **AI_CONTEXT.md** - Comprehensive project reference
- **ASSISTANT_GUIDE.md** - Step-by-step task patterns for coding assistants
- **STYLE_CENTRALIZATION.md** - Centralized styling documentation
- **COHORT_COMPARISON_FEATURE.md** - Natural language comparison system
- **docs/API.md** - API endpoint reference
- **docs/BACKEND.md** - FastAPI backend guide
- **frontend/README.md** - React frontend setup

---

## Deployment

**Live Demo:** https://huggingface.co/spaces/bigpixel/titanic

**Git Remotes:**
- GitHub (source): https://github.com/julianay/titanic
- Hugging Face Spaces (production): https://huggingface.co/spaces/bigpixel/titanic

**Deployment Workflow:**
```bash
git push origin main         # Push to GitHub
git push huggingface main    # Deploy to HF → triggers auto-rebuild
```

---

[Unreleased]: https://github.com/julianay/titanic/compare/main...HEAD
[2026-01-03]: https://github.com/julianay/titanic/compare/2026-01-02...2026-01-03
[2026-01-02]: https://github.com/julianay/titanic/compare/2025-12-22...2026-01-02
[2025-12-22]: https://github.com/julianay/titanic/compare/2025-12-21...2025-12-22
[2025-12-21]: https://github.com/julianay/titanic/compare/2025-12-20...2025-12-21
[2025-12-20]: https://github.com/julianay/titanic/releases/tag/2025-12-20
