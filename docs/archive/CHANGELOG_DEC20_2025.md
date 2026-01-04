# Changelog - December 20, 2025

## Bug Fixes

### 1. Comparison Detection Not Working for "kids vs elderly" (Late Evening)

**Issue:** Comparison queries using "kids vs elderly" were not being detected as comparisons and instead returned an error message.

**Root Cause:** In `frontend/src/utils/cohortPatterns.js`, the hardcoded fallback pattern for age-based comparisons only recognized "child/children" and "adults" keywords, but not "kids" or "elderly". The regex pattern was:
```javascript
/\bchild(ren)?\s+(vs\.?|versus|against|and|or)\s+adults?\b/
```

**Fix:** Extended the pattern to recognize all age-related keywords and intelligently set ages:
- "kids" or "children" → age 8
- "elderly" or "seniors" → age 65
- "adults" → age 35

Updated regex pattern (lines 212-213):
```javascript
/\b(child(ren)?|kids?)\s+(vs\.?|versus|against|and|or)\s+(adults?|elderly|seniors?)\b/i
```

**Files Changed:**
- `frontend/src/utils/cohortPatterns.js:211-225`

**Impact:** Comparison queries now work with all variations:
- "kids vs elderly" ✅
- "children vs seniors" ✅
- "kids vs adults" ✅
- "elderly vs kids" ✅ (reverse order)

---

### 2. Tutorial Highlighting Not Working on Decision Tree

**Issue:** During the tutorial, the decision tree was not highlighting the tutorial cohort's path, even though the XGBoost waterfall chart highlighting was working correctly.

**Root Cause:** In `ModelComparisonView.jsx:61`, the `passengerValues` prop was only passed to `DecisionTreeViz` when `hasQuery` was true. When the tutorial auto-starts, `hasQuery` is `false`, so the decision tree received `null` for passenger values and couldn't trace/highlight the path.

**Fix:** Updated the condition to also pass passenger values when the tutorial is active (when `highlightMode` is set):

```javascript
// Before
passengerValues={hasQuery ? passengerData : null}

// After
passengerValues={hasQuery || highlightMode ? passengerData : null}
```

**Files Changed:**
- `frontend/src/components/ModelComparisonView.jsx:61`

**Impact:** The tutorial now properly highlights the decision tree path in all tutorial steps:
- Step 1: First split only (root → female path) in gold
- Step 2: Complete path through the tree in gold

---

### 3. Sex Feature Missing from SHAP Waterfall Chart

**Issue:** The "sex" feature was not appearing in the SHAP waterfall chart, despite being the most important feature in the Global Feature Importance chart. For the tutorial passenger (30-year-old woman in 1st class), sex has the largest SHAP contribution (~+2.39) but was completely hidden from the visualization.

**Root Cause:** The backend was returning waterfall data with only the 4 feature contributions, without a separate "Base" entry. The frontend visualization (`SHAPWaterfall.jsx:152-156`) expected the first item (index 0) to be labeled "Base", so it was incorrectly labeling the **sex feature** as "Base", effectively hiding it from view.

**Fix:** Added a "Base" item as the first element in the waterfall data array in the backend, ensuring it stays at index 0 when sorting features by contribution magnitude.

**Code Changes:**

`backend/models/xgboost_model.py` (lines 138-161):
```python
# Add base value as first item (for visualization)
waterfall_data.append({
    "feature": "Base",
    "value": 0.0,  # Base has no contribution itself
    "start": float(base_value),
    "end": float(base_value),
    "feature_value": ""
})

# ... add feature contributions ...

# Sort features by absolute SHAP value (keep Base at index 0)
base_item = waterfall_data[0]
feature_items = waterfall_data[1:]
feature_items_sorted = sorted(feature_items, key=lambda x: abs(x['value']), reverse=True)
waterfall_data_sorted = [base_item] + feature_items_sorted
```

**Files Changed:**
- `backend/models/xgboost_model.py:138-161`

**Impact:** The SHAP waterfall now correctly displays all features in order of contribution:
1. **Base** - baseline prediction (gray bar)
2. **sex=0** - largest positive contribution (green bar, ~+2.39)
3. **pclass=1** - second largest contribution (green bar, ~+1.66)
4. **fare=84** - smaller contribution (green bar, ~+0.48)
5. **age=30** - smallest contribution (green bar, ~+0.33)

**Note:** Users need to refresh their browser to clear the frontend cache and see the updated data.

---

## New Features

### 4. Layout Restructuring for Better Space Utilization (Late Evening)

**Feature:** Restructured the page layout to give more space to visualizations while maintaining the chat interface.

**Changes:**

**Main Layout** (`Layout.jsx`):
- Changed column split from 70/30 to **80/20**
- Visualizations now occupy 80% of screen width (was 70%)
- Chat/controls occupy 20% of screen width (was 30%)

**Visualization Layout** (`ModelComparisonView.jsx`):
- Left column now split into two sections side-by-side:
  - **Decision Tree: 70%** (left side)
  - **XGBoost Section: 30%** (right side)
- XGBoost visualizations stacked vertically:
  - SHAP waterfall chart (top)
  - Global feature importance (bottom)

**Comparison Mode**:
- Dual SHAP waterfalls now stack vertically instead of side-by-side
- Fits better in the narrower 30% column

**Code Changes:**

`Layout.jsx`:
- Line 37: `w-[70%]` → `w-[80%]` (left column)
- Line 54: `w-[30%]` → `w-[20%]` (right column)

