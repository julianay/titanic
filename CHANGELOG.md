# Changelog

All notable changes to the Titanic Explainable AI project.

---

## December 22, 2025

### What-If Feature - Chat Integration

**Overview:**
Converted the "What If?" accordion from the right sidebar into an interactive card that appears in the chat when triggered by a suggestion chip. This frees up sidebar space and provides a more contextual, conversational experience.

**New Component: WhatIfCard.jsx**
- Interactive card component that appears in chat with all passenger controls
- Compact design optimized for chat display
- All controls from original accordion: sex, pclass, age, fare
- Real-time fare suggestions based on passenger class
- Passenger description preview
- "Apply Changes" button to commit updates

**Updated: ChatPanel.jsx**
- Added "🔮 What If?" suggestion chip
- Rendering for whatif message type
- Props: `onWhatIfStart`, `onWhatIfChange`, `onWhatIfApply`

**Updated: App.jsx & AppAlt.jsx**
- Added `whatIfData` state management
- Handlers: `handleWhatIfStart()`, `handleWhatIfChange()`, `handleWhatIfApply()`
- Fixed race condition by using message data as source of truth
- Removed ControlPanel integration

**Technical Fixes:**
- Fixed race condition in slider updates (using message state instead of component state)
- Changed slider value parsing from `parseInt` to `parseFloat` for backend compatibility
- Replaced ES2023 `findLastIndex()` with manual loop for broader browser support

**User Flow:**
1. User clicks "🔮 What If?" chip
2. WhatIfCard appears in chat with current passenger parameters
3. User adjusts controls (sex, class, age, fare)
4. Changes update in real-time in the card
5. User clicks "Apply Changes"
6. System updates main passenger data
7. New prediction card appears in chat with results
8. Visualizations update to show the new scenario

**Benefits:**
- More chat space (removed accordion from sidebar)
- Contextual exploration within conversation flow
- Cleaner UI (controls only appear when needed)
- Consistent with tutorial and comparison chip patterns

---

### Tree Label Improvements

**Decision Tree Split Labels:**
Updated passenger class (pclass) split labels to be more user-friendly instead of showing technical threshold values.

**Changed in:** `backend/models/decision_tree.py`

**Before:**
- Left branch: "≤ 1.5"
- Right branch: "> 1.5"

**After:**
- Split at 1.5: "1st class" vs "2nd & 3rd class"
- Split at 2.5: "1st & 2nd class" vs "3rd class"

**Implementation:**
```python
elif feature_name == 'pclass':
    # For passenger class, show meaningful class names
    if threshold <= 1.5:
        node_data['left_label'] = '1st class'
        node_data['right_label'] = '2nd & 3rd class'
    elif threshold <= 2.5:
        node_data['left_label'] = '1st & 2nd class'
        node_data['right_label'] = '3rd class'
```

---

### Layout Improvements

**SHAP Waterfall / Global Importance Ratio:**
Adjusted the width distribution in the XGBoost section for better readability.

**Changed in:**
- `frontend/src/components/ModelComparisonView.jsx`
- `frontend/src/components/ModelComparisonViewAlt.jsx`

**Single Mode** (no comparison):
- SHAP Waterfall: 70% width (increased from 50%)
- Global Feature Importance: 30% width (decreased from 50%)
- Layout: Side-by-side

**Comparison Mode** (two waterfalls):
- Two waterfalls: 50/50 split (unchanged)
- Layout: Stacked vertically with Global Importance below

**Rationale:** The waterfall chart contains more detailed information (feature values, impacts) and benefits from more horizontal space, while the global importance is a simpler bar chart.

---

## December 21, 2025

### Alternative Layout Implementation

**Overview:**
Created an alternative page layout to compare side-by-side with the original 80/20 split layout. This allows users to view both layouts simultaneously in different browser tabs/windows.

**Multi-Page Setup:**
- Added `index-alt.html` - Alternative layout entry point
- Added `main-alt.jsx` - Alternative entry point script
- Added `AppAlt.jsx` - Alternative app component
- Updated `vite.config.js` - Multi-page configuration

