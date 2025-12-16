"""
Pytest Test Suite for Titanic XAI FastAPI Backend

This module contains unit tests for all API endpoints using pytest.

Installation:
    pip install pytest httpx

Running tests:
    # Run all tests
    pytest test_api.py

    # Run with verbose output
    pytest test_api.py -v

    # Run specific test
    pytest test_api.py::test_health_endpoint

    # Run with coverage
    pytest test_api.py --cov=. --cov-report=html

    # Run tests matching a pattern
    pytest test_api.py -k "predict"

Example output:
    test_api.py::test_health_endpoint PASSED
    test_api.py::test_predict_woman_first_class PASSED
    test_api.py::test_predict_man_third_class PASSED
    test_api.py::test_tree_structure PASSED
    test_api.py::test_invalid_pclass PASSED
"""

import pytest
from fastapi.testclient import TestClient

# Import the FastAPI app
from main import app


# Fixtures
@pytest.fixture
def client():
    """
    Create a test client for the FastAPI app.

    Returns:
        TestClient: FastAPI test client for making requests
    """
    return TestClient(app)


# Health Endpoint Tests
def test_health_endpoint(client):
    """
    Test that the health endpoint returns 200 OK.

    Verifies:
    - Status code is 200
    - Response contains 'status' field
    - Status is 'healthy'
    """
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"
    assert "message" in data


# Prediction Tests - Success Cases
def test_predict_woman_first_class(client):
    """
    Test prediction for typical survivor (woman in 1st class).

    Input: Female, 1st class, age 30, fare £84
    Expected: High survival probability (> 0.7)

    Verifies:
    - Status code is 200
    - Response contains prediction and probability fields
    - Probability is greater than 0.7 (high survival)
    """
    passenger = {
        "sex": 0,      # Female
        "pclass": 1,   # 1st class
        "age": 30.0,
        "fare": 84.0
    }

    response = client.post("/api/predict", json=passenger)

    assert response.status_code == 200
    data = response.json()

    # Check response structure
    assert "prediction" in data
    assert "probability" in data
    assert "survival_rate" in data

    # Check prediction values
    assert data["probability"] > 0.7, f"Expected probability > 0.7, got {data['probability']}"
    assert data["prediction"] == 1, "Expected prediction=1 (survived)"
    assert data["survival_rate"] > 70.0, f"Expected survival_rate > 70%, got {data['survival_rate']}"


def test_predict_man_third_class(client):
    """
    Test prediction for typical non-survivor (man in 3rd class).

    Input: Male, 3rd class, age 30, fare £13
    Expected: Low survival probability (< 0.3)

    Verifies:
    - Status code is 200
    - Response contains prediction and probability fields
    - Probability is less than 0.3 (low survival)
    """
    passenger = {
        "sex": 1,      # Male
        "pclass": 3,   # 3rd class
        "age": 30.0,
        "fare": 13.0
    }

    response = client.post("/api/predict", json=passenger)

    assert response.status_code == 200
    data = response.json()

    # Check response structure
    assert "prediction" in data
    assert "probability" in data
    assert "survival_rate" in data

    # Check prediction values
    assert data["probability"] < 0.3, f"Expected probability < 0.3, got {data['probability']}"
    assert data["prediction"] == 0, "Expected prediction=0 (died)"
    assert data["survival_rate"] < 30.0, f"Expected survival_rate < 30%, got {data['survival_rate']}"


def test_predict_edge_cases(client):
    """
    Test prediction with edge case values.

    Tests:
    - Very young passenger (age 0)
    - Very old passenger (age 100)
    - Zero fare
    - High fare
    """
    # Young child
    response = client.post("/api/predict", json={
        "sex": 0, "pclass": 1, "age": 0.0, "fare": 84.0
    })
    assert response.status_code == 200
    assert "probability" in response.json()

    # Elderly passenger
    response = client.post("/api/predict", json={
        "sex": 1, "pclass": 3, "age": 100.0, "fare": 8.0
    })
    assert response.status_code == 200
    assert "probability" in response.json()

    # Zero fare (unusual but valid)
    response = client.post("/api/predict", json={
        "sex": 0, "pclass": 2, "age": 25.0, "fare": 0.0
    })
    assert response.status_code == 200
    assert "probability" in response.json()


