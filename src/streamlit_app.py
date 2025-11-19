import streamlit as st
import pandas as pd
import seaborn as sns
import shap
import matplotlib.pyplot as plt
import numpy as np
from sklearn.ensemble import RandomForestClassifier

st.set_page_config(
    page_title="Titanic SHAP – What-If Demo",
    layout="wide"
)

st.title("Titanic Survival – SHAP What-If Demo")
st.write(
    "Minimal demo: train a small model on the Titanic dataset, "
    "see global feature importance, and run a simple what-if with SHAP."
)

@st.cache_resource
def load_data_and_model():
    # Load Titanic dataset directly from seaborn
    df = sns.load_dataset("titanic")

    cols = ["survived", "pclass", "sex", "age", "fare"]
    df = df[cols].dropna()

    X = df.drop("survived", axis=1).copy()
    X["sex"] = (X["sex"] == "male").astype(int)
    y = df["survived"].astype(int)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=4,
        random_state=42
    )
    model.fit(X, y)

    # Generic Explainer API – more robust across SHAP versions
    background = X.sample(min(200, len(X)), random_state=42)
    explainer = shap.Explainer(model, background)

    return df, X, y, model, explainer

df, X, y, model, explainer = load_data_and_model()

col_left, col_right = st.columns([1.2, 1])

# ---------------------------------------------------------
# Global SHAP: feature importance
# ---------------------------------------------------------
with col_left:
    st.subheader("Global feature importance (SHAP)")

    sample = X.sample(min(300, len(X)), random_state=42)
    shap_values_global = explainer(sample)

    # Let SHAP create the plot on the current figure
    shap.summary_plot(
        shap_values_global,
        sample,
        show=False
    )

    # Render the figure SHAP just drew on
    st.pyplot(plt.gcf(), clear_figure=True)

    with st.expander("Show a few rows of the training data"):
        st.dataframe(df.head())

# ---------------------------------------------------------
# What-If: user inputs + prediction + local SHAP
# ---------------------------------------------------------
with col_right:
    st.subheader("What-if: adjust a passenger")

    pclass = st.selectbox("Pclass", options=[1, 2, 3], index=2)
    sex_label = st.selectbox("Sex", options=["female", "male"], index=1)
    age = st.slider("Age", min_value=1, max_value=80, value=30)
    fare = st.slider("Fare", min_value=0.0, max_value=200.0, value=30.0, step=0.5)

    sex = 1 if sex_label == "male" else 0

    x_whatif = pd.DataFrame([{
        "pclass": pclass,
        "sex": sex,
        "age": age,
        "fare": fare,
    }])

    proba = model.predict_proba(x_whatif)[0][1]
    pred_class = model.predict(x_whatif)[0]

    st.markdown(f"**Predicted survival probability:** `{proba:.2%}`")
    st.markdown(
        f"**Predicted class:** "
        f"{'🟢 Survived (1)' if pred_class == 1 else '🔴 Did NOT survive (0)'}"
    )

    st.markdown("**Local SHAP explanation for this passenger**")

    # Single-row explanation
    shap_values_one = explainer(x_whatif)

    # Robust handling of SHAP values shape → make it 1D (per-feature)
    vals_raw = shap_values_one.values[0]

    if vals_raw.ndim == 1:
        vals = vals_raw
    elif vals_raw.ndim == 2:
        vals = vals_raw[:, -1]
    elif vals_raw.ndim == 3:
        vals = vals_raw[..., -1]
        vals = np.mean(vals, axis=1) if vals.ndim > 1 else vals
    else:
        flat = vals_raw.reshape(-1)
        n_features = x_whatif.shape[1]
        vals = flat[:n_features]

    names = np.array(x_whatif.columns)

    # Order by absolute impact
    order = np.argsort(np.abs(vals))[::-1]
    vals_ordered = vals[order]
    names_ordered = names[order]

    fig2, ax2 = plt.subplots()
    ax2.barh(range(len(vals_ordered)), vals_ordered)
    ax2.set_yticks(range(len(vals_ordered)))
    ax2.set_yticklabels(names_ordered)
    ax2.axvline(0, color="black", linewidth=0.5)
    ax2.set_xlabel("SHAP value (impact on model output)")
    ax2.invert_yaxis()  # largest at top
    plt.tight_layout()

    st.pyplot(fig2, clear_figure=True)

st.caption(
    "Minimal Streamlit + SHAP skeleton for Hugging Face Spaces. "
    "Space name: 'titanic'. You can expand preprocessing, visuals, and UX later."
)