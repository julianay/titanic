# Fixed Chat Layout & Accordion Controls

**Date**: December 17, 2025
**Status**: Completed

## Overview

Converted the app layout to a fixed split-screen design with a right-side chat panel that remains visible while users scroll through visualizations. Also converted the control panel into a collapsible accordion to maximize chat space.

## Changes Made

### 1. Layout Architecture Change

**Before**: Two-column responsive layout where both columns scrolled with the page.

**After**: Fixed split-screen layout:
- **Left column (70%)**: Header + visualizations, scrolls naturally
- **Right column (30%)**: Fixed in viewport, contains controls + chat

### 2. Files Modified

#### `/frontend/src/components/Layout.jsx`

**Key Changes**:
- Removed fixed header with z-index management
- Moved header inside left column (scrolls with content)
- Right column uses `position: fixed` with `height: 100vh`
- Simplified CSS with no offset calculations

**Layout Structure**:
```jsx
<div className="flex">
  {/* Left: 70% width, scrolls naturally */}
  <div className="w-[70%]">
    <header>Title + Subtitle</header>
    <main>{visualizations}</main>
  </div>

  {/* Right: 30% width, fixed in viewport */}
  <aside className="fixed right-0" style={{ height: '100vh' }}>
    <div>{controls}</div>
    <div className="flex-1">{chat}</div>
  </aside>
</div>
```

#### `/frontend/src/components/ChatPanel.jsx`

**Key Changes**:
- Moved preset buttons from ControlPanel to ChatPanel
- Added preset buttons as "chips" above input (removed emojis)
- Added `onPresetSelect` and `onPresetChat` props
- Chat messages area uses `flex-1` to fill available space
- Input form stays anchored at bottom

**Preset Chips**:
```jsx
// Chip-style buttons (rounded-full)
<button className="px-3 py-1.5 text-xs bg-gray-800 rounded-full">
  Women's path
</button>
```

#### `/frontend/src/components/ControlPanel.jsx`

**Key Changes**:
- Added accordion functionality with `isExpanded` state
- Defaults to **closed** (`useState(false)`)
- Title: "What if?"
- Removed preset buttons section (moved to ChatPanel)
- All controls wrapped in conditional render

**Accordion Pattern**:
```jsx
const [isExpanded, setIsExpanded] = useState(false)

return (
  <div>
    {/* Accordion Header */}
    <button onClick={() => setIsExpanded(!isExpanded)}>
      <span>What if?</span>
      <svg className={isExpanded ? 'rotate-180' : ''}>
        {/* chevron icon */}
      </svg>
    </button>

    {/* Accordion Content */}
    {isExpanded && (
      <div>{/* all controls */}</div>
    )}
  </div>
)
```

#### `/frontend/src/App.jsx`

**Key Changes**:
- Removed "Explore by Question" title (gave more space to chat)
- Removed border/divider between controls and title
- Passed `onPresetSelect` and `onPresetChat` to ChatPanel
- Simplified controlsContent structure

### 3. Visual Design

**Chat Panel**:
- Full viewport height minus controls section
- Preset chips displayed as rounded pills above input
- Messages scroll independently
- Input always visible at bottom

**Controls**:
- Collapsed by default (just shows "What if?" header)
- Click to expand reveals all sliders and options
- Smooth transition with rotating chevron icon
- Compact padding when collapsed

### 4. User Experience

**Interaction Flow**:
1. Page loads with accordion closed → chat takes maximum space
2. User can scroll visualizations → header scrolls away, chat stays fixed
3. Click "What if?" → expands controls for manual adjustments
4. Click preset chips → updates visualizations + adds chat message
5. Type in chat → natural language queries work as before

**Space Distribution**:
- **Closed accordion**: ~5% controls, ~95% chat
- **Open accordion**: ~40% controls, ~60% chat
- Chat always has adequate space for conversation

## Technical Details

### CSS Approach

**Fixed Right Column**:
```css
position: fixed;
right: 0;
top: 0;
height: 100vh;
width: 30%;
```

**Flex Layout for Chat**:
```jsx
<div className="flex-1 flex flex-col overflow-hidden">
  <div className="flex-1 overflow-y-auto"> {/* messages */}
  <div> {/* chips */}
  <form> {/* input */}
</div>
```

### State Management

**Accordion State** (ControlPanel.jsx):
- Local state: `useState(false)` for collapsed
- No persistence needed (resets on page load)
- Independent from other component state

**Preset Handling** (ChatPanel.jsx):
- Receives `onPresetSelect` and `onPresetChat` from App
- Calls both when preset chip clicked
- Same behavior as old preset buttons, new location

## Benefits

1. **More Chat Space**: Accordion defaults closed, chat gets ~95% of right column
2. **Persistent Chat Access**: Fixed panel means chat always visible
3. **Natural Scrolling**: Header scrolls away with content, less distraction
4. **Cleaner UX**: Presets near input feel more intuitive
5. **Simpler Code**: No fixed header z-index management

## Trade-offs

**Pros**:
- Maximum chat visibility
- Simpler layout logic
- Better for long conversations

**Cons**:
- Controls hidden by default (requires click to adjust)
- Header scrolls away (title not always visible)
- Fixed 70/30 split (not responsive for mobile yet)

## Future Considerations

1. **Mobile Responsive**: Current fixed layout won't work on mobile
2. **Accordion Persistence**: Could save state to localStorage
3. **Preset Chips**: Could show in empty chat state only
4. **Resize Handle**: Could add draggable divider between columns

## Testing Checklist

- [x] Build succeeds without errors
- [x] Left column scrolls independently
- [x] Right column stays fixed
- [x] Chat takes full available height
- [x] Accordion opens/closes smoothly
- [x] Preset chips trigger visualizations + chat messages
- [x] Input stays at bottom of chat panel
- [x] Messages scroll within chat area

## Related Files

- `/frontend/src/components/Layout.jsx` - Main layout structure
- `/frontend/src/components/ChatPanel.jsx` - Chat UI with presets
- `/frontend/src/components/ControlPanel.jsx` - Accordion controls
- `/frontend/src/App.jsx` - State management and prop passing
