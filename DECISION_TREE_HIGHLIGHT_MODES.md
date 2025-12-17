# Decision Tree Selective Highlighting Feature

## Overview

The `DecisionTreeViz` component now supports selective path highlighting through the `highlightMode` prop. This allows you to highlight only specific portions of the decision tree path instead of the full path from root to leaf.

## Feature Details

### 1. Variable Stroke Widths ✅
**Already implemented!** Edge thickness automatically scales based on the number of passengers in each branch using a square root scale (1-32px range).

### 2. Selective Path Highlighting ✅
**Now implemented!** Control which parts of the decision path are highlighted.

## Usage

### Props

```jsx
<DecisionTreeViz
  treeData={treeData}
  passengerValues={passengerData}
  highlightMode="first_split"  // NEW: Controls highlighting behavior
/>
```

### `highlightMode` Options

| Value | Description | Visual Effect |
|-------|-------------|---------------|
| `null` or `"full"` | Full path highlighting (default) | Highlights entire path from root to final leaf node with color-coded paths (green for survived, orange for died) |
| `"first_split"` | First split only | Highlights only the root node and first child (e.g., for gender split: root → male/female branch) |
| `1`, `2`, `3`, ... (number) | First N levels | Highlights first N levels of the tree (e.g., `1` = root + first level, `2` = root + first two levels) |

### Visual Styling

- **Normal Mode** (`null` or `"full"`):
  - Active nodes: opacity 1.0, white glow
  - Links: Color-coded (green = survived path, orange = died path)
  - Final node: pulsing animation

- **Tutorial/Selective Mode** (any other value):
  - Active nodes: gold glow effect
  - Links: Gold color (#ffd700) with 8px width
  - Labels: Gold text color
  - Stronger visual emphasis for educational/tutorial purposes

## Examples

### Example 1: Highlight First Gender Split Only

```jsx
import DecisionTreeViz from './components/visualizations/DecisionTreeViz'

function MyComponent() {
  const [passengerData, setPassengerData] = useState({
    sex: 0,      // Female
    pclass: 1,   // 1st class
    age: 30,
    fare: 84
  })

  return (
    <DecisionTreeViz
      treeData={treeData}
      passengerValues={passengerData}
      highlightMode="first_split"  // Shows only root → gender split
    />
  )
}
```

**Use Case**: When teaching users about how gender affects survival, show only the first split to avoid overwhelming them with the full tree.

### Example 2: Progressive Depth Exploration

```jsx
function TutorialTreeView() {
  const [depth, setDepth] = useState(1)

  return (
    <>
      <button onClick={() => setDepth(d => d + 1)}>Show Next Level</button>

      <DecisionTreeViz
        treeData={treeData}
        passengerValues={passengerData}
        highlightMode={depth}  // Progressively reveal more of the tree
      />
    </>
  )
}
```

**Use Case**: Tutorial mode that progressively reveals decision tree levels as users advance.

### Example 3: Feature-Specific Highlighting

```jsx
function FeatureExplorer() {
  const [selectedFeature, setSelectedFeature] = useState('sex')

  // Map feature to appropriate highlight depth
  const getHighlightMode = (feature) => {
    if (feature === 'sex') return 'first_split'  // Gender is first split
    if (feature === 'pclass') return 2            // Class appears in level 2
    return 'full'                                 // Show all for other features
  }

  return (
    <>
      <select onChange={(e) => setSelectedFeature(e.target.value)}>
        <option value="sex">Gender Impact</option>
        <option value="pclass">Class Impact</option>
        <option value="full">Full Analysis</option>
      </select>

      <DecisionTreeViz
        treeData={treeData}
        passengerValues={passengerData}
        highlightMode={getHighlightMode(selectedFeature)}
      />
    </>
  )
}
```

**Use Case**: Let users explore how different features affect survival by highlighting relevant portions of the tree.

## Integration with Existing Code

To add this to `ModelComparisonView.jsx`:

```jsx
// Before:
<DecisionTreeViz
  treeData={treeData.tree}
  passengerValues={passengerData}
/>

// After (with highlight control):
<DecisionTreeViz
  treeData={treeData.tree}
  passengerValues={passengerData}
  highlightMode={highlightMode}  // Add state to control this
/>
```

## Implementation Details

### File Modified
- `/frontend/src/components/visualizations/DecisionTreeViz.jsx`

### Key Functions

1. **`getLimitedPath(fullPath)`**: Limits the path based on `highlightMode`
   - Returns subset of node IDs to highlight
   - Called before applying highlights

2. **`updateTreeHighlight(path, isTutorialMode)`**: Applies CSS classes to nodes/links
   - Uses `tutorial-highlight` class for selective modes (gold styling)
   - Uses `active` class for full path mode (color-coded styling)

3. **CSS Classes**:
   - `.active`: Standard path highlighting (green/orange based on outcome)
   - `.tutorial-highlight`: Gold highlighting for selective/educational mode
   - `.hover-active`: Temporary gold highlight during mouse hover
   - `.final`: Pulsing animation for final leaf node (full mode only)

## Technical Notes

- Stroke width scaling uses `d3.scaleSqrt()` for proportional representation
- Tutorial mode disables survival/died color coding to maintain focus
- Hover effects work independently of highlight mode
- React hooks automatically update highlighting when `passengerValues` or `highlightMode` change

## Future Enhancements

Potential additions:
1. Highlight specific features (e.g., only show splits for 'sex' or 'pclass')
2. Animated transitions between highlight modes
3. Click to expand/collapse specific branches
4. Filter view to show only highlighted portions
