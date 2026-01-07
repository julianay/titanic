# Documentation Index

> **Purpose:** Central navigation hub for all project documentation

**Last Updated:** January 7, 2026

---

## 🚀 Quick Start

**New to the project?** Start here:
1. [README.md](README.md) - Public-facing project overview
2. [AI_CONTEXT.md](AI_CONTEXT.md) - Comprehensive project reference for AI assistants
3. [docs/FRONTEND.md](docs/FRONTEND.md) - React frontend guide

**Making simple UI changes?** Go here:
- [ASSISTANT_GUIDE.md](ASSISTANT_GUIDE.md) - Step-by-step patterns for common tasks

---

## 📚 Core Documentation

### For AI Assistants

| File | Purpose | When to Use |
|------|---------|-------------|
| **[AI_CONTEXT.md](AI_CONTEXT.md)** | Comprehensive project reference | Starting a new session, understanding architecture |
| **[ASSISTANT_GUIDE.md](ASSISTANT_GUIDE.md)** | Step-by-step task patterns | Making UI changes, styling, adding buttons |
| **[README.md](README.md)** | Public-facing overview | Deployment, live demo, quick start |

### Technical Documentation

| File | Purpose | Covers |
|------|---------|--------|
| **[docs/FRONTEND.md](docs/FRONTEND.md)** | React frontend guide | Components, hooks, color system, development |
| **[docs/BACKEND.md](docs/BACKEND.md)** | FastAPI backend guide | Models, routes, API setup |
| **[docs/API.md](docs/API.md)** | API reference | Endpoints, request/response examples |
| **[docs/SKLEARN_VERSION_COMPATIBILITY.md](docs/SKLEARN_VERSION_COMPATIBILITY.md)** | sklearn version compatibility | tree_.value format differences, recurring bugs, detection logic |

---

## 🎯 Feature Documentation

Detailed documentation for specific features and enhancements:

### Active Features

| File | Feature | Summary |
|------|---------|---------|
| **[DECISION_TREE_FEATURES.md](DECISION_TREE_FEATURES.md)** | Decision tree visualization | Variable stroke widths, selective highlighting, dual paths |
| **[COHORT_COMPARISON_FEATURE.md](COHORT_COMPARISON_FEATURE.md)** | Natural language comparisons | Cohort parsing, dual path visualization, comparison mode |
| **[TUTORIAL_FEATURE.md](TUTORIAL_FEATURE.md)** | Interactive tutorial system | Progressive highlighting, inline controls |
| **[ACTIVE_MESSAGE_TRACKING.md](ACTIVE_MESSAGE_TRACKING.md)** | Active message tracking | Visual indication of which chat message is currently visualized |

### Legacy/Archived

| File | Feature | Status |
|------|---------|--------|
| **[FIXED_CHAT_LAYOUT.md](FIXED_CHAT_LAYOUT.md)** | Chat layout changes (Dec 20) | ARCHIVED - See CHANGELOG_DEC20_2025.md |

---

## 📝 Changelog

All notable changes in a single, consolidated file:

| File | Coverage | Summary |
|------|----------|---------|
| **[CHANGELOG.md](CHANGELOG.md)** | Dec 20, 2025 - Jan 3, 2026 | Consolidated changelog with all changes organized by date (follows Keep a Changelog format) |

**Archived** (individual date files - content moved to CHANGELOG.md):
- CHANGELOG_JAN02_2026.md → Now in CHANGELOG.md [2026-01-02]
- CHANGELOG_DEC22_2025.md → Now in CHANGELOG.md [2025-12-22]
- CHANGELOG_DEC21_2025.md → Now in CHANGELOG.md [2025-12-21]
- CHANGELOG_DEC20_2025.md → Now in CHANGELOG.md [2025-12-20]
- docs/CHANGELOG_JAN03_2026.md → Now in CHANGELOG.md [2026-01-03]

---

## 🗂️ Documentation by Use Case

