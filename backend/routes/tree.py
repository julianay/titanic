"""
Tree Structure Routes
Endpoints for retrieving decision tree structure for visualization.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from functools import lru_cache

from models.decision_tree import get_trained_model, get_tree_structure, get_model_metrics


router = APIRouter()


# Response models
class TreeNodeResponse(BaseModel):
    """
    Tree node structure for D3.js visualization.

    Matches the format expected by D3 tree visualizations with nested children.
    """
    id: int = Field(..., description="Node ID")
    feature: Optional[str] = Field(None, description="Feature used for split (None for leaf nodes)")
    threshold: Optional[float] = Field(None, description="Split threshold value")
    samples: int = Field(..., description="Number of samples at this node")
    class_0: int = Field(..., description="Number of samples that died")
    class_1: int = Field(..., description="Number of samples that survived")
    predicted_class: int = Field(..., description="Predicted class for this node (0 or 1)")
    probability: float = Field(..., description="Probability of survival at this node")
    is_leaf: bool = Field(..., description="Whether this is a leaf node")
    split_rule: str = Field(..., description="Human-readable split rule or prediction")
    left_label: Optional[str] = Field(None, description="Label for left branch")
    right_label: Optional[str] = Field(None, description="Label for right branch")
    children: Optional[List[Dict[str, Any]]] = Field(None, description="Child nodes (recursive)")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 0,
                "feature": "sex",
                "threshold": 0.5,
                "samples": 571,
                "class_0": 342,
                "class_1": 229,
                "predicted_class": 0,
                "probability": 0.401,
                "is_leaf": False,
                "split_rule": "sex ≤ 0.50",
                "left_label": "female",
                "right_label": "male",
                "children": []
            }
        }


class ModelMetrics(BaseModel):
    """Model performance metrics."""
    accuracy: float = Field(..., description="Overall accuracy on test set")
    precision: float = Field(..., description="Precision score")
    recall: float = Field(..., description="Recall score (sensitivity)")
    f1_score: float = Field(..., description="F1 score")


class TreeResponse(BaseModel):
    """Complete tree response with structure, features, and metrics."""
    tree: Dict[str, Any] = Field(..., description="Nested tree structure")
    feature_names: List[str] = Field(..., description="List of feature names")
    model_metrics: ModelMetrics = Field(..., description="Model performance metrics")


@lru_cache(maxsize=1)
def _get_cached_tree_response() -> dict:
    """
    Get cached tree response with structure, features, and metrics.

    This is cached since the tree structure and metrics don't change during runtime.

    Returns:
        dict: Complete tree response with all required fields
    """
    # Get tree structure (already uses sklearn_tree_to_dict from original code)
    tree_structure = get_tree_structure()

    # Get trained model for feature names
    model_data = get_trained_model()
    feature_names = model_data['feature_names']

    # Get model metrics (accuracy, recall on test set)
    metrics = get_model_metrics()

    return {
        "tree": tree_structure,
        "feature_names": feature_names,
        "model_metrics": metrics
    }


@router.get("/tree", response_model=TreeResponse)
async def get_tree_with_metrics():
    """
    Get the complete decision tree structure with metrics.

    Returns the tree in nested dict format matching D3.js visualization expectations.
    The tree is generated using sklearn_tree_to_dict from the original Streamlit code.

    Tree node structure:
    - id: Node ID
    - feature: Feature name for split (None for leaf)
    - threshold: Split threshold value
    - samples: Number of samples at node
    - class_0: Number of samples that died
    - class_1: Number of samples that survived
    - predicted_class: Predicted class (0 or 1)
    - probability: Probability of survival
    - is_leaf: Whether this is a leaf node
    - children: List of child nodes (recursive)
    - split_rule: Human-readable split rule
    - left_label: Label for left branch (e.g., "female", "≤ 30.0")
    - right_label: Label for right branch (e.g., "male", "> 30.0")

    Response includes:
    - tree: Nested tree structure for D3 visualization
    - feature_names: List of features ["sex", "pclass", "age", "fare"]
    - model_metrics: Performance metrics (accuracy, precision, recall, f1_score)

    The result is cached as it doesn't change during runtime.
    """
    try:
        return _get_cached_tree_response()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tree: {str(e)}")


@router.get("/tree/structure")
async def get_tree_structure_only():
    """
    Get the complete decision tree structure (legacy endpoint).

    Returns the tree in nested JSON format ready for D3.js visualization.
    This includes all nodes with their split rules, class distributions,
    and predictions.

    For a more complete response with metrics, use GET /api/tree instead.
    """
    try:
        tree_structure = get_tree_structure()
        return {
            "tree": tree_structure,
            "metadata": {
                "max_depth": 4,
                "features": ["sex", "pclass", "age", "fare"],
                "classes": ["Died", "Survived"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tree structure: {str(e)}")
