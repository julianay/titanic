# Changelog - December 22, 2025

## Tree Label Improvements

### Decision Tree Split Labels
Updated passenger class (pclass) split labels to be more user-friendly instead of showing technical threshold values.

**Changed in**: `backend/models/decision_tree.py`

**Before**:
- Left branch: "≤ 1.5"
- Right branch: "> 1.5"

**After**:
- Split at 1.5: "1st class" vs "2nd & 3rd class"
- Split at 2.5: "1st & 2nd class" vs "3rd class"

**Implementation**:
```python
elif feature_name == 'pclass':
    # For passenger class, show meaningful class names
    # pclass is 1, 2, or 3 (1st, 2nd, 3rd class)
    # Left child: ≤ threshold, Right child: > threshold
    if threshold <= 1.5:
        # Split at 1.5: pclass 1 vs pclass 2&3
        node_data['left_label'] = '1st class'
        node_data['right_label'] = '2nd & 3rd class'
    elif threshold <= 2.5:
        # Split at 2.5: pclass 1&2 vs pclass 3
        node_data['left_label'] = '1st & 2nd class'
        node_data['right_label'] = '3rd class'
```

---

## Layout Improvements

### SHAP Waterfall / Global Importance Ratio
Adjusted the width distribution in the XGBoost section for better readability.

**Changed in**:
- `frontend/src/components/ModelComparisonView.jsx`
- `frontend/src/components/ModelComparisonViewAlt.jsx`

**Single Mode** (no comparison):
- SHAP Waterfall: 70% width (increased from 50%)
- Global Feature Importance: 30% width (decreased from 50%)
- Layout: Side-by-side

**Comparison Mode** (two waterfalls):
- Two waterfalls: 50/50 split (unchanged)
- Layout: Stacked vertically with Global Importance below

**Rationale**: The waterfall chart contains more detailed information (feature values, impacts) and benefits from more horizontal space, while the global importance is a simpler bar chart.

---

## What-If Feature - Chat Integration

### Overview
Converted the "What If?" accordion from the right sidebar into an interactive card that appears in the chat when triggered by a suggestion chip. This frees up sidebar space and provides a more contextual, conversational experience.

### Components

#### New Component: WhatIfCard.jsx
An interactive card component that appears in chat with all passenger controls.

**Features**:
- Compact design optimized for chat display
- All controls from original accordion: sex, pclass, age, fare
- Real-time fare suggestions based on passenger class
- Passenger description preview
- "Apply Changes" button to commit updates

**Props**:
```javascript
{
  values: { sex, pclass, age, fare },  // Current passenger data
  onChange: (field, value) => void,     // Called when controls change
  onApply: () => void                    // Called when Apply button clicked
}
```

#### Updated: ChatPanel.jsx
Added "What If?" suggestion chip and rendering for whatif message type.

**New Props**:
```javascript
{
  onWhatIfStart: () => void,           // Called when chip clicked
  onWhatIfChange: (field, value) => void,  // Called when controls change
  onWhatIfApply: () => void            // Called when Apply clicked
}
```

**Message Type**:
```javascript
{
  role: 'assistant',
  type: 'whatif',
  passengerData: { sex, pclass, age, fare }
}
```

**UI**:
- Added "🔮 What If?" chip next to "📚 Start Tutorial" chip
- Chip styling: `bg-[#218FCE]` (matches brand color)

#### Updated: App.jsx & AppAlt.jsx
Added state management and handlers for What-If mode.

**New State**:
```javascript
const [whatIfData, setWhatIfData] = useState(null)
```

**Handler: handleWhatIfStart()**
- Triggered when "What If?" chip is clicked
- Initializes `whatIfData` with current passenger parameters
- Adds whatif card to chat messages

**Handler: handleWhatIfChange(field, value)**
- Updates parameter values in real-time as user adjusts controls
- Reads current data from chat message (source of truth)
- Updates both chat message and `whatIfData` state
- Fixed race condition by using message data instead of state

**Handler: handleWhatIfApply()**
- Applies the changes to main passenger data
- Generates prediction card with results
- Clears `whatIfData` state

#### Removed: ControlPanel Integration
- Removed `ControlPanel` import from App.jsx and AppAlt.jsx
- Removed `handleChange` function (no longer needed)
- Removed `controlsContent` prop from Layout component
- Sidebar accordion completely removed

### Technical Details

#### Race Condition Fix
The initial implementation had a race condition where rapid slider movements could send incomplete data to the API, causing 422 validation errors.

**Problem**:
```javascript
// After Apply, whatIfData becomes null
setWhatIfData(null)

// User clicks "What If?" again
setWhatIfData({ ...passengerData })  // State update is async

// User immediately moves slider before state update completes
handleWhatIfChange('age', 25)  // prev is still null!
// Result: { age: 25 } instead of { sex: 0, pclass: 1, age: 25, fare: 84 }
```

