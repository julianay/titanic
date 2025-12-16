"""
Prediction Routes
Endpoints for making predictions with Decision Tree and XGBoost models.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Literal

from models.decision_tree import (
    predict_single,
    predict_decision_tree,
    get_model_metrics
)
from models.xgboost_model import (
    predict_xgboost,
    get_shap_explanation,
    get_global_feature_importance,
    get_xgboost_metrics
)


router = APIRouter()


# Pydantic models for request/response validation
class PassengerInput(BaseModel):
    """
    Input model for passenger data.

    Example request:
        {
            "sex": 0,
            "pclass": 1,
            "age": 30.0,
            "fare": 84.0
        }
    """
    sex: int = Field(..., ge=0, le=1, description="Gender: 0=female, 1=male")
    pclass: int = Field(..., ge=1, le=3, description="Passenger class: 1, 2, or 3")
    age: float = Field(..., ge=0, le=100, description="Age in years")
    fare: float = Field(..., ge=0, description="Ticket fare in pounds")

    @validator('sex')
    def validate_sex(cls, v):
        if v not in [0, 1]:
            raise ValueError('sex must be 0 (female) or 1 (male)')
        return v

    @validator('pclass')
    def validate_pclass(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError('pclass must be 1, 2, or 3')
        return v

    @validator('age')
    def validate_age(cls, v):
        if v < 0:
            raise ValueError('age must be >= 0')
        return v

    @validator('fare')
    def validate_fare(cls, v):
        if v < 0:
            raise ValueError('fare must be >= 0')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "sex": 0,
                "pclass": 1,
                "age": 30.0,
                "fare": 84.0
            }
        }


class PredictionOutput(BaseModel):
    """
    Response model for simple predictions.

    Fields:
        prediction: Predicted class (0=died, 1=survived)
        probability: Probability of survival (0.0 to 1.0)
        survival_rate: Survival probability as percentage (0.0 to 100.0)
    """
    prediction: int = Field(..., ge=0, le=1, description="Predicted class: 0=died, 1=survived")
    probability: float = Field(..., ge=0.0, le=1.0, description="Probability of survival")
    survival_rate: float = Field(..., ge=0.0, le=100.0, description="Survival probability as percentage")


class PredictionResponse(BaseModel):
    """Response model for predictions."""
    prediction: int = Field(..., description="Predicted class: 0=died, 1=survived")
    prediction_label: str = Field(..., description="Human-readable prediction")
    probability_survived: float = Field(..., ge=0, le=1, description="Probability of survival")
    probability_died: float = Field(..., ge=0, le=1, description="Probability of death")
    model: str = Field(..., description="Model used for prediction")


class DecisionTreePredictionResponse(PredictionResponse):
    """Extended response for Decision Tree predictions."""
    leaf_node_id: int = Field(..., description="ID of the leaf node reached")
    path_nodes: list[int] = Field(..., description="List of node IDs in the decision path")


class XGBoostPredictionResponse(PredictionResponse):
    """Response for XGBoost predictions."""
    pass


class SHAPExplanationResponse(BaseModel):
    """Response model for SHAP explanations."""
    base_value: float = Field(..., description="Base prediction value (population average)")
    final_prediction: float = Field(..., description="Final prediction after applying SHAP values")
    shap_values: dict[str, float] = Field(..., description="SHAP value for each feature")
    waterfall_data: list[dict] = Field(..., description="Waterfall chart data sorted by importance")


# Prediction endpoints
@router.post("/predict", response_model=PredictionOutput)
async def predict(passenger: PassengerInput):
    """
    Make a survival prediction using the Decision Tree model.

    This is a simplified prediction endpoint that returns just the essential information:
    prediction, probability, and survival rate.

    Args:
        passenger: PassengerInput with fields:
            - sex: int (0=female, 1=male)
            - pclass: int (1, 2, or 3)
            - age: float (>= 0)
            - fare: float (>= 0)

    Returns:
        PredictionOutput containing:
            - prediction: 0 (died) or 1 (survived)
            - probability: survival probability (0.0 to 1.0)
            - survival_rate: survival probability as percentage (0.0 to 100.0)

    Example request:
        POST /api/predict
        {
            "sex": 0,
            "pclass": 1,
            "age": 30.0,
            "fare": 84.0
        }

    Example response:
        {
            "prediction": 1,
            "probability": 1.0,
            "survival_rate": 100.0
        }
    """
    try:
        # Use decision tree model for prediction
        result = predict_single(
            sex=passenger.sex,
            pclass=passenger.pclass,
            age=passenger.age,
            fare=passenger.fare
        )

        return PredictionOutput(
            prediction=result['prediction'],
            probability=result['probability_survived'],
            survival_rate=result['probability_survived'] * 100.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/decision-tree", response_model=DecisionTreePredictionResponse)
async def predict_with_decision_tree(passenger: PassengerInput):
    """
    Make a prediction using the Decision Tree model.

    Returns the prediction along with the path through the tree.
    """
    try:
        result = predict_decision_tree(
            sex=passenger.sex,
            pclass=passenger.pclass,
            age=passenger.age,
            fare=passenger.fare
        )
        result['model'] = 'decision_tree'
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/xgboost", response_model=XGBoostPredictionResponse)
async def predict_with_xgboost(passenger: PassengerInput):
    """
    Make a prediction using the XGBoost model.

    Returns the prediction with probability scores.
    """
    try:
        result = predict_xgboost(
            sex=passenger.sex,
            pclass=passenger.pclass,
            age=passenger.age,
            fare=passenger.fare
        )
        result['model'] = 'xgboost'
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/both")
async def predict_with_both_models(passenger: PassengerInput):
    """
    Make predictions using both Decision Tree and XGBoost models.

    Returns predictions from both models for comparison.
    """
    try:
        dt_result = predict_decision_tree(
            sex=passenger.sex,
            pclass=passenger.pclass,
            age=passenger.age,
            fare=passenger.fare
        )
        xgb_result = predict_xgboost(
            sex=passenger.sex,
            pclass=passenger.pclass,
            age=passenger.age,
            fare=passenger.fare
        )

        return {
            "decision_tree": {**dt_result, "model": "decision_tree"},
            "xgboost": {**xgb_result, "model": "xgboost"}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# SHAP explanation endpoints
@router.post("/explain/shap", response_model=SHAPExplanationResponse)
async def get_shap_values(passenger: PassengerInput):
    """
    Get SHAP explanation for an XGBoost prediction.

    Returns SHAP values and waterfall data for visualization.
    """
    try:
        result = get_shap_explanation(
            sex=passenger.sex,
            pclass=passenger.pclass,
            age=passenger.age,
            fare=passenger.fare
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP explanation failed: {str(e)}")


@router.get("/explain/global-importance")
async def get_global_importance():
    """
    Get global feature importance using mean absolute SHAP values.

    Returns feature importance scores across all predictions.
    """
    try:
        result = get_global_feature_importance()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature importance calculation failed: {str(e)}")


# Model metrics endpoints
@router.get("/metrics/decision-tree")
async def get_decision_tree_metrics():
    """
    Get performance metrics for the Decision Tree model.

    Returns accuracy, precision, recall, and F1 score on the test set.
    """
    try:
        return get_model_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics calculation failed: {str(e)}")


@router.get("/metrics/xgboost")
async def get_xgb_metrics():
    """
    Get performance metrics for the XGBoost model.

    Returns accuracy, precision, recall, and F1 score on the test set.
    """
    try:
        return get_xgboost_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics calculation failed: {str(e)}")
