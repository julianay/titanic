# Cohort Comparison Feature

## Overview

Users can now compare survival rates between different passenger cohorts directly in the chat interface. The system detects comparison queries and displays:
1. **Side-by-side prediction cards** showing survival probabilities for both groups
2. **Dual path visualization** in the decision tree showing where each cohort travels
3. **Dual SHAP waterfall charts** (NEW!) showing feature contributions for both cohorts side-by-side

**UPDATES**:
- **Dec 20, 2025 (PM)**: **Dual SHAP waterfall charts** - Comparison mode now shows side-by-side SHAP explanations for both cohorts!
- **Dec 20, 2025 (AM)**: **Fixed comparison mode clearing** - Comparison paths now properly clear when switching to single path queries
- **Dec 19, 2025**: **Chat-centric predictions** - All predictions now appear in chat with both models shown!
- **Dec 17, 2025 (AM)**: Added **dynamic comparisons** - compare ANY two cohorts!
- **Dec 17, 2025 (PM)**: Added **dual path visualization** - see both paths on the decision tree!

## Features

### Dynamic Comparison System

The comparison system now intelligently parses natural language to extract ANY two cohorts for comparison. No need for hardcoded patterns!

**Examples**:
- "1st class women vs 3rd class men"
- "compare children vs elderly women"
- "rich men against poor women"
- "young 1st class passengers vs old 3rd class passengers"
- "2nd class children vs 3rd class adults"

**How it works**:
1. Detects comparison keywords (vs, versus, against)
2. Splits query into two parts
3. Parses each part using existing NLP system
4. Generates descriptive labels automatically
5. Displays side-by-side comparison cards

### Fallback Patterns

For very simple queries, hardcoded patterns provide cleaner labels:
- "women vs men" → Clear labels without extra details
- "children vs adults" → Standardized age comparison
- "1st class vs 3rd class" → Class-only comparison

### Example Queries

**Simple comparisons** (hardcoded fallback):
- "compare women vs men"
- "children against adults"
- "1st class versus 3rd class"

**Complex comparisons** (dynamic parsing):
- "1st class women vs 3rd class men"
- "compare elderly women vs young men"
- "rich children against poor adults"
- "2nd class women vs 1st class women"
- "young 3rd class passengers vs elderly 1st class passengers"

### Dual Path Visualization (NEW!)

When comparing two cohorts, the decision tree now highlights **both paths simultaneously** in different colors:

**Visual Design**:
- **Path A** (first cohort): Blue (`#218FCE`) - matches app's primary color
- **Path B** (second cohort): Orange (`#FF7F50`) - provides clear contrast
- Both paths maintain variable stroke width based on passenger counts
- Glowing shadows make paths easy to distinguish

**How it works**:
1. User enters comparison query (e.g., "1st class women vs 3rd class men")
2. Chat displays comparison card with predictions
3. Decision tree automatically highlights BOTH paths:
   - Blue path traces where "1st class women" go through the tree
   - Orange path traces where "3rd class men" go through the tree
4. Users can visually see where the paths diverge and converge

**Benefits**:
- **Visual insight**: See exactly how the model treats each cohort differently
- **Path divergence**: Identify which features cause different outcomes
- **Educational**: Understand decision tree logic through visual comparison
- **Interactive**: Works with any dynamic comparison query

**Example**: "1st class women vs 3rd class men"
- Both cohorts start at root (sex decision)
- Paths diverge at the first split (sex <= 0.5)
- Blue path (women) goes left, orange path (men) goes right
- Paths continue through different branches showing different survival outcomes

### Dual SHAP Waterfall Charts (NEW! - Dec 20, 2025)

When comparing two cohorts, the XGBoost SHAP section now displays **two waterfall charts side-by-side**, allowing users to visually compare how each feature contributes to the predictions for both cohorts.

