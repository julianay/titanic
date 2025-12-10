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

### 💬 **Interactive XAI Explorer** (app.py)
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
  - **Smart fare updates**: Automatically adjusts to historical average when class changes (1st: £84, 2nd: £20, 3rd: £13)
  - **Contextual hints**: Shows warning when fare/class combinations are historically unusual
  - Real-time tree path updates and SHAP value recalculation
  - Inline label layout for compact, space-efficient design
  - Automatically clears when preset buttons are clicked
  - Independent controls allow counterfactual exploration (e.g., "what if 3rd class paid 1st class prices?")
- **Tab-aware chat** – context-specific responses based on which model you're viewing
  - Decision Tree: Path explanations and survival statistics
  - XGBoost: SHAP explanations with typical passenger details (e.g., "female, 2nd class, age 30, fare £15")
- **Dark mode UI** – cohesive dark theme matching Streamlit's native chat interface
- **Natural language exploration** – flexible query parsing with intelligent cohort matching
  - Type queries like "show me a 40-year-old woman in 1st class" or "what about a young boy in 3rd"
  - Priority-based matching handles overlapping criteria (e.g., child > class > gender)
  - Helpful fallback messages for unparseable queries
- **4 preset patterns** – quick buttons for common cohorts (women, men, 1st class child, 3rd class male)
- **Dynamic updates** – both visualizations update immediately based on conversation or what-if controls
- **Fixed double-click bug** – unified state management ensures preset buttons work on first click
- **Scrollable chat history** – 300px scrollable container for conversation messages
- **Optimized layout** – reduced padding for maximum content visibility

> This project demonstrates **XAI (Explainable AI)** techniques with a focus on intuitive UX, interactive data visualization, and conversational exploration.

---

## 🌐 Live Demo

- **Hugging Face Space**: https://huggingface.co/spaces/bigpixel/titanic

---

## 🔍 What this app shows

### Interactive XAI Explorer (app.py)

**Left Column (75%)**: Tab-based visualization in dark mode
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

**Right Column (25%)**: What-If controls and interactive chat
- **What-If Scenario**: Set Sex, Passenger Class, Age, Fare with inline controls
  - Smart fare updates: Auto-adjusts to historical average when class changes
  - Contextual hints: Warns about unusual fare/class combinations
- Real-time updates for both Decision Tree path and SHAP explanations
- **Tab-aware chat** with natural language parsing:
  - Decision Tree: Shows path explanations and survival statistics
  - XGBoost: Explains typical passenger being analyzed (e.g., "female, 2nd class, age 30, fare £15")
  - Parse flexible queries: "show me a 40-year-old woman in 1st class" or "what about a young boy in 3rd"
  - Priority-based cohort matching for intelligent interpretation
- Visualizations update immediately based on conversation or what-if controls
- 4 preset exploration buttons for common cohorts
- Unified state management ensures buttons work on first click (fixed double-click bug)
- Cohesive dark theme throughout for improved readability
- Performance metrics displayed in tab labels for quick comparison
- **Radio-style tabs** prevent visualization rendering issues

**Models**
- DecisionTreeClassifier (Tab 1): 4 features, 81% accuracy, 60% recall
- XGBClassifier (Tab 2): 4 features, 80% accuracy, 72% recall with SHAP explanations
- Reduced to 4 core features (`sex`, `pclass`, `age`, `fare`) for ~50% faster SHAP performance
- Minimal accuracy loss (-0.1%)
- Optimized for free-tier deployment constraints
- Proper 80-20 train/test split

**UX / Data Viz Highlights**
- **Proportional edge widths** – visual encoding of passenger flow through decision tree (1-32px range)
- **Donut chart nodes** – cleaner visual showing class distribution with 50% center hole
- **Smart What-If controls** – auto-updates fare to historical averages when class changes, shows contextual hints for unusual combinations
- **Natural language parsing** – flexible query interpretation with priority-based cohort matching
- **Unified state management** – single update mechanism eliminates double-click bug, ensures consistent behavior
- **Tab-aware chat** – context-specific responses adapt to which model you're viewing
- **Alternative waterfall visualization** – floating bars show cumulative SHAP impact progression
- **Interactive visualizations** using D3.js for custom tree and SHAP charts
- **Hover path highlighting** – trace decision paths from root to any node in the tree
- **Conversational exploration** – chat interface with natural language queries and helpful fallback messages
- **Dynamic updates** – visualizations respond immediately to chat interactions and what-if controls
- **Typical passenger transparency** – clearly shows which specific passenger is being analyzed for SHAP
- **Inline control layout** – compact design with labels on same line as inputs
- **Human-readable labels** (decoded categorical features)
- **Dark mode design** with cohesive theming and smooth CSS transitions
- **Radio-style tabs** – eliminates visualization rendering bugs
- **Modular code architecture** – reusable components in `src/visualizations/` and `src/chat/` packages

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
├── app.py                          # Main XAI Explorer application (625 lines)
├── src/
│   ├── __init__.py                 # Source package initialization
│   ├── tree_data.py                # Tree data extraction module (visualization-agnostic)
│   ├── chat/                       # Modular chat system components
│   │   ├── __init__.py             # Chat package initialization
│   │   ├── cohort_patterns.py      # Cohort matching patterns and priorities
│   │   └── response_generator.py   # Natural language parsing and response generation
│   └── visualizations/             # Modular visualization components
│       ├── __init__.py             # Visualization package exports
│       ├── decision_tree_viz.py    # D3.js decision tree HTML generation
│       └── shap_viz.py             # D3.js SHAP visualization HTML generation (3 functions)
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

# Run the application
streamlit run app.py
```

**Access the app:**
- Open http://localhost:8501 in your browser

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

**Donut Chart Nodes (app.py - Default):**
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

**Potential Features:**
- [ ] Upgrade to LLM-based chat (OpenAI/Anthropic) for true conversational AI
- [ ] Add more sophisticated pattern matching
- [ ] Support compound queries ("show me wealthy women")
- [ ] Add voice input capability
- [ ] Export conversation history
- [ ] Add model performance metrics (ROC curve, precision-recall)
- [ ] Add downloadable prediction reports
- [ ] Add data exploration page with EDA visualizations
- [ ] Batch prediction mode (upload CSV of passengers)

---

## 🤝 Contributing

This is a portfolio demo project. Feel free to fork and adapt for your own use!

---

## 📄 License

This project is open source and available for educational and portfolio purposes.

---

**Built with Claude Code** | [View on GitHub](https://github.com/julianay/titanic) | [Live Demo](https://huggingface.co/spaces/bigpixel/titanic)