/**
 * ============================================================================
 * CENTRALIZED UI STYLES FOR APPLICATION
 * ============================================================================
 *
 * This file contains all styling constants for general UI elements.
 * Update values here to apply changes throughout the entire application.
 *
 * Used by:
 * - ModelComparisonViewAlt.jsx (section backgrounds)
 * - PredictionCard.jsx (card states, borders)
 * - SinglePredictionCard.jsx (chat cards)
 * - ComparisonCard.jsx (comparison cards)
 * - Layout.jsx (general layout)
 * - ChatPanel.jsx (chat interface)
 * - And other UI components
 *
 * ============================================================================
 */

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FONTS = {
  // Font families
  primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',

  // Font sizes for UI elements
  ui: {
    cardTitle: '14px',           // Card titles
    cardValue: '10px',           // Large values (probability, etc) - single prediction cards
    cardValueMedium: '20px',     // Medium values - single chat cards
    cardOutcome: '24px',         // Outcome text (Survived/Died)
    cardLabel: '14px',           // Labels
    cardSubtext: '12px',         // Small text
    sectionTitle: '16px',        // Section headings
    helper: '12px'               // Helper/hint text
  },

  // Font sizes for comparison cards (smaller since showing multiple)
  comparison: {
    cardValue: '20px',           // Probability percentages in comparison cards
    cardOutcome: '12px',         // Survived/Died text
    modelLabel: '12px',          // Decision Tree / XGBoost labels
    cohortLabel: '14px',         // Cohort names (Women/Men)
    summaryText: '12px'          // Summary text at bottom
  }
}

// Font weights
export const FONT_WEIGHTS = {
  normal: 300,
  bold: 800,
  semibold: 500
}

// ============================================================================
// COLORS
// ============================================================================