**Visual Design**:
- **Cohort A** (left chart): Labeled with dynamic cohort name (e.g., "Women", "1st class women")
- **Cohort B** (right chart): Labeled with dynamic cohort name (e.g., "Men", "3rd class men")
- Charts use actual cohort labels (not "Cohort A" / "Cohort B")
- Color coding matches decision tree (blue header for A, orange header for B)
- Responsive layout: Charts automatically resize to fit container width

**How it works**:
1. User enters comparison query (e.g., "compare 1st class women vs 3rd class men")
2. System fetches SHAP explanations for both cohorts in parallel
3. Two waterfall charts display side-by-side showing feature contributions
4. Global feature importance chart moves below the waterfalls (full width)
5. Users can directly compare which features matter most for each cohort

**Single Mode (No Comparison)**:
- Shows one SHAP waterfall chart + global feature importance side-by-side
- Original layout preserved for non-comparison queries

**Benefits**:
- **Direct comparison**: See how the same features affect different cohorts differently
- **Visual insights**: Identify which features drive the survival gap between cohorts
- **Educational**: Understand that model explanations are instance-specific
- **Responsive**: Charts automatically adapt to screen size and container width

**Example**: "1st class women vs 3rd class men"
- **Left chart (1st class women)**:
  - Sex contributes heavily to survival (+0.45)
  - Pclass adds additional boost (+0.35)
  - Age and fare have minor effects

- **Right chart (3rd class men)**:
  - Sex strongly decreases survival (-0.40)
  - Pclass further decreases survival (-0.25)
  - Age and fare have minimal impact

**Key Insight**: The waterfall comparison visually demonstrates why the survival gap exists - both sex AND class push the predictions in opposite directions.

**Technical Implementation**:

**Files Modified**:
- `/frontend/src/components/ModelComparisonView.jsx` (lines 27-33, 84-156)
  - Added dual `useSHAPExplanation` hooks for cohortA and cohortB
  - Conditional rendering based on `activeComparison` state
  - Dynamic chart titles using `activeComparison.labelA` and `activeComparison.labelB`
  - Layout switches between single and comparison modes

- `/frontend/src/components/visualizations/SHAPWaterfall.jsx` (lines 1, 19-40, 158, 216-218)
  - Added `ResizeObserver` to detect container width changes
  - Removed hardcoded width parameter (now fully responsive)
  - Uses `containerWidth` state that adapts to parent container
  - Added `w-full` classes for proper container sizing

**Responsive Behavior**:
```javascript
// Observe container size changes
useEffect(() => {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const width = entry.contentRect.width
      if (width > 0) {
        setContainerWidth(width)
      }
    }
  })
  resizeObserver.observe(containerRef.current)
  return () => resizeObserver.disconnect()
}, [])
```

**Data Fetching**:
```javascript
// Fetch SHAP data for both cohorts when in comparison mode
const { data: shapDataA, loading: shapLoadingA } = useSHAPExplanation(
  activeComparison?.cohortA || passengerData
)
const { data: shapDataB, loading: shapLoadingB } = useSHAPExplanation(
  activeComparison?.cohortB || passengerData
)
```

**Layout Structure**:
```jsx
{activeComparison && hasQuery ? (
  <>
    {/* Two Waterfalls Side-by-Side */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div>
        <h3>{activeComparison.labelA}</h3>
        <SHAPWaterfall data={shapDataA} />
      </div>
      <div>
        <h3>{activeComparison.labelB}</h3>
        <SHAPWaterfall data={shapDataB} />
      </div>
    </div>
    {/* Global Importance Below */}
    <div className="mb-6">
      <GlobalFeatureImportance />
    </div>
  </>
) : (
  /* Single Mode: One Waterfall + Importance Side-by-Side */
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <SHAPWaterfall data={shapData} />
    <GlobalFeatureImportance />
  </div>
)}
```

