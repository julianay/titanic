"""
Model Comparison: Decision Tree vs XGBoost
Demonstrates the accuracy-interpretability tradeoff in machine learning.
"""

import streamlit as st
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import shap
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from xgboost import XGBClassifier

# Page configuration
st.set_page_config(
    page_title="Model Comparison: DT vs XGBoost",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("⚖️ Model Comparison: Decision Tree vs XGBoost")
st.markdown("""
This page demonstrates the **accuracy-interpretability tradeoff** in machine learning.
Compare a transparent Decision Tree with a more accurate but complex XGBoost model.
""")


# =============================================================================
# Data Loading and Model Training (Cached)
# =============================================================================

@st.cache_resource
def load_data_and_train_models():
    """
    Load Titanic dataset and train both Decision Tree and XGBoost models.
    Returns: df, X_train, X_test, y_train, y_test, dt_model, xgb_model
    """
    # Load Titanic dataset
    df = sns.load_dataset("titanic")

    # Use same 4 features as other pages for consistency
    features = ['pclass', 'sex', 'age', 'fare']
    target = 'survived'

    # Select columns and drop missing values
    df_clean = df[features + [target]].dropna()

    # Encode categorical variables
    X = df_clean[features].copy()
    X['sex'] = (X['sex'] == 'male').astype(int)  # 0=female, 1=male
    y = df_clean[target].astype(int)

    # Train-test split (80-20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # -------------------------------------------------------------------------
    # Train Decision Tree (Interpretable)
    # -------------------------------------------------------------------------
    dt_model = DecisionTreeClassifier(
        max_depth=4,
        min_samples_split=20,
        min_samples_leaf=10,
        random_state=42
    )
    dt_model.fit(X_train, y_train)

    # -------------------------------------------------------------------------
    # Train XGBoost (High Performance)
    # -------------------------------------------------------------------------
    xgb_model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    xgb_model.fit(X_train, y_train)

    return df_clean, X_train, X_test, y_train, y_test, dt_model, xgb_model


# Load data and models
df, X_train, X_test, y_train, y_test, dt_model, xgb_model = load_data_and_train_models()


# =============================================================================
# Performance Metrics Comparison
# =============================================================================

st.header("📊 Performance Metrics Comparison")
st.markdown("Comparing model performance on **test set** (20% of data):")

# Calculate predictions
dt_pred = dt_model.predict(X_test)
xgb_pred = xgb_model.predict(X_test)

# Calculate metrics for Decision Tree
dt_metrics = {
    'accuracy': accuracy_score(y_test, dt_pred),
    'precision': precision_score(y_test, dt_pred, zero_division=0),
    'recall': recall_score(y_test, dt_pred, zero_division=0),
    'f1': f1_score(y_test, dt_pred, zero_division=0)
}

# Calculate metrics for XGBoost
xgb_metrics = {
    'accuracy': accuracy_score(y_test, xgb_pred),
    'precision': precision_score(y_test, xgb_pred, zero_division=0),
    'recall': recall_score(y_test, xgb_pred, zero_division=0),
    'f1': f1_score(y_test, xgb_pred, zero_division=0)
}

# Display side-by-side metrics
col1, col2 = st.columns(2)

with col1:
    st.subheader("🌳 Decision Tree")
    st.markdown("**Interpretable** - Easy to understand and explain")

    metric_col1, metric_col2 = st.columns(2)
    with metric_col1:
        st.metric("Accuracy", f"{dt_metrics['accuracy']:.1%}")
        st.metric("Precision", f"{dt_metrics['precision']:.1%}")
    with metric_col2:
        st.metric("Recall", f"{dt_metrics['recall']:.1%}")
        st.metric("F1-Score", f"{dt_metrics['f1']:.1%}")

    # Confusion matrix for Decision Tree
    dt_cm = confusion_matrix(y_test, dt_pred)
    fig_dt, ax_dt = plt.subplots(figsize=(4, 3))
    sns.heatmap(dt_cm, annot=True, fmt='d', cmap='Blues', cbar=False, ax=ax_dt)
    ax_dt.set_xlabel('Predicted')
    ax_dt.set_ylabel('Actual')
    ax_dt.set_title('Decision Tree Confusion Matrix')
    st.pyplot(fig_dt, clear_figure=True)

with col2:
    st.subheader("🚀 XGBoost")
    st.markdown("**High Performance** - More accurate but less interpretable")

    metric_col3, metric_col4 = st.columns(2)
    with metric_col3:
        st.metric(
            "Accuracy",
            f"{xgb_metrics['accuracy']:.1%}",
            delta=f"{(xgb_metrics['accuracy'] - dt_metrics['accuracy']):.1%}",
            delta_color="normal"
        )
        st.metric(
            "Precision",
            f"{xgb_metrics['precision']:.1%}",
            delta=f"{(xgb_metrics['precision'] - dt_metrics['precision']):.1%}",
            delta_color="normal"
        )
    with metric_col4:
        st.metric(
            "Recall",
            f"{xgb_metrics['recall']:.1%}",
            delta=f"{(xgb_metrics['recall'] - dt_metrics['recall']):.1%}",
            delta_color="normal"
        )
        st.metric(
            "F1-Score",
            f"{xgb_metrics['f1']:.1%}",
            delta=f"{(xgb_metrics['f1'] - dt_metrics['f1']):.1%}",
            delta_color="normal"
        )

    # Confusion matrix for XGBoost
    xgb_cm = confusion_matrix(y_test, xgb_pred)
    fig_xgb, ax_xgb = plt.subplots(figsize=(4, 3))
    sns.heatmap(xgb_cm, annot=True, fmt='d', cmap='Greens', cbar=False, ax=ax_xgb)
    ax_xgb.set_xlabel('Predicted')
    ax_xgb.set_ylabel('Actual')
    ax_xgb.set_title('XGBoost Confusion Matrix')
    st.pyplot(fig_xgb, clear_figure=True)

st.markdown("---")

# Key takeaway box
st.info("""
**Key Takeaway**: XGBoost achieves higher accuracy but is a "black box" model with complex internal logic.
Decision Trees are simpler and easier to explain but may sacrifice some predictive power.
""")

st.markdown("---")


# =============================================================================
# SHAP Explanations for XGBoost
# =============================================================================

st.header("🔍 Making XGBoost Interpretable with SHAP")
st.markdown("""
While XGBoost is more accurate, it's harder to understand *why* it makes predictions.
**SHAP (SHapley Additive exPlanations)** helps explain XGBoost's decisions.
""")

# Create SHAP explainer (cached)
@st.cache_resource
def create_shap_explainer(_model, X_sample):
    """Create SHAP TreeExplainer for XGBoost model."""
    return shap.TreeExplainer(_model)


explainer = create_shap_explainer(xgb_model, X_train)

# Compute SHAP values for a sample (use smaller sample for performance)
sample_size = min(200, len(X_test))
X_sample = X_test.sample(sample_size, random_state=42)
shap_values = explainer.shap_values(X_sample)


# -------------------------------------------------------------------------
# Global Feature Importance
# -------------------------------------------------------------------------

st.subheader("📈 Global Feature Importance (SHAP Summary Plot)")
st.markdown("This shows which features are most important across all predictions:")

# Create SHAP summary plot
fig_summary, ax_summary = plt.subplots(figsize=(10, 4))
shap.summary_plot(
    shap_values,
    X_sample,
    show=False,
    plot_type="bar"
)
st.pyplot(fig_summary, clear_figure=True)

st.markdown("---")


# =============================================================================
# What-If Scenario with Both Models
# =============================================================================

st.header("🔮 What-If Scenario: Compare Predictions")
st.markdown("Adjust passenger characteristics and see how **both models** predict survival:")

# Sidebar controls for what-if scenario
with st.sidebar:
    st.header("👤 Passenger Characteristics")
    st.markdown("Adjust the inputs below to see predictions from both models:")

    input_pclass = st.selectbox(
        "Passenger Class",
        options=[1, 2, 3],
        index=2,
        help="1st, 2nd, or 3rd class ticket"
    )

    input_sex = st.radio(
        "Sex",
        options=["Female", "Male"],
        index=0,
        help="Passenger's sex"
    )

    input_age = st.slider(
        "Age",
        min_value=1,
        max_value=80,
        value=30,
        help="Passenger's age in years"
    )

    input_fare = st.slider(
        "Fare",
        min_value=0.0,
        max_value=200.0,
        value=30.0,
        step=1.0,
        help="Ticket fare in dollars"
    )

# Convert inputs to model format
sex_encoded = 1 if input_sex == "Male" else 0
x_whatif = pd.DataFrame([{
    'pclass': input_pclass,
    'sex': sex_encoded,
    'age': input_age,
    'fare': input_fare
}])

# Get predictions from both models
dt_proba = dt_model.predict_proba(x_whatif)[0]
dt_prediction = dt_model.predict(x_whatif)[0]

xgb_proba = xgb_model.predict_proba(x_whatif)[0]
xgb_prediction = xgb_model.predict(x_whatif)[0]

# Display predictions side-by-side
pred_col1, pred_col2 = st.columns(2)

with pred_col1:
    st.subheader("🌳 Decision Tree Prediction")

    # Prediction display
    if dt_prediction == 1:
        st.success(f"**Prediction: Survived ✓**")
    else:
        st.error(f"**Prediction: Did Not Survive ✗**")

    st.metric("Survival Probability", f"{dt_proba[1]:.1%}")
    st.metric("Death Probability", f"{dt_proba[0]:.1%}")

    st.markdown("**Why this model is interpretable:**")
    st.markdown("- You can trace the exact decision path in the tree")
    st.markdown("- Each split is a simple rule (e.g., 'sex ≤ 0.5')")
    st.markdown("- See the full tree on the 'Decision Tree' page")

with pred_col2:
    st.subheader("🚀 XGBoost Prediction")

    # Prediction display
    if xgb_prediction == 1:
        st.success(f"**Prediction: Survived ✓**")
    else:
        st.error(f"**Prediction: Did Not Survive ✗**")

    st.metric("Survival Probability", f"{xgb_proba[1]:.1%}")
    st.metric("Death Probability", f"{xgb_proba[0]:.1%}")

    st.markdown("**Why this model needs SHAP:**")
    st.markdown("- Combines 100 trees with weighted votes")
    st.markdown("- No single path to trace")
    st.markdown("- SHAP explains which features drove this prediction")

st.markdown("---")


# -------------------------------------------------------------------------
# Individual Prediction Explanation (SHAP Waterfall)
# -------------------------------------------------------------------------

st.subheader("💧 XGBoost Explanation for This Passenger (SHAP Waterfall)")
st.markdown("This shows how each feature contributed to the XGBoost prediction:")

# Compute SHAP values for the what-if input
shap_values_whatif = explainer.shap_values(x_whatif)

# Create SHAP waterfall plot
fig_waterfall, ax_waterfall = plt.subplots(figsize=(10, 5))

# Extract SHAP values for plotting
base_value = explainer.expected_value
shap_vals = shap_values_whatif[0]
feature_names = x_whatif.columns.tolist()
feature_values = x_whatif.iloc[0].values

# Create waterfall-style bar chart (manual implementation for better control)
# Sort by absolute SHAP value
sorted_idx = np.argsort(np.abs(shap_vals))[::-1]
sorted_features = [feature_names[i] for i in sorted_idx]
sorted_values = shap_vals[sorted_idx]
sorted_data = [feature_values[i] for i in sorted_idx]

# Create horizontal bar chart
colors = ['#ff4b4b' if v < 0 else '#00cc66' for v in sorted_values]
y_pos = np.arange(len(sorted_features))

ax_waterfall.barh(y_pos, sorted_values, color=colors, alpha=0.7)
ax_waterfall.set_yticks(y_pos)

# Format feature labels with values
feature_labels = []
for i, feat in enumerate(sorted_features):
    val = sorted_data[i]
    if feat == 'sex':
        val_str = 'Male' if val == 1 else 'Female'
    else:
        val_str = f"{val:.1f}" if isinstance(val, float) else str(val)
    feature_labels.append(f"{feat} = {val_str}")

ax_waterfall.set_yticklabels(feature_labels)
ax_waterfall.axvline(0, color='black', linewidth=0.8)
ax_waterfall.set_xlabel('SHAP Value (Impact on Prediction)', fontsize=11)
ax_waterfall.set_title(
    f'XGBoost Prediction Explanation\nBase Value: {base_value:.3f} → Final Prediction: {base_value + shap_vals.sum():.3f}',
    fontsize=12
)
ax_waterfall.grid(axis='x', alpha=0.3)

plt.tight_layout()
st.pyplot(fig_waterfall, clear_figure=True)

# Interpretation guide
st.markdown("""
**How to read this chart:**
- 🟢 **Green bars** push prediction toward survival (positive SHAP values)
- 🔴 **Red bars** push prediction toward death (negative SHAP values)
- **Longer bars** = stronger impact on the prediction
- **Base value** = model's average prediction across all passengers
- **Final prediction** = base value + sum of all SHAP values
""")

st.markdown("---")


# =============================================================================
# Additional Information
# =============================================================================

with st.expander("ℹ️ About This Comparison"):
    st.markdown("""
    ### The Accuracy-Interpretability Tradeoff

    **Decision Trees** are:
    - ✅ Easy to visualize and understand
    - ✅ Transparent decision paths
    - ✅ No "black box" concerns
    - ⚠️ May underfit complex patterns
    - ⚠️ Can be unstable with small data changes

    **XGBoost** is:
    - ✅ State-of-the-art accuracy
    - ✅ Handles complex patterns well
    - ✅ Robust to overfitting
    - ⚠️ "Black box" - hard to interpret directly
    - ⚠️ Requires tools like SHAP for explanations

    ### Why Use SHAP?

    SHAP (SHapley Additive exPlanations) provides:
    1. **Global explanations**: Which features are most important overall?
    2. **Local explanations**: Why did the model make this specific prediction?
    3. **Consistent values**: Based on game theory (Shapley values)
    4. **Model-agnostic**: Works with any ML model

    ### When to Choose Each Model

    **Choose Decision Trees when:**
    - Interpretability is critical (medical, legal, finance)
    - Stakeholders need to understand decisions
    - Regulatory compliance requires explainability
    - Simple patterns are sufficient

    **Choose XGBoost when:**
    - Maximum accuracy is the priority
    - You have tools like SHAP for explanations
    - Complex patterns need to be captured
    - Ensemble methods are acceptable
    """)

with st.expander("🔬 Technical Details"):
    st.markdown(f"""
    ### Dataset Information
    - **Total samples**: {len(df)}
    - **Training samples**: {len(X_train)} (80%)
    - **Test samples**: {len(X_test)} (20%)
    - **Features**: {list(X_train.columns)}
    - **Target**: Survived (0=No, 1=Yes)

    ### Model Configurations

    **Decision Tree**:
    - max_depth: 4
    - min_samples_split: 20
    - min_samples_leaf: 10
    - random_state: 42

    **XGBoost**:
    - n_estimators: 100
    - max_depth: 6
    - learning_rate: 0.1
    - random_state: 42
    - eval_metric: logloss

    ### SHAP Configuration
    - Explainer: TreeExplainer (optimized for tree-based models)
    - Sample size for global plots: {sample_size} passengers
    - Background dataset: Full training set
    """)

st.markdown("---")
st.caption(
    "**Portfolio Demo** | This page demonstrates the accuracy-interpretability tradeoff "
    "in machine learning using Decision Trees and XGBoost with SHAP explanations."
)
