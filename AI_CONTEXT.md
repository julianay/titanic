# AI Assistant Context

> **Purpose:** Coding conventions and architecture patterns for AI assistants (Claude Code, GitHub Copilot, Cursor, etc.)

## Project Overview
Streamlit app comparing Decision Tree vs XGBoost models on Titanic dataset with interactive visualizations and tutorial system.

## Coding Conventions

### Data Encodings
- `sex`: `0` = Female, `1` = Male
- `pclass`: `1`, `2`, `3` (integers)
- Widget tuples: `(label, value)` format - e.g., `("Female", 0)`, `(2, 2)`

### Session State (Streamlit)
- What-if controls: `st.session_state.whatif_sex`, `whatif_pclass`, `whatif_age`, `whatif_fare`
- Tutorial state: `tutorial_active`, `tutorial_step`, `tutorial_tab`
- Chat: `chat_history`, `current_preset`

### Key Functions
```python
update_whatif_and_respond(sex, pclass, age, fare, user_message)  # Unified state updates
parse_passenger_query(text) -> dict | None                        # NL parsing
match_to_cohort(sex, pclass, age, fare) -> (str, dict)           # Cohort matching
```

### Type Safety Patterns
```python
# SHAP expected_value (handles binary + multi-class)
base_value = float(np.atleast_1d(explainer.expected_value)[0])
```

### Module Organization
```
src/
├── chat/              # NL parsing, response generation
├── visualizations/    # D3.js HTML generators (server-side)
├── config.py          # Constants: PRESETS, FARE_RANGES, CLASS_AVG_FARES
├── tutorial.py        # Tutorial state + controls
└── tree_data.py       # Train/test data loading
```

### Visualization Patterns
- Generate HTML server-side, render via `components.html()`
- Shared styles in `src/visualizations/styles.css`
- Tutorial highlighting via `tutorial_highlight_mode` + `tutorial_highlight_features`

## Architecture Decisions
- **4 features only** (sex, pclass, age, fare) - optimized for free-tier performance
- **Modular viz**: Each chart returns HTML string from dedicated function
- **Cohort priority**: child > class > gender for overlapping queries
- **Unified updates**: All preset/chat updates go through `update_whatif_and_respond()`

## Design Patterns
- What-if controls sync to session state, drive all visualizations
- Tab-aware: Different messages/highlights for Decision Tree vs XGBoost
- D3.js for custom interactive charts (not Plotly)
- Dark mode CSS with cohesive theming throughout
