# Changelog - January 2, 2026

## Decision Tree Visualization Fixes and Enhancements

### Overview
Fixed critical bug preventing donut charts from rendering and enhanced edge label formatting for better readability and user understanding.

---

## Changes

### 1. Fix: Donut Charts Not Rendering (Class Count Calculation Bug)

**Commit**: `f5e10e4`

**File**: `backend/models/decision_tree.py`

**Lines Modified**: 117-119

#### Problem
The decision tree donut charts completely disappeared from the visualization. All nodes showed no class distribution, making it impossible to see the split between survived/died passengers at each node.

**Root Cause**:
- sklearn's `tree_.value` returns **proportions** (e.g., [0.59, 0.41]) not counts
- Code was casting these proportions directly to integers: `int(0.59)` → `0`
- All class_0 and class_1 counts were showing as 0
- D3.js pie charts cannot render with zero values, causing donuts to disappear

**Before**:
```python
# Note: value contains counts (not proportions) for each class
class_0_count = int(value[0])  # int(0.59) → 0
class_1_count = int(value[1])  # int(0.41) → 0
```

**After**:
```python
# Note: value contains proportions (not counts) - multiply by samples to get counts
class_0_count = int(value[0] * samples)  # int(0.59 * 571) → 339 ✓
class_1_count = int(value[1] * samples)  # int(0.41 * 571) → 232 ✓
```

**Example**:
- Root node: 571 total samples
  - Before: class_0 = 0, class_1 = 0 (donuts disappeared)
  - After: class_0 = 339, class_1 = 232 (donuts render correctly)

**API Response Verification**:
```bash
curl http://localhost:8000/api/tree
# Before: "class_0": 0, "class_1": 0 (all nodes)
# After: "class_0": 339, "class_1": 232 (root node)
```

**Impact**:
- Restores all donut chart visualizations across the decision tree
- Users can now see class distribution at every node
- Critical for understanding how the tree makes decisions

---

### 2. Enhancement: Fare Values with Currency Symbol

**File**: `backend/models/decision_tree.py`

**Lines Modified**: 172-175

#### Problem
Fare values on edge labels showed as decimal numbers (e.g., "≤ 28.9", "> 149.0") without context that these are currency values in British pounds.

#### Solution
- Added pound sign (£) prefix to all fare values
- Rounded to nearest integer for cleaner display

**Before**:
```python
# For numeric features, just show the threshold
node_data['left_label'] = f"≤ {threshold:.1f}"
node_data['right_label'] = f"> {threshold:.1f}"
```

**After**:
```python
elif feature_name == 'fare':
    # For fare, show with pound sign and round to integer
    node_data['left_label'] = f"≤ £{int(round(threshold))}"
    node_data['right_label'] = f"> £{int(round(threshold))}"
```

**Examples**:
| Original Threshold | Before | After |
|-------------------|--------|-------|
| 149.035 | "≤ 149.0" | "≤ £149" |
| 28.856 | "≤ 28.9" | "≤ £29" |
| 20.800 | "≤ 20.8" | "≤ £21" |
| 41.300 | "≤ 41.3" | "≤ £41" |
| 26.950 | "≤ 27.0" | "≤ £27" |

**Impact**:
- Users immediately recognize these as currency values
- Cleaner display without unnecessary decimal precision
- Historically accurate (Titanic fares were in British pounds)

---

### 3. Enhancement: Age Values with Unit Suffix

**File**: `backend/models/decision_tree.py`

**Lines Modified**: 176-179

#### Problem
Age values on edge labels showed as decimals (e.g., "≤ 16.5", "> 36.5") without units, and unnecessary decimal precision for age values.

#### Solution
- Added "yrs" suffix to all age values
- Rounded to nearest integer for natural age representation

**Before**:
```python
else:
    # For other numeric features (age), just show the threshold
    node_data['left_label'] = f"≤ {threshold:.1f}"
    node_data['right_label'] = f"> {threshold:.1f}"
```

**After**:
```python
elif feature_name == 'age':
    # For age, show with "yrs" suffix and round to integer
    node_data['left_label'] = f"≤ {int(round(threshold))} yrs"
    node_data['right_label'] = f"> {int(round(threshold))} yrs"
else:
    # For other numeric features, just show the threshold
    node_data['left_label'] = f"≤ {threshold:.1f}"
    node_data['right_label'] = f"> {threshold:.1f}"
```

