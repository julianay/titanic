# Changelog - December 21, 2025

## Alternative Layout Implementation

### Overview
Created an alternative page layout to compare side-by-side with the original 80/20 split layout. This allows users to view both layouts simultaneously in different browser tabs/windows.

### Multi-Page Setup
- **Added**: `index-alt.html` - Alternative layout entry point
- **Added**: `main-alt.jsx` - Alternative entry point script
- **Added**: `AppAlt.jsx` - Alternative app component
- **Updated**: `vite.config.js` - Multi-page configuration for both layouts
  ```javascript
  input: {
    main: resolve(__dirname, 'index.html'),
    alt: resolve(__dirname, 'index-alt.html'),
  }
  ```

### Alternative Layout Features

#### Layout Structure
- **Decision Tree**: Full width at top with horizontal (left-to-right) orientation
- **XGBoost Section**: Cards displayed in a row below the tree
  - **No comparison mode**: 2 cards side-by-side (Feature Contributions + Global Importance)
  - **Comparison mode**: 2 comparison waterfalls side-by-side, Global Importance full-width underneath

#### New Components
- **Added**: `ModelComparisonViewAlt.jsx`
  - Vertical stacking layout
  - Decision tree on top (full width)
  - XGBoost visualizations in row layout below
  - Removed h3 sub-headers from XGBoost cards
  - Moved cohort labels to main section header when in comparison mode

- **Added**: `DecisionTreeVizHorizontal.jsx`
  - Horizontal (left-to-right) tree orientation
  - Uses `d3.linkHorizontal()` instead of `d3.linkVertical()`
  - Swapped x/y coordinates for horizontal layout
  - Disabled scroll wheel zoom (pan by dragging still works)
  - Leaf node labels positioned to the right
  - Internal node labels positioned above

#### Styling Changes
- **Tree Card**:
  - Height: 420px (20% taller than initial 350px)
  - Padding: `pt-6 px-6 pb-2` (reduced bottom padding for more SVG space)

- **XGBoost Cards**:
  - Removed "Feature Contributions" h3 header
  - Removed "Global Feature Importance" h3 header (non-comparison mode)
  - Added cohort labels to main section title in comparison mode:
    ```
    XGBoost (SHAP) Explanation [Cohort A] vs [Cohort B]
    ```

### Accessing Both Layouts
- **Original Layout**: `http://localhost:5176/`
- **Alternative Layout**: `http://localhost:5176/index-alt.html`

Both pages share the same backend API and controls for easy comparison.

---

## Chat Panel Improvements

### Preset Chips Redesign
- **Changed**: "Try asking" suggestion buttons now styled as chips (rounded-full pills)
- **Removed**: Preset chips (Women's path, Men's path, 1st class child, 3rd class male)
  - Reason: Redundant with "Try asking" suggestions

### Visual Changes
- **Before**: Stacked button layout
  ```
  Try asking:
  [Show me a woman in 1st class     ]
  [What about a 3rd class male?     ]
  [Compare women vs men             ]
  ```

- **After**: Chip layout
  ```
  Try asking:                                          hide
  [Show me a woman...] [What about...] [Compare women...]
  [📚 Start Tutorial]
  ```

### Suggestion Chips Visibility Behavior
- **Fixed**: Chips no longer disappear when tutorial messages appear
- **Changed**: Chips remain visible during tutorial and when clicking suggestion chips
- **Smart Hide**: Chips only disappear after user types and submits their own custom message
  - Clicking suggestion chips = exploration (chips stay)
  - Typing custom message = user understands interface (chips hide)
- **Added**: Show/hide toggle link next to "Try asking" label
  - Click "hide" to collapse chips and maximize chat space
  - Click "show" to bring chips back
  - Toggle state persists during session
  - "Try asking" label and border remain visible when hidden

---

## Tutorial Improvements

### Inline Tutorial Controls
- **Removed**: `TutorialControls.jsx` blue box component
- **Changed**: Tutorial controls now appear inline in chat messages
- **Added**: Tutorial message type in chat system
  ```javascript
  {
    role: 'assistant',
    type: 'tutorial',
    content: "Welcome to...",
    step: 0,
    isLastStep: false
  }
  ```