**Alternative Layout Features:**

**Layout Structure:**
- Decision Tree: Full width at top with horizontal (left-to-right) orientation
- XGBoost Section: Cards displayed in a row below the tree
  - No comparison mode: 2 cards side-by-side (Feature Contributions + Global Importance)
  - Comparison mode: 2 comparison waterfalls side-by-side, Global Importance full-width underneath

**New Components:**
- `ModelComparisonViewAlt.jsx` - Vertical stacking layout
- `DecisionTreeVizHorizontal.jsx` - Horizontal tree orientation with disabled scroll wheel zoom

**Styling Changes:**
- Tree Card: Height 420px (20% taller), reduced bottom padding
- XGBoost Cards: Removed h3 sub-headers, cohort labels moved to main section title

**Accessing Both Layouts:**
- Original Layout: `http://localhost:5176/`
- Alternative Layout: `http://localhost:5176/index-alt.html`

---

### Chat Panel Improvements

**Preset Chips Redesign:**
- Changed "Try asking" suggestion buttons to chip-style (rounded-full pills)
- Removed redundant preset chips (Women's path, Men's path, etc.)
- Added "📚 Start Tutorial" chip for easy testing

**Suggestion Chips Visibility Behavior:**
- Fixed: Chips no longer disappear when tutorial starts
- Smart Hide: Chips remain visible during tutorial and when clicking suggestions
- Chips only disappear after user types and submits their own custom message
- Added show/hide toggle link next to "Try asking" label
- Toggle state persists during session

**Implementation Details:**
- `hasTypedMessage` state: Tracks if user has typed their own message
- `chipsVisible` state: Controls show/hide toggle
- `shouldShowChips = !hasTypedMessage`: Visibility logic

---

### Tutorial Improvements

**Inline Tutorial Controls:**
- Removed `TutorialControls.jsx` blue box component
- Tutorial controls now appear inline in chat messages
- Added tutorial message type with step metadata

**Tutorial Flow:**
- Tutorial messages appear as regular chat messages
- Next/Skip buttons display directly below tutorial message text
- No separate blue box or progress indicator
- Cleaner, more integrated user experience

**Testing Support:**
- Added "📚 Start Tutorial" chip in empty chat state
- Easy to trigger tutorial for testing on platforms like Hugging Face

---

### Centralized Color System

**Overview:**
Refactored all visualization and UI colors into a single centralized configuration file.

**Created:** `frontend/src/utils/visualizationColors.js`
- Single source of truth for all colors
- Comprehensive documentation and quick reference
- Used by 7 components (4 visualizations + 3 UI cards)

**Color Scheme:**
- Survived/Positive: Light Green `#B8F06E`
- Died/Negative: Orange `#F09A48`
- Tutorial/Highlight: Gold `#ffd700`
- Uncertain (UI only): Yellow `#fbbf24`

**Exported Constants:**
- `TREE_COLORS` - Decision tree visualization colors
- `SHAP_COLORS` - SHAP visualization colors (aligned with tree)
- `UI_COLORS` - UI card colors
- `TREE_EFFECTS` - Drop shadow effects
- `TREE_OPACITY` - Opacity values for states

**Key Changes:**
1. Comparison Mode Colors: Changed from blue/coral to green/orange (semantically meaningful)
2. SHAP Color Alignment: Positive/negative bars match survived/died colors
3. UI Card Consistency: All cards use same colors as visualizations

**Benefits:**
- Easy maintenance (change in one place)
- Semantic consistency (green = survived, orange = died)
- Comprehensive documentation

---

### SHAP Waterfall Chart Improvements

**Overview:**
Redesigned the SHAP waterfall chart to use vertical bars with horizontal feature labels.

**Visual Changes:**

**Axis Orientation:**
- Before: Horizontal bars with features on Y-axis
- After: Vertical bars with features on X-axis
- Benefit: Matches standard waterfall chart pattern

**Feature Labels:**
- Removed feature values from axis labels (e.g., "sex=0" → "sex")
- Rotated labels at -45° to prevent overlap
- Specific values shown in chart title instead

