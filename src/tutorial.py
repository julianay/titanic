"""
Tutorial Module
Manages the guided tutorial experience for first-time users.
"""

import streamlit as st


# Tutorial scenario: 30-year-old woman in 1st class
TUTORIAL_PASSENGER = {
    'sex': 0,  # Female
    'pclass': 1,  # 1st class
    'age': 30,
    'fare': 84.0  # 1st class average
}

# Tutorial step definitions - tab-aware messages
TUTORIAL_STEPS = {
    0: {
        "tree_message": "👋 Welcome to the Explainable AI Explorer! Let me show you how these models make predictions. We'll explore a 30-year-old woman in 1st class.",
        "xgb_message": "👋 Welcome to the Explainable AI Explorer! Let me show you how XGBoost explains its predictions using SHAP values. We'll explore a 30-year-old woman in 1st class.",
        "whatif_values": TUTORIAL_PASSENGER,
        "highlight_mode": None,  # No highlighting yet (tree)
        "highlight_features": None,  # No highlighting yet (XGBoost)
        "button_text": "Next"
    },
    1: {
        "tree_message": "First, the decision tree splits on sex. Women had a 74% survival rate, while men had only 19%. Our passenger goes down the left (female) path.",
        "xgb_message": "Look at the waterfall chart above. The 'sex' feature (being female) pushes the prediction strongly toward survival. The green bar shows this positive SHAP contribution.",
        "whatif_values": TUTORIAL_PASSENGER,
        "highlight_mode": "first_split",  # Highlight root node + left edge (tree)
        "highlight_features": ["sex"],  # Highlight sex feature (XGBoost)
        "button_text": "Next"
    },
    2: {
        "tree_message": "Following this path leads to a 78% survival probability for women in 1st class. Now try exploring other passengers using the preset buttons, chat, or What-If controls!",
        "xgb_message": "The final prediction combines all features. Being female and in 1st class both increase survival chances (green bars), leading to a high survival probability. Try exploring other passengers!",
        "whatif_values": TUTORIAL_PASSENGER,
        "highlight_mode": "full_path",  # Highlight complete path (tree)
        "highlight_features": ["sex", "pclass"],  # Highlight sex and pclass features (XGBoost)
        "button_text": "Finish Tutorial"
    }
}


def initialize_tutorial_state():
    """Initialize tutorial-related session state variables."""
    if 'tutorial_active' not in st.session_state:
        st.session_state.tutorial_active = False

    if 'tutorial_step' not in st.session_state:
        st.session_state.tutorial_step = 0

    if 'has_seen_tutorial' not in st.session_state:
        # Check if this is first visit (tutorial not seen before)
        st.session_state.has_seen_tutorial = False


def should_auto_start_tutorial():
    """Check if tutorial should auto-start (first visit)."""
    return not st.session_state.has_seen_tutorial and not st.session_state.tutorial_active


def get_current_tab_type():
    """
    Determine which tab is currently selected.

    Returns:
        str: 'tree' if Decision Tree tab is selected, 'xgb' if XGBoost tab is selected
    """
    if 'selected_tab' not in st.session_state:
        return 'tree'  # Default to tree

    # Check if current tab contains "DECISION TREE"
    if "DECISION TREE" in st.session_state.selected_tab:
        return 'tree'
    else:
        return 'xgb'


def get_tutorial_message(step_num):
    """
    Get the appropriate tutorial message for the current step and tab.

    Args:
        step_num: The tutorial step number (0, 1, or 2)

    Returns:
        str: The tutorial message for the current tab
    """
    tab_type = get_current_tab_type()
    step_info = TUTORIAL_STEPS[step_num]

    if tab_type == 'tree':
        return step_info["tree_message"]
    else:
        return step_info["xgb_message"]


