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

### 💬 **Chat-Based XAI Explorer** (Latest - app_pie_version.py)
- **Two-column layout** – visualization on left (75%), interactive controls + chat on right (25%)
- **Tab-based model comparison** – switch between Decision Tree and XGBoost visualizations
  - **Decision Tree tab**: Interactive D3.js tree with donut chart nodes showing class distribution (81% accuracy, 60% recall)
    - **Proportional edge widths** – thickness represents passenger flow (1-32px range, sqrt scale)
    - **Donut charts** at each node – blue for died, green for survived with 50% center hole
    - Hover over nodes to see decision path from root with gold highlighting
    - Edge thickness legend for clear visual communication
  - **XGBoost tab**: SHAP explanations with dual waterfall visualizations (80% accuracy, 72% recall)
    - Global feature importance chart (25% width)
    - **Alternative waterfall chart** (50% width) - floating bars showing cumulative SHAP impact
    - Standard waterfall chart (full width below)
- **What-If Scenario controls** – interactive sliders and radio buttons above chat
  - Set Sex, Passenger Class, Age, and Fare to explore custom passengers
  - Real-time tree path updates and SHAP value recalculation
  - Inline label layout for compact, space-efficient design
  - Automatically clears when preset buttons are clicked
- **Tab-aware chat** – context-specific responses based on which model you're viewing
  - Decision Tree: Path explanations and survival statistics
  - XGBoost: SHAP explanations with typical passenger details (e.g., "female, 2nd class, age 30, fare £15")
- **Dark mode UI** – cohesive dark theme matching Streamlit's native chat interface
- **Natural language exploration** – ask questions like "what about women?" or "tell me about first class"
- **Keyword matching** – intelligent query interpretation for exploration patterns
- **4 preset patterns** – women, men, 1st class child, 3rd class male paths
- **Dynamic updates** – both visualizations update based on conversation or what-if controls
- **Scrollable chat history** – 300px scrollable container for conversation messages
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

**Three Versions Available:**

### Version 1: Chat-Based Explorer with Donut Charts (app_pie_version.py) - **Recommended**
- **Left Column (75%)**: Tab-based visualization in dark mode
  - **Decision Tree tab**: Interactive D3.js tree with donut chart nodes showing class distribution
    - Donut charts with 50% center hole (blue for died, green for survived)
    - **Proportional edge widths** show passenger flow (thicker = more passengers)
    - Edge thickness ranges from 1px (small groups) to 32px (root split)
    - Legend explains edge thickness visualization
    - Hover over any node to highlight the decision path from root (gold color)
    - Highlighted paths maintain proportional widths to show passenger flow
  - **XGBoost tab**: SHAP explanations with dual waterfall visualizations
    - Top row: Global feature importance (25%) + Alternative waterfall with floating bars (50%)
    - Alternative waterfall shows cumulative SHAP impact from base value to final prediction
    - Bottom: Standard waterfall chart (full width)
    - All charts display typical passenger characteristics being analyzed
- **Right Column (25%)**: What-If controls and interactive chat
  - **What-If Scenario**: Set Sex, Passenger Class, Age, Fare with inline controls
  - Real-time updates for both Decision Tree path and SHAP explanations
  - **Tab-aware chat** with context-specific responses:
    - Decision Tree: Shows path explanations and survival statistics
    - XGBoost: Explains typical passenger being analyzed (e.g., "female, 2nd class, age 30, fare £15")
- Ask questions like "what about women?" or "show me first class children"
- Visualizations update based on conversation or what-if controls
- 4 preset exploration patterns with detailed explanations
- Cohesive dark theme throughout for improved readability
- Performance metrics displayed in tab labels for quick comparison
- **Radio-style tabs** prevent visualization rendering issues

### Version 2: Chat-Based Explorer with Gradient Nodes (app.py)
- Alternative visualization style using gradient-filled circles instead of pie charts
- Same chat interface and functionality as Version 1
- Simpler visual style may be preferred for cleaner aesthetic

### Version 3: Multi-Page App (src/streamlit_app.py)

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

- **Chat Explorer**:
  - DecisionTreeClassifier (Tab 1): 4 features, 81% accuracy, 60% recall
  - XGBClassifier (Tab 2): 4 features, 80% accuracy, 72% recall with SHAP explanations