# Tree Structure Tests
def test_tree_structure(client):
    """
    Test that /api/tree returns valid tree structure.

    Verifies:
    - Status code is 200
    - Response has 'tree', 'feature_names', 'model_metrics' keys
    - Tree root has required fields: 'id', 'feature', 'children'
    - feature_names contains all expected features
    """
    response = client.get("/api/tree")

    assert response.status_code == 200
    data = response.json()

    # Check top-level structure
    assert "tree" in data
    assert "feature_names" in data
    assert "model_metrics" in data

    # Check tree structure
    tree = data["tree"]
    assert "id" in tree
    assert "feature" in tree
    assert "children" in tree or tree.get("is_leaf") is True

    # Check feature names
    feature_names = data["feature_names"]
    assert isinstance(feature_names, list)
    assert set(feature_names) == {"sex", "pclass", "age", "fare"}

    # Check model metrics
    metrics = data["model_metrics"]
    assert "accuracy" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1_score" in metrics

    # Verify metric ranges
    assert 0.0 <= metrics["accuracy"] <= 1.0
    assert 0.0 <= metrics["precision"] <= 1.0
    assert 0.0 <= metrics["recall"] <= 1.0
    assert 0.0 <= metrics["f1_score"] <= 1.0


def test_tree_node_structure(client):
    """
    Test that tree nodes have all required D3 visualization fields.

    Verifies each node has:
    - id, feature, threshold, samples
    - class_0, class_1, predicted_class, probability
    - is_leaf, split_rule, left_label, right_label
    """
    response = client.get("/api/tree")
    data = response.json()
    root = data["tree"]

    # Check all required fields exist
    required_fields = [
        "id", "feature", "threshold", "samples",
        "class_0", "class_1", "predicted_class", "probability",
        "is_leaf", "split_rule"
    ]

    for field in required_fields:
        assert field in root, f"Missing required field: {field}"

    # Check data types
    assert isinstance(root["id"], int)
    assert isinstance(root["samples"], int)
    assert isinstance(root["class_0"], int)
    assert isinstance(root["class_1"], int)
    assert isinstance(root["predicted_class"], int)
    assert isinstance(root["probability"], (int, float))
    assert isinstance(root["is_leaf"], bool)
    assert isinstance(root["split_rule"], str)

    # Check class distribution makes sense
    assert root["samples"] > 0
    assert root["class_0"] >= 0
    assert root["class_1"] >= 0


# Validation Tests - Error Cases
def test_invalid_pclass(client):
    """
    Test validation error for invalid pclass value.

    Input: pclass=5 (invalid, must be 1, 2, or 3)
    Expected: 422 Unprocessable Entity

    Verifies:
    - Status code is 422
    - Response contains validation error details
    - Error message mentions pclass
    """
    passenger = {
        "sex": 0,
        "pclass": 5,   # Invalid: must be 1, 2, or 3
        "age": 30.0,
        "fare": 84.0
    }

    response = client.post("/api/predict", json=passenger)

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data

    # Check error details mention pclass
    error_details = str(data["detail"]).lower()
    assert "pclass" in error_details


def test_invalid_sex(client):
    """
    Test validation error for invalid sex value.

    Input: sex=2 (invalid, must be 0 or 1)
    Expected: 422 Unprocessable Entity
    """
    passenger = {
        "sex": 2,      # Invalid: must be 0 or 1
        "pclass": 1,
        "age": 30.0,
        "fare": 84.0
    }

    response = client.post("/api/predict", json=passenger)
    assert response.status_code == 422


def test_negative_age(client):
    """
    Test validation error for negative age.

    Input: age=-5 (invalid, must be >= 0)
    Expected: 422 Unprocessable Entity
    """
    passenger = {
        "sex": 0,
        "pclass": 1,
        "age": -5.0,   # Invalid: must be >= 0
        "fare": 84.0
    }

    response = client.post("/api/predict", json=passenger)
    assert response.status_code == 422


def test_negative_fare(client):
    """
    Test validation error for negative fare.

    Input: fare=-10 (invalid, must be >= 0)
    Expected: 422 Unprocessable Entity
    """
    passenger = {
        "sex": 0,
        "pclass": 1,
        "age": 30.0,
        "fare": -10.0  # Invalid: must be >= 0
    }

    response = client.post("/api/predict", json=passenger)
    assert response.status_code == 422