**Examples**:
| Original Threshold | Before | After |
|-------------------|--------|-------|
| 16.50 | "≤ 16.5" | "≤ 16 yrs" |
| 36.50 | "≤ 36.5" | "≤ 36 yrs" |
| 47.50 | "≤ 47.5" | "≤ 48 yrs" |
| 9.50 | "≤ 9.5" | "≤ 10 yrs" |
| 32.25 | "≤ 32.2" | "≤ 32 yrs" |

**Impact**:
- Clear units make values immediately understandable
- Integer ages are more natural than decimals (people think "16 years old" not "16.5 years old")
- Consistent with how age is commonly communicated

---

## Complete Edge Label Format

After all enhancements, edge labels now display as:

| Feature | Example Labels |
|---------|---------------|
| **sex** | "female" / "male" |
| **pclass** | "1st class" / "2nd & 3rd class" |
| **fare** | "≤ £149" / "> £149" |
| **age** | "≤ 16 yrs" / "> 16 yrs" |

---

## Technical Details

### Backend Architecture

**Function**: `sklearn_tree_to_dict()`
- Recursively converts sklearn DecisionTreeClassifier to nested dictionary format
- Generates human-readable labels for each edge/split
- Now includes feature-specific formatting logic

**Feature Detection**:
```python
if feature_name in label_encoders:
    # Categorical features (sex)
elif feature_name == 'pclass':
    # Passenger class (special labels)
elif feature_name == 'fare':
    # Currency values (£ symbol, integer)
elif feature_name == 'age':
    # Age values (yrs suffix, integer)
else:
    # Other numeric features (decimal)
```

### Rounding Logic

**Why `int(round(threshold))` instead of just `int(threshold)`**:
- `int()` truncates: `int(28.9)` → `28`
- `round()` then `int()` rounds properly: `int(round(28.9))` → `29`
- More accurate representation of split point

---

## Testing

### Verification Commands

**1. Check class counts are correct**:
```bash
curl -s http://localhost:8000/api/tree | python3 -c "
import sys, json
data = json.load(sys.stdin)
tree = data['tree']
print(f\"Root: class_0={tree['class_0']}, class_1={tree['class_1']}\")
"
# Expected: class_0=339, class_1=232
```

**2. Check fare labels**:
```bash
curl -s http://localhost:8000/api/tree | grep "left_label.*£"
# Expected: Multiple matches with £ symbol
```

**3. Check age labels**:
```bash
curl -s http://localhost:8000/api/tree | grep "left_label.*yrs"
# Expected: Multiple matches with yrs suffix
```

### Visual Testing
1. Navigate to frontend application
2. View decision tree visualization
3. Verify:
   - ✓ Donut charts are visible at all nodes
   - ✓ Fare splits show "≤ £29" format
   - ✓ Age splits show "≤ 16 yrs" format
   - ✓ Sex splits show "female" / "male"
   - ✓ Class splits show "1st class" format

---

## Files Modified

### Backend
- `backend/models/decision_tree.py`
  - Line 117-119: Fixed class count calculation (multiply proportions by samples)
  - Line 172-175: Added fare formatting with £ symbol and integer rounding
  - Line 176-179: Added age formatting with "yrs" suffix and integer rounding

### No Frontend Changes Required
- Frontend visualization automatically uses the labels from backend API
- No code changes needed in `DecisionTreeViz.jsx` or `DecisionTreeVizHorizontal.jsx`

---

## User Impact

### Before
- **Critical Bug**: No donut charts visible - users couldn't see class distributions
- **Confusing Labels**: "≤ 28.9" and "≤ 16.5" lacked context and units

### After
- **Bug Fixed**: All donut charts render correctly showing died/survived distribution
- **Clear Labels**: "≤ £29" and "≤ 16 yrs" are immediately understandable
- **Better UX**: No mental math required to understand what values represent

### Example User Experience

**Viewing the decision tree**:

1. **Root Node Split** (sex):
   - Left: "female" → 206 samples shown in donut (class distribution visible)
   - Right: "male" → 365 samples shown in donut (class distribution visible)

2. **Fare Split**:
   - "≤ £29" → User immediately knows this is about ticket price
   - Can relate to historical context (1st class vs 3rd class fares)

3. **Age Split**:
   - "≤ 16 yrs" → Clear this is about children vs adults
   - Natural age representation users expect

---

## Design Decisions

