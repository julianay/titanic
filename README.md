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

### 💬 **Chat-Based XAI Explorer** (Latest - app.py)
- **Two-column layout** – visualization on left (75%), chat interface on right (25%)
- **Dark mode UI** – cohesive dark theme matching Streamlit's native chat interface
- **Natural language exploration** – ask questions like "what about women?" or "tell me about first class"
- **Keyword matching** – intelligent query interpretation for exploration patterns
- **4 preset patterns** – women, men, 1st class child, 3rd class male paths
- **Dynamic path highlighting** – tree updates based on conversation
- **Scrollable chat history** – 400px scrollable container for conversation messages
- **Model comparison cards** – see Decision Tree vs XGBoost tradeoffs at a glance
- **Optimized layout** – reduced padding for maximum content visibility

### 📊 **SHAP Explanations** (Multi-page version)
- **Global model behavior** – which features matter most overall
- **Local explanations** – why the model predicted survival for a specific passenger
- **What-if analysis** – change inputs and see how prediction + SHAP explanation change in real time

### 🌳 **Decision Tree Visualization** (Multi-page version)
- **Interactive D3.js tree** with real-time path highlighting
- **What-if scenarios** – set passenger characteristics and watch their path through the tree
- **Animated predictions** – see decision paths with color-coded outcomes (green=survival, red=death)
- **Explainable splits** – human-readable labels ("female" vs "male", not encoded values)
- **Optimized for performance** – reduced to 4 core features for fast SHAP computation on free-tier hosting

### ⚖️ **Model Comparison** (Multi-page version)
- **Decision Tree vs XGBoost** – side-by-side performance metrics
- **Accuracy-interpretability tradeoff** – demonstrates why XGBoost needs SHAP
- **Confusion matrices** – visual comparison of model performance
- **SHAP explanations for XGBoost** – global and local interpretability

> This project demonstrates **XAI (Explainable AI)** techniques with a focus on intuitive UX, interactive data visualization, and conversational exploration.

---

## 🌐 Live Demo

- **Hugging Face Space**: https://huggingface.co/spaces/bigpixel/titanic

---

## 🔍 What this app shows

**Two Versions Available:**

### Version 1: Chat-Based Explorer (app.py) - **Recommended**
- **Left Column (75%)**: Decision Tree visualization with model comparison cards in dark mode
- **Right Column (25%)**: Interactive chat interface for natural language exploration
- Ask questions like "what about women?" or "show me first class children"
- Tree highlights paths based on your conversation
- 4 preset exploration patterns with detailed explanations
- Cohesive dark theme throughout for improved readability

### Version 2: Multi-Page App (src/streamlit_app.py)

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

3. **Model Comparison** (DT vs XGBoost)
   - Side-by-side performance metrics comparison
   - Demonstrates accuracy-interpretability tradeoff
   - SHAP explanations for XGBoost
   - What-if scenarios for both models

**Models**

- **Chat Explorer**: DecisionTreeClassifier optimized to 4 features
- **SHAP Page**: RandomForestClassifier with 5 features
- **Decision Tree Page**: DecisionTreeClassifier optimized to 4 features
- **Model Comparison**: Both DecisionTree and XGBoost
  - Reduced features for ~50% faster SHAP performance
  - Minimal accuracy loss (-0.1%)
  - Optimized for free-tier deployment constraints
  - All models use proper 80-20 train/test split

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
├── app.py                          # NEW: Chat-based XAI Explorer (recommended)
├── src/
│   ├── streamlit_app.py           # Multi-page: SHAP explanations
│   ├── tree_data.py                # Tree data extraction module (visualization-agnostic)
│   └── pages/
│       ├── decision_tree.py        # Multi-page: Decision Tree visualization with D3.js
│       └── model_comparison.py     # Multi-page: DT vs XGBoost comparison
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker config for Hugging Face Spaces
├── README.md                       # This file
├── PROGRESS.md                     # Project progress and notes
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
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Run the chat-based explorer (recommended)
streamlit run app.py

# OR run the multi-page version
streamlit run src/streamlit_app.py
```

**Access the app:**
- **Chat Explorer**: http://localhost:8501 (app.py)
- **Multi-page version**: http://localhost:8501 (src/streamlit_app.py)
  - Main page (SHAP): http://localhost:8501
  - Decision Tree page: Available in sidebar navigation
  - Model Comparison: Available in sidebar navigation

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

**Chat Explorer:**
- [ ] Upgrade to LLM-based chat (OpenAI/Anthropic) for true conversational AI
- [ ] Add more sophisticated pattern matching
- [ ] Support compound queries ("show me wealthy women")
- [ ] Add voice input capability
- [ ] Export conversation history

**Multi-Page App:**
- [ ] Add SHAP explanations to Decision Tree page
- [ ] Add model performance metrics (ROC curve, precision-recall)
- [ ] Implement feature importance comparison across models
- [ ] Add downloadable prediction reports
- [ ] Add data exploration page with EDA visualizations

---

## 🤝 Contributing

This is a portfolio demo project. Feel free to fork and adapt for your own use!

---

## 📄 License

This project is open source and available for educational and portfolio purposes.

---

**Built with Claude Code** | [View on GitHub](https://github.com/julianay/titanic) | [Live Demo](https://huggingface.co/spaces/bigpixel/titanic)