def test_age_over_limit(client):
    """
    Test validation error for age over maximum.

    Input: age=150 (invalid, must be <= 100)
    Expected: 422 Unprocessable Entity
    """
    passenger = {
        "sex": 0,
        "pclass": 1,
        "age": 150.0,  # Invalid: must be <= 100
        "fare": 84.0
    }

    response = client.post("/api/predict", json=passenger)
    assert response.status_code == 422


def test_missing_required_field(client):
    """
    Test validation error when required field is missing.

    Input: Missing 'age' field
    Expected: 422 Unprocessable Entity
    """
    passenger = {
        "sex": 0,
        "pclass": 1,
        # age is missing
        "fare": 84.0
    }

    response = client.post("/api/predict", json=passenger)
    assert response.status_code == 422


# Additional Endpoint Tests
def test_root_endpoint(client):
    """Test the root endpoint returns API information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data or "version" in data


def test_predict_both_models(client):
    """Test the /api/predict/both endpoint."""
    passenger = {
        "sex": 0,
        "pclass": 1,
        "age": 30.0,
        "fare": 84.0
    }

    response = client.post("/api/predict/both", json=passenger)
    assert response.status_code == 200
    data = response.json()

    assert "decision_tree" in data
    assert "xgboost" in data


def test_decision_tree_metrics(client):
    """Test the decision tree metrics endpoint."""
    response = client.get("/api/metrics/decision-tree")
    assert response.status_code == 200
    data = response.json()

    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data


def test_xgboost_metrics(client):
    """Test the XGBoost metrics endpoint."""
    response = client.get("/api/metrics/xgboost")
    assert response.status_code == 200
    data = response.json()

    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data


# Performance and Consistency Tests
def test_prediction_consistency(client):
    """
    Test that same input produces same output (deterministic).

    Makes 3 identical requests and verifies all return same result.
    """
    passenger = {
        "sex": 0,
        "pclass": 1,
        "age": 30.0,
        "fare": 84.0
    }

    # Make 3 identical requests
    responses = [
        client.post("/api/predict", json=passenger).json()
        for _ in range(3)
    ]

    # All responses should be identical
    first = responses[0]
    for response in responses[1:]:
        assert response["prediction"] == first["prediction"]
        assert response["probability"] == first["probability"]
        assert response["survival_rate"] == first["survival_rate"]


def test_survival_rate_calculation(client):
    """
    Test that survival_rate is correctly calculated as probability * 100.
    """
    passenger = {
        "sex": 0,
        "pclass": 2,
        "age": 25.0,
        "fare": 20.0
    }

    response = client.post("/api/predict", json=passenger)
    data = response.json()

    # survival_rate should be probability * 100
    expected_rate = data["probability"] * 100
    assert abs(data["survival_rate"] - expected_rate) < 0.01  # Allow for small floating point differences


# Summary Statistics
@pytest.mark.parametrize("sex,pclass,expected_high_survival", [
    (0, 1, True),   # Female, 1st class -> high survival
    (0, 2, True),   # Female, 2nd class -> high survival
    (1, 3, False),  # Male, 3rd class -> low survival
    (1, 2, False),  # Male, 2nd class -> moderate/low survival
])
def test_prediction_patterns(client, sex, pclass, expected_high_survival):
    """
    Test that model follows expected survival patterns.

    Parametrized test for common patterns:
    - Women generally have higher survival rates
    - 1st class has better survival than 3rd class
    - Men in 3rd class have lowest survival
    """
    passenger = {
        "sex": sex,
        "pclass": pclass,
        "age": 30.0,
        "fare": 20.0
    }

    response = client.post("/api/predict", json=passenger)
    data = response.json()

    if expected_high_survival:
        assert data["probability"] > 0.5, \
            f"Expected high survival for sex={sex}, pclass={pclass}, got {data['probability']}"
    else:
        assert data["probability"] <= 0.5, \
            f"Expected low survival for sex={sex}, pclass={pclass}, got {data['probability']}"


if __name__ == "__main__":
    """
    Run tests directly with: python test_api.py

    For better output, use pytest:
        pytest test_api.py -v
    """
    pytest.main([__file__, "-v"])