`ModelComparisonView.jsx`:
- Line 48: Changed from `grid grid-cols-2` to `flex flex-row`
- Line 50: Added `lg:w-[70%]` to Decision Tree section
- Line 75: Added `lg:w-[30%]` to XGBoost section
- Lines 86, 147: Changed from `grid grid-cols-2` to `space-y-6` for vertical stacking

**Files Changed:**
- `frontend/src/components/Layout.jsx:37, 54`
- `frontend/src/components/ModelComparisonView.jsx:48, 50, 75, 86, 147`

**Impact:**
- More screen space for complex visualizations
- Better use of horizontal space
- Maintains all functionality (tutorial, comparison mode, responsive design)

---

### 5. Interactive Zoom and Pan for Decision Tree

**Feature:** Added zoom and pan controls to the decision tree visualization for better exploration of large trees.

**Implementation:**

Added D3.js zoom behavior with both mouse interaction and control buttons:

**Mouse Interaction:**
- Scroll wheel to zoom in/out (centered on cursor position)
- Click and drag to pan around the tree
- Cursor feedback (grab/grabbing)

**Control Buttons:**
- **+** button: Zoom in by 30%
- **−** button: Zoom out by ~23%
- **Reset** button: Return to default view

**Zoom Limits:**
- Minimum: 30% (0.3x scale)
- Maximum: 300% (3x scale)

**Code Changes:**

`frontend/src/components/visualizations/DecisionTreeViz.jsx`:
- Added zoom behavior with `d3.zoom()`
- Created separate zoom group to preserve margin transforms
- Added three zoom control functions: `handleZoomIn()`, `handleZoomOut()`, `handleZoomReset()`
- Added control buttons UI with Tailwind CSS styling
- Added cursor styles for dragging feedback

**Files Changed:**
- `frontend/src/components/visualizations/DecisionTreeViz.jsx` (lines 25-26, 278-308, 148-162, 595-603, 784-813)

**Compatibility:**
- ✅ Works with tutorial highlighting mode
- ✅ Works with comparison mode (dual path visualization)
- ✅ Preserves hover effects and tooltips
- ✅ Maintains variable stroke widths
- ✅ Responsive layout compatible

---

## Feature Changes

### 6. Decision Tree Orientation Changed from Horizontal to Vertical

**Change:** Converted the decision tree visualization from left-to-right (horizontal) to top-to-bottom (vertical) orientation.

**Motivation:** Vertical tree layouts are more conventional and easier to read, especially for wider trees.

**Implementation:** Updated D3.js tree layout and positioning:
1. Changed margins to accommodate vertical layout (more space top/bottom)
2. Swapped width/height dimensions in tree size
3. Changed from `d3.linkHorizontal()` to `d3.linkVertical()`
4. Swapped x/y coordinate mappings throughout
5. Repositioned edge labels to appear on left/right sides of branches
6. Repositioned node labels (internal nodes above, leaf nodes below)

**Code Changes:**

`frontend/src/components/visualizations/DecisionTreeViz.jsx`:
- Line 270: Updated margins from `{ top: 20, right: 150, bottom: 20, left: 80 }` to `{ top: 40, right: 20, bottom: 80, left: 20 }`
- Line 288: Swapped tree size dimensions
- Lines 333-335: Changed to `d3.linkVertical()` and swapped x/y
- Lines 346-357: Repositioned edge labels with `dx` offsets
- Line 364: Swapped x/y in node transforms
- Lines 475-489: Simplified label positioning (above for internal, below for leaves)

**Files Changed:**
- `frontend/src/components/visualizations/DecisionTreeViz.jsx` (multiple lines)

**Impact:**
- Tree now flows from top to bottom
- Root node at the top
- Feature splits cascade downward
- Leaf nodes (survival outcomes) at the bottom
- Edge labels positioned left/right of branches
- All features preserved: hover effects, highlighting, comparison mode, tutorial mode

---

## Testing Notes

### Tutorial Highlighting Fix
- Verify tutorial auto-starts with decision tree path highlighting
- Test all 3 tutorial steps show correct highlighting on both tree and waterfall

### SHAP Waterfall Fix
- Clear browser cache or hard refresh to see changes
- Verify "sex" appears as second row (after Base) in tutorial mode
- Verify all 4 features appear for any passenger configuration

### Tree Orientation Change
- Verify tree renders correctly in vertical orientation
- Test hover effects still work
- Test tutorial highlighting works with vertical layout
- Test comparison mode dual-path highlighting works
- Verify responsive behavior with different screen sizes

---

## API Changes

### `/api/explain/shap` Response Format Change

**Before:**
```json
{
  "waterfall_data": [
    {"feature": "sex", "value": 2.388, "start": -0.386, "end": 2.002, "feature_value": 0.0},
    {"feature": "pclass", "value": 1.660, ...},
    ...
  ]
}
```

**After:**
```json
{
  "waterfall_data": [
    {"feature": "Base", "value": 0.0, "start": -0.386, "end": -0.386, "feature_value": ""},
    {"feature": "sex", "value": 2.388, "start": -0.386, "end": 2.002, "feature_value": 0.0},
    {"feature": "pclass", "value": 1.660, ...},
    ...
  ]
}
```

**Breaking Change:** Yes - waterfall_data array now has 5 elements instead of 4 (Base + 4 features)

**Backwards Compatibility:** The frontend `SHAPWaterfall.jsx` component already expected this format, so no frontend changes were needed beyond the backend fix.

---

## Related Documentation

- `TUTORIAL_FEATURE.md` - Tutorial feature overview and testing checklist
- `DECISION_TREE_FEATURES.md` - Decision tree visualization features
- `ASSISTANT_GUIDE.md` - General implementation guide
