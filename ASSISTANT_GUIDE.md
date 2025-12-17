# Coding Assistant Guide

**Purpose**: Help coding assistants (GitHub Copilot, Cursor, etc.) make changes efficiently
**Last Updated**: December 17, 2025

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
├── components/
│   ├── Layout.jsx              # Fixed split-screen layout
│   ├── ControlPanel.jsx        # Accordion with sliders
│   ├── ChatPanel.jsx           # Chat interface with presets
│   ├── ComparisonCard.jsx      # Side-by-side cohort comparison
│   ├── ModelComparisonView.jsx # Decision tree + SHAP views
│   ├── TutorialControls.jsx    # Tutorial UI
│   └── visualizations/
│       ├── DecisionTreeViz.jsx # D3 tree visualization
│       ├── SHAPWaterfall.jsx   # SHAP feature importance
│       └── PredictionCard.jsx  # Survival prediction card
├── hooks/
│   └── useTutorial.js          # Tutorial state management
└── utils/
    └── cohortPatterns.js       # Natural language parsing

/backend/
├── app.py                       # Flask API server
└── models/                      # Trained ML models
```

**Key Files You'll Touch Most**:
- `Layout.jsx` - Layout structure
- `ControlPanel.jsx` - Control sliders
- `ChatPanel.jsx` - Chat UI
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
- **Left (70%)**: Visualizations (scrolls)
- **Right (30%)**: Controls + Chat (fixed)

```
┌─────────────────────────┬─────────────┐
│  Header (scrolls)       │   Controls  │
│  Visualizations         │   (accordion)
│  (scroll down)          │   ─────────  │
│                         │   Chat      │
│                         │   Messages  │
│                         │   (scroll)  │
│                         │   ─────────  │
│                         │   Input     │
└─────────────────────────┴─────────────┘
```

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

### Task 5: Change Accordion Default State

**Example**: Make accordion open by default

**Step 1**: Find ControlPanel.jsx state
```jsx
// Line 5
const [isExpanded, setIsExpanded] = useState(false)
```

**Step 2**: Change default
```jsx
// Change false to true
const [isExpanded, setIsExpanded] = useState(true)
```

**That's it!** No other changes needed.

---

### Task 6: Modify Slider Range

**Example**: Change age slider from 0-80 to 0-100

**Step 1**: Find slider in ControlPanel.jsx
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

### Task 7: Add a New Preset Chip

**Example**: Add a "1st class woman" preset

**Step 1**: Find presets array in ChatPanel.jsx
```jsx
const presets = [
  { id: 'women', label: 'Women\'s path', values: { sex: 0, pclass: 2, age: 30, fare: 20 } },
  { id: 'men', label: 'Men\'s path', values: { sex: 1, pclass: 3, age: 30, fare: 13 } },
  { id: 'child', label: '1st class child', values: { sex: 0, pclass: 1, age: 5, fare: 84 } },
  { id: 'third', label: '3rd class male', values: { sex: 1, pclass: 3, age: 40, fare: 8 } }
]
```

**Step 2**: Add new preset
```jsx
const presets = [
  { id: 'women', label: 'Women\'s path', values: { sex: 0, pclass: 2, age: 30, fare: 20 } },
  { id: 'men', label: 'Men\'s path', values: { sex: 1, pclass: 3, age: 30, fare: 13 } },
  { id: 'child', label: '1st class child', values: { sex: 0, pclass: 1, age: 5, fare: 84 } },
  { id: 'third', label: '3rd class male', values: { sex: 1, pclass: 3, age: 40, fare: 8 } },
  { id: 'firstwoman', label: '1st class woman', values: { sex: 0, pclass: 1, age: 30, fare: 84 } }  // NEW
]
```

**Parameter guide**:
- `sex`: 0=Female, 1=Male
- `pclass`: 1=First, 2=Second, 3=Third
- `age`: 0-80 (any integer)
- `fare`: 0-100 (historical: 1st=84, 2nd=20, 3rd=13)

**That's it!** Chip will appear automatically.

---

### Task 8: Change Layout Column Widths

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
| `Layout.jsx` | Page layout structure | Column widths, spacing |
| `ControlPanel.jsx` | Sliders and controls | Ranges, labels, accordion |
| `ChatPanel.jsx` | Chat interface | Messages, presets, input |
| `ComparisonCard.jsx` | Cohort comparison display | Styling, layout |
| `TutorialControls.jsx` | Tutorial UI | Button text, styling |

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

## Conclusion

This guide should help you handle most UI and simple logic changes. When in doubt:

1. **Follow existing patterns exactly**
2. **Test immediately after changes**
3. **Ask for help if unsure**

Good luck!
