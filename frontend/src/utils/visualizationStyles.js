/**
 * ============================================================================
 * CENTRALIZED STYLING FOR ALL VISUALIZATIONS AND UI
 * ============================================================================
 *
 * This file contains all styling constants used across the application.
 * Update values here to apply changes throughout the entire application.
 *
 * Used by:
 * - DecisionTreeViz.jsx (vertical tree layout)
 * - DecisionTreeVizHorizontal.jsx (horizontal tree layout)
 * - SHAPWaterfall.jsx (SHAP waterfall chart)
 * - GlobalFeatureImportance.jsx (feature importance bar chart)
 * - PredictionCard.jsx (prediction result cards)
 * - SinglePredictionCard.jsx (chat prediction cards)
 * - ComparisonCard.jsx (cohort comparison cards)
 *
 * Quick Reference:
 * - Died (class 0): Orange (#F09A48) - used in tree & SHAP negative
 * - Survived (class 1): Light green (#B8F06E) - used in tree & SHAP positive
 * - Tutorial/Highlight: Gold (#ffd700)
 *
 * ============================================================================
 */

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FONTS = {
  // Font families
  primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',

  // Font sizes for visualizations
  tree: {
    nodeLabel: '12px',           // Feature labels on internal nodes
    predictionLabel: '12px',     // Survived/Died labels on leaf nodes
    edgeLabel: '11px',           // Edge labels (≤/>)
    tooltip: '13px'              // Tooltip text
  },

  shap: {
    featureLabel: '12px',        // Feature names
    valueLabel: '11px',          // Feature values
    axisLabel: '11px',           // Axis labels
    tooltip: '13px'              // Tooltip text
  },

  ui: {
    cardTitle: '16px',           // Card titles
    cardValue: '24px',           // Large values (probability, etc)
    cardLabel: '14px',           // Labels
    cardSubtext: '12px'          // Small text
  }
}

// Font weights
export const FONT_WEIGHTS = {
  normal: 500,
  bold: 700,
  semibold: 600
}

// ============================================================================
// COLORS
// ============================================================================

export const TREE_COLORS = {
  // Class colors - used in pie charts and path highlighting
  died: '#F09A48',        // Orange for died/class 0
  survived: '#B8F06E',    // Light green for survived/class 1

  // Path highlighting colors
  tutorial: '#ffd700',    // Gold for tutorial mode highlighting
  hover: '#ffd700',       // Gold for hover effects

  // Comparison mode colors - use survived/died colors for consistency
  comparisonA: '#B8F06E',      // Green (survived color) for path A
  comparisonB: '#F09A48',      // Orange (died color) for path B
  comparisonShared: '#ffd700', // Gold for shared paths (stands out from both)

  // General UI colors
  defaultStroke: '#666',       // Default link/edge color
  nodeStroke: '#888',          // Stroke around pie chart segments
  textDefault: '#fafafa',      // Default text color (white-ish)
  background: '#0e1117',       // Tree background color

  // Tooltip colors
  tooltipBg: 'rgba(0, 0, 0, 0.9)',
  tooltipText: 'white'
}

// SHAP visualization colors
// Note: Uses same colors as TREE_COLORS for consistency
export const SHAP_COLORS = {
  // Feature impact colors (used in waterfall and feature importance charts)
  // Positive = pushes toward survived (class 1), Negative = pushes toward died (class 0)
  positive: '#B8F06E',         // Same as survived - for positive impact (increases survival prediction)
  positiveStroke: '#cef78e',   // Lighter version for stroke
  negative: '#F09A48',         // Same as died - for negative impact (decreases survival prediction)
  negativeStroke: '#f5b06d',   // Lighter version for stroke

  // Highlighting
  highlight: '#ffd700',        // Gold for highlighted bars
  highlightGlow: 'rgba(255, 215, 0, 0.8)',

  // Text and UI
  text: '#fafafa',             // White-ish text
  barDefault: '#B8F06E'        // Default bar color (uses survived color for consistency)
}

// UI card colors - matches visualization colors for consistency
export const UI_COLORS = {
  // Survived colors (high probability)
  survivedText: '#B8F06E',        // Same as survived in visualizations
  survivedBg: 'rgba(184, 240, 110, 0.15)',
  survivedBorder: 'rgba(184, 240, 110, 0.5)',

  // Died colors (low probability)
  diedText: '#F09A48',            // Same as died in visualizations
  diedBg: 'rgba(240, 154, 72, 0.15)',
  diedBorder: 'rgba(240, 154, 72, 0.5)',

  // Uncertain colors (medium probability)
  uncertainText: '#fbbf24',       // Yellow/amber
  uncertainBg: 'rgba(251, 191, 36, 0.15)',
  uncertainBorder: 'rgba(251, 191, 36, 0.5)',

  // Neutral UI colors
  cardBg: 'rgba(31, 41, 55, 0.5)',       // gray-800 with opacity
  cardBorder: '#374151',                  // gray-700
  textPrimary: '#e5e7eb',                 // gray-200
  textSecondary: '#9ca3af',               // gray-400
  textMuted: '#6b7280'                    // gray-500
}

// ============================================================================
// EFFECTS
// ============================================================================

// Shadow/glow effects for different states
export const TREE_EFFECTS = {
  active: 'drop-shadow(0 0 6px rgba(255,255,255,0.3))',
  final: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
  tutorial: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))',
  hover: 'drop-shadow(0 0 4px rgba(255,215,0,0.4))',
  comparisonA: 'drop-shadow(0 0 8px rgba(184, 240, 110, 0.8))',   // Green glow (survived)
  comparisonB: 'drop-shadow(0 0 8px rgba(240, 154, 72, 0.8))',    // Orange glow (died)
  comparisonShared: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.9))' // Gold glow
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
  minWidth: 2,      // Minimum stroke width for edges with fewest samples
  maxWidth: 20,     // Maximum stroke width for edges with most samples

  // Node stroke widths (fixed)
  nodeStroke: 1,    // Stroke around pie chart segments

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
    internal: 8,    // Offset from node for internal (feature) labels
    leaf: 15        // Offset from node for leaf (prediction) labels
  }
}

// SHAP chart sizing
export const SHAP_SIZING = {
  barHeight: 20,           // Height of each bar in waterfall
  barSpacing: 4,           // Spacing between bars
  strokeWidth: 2,          // Stroke width for bars
  minBarWidth: 3           // Minimum width for very small values
}
