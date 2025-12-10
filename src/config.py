"""Configuration constants for the Titanic Survival Prediction application.

This module contains all configuration constants including preset scenarios,
fare ranges, and class-specific average fares based on historical Titanic data.
"""

# Preset scenarios for quick exploration
PRESETS = {
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

# Average fares by passenger class (historical Titanic data)
CLASS_AVG_FARES = {
    1: 84.0,   # 1st class average
    2: 20.0,   # 2nd class average
    3: 13.0    # 3rd class average
}

# Typical fare ranges by class (min, max, class_name) - historical Titanic data
FARE_RANGES = {
    1: (30, 500, "1st class"),
    2: (10, 30, "2nd class"),
    3: (0, 15, "3rd class")
}
