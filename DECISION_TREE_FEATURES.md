# Decision Tree Visualization Features

**Component**: `/frontend/src/components/visualizations/DecisionTreeViz.jsx`
**Last Updated**: December 17, 2025

This document consolidates all decision tree visualization features and enhancements.

---

## Table of Contents

1. [Variable Stroke Widths](#variable-stroke-widths)
2. [Selective Path Highlighting](#selective-path-highlighting)
3. [Dual Path Visualization](#dual-path-visualization)
4. [Usage Examples](#usage-examples)
5. [Technical Implementation](#technical-implementation)

---

## Variable Stroke Widths

**Status**: ✅ Implemented (Dec 17, 2025)

### Overview

Edge thickness automatically scales based on the number of passengers in each branch, making it easy to see which paths are most common.

### Visual Effect

- **Thicker edges** = More passengers follow this path
- **Thinner edges** = Fewer passengers follow this path
- Uses square root scale (`d3.scaleSqrt()`) for better visual balance
- Range: 2px (minimum) to 20px (maximum)

### Bug Fix History

**Problem**: Variable stroke widths were not visible.

**Root Cause**: Incorrect data access in D3 hierarchy:
```javascript
// BEFORE (incorrect):
const maxSamples = d3.max(treeLayout.descendants(), d => d.samples) // ✗ undefined

// AFTER (correct):
const maxSamples = d3.max(treeLayout.descendants(), d => d.data.samples) // ✓ works
```

**Additional Fix**: Removed fixed `stroke-width: 8px !important` from tutorial mode CSS to preserve variable widths during highlighting.

---

## Selective Path Highlighting

**Status**: ✅ Implemented (Dec 17, 2025)

### Overview

Control which portions of the decision path are highlighted through the `highlightMode` prop.

### `highlightMode` Options

| Value | Description | Use Case |
|-------|-------------|----------|
| `null` or `"full"` | Full path highlighting (default) | Show complete passenger journey |
| `"first_split"` | Highlight only first split | Focus on gender decision |
| `1`, `2`, `3`, ... | Highlight first N levels | Progressive tutorial mode |

### Visual Styling

**Normal Mode** (`null` or `"full"`):
- Active nodes: White glow
- Links: Color-coded (green = survived, orange = died)
- Final node: Pulsing animation

**Tutorial/Selective Mode** (any other value):
- Active nodes: Gold glow effect (`#ffd700`)
- Links: Gold color with maintained variable width
- Labels: Gold text
- Stronger visual emphasis for education

### Integration

```jsx
<DecisionTreeViz
  treeData={treeData}
  passengerValues={passengerData}
  highlightMode="first_split"  // Control highlighting
/>
```

---

## Dual Path Visualization

**Status**: ✅ Implemented (Dec 17, 2025)

### Overview

When comparing two cohorts, the decision tree highlights **both paths simultaneously** in different colors.

### Visual Design

- **Path A** (first cohort): Blue (`#218FCE`) - app's primary color
- **Path B** (second cohort): Orange (`#FF7F50`) - contrasting color
- Both paths maintain variable stroke width
- Glowing shadows for easy distinction

### How It Works

1. User enters comparison query (e.g., "1st class women vs 3rd class men")
2. System detects comparison mode
3. Decision tree traces **two paths** through the tree:
   - Blue path: Shows where cohort A travels
   - Orange path: Shows where cohort B travels
4. Users can visually see where paths diverge and converge

### Benefits

- **Visual insight**: See exactly how the model treats each cohort differently
- **Path divergence**: Identify which features cause different outcomes
- **Educational**: Understand decision tree logic through visual comparison
- **Interactive**: Works with any dynamic comparison query

### Example

**Query**: "1st class women vs 3rd class men"

**What You See**:
- Root node (sex decision): Both paths start here
- First split: Paths diverge
  - Blue path (women, sex ≤ 0.5): Goes left
  - Orange path (men, sex > 0.5): Goes right
- Subsequent splits: Each path continues through different branches
- Final nodes: Different survival outcomes

### Integration

```jsx
<DecisionTreeViz
  treeData={treeData}
  passengerValues={passengerData}
  comparisonData={activeComparison}  // Pass comparison data
/>
```

When `comparisonData` is provided with `cohortA` and `cohortB`, dual path mode activates automatically.

---

## Usage Examples

### Example 1: Normal Single Path

```jsx
<DecisionTreeViz
  treeData={treeData}
  passengerValues={{ sex: 0, pclass: 1, age: 30, fare: 84 }}
/>
```

Shows single white path for one passenger.

### Example 2: Tutorial Mode (First Split Only)

```jsx
<DecisionTreeViz
  treeData={treeData}
  passengerValues={passengerData}
  highlightMode="first_split"
/>
```

Shows only root and first gender split in gold.

### Example 3: Progressive Depth Tutorial

```jsx
function TutorialView() {
  const [depth, setDepth] = useState(1)

  return (
    <>
      <button onClick={() => setDepth(d => d + 1)}>Show Next Level</button>
      <DecisionTreeViz
        treeData={treeData}
        passengerValues={passengerData}
        highlightMode={depth}
      />
    </>
  )
}
```

Progressively reveals more of the tree.

### Example 4: Dual Path Comparison

```jsx
<DecisionTreeViz
  treeData={treeData}
  passengerValues={passengerData}
  comparisonData={{
    cohortA: { sex: 0, pclass: 1, age: 30, fare: 84 },
    cohortB: { sex: 1, pclass: 3, age: 30, fare: 13 }
  }}
/>
```

Shows blue path for 1st class women, orange path for 3rd class men.

---

## Technical Implementation

### Key Functions

#### 1. `tracePath(node, inputValues)`
Traces a single path through the tree based on input values.

**Returns**: Array of node IDs representing the path.

```javascript
const path = tracePath(treeData, { sex: 0, pclass: 1, age: 30, fare: 84 })
// Returns: [0, 1, 3, 7, ...] (node IDs)
```

#### 2. `getLimitedPath(fullPath)`
Limits path based on `highlightMode` for selective highlighting.

**Logic**:
- `highlightMode === "first_split"` → Returns first 2 nodes
- `highlightMode === number` → Returns first (depth + 1) levels
- Otherwise → Returns full path

#### 3. `updateTreeHighlight(path, isTutorialMode)`
Applies CSS classes for single path highlighting.

**CSS Classes Applied**:
- `.active` - Normal mode (white/green/orange)
- `.tutorial-highlight` - Tutorial mode (gold)
- `.final` - Final node pulsing animation

#### 4. `updateDualPathHighlight(pathA, pathB)` (NEW)
Applies CSS classes for dual path highlighting.

**Process**:
1. Clear all existing highlight classes
2. Apply `.path-a` to all elements in pathA (blue)
3. Apply `.path-b` to all elements in pathB (orange)

**CSS Classes Applied**:
- `.path-a` - Blue styling for cohort A
- `.path-b` - Orange styling for cohort B

### Highlighting Logic

```javascript
// Decision tree useEffect hook
useEffect(() => {
  if (!treeData || !d3TreeRef.current) return

  // DUAL PATH MODE (comparison)
  if (comparisonData && comparisonData.cohortA && comparisonData.cohortB) {
    const pathA = tracePath(treeData, comparisonData.cohortA)
    const pathB = tracePath(treeData, comparisonData.cohortB)
    updateDualPathHighlight(pathA, pathB)
    return
  }

  // SINGLE PATH MODE (normal/tutorial)
  if (!passengerValues) return

  const fullPath = tracePath(treeData, passengerValues)
  const limitedPath = getLimitedPath(fullPath)
  const isTutorialMode = highlightMode && highlightMode !== 'full'

  updateTreeHighlight(limitedPath, isTutorialMode)
}, [passengerValues, treeData, highlightMode, comparisonData])
```

### CSS Styling

```css
/* Normal mode */
.link.active { opacity: 1; }
.link.active.survived { stroke: #52b788; }  /* Green */
.link.active.died { stroke: #e76f51; }      /* Orange */

/* Tutorial mode */
.link.tutorial-highlight {
  stroke: #ffd700 !important;  /* Gold */
  opacity: 1 !important;
}

/* Comparison mode - Path A */
.link.path-a {
  stroke: #218FCE !important;  /* Blue */
  opacity: 1 !important;
}

/* Comparison mode - Path B */
.link.path-b {
  stroke: #FF7F50 !important;  /* Orange */
  opacity: 1 !important;
}
```

### Variable Stroke Width Implementation

```javascript
// Calculate stroke width scale
const maxSamples = d3.max(treeLayout.descendants(), d => d.data.samples)
const strokeScale = d3.scaleSqrt()
  .domain([0, maxSamples])
  .range([2, 20])  // Min 2px, Max 20px

// Apply to links
svg.selectAll('.link')
  .style('stroke-width', d => `${strokeScale(d.target.data.samples)}px`)
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `treeData` | Object | Required | Decision tree structure from API |
| `passengerValues` | Object | Required | Current passenger parameters `{sex, pclass, age, fare}` |
| `width` | Number | Auto | Container width |
| `height` | Number | 700 | Visualization height |
| `highlightMode` | String/Number | `null` | Controls path highlighting: `null`, `"full"`, `"first_split"`, or depth number |
| `comparisonData` | Object | `null` | Comparison data with `cohortA` and `cohortB` for dual path mode |

---

## Testing

### Test Variable Stroke Widths

1. Start dev server: `npm run dev`
2. Open browser
3. Observe edges have varying thickness
4. Root node's children should have thickest edges (most passengers)
5. Leaf nodes should have thinner edges (fewer passengers)

### Test Selective Highlighting

1. Set `highlightMode="first_split"`
2. Observe only root and first split highlighted in gold
3. Change to `highlightMode={2}`
4. Observe first two levels highlighted

### Test Dual Path Visualization

1. Enter comparison query: "1st class women vs 3rd class men"
2. Observe two colored paths on decision tree:
   - Blue path for 1st class women
   - Orange path for 3rd class men
3. Verify paths diverge at appropriate splits
4. Enter regular query: "show me a woman in 1st class"
5. Verify single path highlighting returns

---

## Future Enhancements

Potential additions:

1. **Feature-specific highlighting**: Highlight only splits for specific features (e.g., show only "pclass" decisions)
2. **Animated transitions**: Smooth animations when switching between highlight modes
3. **Interactive expansion**: Click to expand/collapse specific branches
4. **Filtered view**: Show only highlighted portions, hide inactive branches
5. **Three-way comparison**: Support comparing 3 cohorts with different colors
6. **Path tooltips**: Show detailed information when hovering over paths
7. **Export visualization**: Save current visualization as image

---

## Related Documentation

- **COHORT_COMPARISON_FEATURE.md**: Details on comparison system and chat integration
- **TUTORIAL_FEATURE.md**: Tutorial system using selective highlighting
- **FIXED_CHAT_LAYOUT.md**: Chat panel integration with visualizations
