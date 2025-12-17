# Decision Tree Stroke Width Fix

## Problem
Variable stroke widths based on passenger counts were not visible in the decision tree visualization.

## Root Cause
**Bug on line 157** of `DecisionTreeViz.jsx`:

```javascript
// BEFORE (incorrect):
const maxSamples = d3.max(treeLayout.descendants(), d => d.samples)
```

In D3 hierarchy nodes, the original data is stored in `d.data`, not directly on `d`. So `d.samples` was `undefined`, causing the entire stroke scale to fail.

## Fix Applied

### 1. Fixed Data Access
```javascript
// AFTER (correct):
const maxSamples = d3.max(treeLayout.descendants(), d => d.data.samples)
```

### 2. Adjusted Stroke Width Range
Changed from `[1, 32]` to `[2, 20]` for better visibility:
```javascript
const strokeScale = d3.scaleSqrt()
  .domain([0, maxSamples])
  .range([2, 20])  // More visible range
```

### 3. Preserved Variable Width in Tutorial Mode
Removed fixed `stroke-width: 8px !important` from `.link.tutorial-highlight` CSS so that variable widths based on passenger counts are preserved even when highlighting specific paths.

### 4. Added Debug Logging
Added console logging to verify stroke widths are being calculated correctly:
```javascript
console.log('Tree stroke widths:', {
  maxSamples,
  minWidth: strokeScale(0),
  maxWidth: strokeScale(maxSamples),
  sampleRange: treeLayout.links().map(d => ({
    samples: d.target.data.samples,
    width: strokeScale(d.target.data.samples)
  }))
})
```

## Result
Now the stroke width of each edge properly reflects the number of passengers in that branch:
- **Thicker edges** = More passengers follow this path
- **Thinner edges** = Fewer passengers follow this path
- Width scales with square root of sample count for better visual balance

## Testing
1. Start the development server: `npm run dev`
2. Open browser console to see stroke width calculations
3. Observe that edges have varying thicknesses based on passenger flow
4. The root node's children should have the thickest edges (most passengers)
5. Leaf nodes should have thinner edges (fewer passengers)

## Files Modified
- `/frontend/src/components/visualizations/DecisionTreeViz.jsx` (lines 157, 160, 490-494, 162-171)