### Why Currency Symbol (£) for Fare
- **Historical Accuracy**: Titanic fares were in British pounds
- **Immediate Recognition**: £ symbol universally recognized as currency
- **Visual Clarity**: Distinguishes fare from other numeric features

### Why "yrs" for Age
- **Brevity**: "yrs" shorter than "years" - saves space
- **Clarity**: Unambiguous unit
- **Consistency**: Matches common abbreviation usage

### Why Integer Rounding
- **Natural Communication**: People say "16 years old" not "16.5 years old"
- **Cleaner Display**: Less visual clutter than decimals
- **Sufficient Precision**: For decision boundaries, nearest integer is adequate
- **Better UX**: Easier to scan and process visually

---

## Git History

### Commits

1. **f5e10e4** - Fix: Correct class count calculation in decision tree nodes
   - Fixed donut chart rendering bug
   - Pushed to both GitHub and HuggingFace

2. **(Pending)** - Enhance: Add currency symbols and units to edge labels
   - Fare values with £ symbol
   - Age values with "yrs" suffix
   - Integer rounding for both

---

## Deployment

### Local Development
- Backend server restarted to pick up changes
- Cache cleared via `get_trained_model.cache_clear()`

### Production
- Changes pushed to:
  - GitHub: `https://github.com/julianay/titanic.git`
  - HuggingFace: `https://huggingface.co/spaces/bigpixel/titanic`
- HuggingFace Space will automatically rebuild

---

## Future Considerations

### Potential Enhancements

1. **Internationalization**:
   - Support different currency symbols based on locale
   - Translate "yrs" to other languages

2. **Configurable Units**:
   - Allow users to toggle between metric/imperial
   - Different date formats for age display

3. **Tooltip Enhancement**:
   - Show exact decimal value on hover
   - Explain rounding in tooltip

4. **Accessibility**:
   - Ensure screen readers announce units correctly
   - ARIA labels for currency and age values

---

## Related Documentation

- `DECISION_TREE_FEATURES.md` - Decision tree visualization features
- `CHANGELOG_DEC26_2025.md` - Previous SHAP waterfall enhancements
- Frontend components:
  - `frontend/src/components/visualizations/DecisionTreeViz.jsx`
  - `frontend/src/components/visualizations/DecisionTreeVizHorizontal.jsx`

---

## Conclusion

These changes transform the decision tree from broken (no donuts) to polished and user-friendly:

1. **Critical Fix**: Restored donut chart rendering by fixing class count calculation
2. **UX Enhancement**: Added meaningful units and symbols to edge labels
3. **Data Clarity**: Integer rounding makes values natural and scannable

The decision tree visualization is now both technically correct and highly accessible to users of all technical backgrounds.

---

## UI/UX Enhancements - Cohort Display and Chat Sectioning

### Overview
Added cohort display header and improved chat message grouping for better user context and visual hierarchy.

---

### 4. Enhancement: Cohort Display Header

**Files Modified**:
- `frontend/src/components/ModelComparisonViewAlt.jsx`

**Lines Modified**: 1, 12, 55-66

#### Problem
Users couldn't easily see which passenger cohort they were currently viewing across the visualizations. The context was only available in chat messages but not prominently displayed above the visualizations.

#### Solution
- Added a prominent h3 heading above all visualizations showing the current cohort
- Supports both single cohort and comparison mode display
- Dynamically updates when user changes selections

**Implementation**:
```jsx
// Import formatting utility
import { formatPassengerDescription } from '../utils/cohortPatterns'

// Display current cohort or comparison
<h3 className="text-lg font-semibold" style={{ color: UI_COLORS.textPrimary }}>
  Showing: {activeComparison && hasQuery ? (
    <>
      <span style={{ color: '#60a5fa' }}>{activeComparison.labelA}</span>
      {' vs '}
      <span style={{ color: '#fb923c' }}>{activeComparison.labelB}</span>
    </>
  ) : (
    formatPassengerDescription(passengerData.sex, passengerData.pclass, passengerData.age, passengerData.fare)
  )}
</h3>
```

**Display Examples**:
- **Single mode**: "Showing: 8-year-old female in 1st class, £84 fare"
- **Comparison mode**: "Showing: <span style="color: blue">1st class women</span> vs <span style="color: orange">3rd class men</span>"

**Impact**:
- Users always know which cohort they're analyzing
- Color-coded comparison labels match visualization colors
- Positioned above both Decision Tree and XGBoost sections
- Consistent with the cohort formatting used throughout the app

---

