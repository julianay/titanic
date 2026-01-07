# Active Message Tracking Feature

> **Purpose:** Track and visually indicate which chat message's cohort is currently displayed in the visualizations

**Feature Added:** January 7, 2026
**Status:** Active
**Related Features:** Clickable percentages, comparison mode, decision tree highlighting

---

## 📋 Overview

The Active Message Tracking feature provides visual feedback in the chat interface to show which message corresponds to the currently displayed visualization. Instead of always highlighting the most recent message, the system now highlights whichever message's cohort is actively shown in the decision tree and SHAP waterfall charts.

### Key Benefits
- **Visual clarity:** Users can immediately see which prediction is being visualized
- **Better navigation:** Clicking on percentages from older messages updates the highlight
- **Comparison support:** Works seamlessly with comparison mode to show both cohorts

---

## 🎯 User Experience

### Before This Feature
- The most recent message section was always highlighted with a dark background
- No visual indication when viewing an older cohort by clicking its percentage
- Confusion when multiple predictions existed in chat history

### After This Feature
- The message section containing the currently visualized cohort is highlighted
- Clicking any percentage updates both the visualization AND the highlight
- Clear visual feedback showing exactly which prediction is active

---

## 🔧 Technical Implementation

### State Management

**New State Variable:**
```javascript
// App.jsx, line 33
const [activeMessageIndex, setActiveMessageIndex] = useState(0)
```

This state tracks the index of the message currently being displayed in visualizations.

### Data Flow

```
User clicks percentage
    ↓
ComparisonCard/SinglePredictionCard
    ↓ (passes cohortData, comparisonData, messageIndex)
handleHighlightCohort (App.jsx)
    ↓ (updates passenger data & activeMessageIndex)
ChatPanel receives activeMessageIndex
    ↓
Section containing activeMessageIndex gets highlighted background
```

### Files Modified

#### 1. **App.jsx**

**Added state:**
```javascript
const [activeMessageIndex, setActiveMessageIndex] = useState(0)
```

**Updated `handleHighlightCohort` (lines 114-131):**
```javascript
const handleHighlightCohort = (cohortData, comparisonData, messageIndex) => {
  // Update passenger data to show the path for this cohort
  setPassengerData({ ...cohortData })
  setHasQuery(true)

  if (comparisonData) {
    // Preserve comparison mode when clicking from a comparison card
    setActiveComparison(comparisonData)
  } else {
    // Clear comparison mode when clicking from a single prediction card
    setActiveComparison(null)
  }

  // Update active message to highlight the correct section in chat
  if (messageIndex !== undefined) {
    setActiveMessageIndex(messageIndex)
  }
}
```

**Updated all message creation handlers:**
- `handlePresetChat` (line 77) - Sets activeMessageIndex when adding preset message
- `handleSendMessage` (lines 238, 278) - Sets activeMessageIndex for new messages
- `handleWhatIfApply` (line 168) - Sets activeMessageIndex for what-if results
- `handleWhatIfCompare` (line 209) - Sets activeMessageIndex for comparisons

**Passed to ChatPanel (line 323):**
```javascript
<ChatPanel
  // ... other props
  activeMessageIndex={activeMessageIndex}
/>
```

#### 2. **ChatPanel.jsx**

**Updated function signature (line 63):**
```javascript
function ChatPanel({
  // ... other params
  activeMessageIndex
})
```

**Updated section highlighting logic (lines 181-183):**
```javascript
// Check if this section contains the active message
const containsActiveMessage = section.some(msg => messages.indexOf(msg) === activeMessageIndex)
const sectionBg = containsActiveMessage ? UI_COLORS.chatSectionBgLatest : UI_COLORS.chatSectionBgPrevious
```

**Passed messageIndex to cards (lines 214, 223):**
```javascript
<ComparisonCard
  // ... other props
  messageIndex={globalIdx}
/>

<SinglePredictionCard
  // ... other props
  messageIndex={globalIdx}
/>
```

#### 3. **ComparisonCard.jsx**

**Updated function signature (line 16):**
```javascript
function ComparisonCard({
  // ... other params
  messageIndex
})
```

**Updated all percentage click handlers (lines 163, 184, 210, 231):**
```javascript
onClick={onHighlightCohort ? () => onHighlightCohort(cohortA, comparisonData, messageIndex) : undefined}
onClick={onHighlightCohort ? () => onHighlightCohort(cohortB, comparisonData, messageIndex) : undefined}
```

#### 4. **SinglePredictionCard.jsx**

**Updated function signature (line 13):**
```javascript
function SinglePredictionCard({
  // ... other params
  messageIndex
})
```

**Updated all percentage click handlers (lines 136, 159):**
```javascript
onClick={onHighlightCohort ? () => onHighlightCohort(passengerData, null, messageIndex) : undefined}
```

---

## 🎨 Visual Behavior

### Chat Section Backgrounds

Sections use two different background colors from `UI_COLORS`:

