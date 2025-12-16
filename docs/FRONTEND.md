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
6. [Features](#features)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Troubleshooting](#troubleshooting)

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
│   │   └── LoadingSpinner.jsx # Animated loading indicator
│   ├── hooks/              # Custom React hooks
│   │   └── usePredict.js   # API integration with debouncing
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles + Tailwind directives
├── public/                 # Static assets
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
6. **Colors**: Stick to theme colors (#218FCE accent, #0e1117 background)

---

## Additional Resources

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Backend API Documentation](./API.md)