**Solution**:
Changed `handleWhatIfChange` to use the chat message as the source of truth instead of relying on state:

```javascript
const handleWhatIfChange = (field, value) => {
  setChatMessages(prevMessages => {
    // Find the last what-if message
    let lastWhatIfIndex = -1
    let currentData = null
    for (let i = prevMessages.length - 1; i >= 0; i--) {
      if (prevMessages[i].type === 'whatif') {
        lastWhatIfIndex = i
        currentData = prevMessages[i].passengerData
        break
      }
    }

    // Create updated data from message (not state)
    const updated = {
      ...currentData,  // Always has complete data
      [field]: value
    }

    // Update state after getting data
    setWhatIfData(updated)

    // Return updated messages
    return prevMessages.map((msg, index) => {
      if (index === lastWhatIfIndex) {
        return {
          ...msg,
          passengerData: updated
        }
      }
      return msg
    })
  })
}
```

#### Data Type Fix
Changed slider value parsing from `parseInt` to `parseFloat` to match backend Pydantic validation:

**WhatIfCard.jsx**:
```javascript
// Age slider
onChange={(e) => onChange('age', parseFloat(e.target.value))}

// Fare slider
onChange={(e) => onChange('fare', parseFloat(e.target.value))}
```

Backend expects floats for `age` and `fare` (defined in `backend/routes/predict.py`):
```python
age: float = Field(..., ge=0, le=100, description="Age in years")
fare: float = Field(..., ge=0, description="Ticket fare in pounds")
```

#### Browser Compatibility
Replaced ES2023 `findLastIndex()` with manual loop for broader browser support:

```javascript
// Before (ES2023)
const lastIndex = messages.findLastIndex(m => m.type === 'whatif')

// After (compatible)
let lastWhatIfIndex = -1
for (let i = prevMessages.length - 1; i >= 0; i--) {
  if (prevMessages[i].type === 'whatif') {
    lastWhatIfIndex = i
    break
  }
}
```

### User Flow

1. User clicks "🔮 What If?" chip
2. WhatIfCard appears in chat with current passenger parameters
3. User adjusts controls (sex, class, age, fare)
   - Changes update in real-time in the card
   - No API calls until Apply is clicked
4. User clicks "Apply Changes"
5. System updates main passenger data
6. New prediction card appears in chat with results
7. Visualizations update to show the new scenario

### Benefits

- **More chat space**: Removed accordion from sidebar
- **Contextual**: What-if exploration happens in conversation flow
- **Cleaner UI**: Controls only appear when needed
- **Consistent pattern**: Matches tutorial and comparison chip interactions
- **Better UX**: Results appear directly after adjustments in chat timeline

---

## Chat Interface Enhancements

### Chat Area Styling & Layout

**Changed in**:
- `frontend/src/components/Layout.jsx`
- `frontend/src/components/ChatPanel.jsx`

#### Chat Width Increase
Increased chat column width for better readability and more assistant-like appearance:
- Left column: 80% → 70%
- Right column (chat): 20% → 30%

#### Chat Title
Added prominent title to chat area: **"Ask about cohorts"**
- Font: text-lg, semibold
- Color: text-gray-100
- Positioned at top of chat panel with mb-4 spacing

#### AI Response Styling
Added sparkle icon (✨) to all assistant messages for visual distinction:
- Appears on the left side of assistant responses
- Color: text-gray-400
- Size: text-base
- Applied to all message types: text, comparison cards, prediction cards, tutorial, what-if

#### User Message Styling
Converted user messages to chat bubble style:
- Background: bg-gray-800 (matching chip style)
- Text: text-gray-300
- Border radius: rounded-2xl (18px)
- Padding: px-4 py-2
- Alignment: Right-aligned with justify-end
- Width: max-w-[85%] of chat column
- Font weight: font-medium

**Before**:
```jsx
<div className="font-medium text-[#218FCE]">
  {msg.content ? '> ' + msg.content : ''}
</div>
```

**After**:
```jsx
<div className="flex justify-end">
  <div className="bg-gray-800 text-gray-300 rounded-2xl px-4 py-2 max-w-[85%] font-medium">
    {msg.content}
  </div>
</div>
```

### Chat Message Animations

**New file**: `frontend/src/components/ChatPanel.css`
**Changed in**: `frontend/src/components/ChatPanel.jsx`

#### Animation Features

1. **Fade + Slide Effect**
   - Messages fade in from 0 to 1 opacity
   - Simultaneous 16px upward slide (translateY)
   - Duration: 0.5s ease-out
   - Smooth, polished appearance

2. **Sequential Reveal**
   - Initial messages load with staggered delays
   - 150ms between each message
   - Creates natural "beats" rhythm
   - Supports up to 8+ messages with progressive delays

