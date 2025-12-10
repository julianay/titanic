"""
Explainable AI Explorer
Two-Column Layout with Chat Interface
Left: Visualization | Right: Chat Interface

This is the default version with pie chart nodes for the Decision Tree visualization.
Each node shows the class distribution (died vs survived) as a pie chart with
blue (died) and green (survived) slices for clearer visualization of splits.

For an alternative gradient node style, see app.py
"""

import streamlit as st
import streamlit.components.v1 as components
import json
import shap
import matplotlib.pyplot as plt
from xgboost import XGBClassifier
from src.tree_data import get_tree_for_visualization
from src.visualizations.decision_tree_viz import get_decision_tree_html
from src.visualizations.shap_viz import (
    get_feature_importance_html,
    get_alternative_waterfall_html,
    get_standard_waterfall_html
)

# Page configuration
st.set_page_config(
    page_title="Explainable AI Explorer",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Reduce main content padding and customize font sizes
st.markdown("""
<style>
    /* Set base font-size for entire app */
    html, body, .stApp {
        font-size: 14px !important;
    }

    /* Reduce padding around main content block */
    .block-container {
        padding-top: 4rem;
        padding-bottom: 2rem;
        padding-left: 2rem;
        padding-right: 2rem;
    }

    /* Custom heading sizes */
    h1 {
        font-size: 24px !important;
        padding: 0 !important;
    }

    h3 {
        font-size: 20px !important;
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# Initialize Session State
# =============================================================================

if 'chat_history' not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "assistant",
            "content": "Ask a question — I'll navigate the models for you\n\nAsk about any group or pattern, and I'll highlight the tree, surface cohort stats, or compare the models' reasoning."
        }
    ]

if 'current_preset' not in st.session_state:
    st.session_state.current_preset = None  # No default - shows global view initially

if 'selected_tab' not in st.session_state:
    st.session_state.selected_tab = "DECISION TREE  Accuracy: 81% | Recall: 60%"  # Track which tab is active

# Initialize what-if controls with default values (Female, 2nd class, age 30, fare 15)
if 'whatif_sex' not in st.session_state:
    st.session_state.whatif_sex = ("Female", 0)
if 'whatif_pclass' not in st.session_state:
    st.session_state.whatif_pclass = (2, 2)
if 'whatif_age' not in st.session_state:
    st.session_state.whatif_age = 30
if 'whatif_fare' not in st.session_state:
    st.session_state.whatif_fare = 15.0

# Pending updates for what-if controls (set when preset is selected via chat)
if 'whatif_updates' not in st.session_state:
    st.session_state.whatif_updates = None

# =============================================================================
# Load Data and Models
# =============================================================================

@st.cache_resource
def load_tree_data():
    """Load decision tree data with train/test split."""
    return get_tree_for_visualization(max_depth=4)

@st.cache_resource
def load_xgboost_and_shap():
    """Train XGBoost model and create SHAP explainer."""
    tree_data = get_tree_for_visualization(max_depth=4)
    X_train = tree_data['X_train']
    y_train = tree_data['y_train']
    X_test = tree_data['X_test']

    # Train XGBoost
    xgb_model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    xgb_model.fit(X_train, y_train)

    # Create SHAP explainer
    explainer = shap.TreeExplainer(xgb_model)

    # Compute SHAP values for a sample
    sample_size = min(200, len(X_test))
    X_sample = X_test.sample(sample_size, random_state=42)
    shap_values = explainer.shap_values(X_sample)

    return xgb_model, explainer, shap_values, X_sample

tree_data = load_tree_data()
xgb_model, shap_explainer, shap_values, X_sample = load_xgboost_and_shap()

# Calculate metrics
dt_accuracy = tree_data['model'].score(tree_data['X_test'], tree_data['y_test'])
dt_recall = 0.60  # Placeholder for "Finds survivors" metric
xgb_accuracy = 0.80  # Placeholder
xgb_recall = 0.72  # Placeholder

# Prepare tree data as JSON
tree_json = json.dumps(tree_data['tree'])

# Preset scenarios
presets = {
    "woman_path": {
        "label": "Women's path (high survival)",
        "values": {'sex': 0, 'pclass': 2, 'age': 30, 'fare': 20.0}
    },
    "man_path": {
        "label": "Men's path (low survival)",
        "values": {'sex': 1, 'pclass': 3, 'age': 30, 'fare': 13.0}
    },
    "first_class_child": {
        "label": "1st class child (best odds)",
        "values": {'sex': 0, 'pclass': 1, 'age': 5, 'fare': 84.0}
    },
    "third_class_male": {
        "label": "3rd class male (worst odds)",
        "values": {'sex': 1, 'pclass': 3, 'age': 40, 'fare': 8.0}
    }
}

# =============================================================================
# Cohort Matching System (Integrated - Phase 2 Complete)
# Provides flexible, priority-based chat parsing and unified state management
# =============================================================================

cohort_patterns = {
    "first_class_child": {
        "priority": 3,  # Highest priority (most specific)
        "match_criteria": {
            "pclass": 1,
            "age_range": (0, 12)
        },
        "response": "First class children had the best odds. Children, especially in 1st and 2nd class, had high survival rates.",
        "xgb_response": "First class children had the best odds. For the SHAP analysis, I'm using this passenger: {passenger_desc}. The XGBoost tab shows which features strongly pushed this passenger toward survival."
    },
    "third_class_male": {
        "priority": 2,
        "match_criteria": {
            "sex": 1,
            "pclass": 3
        },
        "response": "Third class males had the worst odds (24% survival rate). They were located furthest from lifeboats and had limited access to the deck.",
        "xgb_response": "Third class males had the worst odds (24% survival rate). For the SHAP analysis, I'm using this passenger: {passenger_desc}. The XGBoost tab shows which features strongly pushed this passenger toward death."
    },
    "women": {
        "priority": 1,
        "match_criteria": {
            "sex": 0
        },
        "response": "Women had a 74% survival rate. The 'women and children first' protocol was largely followed.",
        "xgb_response": "Women had a 74% survival rate. For the SHAP analysis, I'm using this passenger: {passenger_desc}. The XGBoost tab shows which features pushed this passenger toward survival."
    },
    "men": {
        "priority": 1,
        "match_criteria": {
            "sex": 1
        },
        "response": "Men had only a 19% survival rate (109 survived out of 577).",
        "xgb_response": "Men had only a 19% survival rate (109 survived out of 577). For the SHAP analysis, I'm using this passenger: {passenger_desc}. The XGBoost tab shows which features pushed this passenger toward death."
    },
    "first_class": {
        "priority": 2,
        "match_criteria": {
            "pclass": 1
        },
        "response": "First class passengers had a 63% survival rate (136 survived out of 216). Wealth and proximity to lifeboats mattered.",
        "xgb_response": "First class passengers had a 63% survival rate. Analyzing this passenger: {passenger_desc}."
    },
    "third_class": {
        "priority": 2,
        "match_criteria": {
            "pclass": 3
        },
        "response": "Third class passengers had the worst odds (119 survived out of 491, 24% survival rate). They were located furthest from lifeboats.",
        "xgb_response": "Third class passengers had the worst odds (24% survival rate). Analyzing this passenger: {passenger_desc}."
    }
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
        cohort_patterns.items(),
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
        import re
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

# =============================================================================
# Apply pending what-if updates BEFORE rendering columns
# =============================================================================

# Apply pending what-if updates from button clicks (before widgets are created)
if 'whatif_updates' in st.session_state and st.session_state.whatif_updates:
    st.session_state.whatif_sex = st.session_state.whatif_updates['sex']
    st.session_state.whatif_pclass = st.session_state.whatif_updates['pclass']
    st.session_state.whatif_age = st.session_state.whatif_updates['age']
    st.session_state.whatif_fare = st.session_state.whatif_updates['fare']
    st.session_state.whatif_updates = None  # Clear after applying

# =============================================================================
# Two-Column Layout
# =============================================================================

col1, col2 = st.columns([3, 1])

# =============================================================================
# LEFT COLUMN: Visualization (HTML Component)
# =============================================================================

with col1:
    # Native Streamlit header and subtitle
    st.markdown("# Explainable AI Explorer", unsafe_allow_html=True)
    st.markdown('<p style="font-size: 20px; color: #a0a0a0; margin-bottom: 20px;">Interactively compare how two models reason about the same prediction task</p>', unsafe_allow_html=True)

    # Get current preset key for chat context
    current_preset_key = st.session_state.current_preset

    # Always use what-if values (they get synced when presets are selected via chat)
    if ('whatif_sex' in st.session_state and
        'whatif_pclass' in st.session_state and
        'whatif_age' in st.session_state and
        'whatif_fare' in st.session_state):
        # Build values from what-if session state
        current_preset_values = {
            'sex': st.session_state.whatif_sex[1],
            'pclass': st.session_state.whatif_pclass[1],
            'age': st.session_state.whatif_age,
            'fare': st.session_state.whatif_fare
        }
    else:
        # Fallback to None if what-if not initialized yet
        current_preset_values = None

    # Prepare preset values for JavaScript (null keyword, not string)
    preset_values_js = "null" if current_preset_values is None else json.dumps(current_preset_values)

    # Tab selector with radio buttons (styled horizontally)
    st.session_state.selected_tab = st.radio(
        "Select Model",
        ["DECISION TREE  Accuracy: 81% | Recall: 60%", "XGBOOST  Accuracy: 80% | Recall: 72%"],
        index=0 if st.session_state.selected_tab in ["Decision Tree", "DECISION TREE  Accuracy: 81% | Recall: 60%"] else 1,
        horizontal=True,
        label_visibility="collapsed",
        key="tab_selector"
    )

    # D3 Tree HTML - Generate using visualization module
    import hashlib
    preset_hash = hashlib.md5(str(current_preset_key).encode()).hexdigest()[:8]

    # Call visualization module to generate HTML
    html_code = get_decision_tree_html(
        tree_json=tree_json,
        preset_values_js=preset_values_js,
        preset_hash=preset_hash
    )

    # Render content based on selected tab
    if "DECISION TREE" in st.session_state.selected_tab:
        components.html(html_code, height=800, scrolling=False)

    else:  # XGBoost tab
        st.markdown("### 🔍 Making XGBoost Interpretable with SHAP")
        st.markdown("""
        While XGBoost is more accurate, it's harder to understand *why* it makes predictions.
        **SHAP (SHapley Additive exPlanations)** helps explain XGBoost's decisions.
        """)

        # Calculate mean absolute SHAP values for each feature (needed for both charts)
        import numpy as np
        mean_shap_values = np.abs(shap_values).mean(axis=0)
        feature_names = X_sample.columns.tolist()

        # Create data for global chart
        shap_data = []
        for i, (feat, val) in enumerate(zip(feature_names, mean_shap_values)):
            shap_data.append({"feature": feat, "value": float(val)})

        # Sort by value descending
        shap_data_sorted = sorted(shap_data, key=lambda x: x['value'], reverse=True)
        shap_json = json.dumps(shap_data_sorted)

        # Two-column layout for global charts (1:2 ratio = 25% global, 50% waterfall)
        col_global_left, col_global_right = st.columns([1, 2])

        with col_global_left:
            st.markdown("#### 📈 Global Feature Importance")
            st.caption("Which features matter most across all predictions")

            # D3 Global Feature Importance Chart
            waterfall_html = get_feature_importance_html(shap_json)
            components.html(waterfall_html, height=400, scrolling=False)

        with col_global_right:
            st.markdown("#### 💧 Individual Prediction Explanation")

            # Prepare data for alternative waterfall - always use what-if values
            demo_preset_values = {
                'sex': st.session_state.whatif_sex[1],
                'pclass': st.session_state.whatif_pclass[1],
                'age': st.session_state.whatif_age,
                'fare': st.session_state.whatif_fare
            }

            # Generate passenger description from what-if values
            sex_label = "Female" if demo_preset_values['sex'] == 0 else "Male"
            pclass_label = f"{int(demo_preset_values['pclass'])}{'st' if demo_preset_values['pclass']==1 else 'nd' if demo_preset_values['pclass']==2 else 'rd'} class"
            demo_passenger_desc = f"{sex_label}, {pclass_label}, age {int(demo_preset_values['age'])}, fare £{demo_preset_values['fare']:.2f}"

            # Match current values to cohort for display label
            matched_cohort, _ = match_to_cohort(
                demo_preset_values['sex'],
                demo_preset_values['pclass'],
                demo_preset_values['age'],
                demo_preset_values['fare']
            )

            # Show title based on cohort match
            if matched_cohort:
                # Use cohort name as label
                cohort_labels = {
                    "first_class_child": "1st class child (best odds)",
                    "third_class_male": "3rd class male (worst odds)",
                    "women": "Women's path (high survival)",
                    "men": "Men's path (low survival)",
                    "first_class": "1st class passengers",
                    "third_class": "3rd class passengers"
                }
                label = cohort_labels.get(matched_cohort, "Custom passenger")
                st.markdown(f"Showing XGBoost's reasoning for: **{label}**")
            else:
                st.markdown(f"Showing XGBoost's reasoning for: **What-If Scenario**")
            st.caption(f"Analyzing: {demo_passenger_desc}")

            # Create input for this passenger
            import pandas as pd
            x_input_demo = pd.DataFrame([demo_preset_values])

            # Get SHAP values for this passenger
            shap_values_demo = shap_explainer.shap_values(x_input_demo)[0]
            base_value_demo = shap_explainer.expected_value
            final_prediction_demo = float(base_value_demo + np.sum(shap_values_demo))

            # Prepare waterfall data
            waterfall_data_demo = []
            cumulative_demo = base_value_demo

            for i, (feat, shap_val) in enumerate(zip(x_input_demo.columns, shap_values_demo)):
                waterfall_data_demo.append({
                    "feature": feat,
                    "value": float(shap_val),
                    "start": float(cumulative_demo),
                    "end": float(cumulative_demo + shap_val),
                    "feature_value": float(x_input_demo.iloc[0][feat])
                })
                cumulative_demo += shap_val

            # Sort by absolute SHAP value
            waterfall_data_sorted_demo = sorted(waterfall_data_demo, key=lambda x: abs(x['value']), reverse=True)

            # Prepare data for alternative waterfall (use same data, but need cumulative positions)
            alternative_waterfall_data_demo = []
            cumulative_alt_demo = base_value_demo

            # Add base value as starting point
            alternative_waterfall_data_demo.append({
                "feature": "Base Value",
                "value": 0,
                "start": float(base_value_demo),
                "end": float(base_value_demo),
                "cumulative": float(base_value_demo),
                "feature_value": ""
            })

            # Add each feature contribution
            for item in waterfall_data_sorted_demo:
                cumulative_alt_demo += item['value']
                alternative_waterfall_data_demo.append({
                    "feature": item['feature'],
                    "value": float(item['value']),
                    "start": float(cumulative_alt_demo - item['value']),
                    "end": float(cumulative_alt_demo),
                    "cumulative": float(cumulative_alt_demo),
                    "feature_value": float(item['feature_value'])
                })

            alternative_waterfall_json_demo = json.dumps(alternative_waterfall_data_demo)

            # D3 Alternative Waterfall Chart with Floating Bars (Horizontal)
            alternative_waterfall_html_demo = get_alternative_waterfall_html(
                alternative_waterfall_json_demo,
                base_value_demo,
                final_prediction_demo
            )
            components.html(alternative_waterfall_html_demo, height=400, scrolling=False)

        st.markdown("---")

        # Individual Prediction Waterfall (based on current what-if values) - Standard View
        st.markdown("#### 💧 Standard Waterfall Chart")

        # Use current what-if values (same as alternative waterfall for consistency)
        std_preset_values = {
            'sex': st.session_state.whatif_sex[1],
            'pclass': st.session_state.whatif_pclass[1],
            'age': st.session_state.whatif_age,
            'fare': st.session_state.whatif_fare
        }

        # Generate passenger description from what-if values
        sex_label = "Female" if std_preset_values['sex'] == 0 else "Male"
        pclass_label = f"{int(std_preset_values['pclass'])}{'st' if std_preset_values['pclass']==1 else 'nd' if std_preset_values['pclass']==2 else 'rd'} class"
        std_passenger_desc = f"{sex_label}, {pclass_label}, age {int(std_preset_values['age'])}, fare £{std_preset_values['fare']:.2f}"

        # Match to cohort for display label
        matched_cohort_std, _ = match_to_cohort(
            std_preset_values['sex'],
            std_preset_values['pclass'],
            std_preset_values['age'],
            std_preset_values['fare']
        )

        # Show title based on cohort match
        if matched_cohort_std:
            cohort_labels = {
                "first_class_child": "1st class child (best odds)",
                "third_class_male": "3rd class male (worst odds)",
                "women": "Women's path (high survival)",
                "men": "Men's path (low survival)",
                "first_class": "1st class passengers",
                "third_class": "3rd class passengers"
            }
            label = cohort_labels.get(matched_cohort_std, "Custom passenger")
            st.markdown(f"Showing XGBoost's reasoning for: **{label}**")
        else:
            st.markdown(f"Showing XGBoost's reasoning for: **What-If Scenario**")
        st.caption(f"Analyzing: {std_passenger_desc}")

        # Create input for this passenger
        import pandas as pd
        x_input = pd.DataFrame([std_preset_values])

        # Get SHAP values for this passenger
        import numpy as np
        shap_values_individual = shap_explainer.shap_values(x_input)[0]
        base_value = shap_explainer.expected_value
        final_prediction = float(base_value + np.sum(shap_values_individual))

        # Prepare waterfall data
        waterfall_data = []
        cumulative = base_value

        for i, (feat, shap_val) in enumerate(zip(x_input.columns, shap_values_individual)):
            waterfall_data.append({
                "feature": feat,
                "value": float(shap_val),
                "start": float(cumulative),
                "end": float(cumulative + shap_val),
                "feature_value": float(x_input.iloc[0][feat])
            })
            cumulative += shap_val

        # Sort by absolute SHAP value
        waterfall_data_sorted = sorted(waterfall_data, key=lambda x: abs(x['value']), reverse=True)
        waterfall_json_individual = json.dumps(waterfall_data_sorted)

        # D3 Waterfall Chart for Individual
        individual_waterfall_html = get_standard_waterfall_html(
            waterfall_json_individual,
            base_value,
            final_prediction
        )
        components.html(individual_waterfall_html, height=500, scrolling=False)

        # Explanation
        st.markdown("""
        **How to read this chart:**
        - 🟢 **Green bars** push prediction toward survival (positive SHAP values)
        - 🔴 **Red bars** push prediction toward death (negative SHAP values)
        - **Longer bars** = stronger impact on the prediction
        - **Base value** = model's average prediction across all passengers
        - **Final prediction** = base value + sum of all SHAP values
        """)

# =============================================================================
# RIGHT COLUMN: Chat Interface (Streamlit)
# =============================================================================

with col2:
    # Callback function to update fare when class changes
    def update_fare_for_class():
        """Update fare to average for selected class."""
        selected_pclass = st.session_state.whatif_pclass[1]
        # Average fares by class (historical Titanic data)
        class_avg_fares = {
            1: 84.0,   # 1st class average
            2: 20.0,   # 2nd class average
            3: 13.0    # 3rd class average
        }
        st.session_state.whatif_fare = class_avg_fares[selected_pclass]

    # What-If Scenario Controls - Inline layout with columns
    st.markdown("### 🔮 What-If Scenario")

    # Sex - inline with label
    col_sex_label, col_sex_input = st.columns([1, 4])
    with col_sex_label:
        st.markdown("**Sex:**")
    with col_sex_input:
        sex_input = st.radio(
            "Sex",
            options=[("Female", 0), ("Male", 1)],
            format_func=lambda x: x[0],
            horizontal=True,
            key="whatif_sex",
            label_visibility="collapsed"
        )

    # Passenger Class - inline with label using radio buttons
    col_pclass_label, col_pclass_input = st.columns([1, 4])
    with col_pclass_label:
        st.markdown("**Passenger Class:**")
    with col_pclass_input:
        pclass_input = st.radio(
            "Passenger Class",
            options=[(1, 1), (2, 2), (3, 3)],
            format_func=lambda x: f"{x[0]}",
            horizontal=True,
            key="whatif_pclass",
            label_visibility="collapsed",
            on_change=update_fare_for_class
        )

    # Age - inline with label
    col_age_label, col_age_input = st.columns([1, 4])
    with col_age_label:
        st.markdown("**Age:**")
    with col_age_input:
        age_input = st.slider(
            "Age",
            min_value=0,
            max_value=80,
            key="whatif_age",
            label_visibility="collapsed"
        )

    # Fare - inline with label
    col_fare_label, col_fare_input = st.columns([1, 4])
    with col_fare_label:
        st.markdown("**Fare:**")
    with col_fare_input:
        fare_input = st.slider(
            "Fare",
            min_value=0.0,
            max_value=500.0,
            step=0.5,
            key="whatif_fare",
            label_visibility="collapsed"
        )

    # Show hint if fare/class combination is historically unusual
    selected_pclass = st.session_state.whatif_pclass[1]
    selected_fare = st.session_state.whatif_fare

    # Typical fare ranges by class (historical Titanic data)
    fare_ranges = {
        1: (30, 500, "1st class"),
        2: (10, 30, "2nd class"),
        3: (0, 15, "3rd class")
    }

    min_fare, max_fare, class_name = fare_ranges[selected_pclass]

    if selected_fare < min_fare or selected_fare > max_fare:
        if selected_fare > max_fare:
            st.caption(f"⚠️ £{selected_fare:.2f} is unusually high for {class_name} (typical: £{min_fare}-£{max_fare})")
        else:
            st.caption(f"⚠️ £{selected_fare:.2f} is unusually low for {class_name} (typical: £{min_fare}-£{max_fare})")

    st.markdown("### 💬 Chat")

    # Scrollable chat history container
    chat_container = st.container(height=300)
    with chat_container:
        for message in st.session_state.chat_history:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

    st.markdown("**Or try one of these to get started**")

    # Suggestion buttons - now use unified update mechanism
    for preset_key, preset_info in presets.items():
        if st.button(preset_info["label"], key=f"btn_{preset_key}", use_container_width=True):
            # Extract values from preset
            preset_values = preset_info["values"]

            # Use unified update function
            update_whatif_and_respond(
                sex=preset_values['sex'],
                pclass=preset_values['pclass'],
                age=preset_values['age'],
                fare=preset_values['fare'],
                user_message=preset_info["label"]
            )

            st.rerun()

    # Chat input at the bottom
    user_input = st.chat_input("What would you like to know?", key="chat_input")

    # Handle text input
    if user_input:
        # Try to parse natural language
        parsed = parse_passenger_query(user_input)

        if parsed:
            # Successfully parsed - use unified update
            update_whatif_and_respond(
                sex=parsed['sex'],
                pclass=parsed['pclass'],
                age=parsed['age'],
                fare=parsed['fare'],
                user_message=user_input
            )
        else:
            # Couldn't parse - provide helpful fallback
            st.session_state.chat_history.append({
                "role": "user",
                "content": user_input
            })
            st.session_state.chat_history.append({
                "role": "assistant",
                "content": "I couldn't parse that query. Try asking about specific passengers like:\n- 'show me a woman in 1st class'\n- 'what about a young boy in 3rd'\n- 'elderly man in second class'\n\nOr use the preset buttons below!"
            })

        st.rerun()