**Caching & Performance**:
- Each waterfall chart uses the existing `useSHAPExplanation` hook
- Built-in LRU cache (max 100 entries) prevents redundant API calls
- 500ms debouncing reduces server load
- Parallel fetching for both cohorts (no sequential delays)

**UI Improvements**:
- Removed redundant prediction cards from left panel (predictions already in chat)
- Cleaner visual hierarchy focusing on explanatory visualizations
- More screen space for side-by-side comparisons

### Bug Fix: Comparison Mode Clearing (Dec 20, 2025)

Fixed a critical issue where comparison path highlighting persisted when switching back to single path queries.

**Problem**:
1. User views comparison (e.g., "women vs men") → tree shows dual paths (blue + orange)
2. User then queries single path (e.g., "women" or clicks preset button)
3. Bug: Comparison paths remained visible, blocking single path display
4. Result: Single path highlighting didn't appear or appeared incorrectly

**Root Cause**:
- When switching from comparison to single path mode, the comparison CSS classes (`path-a`, `path-b`, `path-shared`) weren't being cleared
- The `activeComparison` state wasn't cleared when using preset buttons
- D3.js selections retained comparison styling even when new highlighting was applied

**Solution** (2 fixes):

**Fix 1: Clear comparison classes in DecisionTreeViz** (`DecisionTreeViz.jsx` lines 513-532)
```javascript
// Exiting comparison mode - explicitly clear all comparison classes first
if (!comparisonData && svgRef.current) {
  const svg = svgRef.current
  svg.selectAll('.pie-chart')
    .classed('path-a', false)
    .classed('path-b', false)
    .classed('path-shared', false)
  svg.selectAll('.node text')
    .classed('path-a', false)
    .classed('path-b', false)
    .classed('path-shared', false)
  svg.selectAll('.link')
    .classed('path-a', false)
    .classed('path-b', false)
    .classed('path-shared', false)
  svg.selectAll('.edge-label')
    .classed('path-a', false)
    .classed('path-b', false)
    .classed('path-shared', false)
}
```

**Fix 2: Clear activeComparison in preset handlers** (`App.jsx` lines 41, 51)
```javascript
// Handle preset selection - update all values at once
const handlePresetSelect = (presetValues) => {
  setPassengerData(presetValues)
  setHasQuery(true)
  setActiveComparison(null) // Clear any active comparison
}

// Handle preset chat message
const handlePresetChat = (preset) => {
  // ... existing code ...
  setHasQuery(true)
  setActiveComparison(null) // Clear any active comparison
  // ... existing code ...
}
```

**Files Modified**:
- `/frontend/src/components/visualizations/DecisionTreeViz.jsx` - Added explicit comparison class clearing
- `/frontend/src/App.jsx` - Clear `activeComparison` state in both preset handlers

**Testing**:
- ✅ Comparison → typed single query → clears correctly
- ✅ Comparison → preset button → clears correctly
- ✅ Single path → comparison → shows dual paths
- ✅ Multiple switches between modes → works consistently

**Impact**: All transition paths now work seamlessly, improving user experience when exploring different queries.

### Chat-Centric Predictions (Dec 19, 2025)

All prediction results now appear **in the chat** as interactive cards, making the chat the primary interface for viewing results.

**Single Passenger Queries**:
- New `SinglePredictionCard` component shows both models side-by-side
- Example query: "woman in 1st class"
- Chat displays:
  ```
  ┌────────────────────────────────────────┐
  │ 30-year-old female in 1st class, £84   │
  │                                         │
  │  ┌──────────────┐  ┌──────────────┐   │
  │  │ Decision Tree│  │   XGBoost    │   │
  │  │     92%      │  │     94%      │   │
  │  │   Survived   │  │   Survived   │   │
  │  └──────────────┘  └──────────────┘   │
  └────────────────────────────────────────┘
  ```

