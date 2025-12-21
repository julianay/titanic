# Styling Guide

This document explains the styling architecture for the Titanic Survival Prediction application.

## Overview

The application uses a **three-layer styling approach** for maximum flexibility and maintainability:

1. **Centralized Styling Constants** (`src/utils/visualizationStyles.js`) - Colors, typography, sizing
2. **Tailwind CSS** - Utility classes for layout, spacing, and structural styles
3. **Global CSS** (`src/index.css`) - Base styles and resets

---

## 1. Centralized Styling Constants

**File:** `src/utils/visualizationStyles.js`

This is the **single source of truth** for all colors, typography, sizing, and effects. Update values here to apply changes throughout the entire application.

### Typography

```javascript
import { FONTS, FONT_WEIGHTS } from './utils/visualizationStyles'

FONTS.tree.nodeLabel      // '12px' - Feature labels on internal nodes
FONTS.tree.predictionLabel // '12px' - Survived/Died labels on leaf nodes
FONTS.tree.edgeLabel       // '11px' - Edge labels (≤/>)
FONTS.shap.featureLabel    // '12px' - Feature names in SHAP charts
FONTS.ui.cardTitle         // '16px' - Card titles

FONT_WEIGHTS.normal        // 500
FONT_WEIGHTS.semibold      // 600
FONT_WEIGHTS.bold          // 700
```

### Colors

#### Tree Visualization Colors
```javascript
import { TREE_COLORS } from './utils/visualizationStyles'

TREE_COLORS.died           // '#F09A48' - Orange for died/class 0
TREE_COLORS.survived       // '#B8F06E' - Light green for survived/class 1
TREE_COLORS.tutorial       // '#ffd700' - Gold for tutorial highlighting
TREE_COLORS.hover          // '#ffd700' - Gold for hover effects
TREE_COLORS.comparisonA    // '#B8F06E' - Green for path A in comparison mode
TREE_COLORS.comparisonB    // '#F09A48' - Orange for path B
TREE_COLORS.comparisonShared // '#ffd700' - Gold for shared paths
```

#### SHAP Visualization Colors
```javascript
import { SHAP_COLORS } from './utils/visualizationStyles'

SHAP_COLORS.positive       // '#B8F06E' - Positive impact (increases survival)
SHAP_COLORS.negative       // '#F09A48' - Negative impact (decreases survival)
SHAP_COLORS.highlight      // '#ffd700' - Gold for highlighted bars
```

#### UI Card Colors
```javascript
import { UI_COLORS } from './utils/visualizationStyles'

// Survived state (high probability > 70%)
UI_COLORS.survivedText     // '#B8F06E' - Green text
UI_COLORS.survivedBg       // 'rgba(184, 240, 110, 0.15)' - Green background
UI_COLORS.survivedBorder   // 'rgba(184, 240, 110, 0.5)' - Green border

// Died state (low probability < 40%)
UI_COLORS.diedText         // '#F09A48' - Orange text
UI_COLORS.diedBg           // 'rgba(240, 154, 72, 0.15)' - Orange background
UI_COLORS.diedBorder       // 'rgba(240, 154, 72, 0.5)' - Orange border

// Uncertain state (medium probability 40-70%)
UI_COLORS.uncertainText    // '#fbbf24' - Yellow text
UI_COLORS.uncertainBg      // 'rgba(251, 191, 36, 0.15)' - Yellow background
UI_COLORS.uncertainBorder  // 'rgba(251, 191, 36, 0.5)' - Yellow border
```

### Effects & Opacity

```javascript
import { TREE_EFFECTS, TREE_OPACITY } from './utils/visualizationStyles'

TREE_EFFECTS.active        // Drop shadow for active nodes
TREE_EFFECTS.final         // Drop shadow for final node
TREE_EFFECTS.tutorial      // Drop shadow for tutorial mode
TREE_EFFECTS.hover         // Drop shadow for hover state

TREE_OPACITY.inactive      // 0.4 - Dimmed/inactive elements
TREE_OPACITY.hover         // 0.85 - Hover state
TREE_OPACITY.active        // 1 - Highlighted/active elements
```

### Stroke & Sizing

#### Tree Stroke Configuration
```javascript
import { TREE_STROKE } from './utils/visualizationStyles'

TREE_STROKE.minWidth       // 2 - Min stroke width (fewest samples)
TREE_STROKE.maxWidth       // 20 - Max stroke width (most samples)
TREE_STROKE.nodeStroke     // 1 - Stroke around pie chart segments
TREE_STROKE.linecap        // 'round' - Stroke line cap style
TREE_STROKE.opacity        // 0.6 - Default stroke opacity
```

