# Frontend Documentation

**React Frontend for Titanic XAI Explorer**

A modern, responsive React application that connects to the FastAPI backend to provide an interactive interface for exploring Titanic survival predictions with real-time updates and explainability features.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Components](#components)
5. [Custom Hooks](#custom-hooks)
6. [Color System](#color-system)
7. [Features](#features)
8. [Configuration](#configuration)
9. [Development](#development)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

**Prerequisites:**
- Node.js v16 or higher
- Backend running on http://localhost:8000

---

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server (lightning fast HMR)
- **Tailwind CSS 3** - Utility-first CSS framework
- **JavaScript** - No TypeScript for simplicity

---

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Layout.jsx       # Two-column responsive layout
│   │   ├── ControlPanel.jsx # Passenger input controls + presets
│   │   ├── ChatPanel.jsx    # Natural language chat interface
│   │   ├── LoadingSpinner.jsx # Animated loading indicator
│   │   ├── PredictionCard.jsx # Prediction result cards
│   │   ├── SinglePredictionCard.jsx # Chat prediction cards
│   │   ├── ComparisonCard.jsx # Cohort comparison cards
│   │   ├── TutorialControls.jsx # Tutorial navigation (legacy, no longer used)
│   │   ├── ModelComparisonView.jsx # Main visualization layout
│   │   ├── ModelComparisonViewAlt.jsx # Alternative visualization layout
│   │   └── visualizations/  # D3.js visualization components
│   │       ├── DecisionTreeViz.jsx # Vertical tree layout
│   │       ├── DecisionTreeVizHorizontal.jsx # Horizontal tree layout
│   │       ├── SHAPWaterfall.jsx # SHAP waterfall chart
│   │       └── GlobalFeatureImportance.jsx # Feature importance bars
│   ├── hooks/              # Custom React hooks
│   │   ├── usePredict.js   # API integration with debouncing
│   │   └── useTutorial.js  # Tutorial state management
│   ├── utils/              # Utility modules
│   │   ├── visualizationColors.js # Centralized color system
│   │   └── cohortPatterns.js # Natural language parsing
│   ├── App.jsx             # Main application component
│   ├── AppAlt.jsx          # Alternative layout component
│   ├── main.jsx            # Application entry point
│   ├── main-alt.jsx        # Alternative layout entry point
│   └── index.css           # Global styles + Tailwind directives
├── public/                 # Static assets
├── index.html              # Main HTML (uses main-alt.jsx)
├── index-backup.html       # Backup HTML (uses main.jsx, not built)
├── .env                    # Environment variables
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies and scripts
```

---

## Components

### Layout (`src/components/Layout.jsx`)

Two-column responsive layout matching the Streamlit app design.

**Props:**
- `title` (string) - Main page title
- `subtitle` (string) - Page description
- `leftContent` (React node) - Visualization area (75% width)
- `rightContent` (React node) - Controls area (25% width)

**Features:**
- Responsive: Stacks vertically on mobile (<768px)
- Dark theme: Background #0e1117, text #fafafa
- Subtle border between columns
- Header area with title and subtitle

**Usage:**
```jsx
<Layout
  title="Explainable AI Explorer"
  subtitle="Compare model reasoning"
  leftContent={<div>Visualizations</div>}
  rightContent={<div>Controls</div>}
/>
```

---

### ControlPanel (`src/components/ControlPanel.jsx`)

Interactive passenger input controls with smart features.

**Props:**
- `values` (object) - Current passenger data `{sex, pclass, age, fare}`
- `onChange` (function) - Called when individual control changes: `(field, value) => void`
- `onPresetSelect` (function) - Called when preset is clicked: `(presetValues) => void`

**Controls:**
1. **Sex** - Radio buttons (Female=0, Male=1)
2. **Passenger Class** - Radio buttons (1st, 2nd, 3rd)
3. **Age** - Range slider (0-80) with live value display
4. **Fare** - Range slider (£0-£100) with live value display

**Smart Features:**
- **Fare Suggestions**: Auto-suggests fare when class changes
  - 1st class → £84
  - 2nd class → £20
  - 3rd class → £13
- **Unusual Fare Badge**: Shows if fare is >30% different from class average
- **Quick Presets**: 4 one-click presets for testing
  - 🎭 Women's path (Female, 2nd, age 30, £20)
  - 👨 Men's path (Male, 3rd, age 30, £13)
  - 👶 1st class child (Female, 1st, age 5, £84)
  - ⚓ 3rd class male (Male, 3rd, age 40, £8)
- **Live Description**: Updates passenger description in real-time

**Usage:**
```jsx
<ControlPanel
  values={passengerData}
  onChange={handleChange}
  onPresetSelect={handlePresetSelect}
/>
```

---

### ChatPanel (`src/components/ChatPanel.jsx`)

Natural language chat interface with suggestion chips and tutorial integration.

**Props:**
- `messages` (array) - Array of message objects with various types
- `onSendMessage` (function) - Called when message submitted: `(text, parsedParams) => void`
- `onPresetSelect` (function) - Called when preset chip clicked (updates controls)
- `onPresetChat` (function) - Called when preset chip clicked (adds chat message)
- `onTutorialAdvance` (function) - Called when tutorial Next button clicked
- `onTutorialSkip` (function) - Called when tutorial Skip button clicked
- `onTutorialStart` (function) - Called when tutorial Start button clicked

**Message Types:**
1. **User Messages**: `{ role: 'user', content: string }`
2. **Text Responses**: `{ role: 'assistant', content: string }`
3. **Comparison Cards**: `{ role: 'assistant', type: 'comparison', comparison: {...} }`
4. **Prediction Cards**: `{ role: 'assistant', type: 'prediction', passengerData: {...}, label: string }`
5. **Tutorial Messages**: `{ role: 'assistant', type: 'tutorial', content: string, step: number, isLastStep: boolean }`

**Suggestion Chips:**
- **3 Preset Queries**:
  - "Show me a woman in 1st class"
  - "What about a 3rd class male?"
  - "Compare women vs men"
- **Tutorial Chip**: "📚 Start Tutorial"
- **Smart Visibility**: Chips remain visible until user types their own message
  - Clicking chips = exploration (chips stay visible)
  - Typing custom message = user knows how to use chat (chips hide)
  - During tutorial = chips stay visible
- **Show/Hide Toggle**:
  - Small "hide/show" link next to "Try asking" label
  - Click to collapse chips for more chat space
  - Click again to restore chips
  - Toggle state persists during session

**Natural Language Parsing:**
- Supports passenger queries: "woman in 1st class", "3rd class male", "child age 5"
- Supports comparison queries: "women vs men", "1st class vs 3rd class"
- Parsed by `parsePassengerQuery()` and `detectComparison()` utilities

**Features:**
- Auto-scrolls to latest messages
- Inline tutorial controls (Next/Skip buttons appear in tutorial messages)
- Chip-styled suggestion buttons for quick queries
- Input validation and error handling

**Usage:**
```jsx
<ChatPanel
  messages={chatMessages}
  onSendMessage={handleSendMessage}
  onPresetSelect={handlePresetSelect}
  onPresetChat={handlePresetChat}
  onTutorialAdvance={tutorial.advanceTutorial}
  onTutorialSkip={tutorial.skipTutorial}
  onTutorialStart={tutorial.startTutorial}
/>
```

**Common Changes:**
- Add suggestion: Add to `suggestionButtons` array (line 98)
- Change chip styling: Modify classes on line 194
- Adjust visibility behavior: Edit `hasTypedMessage` state logic (line 50, 63)

---

### LoadingSpinner (`src/components/LoadingSpinner.jsx`)

Animated loading indicator with customizable message.

**Props:**
- `message` (string) - Optional loading message (default: "Loading...")

**Features:**
- Blue (#218FCE) spinning animation
- Smooth CSS transitions
- Centered layout

**Usage:**
```jsx
<LoadingSpinner message="Calculating prediction..." />
```

---

## Custom Hooks

### usePredict (`src/hooks/usePredict.js`)

Custom hook for calling the prediction API with advanced features.

**Parameters:**
- `params` (object) - Passenger parameters `{sex, pclass, age, fare}`

**Returns:**
- `data` (object|null) - Prediction result with `{prediction, probability, survival_rate}`
- `loading` (boolean) - True when request is in progress
- `error` (Error|null) - Error object if request failed

**Features:**
1. **Debouncing (500ms)**: Waits 500ms after last param change before calling API
2. **Request Cancellation**: Aborts in-flight requests when params change
3. **Retry Logic**: Max 3 attempts with exponential backoff (1s, 2s delays)
4. **In-Memory Caching**: Same params = instant cached result
5. **Auto Cache Management**: Clears oldest 20 entries when cache hits 100 items
6. **Environment Config**: Uses `VITE_API_URL` from `.env`

**Usage:**
```javascript
import usePredict from './hooks/usePredict'

function MyComponent() {
  const {data, loading, error} = usePredict({
    sex: 0,
    pclass: 1,
    age: 30,
    fare: 84
  })

  if (loading) return <LoadingSpinner />
  if (error) return <div>Error: {error.message}</div>
  if (data) return <div>Survival: {data.survival_rate}%</div>
}
```

**Utility Functions:**
```javascript
import { clearPredictionCache, getCacheSize } from './hooks/usePredict'

// Clear entire cache
clearPredictionCache()

// Get current cache size (for debugging)
console.log(getCacheSize()) // e.g., 42
```

---

## Color System

### Centralized Color Configuration

All colors across visualizations and UI components are managed in a single file:
**`src/utils/visualizationColors.js`**

This provides:
- **Single source of truth**: Change any color in one place
- **Consistency**: Same colors across all components
- **Semantic meaning**: Colors have consistent meaning throughout the app
- **Easy maintenance**: Well-documented with inline comments

### Color Palette

| Purpose | Color Name | Hex Code | Usage |
|---------|-----------|----------|-------|
| Survived / Positive | Light Green | `#B8F06E` | Tree pie charts (survived), SHAP positive impact, UI cards (high probability) |
| Died / Negative | Orange | `#F09A48` | Tree pie charts (died), SHAP negative impact, UI cards (low probability) |
| Tutorial/Highlight | Gold | `#ffd700` | Tutorial mode, hover states, shared comparison paths |
| Uncertain | Yellow | `#fbbf24` | UI cards with medium survival probability (40-70%) |

### Color Constants

#### TREE_COLORS
Decision tree visualization colors:
```javascript
import { TREE_COLORS } from '../utils/visualizationColors'

TREE_COLORS.died              // #F09A48 - Orange for died/class 0
TREE_COLORS.survived          // #B8F06E - Light green for survived/class 1
TREE_COLORS.tutorial          // #ffd700 - Gold for tutorial highlighting
TREE_COLORS.hover             // #ffd700 - Gold for hover effects
TREE_COLORS.comparisonA       // #B8F06E - Green for comparison path A
TREE_COLORS.comparisonB       // #F09A48 - Orange for comparison path B
TREE_COLORS.comparisonShared  // #ffd700 - Gold for shared paths
TREE_COLORS.defaultStroke     // #666 - Default link/edge color
TREE_COLORS.nodeStroke        // #888 - Stroke around pie segments
TREE_COLORS.textDefault       // #fafafa - Default text color
TREE_COLORS.background        // #0e1117 - Tree background
TREE_COLORS.tooltipBg         // rgba(0,0,0,0.9) - Tooltip background
TREE_COLORS.tooltipText       // white - Tooltip text
```

#### SHAP_COLORS
SHAP visualization colors (aligned with tree colors):
```javascript
import { SHAP_COLORS } from '../utils/visualizationColors'

SHAP_COLORS.positive          // #B8F06E - Same as survived
SHAP_COLORS.positiveStroke    // #cef78e - Lighter green for stroke
SHAP_COLORS.negative          // #F09A48 - Same as died
SHAP_COLORS.negativeStroke    // #f5b06d - Lighter orange for stroke
SHAP_COLORS.highlight         // #ffd700 - Gold for highlighted bars
SHAP_COLORS.highlightGlow     // rgba(255,215,0,0.8) - Gold glow
SHAP_COLORS.text              // #fafafa - White-ish text
SHAP_COLORS.barDefault        // #B8F06E - Default bar color
```

#### UI_COLORS
UI card colors (prediction results):
```javascript
import { UI_COLORS } from '../utils/visualizationColors'

// High probability (survived)
UI_COLORS.survivedText        // #B8F06E
UI_COLORS.survivedBg          // rgba(184,240,110,0.15)
UI_COLORS.survivedBorder      // rgba(184,240,110,0.5)

// Low probability (died)
UI_COLORS.diedText            // #F09A48
UI_COLORS.diedBg              // rgba(240,154,72,0.15)
UI_COLORS.diedBorder          // rgba(240,154,72,0.5)

// Medium probability (uncertain)
UI_COLORS.uncertainText       // #fbbf24
UI_COLORS.uncertainBg         // rgba(251,191,36,0.15)
UI_COLORS.uncertainBorder     // rgba(251,191,36,0.5)

// General UI
UI_COLORS.cardBg              // rgba(31,41,55,0.5)
UI_COLORS.cardBorder          // #374151
UI_COLORS.textPrimary         // #e5e7eb
UI_COLORS.textSecondary       // #9ca3af
UI_COLORS.textMuted           // #6b7280
```

#### TREE_EFFECTS
Drop shadow effects for different states:
```javascript
import { TREE_EFFECTS } from '../utils/visualizationColors'

TREE_EFFECTS.active           // White glow for active elements
TREE_EFFECTS.final            // Brighter white glow for final node
TREE_EFFECTS.tutorial         // Gold glow for tutorial mode
TREE_EFFECTS.hover            // Subtle gold glow for hover
TREE_EFFECTS.comparisonA      // Green glow for path A
TREE_EFFECTS.comparisonB      // Orange glow for path B
TREE_EFFECTS.comparisonShared // Gold glow for shared paths
```

#### TREE_OPACITY
Opacity values for different states:
```javascript
import { TREE_OPACITY } from '../utils/visualizationColors'

TREE_OPACITY.inactive         // 0.4 - Faded inactive elements
TREE_OPACITY.hover            // 0.85 - Slightly transparent on hover
TREE_OPACITY.active           // 1 - Full opacity for active elements
```

### Usage Examples

**In D3 Visualizations:**
```javascript
import { TREE_COLORS, SHAP_COLORS } from '../utils/visualizationColors'

// Pie chart colors
const pieData = pie([
  { label: 'died', value: d.data.class_0, color: TREE_COLORS.died },
  { label: 'survived', value: d.data.class_1, color: TREE_COLORS.survived }
])

// SHAP bar colors
.attr("fill", d => d.value >= 0 ? SHAP_COLORS.positive : SHAP_COLORS.negative)

// Tooltips
.style("background", TREE_COLORS.tooltipBg)
.style("color", TREE_COLORS.tooltipText)
```

**In React Components:**
```javascript
import { UI_COLORS } from '../utils/visualizationColors'

// Inline styles
<div style={{
  backgroundColor: UI_COLORS.survivedBg,
  borderColor: UI_COLORS.survivedBorder,
  color: UI_COLORS.survivedText
}}>
  Predicted: Survived
</div>

// Dynamic color selection
const getColors = (probability) => {
  if (probability > 0.7) return {
    bg: UI_COLORS.survivedBg,
    border: UI_COLORS.survivedBorder,
    text: UI_COLORS.survivedText
  }
  // ... more conditions
}
```

### Components Using Color System

**Visualizations:**
- `DecisionTreeViz.jsx` - Vertical tree layout
- `DecisionTreeVizHorizontal.jsx` - Horizontal tree layout
- `SHAPWaterfall.jsx` - SHAP waterfall chart
- `GlobalFeatureImportance.jsx` - Feature importance bars

**UI Cards:**
- `PredictionCard.jsx` - Main prediction display
- `SinglePredictionCard.jsx` - Chat prediction cards
- `ComparisonCard.jsx` - Cohort comparison cards

### Semantic Color Meanings

The color system enforces semantic consistency:

| Color | Meaning Across App |
|-------|-------------------|
| **Green (#B8F06E)** | Survived outcome, positive SHAP impact, high survival probability |
| **Orange (#F09A48)** | Died outcome, negative SHAP impact, low survival probability |
| **Gold (#ffd700)** | Tutorial mode, highlights, shared comparison paths |
| **Yellow (#fbbf24)** | Uncertain/medium survival probability (UI only) |

This consistency helps users build a mental model:
- Seeing green anywhere = positive/survived
- Seeing orange anywhere = negative/died
- Seeing gold anywhere = attention/highlight

### Updating Colors

To change colors across the entire application:

1. Open `src/utils/visualizationColors.js`
2. Update the desired color constant
3. Save the file
4. All components automatically use the new color

**Example:** Change survived color to blue:
```javascript
export const TREE_COLORS = {
  survived: '#3B82F6',  // Changed from #B8F06E to blue
  // ... rest of colors
}
```

This single change updates:
- Tree pie charts
- SHAP positive impact bars
- High probability UI cards
- Comparison path A highlighting
- All other references to survived color

---

## Features

### Real-Time Prediction Updates

- **Automatic Updates**: Predictions update automatically when controls change
- **Debounced API Calls**: 500ms delay prevents excessive calls while sliding
- **Instant Cache Hits**: Same parameters return cached results instantly
- **Visual Feedback**: Loading spinner during API calls

### Color-Coded Survival Probability

Predictions are displayed with intuitive color coding:

- **Green** (>70%): High survival chance - green background and text
- **Yellow** (40-70%): Medium survival chance - yellow background and text
- **Red** (<40%): Low survival chance - red background and text

### Quick Testing with Presets

4 preset buttons for instant testing of different passenger profiles:

1. **🎭 Women's path**: Typical female passenger (high survival ~92%)
2. **👨 Men's path**: Typical male passenger (low survival ~14%)
3. **👶 1st class child**: Young first-class female (very high survival ~98%)
4. **⚓ 3rd class male**: Older third-class male (very low survival ~7%)

**Active State**: Currently active preset is highlighted in blue

### Responsive Design

- **Desktop (>768px)**: Two-column layout (75% / 25%)
- **Mobile (<768px)**: Single column, stacked vertically
- **Tailwind CSS**: All responsive breakpoints handled automatically

---

## Configuration

### Environment Variables (`.env`)

```env
VITE_API_URL=http://localhost:8000
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

### Vite Config (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,           // Dev server port
    cors: true,           // Enable CORS
    proxy: {              // Proxy /api to backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### Tailwind Config (`tailwind.config.js`)

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Theme Colors

**Dark Theme** (matching backend):
- Background: `#0e1117`
- Text: `#fafafa`
- Accent Blue: `#218FCE`
- Gray borders: `#374151` / `#1f2937`

**Typography:**
- Base: `14px`
- H1: `24px` bold
- H2/H3: `20px`

---

## Development

### Available Scripts

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code (if configured)
npm run lint
```

### Hot Module Replacement (HMR)

Vite provides instant HMR:
- Save a file → Changes reflect in browser immediately
- No full page reload needed
- React component state is preserved

### Development Workflow

1. **Start backend**: `cd backend && ./start_server.sh`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Open browser**: http://localhost:5173
4. **Make changes**: Edit files, see instant updates
5. **Test presets**: Click preset buttons to test different scenarios

---

## Troubleshooting

### Port 5173 already in use

**Solution**: Change port in `vite.config.js`:
```javascript
server: {
  port: 3000  // or any other port
}
```

### Cannot connect to backend

**Symptoms**: "Failed to fetch" error

**Solutions**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `.env` has correct `VITE_API_URL`
3. Check browser console for CORS errors
4. Ensure backend CORS is configured (it should be)

### Tailwind styles not applying

**Solutions**:
1. Check `index.css` has Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
2. Verify `tailwind.config.js` content paths include your files
3. Restart dev server: `Ctrl+C`, then `npm run dev`

### Predictions not updating

**Check:**
1. Backend is running and responding
2. Browser console for errors
3. Network tab shows API calls being made
4. `usePredict` hook is receiving updated params

### Debouncing too slow/fast

**Solution**: Edit `src/hooks/usePredict.js`:
```javascript
// Change from 500ms to your preferred delay
debounceTimerRef.current = setTimeout(() => {
  makeRequest(params)
}, 500)  // Change this value
```

---

## Build for Production

```bash
# Create optimized build
npm run build

# Output is in dist/ folder
ls dist/

# Preview production build locally
npm run preview
```

**Production build includes:**
- Minified JavaScript
- Optimized CSS (unused Tailwind classes removed)
- Asset optimization
- Source maps for debugging

**Deployment:**
- Upload `dist/` folder to any static hosting
- Popular options: Vercel, Netlify, GitHub Pages, AWS S3
- Update `VITE_API_URL` for production backend

---

## Next Steps

1. **Add SHAP Visualizations**: Replace placeholder div with interactive SHAP plots
2. **Model Comparison**: Show XGBoost vs Decision Tree predictions side-by-side
3. **Additional Features**: Feature importance charts, confusion matrices
4. **Animations**: Add smooth transitions between prediction updates
5. **Accessibility**: Add ARIA labels, keyboard navigation

---

## Contributing

When adding new features:

1. **Components**: Add to `src/components/`
2. **Hooks**: Add to `src/hooks/`
3. **Styling**: Use Tailwind utility classes
4. **State Management**: Use React hooks (useState, useEffect)
5. **API Calls**: Use or extend `usePredict` hook
6. **Colors**: Import from `src/utils/visualizationColors.js`
   - Use `TREE_COLORS` for visualizations
   - Use `SHAP_COLORS` for SHAP charts
   - Use `UI_COLORS` for UI components
   - Never hardcode colors - always use the centralized constants

---

## Additional Resources

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Backend API Documentation](./API.md)
