"""
Cohort Matching Patterns for Chat System
Provides priority-based pattern matching for different passenger cohorts.
"""

COHORT_PATTERNS = {
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