**Usage in D3 code:**
```javascript
const strokeScale = d3.scaleSqrt()
  .domain([0, maxSamples])
  .range([TREE_STROKE.minWidth, TREE_STROKE.maxWidth])
```

#### Tree Node Sizing
```javascript
import { TREE_SIZING } from './utils/visualizationStyles'

TREE_SIZING.radiusMultiplier      // 2 - Node radius = sqrt(samples) * this
TREE_SIZING.innerRadiusFraction   // 0.5 - Donut hole size (0=pie, 0.5=half)
TREE_SIZING.labelOffset.internal  // 8 - Offset for feature labels
TREE_SIZING.labelOffset.leaf      // 15 - Offset for prediction labels
```

**Usage in D3 code:**
```javascript
const radius = Math.sqrt(d.data.samples) * TREE_SIZING.radiusMultiplier

const arc = d3.arc()
  .innerRadius(radius * TREE_SIZING.innerRadiusFraction)
  .outerRadius(radius)
```

#### SHAP Chart Sizing
```javascript
import { SHAP_SIZING } from './utils/visualizationStyles'

SHAP_SIZING.barHeight      // 20 - Height of each bar
SHAP_SIZING.barSpacing     // 4 - Spacing between bars
SHAP_SIZING.strokeWidth    // 2 - Stroke width for bars
SHAP_SIZING.minBarWidth    // 3 - Minimum width for small values
```

---

## 2. Tailwind CSS

**File:** `tailwind.config.js`

Tailwind provides utility classes for:
- **Layout:** `flex`, `grid`, `items-center`, `justify-between`
- **Spacing:** `p-6`, `mb-4`, `mt-2`, `gap-4`
- **Sizing:** `w-full`, `h-screen`, `max-w-4xl`
- **Borders:** `border`, `rounded-lg`, `border-gray-700`
- **Gray scale colors:** `bg-gray-800`, `text-gray-400`

### Example Usage

```jsx
// Good: Use Tailwind for layout and spacing
<div className="p-6 flex items-center gap-4 rounded-lg">

// Good: Use visualizationStyles for theme colors
<div style={{ backgroundColor: UI_COLORS.survivedBg }}>

// Good: Combine both
<div
  className="p-6 border rounded-lg"
  style={{
    backgroundColor: colors.bg,
    borderColor: colors.border
  }}
>
```

---

## 3. Global CSS

**File:** `src/index.css`

Contains base styles for HTML elements:

```css
body {
  background-color: #0e1117;  /* Dark background */
  color: #fafafa;              /* Light text */
  font-size: 14px;
}

h1 { font-size: 24px; font-weight: 600; }
h2 { font-size: 20px; font-weight: 600; }
h3 { font-size: 20px; font-weight: 500; }
```

**When to update:**
- Changing default background color
- Updating base font sizes
- Modifying heading styles
- Adding global CSS resets

---

## Common Styling Patterns

### 1. Card with Dynamic Colors (Survived/Died State)

```jsx
import { UI_COLORS } from '../utils/visualizationStyles'

function MyCard({ probability }) {
  const getColors = (prob) => {
    if (prob > 70) return {
      bg: UI_COLORS.survivedBg,
      border: UI_COLORS.survivedBorder,
      text: UI_COLORS.survivedText
    }
    if (prob >= 40) return {
      bg: UI_COLORS.uncertainBg,
      border: UI_COLORS.uncertainBorder,
      text: UI_COLORS.uncertainText
    }
    return {
      bg: UI_COLORS.diedBg,
      border: UI_COLORS.diedBorder,
      text: UI_COLORS.diedText
    }
  }

  const colors = getColors(probability)

  return (
    <div
      className="p-6 border rounded-lg"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border
      }}
    >
      <p style={{ color: colors.text }}>
        {probability}% survival probability
      </p>
    </div>
  )
}
```

### 2. D3 Visualization with Centralized Styling

```jsx
import { TREE_COLORS, TREE_STROKE, TREE_SIZING } from '../../utils/visualizationStyles'

// In D3 code:
const radius = Math.sqrt(d.data.samples) * TREE_SIZING.radiusMultiplier

const strokeScale = d3.scaleSqrt()
  .domain([0, maxSamples])
  .range([TREE_STROKE.minWidth, TREE_STROKE.maxWidth])

// Apply colors
.attr("fill", d => d.data.class === 1 ? TREE_COLORS.survived : TREE_COLORS.died)
.attr("stroke-width", d => strokeScale(d.data.samples))
```

### 3. CSS-in-JS Styles in Components

```jsx
<style>{`
  .node text {
    font-size: ${FONTS.tree.nodeLabel};
    font-weight: ${FONT_WEIGHTS.normal};
    fill: ${TREE_COLORS.textDefault};
    opacity: ${TREE_OPACITY.inactive};
  }

  .node text.active {
    opacity: ${TREE_OPACITY.active};
    font-weight: ${FONT_WEIGHTS.bold};
    filter: ${TREE_EFFECTS.active};
  }
