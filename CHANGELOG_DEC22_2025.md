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
