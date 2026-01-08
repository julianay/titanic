# Animation Settings Guide

This document explains where all animations are configured in the application, including timing, duration, and animation types.

## Table of Contents
1. [Initial Demo Animation](#initial-demo-animation)
2. [Tutorial Animation](#tutorial-animation)
3. [Chat Panel Animations](#chat-panel-animations)
4. [Decision Tree Visualizations](#decision-tree-visualizations)
5. [SHAP Waterfall](#shap-waterfall)

---

## Initial Demo Animation

**File:** `src/hooks/useInitialAnimation.js`

Controls the auto-playing demo that highlights the decision tree path and SHAP features on page load. This animation runs automatically every time the page loads.

### Animation Steps Configuration (Lines 12-43)

Progressive animation that highlights each tree node and SHAP bar incrementally:

```javascript
const ANIMATION_STEPS = [
  {
    highlight_mode: -1,             // Empty state (no highlighting)
    highlight_features: null,
    duration: 0  // ← No wait - start immediately
  },
  {
    highlight_mode: 1,              // First tree split
    highlight_features: ["sex"],    // First SHAP bar
    duration: 500  // ← Duration for each step
  },
  {
    highlight_mode: 2,              // First two splits
    highlight_features: ["sex", "pclass"],  // First two bars
    duration: 500
  },
  {
    highlight_mode: 3,              // First three splits
    highlight_features: ["sex", "pclass", "age"],  // First three bars
    duration: 500
  },
  {
    highlight_mode: 4,              // All four splits
    highlight_features: ["sex", "pclass", "age", "fare"],  // All bars
    duration: 500
  },
  // Final state remains visible
]
```

### How to Adjust

| What to Change | Where | Current Value |
|----------------|-------|---------------|
| Each step duration | Lines 21, 26, 31, 36 | 500ms |
| Number of steps | Array length | 5 steps (empty + 4 progressive) |
| Initial delay | Line 16 | 0ms (no wait) |

**Note:**
- All durations are in milliseconds
- `highlight_mode` numbers (1, 2, 3, 4) indicate how many splits to show in the tree
- `highlight_features` arrays control which SHAP bars are highlighted (left to right)
- To add more steps, use `highlight_mode: 5, 6, etc.` and add more features to the array

---

## Tutorial Animation

**File:** `src/hooks/useTutorial.js`

Controls the manual tutorial that users can start by clicking the tutorial button. Uses the same progressive highlighting approach as the initial demo animation.

### Tutorial Steps Configuration (Lines 12-48)

The tutorial has 5 steps (0-4) that progressively highlight features:

```javascript
const TUTORIAL_STEPS = {
  0: {
    message: "👋 Welcome...",
    highlight_mode: null,  // No highlighting
    highlight_features: null,
    button_text: "Start"
  },
  1: {
    message: "Notice how both models identify **sex**...",
    highlight_mode: 1,  // First split
    highlight_features: ["sex"],
    button_text: "Next"
  },
  2: {
    message: "Next, **pclass** (passenger class)...",
    highlight_mode: 2,  // First two splits
    highlight_features: ["sex", "pclass"],
    button_text: "Next"
  },
  3: {
    message: "The model also considers **age**...",
    highlight_mode: 3,  // First three splits
    highlight_features: ["sex", "pclass", "age"],
    button_text: "Next"
  },
  4: {
    message: "Finally, **fare** (ticket price)...",
    highlight_mode: 4,  // All four splits
    highlight_features: ["sex", "pclass", "age", "fare"],
    button_text: "Finish Tutorial"
  }
}
```

### How to Adjust

| What to Change | Where | Notes |
|----------------|-------|-------|
| Tutorial passenger data | Lines 4-9 | Default: 30-year-old woman, 1st class, £84 fare |
| Step messages | Lines 14, 21, 28, 35, 42 | Update the text shown to users |
| Button labels | Lines 18, 25, 32, 39, 46 | "Start", "Next", "Finish Tutorial" |
| Number of steps | Lines 121, 133 | Currently 5 steps (0-4) |

### Tutorial Flow

1. **Step 0:** Welcome message with no highlighting
2. **Step 1:** Explains sex feature, highlights first split + bar
3. **Step 2:** Explains pclass feature, highlights first two splits + bars
4. **Step 3:** Explains age feature, highlights first three splits + bars
5. **Step 4:** Explains fare feature, highlights all splits + bars

**Note:** The tutorial uses the same `highlight_mode` numeric values as the initial animation, ensuring consistent behavior. Each step focuses on one feature at a time, building up the complete path incrementally.

### Adding More Steps

To add additional tutorial steps:

1. Add a new step object in `TUTORIAL_STEPS` (e.g., step 5)
2. Update the condition in `advanceTutorial()` from `tutorialStep < 4` to `tutorialStep < 5` (line 121)
3. Update the `isLastStep` check from `>= 4` to `>= 5` (line 133)
4. Use `highlight_mode: 5` (or higher) and add more features to `highlight_features`

---

## Chat Panel Animations

**File:** `src/components/ChatPanel.css`

Controls how chat messages appear when the panel loads or new messages arrive.

### Animation Type (Lines 2-11)

```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(16px);  /* ← Distance to slide up from */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Animation Duration (Line 15)

```css
.chat-message {
  animation: slideInUp 0.5s ease-out;  /* ← Duration and easing */
}
```

### Staggered Delays (Lines 22-56)

Each message appears with a delay to create a sequential effect:

```css
.chat-message:nth-child(1) { animation-delay: 0ms; }
.chat-message:nth-child(2) { animation-delay: 150ms; }    /* ← +150ms each */
.chat-message:nth-child(3) { animation-delay: 300ms; }
.chat-message:nth-child(4) { animation-delay: 450ms; }
/* etc... */
```

### How to Adjust

| What to Change | Where | Current Value |
|----------------|-------|---------------|
| Animation duration | Line 15 | 0.5s |
| Animation easing | Line 15 | ease-out |
| Slide distance | Line 5 | 16px |
| Delay between messages | Lines 22-56 | 150ms increments |
| Button hover speed | Line 67 | 0.2s ease |

**Common easing options:** `ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear`

---

## Decision Tree Visualizations

**Files:**
- `src/components/visualizations/DecisionTreeViz.jsx`
- `src/components/visualizations/DecisionTreeVizHorizontal.jsx`

### D3.js Transitions

#### Zoom Controls

**Location:** Lines 161, 166, 171

```javascript
svgContainerRef.current
  .transition()
  .duration(300)  // ← Zoom animation duration
  .call(zoomRef.current.scaleBy, 1.3)
```

| Action | Duration | Line |
|--------|----------|------|
| Zoom in | 300ms | 161 |
| Zoom out | 300ms | 166 |
| Reset zoom | 300ms | 171 |

#### Tooltip Animations

**Location:** Lines 528-553

```javascript
tooltip.transition()
  .duration(200)  // ← Appear duration
  .style("opacity", 0.95)

tooltip.transition()
  .duration(500)  // ← Disappear duration
  .style("opacity", 0)
```

| What | Duration | Line |
|------|----------|------|
| Tooltip appear | 200ms | 529 |
| Tooltip disappear | 500ms | 553 |

#### Pie Chart Hover Effects

**Location:** Lines 495-543

```javascript
pieGroup.transition()
  .duration(200)  // ← Hover animation duration
```

| Effect | Duration | Lines |
|--------|----------|-------|
| Pie expand on hover | 200ms | 495-496 |
| Pie shrink on hover out | 200ms | 542-543 |

### CSS Transitions

**Location:** Lines 666, 698, 719, 752, 778

```css
transition: all 0.3s ease;  /* ← Button/overlay transitions */
transition: opacity 0.3s ease;  /* ← Fade transitions */
```

| Element | Duration | Easing | Lines |
|---------|----------|--------|-------|
| Control buttons | 0.3s | ease | 666, 752, 778 |
| Path overlay | 0.3s | ease | 698 |
| Node overlay | 0.3s | ease | 719 |

---

## SHAP Waterfall

**File:** `src/components/visualizations/SHAPWaterfall.jsx`

**Location:** Lines 259, 266

```css
transition: all 0.3s ease;  /* ← Bar and interactive element transitions */
```

### How to Adjust

| What to Change | Where | Current Value |
|----------------|-------|---------------|
| Bar highlight/hover speed | Lines 259, 266 | 0.3s ease |

---

## Quick Reference: Common Adjustments

### Make animations faster overall
- **Initial demo:** Reduce step duration from `500` to `250` or `300` in `useInitialAnimation.js` lines 21, 26, 31, 36
- **Tutorial:** Tutorial uses manual progression (no timing changes needed - users click to advance)
- **Chat messages:** Change `0.5s` to `0.3s` in `ChatPanel.css` line 15
- **Tree interactions:** Change D3 durations from `300` to `150` (or similar)

### Make animations slower/more dramatic
- **Initial demo:** Increase step duration from `500` to `800` or `1000` in `useInitialAnimation.js`
- **Add pause at start:** Change line 16 in `useInitialAnimation.js` from `duration: 0` to `duration: 1000` (1 second pause)
- **Tutorial:** Tutorial is user-paced (no timing to adjust)
- **Chat messages:** Change `0.5s` to `0.8s` or `1s`
- **Stagger delay:** Change `150ms` increments to `250ms` or `300ms`

### Change animation style
- **Chat panel:** Modify keyframe in `ChatPanel.css` lines 2-11
  - Try `translateY(-16px)` for slide down
  - Try `translateX(16px)` for slide from left
  - Combine: `transform: translateY(16px) scale(0.95);` for slide + scale

### Disable animations
- **Initial demo:** Set all step durations to `0` in `useInitialAnimation.js` (lines 21, 26, 31, 36)
- **Skip progressive steps:** Remove steps 2-4 and jump directly from empty state to full path (applies to both initial demo and tutorial)
- **Tutorial:** To simplify, reduce from 5 steps to 2-3 steps in `useTutorial.js` and update the step counter logic
- **Chat messages:** Remove animation property or set duration to `0s`
- **Tree/SHAP:** Set all transition/duration values to `0`

---

## Notes

- All D3.js durations are in **milliseconds** (e.g., `300` = 0.3 seconds)
- All CSS durations are in **seconds** (e.g., `0.3s` = 300 milliseconds)
- Easing functions affect how the animation accelerates/decelerates
- Transition properties can be specific (`transition: opacity 0.3s`) or general (`transition: all 0.3s`)

### Initial Demo vs. Tutorial

Both animations use the same highlighting mechanism (`highlight_mode` numbers) to ensure consistent behavior:

- **Initial Demo** (`useInitialAnimation.js`): Runs automatically on page load with timed steps (500ms each)
- **Tutorial** (`useTutorial.js`): User-controlled progression via "Next" button clicks, same highlighting system

This shared approach means:
- Changes to visualization highlighting work for both animations
- Both animations use the same numeric `highlight_mode` values (1, 2, 3, 4)
- Both highlight the same features in the same order (sex, pclass, age, fare)
- Tutorial messages explain what users already saw in the initial demo