### Tutorial Flow
- Tutorial messages appear as regular chat messages
- Next/Skip buttons display directly below tutorial message text
- No separate blue box or progress indicator
- Cleaner, more integrated user experience

### Testing Support
- **Added**: "📚 Start Tutorial" chip in empty chat state
- Makes it easy to trigger tutorial for testing (especially on platforms like Hugging Face)
- Appears alongside "Try asking" suggestions

### Updated Components
- **Modified**: `ChatPanel.jsx`
  - Added tutorial message rendering
  - Inline button controls for Next/Skip
  - Props: `onTutorialAdvance`, `onTutorialSkip`, `onTutorialStart`

- **Modified**: `useTutorial.js`
  - Tutorial messages include type and step metadata
  - `startTutorial()` now adds tutorial-type message
  - `advanceTutorial()` adds tutorial-type message for each step

- **Modified**: `App.jsx` and `AppAlt.jsx`
  - Removed TutorialControls component
  - Pass tutorial functions to ChatPanel instead

---

## Technical Details

### Files Created
```
frontend/
├── index-alt.html
├── src/
│   ├── AppAlt.jsx
│   ├── main-alt.jsx
│   └── components/
│       ├── ModelComparisonViewAlt.jsx
│       └── visualizations/
│           └── DecisionTreeVizHorizontal.jsx
```

### Files Modified
```
frontend/
├── vite.config.js (multi-page config)
└── src/
    ├── App.jsx (removed TutorialControls)
    ├── components/
    │   └── ChatPanel.jsx (chip styling, inline tutorial, smart visibility, show/hide toggle)
    └── hooks/
        └── useTutorial.js (tutorial message metadata)
```

### ChatPanel.jsx Implementation Details
**State Management:**
- `hasTypedMessage` (line 50): Tracks if user has typed their own message
  - Set to `true` only when user submits via input field (line 63)
  - Does NOT change when clicking suggestion chips
- `chipsVisible` (line 51): Controls show/hide toggle state
  - Persists during session (not in localStorage)
  - Default: `true` (chips visible)