**Comparison Queries**:
- Enhanced `ComparisonCard` now shows **all 4 predictions** (2 models × 2 cohorts)
- Example query: "women vs men"
- Chat displays:
  ```
  ┌────────────────────────────────────────────────────────┐
  │ Comparing 2nd class women vs 2nd class men             │
  │                                                         │
  │  Women                   Men                           │
  │  ┌──────────────┐       ┌──────────────┐              │
  │  │ Decision Tree│       │ Decision Tree│              │
  │  │     74%      │       │     19%      │              │
  │  │   Survived   │       │     Died     │              │
  │  └──────────────┘       └──────────────┘              │
  │  ┌──────────────┐       ┌──────────────┐              │
  │  │   XGBoost    │       │   XGBoost    │              │
  │  │     76%      │       │     21%      │              │
  │  │   Survived   │       │     Died     │              │
  │  └──────────────┘       └──────────────┘              │
  │                                                         │
  │  Women had a 55% higher survival rate (XGBoost)       │
  └────────────────────────────────────────────────────────┘
  ```

**Empty State**:
- On initial load, prediction cards are hidden
- Left panel shows: "Make a query in the chat to see predictions"
- Decision tree displays without highlighting
- After first query, both chat and left panel update

**Benefits**:
- **Consistency**: Chat is now the single source of truth for results
- **Comparison**: Easy to compare Decision Tree vs XGBoost predictions
- **History**: All queries and results preserved in chat history
- **Clean UI**: No duplicate information between chat and left panel

## Implementation

### Files Created

#### 1. `/frontend/src/components/SinglePredictionCard.jsx` (NEW - Dec 19, 2025)
React component that displays both model predictions for a single passenger in chat.

**Features:**
- Fetches predictions from both models in parallel
- Shows Decision Tree and XGBoost side-by-side
- Color-coded cards (green/yellow/red based on survival probability)
- Shows survival percentage and prediction outcome for each model
- Whole number percentage formatting (e.g., 92% not 92.0%)
- Loading states with skeleton placeholders

**Props:**
- `passengerData` - Passenger parameters {sex, pclass, age, fare}
- `label` - Descriptive label (e.g., "30-year-old female in 1st class, £84")

#### 2. `/frontend/src/components/ComparisonCard.jsx`
React component that displays side-by-side survival predictions for comparisons.

**Updated Features (Dec 19, 2025):**
- Now shows **both models** for each cohort (4 predictions total)
- Stacked layout: Decision Tree above XGBoost for each cohort
- Whole number percentage formatting for consistency
- Color-coded cards (green/yellow/red based on survival probability)
- Shows survival percentage and prediction outcome for each model
- Displays difference summary at bottom (using XGBoost)
- Loading states with skeleton placeholders

**Props:**
- `cohortA` - First cohort passenger data {sex, pclass, age, fare}
- `cohortB` - Second cohort passenger data
- `labelA` - Label for first cohort (e.g., "Women")
- `labelB` - Label for second cohort (e.g., "Men")
- `description` - Description of the comparison

### Files Modified

#### 3. `/frontend/src/App.jsx` (Updated Dec 19, 2025)
**Chat-Centric Changes:**
- Added `hasQuery` state to track if user has made any queries
- Updated `handleSendMessage()` to create `prediction`-type messages instead of text
- Updated `handlePresetChat()` to create `prediction`-type messages
- Sets `hasQuery = true` when user interacts with chat
- Passes `hasQuery` to `ModelComparisonView` to control empty state
- Removed `matchToCohort` usage (predictions now fetched by cards)

**Message Structure:**
```javascript
// Regular query creates prediction message
{
  role: 'assistant',
  type: 'prediction',
  passengerData: { sex: 0, pclass: 1, age: 30, fare: 84 },
  label: "30-year-old female in 1st class, £84"
}

// Comparison query creates comparison message
{
  role: 'assistant',
  type: 'comparison',
  comparison: { cohortA, cohortB, labelA, labelB, description }
}
```