### 5. Enhancement: Chat Message Sectioning

**Files Modified**:
- `frontend/src/components/ChatPanel.jsx`

**Lines Modified**: 148-276

#### Problem
Chat messages appeared as a continuous stream without visual separation between different conversation exchanges. The most recent message didn't stand out from the chat history.

#### Solution
- Grouped messages into sections (user request + assistant response(s))
- Applied distinct background styling to newest section vs previous sections
- Added rounded corners and padding to each section for better visual separation

**Implementation**:
```jsx
// Group messages into sections
const sections = []
let currentSection = []

messages.forEach((msg, idx) => {
  if (msg.role === 'user') {
    // Start a new section
    if (currentSection.length > 0) {
      sections.push(currentSection)
    }
    currentSection = [msg]
  } else {
    // Add to current section
    currentSection.push(msg)
  }
})

// Render sections with different backgrounds
const isLastSection = sectionIdx === sections.length - 1
const sectionBgClass = isLastSection
  ? 'bg-gray-800 bg-opacity-40'  // Lighter background for newest
  : 'bg-gray-900 bg-opacity-20'  // Darker background for history

<div className={`${sectionBgClass} rounded-lg p-3 space-y-3`}>
  {/* Messages in section */}
</div>
```

**Visual Styling**:
- **Newest section**: `bg-gray-800 bg-opacity-40` (lighter, more prominent)
- **Previous sections**: `bg-gray-900 bg-opacity-20` (darker, subdued)
- **Rounded corners**: `rounded-lg` on each section container
- **Padding**: `p-3` for spacing within sections
- **Message spacing**: `space-y-3` between messages in a section

**Impact**:
- Clear visual hierarchy between current and past conversations
- Easier to focus on the latest exchange
- Better visual grouping of related messages (request + response)
- Improved readability with section boundaries
- Maintains chat history visibility while emphasizing current context

---

## Files Modified Summary

### Frontend Changes
- `frontend/src/components/ModelComparisonViewAlt.jsx`
  - Added import for `formatPassengerDescription` utility
  - Added cohort display header (h3) above visualizations
  - Supports both single and comparison mode display

- `frontend/src/components/ChatPanel.jsx`
  - Implemented message grouping logic (sections)
  - Added differential styling for newest vs previous sections
  - Enhanced visual hierarchy with background colors and spacing

---

## User Experience Improvements

### Before
- **No cohort context**: Users had to scroll through chat to remember which cohort they were viewing
- **Flat chat history**: All messages had equal visual weight, making it hard to focus on current conversation

### After
- **Always visible cohort**: Prominent header shows exactly what's being displayed
- **Visual hierarchy**: Latest conversation stands out with lighter background
- **Better organization**: Messages grouped into logical sections (question + answer)
- **Consistent colors**: Comparison labels use same colors as visualizations (blue/orange)

---

## Design Decisions

### Why h3 for Cohort Display
- Semantic HTML hierarchy (h2 for section titles, h3 for subsection)
- Appropriate visual weight without overpowering content
- Consistent with overall typography scale

### Why Lighter Background for Newest Section
- Draws eye to current context naturally
- Maintains visibility of chat history (not completely hidden)
- Subtle enough to not be distracting
- Common pattern in messaging interfaces

### Why Section-Based Grouping
- Mirrors natural conversation flow (question → answer)
- Easier to scan for specific exchanges
- Handles multiple assistant responses to one user query
- Prevents orphaned messages

---

## Testing

### Visual Verification
1. Load application with default cohort
   - ✓ Header shows "Showing: 8-year-old female in 1st class, £84 fare"
2. Select different cohort
   - ✓ Header updates to show new cohort
3. Trigger comparison (e.g., "women vs men")
   - ✓ Header shows "Showing: Women vs Men" with color coding
4. Send multiple chat messages
   - ✓ Each user query + response is grouped in a section
   - ✓ Latest section has lighter background
   - ✓ Previous sections have darker background

---

## Future Enhancements

### Potential Additions

1. **Cohort History**:
   - Allow clicking on previous cohorts in chat to restore them
   - Visual timeline of cohort explorations

2. **Section Collapse**:
   - Ability to collapse older sections to save space
   - Expand on click to review past conversations

3. **Section Timestamps**:
   - Show when each conversation exchange occurred
   - Help users track their exploration timeline

4. **Copy Section**:
   - Button to copy entire section (question + answer)
   - Useful for sharing insights