`}</style>
```

---

## Files Using Centralized Styling

All these files import from `visualizationStyles.js`:

### Visualizations
- `src/components/visualizations/DecisionTreeViz.jsx`
- `src/components/visualizations/DecisionTreeVizHorizontal.jsx`
- `src/components/visualizations/SHAPWaterfall.jsx`
- `src/components/visualizations/GlobalFeatureImportance.jsx`

### UI Components
- `src/components/PredictionCard.jsx`
- `src/components/SinglePredictionCard.jsx`
- `src/components/ComparisonCard.jsx`

---

## How to Customize

### Change a Color Across Entire App

**Example: Make "survived" color blue instead of green**

```javascript
// In src/utils/visualizationStyles.js
export const TREE_COLORS = {
  survived: '#60A5FA',  // Changed from '#B8F06E' to blue
  // ...
}

export const UI_COLORS = {
  survivedText: '#60A5FA',  // Update here too
  survivedBg: 'rgba(96, 165, 250, 0.15)',
  survivedBorder: 'rgba(96, 165, 250, 0.5)',
  // ...
}
```

This automatically updates:
- Tree pie chart colors
- SHAP positive impact colors
- Prediction card colors
- Comparison mode path A color

### Adjust Tree Edge Thickness

```javascript
// In src/utils/visualizationStyles.js
export const TREE_STROKE = {
  minWidth: 3,    // Changed from 2
  maxWidth: 30,   // Changed from 20
  // ...
}
```

### Change Node Size

```javascript
// In src/utils/visualizationStyles.js
export const TREE_SIZING = {
  radiusMultiplier: 3,  // Changed from 2 (makes nodes larger)
  // ...
}
```

### Adjust Probability Thresholds for Card Colors

```javascript
// In src/components/PredictionCard.jsx
const getColors = (probability) => {
  if (probability > 80) {  // Changed from 70
    return { ... survived colors ... }
  }
  if (probability >= 50) {  // Changed from 40
    return { ... uncertain colors ... }
  }
  return { ... died colors ... }
}
```

---

## Migration Notes

### Previous Structure
- File: `src/utils/visualizationColors.js` (deprecated)
- Only contained colors and effects
- Hard-coded sizing values in D3 code

### Current Structure
- File: `src/utils/visualizationStyles.js` ✓
- Contains colors, typography, sizing, effects, opacity
- All styling constants centralized
- Easy to maintain and customize

### Breaking Changes
None - all imports automatically updated during migration.

---

## Best Practices

### ✅ Do

- **Import from visualizationStyles.js** for all theme colors, sizes, and effects
- **Use Tailwind classes** for layout, spacing, and gray-scale colors
- **Use inline styles** when applying dynamic colors from visualizationStyles.js
- **Update visualizationStyles.js** to change colors/sizing across the entire app

### ❌ Don't

- Don't hard-code colors in components (use `UI_COLORS`, `TREE_COLORS`, etc.)
- Don't hard-code sizing values in D3 code (use `TREE_SIZING`, `TREE_STROKE`, etc.)
- Don't mix Tailwind color classes with theme colors (use one or the other)
- Don't use arbitrary values when a constant exists (`p-[12px]` → use Tailwind `p-3`)

---

## Quick Reference

| What to Style | Where to Look |
|--------------|---------------|
| Survived/Died colors | `visualizationStyles.js` → `UI_COLORS`, `TREE_COLORS` |
| Card probability thresholds | Component logic (e.g., `PredictionCard.jsx`) |
| Tree edge thickness | `visualizationStyles.js` → `TREE_STROKE` |
| Node sizes | `visualizationStyles.js` → `TREE_SIZING` |
| Font sizes | `visualizationStyles.js` → `FONTS` |
| Layout/spacing | Tailwind classes in JSX |
| Drop shadows/glows | `visualizationStyles.js` → `TREE_EFFECTS` |
| Base HTML elements | `index.css` |

---

## Version History

### v2.0 - Centralized Styling (December 2025)
- ✅ Renamed `visualizationColors.js` → `visualizationStyles.js`
- ✅ Added typography constants (`FONTS`, `FONT_WEIGHTS`)
- ✅ Added sizing constants (`TREE_STROKE`, `TREE_SIZING`, `SHAP_SIZING`)
- ✅ Centralized all hard-coded sizing values from D3 code
- ✅ Updated all 7 components to use new imports

### v1.0 - Initial Implementation
- Basic color constants in `visualizationColors.js`
- Hard-coded sizing in D3 components
