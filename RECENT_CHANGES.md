# Recent Changes Documentation
**Date**: January 4, 2026

## Overview
Centralized font sizing for prediction cards and improved decision tree visualization labels.

---

## 1. Font Size Centralization (uiStyles.js)

### Added Font Size Constants

**For Regular Prediction Cards** (`FONTS.ui`):
```javascript
cardValue: '48px'           // Large values - single prediction cards
cardValueMedium: '30px'     // Medium values - single chat cards
cardOutcome: '24px'         // Outcome text (Survived/Died)
cardLabel: '14px'           // Labels
cardSubtext: '12px'         // Small text
```

**For Comparison Cards** (`FONTS.comparison`):
```javascript
cardValue: '20px'           // Probability percentages in comparison cards
cardOutcome: '12px'         // Survived/Died text
modelLabel: '12px'          // Decision Tree / XGBoost labels
cohortLabel: '14px'         // Cohort names (Women/Men)
summaryText: '12px'         // Summary text at bottom
```

### Files Modified:
- `frontend/src/utils/uiStyles.js` - Added font size constants

---

## 2. Updated Prediction Card Components

### PredictionCard.jsx
- Replaced hardcoded Tailwind classes (`text-xs`, `text-sm`, `text-5xl`, `text-2xl`) with `FONTS.ui.*` constants
- Now uses:
  - `FONTS.ui.cardSubtext` - Model name header
  - `FONTS.ui.cardLabel` - "Survival Probability" and "Predicted Outcome" labels
  - `FONTS.ui.cardValue` - Main probability percentage (48px)
  - `FONTS.ui.cardOutcome` - Survived/Died text (24px)

### SinglePredictionCard.jsx
- Replaced hardcoded Tailwind classes with `FONTS.ui.*` constants
- Uses `FONTS.ui.cardValueMedium` (30px) for probability percentages in chat cards
- All other sizing follows same pattern as PredictionCard

### ComparisonCard.jsx
- Replaced hardcoded Tailwind classes with `FONTS.comparison.*` constants
- Smaller font sizes appropriate for showing multiple predictions side-by-side
- Uses:
  - `FONTS.comparison.cardValue` (20px) - Probability percentages
  - `FONTS.comparison.modelLabel` (12px) - Decision Tree/XGBoost labels
  - `FONTS.comparison.cohortLabel` (14px) - Cohort names
  - `FONTS.comparison.summaryText` (12px) - Bottom summary

**Result**: Font sizes now update dynamically when changed in `uiStyles.js`

---

## 3. Decision Tree Visualization Enhancements

### Added Survival Rate to Leaf Labels

**Both DecisionTreeViz.jsx and DecisionTreeVizHorizontal.jsx**:
- Leaf node labels now show survival rate alongside outcome
- Text is wrapped on two lines:
  - Line 1: "Survived" or "Died"
  - Line 2: "(75%)" - rounded percentage
- Uses `tspan` elements for proper multi-line SVG text
- Prevents text clipping issues

**Example**:
```
Survived
(73%)
```

### Font Weight Adjustments

**All node and edge labels now use FONT_WEIGHTS variables**:
- Feature labels (on pie charts): `FONT_WEIGHTS.normal` (500) - changed from bold to normal
- Prediction labels (Survived/Died): `FONT_WEIGHTS.normal` (500) - normal weight
- Survival rate percentage: `FONT_WEIGHTS.predictionLabelHighlight` (700) - stays bold
- Edge labels (inactive): `FONT_WEIGHTS.semibold` (600)
- Edge labels (highlighted): `FONT_WEIGHTS.edgeLabelHighlight` (700)

**Specific CSS changes**:
```css
/* Before - hardcoded */
font-weight: 500;
font-weight: 700;

/* After - using variables */
font-weight: ${FONT_WEIGHTS.normal};
font-weight: ${FONT_WEIGHTS.predictionLabelHighlight};
```

### Edge Label Color Fix (Comparison Mode)

**Problem**: In comparison mode, edge labels were colored based on path (path-a, path-b colors)

**Solution**: Changed all comparison edge labels to use `TREE_COLORS.textDefault`

**Files modified**:
- `frontend/src/components/visualizations/DecisionTreeViz.jsx`
- `frontend/src/components/visualizations/DecisionTreeVizHorizontal.jsx`

**CSS changes**:
```css
/* Before */
.edge-label.path-a {
  fill: ${TREE_COLORS.comparisonA};
}

/* After */
.edge-label.path-a {
  fill: ${TREE_COLORS.textDefault};
}
```

**Result**: Edge labels now remain consistently readable in all comparison modes

---

## Summary of Benefits

1. **Easier Maintenance**: Change font sizes in one place (`uiStyles.js`) to update all cards
2. **Consistency**: Separate sizing for comparison vs. single cards ensures appropriate scaling
3. **Better UX**: Decision tree leaf labels now show survival probability without clipping
4. **Flexibility**: All font weights use variables, making it easy to adjust typography
5. **Readability**: Edge labels in comparison mode use consistent text color

---

## Files Changed

### Frontend
1. `frontend/src/utils/uiStyles.js` - Added font size constants
2. `frontend/src/components/PredictionCard.jsx` - Applied font size constants
3. `frontend/src/components/SinglePredictionCard.jsx` - Applied font size constants
4. `frontend/src/components/ComparisonCard.jsx` - Applied comparison font sizes
5. `frontend/src/components/visualizations/DecisionTreeViz.jsx` - Added survival rate, updated font weights, fixed edge label colors
6. `frontend/src/components/visualizations/DecisionTreeVizHorizontal.jsx` - Added survival rate, updated font weights, fixed edge label colors

---

## How to Customize

### Adjust Card Font Sizes
Edit `frontend/src/utils/uiStyles.js`:

```javascript
// Make single prediction cards larger
cardValue: '60px'  // was 48px

// Make comparison cards smaller
FONTS.comparison = {
  cardValue: '16px'  // was 20px
}
```

### Adjust Tree Font Weights
Edit `frontend/src/utils/visualizationStyles.js`:

```javascript
export const FONT_WEIGHTS = {
  normal: 400,              // Make lighter (was 500)
  predictionLabelHighlight: 800  // Make bolder (was 700)
}
```

Changes will propagate automatically across all components.