**Chart Title:**
- Before: Generic "SHAP Waterfall" title
- After: Descriptive passenger information (e.g., "8-year-old female in 1st class, £84 fare")
- Added `passengerData` prop to component

**Value Label Positioning:**
- Smart positioning based on bar height
- Inside bars when height ≥ 18px (black text)
- Outside bars when height < 18px (colored text, positioned above/below)

**Technical Implementation:**

**Data Normalization:**
- Added normalization step to ensure perfect bar continuity
- Each bar starts exactly where previous bar ended
- Prevents gaps in waterfall flow

**Connector Lines:**
- Flow vertically between bars
- Connect from right edge of one bar to left edge of next

**Layout Changes:**
- Alternative Layout: Waterfall and Global Importance side-by-side in single mode
- Comparison mode: Two waterfalls side-by-side, Global Importance full-width below

---

### Tree Path Coloring Rule

**CRITICAL RULE:** Tree path colors ALWAYS reflect the leaf outcome (survived/died), not cohort or mode.

**Applied across ALL modes:**
- Green paths `#B8F06E` = leads to "Survived" (class 1)
- Orange paths `#F09A48` = leads to "Died" (class 0)

**Modes:**
- Single-path mode: Path colored by prediction outcome
- Comparison mode: Each cohort path colored by its leaf value (not blue/orange cohort colors)
- Tutorial/highlight mode: Highlighted portions colored by outcome (not gold)

**Files changed:**
- `DecisionTreeViz.jsx`: Updated `updateTreeHighlight()` and `updateDualPathHighlight()`
- `DecisionTreeVizHorizontal.jsx`: Same updates for horizontal layout
- `visualizationStyles.js`: Updated comments

**Why:** Provides consistent visual language - users can always identify outcome by path color regardless of mode.

---

### Default State & Initial Chat Display

**Changed default passenger:**
- From: 30-year-old woman
- To: 8-year-old female child in 1st class, £84 fare

**Reason:** Differentiates from tutorial (30-year-old) and presets for better demo

**UI Changes:**
- Removed passenger info banner (was distracting)
- Added initial chat messages showing default passenger with prediction card
- Set `hasQuery` to true by default so visualizations display immediately on load

**Files changed:** `App.jsx`, `AppAlt.jsx`, `ModelComparisonView.jsx`, `ModelComparisonViewAlt.jsx`

---

## December 20, 2025

### Bug Fixes

#### 1. Comparison Detection Not Working for "kids vs elderly" (Late Evening)

**Issue:** Comparison queries using "kids vs elderly" were not being detected.

**Root Cause:** Hardcoded fallback pattern only recognized "child/children" and "adults", not "kids" or "elderly".

**Fix:** Extended pattern to recognize all age-related keywords:
- "kids" or "children" → age 8
- "elderly" or "seniors" → age 65
- "adults" → age 35

**Updated regex:**
```javascript
/\b(child(ren)?|kids?)\s+(vs\.?|versus|against|and|or)\s+(adults?|elderly|seniors?)\b/i
```

**Impact:** All comparison variations now work (kids vs elderly, children vs seniors, etc.)

---

#### 2. Tutorial Highlighting Not Working on Decision Tree

**Issue:** Decision tree was not highlighting the tutorial cohort's path during tutorial steps.

**Root Cause:** `passengerValues` prop was only passed when `hasQuery` was true, but tutorial starts with `hasQuery=false`.

**Fix:** Updated `ModelComparisonView.jsx:61`:
```javascript
passengerValues={hasQuery || highlightMode ? passengerData : null}
```

**Impact:** Tutorial now properly highlights decision tree path in all steps.

---

#### 3. Sex Feature Missing from SHAP Waterfall Chart

**Issue:** The "sex" feature (most important) was not appearing in SHAP waterfall chart.

**Root Cause:** Backend returned feature data without a "Base" entry, causing frontend to mislabel first feature (sex) as "Base".

