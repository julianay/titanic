# Coding Assistant Guide

**Purpose**: Help coding assistants (GitHub Copilot, Cursor, etc.) make changes efficiently
**Last Updated**: January 3, 2026 (Codebase Cleanup & UI Refinements)

This guide provides step-by-step patterns for common tasks. Follow these exactly to avoid breaking things.

---

## Table of Contents

1. [Important: About This Guide](#important-about-this-guide)
2. [Project Structure](#project-structure)
3. [Before You Start](#before-you-start)
4. [Common Tasks](#common-tasks)
5. [Styling Guide](#styling-guide)
6. [Component Patterns](#component-patterns)
7. [Complex Areas (Proceed with Care)](#complex-areas-proceed-with-care)
8. [Testing & Building](#testing--building)
9. [Troubleshooting](#troubleshooting)

---

## Important: About This Guide

### How to Use This Guide

This guide is designed to make your work **easier and more efficient**, not to limit what you can do.

**If you have access to Claude (advanced AI assistant)**:
- Use this guide to handle routine tasks yourself (colors, spacing, buttons, etc.)
- Escalate complex tasks to Claude for efficiency (architectural changes, D3 visualizations, etc.)
- This saves Claude for the hard problems and lets you handle quick wins

**If Claude is NOT available**:
- You can still attempt ALL tasks, including complex ones
- The "ask for help" sections are guidance about **difficulty**, not hard restrictions
- For complex tasks when working alone:
  1. **Read more context** - Study surrounding code and related files
  2. **Make smaller changes** - Test frequently, iterate carefully
  3. **Use git** - Commit often so you can easily revert (`git checkout -- file.jsx`)
  4. **Expect iteration** - Complex tasks may take multiple attempts
  5. **Test thoroughly** - Build after every change, check console for errors

### What's "Simple" vs "Complex"

**Simple** (Quick, low risk):
- Changing colors, spacing, text sizes
- Adding buttons or UI elements following existing patterns
- Modifying slider ranges or default values
- Adding preset chips
- Adjusting layout spacing

**Complex** (Requires more care):
- Modifying D3 visualization logic
- Changing state management flow
- Altering API contracts or data structures
- Touching natural language parsing
- Restructuring component hierarchy

**The key difference**: Simple tasks have clear patterns you can copy. Complex tasks require understanding how multiple parts interact.

### Philosophy

This guide provides:
- ✅ **Clear patterns** for common tasks (copy these!)
- ✅ **Context** about file purposes and interactions
- ✅ **Warnings** about tricky areas (not prohibitions)
- ✅ **Examples** you can adapt

It doesn't:
- ❌ Forbid you from touching any file
- ❌ Require Claude for any task
- ❌ Limit your problem-solving

**Bottom line**: Use the guidance to work smarter. The complexity ratings help you assess risk and allocate time, whether Claude is available or not.

---

## Project Structure

```
/frontend/src/
├── App.jsx                      # Main app, state management
├── main.jsx                     # Application entry point
├── components/
│   ├── Layout.jsx              # Fixed split-screen layout
│   ├── ChatPanel.jsx           # Chat interface with smart chip visibility
│   ├── WhatIfCard.jsx          # Interactive what-if parameter controls
│   ├── WhatIfModal.jsx         # Modal wrapper for WhatIfCard
│   ├── ComparisonCard.jsx      # Side-by-side cohort comparison
│   ├── ModelComparisonView.jsx # Main visualization layout
│   ├── TutorialControls.jsx    # Tutorial UI (legacy - no longer used)
│   └── visualizations/
│       ├── DecisionTreeViz.jsx # Vertical D3 tree visualization
│       ├── DecisionTreeVizHorizontal.jsx # Horizontal tree visualization
│       ├── SHAPWaterfall.jsx   # SHAP feature importance
│       ├── GlobalFeatureImportance.jsx # Global importance bars
│       ├── PredictionCard.jsx  # Survival prediction card
│       ├── SinglePredictionCard.jsx # Chat prediction card
│       └── ComparisonCard.jsx  # Cohort comparison card
├── hooks/
│   ├── useTutorial.js          # Tutorial state management
│   └── useInitialAnimation.js  # Initial page animation
└── utils/
    ├── cohortPatterns.js       # Natural language parsing
    ├── visualizationStyles.js  # Centralized visualization styling
    └── uiStyles.js             # Centralized UI styling

/backend/
├── app.py                       # Flask API server
└── models/                      # Trained ML models
```

**Key Files You'll Touch Most**:
- `Layout.jsx` - Layout structure
- `ChatPanel.jsx` - Chat UI
- `WhatIfCard.jsx` - Interactive parameter controls
- `WhatIfModal.jsx` - Modal wrapper for what-if controls
- `App.jsx` - State management (be careful!)

**Files to Avoid Unless Necessary**:
- `DecisionTreeViz.jsx` - Complex D3 code
- `useTutorial.js` - Complex state logic
- `cohortPatterns.js` - NLP parsing logic

---

## Before You Start

### 1. Read the File First

**ALWAYS** read the entire file before making changes. Don't assume structure.

```bash
# Use Read tool to view file
Read: /Users/julyamas/Documents/Projects/hf/titanic/frontend/src/components/FileName.jsx
```

### 2. Understand the Layout

The app has a **fixed split-screen layout**:
- **Left (80%)**: Visualizations (scrolls)
- **Right (20%)**: Chat interface (fixed)

```
┌──────────────────────────────┬──────────┐
│  Header (scrolls)            │   Chat   │
│  Visualizations              │   (fixed)│
│  - Decision Tree (70%)       │          │
│  - XGBoost (30%)             │ Messages │
│  (scroll down)               │ (scroll) │
│                              │          │
│                              │ Input    │
└──────────────────────────────┴──────────┘
```

**What-If controls** appear in a modal overlay when user clicks "🔮 What If?" chip.

### 3. Test After Changes

**Always** build after making changes:
```bash
cd /Users/julyamas/Documents/Projects/hf/titanic/frontend
npm run build
```

If build fails, revert your changes.

---

## Common Tasks

### Task 1: Change Colors

**Example**: Change primary blue color

**Step 1**: Identify current color
- Primary blue: `#218FCE`
- Used in: buttons, hover states, accents

**Step 2**: Find all occurrences
```bash
# Use Grep tool
Grep: pattern="#218FCE", path="frontend/src"
```

**Step 3**: Replace systematically
```jsx
// Before
className="bg-[#218FCE]"

// After (example: change to purple)
className="bg-[#9333ea]"
```

**Step 4**: Test
```bash
npm run build
```

**Files likely to contain color**:
- `ControlPanel.jsx`
- `ChatPanel.jsx`
- `TutorialControls.jsx`
- Any button components

---

### Task 2: Adjust Spacing/Padding

**Example**: Add more space between chat messages

**Step 1**: Read ChatPanel.jsx
```jsx
// Find the messages container
<div className="flex-1 overflow-y-auto space-y-3 mb-4">
  {/* messages */}
</div>
```

**Step 2**: Identify spacing class
- `space-y-3` means 0.75rem (12px) vertical spacing
- Tailwind scale: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px

**Step 3**: Change class
```jsx
// Before
<div className="flex-1 overflow-y-auto space-y-3 mb-4">

// After (more spacing)
<div className="flex-1 overflow-y-auto space-y-4 mb-4">
```

**Common spacing classes**:
- `p-6` - padding all sides (24px)
- `px-4` - padding left+right (16px)
- `py-2` - padding top+bottom (8px)
- `mb-3` - margin bottom (12px)
- `space-y-4` - gap between children (16px)

---

### Task 3: Change Text Size

**Example**: Make chat messages larger

**Step 1**: Find text element
```jsx
<div className="text-sm text-gray-300">
  {msg.content}
</div>
```

**Step 2**: Change size class
```jsx
// Before
<div className="text-sm text-gray-300">

// After
<div className="text-base text-gray-300">
```

**Tailwind text sizes**:
- `text-xs` - 12px (very small)
- `text-sm` - 14px (small)
- `text-base` - 16px (normal)
- `text-lg` - 18px (large)
- `text-xl` - 20px (extra large)
- `text-2xl` - 24px (heading)

---

### Task 4: Add a New Button

**Example**: Add a "Clear Chat" button

**Step 1**: Choose location
- ChatPanel.jsx is the right place

**Step 2**: Copy existing button pattern
```jsx
// Find existing button (e.g., Send button)
<button
  type="submit"
  disabled={!inputValue.trim()}
  className="px-4 py-2 text-sm bg-[#218FCE] text-white rounded hover:bg-[#1a7ab8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
  Send
</button>

// Copy and modify
<button
  onClick={handleClearChat}  // You need to add this function
  className="px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
>
  Clear
</button>
```

**Step 3**: Add handler function
```jsx
// Inside ChatPanel function, before return statement
const handleClearChat = () => {
  // This depends on how messages are managed
  // Usually need to call a prop function from parent
  if (onClearMessages) {
    onClearMessages()
  }
}
```

**Step 4**: Add prop to component
```jsx
// Update function signature
function ChatPanel({ messages, onSendMessage, onClearMessages }) {
  // ...
}
```

**Step 5**: Update App.jsx to pass the prop
```jsx
// In App.jsx
const handleClearMessages = () => {
  setChatMessages([])
}

// In JSX
<ChatPanel
  messages={chatMessages}
  onSendMessage={handleSendMessage}
  onClearMessages={handleClearMessages}
/>
```

---

### Task 5: Add What-If Control Options

**Example**: Add a new slider or control to WhatIfCard

**Step 1**: Read WhatIfCard.jsx
```bash
Read: /Users/julyamas/Documents/Projects/hf/titanic/frontend/src/components/WhatIfCard.jsx
```

**Step 2**: Find existing slider pattern
```jsx
// Example: Age slider
<input
  type="range"
  min="0"
  max="80"
  value={values.age}
  onChange={(e) => onChange('age', parseFloat(e.target.value))}
/>
```

**Step 3**: Copy and modify for your new control
- Follow existing patterns exactly
- Use `parseFloat` for numeric values (backend expects floats)
- Update onChange handler with correct field name

---

### Task 6: Understanding Default State & Passenger Values

**Default Initial State** (as of Dec 21, 2025):
```jsx
// App.jsx
const [passengerData, setPassengerData] = useState({
  sex: 0,       // 0 = Female, 1 = Male
  pclass: 1,    // 1, 2, or 3 (1st class)
  age: 8,       // 8-year-old child
  fare: 84      // Standard 1st class fare
})
```

**Why these values**:
- **Age 8 (child)**: Differentiates from tutorial (30-year-old) and preset buttons
- **Fare £84**: Standard 1st class fare (matches historical average, prevents strange SHAP values)
- Never use unusual fares (e.g., £50 for 1st class) - causes confusing model explanations

**Suggested Fares by Class** (from ControlPanel.jsx):
- 1st class: £84
- 2nd class: £20
- 3rd class: £13

**When changing default state**:
1. Update `App.jsx`
2. Update the initial chat messages (showing passenger description)
3. Keep fare aligned with class to avoid model confusion

---

### Task 7: Modify Slider Range

**Example**: Change age slider from 0-80 to 0-100

**Step 1**: Find slider in WhatIfCard.jsx
```jsx
<input
  type="range"
  min="0"
  max="80"
  value={values.age}
  onChange={(e) => onChange('age', parseInt(e.target.value))}
  // ...
/>
```

**Step 2**: Change max value
```jsx
<input
  type="range"
  min="0"
  max="100"  // Changed from 80
  value={values.age}
  onChange={(e) => onChange('age', parseInt(e.target.value))}
  // ...
/>
```

**Step 3**: Update display text
```jsx
// Find the scale labels below slider
<div className="flex justify-between text-xs text-gray-500 mt-1">
  <span>0</span>
  <span>100</span>  // Changed from 80
</div>
```

**Step 4**: Update gradient calculation
```jsx
// Find the background style
style={{
  background: `linear-gradient(to right, #218FCE 0%, #218FCE ${(values.age / 100) * 100}%, #374151 ${(values.age / 100) * 100}%, #374151 100%)`
  // Changed /80 to /100 in both places
}}
```

---

### Task 7: Add a New Suggestion Chip

**Example**: Add a "show me an elderly passenger" suggestion

**Step 1**: Find suggestionButtons array in ChatPanel.jsx (around line 98)
```jsx
const suggestionButtons = [
  "Show me a woman in 1st class",
  "What about a 3rd class male?",
  "Compare women vs men"
]
```

**Step 2**: Add new suggestion
```jsx
const suggestionButtons = [
  "Show me a woman in 1st class",
  "What about a 3rd class male?",
  "Compare women vs men",
  "Show me an elderly passenger"  // NEW
]
```

**Natural Language Support**:
The suggestion will be parsed by `parsePassengerQuery()` in `cohortPatterns.js`:
- "woman/female" → `sex: 0`
- "man/male" → `sex: 1`
- "1st/first class" → `pclass: 1`
- "2nd/second class" → `pclass: 2`
- "3rd/third class" → `pclass: 3`
- "child/young" → `age: 5`
- "elderly/old" → `age: 70`

**That's it!** Chip will appear automatically and clicking it will parse the query.

---

### Task 8: Modify ChatPanel Chip Visibility Behavior

**Current Behavior** (as of Dec 21, 2025):
- Chips stay visible during tutorial and when clicking suggestion chips
- Chips only hide after user types and submits their own custom message
- Show/hide toggle allows users to collapse chips for more space

**How It Works**:
- `hasTypedMessage` state (line 50): Tracks if user has typed their own message
  - Set to `true` only in `handleSubmit` when user types in input field
  - NOT affected by clicking suggestion chips or tutorial
- `chipsVisible` state (line 51): Controls show/hide toggle
  - Default: `true`
  - Toggled by clicking "hide/show" link

**Example: Make chips always visible (never auto-hide)**:

**Step 1**: Find the visibility logic in ChatPanel.jsx (line 105)
```jsx
// Show chips until user types their own message (clicking chips doesn't count)
const shouldShowChips = !hasTypedMessage
```

**Step 2**: Change to always show:
```jsx
// Always show chips (never auto-hide)
const shouldShowChips = true
```

**Example: Make chips disappear immediately after any interaction**:

**Step 1**: Modify the condition (line 105)
```jsx
// Hide chips after any message (tutorial, clicks, or typed)
const shouldShowChips = messages.length === 0
```

**Example: Hide chips after clicking any chip**:

**Step 1**: Find the chip click handler around line 188
```jsx
onClick={() => {
  const parsedParams = parsePassengerQuery(suggestion)
  if (parsedParams) {
    onSendMessage(suggestion, parsedParams)
  }
}}
```

**Step 2**: Add setHasTypedMessage
```jsx
onClick={() => {
  const parsedParams = parsePassengerQuery(suggestion)
  if (parsedParams) {
    setHasTypedMessage(true)  // NEW - hide chips after clicking
    onSendMessage(suggestion, parsedParams)
  }
}}
```

---

### Task 9: Change Layout Column Widths

**Example**: Make chat wider (40% instead of 30%)

**Step 1**: Find Layout.jsx column definitions
```jsx
// Left column
<div className="w-[70%]">

// Right column
<aside className="w-[30%] ... fixed right-0">
```

**Step 2**: Change both widths (must add to 100%)
```jsx
// Left column - now 60%
<div className="w-[60%]">

// Right column - now 40%
<aside className="w-[40%] ... fixed right-0">
```

**Important**: Both must add to 100%!
- 70% + 30% = 100% ✓
- 60% + 40% = 100% ✓
- 75% + 30% = 105% ✗ (broken!)

---

## Styling Guide

### Tailwind CSS Classes

This project uses **Tailwind CSS**. No custom CSS files.

**Color Palette**:
- Background: `bg-[#0e1117]` (dark gray)
- Border: `border-gray-800` (medium gray)
- Text: `text-gray-300` (light gray)
- Primary: `bg-[#218FCE]` (blue)
- Accent: `text-[#a0a0a0]` (muted gray)

**Button Pattern**:
```jsx
<button className="px-4 py-2 text-sm bg-[#218FCE] text-white rounded hover:bg-[#1a7ab8] disabled:opacity-50 transition-colors">
  Button Text
</button>
```

**Input Pattern**:
```jsx
<input className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-[#218FCE] text-gray-100 placeholder-gray-500" />
```

**Card Pattern**:
```jsx
<div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
  Card content
</div>
```

**Chip Pattern** (rounded pill button):
```jsx
<button className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-full hover:bg-[#218FCE] hover:bg-opacity-20 hover:text-[#218FCE] transition-colors">
  Chip Text
</button>
```

### Visualization Color System

**⚠️ CRITICAL RULE: Tree Path Colors ALWAYS Reflect Leaf Values** (Dec 21, 2025):

All decision tree path colors are determined by the prediction outcome, NOT by mode or cohort:
- **Green (#B8F06E)**: Path leads to "Survived" (class 1)
- **Orange (#F09A48)**: Path leads to "Died" (class 0)

This applies across ALL modes:
- ✅ Single-path mode - Path colored by prediction
- ✅ Comparison mode - Each cohort path colored by its outcome (not blue/orange)
- ✅ Tutorial/highlight mode - Highlighted portions colored by outcome (not gold)

**Implementation files**:
- `DecisionTreeViz.jsx` - Lines 132-147 (single path), 253-324 (comparison)
- `DecisionTreeVizHorizontal.jsx` - Lines 125-140 (single path), 240-310 (comparison)
- `visualizationStyles.js` - Color constants and documentation

**Why this matters**:
If you're modifying tree visualization or adding new highlighting modes, preserve this rule. Path colors = leaf outcome colors provides consistent visual language across the entire app.

**Color Reference** (from `visualizationStyles.js`):
- Survived/Positive: `#B8F06E` (light green)
- Died/Negative: `#F09A48` (orange)
- Tutorial/Highlight: `#ffd700` (gold) - for nodes/labels, NOT path strokes
- Shared paths: `#ffd700` (gold) - for comparison mode shared segments

**If you need to add new path highlighting**:
1. Always apply both the mode class (e.g., `.path-a`) AND the outcome class (`.survived` or `.died`)
2. CSS rules ensure outcome colors override mode colors (see `!important` rules in tree components)
3. Test in all three modes: single, comparison, and tutorial

---

## Component Patterns

### React State Pattern

```jsx
// Import useState
import { useState } from 'react'

// Declare state
const [value, setValue] = useState(initialValue)

// Update state
setValue(newValue)

// Update based on previous state
setValue(prev => prev + 1)
```

### Props Pattern

```jsx
// Receiving props
function MyComponent({ propName, anotherProp }) {
  return <div>{propName}</div>
}

// Passing props
<MyComponent propName="value" anotherProp={123} />
```

### Conditional Rendering

```jsx
// Show/hide based on condition
{isVisible && <div>Content</div>}

// Ternary
{isActive ? <ActiveView /> : <InactiveView />}
```

### List Rendering

```jsx
// Map over array
{items.map((item, idx) => (
  <div key={idx}>{item.name}</div>
))}
```

### Event Handlers

```jsx
// Click handler
<button onClick={handleClick}>Click</button>

// With parameter
<button onClick={() => handleClick(id)}>Click</button>

// Form submit
<form onSubmit={handleSubmit}>
```

---

## Complex Areas (Proceed with Care)

These areas require more careful attention due to their complexity. You CAN modify them, but read the context carefully first and test thoroughly.

### ⚠️ Complex Visualizations

**Files**:
- `/frontend/src/components/visualizations/DecisionTreeViz.jsx`
- `/frontend/src/components/visualizations/SHAPWaterfall.jsx`

**Complexity**: High - Uses D3.js with complex SVG manipulation, data binding, and transitions.

**Safe to change**:
- Tailwind CSS classes on outer containers
- Color values in style objects
- Size constants (width, height)
- Text labels and titles

**Requires understanding**:
- D3 selection and data binding (`.selectAll()`, `.data()`, `.join()`)
- SVG coordinate systems and transforms
- Data transformation pipelines
- Animation/transition logic

**Before changing**: Read D3.js documentation, understand the data flow, test incrementally.

---

### ⚠️ State Management in App.jsx

**Complexity**: Medium - Central hub where all state and callbacks connect.

**Safe to change**:
- Initial state values (`useState` defaults)
- Simple new state variables
- Props being passed to components

**Requires understanding**:
- `handleSendMessage` logic (orchestrates chat, parsing, state updates)
- Tutorial integration (multiple components coordinate)
- Preset handlers (update multiple state variables)
- How state flows from App → components

**Before changing**: Trace data flow, understand what each callback does, use `console.log` to debug.

**Tip**: If your change involves more than 3 state variables or callbacks, break it into smaller steps.

---

### ⚠️ Natural Language Processing

**File**: `/frontend/src/utils/cohortPatterns.js`

**Complexity**: Medium - Regex patterns and parsing logic.

**Safe to change**:
- Adding new comparison patterns (copy existing pattern structure exactly)
- Changing cohort response text
- Adjusting preset parameters (sex, pclass, age, fare)

**Requires understanding**:
- `parsePassengerQuery` logic (extracts parameters from text)
- `detectComparison` logic (matches comparison patterns)
- Regex syntax (be careful with escaping: `\b`, `\d+`, etc.)

**Before changing**: Test your regex at regex101.com, understand capture groups, check all edge cases.

**Example safe addition**:
```javascript
// Adding a new comparison (copy this pattern)
if (/elderly.*\b(vs|versus)\b.*young/i.test(queryLower)) {
  return {
    isComparison: true,
    cohortA: { sex: 0, pclass: 2, age: 70, fare: 20 },
    cohortB: { sex: 0, pclass: 2, age: 25, fare: 20 },
    labelA: "Elderly",
    labelB: "Young",
    description: "Comparing survival rates between elderly and young passengers"
  }
}
```

---

### ⚠️ Backend API

**File**: `/backend/app.py` (or `/backend/main.py`)

**Complexity**: High - Production API with trained ML models.

**Safe to change**:
- CORS allowed origins (if you understand implications)
- Adding new logging statements
- Changing response messages

**Requires understanding**:
- API endpoint contracts (frontend depends on exact format)
- Model loading and prediction logic
- Error handling and status codes
- FastAPI routing and validation

**Before changing**:
- Test locally first
- Ensure frontend still works
- Understand that deployment takes time
- Breaking the API breaks the entire app

**Recommendation**: Backend changes are higher risk. If possible, avoid unless necessary. If you must change, test exhaustively with curl/Postman first.

---

## Testing & Building

### Build Frontend

```bash
cd /Users/julyamas/Documents/Projects/hf/titanic/frontend
npm run build
```

**Success looks like**:
```
✓ 620 modules transformed.
✓ built in 1.0s
```

**Failure looks like**:
```
✗ Error: ...
```

If build fails, **revert your changes** and try again.

---

### Common Build Errors

**Error**: `Unexpected token`
- **Cause**: Syntax error (missing bracket, comma, etc.)
- **Fix**: Check your edited lines for typos

**Error**: `Cannot find module`
- **Cause**: Wrong import path
- **Fix**: Verify file paths are correct

**Error**: `X is not defined`
- **Cause**: Using variable before declaring
- **Fix**: Make sure imports and useState are at top

---

### Test Locally

```bash
# Start backend
cd /Users/julyamas/Documents/Projects/hf/titanic/backend
python app.py

# In another terminal, start frontend
cd /Users/julyamas/Documents/Projects/hf/titanic/frontend
npm run dev
```

Open browser to http://localhost:5173

**Test checklist**:
- [ ] Page loads without errors
- [ ] Visualizations render
- [ ] Chat input works
- [ ] Preset chips trigger updates
- [ ] Accordion opens/closes
- [ ] No console errors

---

## Troubleshooting

### Issue: Component doesn't update

**Possible causes**:
1. State not being set correctly
2. Props not being passed
3. Missing dependencies in useEffect

**Debug steps**:
```jsx
// Add console.log to check values
console.log('Current state:', myState)
console.log('Props received:', props)
```

---

### Issue: Styling not applying

**Possible causes**:
1. Typo in class name
2. Conflicting classes
3. Class order matters (latter classes override)

**Fix**:
```jsx
// Check class name spelling
className="bg-gary-800"  // ✗ Wrong
className="bg-gray-800"  // ✓ Correct

// Check conflicts
className="text-sm text-lg"  // ✗ text-lg wins, confusing
className="text-lg"  // ✓ Clear
```

---

### Issue: Build succeeds but runtime error

**Possible causes**:
1. Accessing undefined property
2. Missing null check
3. Props not being passed

**Fix**: Add safety checks
```jsx
// Before (unsafe)
<div>{user.name}</div>

// After (safe)
<div>{user?.name || 'Unknown'}</div>
```

---

## Quick Reference: File Responsibilities

| File | Purpose | Common Changes |
|------|---------|----------------|
| `App.jsx` | State management, prop wiring | Add new state, wire props |
| `Layout.jsx` | Page layout structure (80/20 split) | Column widths, spacing |
| `ChatPanel.jsx` | Chat with smart chip visibility | Suggestions, visibility logic, toggle |
| `WhatIfCard.jsx` | Interactive parameter controls | Sliders, ranges, labels |
| `WhatIfModal.jsx` | Modal wrapper for what-if controls | Modal styling, backdrop behavior |
| `ComparisonCard.jsx` | Cohort comparison display | Styling, layout |
| `ModelComparisonView.jsx` | Main visualization layout | Tree/SHAP positioning |
| `visualizationStyles.js` | Centralized visualization styling | Color values, sizes, fonts (changes affect all visualizations) |
| `uiStyles.js` | Centralized UI styling | UI colors, spacing, animations |

---

## Decision Tree: Should I Make This Change?

```
Is it a simple style change (color, spacing, size)?
├─ YES → Quick and safe
└─ NO → Continue

Does it add a new UI element (button, text, etc.)?
├─ YES → Safe if following patterns above
└─ NO → Continue

Does it modify state management logic?
├─ YES → Read more context, proceed carefully
└─ NO → Continue

Does it change D3/visualization code?
├─ YES → Read D3 docs first, test incrementally
└─ NO → Go ahead
```

---

## When to Ask for Help (If Claude is Available)

These tasks benefit most from Claude's advanced reasoning. If Claude is available, consider escalating:

**High-value escalations** (complex, time-consuming):
1. **Architectural changes**: Moving components, restructuring files
2. **Complex state management**: Multi-component state coordination
3. **API contract changes**: Backend endpoints, data structures
4. **D3 visualizations**: Anything requiring deep D3 knowledge
5. **Performance issues**: Profiling, optimization, memory leaks
6. **Algorithm changes**: NLP parsing, cohort matching

**Medium-value escalations** (you could handle, but Claude is faster):
7. **Data flow debugging**: Tracing props through multiple components
8. **Build errors**: Stuck after 2-3 attempts
9. **Complex features**: Multiple files need to change together

**Quick wins you should handle** (use this guide):
1. Colors, spacing, sizes
2. Text content, labels
3. Adding buttons (following patterns)
4. New presets
5. Slider ranges
6. Default states (open/closed)
7. CSS classes
8. Simple conditional rendering

## If Claude Isn't Available

You can handle ALL the above tasks - the escalation guidance is about efficiency, not ability.

**For complex tasks without Claude**:

1. **Read more context first**
   - Open related files in your editor
   - Study the patterns used
   - Check how similar changes were made before

2. **Break it into smaller steps**
   - Change one thing at a time
   - Test after each step
   - Commit working states with git

3. **Use debugging tools**
   - `console.log` everywhere
   - Browser DevTools console
   - React DevTools for props/state

4. **Test more thoroughly**
   - Try different scenarios
   - Check edge cases
   - Verify related features still work

5. **Be ready to iterate**
   - First attempt may not be perfect
   - Use git to try alternatives
   - Learn from what works/doesn't

**Remember**: The complexity ratings help you estimate time and risk. A "high complexity" task might take 2-3 hours with careful work instead of 20 minutes with Claude. That's fine - you can still do it.

---

## Emergency Rollback

If you break something:

```bash
# See what changed
git diff

# Discard changes to specific file
git checkout -- path/to/file.jsx

# Discard ALL changes
git reset --hard HEAD
```

---

## Best Practices

1. **Read before writing**: Always read the full file first
2. **Copy existing patterns**: Don't invent new patterns
3. **Test after every change**: Build immediately
4. **Make small changes**: One thing at a time
5. **Use console.log**: Debug with logging
6. **Check props**: Ensure props are passed correctly
7. **Follow naming**: Use camelCase for JS, kebab-case for CSS classes
8. **Comment when unclear**: Add // comments for future reference

---

## Example: Complete Task Walkthrough

**Task**: "Change the Send button to green"

**Step 1**: Read ChatPanel.jsx
```bash
Read: /Users/julyamas/Documents/Projects/hf/titanic/frontend/src/components/ChatPanel.jsx
```

**Step 2**: Find Send button (around line 135)
```jsx
<button
  type="submit"
  disabled={!inputValue.trim()}
  className="px-4 py-2 text-sm bg-[#218FCE] text-white rounded hover:bg-[#1a7ab8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
  Send
</button>
```

**Step 3**: Change blue colors to green
```jsx
<button
  type="submit"
  disabled={!inputValue.trim()}
  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
  Send
</button>
```

**Changes made**:
- `bg-[#218FCE]` → `bg-green-600`
- `hover:bg-[#1a7ab8]` → `hover:bg-green-700`

**Step 4**: Build
```bash
cd /Users/julyamas/Documents/Projects/hf/titanic/frontend
npm run build
```

**Step 5**: Verify success
```
✓ built in 1.0s
```

**Done!** Button is now green.

---

## Additional Documentation

### Central Navigation

- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Central hub for all documentation
  - Quick start by use case ("I want to...")
  - Complete file organization and navigation
  - Key concepts and design principles

### Detailed Feature Information

### Feature Documentation

- **DECISION_TREE_FEATURES.md** - Comprehensive decision tree visualization reference
  - Variable stroke widths (edge thickness scales with passenger counts)
  - Selective path highlighting (tutorial modes)
  - Dual path visualization (comparison mode with blue/orange paths)
  - Complete technical implementation and usage examples

- **COHORT_COMPARISON_FEATURE.md** - Natural language comparison system
  - Dynamic comparison parsing ("1st class women vs 3rd class men")
  - Side-by-side prediction cards
  - Integration with dual path visualization on decision tree
  - **Dec 20, 2025 (AM)**: Fixed comparison path clearing bug (DecisionTreeViz.jsx, App.jsx)
  - **Dec 20, 2025 (Evening)**: Fixed "What if?" controls not updating visualizations (App.jsx handleChange)

- **TUTORIAL_FEATURE.md** - Interactive tutorial system
  - Progressive path highlighting
  - Educational step-by-step guidance

- **FIXED_CHAT_LAYOUT.md** - Recent layout changes
  - Fixed split-screen layout (70/30 split)
  - Accordion controls ("What if?" panel)
  - Preset suggestion chips

### Core Documentation

- **AI_CONTEXT.md** - Complete project reference
  - Tech stack, deployment, git workflow
  - All component documentation
  - Development and troubleshooting guide

---

## Conclusion

This guide should help you handle most UI and simple logic changes. When in doubt:

1. **Follow existing patterns exactly**
2. **Test immediately after changes**
3. **Ask for help if unsure**

Good luck!
