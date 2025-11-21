---
title: Titanic Survival – SHAP Explainer
emoji: 🚢
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Titanic Survival – SHAP-Powered Explainable ML Demo

Interactive Streamlit app that predicts **Titanic passenger survival** and explains each prediction using **SHAP** (SHapley Additive exPlanations).  

You can explore:

- **Global model behavior** – which features matter most overall  
- **Local explanations** – why the model predicted survival for a specific passenger  
- **What-if analysis** – change inputs (age, class, fare, etc.) and see how prediction + SHAP explanation change in real time  

> This project is part of my exploration of **XAI (Explainable AI)** and UX for model transparency.

---

## 🌐 Live Demo

- **Hugging Face Space**: https://huggingface.co/spaces/bigpixel/titanic

---

## 🔍 What this app shows

**Model**

- Binary classifier predicting `Survived` on the Titanic dataset  
- Built with **scikit-learn** (tree-based model, suitable for TreeExplainer)  

**Explanations (XAI)**

- **Global feature importance** (SHAP summary / bar view)
- **Per-passenger explanations** (how each feature pushes the prediction up or down)
- **What-if analysis**: UI controls let you change features and instantly:
  - recompute the prediction  
  - update the SHAP explanation  

**UX / Data Viz**

- Minimal UI for:
  - selecting or simulating a passenger  
  - seeing prediction + probability  
  - understanding *why* through SHAP visualizations  
- Latency is handled as part of the UX exploration (model + SHAP initialization can take a moment on first load).

---

## 🧱 Tech Stack

- **Python** (recommended: 3.12)
- **Streamlit** – app & UI
- **pandas**, **numpy** – data handling
- **scikit-learn** – model training and inference
- **SHAP** – model explanations
- **matplotlib / seaborn** – supporting plots

---

## 📂 Project Structure

Approximate structure:

```text
titanic/
├── src/
│   └── streamlit_app.py    # Main Streamlit app (UI + SHAP + what-if)
├── requirements.txt        # Python dependencies
├── Dockerfile              # Used by Hugging Face Spaces (sdk: docker)
├── README.md               # This file
├── .gitignore
└── venv/                   # Local virtual environment (not committed)