**Fix:** Added explicit "Base" item to waterfall data in `backend/models/xgboost_model.py:138-161`:
```python
# Add base value as first item
waterfall_data.append({
    "feature": "Base",
    "value": 0.0,
    "start": float(base_value),
    "end": float(base_value),
    "feature_value": ""
})

# Sort features by absolute SHAP value (keep Base at index 0)
base_item = waterfall_data[0]
feature_items = waterfall_data[1:]
feature_items_sorted = sorted(feature_items, key=lambda x: abs(x['value']), reverse=True)
waterfall_data_sorted = [base_item] + feature_items_sorted
```

**Impact:** SHAP waterfall now correctly displays all features in order of contribution.

---

### New Features

#### 4. Layout Restructuring for Better Space Utilization (Late Evening)

**Main Layout** (`Layout.jsx`):
- Changed column split from 70/30 to 80/20
- Visualizations: 80% (was 70%)
- Chat/controls: 20% (was 30%)

**Visualization Layout** (`ModelComparisonView.jsx`):
- Left column split into two sections side-by-side:
  - Decision Tree: 70% (left)
  - XGBoost Section: 30% (right)
- XGBoost visualizations stacked vertically:
  - SHAP waterfall chart (top)
  - Global feature importance (bottom)

**Comparison Mode:**
- Dual SHAP waterfalls stack vertically instead of side-by-side
- Fits better in narrower 30% column

**Impact:** More screen space for complex visualizations while maintaining all functionality.

---

#### 5. Interactive Zoom and Pan for Decision Tree

**Mouse Interaction:**
- Scroll wheel to zoom in/out (centered on cursor position)
- Click and drag to pan
- Cursor feedback (grab/grabbing)

**Control Buttons:**
- **+** button: Zoom in by 30%
- **−** button: Zoom out by ~23%
- **Reset** button: Return to default view

**Zoom Limits:**
- Minimum: 30% (0.3x scale)
- Maximum: 300% (3x scale)

**Implementation:**
- D3.js zoom behavior with `d3.zoom()`
- Separate zoom group to preserve margin transforms
- Three zoom control functions

**Compatibility:**
- Works with tutorial highlighting
- Works with comparison mode
- Preserves hover effects and tooltips
- Maintains variable stroke widths

---

### Feature Changes

#### 6. Decision Tree Orientation Changed from Horizontal to Vertical

**Change:** Converted decision tree from left-to-right to top-to-bottom orientation.

**Motivation:** Vertical tree layouts are more conventional and easier to read.

**Implementation:**
1. Changed margins to accommodate vertical layout
2. Swapped width/height dimensions
3. Changed from `d3.linkHorizontal()` to `d3.linkVertical()`
4. Swapped x/y coordinate mappings
5. Repositioned edge labels (left/right of branches)
6. Repositioned node labels (internal above, leaves below)

**Impact:**
- Tree flows top to bottom
- Root node at top
- Leaf nodes (outcomes) at bottom
- All features preserved

---

## Testing Notes

### Tutorial Highlighting Fix
- Verify tutorial auto-starts with decision tree path highlighting
- Test all 3 tutorial steps show correct highlighting

### SHAP Waterfall Fix
- Clear browser cache to see changes
- Verify "sex" appears as second row (after Base)
- Verify all 4 features appear

### Tree Orientation Change
- Verify tree renders correctly in vertical orientation
- Test hover effects, tutorial, and comparison mode
- Verify responsive behavior

---

## API Changes

### `/api/explain/shap` Response Format Change

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

**Breaking Change:** Yes - waterfall_data array now has 5 elements instead of 4 (Base + 4 features)

**Backwards Compatibility:** The frontend already expected this format, so no frontend changes needed beyond backend fix.

---

## Related Documentation

- **AI_CONTEXT.md** - Comprehensive project reference
- **ASSISTANT_GUIDE.md** - Step-by-step task patterns
- **DOCUMENTATION_INDEX.md** - Central navigation hub
- **Feature Documentation:**
  - DECISION_TREE_FEATURES.md - Decision tree visualization features
  - COHORT_COMPARISON_FEATURE.md - Natural language comparison system
  - TUTORIAL_FEATURE.md - Interactive tutorial system
