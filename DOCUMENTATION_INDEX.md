# Documentation Index

> **Purpose:** Central navigation hub for all project documentation

**Last Updated:** December 21, 2025

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

---

## 🎯 Feature Documentation

Detailed documentation for specific features and enhancements:

### Active Features

| File | Feature | Summary |
|------|---------|---------|
| **[DECISION_TREE_FEATURES.md](DECISION_TREE_FEATURES.md)** | Decision tree visualization | Variable stroke widths, selective highlighting, dual paths |
| **[COHORT_COMPARISON_FEATURE.md](COHORT_COMPARISON_FEATURE.md)** | Natural language comparisons | Cohort parsing, dual path visualization, comparison mode |
| **[TUTORIAL_FEATURE.md](TUTORIAL_FEATURE.md)** | Interactive tutorial system | Progressive highlighting, inline controls |

### Legacy/Archived

| File | Feature | Status |
|------|---------|--------|
| **[FIXED_CHAT_LAYOUT.md](FIXED_CHAT_LAYOUT.md)** | Chat layout changes (Dec 20) | ARCHIVED - See CHANGELOG_DEC20_2025.md |

---

## 📝 Changelogs

Track recent changes and updates:

| File | Date | Summary |
|------|------|---------|
| **[CHANGELOG_DEC21_2025.md](CHANGELOG_DEC21_2025.md)** | Dec 21, 2025 | Alternative layout, ChatPanel improvements, centralized colors |
| **[CHANGELOG_DEC20_2025.md](CHANGELOG_DEC20_2025.md)** | Dec 20, 2025 | Layout restructuring, tree layout, tutorial fixes |

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
1. Check [CHANGELOG_DEC21_2025.md](CHANGELOG_DEC21_2025.md) for latest changes
2. Check [CHANGELOG_DEC20_2025.md](CHANGELOG_DEC20_2025.md) for previous day

### "I want to add a new feature"
1. Read [AI_CONTEXT.md](AI_CONTEXT.md) - Understand current architecture
2. Review existing feature docs for similar patterns
3. Check [docs/FRONTEND.md](docs/FRONTEND.md) for component patterns
4. Update appropriate changelog when done

### "I want to understand the color system"
1. Read [docs/FRONTEND.md - Color System](docs/FRONTEND.md#color-system)
2. Check [AI_CONTEXT.md - Design System](AI_CONTEXT.md#-design-system--centralized-colors)
3. Look at `frontend/src/utils/visualizationColors.js`

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
├── Feature Documentation
│   ├── DECISION_TREE_FEATURES.md      # Tree visualization features
│   ├── COHORT_COMPARISON_FEATURE.md   # Comparison system
│   ├── TUTORIAL_FEATURE.md            # Tutorial system
│   └── FIXED_CHAT_LAYOUT.md           # Archived - see changelog
│
├── Changelogs
│   ├── CHANGELOG_DEC21_2025.md        # Latest changes
│   └── CHANGELOG_DEC20_2025.md        # Previous changes
│
└── docs/                              # Technical documentation
    ├── FRONTEND.md                    # React frontend guide
    ├── BACKEND.md                     # FastAPI backend guide
    ├── API.md                         # API reference
    └── archive/                       # Old documentation
        ├── IMPLEMENTATION_PROGRESS.md
        ├── DECISION_TREE_HIGHLIGHT_MODES.md
        └── STROKE_WIDTH_FIX.md
```

---

## 🔑 Key Concepts

### Centralized Color System
- **File:** `frontend/src/utils/visualizationColors.js`
- **Purpose:** Single source of truth for all colors
- **Components:** TREE_COLORS, SHAP_COLORS, UI_COLORS, TREE_EFFECTS, TREE_OPACITY
- **Documentation:** [docs/FRONTEND.md - Color System](docs/FRONTEND.md#color-system)

### ChatPanel Smart Visibility
- **Feature:** Suggestion chips with intelligent show/hide behavior
- **Behavior:** Chips stay visible until user types custom message
- **Toggle:** Users can manually hide/show chips
- **Documentation:** [ASSISTANT_GUIDE.md - Task 8](ASSISTANT_GUIDE.md#task-8-modify-chatpanel-chip-visibility-behavior)

### Alternative Layouts
- **Main Layout:** `index.html` - 80/20 split with vertical tree
- **Alt Layout:** `index-alt.html` - Vertical stacking with horizontal tree
- **Purpose:** Compare layout options side-by-side
- **Documentation:** [CHANGELOG_DEC21_2025.md](CHANGELOG_DEC21_2025.md)

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
   - All colors in `visualizationColors.js`
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
4. **For recent changes:** Check [CHANGELOG_DEC21_2025.md](CHANGELOG_DEC21_2025.md)

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

**Last Updated:** December 21, 2025
**Maintained By:** AI Assistants (Claude Code, GitHub Copilot, Cursor)
