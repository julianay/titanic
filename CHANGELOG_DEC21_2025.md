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
  Try asking:
  [Show me a woman...] [What about...] [Compare women...]
  ```

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
    │   └── ChatPanel.jsx (chip styling, inline tutorial)
    └── hooks/
        └── useTutorial.js (tutorial message metadata)
```

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

## Migration Notes

No breaking changes. Both layouts coexist:
- Existing deployment continues to work at root URL
- New alternative layout available at `/index-alt.html`
- All API endpoints and backend remain unchanged