- **SHAP Page**: RandomForestClassifier with 5 features
- **Decision Tree Page**: DecisionTreeClassifier optimized to 4 features
- **Model Comparison**: Both DecisionTree and XGBoost
  - Reduced features for ~50% faster SHAP performance
  - Minimal accuracy loss (-0.1%)
  - Optimized for free-tier deployment constraints
  - All models use proper 80-20 train/test split

**UX / Data Viz Highlights**

- **Proportional edge widths** – visual encoding of passenger flow through decision tree (1-32px range)
- **Donut chart nodes** – cleaner visual showing class distribution with 50% center hole
- **What-If Scenario controls** – interactive sliders and radio buttons for real-time exploration
- **Tab-aware chat** – context-specific responses adapt to which model you're viewing
- **Alternative waterfall visualization** – floating bars show cumulative SHAP impact progression
- **Interactive visualizations** using D3.js for custom tree and SHAP charts
- **Hover path highlighting** – trace decision paths from root to any node in the tree
- **Conversational exploration** – chat interface with natural language queries
- **Dynamic updates** – visualizations respond to chat interactions and what-if controls
- **Typical passenger transparency** – clearly shows which specific passenger is being analyzed for SHAP
- **Inline control layout** – compact design with labels on same line as inputs
- **Human-readable labels** (decoded categorical features)
- **Dark mode design** with cohesive theming and smooth CSS transitions
- **Radio-style tabs** – eliminates visualization rendering bugs

---

## 🧱 Tech Stack

**Backend**
- **Python 3.12** (3.13.5 in Docker)
- **Streamlit** – multi-page app framework & UI with tabs
- **scikit-learn** – model training (RandomForest, DecisionTree)
- **XGBoost** – gradient boosting classifier for high-performance predictions
- **pandas**, **numpy** – data manipulation
- **SHAP** – model explanations (TreeExplainer for XGBoost)

**Visualization**
- **D3.js v7** – custom interactive Decision Tree + SHAP bar charts + waterfall diagrams
- **matplotlib** (3.8.4) – SHAP plot rendering (multi-page app)
- **seaborn** – data visualization & Titanic dataset
- **Custom HTML/CSS** – dark mode theming and responsive layouts

**Deployment**
- **Docker** – containerized deployment on Hugging Face Spaces
- **Git** – version control with dual remotes (GitHub + HuggingFace)

---

## 📂 Project Structure

```text
titanic/
├── app_pie_version.py              # Chat-based XAI Explorer (recommended, pie chart nodes)
├── app.py                          # Alternative: gradient node version
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

# Run the chat-based explorer (recommended - pie chart nodes)
streamlit run app_pie_version.py

# OR run the gradient node version
streamlit run app.py

# OR run the multi-page version
streamlit run src/streamlit_app.py
```

**Access the app:**
- **Chat Explorer (pie chart)**: http://localhost:8501 (app_pie_version.py) - **recommended**
- **Chat Explorer (gradient)**: http://localhost:8501 (app.py) - alternative style
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

**Donut Chart Nodes (app_pie_version.py - Default):**
- **Chosen as default**: Donut chart visualization provides clearer class distribution with reduced visual clutter
- **Key advantages**:
  - Immediate visual of class split at each node (e.g., 70% died / 30% survived)
  - 50% center hole reduces visual weight compared to filled pies
  - More information density without adding text labels
  - Aligns with common data viz patterns (donut = proportions)
  - Hover path highlighting shows decision flow from root to any node
- **Implementation details**:
  - Blue slice for died passengers, green slice for survived
  - Node size proportional to sample count (`Math.sqrt(samples) * 2`)
  - Inner radius at 50% of outer radius for donut effect
  - Gold color for hover highlighting (preset selections maintain proportional widths)
  - Edge labels offset upward on hover for better readability
  - Optimized label positioning (leaf labels on right, internal labels below)
- **Alternative**: Gradient node version (app.py) available for simpler aesthetic preference

**Proportional Edge Widths:**
- **Visual encoding**: Edge thickness represents number of passengers following that split
- **Scale**: `d3.scaleSqrt()` with range [1, 32] prevents extreme differences
- **Square root scale**: Balances visibility of small groups while showing hierarchy
- **Highlighted paths**: Maintain proportional widths to show passenger flow even when highlighted
- **Legend**: Clear explanation below tree title for user guidance

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