#### 4. `/frontend/src/components/ChatPanel.jsx` (Updated Dec 19, 2025)
- Imported `SinglePredictionCard` component
- Added rendering logic for `type: 'prediction'` messages
- Renders `SinglePredictionCard` for regular queries
- Renders `ComparisonCard` for comparison queries
- Updated message type documentation in comments

#### 5. `/frontend/src/components/ModelComparisonView.jsx` (Updated Dec 19, 2025)
- Added `hasQuery` prop
- Conditionally shows/hides prediction cards based on `hasQuery`
- Shows placeholder text when `hasQuery = false`: "Make a query in the chat to see predictions"
- Passes `null` to `DecisionTreeViz` for `passengerValues` and `comparisonData` when no query
- Prevents API calls on initial load until user interacts

#### 6. `/frontend/src/utils/cohortPatterns.js`

**NEW FUNCTIONS:**

**`generateCohortLabel(params)`** - Generates descriptive labels from passenger parameters
- Input: `{ sex: 0, pclass: 1, age: 30, fare: 84 }`
- Output: `"1st class women"`
- Adds age notes: `(children)`, `(elderly)`, `(young)`
- Adds fare notes: `(high fare)`, `(low fare)` if significantly different from class average
- Examples:
  - `{ sex: 0, pclass: 1, age: 8, fare: 84 }` → `"1st class women (children)"`
  - `{ sex: 1, pclass: 3, age: 65, fare: 13 }` → `"3rd class men (elderly)"`

**`detectComparison(queryText)`** - Now uses **dynamic parsing**!
1. **Primary approach** (new): Dynamic parsing
   - Splits query on comparison keywords (vs, versus, against)
   - Parses both sides using `parsePassengerQuery()`
   - Generates labels automatically using `generateCohortLabel()`
   - Works for ANY combination: "1st class women vs 3rd class men"

2. **Fallback approach**: Hardcoded patterns for simple queries
   - "women vs men" → Clean labels without extra qualifiers
   - "children vs adults" → Standardized age comparison
   - "1st class vs 3rd class" → Class-only comparison

**Algorithm:**
```javascript
// 1. Check for comparison keywords
if (!hasComparisonKeyword) return false

// 2. Try dynamic parsing
const [leftText, rightText] = splitOnComparisonKeyword(query)
const cohortA = parsePassengerQuery(leftText)
const cohortB = parsePassengerQuery(rightText)

if (cohortA && cohortB) {
  return {
    isComparison: true,
    cohortA, cohortB,
    labelA: generateCohortLabel(cohortA),
    labelB: generateCohortLabel(cohortB),
    description: `Comparing ${labelA} vs ${labelB}`
  }
}

// 3. Fall back to hardcoded patterns if parsing fails
return checkHardcodedPatterns(query)
```

#### 3. `/frontend/src/App.jsx`
- Imported `detectComparison` function
- Updated `handleSendMessage()` to check for comparisons first
- Adds comparison messages with `type: 'comparison'` and comparison data
- Updated error message to mention comparison queries

#### 4. `/frontend/src/components/ChatPanel.jsx`
- Imported `ComparisonCard` component
- Updated message rendering to handle `type: 'comparison'` messages
- Renders `ComparisonCard` for comparison messages
- Updated suggestion button from "First class child" to "Compare women vs men"

#### 5. `/frontend/src/App.jsx` (Dual Path Visualization)
- Added `activeComparison` state to track current comparison
- Updates `activeComparison` when user makes comparison query
- Clears `activeComparison` when switching to regular queries
- Passes `activeComparison` to `ModelComparisonView`
- **Dec 20, 2025 Update**: Added `setActiveComparison(null)` to both `handlePresetSelect` and `handlePresetChat` (lines 41, 51)

#### 6. `/frontend/src/components/ModelComparisonView.jsx`
- Added `activeComparison` prop
- Passes comparison data to `DecisionTreeViz`

