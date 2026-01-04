# Style Centralization Documentation

## Overview

All styling constants for the Titanic ML application have been centralized into two main files for easy customization and maintenance.

## File Structure

```
frontend/src/utils/
├── visualizationStyles.js   # Data visualization styles (trees, charts)
└── uiStyles.js               # General UI styles (buttons, chat, cards, etc.)
```

---

## visualizationStyles.js

**Purpose:** Contains all styling constants specific to data visualizations (decision trees and SHAP charts).

### Exports

#### FONTS
- `tree.nodeLabel` - Feature labels on internal nodes (default: 12px)
- `tree.predictionLabel` - Survived/Died labels on leaf nodes (default: 12px)
- `tree.predictionLabelHighlight` - Prediction labels when highlighted (default: 16px)
- `tree.edgeLabel` - Edge labels like "Female", "Male" (default: 11px)
- `tree.edgeLabelHighlight` - Edge labels when highlighted (default: 14px)
- `tree.tooltip` - Tooltip text (default: 13px)
- `shap.featureLabel` - Feature names (default: 12px)
- `shap.valueLabel` - Feature values (default: 11px)
- `shap.axisLabel` - Axis labels (default: 11px)
- `shap.tooltip` - Tooltip text (default: 13px)

#### FONT_WEIGHTS
- `normal` - 500
- `bold` - 700
- `semibold` - 600
- `edgeLabelHighlight` - 700
- `predictionLabelHighlight` - 700

#### TREE_COLORS
- `died` - #85785B (warm gray for class 0)
- `survived` - #02AE9B (turquoise for class 1)
- `tutorial` - #ffffff (gold for tutorial mode)
- `hover` - #ffffff (gold for hover effects)
- `comparisonA` - #02AE9B (path A color)
- `comparisonB` - #85785B (path B color)
- `comparisonShared` - #ffd700 (shared path color)
- `defaultStroke` - #666 (default link color)
- `nodeStroke` - #666 (stroke around pie segments)
- `textDefault` - #ffffffff (default text color)
- `background` - #000000ff (tree background)
- `tooltipBg` - rgba(0, 0, 0, 0.9)
- `tooltipText` - white

#### SHAP_COLORS
- `positive` - #02AE9B (positive impact bars)
- `positiveStroke` - #cef78e (stroke for positive bars)
- `negative` - #85785B (negative impact bars)
- `negativeStroke` - #f5b06d (stroke for negative bars)
- `highlight` - #ffffff (highlighted bars)
- `highlightGlow` - rgba(255, 255, 255, 0.5)
- `text` - #ffffffff (chart text)
- `barDefault` - #02AE9B (default bar color)

#### TREE_EFFECTS
- `active` - drop-shadow for active nodes
- `final` - drop-shadow for final node
- `tutorial` - drop-shadow for tutorial highlights
- `hover` - drop-shadow for hover state
- `comparisonA/B/Shared` - drop-shadows for comparison paths
- `labelShadow` - drop-shadow for highlighted labels
- `labelShadowStrong` - stronger drop-shadow

#### TREE_OPACITY
- `inactive` - 0.4
- `hover` - 0.85
- `active` - 1

#### TREE_STROKE
- `minWidth` - 1 (minimum edge width)
- `maxWidth` - 30 (maximum edge width)
- `nodeStroke` - 0 (stroke around pie segments)
- `linecap` - 'round'
- `opacity` - 0.6

#### TREE_SIZING
- `radiusMultiplier` - 2 (pie chart node radius scaling)
- `innerRadiusFraction` - 0.5 (donut hole size)
- `labelOffset.internal` - 8 (offset for feature labels)
- `labelOffset.leaf` - 15 (offset for prediction labels)
- `labelOffset.leafHighlight` - 5 (additional offset when highlighted)

#### SHAP_SIZING
- `barHeight` - 20
- `barSpacing` - 4
- `strokeWidth` - 2
- `minBarWidth` - 3

### Used By
- `DecisionTreeViz.jsx`
- `DecisionTreeVizHorizontal.jsx`
- `SHAPWaterfall.jsx`
- `GlobalFeatureImportance.jsx`

---

## uiStyles.js

**Purpose:** Contains all styling constants for general UI elements (sections, cards, buttons, chat, inputs, etc.).

### Exports

#### FONTS
- `ui.cardTitle` - 16px
- `ui.cardValue` - 24px (large values like probability)
- `ui.cardLabel` - 14px
- `ui.cardSubtext` - 12px
- `ui.sectionTitle` - 20px
- `ui.helper` - 12px

#### FONT_WEIGHTS
- `normal` - 500
- `bold` - 700
- `semibold` - 600

#### UI_COLORS

