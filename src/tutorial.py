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

# Tutorial step definitions
TUTORIAL_STEPS = {
    0: {
        "chat_message": "👋 Welcome to the Explainable AI Explorer! Let me show you how these models make predictions. We'll explore a 30-year-old woman in 1st class.",
        "whatif_values": TUTORIAL_PASSENGER,
        "highlight_mode": None,  # No highlighting yet
        "button_text": "Next"
    },
    1: {
        "chat_message": "First, the decision tree splits on sex. Women had a 74% survival rate, while men had only 19%. Our passenger goes down the left (female) path.",
        "whatif_values": TUTORIAL_PASSENGER,
        "highlight_mode": "first_split",  # Highlight root node + left edge
        "button_text": "Next"
    },
    2: {
        "chat_message": "Following this path leads to a 78% survival probability for women in 1st class. Now try exploring other passengers using the preset buttons, chat, or What-If controls!",
        "whatif_values": TUTORIAL_PASSENGER,
        "highlight_mode": "full_path",  # Highlight complete path
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


def start_tutorial():
    """Start the tutorial from step 0."""
    st.session_state.tutorial_active = True
    st.session_state.tutorial_step = 0
    st.session_state.has_seen_tutorial = True

    # Add welcome message to chat
    step_info = TUTORIAL_STEPS[0]
    st.session_state.chat_history.append({
        "role": "assistant",
        "content": step_info["chat_message"]
    })

    # Set what-if controls to tutorial passenger
    st.session_state.whatif_updates = {
        'sex': ("Female", step_info["whatif_values"]['sex']),
        'pclass': (step_info["whatif_values"]['pclass'], step_info["whatif_values"]['pclass']),
        'age': step_info["whatif_values"]['age'],
        'fare': step_info["whatif_values"]['fare']
    }


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

        # Add step message to chat
        step_info = TUTORIAL_STEPS[next_step]
        st.session_state.chat_history.append({
            "role": "assistant",
            "content": step_info["chat_message"]
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

    Returns:
        str or None: 'first_split', 'full_path', or None
    """
    if not st.session_state.tutorial_active:
        return None

    current_step = st.session_state.tutorial_step
    return TUTORIAL_STEPS[current_step].get("highlight_mode")


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
