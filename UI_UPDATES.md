# UI Updates

## January 12, 2026 - Prediction Label Color and Typography Updates

### Summary
Enhanced prediction label styling across visualizations for better color consistency and typography hierarchy.

### Changes Made

#### 1. Waterfall Chart - Dynamic Color Based on Probability
**File:** `frontend/src/components/visualizations/SHAPWaterfall.jsx`

- Added `getProbabilityColor()` function (lines 33-41) that matches PredictionCard color logic:
  - `> 70%`: Survived color (turquoise - `#02AE9B`)
  - `40-70%`: Uncertain color (amber - `#fbbf24`)
  - `< 40%`: Died color (warm gray - `#85785B`)
- Updated title prediction labels to use dynamic color (lines 498-502)
- Updated chart-side prediction labels (percentage and outcome) to use dynamic color (lines 397-413)
- Made parentheses use same color as prediction text instead of white (line 502)

#### 2. Waterfall Chart - Increased Label Font Size
**File:** `frontend/src/components/visualizations/SHAPWaterfall.jsx` (lines 382-413)

- Increased final prediction labels from 9-10px to 12px
- Labels now match axis label size for better readability
- Applied to all three labels: SHAP value, percentage, and outcome

#### 3. Typography - Non-Bold Parentheses
**Files:**
- `frontend/src/components/visualizations/SHAPWaterfall.jsx` (line 502)
- `frontend/src/components/visualizations/DecisionTreeViz.jsx` (lines 591-603, 747-753)
- `frontend/src/components/visualizations/DecisionTreeVizHorizontal.jsx` (lines 606-618, 762-768)

**Changes:**
- Split prediction labels into separate tspan elements for fine-grained styling
- Opening parenthesis: normal weight
- Percentage value: bold weight
- Closing parenthesis: normal weight
- Updated CSS selectors from `nth-child(2)` to `nth-child(3)` to target correct element

**Example:** `Survived (99%)` → "Survived" is bold, "99%" is bold, "(" and ")" are normal weight

#### 4. Comparison Mode - Added Person Icon
**File:** `frontend/src/components/ModelComparisonView.jsx` (lines 57-88)

- Added person icon to comparison mode header
- Icon now appears before cohort labels (e.g., "Women vs Men")
- Provides visual consistency between single and comparison modes
- Makes cohort information clearer

### Technical Details

#### Color Matching Logic
The waterfall chart now uses the exact same color logic as prediction cards:
```javascript
const getProbabilityColor = (probability) => {
  if (probability > 70) return UI_COLORS.survivedText
  if (probability >= 40) return UI_COLORS.uncertainText
  return UI_COLORS.diedText
}
```

#### Typography Hierarchy
```
Prediction Text:
- "Survived/Died": normal weight (inherited from parent)
- "(": normal weight, colored
- "99%": bold weight, colored
- ")": normal weight, colored
```

### Files Modified
1. `frontend/src/components/visualizations/SHAPWaterfall.jsx`
2. `frontend/src/components/visualizations/DecisionTreeViz.jsx`
3. `frontend/src/components/visualizations/DecisionTreeVizHorizontal.jsx`
4. `frontend/src/components/ModelComparisonView.jsx`

---

## January 9, 2026 - Tutorial Simplification

### Summary
UI improvements focused on simplifying the tutorial experience and cleaning up the interface.

## Changes Made

### 1. Model Comparison Section - Temporarily Hidden
**File:** `frontend/src/components/ModelComparisonView.jsx` (lines 236-246)

- Commented out the Model Comparison Summary section at the bottom of the visualization
- Code is preserved and can be easily restored by uncommenting
- Rationale: Section not currently in use

### 2. Tutorial Button Styling Updates
**Files:** `frontend/src/components/ChatPanel.jsx`

#### Start Tutorial Button (lines 317-325)
- Changed from primary button style to chip style
- Removed emoji (📚) from button text
- Now styled consistently with other suggestion chips
- Uses `chipBg`, `chipBgHover`, `chipText`, `chipTextHover` colors

#### Tutorial Navigation Buttons (lines 237-254)
- Changed Next/Skip buttons from pill-shaped buttons to blue text links
- Removed all buttons on the last tutorial step (step 4)
- Now uses `linkColor` and `hover:underline` styling
- Matches the Edit link styling throughout the app

### 3. Emoji Removal
**Files:**
- `frontend/src/hooks/useTutorial.js` (lines 13-47)
- `frontend/src/components/ChatPanel.jsx` (line 264)

#### Tutorial Messages
- Removed 👋 emoji from welcome message (step 0)
- Updated all tutorial step messages to be more direct and conversational
- Tutorial copy now focuses on guiding users through the visualization

#### Assistant Messages
- Removed ✨ emoji that appeared before all regular assistant text messages
- Cleaner, more professional appearance

### 4. Tutorial Flow Updates
**File:** `frontend/src/hooks/useTutorial.js`

- Tutorial now has 5 steps (0-4):
  - Step 0: Welcome and introduction
  - Step 1: Sex feature explanation
  - Step 2: Passenger class explanation
  - Step 3: Age feature explanation
  - Step 4: Fare feature explanation (final - no buttons shown)
- Last step displays message without any buttons
- Tutorial automatically ends after viewing step 4
- Users can continue exploring on their own after tutorial completes

## Technical Details

### Button Styling Comparison

**Before (Primary Button):**
```jsx
className="px-4 py-2 text-white text-sm font-medium rounded-lg"
style={{ backgroundColor: UI_COLORS.buttonPrimaryBg }}
```

**After (Chip Style):**
```jsx
className="px-3 py-1.5 text-xs rounded-full"
style={{ backgroundColor: UI_COLORS.chipBg, color: UI_COLORS.chipText }}
```

**After (Link Style):**
```jsx
className="text-xs hover:underline"
style={{ color: UI_COLORS.linkColor }}
```

### Files Modified
1. `frontend/src/components/ModelComparisonView.jsx`
2. `frontend/src/components/ChatPanel.jsx`
3. `frontend/src/hooks/useTutorial.js`

## Future Considerations

- Model Comparison section can be restored by uncommenting lines 237-246 in `ModelComparisonView.jsx`
- Tutorial messages have been refined but can be further adjusted based on user feedback
- Button styles now follow a consistent pattern: chips for suggestions, links for navigation