**Prediction States:**
- `survivedText` - #02AE9B
- `survivedBg` - rgba(184, 240, 110, 0.15)
- `survivedBorder` - rgba(184, 240, 110, 0.5)
- `diedText` - #85785B
- `diedBg` - rgba(240, 154, 72, 0.15)
- `diedBorder` - rgba(240, 154, 72, 0.5)
- `uncertainText` - #fbbf24
- `uncertainBg` - rgba(251, 191, 36, 0.15)
- `uncertainBorder` - rgba(251, 191, 36, 0.5)

**Section Backgrounds:**
- `sectionBg` - #1f2937 (gray-800)
- `sectionBgDark` - #111827 (gray-900)

**Card States:**
- `cardBg` - rgba(31, 41, 55, 0.5)
- `cardBgLoading` - rgba(31, 41, 55, 0.5)
- `cardBgError` - rgba(127, 29, 29, 0.2)

**Borders:**
- `cardBorder` - #374151 (gray-700)
- `cardBorderError` - #991b1b (red-700)
- `cardBorderDivider` - #1f2937 (gray-800)

**Text Colors:**
- `textPrimary` - #f3f4f6 (gray-100)
- `textSecondary` - #e5e7eb (gray-200)
- `textMuted` - #9ca3af (gray-400)
- `textError` - #fca5a5 (red-300)
- `textErrorTitle` - #f87171 (red-400)

**Chart-Specific Text:**
- `chartTitle` - #e5e7eb (gray-200)
- `chartHelper` - #9ca3af (gray-400)
- `chartNoData` - #9ca3af (gray-400)

**Chat Area:**
- `chatTitle` - #f3f4f6 (gray-100)
- `chatBubbleUser` - #1f2937 (gray-800)
- `chatBubbleUserText` - #d1d5db (gray-300)
- `chatBubbleAssistant` - transparent
- `chatBubbleAssistantText` - #f3f4f6 (gray-100)
- `chatIconColor` - #9ca3af (gray-400)
- `chatHintText` - #6b7280 (gray-500)
- `chatDivider` - #1f2937 (gray-800)

**Input Fields:**
- `inputBg` - #1f2937 (gray-800)
- `inputBorder` - #374151 (gray-700)
- `inputBorderFocus` - #218FCE (primary blue)
- `inputText` - #f3f4f6 (gray-100)
- `inputPlaceholder` - #6b7280 (gray-500)

**Buttons - Primary:**
- `buttonPrimaryBg` - #218FCE
- `buttonPrimaryBgHover` - #1a7ab8
- `buttonPrimaryText` - #ffffff

**Buttons - Secondary:**
- `buttonSecondaryBg` - #2563eb (blue-600)
- `buttonSecondaryBgHover` - #1d4ed8 (blue-700)
- `buttonSecondaryText` - #ffffff

**Buttons - Tertiary:**
- `buttonTertiaryBg` - #4b5563 (gray-600)
- `buttonTertiaryBgHover` - #374151 (gray-700)
- `buttonTertiaryText` - #ffffff

**Buttons - Chip/Tag:**
- `chipBg` - #1f2937 (gray-800)
- `chipBgHover` - rgba(33, 143, 206, 0.2)
- `chipText` - #d1d5db (gray-300)
- `chipTextHover` - #218FCE

**Tutorial/Special States:**
- `tutorialBg` - rgba(30, 64, 175, 0.2)
- `tutorialBorder` - rgba(59, 130, 246, 0.3)
- `tutorialActive` - #3b82f6 (blue-500)
- `tutorialInactive` - #4b5563 (gray-600)

**Sliders & Controls:**
- `sliderBg` - #374151 (gray-700)
- `sliderThumb` - #218FCE

**Links:**
- `linkColor` - #218FCE
- `linkColorHover` - #1a7ab8

**Disabled States:**
- `disabledBg` - rgba(75, 85, 99, 0.5)
- `disabledText` - #6b7280 (gray-500)
- `disabledCursor` - 'not-allowed'

#### SPACING
- `sectionGap` - 24px
- `sectionPadding` - 24px
- `cardPadding` - 16px
- `cardGap` - 16px
- `chatMessageGap` - 12px
- `chatInputPadding` - 12px
- `buttonPaddingSmall` - '6px 12px'
- `buttonPaddingMedium` - '8px 16px'
- `buttonPaddingLarge` - '12px 24px'
- `containerMaxWidth` - 1400px
- `sidebarWidth` - 320px

#### UI_EFFECTS
- `cardShadow` - box-shadow for cards
- `cardShadowHover` - box-shadow on hover
- `transitionFast` - 0.15s ease
- `transitionNormal` - 0.3s ease
- `transitionSlow` - 0.5s ease
- `transitionButton` - all 0.2s ease
- `transitionInput` - all 0.2s ease
- `transitionColors` - color and background transitions

#### BORDER_RADIUS
- `small` - 4px
- `medium` - 8px
- `large` - 12px
- `xl` - 16px
- `full` - 9999px
- `button` - 8px
- `input` - 4px
- `card` - 12px
- `chip` - 9999px
- `chatBubble` - 16px

