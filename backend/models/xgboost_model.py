"""
XGBoost Model Module
Handles loading, training, and SHAP explanations for the XGBoost model.
"""

import pandas as pd
import numpy as np
from functools import lru_cache
import shap
from xgboost import XGBClassifier

from .decision_tree import get_trained_model


@lru_cache(maxsize=1)
def load_xgboost_model():
    """
    Load and cache the XGBoost model with SHAP explainer.
    Uses LRU cache to ensure model is only loaded once.

    Returns:
        dict: Contains model, explainer, and training data
    """
    # Get training data from decision tree module (uses same train/test split)
    tree_data = get_trained_model()
    X_train = tree_data['X_train']
    y_train = tree_data['y_train']
    X_test = tree_data['X_test']
    y_test = tree_data['y_test']

    # Train XGBoost model
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

    # Compute SHAP values for a sample (for global importance)
    sample_size = min(200, len(X_test))
    X_sample = X_test.sample(sample_size, random_state=42)
    shap_values = explainer.shap_values(X_sample)

    return {
        'model': xgb_model,
        'explainer': explainer,
        'X_train': X_train,
        'y_train': y_train,
        'X_test': X_test,
        'y_test': y_test,
        'X_sample': X_sample,
        'shap_values': shap_values
    }


def predict_xgboost(sex: int, pclass: int, age: float, fare: float):
    """
    Make a prediction using the XGBoost model.

    Args:
        sex: Gender (0=female, 1=male)
        pclass: Passenger class (1, 2, or 3)
        age: Age in years
        fare: Ticket fare in pounds

    Returns:
        dict: Prediction result with probability
    """
    model_data = load_xgboost_model()
    model = model_data['model']

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

    return {
        'prediction': int(prediction),
        'probability_survived': float(probabilities[1]),
        'probability_died': float(probabilities[0]),
        'prediction_label': 'Survived' if prediction == 1 else 'Died'
    }


def get_shap_explanation(sex: int, pclass: int, age: float, fare: float):
    """
    Get SHAP explanation for a specific prediction.

    Args:
        sex: Gender (0=female, 1=male)
        pclass: Passenger class (1, 2, or 3)
        age: Age in years
        fare: Ticket fare in pounds

    Returns:
        dict: SHAP values and explanation data
    """
    model_data = load_xgboost_model()
    explainer = model_data['explainer']

    # Create input dataframe
    input_data = pd.DataFrame([{
        'sex': sex,
        'pclass': pclass,
        'age': age,
        'fare': fare
    }])

    # Get SHAP values
    shap_values_individual = explainer.shap_values(input_data)[0]
    expected_val = explainer.expected_value

    # Handle different SHAP explainer types (array or scalar)
    if hasattr(expected_val, '__len__'):
        base_value = float(expected_val[0])
    else:
        base_value = float(expected_val)

    final_prediction = float(base_value + np.sum(shap_values_individual))

    # Prepare waterfall data
    feature_names = input_data.columns.tolist()
    waterfall_data = []
    cumulative = base_value

    for feat, shap_val, feat_val in zip(feature_names, shap_values_individual, input_data.iloc[0]):
        waterfall_data.append({
            "feature": feat,
            "value": float(shap_val),
            "start": float(cumulative),
            "end": float(cumulative + shap_val),
            "feature_value": float(feat_val)
        })
        cumulative += shap_val

    # Sort by absolute SHAP value
    waterfall_data_sorted = sorted(waterfall_data, key=lambda x: abs(x['value']), reverse=True)

    return {
        'base_value': base_value,
        'final_prediction': final_prediction,
        'shap_values': {feat: float(val) for feat, val in zip(feature_names, shap_values_individual)},
        'waterfall_data': waterfall_data_sorted
    }


def get_global_feature_importance():
    """
    Get global feature importance using mean absolute SHAP values.

    Returns:
        dict: Feature importance scores
    """
    model_data = load_xgboost_model()
    shap_values = model_data['shap_values']
    X_sample = model_data['X_sample']

    # Calculate mean absolute SHAP values
    mean_shap_values = np.abs(shap_values).mean(axis=0)
    feature_names = X_sample.columns.tolist()

    # Create feature importance data
    importance_data = []
    for feat, val in zip(feature_names, mean_shap_values):
        importance_data.append({
            "feature": feat,
            "importance": float(val)
        })

    # Sort by importance descending
    importance_data_sorted = sorted(importance_data, key=lambda x: x['importance'], reverse=True)

    return {
        'feature_importance': importance_data_sorted
    }


def get_xgboost_metrics():
    """
    Get XGBoost model performance metrics.

    Returns:
        dict: Accuracy and other metrics on test set
    """
    model_data = load_xgboost_model()
    model = model_data['model']
    X_test = model_data['X_test']
    y_test = model_data['y_test']

    # Calculate metrics
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

    predictions = model.predict(X_test)

    return {
        'accuracy': float(accuracy_score(y_test, predictions)),
        'precision': float(precision_score(y_test, predictions)),
        'recall': float(recall_score(y_test, predictions)),
        'f1_score': float(f1_score(y_test, predictions))
    }