```javascript
// Active section (contains currently visualized cohort)
backgroundColor: UI_COLORS.chatSectionBgLatest  // #1e293b (darker)

// Inactive sections (other predictions in history)
backgroundColor: UI_COLORS.chatSectionBgPrevious  // #1a1f2e (lighter)
```

### Triggering Highlight Updates

The active message index updates in these scenarios:

1. **User submits a new query** → Highlights the new prediction
2. **User clicks a preset chip** → Highlights the preset result
3. **User applies What-If scenario** → Highlights the new result
4. **User creates a comparison** → Highlights the comparison
5. **User clicks any percentage** → Highlights that message's section

---

## 🔄 Integration with Existing Features

### Clickable Percentages
- All percentages now pass `messageIndex` as third parameter
- Clicking updates both visualization and highlight
- Works for both Decision Tree and XGBoost percentages

### Comparison Mode
- When clicking from ComparisonCard, preserves comparison with both cohorts
- Highlights the section containing the comparison
- Single path view maintained when clicking from SinglePredictionCard

### Tutorial System
- Tutorial messages don't interfere with active tracking
- User-created predictions update normally during tutorial

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Navigation
1. Submit query "woman in 1st class" → Section highlights
2. Submit query "man in 3rd class" → New section highlights
3. Click percentage from first query → First section highlights again
4. **Expected:** Highlight moves between sections correctly

### Scenario 2: Comparison Mode
1. Submit "compare women vs men" → Comparison section highlights
2. Click percentage for "women" → Comparison stays highlighted, tree shows women's path
3. Click percentage for "men" → Comparison stays highlighted, tree shows men's path
4. **Expected:** Comparison section remains highlighted for both clicks

### Scenario 3: Mixed Content
1. Submit single query → Highlights single prediction
2. Submit comparison → Highlights comparison
3. Click percentage from single query → Highlights single prediction again
4. **Expected:** Highlight switches between different message types

---

## 💡 Implementation Notes

### Why Track by Index?
- Messages array is stable (only grows, never reordered)
- Index provides direct, efficient lookup
- Works with React's reconciliation for optimal re-renders

### Why Not Track by Message Object?
- Object equality checks are unreliable with React state
- Index is simpler and more performant
- No need for deep equality comparisons

### Section Grouping Logic
ChatPanel groups messages into sections (user question + assistant responses). The active message tracking:
1. Finds which section contains the active message index
2. Applies highlight to entire section
3. Ensures user question and prediction are highlighted together

---

## 🐛 Edge Cases Handled

### Multiple Messages in Single Update
When `setChatMessages` is called:
```javascript
setChatMessages(prev => {
  const newMessages = [...prev, userMsg, assistantMsg]
  setActiveMessageIndex(newMessages.length - 1)  // Points to assistant message
  return newMessages
})
```

This ensures the new message is immediately highlighted.

### Error Messages
Error messages (unparseable queries) don't update `activeMessageIndex`:
```javascript
if (!parsedParams) {
  // Don't update activeMessageIndex for errors
  setChatMessages(prev => [...prev, userMsg, errorMsg])
  return
}
```

The previously active visualization remains highlighted.

### Initial Load
On first load, `activeMessageIndex` is `0`, highlighting the default initial prediction.

---

## 📊 Performance Considerations

### Minimal Re-renders
- Single state variable (`activeMessageIndex`)
- Only ChatPanel and its sections re-render on change
- Cards themselves don't re-render when highlight changes

### Optimizations
- Using array index lookup (O(1))
- No expensive computations in render path
- Background color change is pure CSS

---

## 🔮 Future Enhancements

### Potential Improvements
1. **Smooth scroll to active section** when clicking percentages
2. **Keyboard navigation** between predictions (arrow keys)
3. **Visual indicator** on the percentage that's currently active
4. **Animation** when highlight transitions between sections

### Related Features to Consider
- Prediction history panel
- Bookmark/favorite predictions
- Compare any two historical predictions

---

## 📝 Related Documentation

- **Clickable Percentages:** See "Edit cohort" feature in CHANGELOG.md [2026-01-07]
- **Comparison Mode:** [COHORT_COMPARISON_FEATURE.md](COHORT_COMPARISON_FEATURE.md)
- **Decision Tree:** [DECISION_TREE_FEATURES.md](DECISION_TREE_FEATURES.md)
- **Chat Interface:** [docs/FRONTEND.md](docs/FRONTEND.md#chatpanel)

---

## 🔍 Code References

### Primary Implementation
- `frontend/src/App.jsx` (lines 33, 77, 114-131, 168, 209, 238, 278, 323)
- `frontend/src/components/ChatPanel.jsx` (lines 63, 181-183, 214, 223)

### Card Components
- `frontend/src/components/ComparisonCard.jsx` (lines 16, 163, 184, 210, 231)
- `frontend/src/components/SinglePredictionCard.jsx` (lines 13, 136, 159)

### Styling
- `frontend/src/utils/uiStyles.js` - `UI_COLORS.chatSectionBgLatest` and `chatSectionBgPrevious`

---

**Last Updated:** January 7, 2026
**Implemented By:** Claude Code
**Related Issues:** None