#### ANIMATIONS
- `chatMessageSlideIn` - 'slideInUp 0.5s ease-out'
- `chatMessageDelay` - Object with timing values
- `buttonHover` - 'transform 0.2s ease'
- `pulse` - 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'

### Used By
- `ModelComparisonViewAlt.jsx`
- `PredictionCard.jsx`
- `ComparisonCard.jsx`
- `SinglePredictionCard.jsx`
- `SHAPWaterfall.jsx`
- `GlobalFeatureImportance.jsx`
- `ChatPanel.jsx` (ready to use)
- `TutorialControls.jsx` (ready to use)
- `WhatIfCard.jsx` (ready to use)
- `WhatIfModal.jsx` (ready to use)

---

## Component Changes

All components have been updated to import from the correct style files:

### Components Using `visualizationStyles.js`
```javascript
import { FONTS, FONT_WEIGHTS, TREE_COLORS, TREE_EFFECTS, TREE_OPACITY, TREE_STROKE, TREE_SIZING } from '../../utils/visualizationStyles'
import { SHAP_COLORS, SHAP_SIZING } from '../../utils/visualizationStyles'
```

### Components Using `uiStyles.js`
```javascript
import { UI_COLORS } from '../utils/uiStyles'
```

### Components Using Both
```javascript
import { SHAP_COLORS } from '../../utils/visualizationStyles'
import { UI_COLORS } from '../../utils/uiStyles'
```

---

## How to Customize

### Changing Visualization Colors

**Example: Change the "Survived" color in all visualizations**

Edit `visualizationStyles.js`:
```javascript
export const TREE_COLORS = {
  survived: '#00ff00',  // Change from #02AE9B to bright green
  // ...
}

export const SHAP_COLORS = {
  positive: '#00ff00',  // Change from #02AE9B to match
  // ...
}
```

This will update:
- Decision tree path colors
- SHAP waterfall bar colors
- All prediction indicators

### Changing UI Styles

**Example: Change primary button color**

Edit `uiStyles.js`:
```javascript
export const UI_COLORS = {
  buttonPrimaryBg: '#ff6600',        // New orange color
  buttonPrimaryBgHover: '#cc5200',   // Darker orange for hover
  // ...
}
```

This will update all primary buttons (Send, Apply, etc.) throughout the app.

### Changing Chat Styles

**Example: Change chat bubble colors**

Edit `uiStyles.js`:
```javascript
export const UI_COLORS = {
  chatBubbleUser: '#2d3748',         // Darker user bubbles
  chatBubbleUserText: '#ffffff',     // White text
  chatBubbleAssistantText: '#e2e8f0', // Lighter assistant text
  // ...
}
```

### Changing Spacing

**Example: Make cards more spacious**

Edit `uiStyles.js`:
```javascript
export const SPACING = {
  cardPadding: '24px',  // Changed from 16px
  cardGap: '24px',      // Changed from 16px
  // ...
}
```

---

## Key Benefits

1. **Single Source of Truth**: All styling in two centralized files
2. **Easy Theming**: Change colors/styles in one place, updates everywhere
3. **Consistent Design**: Ensures visual consistency across components
4. **Better Maintainability**: Clear separation between visualization and UI styles
5. **Type Safety**: Export constants can be validated
6. **Documentation**: Inline comments explain each value's purpose

---

## Migration Notes

### Before (Scattered Styles)
- Colors hardcoded in components: `className="bg-gray-800 text-gray-300"`
- Tailwind classes throughout JSX
- Difficult to maintain consistency
- Theme changes required editing multiple files

### After (Centralized Styles)
- Colors from constants: `style={{ backgroundColor: UI_COLORS.sectionBg }}`
- Easy to change themes
- Single source of truth
- Better for branding/customization

---

## Future Enhancements

Potential additions to `uiStyles.js`:
- Theme variants (dark/light mode toggle)
- Accessibility color schemes (high contrast)
- Animation speed preferences
- Custom breakpoints for responsive design
- Color palette generator based on primary color

---

## Quick Reference

### Change Tree Path Colors
→ `visualizationStyles.js` → `TREE_COLORS.survived` / `TREE_COLORS.died`

### Change Button Styles
→ `uiStyles.js` → `UI_COLORS.buttonPrimary*` / `buttonSecondary*` / `buttonTertiary*`

### Change Chat Appearance
→ `uiStyles.js` → `UI_COLORS.chat*`

### Change Section Backgrounds
→ `uiStyles.js` → `UI_COLORS.sectionBg` / `sectionBgDark`

### Change Font Sizes
→ Visualizations: `visualizationStyles.js` → `FONTS.tree` / `FONTS.shap`
→ UI: `uiStyles.js` → `FONTS.ui`

### Change Spacing
→ `uiStyles.js` → `SPACING.*`

### Change Animations
→ `uiStyles.js` → `ANIMATIONS.*` / `UI_EFFECTS.transition*`
