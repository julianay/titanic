"""
Chat Response Generator
Handles natural language query parsing and response generation for the chat interface.
"""

import re
import streamlit as st
from .cohort_patterns import COHORT_PATTERNS


def parse_passenger_query(query_text):
    """
    Parse natural language query into passenger parameters.

    Args:
        query_text: User's natural language query

    Returns:
        dict with keys {sex, pclass, age, fare} or None if can't parse

    Examples:
        "show me a woman in 1st class" -> {sex: 0, pclass: 1, age: 30, fare: 84}
        "what about a young boy in 3rd" -> {sex: 1, pclass: 3, age: 8, fare: 13}
    """
    query_lower = query_text.lower()

    # Parse sex
    sex = None
    if any(word in query_lower for word in ['woman', 'women', 'female', 'lady', 'ladies', 'girl']):
        sex = 0
    elif any(word in query_lower for word in ['man', 'men', 'male', 'gentleman', 'boy']):
        sex = 1

    # Parse class
    pclass = None
    if any(phrase in query_lower for phrase in ['1st class', 'first class', 'upper class', 'wealthy', 'rich']):
        pclass = 1
    elif any(phrase in query_lower for phrase in ['2nd class', 'second class', 'middle class']):
        pclass = 2
    elif any(phrase in query_lower for phrase in ['3rd class', 'third class', 'lower class', 'poor', 'cheap']):
        pclass = 3

    # Parse age (approximate)
    age = None
    if any(word in query_lower for word in ['child', 'children', 'kid', 'young', 'baby', 'infant']):
        age = 8  # Young child
    elif any(word in query_lower for word in ['elderly', 'senior', 'older', 'old']):
        age = 65  # Senior
    elif any(word in query_lower for word in ['adult', 'middle-aged', 'middle aged']):
        age = 35  # Middle-aged adult
    else:
        # Try to extract numeric age
        age_match = re.search(r'\b(\d+)[\s-]*(year|yr|y\.o\.|old)?\b', query_lower)
        if age_match:
            age = int(age_match.group(1))

    # Default age if not specified
    if age is None:
        age = 30  # Default adult age

    # Set fare based on class (historical averages)
    fare = None
    if pclass == 1:
        fare = 84.0
    elif pclass == 2:
        fare = 20.0
    elif pclass == 3:
        fare = 13.0

    # Must have at least sex or pclass to be valid
    if sex is None and pclass is None:
        return None

    # Fill in defaults for missing values
    if sex is None:
        sex = 0  # Default to female
    if pclass is None:
        pclass = 2  # Default to 2nd class
    if fare is None:
        fare = 20.0  # Default to 2nd class fare

    return {
        'sex': sex,
        'pclass': pclass,
        'age': age,
        'fare': fare
    }


def match_to_cohort(sex, pclass, age, fare):
    """
    Match passenger parameters to the best cohort pattern.
    Returns (cohort_name, cohort_info) tuple.

    Args:
        sex: 0 for female, 1 for male
        pclass: 1, 2, or 3
        age: passenger age in years
        fare: ticket fare in pounds

    Returns:
        (cohort_name, cohort_info) or (None, fallback_info)
    """
    # Sort cohorts by priority (highest first)
    sorted_cohorts = sorted(
        COHORT_PATTERNS.items(),
        key=lambda x: x[1]['priority'],
        reverse=True
    )

    for cohort_name, cohort_info in sorted_cohorts:
        criteria = cohort_info['match_criteria']

        # Check sex if specified
        if 'sex' in criteria and criteria['sex'] != sex:
            continue

        # Check pclass if specified
        if 'pclass' in criteria and criteria['pclass'] != pclass:
            continue

        # Check age range if specified
        if 'age_range' in criteria:
            min_age, max_age = criteria['age_range']
            if not (min_age <= age <= max_age):
                continue

        # All criteria matched!
        return cohort_name, cohort_info

    # No match found, return generic fallback
    fallback = {
        "response": "Here's the analysis for this passenger profile.",
        "xgb_response": "Analyzing this passenger: {passenger_desc}."
    }
    return None, fallback


def format_passenger_description(sex, pclass, age, fare):
    """
    Format passenger parameters into human-readable description.

    Args:
        sex: 0 for female, 1 for male
        pclass: 1, 2, or 3
        age: passenger age
        fare: ticket fare

    Returns:
        String like "30-year-old woman in 2nd class, £20 fare"
    """
    sex_label = "female" if sex == 0 else "male"
    class_label = {1: "1st class", 2: "2nd class", 3: "3rd class"}[pclass]

    return f"{age}-year-old {sex_label} in {class_label}, £{fare:.0f} fare"


def update_whatif_and_respond(sex, pclass, age, fare, user_message):
    """
    Unified function to update what-if state and generate response.
    This is the single mechanism for all chat interactions.

    Args:
        sex: 0 for female, 1 for male
        pclass: 1, 2, or 3
        age: passenger age
        fare: ticket fare
        user_message: What the user said (for chat history)

    Returns:
        response_text: Assistant's response with educational context
    """
    # Match to cohort for educational context
    cohort_name, cohort_info = match_to_cohort(sex, pclass, age, fare)

    # Format passenger description
    passenger_desc = format_passenger_description(sex, pclass, age, fare)

    # Select response template based on active tab (tab-aware)
    if "XGBOOST" in st.session_state.selected_tab:
        response_template = cohort_info['xgb_response']
    else:
        response_template = cohort_info['response']

    # Format response with passenger description
    response_text = response_template.format(passenger_desc=passenger_desc)

    # Add to chat history
    st.session_state.chat_history.append({
        "role": "user",
        "content": user_message
    })
    st.session_state.chat_history.append({
        "role": "assistant",
        "content": response_text
    })

    # Update what-if state (SINGLE SOURCE OF TRUTH)
    st.session_state.whatif_updates = {
        'sex': ("Female", 0) if sex == 0 else ("Male", 1),
        'pclass': (pclass, pclass),
        'age': age,
        'fare': fare
    }
    st.session_state.current_preset = cohort_name  # Track for label display

    return response_text