3. **Staggered Timing**
   ```css
   .chat-message:nth-child(1) { animation-delay: 0ms; }
   .chat-message:nth-child(2) { animation-delay: 150ms; }
   .chat-message:nth-child(3) { animation-delay: 300ms; }
   .chat-message:nth-child(4) { animation-delay: 450ms; }
   /* ... up to 1200ms for 9+ */
   ```

4. **New Message Animation**
   - Freshly added messages use `.chat-message-new` class
   - No delay (0ms) for immediate feedback
   - Tracks previous message count to identify new additions

#### Implementation Details

**Animation Keyframe**:
```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Message Tracking**:
```javascript
const [prevMessageCount, setPrevMessageCount] = useState(messages.length)

// In render
const isNewMessage = idx >= prevMessageCount
const animationClass = isNewMessage ? 'chat-message-new' : 'chat-message'
```

**Additional Transitions**:
- Buttons: 0.2s transition on all properties
- Rounded boxes: 0.2s transition on transform and box-shadow

---

## Initial Page Animation

### Auto-Playing Tree & SHAP Animation

**New file**: `frontend/src/hooks/useInitialAnimation.js`
**Changed in**:
- `frontend/src/App.jsx`
- `frontend/src/AppAlt.jsx`

#### Overview
Added automatic animation on page load that progressively highlights the decision tree path and SHAP waterfall features for the default passenger (8-year-old female in 1st class, £84 fare).

#### Animation Sequence

1. **Initial State (1.5s)**
   - highlightMode: `-1` (no path highlighted)
   - Tree shows unhighlighted state
   - SHAP waterfall shows no feature highlights

2. **Sex Split (2s)**
   - highlightMode: `"first_split"`
   - Highlights root node → first child (sex split)
   - Highlights "sex" feature in SHAP waterfall

3. **Full Path (2.5s)**
   - highlightMode: `"full_path"`
   - Shows complete path through tree
   - Highlights all features: sex, pclass, age, fare

4. **End State**
   - Stays on full path
   - Animation completes

#### Implementation

**Hook Structure**:
```javascript
function useInitialAnimation() {
  const [animationStep, setAnimationStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  // Auto-step through animation
  useEffect(() => {
    if (!isAnimating) return

    const currentStep = ANIMATION_STEPS[animationStep]
    if (!currentStep || animationStep >= ANIMATION_STEPS.length - 1) {
      setIsAnimating(false)
      return
    }

    const timer = setTimeout(() => {
      setAnimationStep(prev => prev + 1)
    }, currentStep.duration)

    return () => clearTimeout(timer)
  }, [isAnimating, animationStep])

  return {
    isAnimating,
    getHighlightMode: () => ...,
    getHighlightFeatures: () => ...
  }
}
```

**Highlight Mode Values**:
- `-1`: Empty path (no highlights) - achieved via `fullPath.slice(0, 0)`
- `"first_split"`: Root + first child only - via `fullPath.slice(0, 2)`
- `"full_path"`: Complete path to leaf node
- `number`: Custom depth - via `fullPath.slice(0, highlightMode + 1)`

**Integration**:
```javascript
// In App.jsx and AppAlt.jsx
const initialAnimation = useInitialAnimation()

const getHighlightMode = () => {
  if (tutorial.tutorialActive) return tutorial.getHighlightMode()
  if (initialAnimation.isAnimating) return initialAnimation.getHighlightMode()
  return null
}
```

#### Timing & Behavior
- Plays automatically on every page load
- Total duration: ~6 seconds (1.5s + 2s + 2.5s)
- No user interaction required
- Tutorial takes precedence if active
- Provides engaging onboarding experience

#### Technical Details

**Why highlightMode: -1 works**:
The tree visualization code uses `getLimitedPath()`:
```javascript
if (typeof highlightMode === 'number') {
  return fullPath.slice(0, highlightMode + 1)
}
// With highlightMode = -1:
// fullPath.slice(0, -1 + 1) = fullPath.slice(0, 0) = []
```

This gives an empty array, resulting in no path highlights.

**Tutorial Disabled**:
- Removed auto-start from `useTutorial.js`
- Tutorial now only starts via "Start Tutorial" button
- Initial animation provides simpler, automatic onboarding
- Tutorial available for deeper exploration

---

## Auto-Scroll Enhancement

**Changed in**: `frontend/src/components/ChatPanel.jsx`

Added multiple scroll attempts to handle asynchronous content loading (ComparisonCard):

```javascript
// Scroll immediately
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

// Scroll after 100ms (initial render)
setTimeout(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, 100)

// Scroll after 500ms (async data loaded)
setTimeout(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, 500)
```

**Problem Solved**: ComparisonCard loads predictions via API, starting small (loading skeleton) then expanding to full height. Single scroll attempt would complete before card expansion, leaving bottom content hidden.

**Solution**: Progressive scrolling ensures chat scrolls to bottom even as content loads and expands asynchronously.
