# User Guides

This directory contains comprehensive guides and how-to documentation for working with the Titanic Explainable AI Explorer codebase.

## Available Guides

### Style Centralization Guide
**File:** [STYLE_CENTRALIZATION.md](STYLE_CENTRALIZATION.md)

Complete guide to the centralized styling system:
- **Visualization Styles** - Colors, fonts, sizing for D3 visualizations
- **UI Styles** - Colors, spacing, effects for React components
- **How to customize** - Change colors, sizing, typography across the entire app
- **Best practices** - Dos and don'ts for consistent styling

**When to use this guide:**
- Changing colors or fonts throughout the application
- Adjusting tree edge thickness or node sizes
- Modifying card color thresholds (survived/died states)
- Understanding the three-layer styling approach (centralized constants, Tailwind, global CSS)

---

## Guide Structure

User guides are designed to be:
- **Comprehensive** - Cover all aspects of a topic
- **Practical** - Include code examples and usage patterns
- **Maintainable** - Single source of truth for their topic

---

## Adding New Guides

Create a new guide when:
- The topic requires extensive how-to information (>200 lines)
- Multiple related concepts need to be explained together
- Users frequently ask questions about the topic
- The guide would prevent common mistakes or confusion

Add the new guide to this directory and update [DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md).

---

**Last Updated:** January 7, 2026
