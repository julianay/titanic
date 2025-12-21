# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed - Styling Refactoring (December 21, 2025)

#### Centralized Styling System
- **Renamed** `src/utils/visualizationColors.js` → `src/utils/visualizationStyles.js`
- **Added** comprehensive styling constants for typography, sizing, and spacing
- **Centralized** all hard-coded values into single source of truth

#### New Constants Added

**Typography:**
- `FONTS` - Font families and sizes for tree, SHAP, and UI components
- `FONT_WEIGHTS` - Standard weight values (normal, semibold, bold)

**Sizing & Spacing:**
- `TREE_STROKE` - Stroke width configuration
  - `minWidth: 2` - Minimum edge stroke width
  - `maxWidth: 20` - Maximum edge stroke width
  - `nodeStroke: 1` - Pie chart segment border width
- `TREE_SIZING` - Node sizing configuration
  - `radiusMultiplier: 2` - Node radius calculation multiplier
  - `innerRadiusFraction: 0.5` - Donut chart inner radius (0.5 = 50% hole)
  - `labelOffset.internal: 8` - Offset for feature labels
  - `labelOffset.leaf: 15` - Offset for prediction labels
- `SHAP_SIZING` - SHAP chart sizing values

#### Updated Components

All imports updated from `visualizationColors` to `visualizationStyles`:
- `src/components/visualizations/DecisionTreeViz.jsx`
- `src/components/visualizations/DecisionTreeVizHorizontal.jsx`
- `src/components/visualizations/SHAPWaterfall.jsx`
- `src/components/visualizations/GlobalFeatureImportance.jsx`
- `src/components/PredictionCard.jsx`
- `src/components/SinglePredictionCard.jsx`
- `src/components/ComparisonCard.jsx`

#### D3 Visualizations - Hard-coded Values Replaced

**DecisionTreeViz.jsx & DecisionTreeVizHorizontal.jsx:**
- Edge stroke width range: `[2, 20]` → `[TREE_STROKE.minWidth, TREE_STROKE.maxWidth]`
- Node radius multiplier: `* 2` → `* TREE_SIZING.radiusMultiplier`
- Donut inner radius: `* 0.5` → `* TREE_SIZING.innerRadiusFraction`
- Node border width: `1` → `TREE_STROKE.nodeStroke`
- Label offsets: `8`, `15` → `TREE_SIZING.labelOffset.internal`, `TREE_SIZING.labelOffset.leaf`

#### Benefits

1. **Single Source of Truth** - All styling in one file (`visualizationStyles.js`)
2. **Easy Customization** - Change colors, sizes, fonts in one place
3. **Consistency** - Ensures visualizations and UI use same values
4. **Maintainability** - No hard-coded "magic numbers" in components
5. **Documentation** - Self-documenting with clear constant names

#### Files Changed
- Added: `src/utils/visualizationStyles.js`
- Removed: `src/utils/visualizationColors.js`
- Updated: 7 component files (imports and D3 code)
- Added: `STYLING_GUIDE.md` (comprehensive documentation)

---

### Changed - Decision Tree Labels (December 21, 2025)

#### Leaf Node Labels Now Conditional
- **Removed** "Survived"/"Died" labels from leaf nodes by default
- **Added** conditional display: labels only appear when path is highlighted
  - Shows during tutorial mode
  - Shows during single path highlighting
  - Shows during comparison mode (with color coding)
- **Updated** label colors to match highlight state:
  - Tutorial mode: Gold (`TREE_COLORS.tutorial`)
  - Comparison mode: Blue/Orange/Purple (`comparisonA`/`comparisonB`/`comparisonShared`)
  - Regular mode: Default text color

#### Tooltip Unchanged
- Hover tooltip still shows all information (samples, distribution, survival rate)
- Tooltip does NOT show prediction label (per user preference)

#### Implementation Details
- Created separate `.prediction-label` text elements in D3 tree
- Labels use CSS class-based visibility (no inline `opacity: 0`)
- Labels automatically color-matched to path highlighting state

#### Files Changed
- `src/components/visualizations/DecisionTreeViz.jsx` - Vertical tree
- `src/components/visualizations/DecisionTreeVizHorizontal.jsx` - Horizontal tree

#### User Experience Impact
- **Cleaner tree visualization** - Less visual clutter by default
- **Contextual information** - Labels appear when exploring specific paths
- **Better focus** - Draws attention to the prediction when path is active

---

## Earlier Changes

(Previous changelog entries would go here)
