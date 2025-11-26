"""
Tree data extraction module - visualization agnostic.
Converts sklearn DecisionTreeClassifier to formats usable by D3, Plotly, etc.
"""

import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import seaborn as sns


def load_titanic_data():
    """Load and preprocess Titanic dataset.

    Uses only the top 4 most predictive features for optimal performance
    with SHAP explanations and what-if scenarios on free-tier deployments.
    """
    data = sns.load_dataset('titanic')

    # Select top 4 features for decision tree (optimized for SHAP performance)
    # Removed: embarked, parch, sibsp (low importance, minimal accuracy impact)
    features = ['sex', 'pclass', 'age', 'fare']
    target = 'survived'

    # Drop rows with missing values
    df = data[features + [target]].dropna()

    # Encode categorical variables
    label_encoders = {}
    for col in ['sex']:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    X = df[features]
    y = df[target]

    return X, y, features, label_encoders


def train_decision_tree(X, y, max_depth=4):
    """Train a decision tree classifier."""
    model = DecisionTreeClassifier(
        max_depth=max_depth,
        min_samples_split=20,
        min_samples_leaf=10,
        random_state=42
    )
    model.fit(X, y)
    return model


def sklearn_tree_to_dict(tree, feature_names, node_id=0, label_encoders=None):
    """
    Recursively convert sklearn tree to nested dictionary.
    Format works for both D3 (hierarchical) and Plotly (can be flattened).
    """
    tree_ = tree.tree_
    feature_name = feature_names[tree_.feature[node_id]] if tree_.feature[node_id] != -2 else None
    threshold = tree_.threshold[node_id]

    if label_encoders is None:
        label_encoders = {}

    # Get class distribution
    value = tree_.value[node_id][0]
    samples = int(tree_.n_node_samples[node_id])

    # Determine majority class and probability
    # Note: value contains proportions, multiply by samples to get counts
    class_0_count = int(value[0] * samples)
    class_1_count = int(value[1] * samples)
    predicted_class = 1 if class_1_count > class_0_count else 0
    probability = class_1_count / samples if samples > 0 else 0

    node_data = {
        'id': int(node_id),
        'feature': feature_name,
        'threshold': float(threshold) if threshold != -2 else None,
        'samples': samples,
        'class_0': class_0_count,
        'class_1': class_1_count,
        'predicted_class': int(predicted_class),
        'probability': round(probability, 3),
        'is_leaf': bool(tree_.feature[node_id] == -2)
    }

    # If not a leaf, recurse to children
    if tree_.feature[node_id] != -2:
        left_child = tree_.children_left[node_id]
        right_child = tree_.children_right[node_id]

        node_data['children'] = [
            sklearn_tree_to_dict(tree, feature_names, left_child, label_encoders),
            sklearn_tree_to_dict(tree, feature_names, right_child, label_encoders)
        ]

        # Add split rule text for display
        node_data['split_rule'] = f"{feature_name} ≤ {threshold:.2f}"

        # Add decoded labels for edge display
        if feature_name in label_encoders:
            le = label_encoders[feature_name]
            # For categorical features, get the label names
            if feature_name == 'sex':
                # threshold for sex is typically 0.5 (0=female, 1=male)
                node_data['left_label'] = 'female'
                node_data['right_label'] = 'male'
            elif feature_name == 'embarked':
                # Get actual port names
                try:
                    left_val = int(threshold)
                    node_data['left_label'] = f"≤ {le.inverse_transform([left_val])[0]}"
                    node_data['right_label'] = f"> {le.inverse_transform([left_val])[0]}"
                except:
                    node_data['left_label'] = f"≤ {threshold:.1f}"
                    node_data['right_label'] = f"> {threshold:.1f}"
        else:
            # For numeric features, just show the threshold
            node_data['left_label'] = f"≤ {threshold:.1f}"
            node_data['right_label'] = f"> {threshold:.1f}"
    else:
        node_data['split_rule'] = f"Predict: {'Survived' if predicted_class == 1 else 'Died'}"

    return node_data


def get_tree_for_visualization(max_depth=4):
    """
    Main function to get tree data ready for visualization.
    Returns tree dict that can be used by both D3 and Plotly.
    """
    X, y, features, label_encoders = load_titanic_data()
    model = train_decision_tree(X, y, max_depth=max_depth)
    tree_dict = sklearn_tree_to_dict(model, features, label_encoders=label_encoders)

    return {
        'tree': tree_dict,
        'model': model,
        'feature_names': features,
        'label_encoders': label_encoders,
        'X': X,
        'y': y
    }