#### 7. `/frontend/src/components/visualizations/DecisionTreeViz.jsx`
- Added `comparisonData` prop
- Added `updateDualPathHighlight(pathA, pathB)` function:
  - Traces two paths simultaneously through the tree
  - Applies `path-a` and `path-b` CSS classes
  - Clears all other highlight states
- Updated `useEffect` to detect comparison mode:
  - If `comparisonData` exists, calls `updateDualPathHighlight()`
  - Otherwise, calls `updateTreeHighlight()` for single path
- Added CSS styles for dual path highlighting:
  - `.path-a`: Blue styling (#218FCE) for first cohort
  - `.path-b`: Orange styling (#FF7F50) for second cohort
  - Applied to links, nodes, text, and edge labels
- **Dec 20, 2025 Update**: Added explicit clearing of comparison classes when exiting comparison mode (lines 513-532)

**Technical Implementation**:
```javascript
// Detect comparison mode
if (comparisonData && comparisonData.cohortA && comparisonData.cohortB) {
  const pathA = tracePath(treeData, comparisonData.cohortA)
  const pathB = tracePath(treeData, comparisonData.cohortB)
  updateDualPathHighlight(pathA, pathB)
  return
}

// Normal single path mode
const fullPath = tracePath(treeData, passengerValues)
updateTreeHighlight(fullPath, isTutorialMode)
```

## User Experience

### Chat Flow

**User input:**
```
> compare women vs men
```

**Response (ComparisonCard):**
```
┌─────────────────────────────────────────────────┐
│ Comparing survival rates between women and men  │
│ (2nd class, age 30)                             │
│                                                  │
│  ┌──────────┐      ┌──────────┐                │
│  │  Women   │      │   Men    │                │
│  │  72.5%   │      │  18.3%   │                │
│  │ Survived │      │   Died   │                │
│  └──────────┘      └──────────┘                │
│                                                  │
│  Women had a 54.2% higher survival rate        │
└─────────────────────────────────────────────────┘
```

### Visual Design

**Comparison Cards:**
- Dark background with gray border
- Description text at top
- Two-column grid layout
- Color-coded by survival probability:
  - Green: ≥70% survival
  - Yellow: 40-69% survival
  - Red: <40% survival
- Large percentage display
- Survival outcome label
- Difference summary at bottom

**Loading State:**
- Skeleton placeholders with pulse animation
- Shows description while loading predictions

## Technical Details

### API Integration

The ComparisonCard makes parallel API calls:
```javascript
Promise.all([
  fetch('/api/predict/both', { body: cohortA }),
  fetch('/api/predict/both', { body: cohortB })
])
```

Uses XGBoost predictions (`dataA.xgboost`) for higher accuracy.

### Message Data Structure

**Regular Message:**
```javascript
{
  role: 'assistant',
  content: 'Text response here...'
}
```

**Comparison Message:**
```javascript
{
  role: 'assistant',
  type: 'comparison',
  comparison: {
    isComparison: true,
    cohortA: { sex: 0, pclass: 2, age: 30, fare: 20 },
    cohortB: { sex: 1, pclass: 2, age: 30, fare: 20 },
    labelA: "Women",
    labelB: "Men",
    description: "Comparing survival rates between women and men (2nd class, age 30)"
  }
}
```

### Comparison Detection Logic

1. Check for comparison keywords using regex
2. Try to match specific patterns (women vs men, classes, ages)
3. Return structured comparison data with default passenger parameters
4. Falls back to regular query parsing if no comparison detected

### Default Parameters

**UPDATE**: With dynamic parsing, defaults are now determined by the NLP parser:
- Unspecified sex defaults to female (sex: 0)
- Unspecified class defaults to 2nd class (pclass: 2)
- Unspecified age defaults to 30
- Fare is automatically set based on class (1st=£84, 2nd=£20, 3rd=£13)

The parser fills in missing attributes to create complete cohort definitions.

## Benefits of Dynamic Comparison

**Flexibility**:
- Users can compare ANY two cohorts naturally
- No need to add hardcoded patterns for every combination
- Leverages existing NLP parsing system

**Natural language**:
- "1st class women vs 3rd class men" → Parsed automatically
- "rich children against poor adults" → Works!
- "elderly 1st class vs young 3rd class" → Works!

**Automatic labeling**:
- Labels are generated from parsed parameters
- Includes relevant details (age notes, fare notes)
- Example: "1st class women (children)" vs "3rd class men (elderly)"

## Future Enhancements

Potential additions:
1. ~~**Custom comparisons**: "compare 1st class women vs 3rd class men"~~ ✅ **DONE** (Dec 17, 2025)
2. ~~**More cohorts**: Elderly vs young, rich vs poor, etc.~~ ✅ **DONE** (Dec 17, 2025)
3. **Multi-way comparison**: Compare 3+ cohorts at once
4. **Visualization**: Add small charts or graphs to comparison cards
5. **Historical context**: Add historical survival statistics from actual Titanic data
6. **Share comparisons**: Generate shareable links for specific comparisons

## Testing Checklist

- [x] Build succeeds without errors
- [ ] "compare women vs men" shows correct predictions
- [ ] "1st class vs 3rd class" works
- [ ] "children vs adults" works
- [ ] Color coding matches survival probabilities
- [ ] Loading states appear during API calls
- [ ] Error handling works if API fails
- [ ] Chat auto-scrolls to show comparison card
- [ ] Suggestion button triggers comparison
- [ ] Main visualizations remain unchanged (still show single passenger)

## Example Scenarios

### Scenario 1: Gender Comparison
**Query:** "compare women vs men"
**Result:** Women show ~72% survival, Men show ~18% survival
**Insight:** 54% difference highlights "women and children first" protocol

### Scenario 2: Class Comparison
**Query:** "1st class versus 3rd class"
**Result:** 1st class ~78% survival, 3rd class ~24% survival
**Insight:** 54% difference shows wealth/location impact

### Scenario 3: Age Comparison
**Query:** "children against adults"
**Result:** Children ~82% survival, Adults ~38% survival
**Insight:** 44% difference confirms children were prioritized

### Scenario 4: Complex Multi-Attribute Comparison (NEW)
**Query:** "1st class women vs 3rd class men"
**Result:** 1st class women ~96% survival, 3rd class men ~14% survival
**Insight:** 82% difference shows combined effect of gender, class, and location

### Scenario 5: Age + Class Comparison (NEW)
**Query:** "compare children in 1st class vs children in 3rd class"
**Result:** 1st class children ~100% survival, 3rd class children ~34% survival
**Insight:** Even children's survival depended heavily on class

### Scenario 6: Age + Gender Comparison (NEW)
**Query:** "elderly women against young men"
**Result:** Elderly women ~75% survival, Young men ~12% survival
**Insight:** Gender mattered more than age for survival

## Known Limitations

1. ~~**Single attribute comparisons only**: Can't yet compare "1st class women vs 3rd class men"~~ ✅ **FIXED** (Dec 17, 2025) - Now supports complex multi-attribute comparisons!
2. ~~**Fixed defaults**: Other attributes use preset defaults (can't customize)~~ ✅ **FIXED** (Dec 17, 2025) - Dynamic parsing extracts all specified attributes
3. **No trend analysis**: Doesn't show how probability changes across ranges
4. **Main UI unchanged**: Comparison doesn't update the visualizations (by design)
5. **Two cohorts only**: Currently limited to comparing two groups (not 3+)
6. **Parsing limitations**: Very complex or ambiguous queries may not parse correctly

## Migration Notes

This feature is backward compatible:
- Existing chat queries still work
- Non-comparison queries behave exactly as before
- Only adds new functionality for comparison patterns
