"""
Models package for Titanic XAI API.
Contains decision tree and XGBoost model implementations.
"""

from .decision_tree import (
    get_trained_model,
    predict_single,
    get_tree_structure,
    get_model_metrics,
    # Backward compatibility
    load_decision_tree_model,
    predict_decision_tree
)
from .xgboost_model import (
    load_xgboost_model,
    get_shap_explanation
)

__all__ = [
    # Decision Tree - New API
    "get_trained_model",
    "predict_single",
    "get_tree_structure",
    "get_model_metrics",
    # Decision Tree - Backward compatibility
    "load_decision_tree_model",
    "predict_decision_tree",
    # XGBoost
    "load_xgboost_model",
    "get_shap_explanation"
]
