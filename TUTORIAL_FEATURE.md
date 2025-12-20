# Tutorial Feature Documentation

## Overview

The tutorial feature provides a guided, interactive walkthrough for first-time users. It automatically starts on the first visit and walks users through understanding how both the Decision Tree and XGBoost models make predictions using a specific example passenger.

## Features

### 1. **Auto-Start on First Visit**
- Automatically launches when a user visits the site for the first time
- Uses localStorage to remember if the user has seen the tutorial
- Can be manually reset for testing

### 2. **Progressive 3-Step Walkthrough**
- **Step 0**: Welcome message introducing the scenario (30-year-old woman in 1st class)
- **Step 1**: Explains how **sex** is the most important feature in both models
  - Decision Tree: Highlights first split (root → female path)
  - SHAP Waterfall: Highlights sex feature with gold glow
- **Step 2**: Shows complete prediction path
  - Decision Tree: Full path highlighting with gold effect
  - SHAP Waterfall: Highlights sex and pclass features

### 3. **Synchronized Visual Highlighting**
- **Decision Tree**: Uses selective path highlighting (first_split → full_path)
- **SHAP Waterfall**: Highlights specific feature bars with gold borders and glow effect
- Both visualizations update simultaneously during tutorial progression

### 4. **Tutorial Controls**
- Progress indicator showing current step (1 of 3, 2 of 3, 3 of 3)
- Visual progress bars
- **Next** button to advance
- **Skip** button to exit early (shown on steps 1-2)
- **Finish Tutorial** button on final step

### 5. **Chat Integration**
- Tutorial messages appear in the chat panel
- Messages are context-aware, explaining both model types simultaneously
- Skip message provides guidance on what to do next

## Implementation Architecture

### Files Created

#### 1. `/frontend/src/hooks/useTutorial.js`
Custom React hook that manages tutorial state and logic.

**Key Functions:**
- `startTutorial()`: Begins the tutorial, sets passenger to tutorial profile
- `advanceTutorial()`: Moves to next step, adds message to chat
- `skipTutorial()`: Exits tutorial, shows skip message
- `getHighlightMode()`: Returns current tree highlight mode ('first_split', 'full_path', or null)
- `getHighlightFeatures()`: Returns features to highlight in SHAP (['sex'], ['sex', 'pclass'], or null)
- `resetTutorial()`: Development helper to clear localStorage and restart

**State Management:**
- `tutorialActive` (boolean): Whether tutorial is currently running
- `tutorialStep` (0-2): Current step number
- `hasSeenTutorial` (boolean): Persisted in localStorage

#### 2. `/frontend/src/components/TutorialControls.jsx`
React component for tutorial UI controls.

**Features:**
- Progress indicator with colored bars
- Step counter ("Step 1 of 3")
- Next/Skip/Finish buttons
- Blue theme to distinguish from regular UI
- Auto-hides when tutorial is not active

### Files Modified

#### 3. `/frontend/src/App.jsx`
- Added useTutorial hook initialization
- Passes tutorial state to ModelComparisonView
- Renders TutorialControls in right panel above chat

#### 4. `/frontend/src/components/ModelComparisonView.jsx`
- Accepts `highlightMode` and `highlightFeatures` props
- Passes highlightMode to DecisionTreeViz
- Passes highlightFeatures to SHAPWaterfall

#### 5. `/frontend/src/components/visualizations/DecisionTreeViz.jsx`
- Already supports `highlightMode` prop (implemented earlier)
- Tutorial uses 'first_split' and 'full_path' modes
- Gold highlighting for tutorial mode

#### 6. `/frontend/src/components/visualizations/SHAPWaterfall.jsx`
- **NEW**: Added `highlightFeatures` prop
- Adds `bar-tutorial-highlight` class to matching feature bars
- CSS: Gold border (3px), gold glow, full opacity

## Tutorial Content

### Tutorial Passenger Profile
```javascript
{
  sex: 0,      // Female
  pclass: 1,   // 1st class
  age: 30,
  fare: 84.0   // 1st class average fare
}
```

### Step-by-Step Messages

**Step 0 (Welcome):**
> 👋 Welcome to the Explainable AI Explorer! Let me show you how these models make predictions. We'll explore a 30-year-old woman in 1st class traveling on the Titanic.

**Step 1 (First Feature - Sex):**
> Notice how both models identify **sex** as the most important feature. In the decision tree (top), women go down the left path with a 74% survival rate. In the SHAP waterfall (bottom left), being female pushes the prediction strongly toward survival (green bar).

**Step 2 (Complete Analysis):**
> Following the complete path through the tree shows a 78% survival probability for women in 1st class. The SHAP explanation shows how **sex** and **pclass** (passenger class) both contribute positively to survival. Now try exploring other passengers using the preset buttons, chat, or What-If controls!

