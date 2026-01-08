# Feature Documentation

This directory contains detailed documentation for all major features in the Titanic Explainable AI Explorer.

## Active Features

### Decision Tree Visualization
**File:** [DECISION_TREE_FEATURES.md](DECISION_TREE_FEATURES.md)

Interactive decision tree visualization with:
- Variable stroke widths representing sample sizes
- Selective highlighting modes for progressive reveal
- Dual path comparison mode
- Tutorial and hover effects

### Cohort Comparison
**File:** [COHORT_COMPARISON_FEATURE.md](COHORT_COMPARISON_FEATURE.md)

Natural language cohort comparison system:
- Parse passenger queries ("woman in 1st class")
- Compare cohorts ("women vs men", "1st class vs 3rd class")
- Dual path visualization showing both cohorts simultaneously
- Automatic cohort label generation

### Interactive Tutorial
**File:** [TUTORIAL_FEATURE.md](TUTORIAL_FEATURE.md)

Step-by-step tutorial system:
- Progressive highlighting of decision tree paths
- Synchronized SHAP feature highlighting
- Inline tutorial controls
- Local storage for "has seen tutorial" state

### Active Message Tracking
**File:** [ACTIVE_MESSAGE_TRACKING.md](ACTIVE_MESSAGE_TRACKING.md)

Visual feedback system:
- Tracks which chat message corresponds to current visualization
- Highlights active section in chat
- Clickable percentages to navigate visualizations
- Message index-based highlighting

### Replay Animation
**File:** [REPLAY_ANIMATION_FEATURE.md](REPLAY_ANIMATION_FEATURE.md)

Progressive animation when clicking percentage values:
- Reuses tutorial/initial animation infrastructure
- Works for both single predictions and comparisons
- Forced browser reflow to restart CSS transitions
- Matches tutorial animation style

---

## Documentation Structure

Each feature document follows this template:

1. **Overview** - What the feature does and why it exists
2. **User Experience** - How users interact with the feature
3. **Technical Implementation** - Architecture and code details
4. **Files Modified** - Complete list with line numbers
5. **Testing Scenarios** - How to verify the feature works
6. **Edge Cases** - Known limitations and how they're handled
7. **Future Enhancements** - Potential improvements

---

## Adding New Feature Documentation

When implementing a new feature that involves:
- More than 100 lines of code
- Multiple component changes
- Complex user interactions
- New hooks or utilities

Create a new feature document following the existing template. Add it to this directory and update [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md).

---

**Last Updated:** January 7, 2026