**Visibility Logic:**
- `shouldShowChips = !hasTypedMessage` (line 105)
  - Shows chips during tutorial (tutorial messages don't set hasTypedMessage)
  - Shows chips when clicking suggestions (chip clicks don't set hasTypedMessage)
  - Hides chips only after user types custom message

**Show/Hide Toggle:**
- Small underlined link next to "Try asking:" (lines 174-179)
- Toggles `chipsVisible` state on click
- Text changes: "hide" → "show" → "hide"
- Wraps chips in conditional render (lines 182-209)

### Files Removed (from layout)
- TutorialControls component no longer used in App/AppAlt (file still exists but not imported)

---

## Layout Comparison Summary

| Feature | Original Layout | Alternative Layout |
|---------|----------------|-------------------|
| Tree Orientation | Vertical (top-to-bottom) | Horizontal (left-to-right) |
| Tree Position | Left column (70%) | Full width on top |
| Tree Height | 700px | 420px |
| XGBoost Position | Right column (30%) | Full width below tree |
| XGBoost Layout | Stacked vertically | Cards in row |
| Comparison Mode | 2 waterfalls stacked | 2 waterfalls side-by-side |
| Scroll Zoom | Enabled | Disabled |
| Right Sidebar | 20% width | 20% width |

---

## User Experience Improvements

1. **Layout Flexibility**: Users can choose their preferred layout orientation
2. **Side-by-Side Comparison**: Open both URLs in separate browser tabs to compare layouts
3. **Cleaner Chat**: Tutorial controls integrated into message flow instead of separate box
4. **Simplified Presets**: Single set of chip-styled suggestions instead of duplicate buttons
5. **Testing Access**: Easy tutorial restart via dedicated chip button
6. **Better Tree Visibility**: Horizontal orientation may be more familiar to users from original design

---

## Future Considerations

### Potential Enhancements
- Add layout toggle switch to dynamically change between layouts without separate URLs
- Persist user's preferred layout in localStorage
- Add responsive breakpoints for mobile/tablet views
- Consider making tree orientation a user preference

### Known Behaviors
- Tutorial buttons in old messages become non-functional after tutorial completes
  - This is expected behavior to prevent duplicate tutorial states
  - Use "📚 Start Tutorial" chip to restart

---

## Centralized Color System

### Overview
Refactored all visualization and UI colors into a single centralized configuration file for consistency and easy maintenance.

### Color Palette Unification
- **Created**: `frontend/src/utils/visualizationColors.js`
  - Single source of truth for all colors across the application
  - Comprehensive documentation and quick reference guide
  - Used by 7 components (4 visualizations + 3 UI cards)

### Color Scheme
All components now use a consistent color palette:

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Survived / Positive | Light Green | `#B8F06E` | Tree pie charts, SHAP positive impact, UI cards |
| Died / Negative | Orange | `#F09A48` | Tree pie charts, SHAP negative impact, UI cards |
| Tutorial/Highlight | Gold | `#ffd700` | Tutorial mode, hover states |
| Uncertain (UI only) | Yellow | `#fbbf24` | Medium probability predictions |

### Exported Constants

#### TREE_COLORS
- `died` / `survived` - Main class colors
- `tutorial` / `hover` - Highlighting colors
- `comparisonA` / `comparisonB` / `comparisonShared` - Comparison mode paths
- `defaultStroke` / `nodeStroke` / `textDefault` / `background` - UI elements
- `tooltipBg` / `tooltipText` - Tooltip styling

#### SHAP_COLORS
- `positive` / `positiveStroke` - Green (same as survived)
- `negative` / `negativeStroke` - Orange (same as died)
- `highlight` / `highlightGlow` - Gold highlighting
- `text` / `barDefault` - Text and bar colors

#### UI_COLORS
- `survivedText` / `survivedBg` / `survivedBorder` - High probability cards
- `diedText` / `diedBg` / `diedBorder` - Low probability cards
- `uncertainText` / `uncertainBg` / `uncertainBorder` - Medium probability cards
- `cardBg` / `cardBorder` / `textPrimary` / `textSecondary` / `textMuted` - General UI

#### TREE_EFFECTS
Drop shadow effects for different states (active, final, tutorial, hover, comparison)

#### TREE_OPACITY
Opacity values for inactive (0.4), hover (0.85), and active (1) states

### Updated Components

**Visualizations:**
- `DecisionTreeViz.jsx` - Vertical tree layout
- `DecisionTreeVizHorizontal.jsx` - Horizontal tree layout
- `SHAPWaterfall.jsx` - SHAP waterfall chart
- `GlobalFeatureImportance.jsx` - Feature importance bars

**UI Cards:**
- `PredictionCard.jsx` - Main prediction cards
- `SinglePredictionCard.jsx` - Chat prediction cards
- `ComparisonCard.jsx` - Cohort comparison cards

### Key Changes

1. **Comparison Mode Colors**
   - Changed from blue/coral to green/orange (survived/died colors)
   - Path A uses survived color (#B8F06E)
   - Path B uses died color (#F09A48)
   - Shared paths use gold (#ffd700)
   - Makes comparison semantically meaningful

2. **SHAP Color Alignment**
   - Positive impact bars now match survived color
   - Negative impact bars now match died color
   - Creates visual consistency: green = survived, orange = died

3. **UI Card Consistency**
   - All prediction cards use the same colors as visualizations
   - "Survived" text/borders match tree visualization green
   - "Died" text/borders match tree visualization orange
   - Unified experience across all components

### Benefits

- **Easy Maintenance**: Change any color in one place, updates everywhere
- **Consistency**: Same colors across all visualizations and UI elements
- **Semantic Meaning**: Colors have consistent meaning (green = positive/survived, orange = negative/died)
- **Documentation**: Comprehensive comments explain each color's purpose
- **Scalability**: Easy to add new colors or adjust existing palette

### Example Usage

```javascript
import { TREE_COLORS, SHAP_COLORS, UI_COLORS } from '../utils/visualizationColors'

// Use in D3 visualizations
.attr("fill", TREE_COLORS.survived)

// Use in React components with inline styles
style={{ color: UI_COLORS.survivedText }}
```

---

## Migration Notes

No breaking changes. Both layouts coexist:
- Existing deployment continues to work at root URL
- New alternative layout available at `/index-alt.html`
- All API endpoints and backend remain unchanged