### "I want to understand the project architecture"
1. Read [AI_CONTEXT.md](AI_CONTEXT.md) - Complete overview
2. Check [docs/FRONTEND.md](docs/FRONTEND.md) - Frontend architecture
3. Check [docs/BACKEND.md](docs/BACKEND.md) - Backend architecture

### "I want to make a simple UI change"
1. Read [ASSISTANT_GUIDE.md](ASSISTANT_GUIDE.md) - Step-by-step patterns
2. Find your task (e.g., "Task 1: Change Colors")
3. Follow the example exactly

### "I want to understand a specific feature"
1. Check [Feature Documentation](#-feature-documentation) section above
2. Read the relevant feature doc (DECISION_TREE_FEATURES.md, COHORT_COMPARISON_FEATURE.md, etc.)
3. Reference implementation in source code

### "I want to know what changed recently"
1. Check [CHANGELOG.md](CHANGELOG.md) - All changes from Dec 20, 2025 to present in one place
2. Changes are organized by date (newest first) following Keep a Changelog format
3. Each section includes technical details and impact
4. Latest changes: Jan 3, 2026 (Codebase Cleanup), Jan 2, 2026 (Critical Fixes)

### "I want to add a new feature"
1. Read [AI_CONTEXT.md](AI_CONTEXT.md) - Understand current architecture
2. Review existing feature docs for similar patterns
3. Check [docs/FRONTEND.md](docs/FRONTEND.md) for component patterns
4. Update appropriate changelog when done

### "I want to understand the styling system"
1. Read [STYLE_CENTRALIZATION.md](STYLE_CENTRALIZATION.md) - Complete styling guide
2. Check [AI_CONTEXT.md - Design System](AI_CONTEXT.md#-design-system--centralized-colors)
3. Look at `frontend/src/utils/visualizationStyles.js` (visualizations)
4. Look at `frontend/src/utils/uiStyles.js` (UI components)

### "I want to deploy or work with git"
1. Read [AI_CONTEXT.md - Git Repositories & Deployment](AI_CONTEXT.md#-git-repositories--deployment)
2. Follow deployment workflow for GitHub and Hugging Face

---

## 📋 File Organization

```
titanic/
├── DOCUMENTATION_INDEX.md       # This file - start here for navigation
├── README.md                    # Public-facing overview
├── AI_CONTEXT.md                # Comprehensive AI assistant reference
├── ASSISTANT_GUIDE.md           # Step-by-step task patterns
│
├── CHANGELOG.md                 # Consolidated changelog (Dec 20, 2025 - present)
│
├── Styling Documentation
│   └── STYLE_CENTRALIZATION.md        # Complete styling guide
│
├── Feature Documentation
│   ├── DECISION_TREE_FEATURES.md      # Tree visualization features
│   ├── COHORT_COMPARISON_FEATURE.md   # Comparison system
│   ├── TUTORIAL_FEATURE.md            # Tutorial system
│   └── ACTIVE_MESSAGE_TRACKING.md     # Active message tracking
│
├── Archived Changelogs (moved to docs/archive/)
│   ├── CHANGELOG_JAN02_2026.md        → CHANGELOG.md [2026-01-02]
│   ├── CHANGELOG_DEC22_2025.md        → CHANGELOG.md [2025-12-22]
│   ├── CHANGELOG_DEC21_2025.md        → CHANGELOG.md [2025-12-21]
│   └── CHANGELOG_DEC20_2025.md        → CHANGELOG.md [2025-12-20]
│
└── docs/                              # Technical documentation
    ├── FRONTEND.md                    # React frontend guide
    ├── BACKEND.md                     # FastAPI backend guide
    ├── API.md                         # API reference
    ├── CHANGELOG_JAN03_2026.md        → CHANGELOG.md [2026-01-03]
    └── archive/                       # Archived documentation
        ├── IMPLEMENTATION_PROGRESS.md
        ├── DECISION_TREE_HIGHLIGHT_MODES.md
        ├── STROKE_WIDTH_FIX.md
        └── FIXED_CHAT_LAYOUT.md
```

---

## 🔑 Key Concepts

### Centralized Styling System
- **Visualization Styles:** `frontend/src/utils/visualizationStyles.js`
  - Purpose: All visualization colors, sizes, fonts
  - Components: TREE_COLORS, SHAP_COLORS, FONTS, TREE_STROKE, TREE_SIZING, etc.
- **UI Styles:** `frontend/src/utils/uiStyles.js`
  - Purpose: All UI component colors, spacing, animations
  - Components: UI_COLORS, SPACING, BORDER_RADIUS, UI_EFFECTS, ANIMATIONS
- **Documentation:** [STYLE_CENTRALIZATION.md](STYLE_CENTRALIZATION.md)

### ChatPanel Smart Visibility
- **Feature:** Suggestion chips with intelligent show/hide behavior
- **Behavior:** Chips stay visible until user types custom message
- **Toggle:** Users can manually hide/show chips
- **Documentation:** [ASSISTANT_GUIDE.md - Task 8](ASSISTANT_GUIDE.md#task-8-modify-chatpanel-chip-visibility-behavior)

### Layout
- **Current Layout:** 80/20 split (visualizations 80%, chat 20%)
- **Decision Tree:** Vertical (top-to-bottom) orientation
- **Note:** Alternative layout files (AppAlt.jsx, etc.) removed on Jan 3, 2026
- **Documentation:** [CHANGELOG.md](CHANGELOG.md)

### Natural Language Processing
- **File:** `frontend/src/utils/cohortPatterns.js`
- **Features:** Passenger queries, cohort comparisons
- **Examples:** "woman in 1st class", "women vs men"
- **Documentation:** [COHORT_COMPARISON_FEATURE.md](COHORT_COMPARISON_FEATURE.md)

---

## 🎨 Design Principles

1. **Semantic Color Consistency**
   - Green = survived/positive/high probability
   - Orange = died/negative/low probability
   - Gold = tutorial/highlight

2. **Single Source of Truth**
   - All visualization styles in `visualizationStyles.js`
   - All UI styles in `uiStyles.js`
   - All API types in `docs/API.md`
   - All git workflows in `AI_CONTEXT.md`

3. **Progressive Enhancement**
   - Tutorial for first-time users
   - Smart defaults that work out of the box
   - Advanced features available but not intrusive

---

## 📞 Need Help?

1. **For common tasks:** Check [ASSISTANT_GUIDE.md](ASSISTANT_GUIDE.md)
2. **For architecture questions:** Check [AI_CONTEXT.md](AI_CONTEXT.md)
3. **For component details:** Check [docs/FRONTEND.md](docs/FRONTEND.md)
4. **For recent changes:** Check [CHANGELOG.md](CHANGELOG.md)

---

## ✅ Documentation Maintenance

**When to update documentation:**

1. **After adding a new feature:**
   - Add entry to current changelog
   - Update [AI_CONTEXT.md](AI_CONTEXT.md) if architecture changes
   - Create feature doc if complex (>100 lines of code)
   - Update [ASSISTANT_GUIDE.md](ASSISTANT_GUIDE.md) if new common task

2. **After making UI changes:**
   - Update relevant section in [ASSISTANT_GUIDE.md](ASSISTANT_GUIDE.md)
   - Add to current changelog if user-facing

3. **After refactoring:**
   - Update [AI_CONTEXT.md](AI_CONTEXT.md) file structure if needed
   - Update [docs/FRONTEND.md](docs/FRONTEND.md) or [docs/BACKEND.md](docs/BACKEND.md) component docs

4. **At end of day:**
   - Review and consolidate changelog entries
   - Update "Last Updated" dates
   - Archive old feature docs if superseded

---

**Last Updated:** January 7, 2026
**Maintained By:** AI Assistants (Claude Code, GitHub Copilot, Cursor)