// UI colors - used throughout the application
export const UI_COLORS = {
  // Page & layout backgrounds
  pageBg: '#000000',              // Main page background (near-black)
  bodyBg: '#000000',              // Body fallback background

  // Survived colors (high probability)
  survivedText: '#02AE9B',        // Same as survived in visualizations
  survivedBg: 'rgba(184, 240, 110, 0)',
  survivedBorder: 'rgba(184, 240, 110, 0)',

  // Died colors (low probability)
  diedText: '#85785B',            // Same as died in visualizations
  diedBg: 'rgba(240, 154, 72, 0)',
  diedBorder: 'rgba(240, 154, 72, 0)',

  // Uncertain colors (medium probability)
  uncertainText: '#fbbf24',       // Yellow/amber
  uncertainBg: 'rgba(251, 191, 36, 0.15)',
  uncertainBorder: 'rgba(251, 191, 36, 0.5)',

  // Section backgrounds
  sectionBg: '#000000',           // Main section background (gray-800)
  sectionBgDark: '#000000',       // Darker sections/cards (gray-900)

  // Card states
  cardBg: 'rgba(30, 30, 30, 0)',              // Card background (gray-800) - used for prediction/comparison cards
  cardBgLoading: 'rgba(31, 41, 55, 0.5)', // Loading state background
  cardBgError: 'rgba(127, 29, 29, 0.2)',  // Error state background (red-900 with opacity)

  // Borders
  cardBorder: '#313131',          // Default border (gray-700)
  cardBorderError: '#991b1b',     // Error border (red-700)
  cardBorderDivider: '#1f2937',   // Subtle divider (gray-800)

  // Text colors
  textPrimary: '#f3f4f6',         // Primary text (gray-100)
  textSecondary: '#e5e7eb',       // Secondary text (gray-200)
  textMuted: '#9ca3af',           // Muted/helper text (gray-400)
  textError: '#fca5a5',           // Error text (red-300)
  textErrorTitle: '#f87171',      // Error title (red-400)

  // Chart specific text
  chartTitle: '#e5e7eb',          // Chart titles (gray-200)
  chartHelper: '#9ca3af',         // Chart helper text (gray-400)
  chartNoData: '#9ca3af',         // No data message (gray-400)

  // Chat area
  chatAreaBg: '#1e1e1e',          // Chat panel background (separate from page)
  chatTitle: '#ffffff',           // Chat section title (gray-100)
  chatSectionBgLatest: '#000000',    // Latest message section (gray-800 at 40%)
  chatSectionBgPrevious: '#1e1e1e',  // Previous message sections (gray-900 at 20%)
  chatBubbleUser: '#1f2937',      // User message bubble background (gray-800)
  chatBubbleUserText: '#d1d5db',  // User message text (gray-300)
  chatBubbleAssistant: 'transparent', // Assistant message (no background)
  chatBubbleAssistantText: '#f3f4f6', // Assistant message text (gray-100)
  chatIconColor: '#9ca3af',       // Chat icon color (gray-400)
  chatHintText: '#6b7280',        // Hint/helper text (gray-500)
  chatDivider: '#1f2937',         // Divider line (gray-800)

  // Input fields
  inputBg: '#1f2937',             // Input background (gray-800)
  inputBorder: '#374151',         // Input border (gray-700)
  inputBorderFocus: '#6CA7FF',    // Input border when focused (primary blue)
  inputText: '#f3f4f6',           // Input text (gray-100)
  inputPlaceholder: '#6b7280',    // Placeholder text (gray-500)

  // Buttons - Primary (main action)
  buttonPrimaryBg: '#3F6192',     // Primary button background
  buttonPrimaryBgHover: '#1a7ab8', // Primary button hover
  buttonPrimaryText: '#ffffff',   // Primary button text

  // Buttons - Secondary (less emphasis)
  buttonSecondaryBg: '#3F6192',   // Secondary button background (blue-600)
  buttonSecondaryBgHover: '#354163ff', // Secondary button hover (blue-700)
  buttonSecondaryText: '#ffffff', // Secondary button text

  // Buttons - Tertiary (minimal emphasis)
  buttonTertiaryBg: '#4b5563',    // Tertiary button background (gray-600)
  buttonTertiaryBgHover: '#374151', // Tertiary button hover (gray-700)
  buttonTertiaryText: '#ffffff',  // Tertiary button text

  // Buttons - Chip/Tag style
  chipBg: '#1f2937',              // Chip background (gray-800)
  chipBgHover: 'rgba(33, 143, 206, 0.2)', // Chip hover background (primary with opacity)
  chipText: '#d1d5db',            // Chip text (gray-300)
  chipTextHover: '#3F6192',       // Chip text on hover (primary blue)

  // Tutorial/Special states
  tutorialBg: 'rgba(30, 64, 175, 0.2)',    // Tutorial highlight background (blue-900 with opacity)
  tutorialBorder: 'rgba(59, 130, 246, 0.3)', // Tutorial border (blue-500 with opacity)
  tutorialActive: '#3F6192',      // Active tutorial indicator (blue-500)
  tutorialInactive: '#4b5563',    // Inactive tutorial indicator (gray-600)

  // Sliders and controls
  sliderBg: '#374151',            // Slider track background (gray-700)
  sliderThumb: '#6CA7FF',         // Slider thumb color (primary blue)

  // Links
  linkColor: '#6CA7FF',           // Link color (centralized) - updated per request
  linkColorHover: '#1a7ab8',      // Link hover color

  // Accent used across small UI elements (badges, chips, hover states)
  accent: '#6CA7FF',              // Accent blue used in WhatIf/controls
  accentBg: 'rgba(33, 143, 206, 0.2)', // Accent background with opacity

  // Disabled states
  disabledBg: 'rgba(75, 85, 99, 0.5)',  // Disabled background
  disabledText: '#6b7280',        // Disabled text (gray-500)
  disabledCursor: 'not-allowed'   // Disabled cursor style
}

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const SPACING = {
  // Section spacing
  sectionGap: '0px',             // Gap between sections
  sectionPadding: '0px',         // Padding inside sections

  // Card spacing
  cardPadding: '0px',            // Padding inside cards
  cardGap: 'gap-0',              // Tailwind gap between cards (24px)
  cardGapValue: '0px',          // For inline styles

  // Chat spacing
  chatMessageGap: '8px',         // Gap between chat messages
  chatInputPadding: '0px',       // Padding around chat input

  // Button padding
  buttonPaddingSmall: '6px 12px', // Small button padding
  buttonPaddingMedium: '8px 16px', // Medium button padding (default)
  buttonPaddingLarge: '12px 24px', // Large button padding

  // Layout
  containerMaxWidth: '1400px',    // Max width for content
  sidebarWidth: '320px'           // Sidebar width
}

// ============================================================================
// EFFECTS
// ============================================================================

export const UI_EFFECTS = {
  // Shadows
  cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cardShadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

  // Transitions
  transitionFast: '0.15s ease',
  transitionNormal: '0.3s ease',
  transitionSlow: '0.5s ease',

  // Transitions for specific elements
  transitionButton: 'all 0.2s ease',
  transitionInput: 'all 0.2s ease',
  transitionColors: 'color 0.2s ease, background-color 0.2s ease'
}

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  small: '4px',
  medium: '8px',
  large: '12px',
  xl: '16px',
  full: '9999px',             // For pills/chips

  // Component-specific
  button: '8px',
  input: '4px',
  card: '12px',
  chip: '9999px',
  chatBubble: '16px'
}

// ============================================================================
// ANIMATIONS
// ============================================================================

export const ANIMATIONS = {
  // Chat message slide-in
  chatMessageSlideIn: 'slideInUp 0.5s ease-out',
  chatMessageDelay: {
    first: '0ms',
    second: '150ms',
    third: '300ms',
    fourth: '450ms',
    fifth: '600ms',
    max: '1200ms'
  },

  // Button interactions
  buttonHover: 'transform 0.2s ease',

  // Loading states
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
}