## Usage

### For Users

The tutorial will automatically start on your first visit. You can:
1. **Follow along** by clicking "Next" through each step
2. **Skip** if you want to explore on your own
3. **Finish** on the final step to complete the tutorial

Once completed, the tutorial won't auto-start again on future visits.

### For Developers

#### To Test the Tutorial:
```javascript
// In browser console:
localStorage.removeItem('hasSeenTutorial')
// Then refresh the page
```

#### To Manually Trigger Tutorial:
```javascript
// Access via React DevTools or add a button:
tutorial.resetTutorial()  // Clears localStorage
tutorial.startTutorial()  // Manually starts tutorial
```

#### To Modify Tutorial Content:
Edit `TUTORIAL_STEPS` object in `/frontend/src/hooks/useTutorial.js`:

```javascript
const TUTORIAL_STEPS = {
  0: {
    message: "Your message here...",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: null,  // or "first_split" or "full_path"
    highlight_features: null,  // or ["sex"] or ["sex", "pclass"]
    button_text: "Next"
  },
  // ... more steps
}
```

## Visual Design

### Color Scheme
- **Tutorial Controls**: Blue theme (`bg-blue-900/20`, `border-blue-500/30`)
- **Highlighting**: Gold/yellow (`#ffd700`) with glow effects
- **Progress Bars**: Blue active (`bg-blue-500`), gray inactive (`bg-gray-600`)

### Highlighting Effects

**Decision Tree:**
- Gold stroke color
- Gold node text
- Gold edge labels
- Preserves variable stroke widths

**SHAP Waterfall:**
- Gold 3px border around highlighted bars
- Gold glow (drop-shadow filter)
- Full opacity (non-highlighted bars at 0.8 opacity)

## Integration Points

### Chat Panel Integration
Tutorial messages automatically appear in chat via:
```javascript
const tutorial = useTutorial(
  setPassengerData,  // Updates passenger controls
  (message) => setChatMessages(prev => [...prev, message])  // Adds to chat
)
```

### Passenger Controls Integration
When tutorial starts or advances, passenger values are automatically set to the tutorial profile. The What-If controls update to show:
- Sex: Female (0)
- Class: 1st (1)
- Age: 30
- Fare: 84.0

## Testing Checklist

- [x] Tutorial auto-starts on first visit (localStorage empty)
- [x] Tutorial does NOT auto-start on subsequent visits
- [x] Progress indicator updates correctly (1/3, 2/3, 3/3)
- [x] Messages appear in chat panel
- [x] Decision tree highlights correctly:
  - Step 0: No highlighting
  - Step 1: First split only (gold)
  - Step 2: Full path (gold)
  - **Fixed Dec 20, 2025:** Tutorial cohort path now highlights correctly
- [x] SHAP waterfall highlights correctly:
  - Step 0: No highlighting
  - Step 1: Sex bar highlighted (gold)
  - Step 2: Sex and pclass bars highlighted (gold)
  - **Fixed Dec 20, 2025:** Sex feature now appears in waterfall chart
- [x] Passenger controls update to tutorial passenger
- [x] Skip button works (exits tutorial, shows skip message)
- [x] Finish button works (completes tutorial)
- [x] Tutorial can be reset via localStorage.removeItem()

## Known Issues & Fixes

### Fixed Issues (Dec 20, 2025)

#### 1. Tutorial Highlighting Not Working on Decision Tree
**Issue:** Decision tree was not highlighting the tutorial cohort's path during tutorial steps.

**Cause:** `passengerValues` prop was only passed when `hasQuery` was true, but tutorial starts with `hasQuery=false`.

**Fix:** Updated `ModelComparisonView.jsx:61` to pass passenger values when tutorial is active:
```javascript
passengerValues={hasQuery || highlightMode ? passengerData : null}
```

#### 2. Sex Feature Missing from SHAP Waterfall
**Issue:** The most important feature (sex) was not appearing in the SHAP waterfall chart.

**Cause:** Backend was returning feature data without a "Base" entry, causing the frontend to mislabel the first feature (sex) as "Base".

**Fix:** Added explicit "Base" item to waterfall data in `backend/models/xgboost_model.py:138-161`.

## Future Enhancements

Potential additions:
1. **Multiple Tutorial Paths**: Different tutorials for different user types
2. **Interactive Quizzes**: Test user understanding at each step
3. **Tour Spotlights**: Highlight specific UI elements (What-If controls, preset buttons)
4. **Video Integration**: Embedded video explanations
5. **Accessibility**: Keyboard navigation, screen reader support
6. **Multi-language Support**: Tutorial messages in different languages
7. **Custom Tutorial Builder**: Admin UI to create custom tutorial flows