def start_tutorial():
    """Start the tutorial from step 0."""
    st.session_state.tutorial_active = True
    st.session_state.tutorial_step = 0
    st.session_state.has_seen_tutorial = True

    # Add welcome message to chat (tab-aware)
    step_info = TUTORIAL_STEPS[0]
    st.session_state.chat_history.append({
        "role": "assistant",
        "content": get_tutorial_message(0)
    })

    # Set what-if controls to tutorial passenger
    st.session_state.whatif_updates = {
        'sex': ("Female", step_info["whatif_values"]['sex']),
        'pclass': (step_info["whatif_values"]['pclass'], step_info["whatif_values"]['pclass']),
        'age': step_info["whatif_values"]['age'],
        'fare': step_info["whatif_values"]['fare']
    }

    # Also set the values directly to ensure immediate update
    st.session_state.whatif_sex = ("Female", step_info["whatif_values"]['sex'])
    st.session_state.whatif_pclass = (step_info["whatif_values"]['pclass'], step_info["whatif_values"]['pclass'])
    st.session_state.whatif_age = step_info["whatif_values"]['age']
    st.session_state.whatif_fare = step_info["whatif_values"]['fare']


def skip_tutorial():
    """Skip/exit the tutorial."""
    st.session_state.tutorial_active = False
    st.session_state.has_seen_tutorial = True

    # Add skip message to chat
    st.session_state.chat_history.append({
        "role": "assistant",
        "content": "Tutorial skipped. Feel free to explore on your own using the preset buttons, chat, or What-If controls!"
    })


def advance_tutorial():
    """Advance to the next tutorial step."""
    current_step = st.session_state.tutorial_step

    if current_step < 2:
        # Move to next step
        st.session_state.tutorial_step += 1
        next_step = st.session_state.tutorial_step

        # Add step message to chat (tab-aware)
        st.session_state.chat_history.append({
            "role": "assistant",
            "content": get_tutorial_message(next_step)
        })

    else:
        # Tutorial complete
        st.session_state.tutorial_active = False
        st.session_state.chat_history.append({
            "role": "assistant",
            "content": "Tutorial complete! You're ready to explore. Try the preset buttons or ask questions in the chat."
        })


def get_tutorial_highlight_mode():
    """
    Get the current tutorial highlight mode for the decision tree.
    Only returns highlight mode when Decision Tree tab is selected.

    Returns:
        str or None: 'first_split', 'full_path', or None
    """
    if not st.session_state.tutorial_active:
        return None

    # Only apply highlighting on Decision Tree tab
    tab_type = get_current_tab_type()
    if tab_type != 'tree':
        return None

    current_step = st.session_state.tutorial_step
    return TUTORIAL_STEPS[current_step].get("highlight_mode")


def get_tutorial_highlight_features():
    """
    Get the list of features to highlight in the waterfall chart.
    Only returns features when XGBoost tab is selected and tutorial is active.

    Returns:
        list or None: List of feature names to highlight (e.g., ['sex', 'pclass']) or None
    """
    if not st.session_state.tutorial_active:
        return None

    # Only apply highlighting on XGBoost tab
    tab_type = get_current_tab_type()
    if tab_type != 'xgb':
        return None

    current_step = st.session_state.tutorial_step
    return TUTORIAL_STEPS[current_step].get("highlight_features")


def render_tutorial_controls():
    """
    Render tutorial control buttons (Next/Skip/Finish).
    Should be called in the right column where chat controls are.
    """
    if not st.session_state.tutorial_active:
        return

    current_step = st.session_state.tutorial_step
    step_info = TUTORIAL_STEPS[current_step]

    # Tutorial progress indicator
    st.markdown(f"**📚 Tutorial: Step {current_step + 1} of 3**")

    # Button row with columns
    col_next, col_skip = st.columns([2, 1])

    with col_next:
        if st.button(step_info["button_text"], key=f"tutorial_next_{current_step}", use_container_width=True, type="primary"):
            advance_tutorial()
            st.rerun()

    with col_skip:
        if current_step < 2:  # Only show skip button if not on final step
            if st.button("Skip", key=f"tutorial_skip_{current_step}", use_container_width=True):
                skip_tutorial()
                st.rerun()

    st.markdown("---")
