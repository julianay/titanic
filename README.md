---
title: Titanic Survival – Explainable AI Demo
emoji: 🚢
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8501
pinned: false
---

# Titanic Survival – Explainable AI Portfolio Demo

Interactive Streamlit app showcasing **explainable AI techniques** for Titanic passenger survival prediction. This portfolio demo highlights UX design and data visualization skills for machine learning interpretability.

## 🎯 Features

### 📊 **SHAP Explanations** (Original Page)
- **Global model behavior** – which features matter most overall
- **Local explanations** – why the model predicted survival for a specific passenger
- **What-if analysis** – change inputs and see how prediction + SHAP explanation change in real time

### 🌳 **Decision Tree Visualization** (New!)
- **Interactive D3.js tree** with real-time path highlighting
- **What-if scenarios** – set passenger characteristics and watch their path through the tree
- **Animated predictions** – see decision paths with color-coded outcomes (green=survival, red=death)
- **Explainable splits** – human-readable labels ("female" vs "male", not encoded values)
- **Optimized for performance** – reduced to 4 core features for fast SHAP computation on free-tier hosting

> This project demonstrates **XAI (Explainable AI)** techniques with a focus on intuitive UX and interactive data visualization.

---

## 🌐 Live Demo

- **Hugging Face Space**: https://huggingface.co/spaces/bigpixel/titanic

---

## 🔍 What this app shows

**Two Interactive Pages**

1. **SHAP Explanations** (Random Forest classifier)
   - Global feature importance visualizations
   - Per-passenger explanations showing how each feature contributes
   - What-if controls to modify passenger characteristics and see updated explanations

2. **Decision Tree Visualization** (Decision Tree classifier)
   - D3.js interactive tree with 4 core features (`sex`, `pclass`, `age`, `fare`)
   - Real-time path tracing through the tree based on user inputs
   - Animated predictions with pulsing final nodes
   - Dimmed inactive paths (30% opacity) to highlight the active decision path
   - Edge labels showing split conditions with decoded values

**Models**

- **SHAP Page**: RandomForestClassifier with 7 features (original demo)
- **Decision Tree Page**: DecisionTreeClassifier optimized to 4 features
  - Reduced features for ~50% faster SHAP performance
  - Minimal accuracy loss (-0.1%)
  - Optimized for free-tier deployment constraints

**UX / Data Viz Highlights**

- **Interactive visualizations** using D3.js, matplotlib, and SHAP plots
- **What-if scenarios** on both pages for hands-on exploration
- **Real-time updates** as users change passenger characteristics
- **Human-readable labels** (decoded categorical features)
- **Responsive design** with smooth CSS transitions and animations

---

## 🧱 Tech Stack

**Backend**
- **Python 3.12** (3.13.5 in Docker)
- **Streamlit** – multi-page app framework & UI
- **scikit-learn** – model training (RandomForest, DecisionTree)
- **pandas**, **numpy** – data manipulation
- **SHAP** – model explanations (TreeExplainer)

**Visualization**
- **D3.js v7** – interactive Decision Tree visualization
- **matplotlib** (3.8.4) – SHAP plot rendering
- **seaborn** – data visualization & Titanic dataset
- **plotly** – ready for future interactive charts (currently fallback option)

**Deployment**
- **Docker** – containerized deployment on Hugging Face Spaces
- **Git** – version control with dual remotes (GitHub + HuggingFace)

---

## 📂 Project Structure

```text
titanic/
├── src/
│   ├── streamlit_app.py           # Main page (SHAP explanations)
│   ├── tree_data.py                # Tree data extraction module (visualization-agnostic)
│   └── pages/
│       └── decision_tree.py        # Decision Tree visualization page with D3.js
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker config for Hugging Face Spaces
├── README.md                       # This file
├── .gitignore
├── .vscode/
│   └── settings.json               # VS Code Python interpreter config
└── venv/                           # Local virtual environment (not committed)
```

---

## 🚀 Local Development

**Setup:**

```bash
# Clone the repository
git clone https://github.com/julianay/titanic.git
cd titanic

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run src/streamlit_app.py
```

**Access the app:**
- Main page (SHAP): http://localhost:8501
- Decision Tree page: Available in sidebar navigation

---

## 🎨 Design Decisions

**Why 4 features for Decision Tree?**
- Original demo used 7 features, but `embarked`, `parch`, and `sibsp` had minimal predictive power
- Reducing to 4 core features (`sex`, `pclass`, `age`, `fare`) provides:
  - ~50% faster SHAP computation (critical for what-if scenarios)
  - Cleaner UX with fewer input controls
  - Better performance on free-tier hosting
  - Only -0.1% accuracy loss

**Why D3.js instead of Plotly?**
- Greater control over custom interactions and animations
- Demonstrates full-stack visualization skills
- Better for portfolio showcase (custom implementation vs. library template)
- Plotly fallback code included (commented out) for easy switching

**Visual Design Goals:**
- Immediate clarity: Active path vs. inactive paths
- Color coding: Green (survival) vs. Red (death) vs. Blue/Orange (split directions)
- Animation: Pulsing final node draws attention to prediction
- Responsive feedback: Smooth transitions create polished UX

---

## 📈 Future Enhancements

- [ ] Add SHAP explanations to Decision Tree page
- [ ] Compare Decision Tree vs. RandomForest predictions side-by-side
- [ ] Add model performance metrics (confusion matrix, ROC curve)
- [ ] Implement feature importance comparison across models
- [ ] Add downloadable prediction reports

---

## 🤝 Contributing

This is a portfolio demo project. Feel free to fork and adapt for your own use!

---

## 📄 License

This project is open source and available for educational and portfolio purposes.

---

**Built with Claude Code** | [View on GitHub](https://github.com/julianay/titanic) | [Live Demo](https://huggingface.co/spaces/bigpixel/titanic)