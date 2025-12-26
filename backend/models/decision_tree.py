"""
Decision Tree Model Module
Handles training, caching, and prediction with the Decision Tree model.

Ported from Streamlit app (tree_data.py) with the same training logic:
- Uses seaborn titanic dataset
- 4 features: sex, pclass, age, fare
- Train/test split: 80-20, stratified
- DecisionTreeClassifier: max_depth=4, min_samples_split=20, min_samples_leaf=10
"""

from typing import Dict, List, Tuple, Any
from functools import lru_cache
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import seaborn as sns


def load_titanic_data() -> Tuple[pd.DataFrame, pd.Series, List[str], Dict[str, LabelEncoder]]:
    """
    Load and preprocess Titanic dataset from seaborn.

    Uses only the top 4 most predictive features for optimal performance
    with SHAP explanations and what-if scenarios.

    Returns:
        Tuple containing:
            - X (pd.DataFrame): Feature matrix
            - y (pd.Series): Target variable (survived)
            - features (List[str]): Feature names
            - label_encoders (Dict[str, LabelEncoder]): Encoders for categorical features
    """
    data = sns.load_dataset('titanic')

    # Select top 4 features for decision tree
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


def train_decision_tree(
    X: pd.DataFrame,
    y: pd.Series,
    max_depth: int = 4
) -> DecisionTreeClassifier:
    """
    Train a decision tree classifier with specified hyperparameters.

    Args:
        X: Feature matrix
        y: Target variable
        max_depth: Maximum depth of the tree (default: 4)

    Returns:
        Trained DecisionTreeClassifier model
    """
    model = DecisionTreeClassifier(
        max_depth=max_depth,
        min_samples_split=20,
        min_samples_leaf=10,
        random_state=42
    )
    model.fit(X, y)
    return model


def sklearn_tree_to_dict(
    tree: DecisionTreeClassifier,
    feature_names: List[str],
    node_id: int = 0,
    label_encoders: Dict[str, LabelEncoder] = None
) -> Dict[str, Any]:
    """
    Recursively convert sklearn tree to nested dictionary format.

    Format works for both D3 (hierarchical) and Plotly (can be flattened).

    Args:
        tree: Trained DecisionTreeClassifier
        feature_names: List of feature names
        node_id: Current node ID (default: 0 for root)
        label_encoders: Dictionary of label encoders for categorical features

    Returns:
        Nested dictionary representing the tree structure
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
    # Note: value contains counts (not proportions) for each class
    class_0_count = int(value[0])
    class_1_count = int(value[1])
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
        elif feature_name == 'pclass':
            # For passenger class, show meaningful class names
            # pclass is 1, 2, or 3 (1st, 2nd, 3rd class)
            # Left child: ≤ threshold, Right child: > threshold
            if threshold <= 1.5:
                # Split at 1.5: pclass 1 vs pclass 2&3
                node_data['left_label'] = '1st class'
                node_data['right_label'] = '2nd & 3rd class'
            elif threshold <= 2.5:
                # Split at 2.5: pclass 1&2 vs pclass 3
                node_data['left_label'] = '1st & 2nd class'
                node_data['right_label'] = '3rd class'
            else:
                # Unusual split, shouldn't happen with pclass values
                node_data['left_label'] = f"≤ {threshold:.1f}"
                node_data['right_label'] = f"> {threshold:.1f}"
        else:
            # For numeric features, just show the threshold
            node_data['left_label'] = f"≤ {threshold:.1f}"
            node_data['right_label'] = f"> {threshold:.1f}"
    else:
        node_data['split_rule'] = f"Predict: {'Survived' if predicted_class == 1 else 'Died'}"

    return node_data


@lru_cache(maxsize=1)
def get_trained_model() -> Dict[str, Any]:
    """
    Get trained decision tree model with train/test split.

    Uses LRU cache to ensure model is only trained once and reused.
    This is the main function to get the cached model.

    Returns:
        Dictionary containing:
            - tree (dict): Tree structure in nested format
            - model (DecisionTreeClassifier): Trained sklearn model
            - feature_names (List[str]): Feature names
            - label_encoders (Dict[str, LabelEncoder]): Label encoders
            - X_train, X_test, y_train, y_test: Train/test split data
    """
    X, y, features, label_encoders = load_titanic_data()

    # Train-test split (80-20, stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train model on training set only
    model = train_decision_tree(X_train, y_train, max_depth=4)
    tree_dict = sklearn_tree_to_dict(model, features, label_encoders=label_encoders)

    return {
        'tree': tree_dict,
        'model': model,
        'feature_names': features,
        'label_encoders': label_encoders,
        'X_train': X_train,
        'X_test': X_test,
        'y_train': y_train,
        'y_test': y_test
    }


def predict_single(
    sex: int,
    pclass: int,
    age: float,
    fare: float
) -> Dict[str, Any]:
    """
    Make a prediction for a single passenger using the cached decision tree model.

    Args:
        sex: Gender (0=female, 1=male)
        pclass: Passenger class (1, 2, or 3)
        age: Age in years
        fare: Ticket fare in pounds

    Returns:
        Dictionary containing:
            - prediction (int): Predicted class (0=died, 1=survived)
            - probability_survived (float): Probability of survival
            - probability_died (float): Probability of death
            - prediction_label (str): Human-readable prediction
            - leaf_node_id (int): ID of the leaf node reached
            - path_nodes (List[int]): List of node IDs in the decision path
    """
    tree_data = get_trained_model()
    model = tree_data['model']

    # Create input dataframe
    input_data = pd.DataFrame([{
        'sex': sex,
        'pclass': pclass,
        'age': age,
        'fare': fare
    }])

    # Get prediction and probability
    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]

    # Get decision path
    decision_path = model.decision_path(input_data)
    leaf_id = model.apply(input_data)[0]

    # Get path through tree
    node_indicator = decision_path.toarray()[0]
    path_nodes = [i for i, v in enumerate(node_indicator) if v == 1]

    return {
        'prediction': int(prediction),
        'probability_survived': float(probabilities[1]),
        'probability_died': float(probabilities[0]),
        'prediction_label': 'Survived' if prediction == 1 else 'Died',
        'leaf_node_id': int(leaf_id),
        'path_nodes': path_nodes
    }


def get_tree_structure() -> Dict[str, Any]:
    """
    Get the decision tree structure for visualization.

    Returns:
        Tree structure in nested format ready for frontend visualization
    """
    tree_data = get_trained_model()
    return tree_data['tree']


def get_model_metrics() -> Dict[str, float]:
    """
    Get model performance metrics on the test set.

    Returns:
        Dictionary containing:
            - accuracy (float): Overall accuracy
            - precision (float): Precision score
            - recall (float): Recall score (sensitivity)
            - f1_score (float): F1 score
    """
    tree_data = get_trained_model()
    model = tree_data['model']
    X_test = tree_data['X_test']
    y_test = tree_data['y_test']

    # Calculate metrics
    predictions = model.predict(X_test)

    return {
        'accuracy': float(accuracy_score(y_test, predictions)),
        'precision': float(precision_score(y_test, predictions)),
        'recall': float(recall_score(y_test, predictions)),
        'f1_score': float(f1_score(y_test, predictions))
    }


# Backward compatibility aliases
load_decision_tree_model = get_trained_model
predict_decision_tree = predict_single
