/**
 * ============================================================================
 * CENTRALIZED STYLING FOR VISUALIZATIONS
 * ============================================================================
 *
 * This file contains all styling constants for data visualizations.
 * Update values here to apply changes to all charts and visualizations.
 *
 * For general UI styles (sections, cards, chat, etc.), see uiStyles.js
 *
 * Used by:
 * - DecisionTreeViz.jsx (vertical tree layout)
 * - DecisionTreeVizHorizontal.jsx (horizontal tree layout)
 * - SHAPWaterfall.jsx (SHAP waterfall chart)
 * - GlobalFeatureImportance.jsx (feature importance bar chart)
 *
 * Quick Reference:
 * - Died (class 0): Warm Gray (#9e8b62) - used in tree & SHAP negative
 * - Survived (class 1): Turquoise (#02AE9B) - used in tree & SHAP positive
 * - Tutorial/Highlight: Gold (#ffd700)
 *
 * ============================================================================
 */

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FONTS = {
  // Font sizes for visualizations
  tree: {
    nodeLabel: '12px',              // Feature labels on internal nodes
    predictionLabel: '12px',        // Survived/Died labels on leaf nodes
    predictionLabelHighlight: '16px', // Prediction labels when active/highlighted
    edgeLabel: '11px',              // Edge labels (≤/>)
    edgeLabelHighlight: '14px',     // Edge labels when path is highlighted/selected
    tooltip: '13px'                 // Tooltip text
  },

  shap: {
    featureLabel: '12px',        // Feature names
    valueLabel: '11px',          // Feature values
    axisLabel: '11px',           // Axis labels
    tooltip: '13px'              // Tooltip text
  }
}

// Font weights for visualizations
export const FONT_WEIGHTS = {
  normal: 400,
  bold: 700,
  semibold: 600,
  edgeLabelHighlight: 700,        // Font weight for highlighted edge labels
  predictionLabelHighlight: 700   // Font weight for highlighted prediction labels
}

// ============================================================================
// COLORS
// ============================================================================

export const TREE_COLORS = {
  // Class colors - used in pie charts and path highlighting
  died: '#9e8b62',        // Orange for died/class 0
  survived: '#02AE9B',    // Light green for survived/class 1

  // Path highlighting colors
  tutorial: 'rgba(255, 221, 83, 0.9)',    // Gold for tutorial mode highlighting
  hover: '#ffffff',       // Gold for hover effects

  // Comparison mode colors - IMPORTANT: These are fallback colors only
  // RULE: Path colors ALWAYS reflect the leaf value (survived/died), not the cohort
  // These colors are used for nodes/labels, but path links will override to use survived/died colors
  comparisonA: '#02AE9B',      // Green (survived color) for path A (fallback)
  comparisonB: '#9e8b62',      // Orange (died color) for path B (fallback)
  comparisonShared: '#02AE9B', // Gold for shared paths (stands out from both)

  // General UI colors
  defaultStroke: '#666',       // Default link/edge color
  nodeStroke: '#666',          // Stroke around pie chart segments
  textDefault: '#ffffffff',      // Default text color (white-ish)
  background: '#000000ff',       // Tree background color

  // Tooltip colors
  tooltipBg: 'rgba(0, 0, 0, 0.9)',
  tooltipText: 'white'
}

// SHAP visualization colors
// Note: Uses same colors as TREE_COLORS for consistency
export const SHAP_COLORS = {
  // Feature impact colors (used in waterfall and feature importance charts)
  // Positive = pushes toward survived (class 1), Negative = pushes toward died (class 0)
  positive: '#02AE9B',         // Same as survived - for positive impact (increases survival prediction)
  positiveStroke: '#44ffe9ff',   // Lighter version for stroke
  negative: '#9e8b62',         // Same as died - for negative impact (decreases survival prediction)
  negativeStroke: 'rgb(203, 152, 42)',   // Lighter version for stroke

  // Highlighting
  highlight: '#ffffff',        // Gold for highlighted bars
  highlightGlow: 'rgba(255, 255, 255, 0.5)',

  // Text and UI
  text: '#ffffffff',             // White-ish text
  barDefault: '#02AE9B'        // Default bar color (uses survived color for consistency)
}


// ============================================================================
// EFFECTS
// ============================================================================

// Shadow/glow effects for different states
export const TREE_EFFECTS = {
  active: 'drop-shadow(0 0 6px rgba(255,255,255,0.3))',
  final: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
  tutorial: 'drop-shadow(0 0 8px rgba(229, 255, 0, 0.9))',
  hover: 'drop-shadow(0 0 4px rgba(255,215,0,0.4))',
  comparisonA: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))',   // Green glow (survived)
  comparisonB: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))',    // Orange glow (died)
  comparisonShared: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))', // Gold glow

  // Text shadows for labels
  labelShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',  // Shadow for highlighted labels
  labelShadowStrong: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9))' // Stronger shadow for extra emphasis
}

// ============================================================================
// OPACITY
// ============================================================================

// Opacity values for different states
export const TREE_OPACITY = {
  inactive: 0.4,
  hover: 0.85,
  active: 1
}

// ============================================================================
// STROKE & SIZING
// ============================================================================

// Stroke width configuration for tree edges
export const TREE_STROKE = {
  // Edge/link stroke widths (scaled by sample count)
  minWidth: 1,      // Minimum stroke width for edges with fewest samples
  maxWidth: 30,     // Maximum stroke width for edges with most samples

  // Node stroke widths (fixed)
  nodeStroke: 0,    // Stroke around pie chart segments

  // Edge styles
  linecap: 'round', // round, butt, or square
  opacity: 0.6      // Default stroke opacity
}

// Node sizing configuration
export const TREE_SIZING = {
  // Pie chart node radius calculation: radius = sqrt(samples) * radiusMultiplier
  radiusMultiplier: 2,

  // Donut chart style (innerRadius as fraction of outerRadius)
  innerRadiusFraction: 0.5,  // 0 = full pie, 0.5 = donut with 50% hole

  // Label positioning
  labelOffset: {
    internal: 8,         // Offset from node for internal (feature) labels
    leaf: 15,            // Offset from node for leaf (prediction) labels
    leafHighlight: 5     // Additional offset when prediction label is active/highlighted
  }
}

// SHAP chart sizing
export const SHAP_SIZING = {
  barHeight: 20,           // Height of each bar in waterfall
  barSpacing: 4,           // Spacing between bars
  strokeWidth: 2,          // Stroke width for bars
  minBarWidth: 3           // Minimum width for very small values
}
