"""
Explainable AI Explorer
Two-Column Layout with Chat Interface
Left: Visualization | Right: Chat Interface

This is the default version with pie chart nodes for the Decision Tree visualization.
Each node shows the class distribution (died vs survived) as a pie chart with
blue (died) and green (survived) slices for clearer visualization of splits.

For an alternative gradient node style, see app.py
"""

import streamlit as st
import streamlit.components.v1 as components
import json
import shap
import matplotlib.pyplot as plt
from xgboost import XGBClassifier
from src.tree_data import get_tree_for_visualization

# Page configuration
st.set_page_config(
    page_title="Explainable AI Explorer",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Reduce main content padding and customize font sizes
st.markdown("""
<style>
    /* Set base font-size for entire app */
    html, body, .stApp {
        font-size: 14px !important;
    }

    /* Reduce padding around main content block */
    .block-container {
        padding-top: 4rem;
        padding-bottom: 2rem;
        padding-left: 2rem;
        padding-right: 2rem;
    }

    /* Custom heading sizes */
    h1 {
        font-size: 24px !important;
        padding: 0 !important;
    }

    h3 {
        font-size: 20px !important;
    }

    /* Style radio buttons to look like tabs */
    div[data-testid="stRadio"] > div {
        gap: 0px;
    }

    div[data-testid="stRadio"] label {
        background-color: #262730;
        padding: 12px 24px;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        margin-right: 4px;
    }

    div[data-testid="stRadio"] label:hover {
        background-color: #333;
    }

    div[data-testid="stRadio"] input:checked + div {
        background-color: #0e1117 !important;
        border-bottom: 3px solid #4CAF50;
    }
</style>
""", unsafe_allow_html=True)

# =============================================================================
# Initialize Session State
# =============================================================================

if 'chat_history' not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "assistant",
            "content": "Ask a question — I'll navigate the models for you\n\nAsk about any group or pattern, and I'll highlight the tree, surface cohort stats, or compare the models' reasoning."
        }
    ]

if 'highlighted_path' not in st.session_state:
    st.session_state.highlighted_path = None

if 'current_preset' not in st.session_state:
    st.session_state.current_preset = None  # No default - shows global view initially

if 'selected_tab' not in st.session_state:
    st.session_state.selected_tab = "DECISION TREE  Accuracy: 81% | Recall: 60%"  # Track which tab is active

# =============================================================================
# Load Data and Models
# =============================================================================

@st.cache_resource
def load_tree_data():
    """Load decision tree data with train/test split."""
    return get_tree_for_visualization(max_depth=4)

@st.cache_resource
def load_xgboost_and_shap():
    """Train XGBoost model and create SHAP explainer."""
    tree_data = get_tree_for_visualization(max_depth=4)
    X_train = tree_data['X_train']
    y_train = tree_data['y_train']
    X_test = tree_data['X_test']

    # Train XGBoost
    xgb_model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    xgb_model.fit(X_train, y_train)

    # Create SHAP explainer
    explainer = shap.TreeExplainer(xgb_model)

    # Compute SHAP values for a sample
    sample_size = min(200, len(X_test))
    X_sample = X_test.sample(sample_size, random_state=42)
    shap_values = explainer.shap_values(X_sample)

    return xgb_model, explainer, shap_values, X_sample

tree_data = load_tree_data()
xgb_model, shap_explainer, shap_values, X_sample = load_xgboost_and_shap()

# Calculate metrics
dt_accuracy = tree_data['model'].score(tree_data['X_test'], tree_data['y_test'])
dt_recall = 0.60  # Placeholder for "Finds survivors" metric
xgb_accuracy = 0.80  # Placeholder
xgb_recall = 0.72  # Placeholder

# Prepare tree data as JSON
tree_json = json.dumps(tree_data['tree'])

# Preset scenarios
presets = {
    "woman_path": {
        "label": "Shows women's path (high survival)",
        "values": {'sex': 0, 'pclass': 2, 'age': 30, 'fare': 15.0},
        "response": "Women had a 74% survival rate. The 'women and children first' protocol was largely followed. Here's the typical path women took through the decision tree.",
        "xgb_response": "Women had a 74% survival rate. For the SHAP analysis, I'm using a **typical woman passenger**: female, 2nd class, age 30, fare £15. The XGBoost tab shows which features pushed this passenger toward survival.",
        "passenger_desc": "Typical woman: Female, 2nd class, age 30, fare £15"
    },
    "man_path": {
        "label": "Shows men's path (low survival)",
        "values": {'sex': 1, 'pclass': 3, 'age': 30, 'fare': 10.0},
        "response": "Men had only a 19% survival rate (109 survived out of 577). Here's their typical path through the tree.",
        "xgb_response": "Men had only a 19% survival rate (109 survived out of 577). For the SHAP analysis, I'm using a **typical man passenger**: male, 3rd class, age 30, fare £10. The XGBoost tab shows which features pushed this passenger toward death.",
        "passenger_desc": "Typical man: Male, 3rd class, age 30, fare £10"
    },
    "first_class_child": {
        "label": "Shows 1st class child (best odds)",
        "values": {'sex': 0, 'pclass': 1, 'age': 5, 'fare': 50.0},
        "response": "First class children had the best odds. Children, especially in 1st and 2nd class, had high survival rates. Here's their path through the tree.",
        "xgb_response": "First class children had the best odds. For the SHAP analysis, I'm using a **1st class child**: female, 1st class, age 5, fare £50. The XGBoost tab shows which features strongly pushed this passenger toward survival.",
        "passenger_desc": "1st class child: Female, 1st class, age 5, fare £50"
    },
    "third_class_male": {
        "label": "Shows 3rd class male (worst odds)",
        "values": {'sex': 1, 'pclass': 3, 'age': 40, 'fare': 8.0},
        "response": "Third class males had the worst odds (24% survival rate). They were located furthest from lifeboats and had limited access to the deck.",
        "xgb_response": "Third class males had the worst odds (24% survival rate). For the SHAP analysis, I'm using a **3rd class male**: male, 3rd class, age 40, fare £8. The XGBoost tab shows which features strongly pushed this passenger toward death.",
        "passenger_desc": "3rd class male: Male, 3rd class, age 40, fare £8"
    }
}

# =============================================================================
# Keyword Matching Function
# =============================================================================

def match_query(query):
    """Match user query to a preset path and response."""
    query_lower = query.lower()

    # Women/female
    if any(word in query_lower for word in ['women', 'woman', 'female', 'lady', 'ladies']):
        return "woman_path", presets["woman_path"]["response"]

    # Men/male
    elif any(word in query_lower for word in ['men', 'man', 'male', 'gentleman']):
        return "man_path", presets["man_path"]["response"]

    # First class
    elif any(word in query_lower for word in ['first class', '1st class', 'upper class', 'wealthy']):
        if any(word in query_lower for word in ['child', 'children', 'kid']):
            return "first_class_child", presets["first_class_child"]["response"]
        else:
            return "woman_path", "First class passengers had a 63% survival rate (136 survived out of 216). Wealth and proximity to lifeboats mattered. Here's a typical first class passenger path."

    # Third class
    elif any(word in query_lower for word in ['third class', '3rd class', 'poor', 'lower class']):
        if any(word in query_lower for word in ['male', 'men', 'man']):
            return "third_class_male", presets["third_class_male"]["response"]
        else:
            return "man_path", "Third class passengers had the worst odds (119 survived out of 491, 24% survival rate). They were located furthest from lifeboats."

    # Children
    elif any(word in query_lower for word in ['child', 'children', 'kid', 'kids', 'young']):
        return "first_class_child", presets["first_class_child"]["response"]

    # Default
    else:
        return None, "I can help you explore survival patterns. Try asking about: women, men, social class (1st/2nd/3rd), children, or combinations like '3rd class males'."

# =============================================================================
# Two-Column Layout
# =============================================================================

col1, col2 = st.columns([3, 1])

# =============================================================================
# LEFT COLUMN: Visualization (HTML Component)
# =============================================================================

with col1:
    # Native Streamlit header and subtitle
    st.markdown("# Explainable AI Explorer", unsafe_allow_html=True)
    st.markdown('<p style="font-size: 20px; color: #a0a0a0; margin-bottom: 20px;">Interactively compare how two models reason about the same prediction task</p>', unsafe_allow_html=True)

    # Get current preset for highlighting
    current_preset_key = st.session_state.current_preset
    current_preset_values = presets[current_preset_key]["values"] if current_preset_key else None

    # Prepare preset values for JavaScript (null keyword, not string)
    preset_values_js = "null" if current_preset_values is None else json.dumps(current_preset_values)

    # Tab selector with radio buttons (styled horizontally)
    st.session_state.selected_tab = st.radio(
        "Select Model",
        ["DECISION TREE  Accuracy: 81% | Recall: 60%", "XGBOOST  Accuracy: 80% | Recall: 72%"],
        index=0 if st.session_state.selected_tab in ["Decision Tree", "DECISION TREE  Accuracy: 81% | Recall: 60%"] else 1,
        horizontal=True,
        label_visibility="collapsed",
        key="tab_selector"
    )

    # D3 Tree HTML - Include a hash of preset to make content unique when it changes
    import hashlib
    preset_hash = hashlib.md5(str(current_preset_key).encode()).hexdigest()[:8]

    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="preset-hash" content="{preset_hash}">
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}

            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                padding: 20px;
                background: #0e1117;
                color: #fafafa;
            }}

            h3 {{
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #fafafa;
            }}

            #tree-viz {{
                width: 100%;
                height: 700px;
                background: #0e1117;
                border-radius: 8px;
                overflow: visible;
            }}

            /* PIE CHART STYLES */
            .pie-chart path {{
                opacity: 0.4;
                transition: all 0.3s ease;
            }}

            .pie-chart.active path {{
                opacity: 1;
                filter: drop-shadow(0 0 6px rgba(255,255,255,0.3));
            }}

            /* Hover highlighting - temporary highlight on hover */
            .pie-chart.hover-active path {{
                opacity: 0.85;
                filter: drop-shadow(0 0 4px rgba(255,215,0,0.4));
            }}

            .pie-chart.final path {{
                filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
            }}

            .pie-chart.final {{
                animation: pulse 1.5s ease-in-out infinite;
            }}

            @keyframes pulse {{
                0%, 100% {{ transform: scale(1); }}
                50% {{ transform: scale(1.1); }}
            }}

            .node text {{
                font-size: 12px;
                font-weight: 500;
                fill: #fafafa;  /* White text for all labels */
                opacity: 0.4;
                transition: opacity 0.3s ease;
            }}

            .node text.active {{
                opacity: 1;
                font-weight: 700;
                fill: #fafafa;
            }}

            /* Hover highlighting for text */
            .node text.hover-active {{
                opacity: 0.85;
                fill: #ffd700;  /* Gold color for hover */
            }}

            .link {{
                fill: none;
                stroke: #666;
                stroke-width: 2px;
                opacity: 0.3;
                transition: all 0.3s ease;
            }}

            .link.active {{
                stroke-width: 4px;
                opacity: 1;
            }}

            .link.active.survived {{
                stroke: #52b788;
            }}

            .link.active.died {{
                stroke: #e76f51;
            }}

            /* Hover highlighting for links */
            .link.hover-active {{
                stroke: #ffd700;  /* Gold color for hover */
                stroke-width: 3px;
                opacity: 0.8;
            }}

            .edge-label {{
                font-size: 11px;
                fill: #fafafa;  /* White text for edge labels */
                font-weight: 600;
                opacity: 0.4;
                transition: all 0.3s ease;
            }}

            .edge-label.active {{
                opacity: 1;
                font-weight: 700;
            }}

            .edge-label.hover-active {{
                opacity: 0.85;
                fill: #ffd700;  /* Gold color for hover */
                transform: translateY(-16px);  /* Move up on hover for better readability */
            }}

            .tooltip {{
                position: absolute;
                padding: 12px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                border-radius: 6px;
                pointer-events: none;
                font-size: 13px;
                line-height: 1.5;
                max-width: 250px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                opacity: 0;
                transition: opacity 0.2s;
            }}
        </style>
    </head>
    <body>
        <h3>Decision Tree Classifier</h3>
        <div id="tree-container-{preset_hash}">
            <div id="tree-viz"></div>
        </div>

        <script>
            const treeData = {tree_json};
            const presetValues = {preset_values_js};

            let d3Tree = null;

            function tracePath(node, inputValues) {{
                const path = [];
                let current = node;

                while (current) {{
                    path.push(current.id);

                    if (current.is_leaf) {{
                        break;
                    }}

                    const feature = current.feature;
                    const threshold = current.threshold;

                    if (inputValues[feature] <= threshold) {{
                        current = current.children ? current.children[0] : null;
                    }} else {{
                        current = current.children ? current.children[1] : null;
                    }}
                }}

                return path;
            }}

            // Get path from root to a specific node (for hover highlighting)
            function getPathToNode(targetNode) {{
                const path = [];
                let current = targetNode;

                // Walk up the tree from target to root
                while (current) {{
                    path.unshift(current.data.id);  // Add to beginning of array
                    current = current.parent;
                }}

                return path;
            }}

            function updateTreeHighlight(path) {{
                const finalNodeId = path[path.length - 1];

                // Update pie chart highlighting (select the .pie-chart groups)
                d3.selectAll('.pie-chart')
                    .classed('active', function() {{
                        const nodeData = d3.select(this.parentNode).datum();
                        return path.includes(nodeData.data.id);
                    }})
                    .classed('final', function() {{
                        const nodeData = d3.select(this.parentNode).datum();
                        return nodeData.data.id === finalNodeId;
                    }});

                d3.selectAll('.node text')
                    .classed('active', d => path.includes(d.data.id));

                d3.selectAll('.link')
                    .classed('active', d => path.includes(d.source.data.id) && path.includes(d.target.data.id))
                    .classed('survived', d => {{
                        if (path.includes(d.source.data.id) && path.includes(d.target.data.id)) {{
                            const finalNode = d3Tree.descendants().find(n => n.data.id === finalNodeId);
                            return finalNode && finalNode.data.predicted_class === 1;
                        }}
                        return false;
                    }})
                    .classed('died', d => {{
                        if (path.includes(d.source.data.id) && path.includes(d.target.data.id)) {{
                            const finalNode = d3Tree.descendants().find(n => n.data.id === finalNodeId);
                            return finalNode && finalNode.data.predicted_class === 0;
                        }}
                        return false;
                    }});

                // Update edge labels to match link highlighting
                d3.selectAll('.edge-label')
                    .classed('active', d => path.includes(d.source.data.id) && path.includes(d.target.data.id));
            }}

            function initTree() {{
                const container = document.getElementById('tree-viz');
                const width = container.offsetWidth;
                const height = 700;
                const margin = {{top: 20, right: 150, bottom: 20, left: 80}};  // Increased right margin for labels

                // Clear existing content to prevent duplicate renders
                d3.select("#tree-viz").html("");
                d3.selectAll(".tooltip").remove();

                const svg = d3.select("#tree-viz")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

                const tree = d3.tree()
                    .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

                const root = d3.hierarchy(treeData, d => d.children);
                const treeLayout = tree(root);
                d3Tree = treeLayout;

                const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

                svg.selectAll(".link")
                    .data(treeLayout.links())
                    .enter()
                    .append("path")
                    .attr("class", "link")
                    .attr("d", d3.linkHorizontal()
                        .x(d => d.y)
                        .y(d => d.x));

                svg.selectAll(".edge-label")
                    .data(treeLayout.links())
                    .enter()
                    .append("text")
                    .attr("class", "edge-label")
                    .attr("x", d => (d.source.y + d.target.y) / 2 + 15)
                    .attr("y", d => (d.source.x + d.target.x) / 2)
                    .attr("text-anchor", "middle")
                    .attr("dy", d => {{
                        const isLeftChild = d.target.x < d.source.x;
                        return isLeftChild ? -5 : 12;
                    }})
                    .text(d => {{
                        const isLeftChild = d.source.data.children && d.source.data.children[0] === d.target.data;
                        return isLeftChild ? (d.source.data.left_label || '') : (d.source.data.right_label || '');
                    }});
                    // Removed inline .style("fill") so CSS styling applies

                const nodes = svg.selectAll(".node")
                    .data(treeLayout.descendants())
                    .enter()
                    .append("g")
                    .attr("class", "node")
                    .attr("transform", d => `translate(${{d.y}},${{d.x}})`);

                // PIE CHART NODES: Show class distribution as pie charts
                // Create pie generator
                const pie = d3.pie()
                    .value(d => d.value)
                    .sort(null);

                // Add pie chart to each node
                nodes.each(function(d) {{
                    const nodeGroup = d3.select(this);
                    const radius = Math.sqrt(d.data.samples) * 2;

                    // Create arc generator for this node's radius
                    const arc = d3.arc()
                        .innerRadius(0)
                        .outerRadius(radius);

                    // Prepare data for pie chart: [died, survived]
                    const pieData = pie([
                        {{ label: 'died', value: d.data.class_0, color: '#5b8db8' }},  // Blue for died
                        {{ label: 'survived', value: d.data.class_1, color: '#52b788' }}  // Green for survived
                    ]);

                    // Create a group for the pie chart
                    const pieGroup = nodeGroup.append("g")
                        .attr("class", "pie-chart");

                    // Append pie slices
                    pieGroup.selectAll("path")
                        .data(pieData)
                        .enter()
                        .append("path")
                        .attr("d", arc)
                        .attr("fill", d => d.data.color)
                        .attr("stroke", "#888")
                        .attr("stroke-width", 1);

                    // Add invisible circle for hover target (easier to hover)
                    const hoverCircle = nodeGroup.append("circle")
                        .attr("r", radius)
                        .attr("fill", "transparent")
                        .attr("pointer-events", "all");

                    // Hover effects on the entire node
                    hoverCircle.on("mouseover", function(event) {{
                        // Scale up the pie chart
                        pieGroup.transition()
                            .duration(200)
                            .attr("transform", "scale(1.25)");

                        // Highlight the path from root to this node
                        const hoverPath = getPathToNode(d);
                        d3.selectAll('.pie-chart')
                            .classed('hover-active', function() {{
                                const nodeData = d3.select(this.parentNode).datum();
                                return hoverPath.includes(nodeData.data.id);
                            }});

                        d3.selectAll('.node text')
                            .classed('hover-active', function() {{
                                const nodeData = d3.select(this.parentNode).datum();
                                return hoverPath.includes(nodeData.data.id);
                            }});

                        d3.selectAll('.link')
                            .classed('hover-active', function() {{
                                const linkData = d3.select(this).datum();
                                return hoverPath.includes(linkData.source.data.id) &&
                                       hoverPath.includes(linkData.target.data.id);
                            }});

                        d3.selectAll('.edge-label')
                            .classed('hover-active', function() {{
                                const linkData = d3.select(this).datum();
                                return hoverPath.includes(linkData.source.data.id) &&
                                       hoverPath.includes(linkData.target.data.id);
                            }});

                        const survivalRate = (d.data.probability * 100).toFixed(1);
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltip.html(`
                            <strong>${{d.data.split_rule}}</strong><br/>
                            Samples: ${{d.data.samples}}<br/>
                            Died: ${{d.data.class_0}} | Survived: ${{d.data.class_1}}<br/>
                            Survival Rate: ${{survivalRate}}%
                        `)
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    }})
                    .on("mouseout", function(event) {{
                        // Scale back to normal
                        pieGroup.transition()
                            .duration(200)
                            .attr("transform", "scale(1)");

                        // Remove hover highlighting
                        d3.selectAll('.pie-chart').classed('hover-active', false);
                        d3.selectAll('.node text').classed('hover-active', false);
                        d3.selectAll('.link').classed('hover-active', false);
                        d3.selectAll('.edge-label').classed('hover-active', false);

                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    }});
                }});

                // Labels: leaf nodes on right, internal nodes below
                nodes.append("text")
                    .attr("dy", d => {{
                        const radius = Math.sqrt(d.data.samples) * 2;
                        // Leaf nodes: center vertically, Internal nodes: below circle
                        return d.data.is_leaf ? 5 : radius + 15;
                    }})
                    .attr("x", d => {{
                        const radius = Math.sqrt(d.data.samples) * 2;
                        // Leaf nodes: to the right, Internal nodes: centered
                        return d.data.is_leaf ? radius + 10 : 0;
                    }})
                    .attr("text-anchor", d => d.data.is_leaf ? "start" : "middle")
                    .text(d => {{
                        if (d.data.is_leaf) {{
                            return d.data.predicted_class === 1 ? "✓ Survived" : "✗ Died";
                        }} else {{
                            return d.data.feature || "";
                        }}
                    }})
                    .style("fill", "#fafafa");  // White text for all labels

                // Initial highlight only if presetValues exists
                if (presetValues) {{
                    const initialPath = tracePath(treeData, presetValues);
                    updateTreeHighlight(initialPath);
                }}
            }}

            // Initialize tree with retry logic for tab switching
            function tryInitTree(attempts = 0) {{
                const container = document.getElementById('tree-viz');
                if (container && container.offsetWidth > 0) {{
                    // Container is visible and has dimensions, safe to initialize
                    initTree();
                }} else if (attempts < 10) {{
                    // Container not ready, retry after a short delay
                    setTimeout(() => tryInitTree(attempts + 1), 100);
                }} else {{
                    console.error('Failed to initialize tree after 10 attempts');
                }}
            }}

            // Start initialization
            if (document.readyState === 'loading') {{
                document.addEventListener('DOMContentLoaded', () => tryInitTree());
            }} else {{
                tryInitTree();
            }}
        </script>
    </body>
    </html>
    """

    # Render content based on selected tab
    if "DECISION TREE" in st.session_state.selected_tab:
        components.html(html_code, height=800, scrolling=False)

    else:  # XGBoost tab
        st.markdown("### 🔍 Making XGBoost Interpretable with SHAP")
        st.markdown("""
        While XGBoost is more accurate, it's harder to understand *why* it makes predictions.
        **SHAP (SHapley Additive exPlanations)** helps explain XGBoost's decisions.
        """)

        # Calculate mean absolute SHAP values for each feature (needed for both charts)
        import numpy as np
        mean_shap_values = np.abs(shap_values).mean(axis=0)
        feature_names = X_sample.columns.tolist()

        # Create data for global chart
        shap_data = []
        for i, (feat, val) in enumerate(zip(feature_names, mean_shap_values)):
            shap_data.append({"feature": feat, "value": float(val)})

        # Sort by value descending
        shap_data_sorted = sorted(shap_data, key=lambda x: x['value'], reverse=True)
        shap_json = json.dumps(shap_data_sorted)

        # Two-column layout for global charts (1:2 ratio = 25% global, 50% waterfall)
        col_global_left, col_global_right = st.columns([1, 2])

        with col_global_left:
            st.markdown("#### 📈 Global Feature Importance")
            st.caption("Which features matter most across all predictions")

            # D3 Global Feature Importance Chart
            waterfall_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://d3js.org/d3.v7.min.js"></script>
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        background: #0e1117;
                        color: #fafafa;
                        padding: 20px;
                    }}
                    .bar {{
                        fill: #52b788;
                        opacity: 0.8;
                    }}
                    .bar:hover {{
                        opacity: 1;
                    }}
                    .axis text {{
                        fill: #fafafa;
                        font-size: 12px;
                    }}
                    .axis line, .axis path {{
                        stroke: #666;
                    }}
                </style>
            </head>
            <body>
                <div id="waterfall"></div>
                <script>
                    const data = {shap_json};

                    const margin = {{top: 20, right: 30, bottom: 60, left: 80}};
                    const width = 280 - margin.left - margin.right;
                    const height = 300 - margin.top - margin.bottom;

                    const svg = d3.select("#waterfall")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

                    // Create scales
                    const y = d3.scaleBand()
                        .domain(data.map(d => d.feature))
                        .range([0, height])
                        .padding(0.2);

                    const x = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.value)])
                        .range([0, width]);

                    // Add bars
                    svg.selectAll(".bar")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("class", "bar")
                        .attr("y", d => y(d.feature))
                        .attr("x", 0)
                        .attr("height", y.bandwidth())
                        .attr("width", d => x(d.value));

                    // Add value labels
                    svg.selectAll(".label")
                        .data(data)
                        .enter()
                        .append("text")
                        .attr("class", "label")
                        .attr("y", d => y(d.feature) + y.bandwidth() / 2)
                        .attr("x", d => x(d.value) + 5)
                        .attr("dy", "0.35em")
                        .attr("fill", "#fafafa")
                        .attr("font-size", "11px")
                        .text(d => d.value.toFixed(3));

                    // Add Y axis
                    svg.append("g")
                        .attr("class", "axis")
                        .call(d3.axisLeft(y));

                    // Add X axis
                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", `translate(0,${{height}})`)
                        .call(d3.axisBottom(x).ticks(5));

                    // Add X axis label
                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", height + 40)
                        .attr("fill", "#fafafa")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "11px")
                        .text("Mean |SHAP value|");
                </script>
            </body>
            </html>
            """

            components.html(waterfall_html, height=400, scrolling=False)

        with col_global_right:
            st.markdown("#### 💧 Individual Prediction Explanation")

            # Prepare data for alternative waterfall using a sample preset
            # Use woman's path as default for demonstration
            demo_preset_key = current_preset_key if current_preset_key else "woman_path"
            demo_preset_values = presets[demo_preset_key]["values"]
            demo_preset_info = presets[demo_preset_key]
            demo_passenger_desc = presets[demo_preset_key]["passenger_desc"]

            if current_preset_key:
                st.markdown(f"Showing XGBoost's reasoning for: **{demo_preset_info['label']}**")
            else:
                st.markdown(f"Showing XGBoost's reasoning for a typical woman")
            st.caption(f"Analyzing: {demo_passenger_desc}")

            # Create input for this passenger
            import pandas as pd
            x_input_demo = pd.DataFrame([demo_preset_values])

            # Get SHAP values for this passenger
            shap_values_demo = shap_explainer.shap_values(x_input_demo)[0]
            base_value_demo = shap_explainer.expected_value
            final_prediction_demo = float(base_value_demo + np.sum(shap_values_demo))

            # Prepare waterfall data
            waterfall_data_demo = []
            cumulative_demo = base_value_demo

            for i, (feat, shap_val) in enumerate(zip(x_input_demo.columns, shap_values_demo)):
                waterfall_data_demo.append({
                    "feature": feat,
                    "value": float(shap_val),
                    "start": float(cumulative_demo),
                    "end": float(cumulative_demo + shap_val),
                    "feature_value": float(x_input_demo.iloc[0][feat])
                })
                cumulative_demo += shap_val

            # Sort by absolute SHAP value
            waterfall_data_sorted_demo = sorted(waterfall_data_demo, key=lambda x: abs(x['value']), reverse=True)

            # Prepare data for alternative waterfall (use same data, but need cumulative positions)
            alternative_waterfall_data_demo = []
            cumulative_alt_demo = base_value_demo

            # Add base value as starting point
            alternative_waterfall_data_demo.append({
                "feature": "Base Value",
                "value": 0,
                "start": float(base_value_demo),
                "end": float(base_value_demo),
                "cumulative": float(base_value_demo),
                "feature_value": ""
            })

            # Add each feature contribution
            for item in waterfall_data_sorted_demo:
                cumulative_alt_demo += item['value']
                alternative_waterfall_data_demo.append({
                    "feature": item['feature'],
                    "value": float(item['value']),
                    "start": float(cumulative_alt_demo - item['value']),
                    "end": float(cumulative_alt_demo),
                    "cumulative": float(cumulative_alt_demo),
                    "feature_value": float(item['feature_value'])
                })

            alternative_waterfall_json_demo = json.dumps(alternative_waterfall_data_demo)

            # D3 Alternative Waterfall Chart with Floating Bars (Horizontal)
            alternative_waterfall_html_demo = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <script src="https://d3js.org/d3.v7.min.js"></script>
                    <style>
                        body {{
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            background: #0e1117;
                            color: #fafafa;
                            padding: 20px;
                        }}
                        .bar-positive {{
                            fill: #52b788;
                            stroke: #6fcf97;
                            stroke-width: 1.5;
                        }}
                        .bar-negative {{
                            fill: #e76f51;
                            stroke: #f4a261;
                            stroke-width: 1.5;
                        }}
                        .bar-base {{
                            fill: #666;
                            stroke: #888;
                            stroke-width: 1.5;
                        }}
                        .connector-line {{
                            stroke: #888;
                            stroke-width: 1.5;
                            stroke-dasharray: 3,3;
                        }}
                        .axis text {{
                            fill: #fafafa;
                            font-size: 10px;
                        }}
                        .axis line, .axis path {{
                            stroke: #666;
                        }}
                        .value-label {{
                            fill: #fafafa;
                            font-size: 9px;
                            font-weight: bold;
                        }}
                    </style>
                </head>
                <body>
                    <div id="alternative-waterfall-global"></div>
                    <script>
                        const data = {alternative_waterfall_json_demo};
                        const baseValue = {base_value_demo};
                        const finalValue = {final_prediction_demo};

                        const margin = {{top: 20, right: 60, bottom: 50, left: 100}};
                        const width = 650 - margin.left - margin.right;
                        const height = 300 - margin.top - margin.bottom;

                        const svg = d3.select("#alternative-waterfall-global")
                            .append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                            .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

                        // Title with base value and final prediction
                        svg.append("text")
                            .attr("x", width / 2)
                            .attr("y", -5)
                            .attr("text-anchor", "middle")
                            .attr("fill", "#fafafa")
                            .attr("font-size", "11px")
                            .attr("font-weight", "bold")
                            .text(`Base Value: ${{baseValue.toFixed(3)}} → Final Prediction: ${{finalValue.toFixed(3)}}`);

                        // Create scales - HORIZONTAL orientation
                        const y = d3.scaleBand()
                            .domain(data.map((d, i) => i))
                            .range([0, height])
                            .padding(0.3);

                        const allValues = data.flatMap(d => [d.start, d.end]);
                        const xExtent = d3.extent(allValues);
                        const x = d3.scaleLinear()
                            .domain(xExtent)
                            .range([0, width])
                            .nice();

                        // Add X axis
                        svg.append("g")
                            .attr("class", "axis")
                            .attr("transform", `translate(0,${{height}})`)
                            .call(d3.axisBottom(x).ticks(5));

                        // Add X axis label
                        svg.append("text")
                            .attr("x", width / 2)
                            .attr("y", height + 38)
                            .attr("fill", "#fafafa")
                            .attr("text-anchor", "middle")
                            .attr("font-size", "11px")
                            .text("Cumulative SHAP");

                        // Draw connector lines between bars (horizontal)
                        for (let i = 0; i < data.length - 1; i++) {{
                            const current = data[i];
                            const next = data[i + 1];

                            svg.append("line")
                                .attr("class", "connector-line")
                                .attr("x1", x(current.end))
                                .attr("y1", y(i) + y.bandwidth())
                                .attr("x2", x(next.start))
                                .attr("y2", y(i + 1));
                        }}

                        // Draw floating bars (horizontal)
                        svg.selectAll(".bar")
                            .data(data)
                            .enter()
                            .append("rect")
                            .attr("class", (d, i) => {{
                                if (i === 0) return "bar-base";
                                return d.value >= 0 ? "bar-positive" : "bar-negative";
                            }})
                            .attr("y", (d, i) => y(i))
                            .attr("x", d => x(Math.min(d.start, d.end)))
                            .attr("height", y.bandwidth())
                            .attr("width", d => Math.abs(x(d.start) - x(d.end)) || 3)
                            .attr("rx", 2);

                        // Add value labels on bars (skip base value, smaller font)
                        svg.selectAll(".value-label")
                            .data(data.filter((d, i) => i > 0))
                            .enter()
                            .append("text")
                            .attr("class", "value-label")
                            .attr("y", (d, i) => y(i + 1) + y.bandwidth() / 2)
                            .attr("x", d => x(d.end) + (d.value >= 0 ? 5 : -5))
                            .attr("dy", "0.35em")
                            .attr("text-anchor", d => d.value >= 0 ? "start" : "end")
                            .attr("fill", d => d.value >= 0 ? "#52b788" : "#e76f51")
                            .text(d => (d.value >= 0 ? "+" : "") + d.value.toFixed(2));

                        // Add Y axis with feature labels
                        svg.append("g")
                            .attr("class", "axis")
                            .call(d3.axisLeft(y).tickFormat((d, i) => {{
                                const item = data[i];
                                if (i === 0) return "Base";
                                return item.feature_value !== "" ? `${{item.feature}}=${{item.feature_value}}` : item.feature;
                            }}));
                    </script>
                </body>
                </html>
            """

            components.html(alternative_waterfall_html_demo, height=400, scrolling=False)

        st.markdown("---")

        # Individual Prediction Waterfall (based on current preset) - Standard View
        st.markdown("#### 💧 Standard Waterfall Chart")

        # Use woman's path as default for XGBoost tab if nothing selected
        xgb_preset_key = current_preset_key if current_preset_key else "woman_path"
        xgb_preset_values = presets[xgb_preset_key]["values"]
        xgb_preset_info = presets[xgb_preset_key]
        xgb_passenger_desc = presets[xgb_preset_key]["passenger_desc"]

        if current_preset_key:
            st.markdown(f"Showing XGBoost's reasoning for: **{xgb_preset_info['label']}**")
            st.caption(f"Analyzing: {xgb_passenger_desc}")
        else:
            st.markdown(f"Showing XGBoost's reasoning for a typical woman")
            st.caption(f"Analyzing: {xgb_passenger_desc} • Click suggestions to explore other cohorts")

        # Create input for this passenger
        import pandas as pd
        x_input = pd.DataFrame([xgb_preset_values])

        # Get SHAP values for this passenger
        import numpy as np
        shap_values_individual = shap_explainer.shap_values(x_input)[0]
        base_value = shap_explainer.expected_value
        final_prediction = float(base_value + np.sum(shap_values_individual))

        # Prepare waterfall data
        waterfall_data = []
        cumulative = base_value

        for i, (feat, shap_val) in enumerate(zip(x_input.columns, shap_values_individual)):
            waterfall_data.append({
                "feature": feat,
                "value": float(shap_val),
                "start": float(cumulative),
                "end": float(cumulative + shap_val),
                "feature_value": float(x_input.iloc[0][feat])
            })
            cumulative += shap_val

        # Sort by absolute SHAP value
        waterfall_data_sorted = sorted(waterfall_data, key=lambda x: abs(x['value']), reverse=True)
        waterfall_json_individual = json.dumps(waterfall_data_sorted)

        # D3 Waterfall Chart for Individual
        individual_waterfall_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://d3js.org/d3.v7.min.js"></script>
                <style>
                    body {{
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        background: #0e1117;
                        color: #fafafa;
                        padding: 20px;
                    }}
                    .bar-positive {{
                        fill: #52b788;
                    }}
                    .bar-negative {{
                        fill: #e76f51;
                    }}
                    .axis text {{
                        fill: #fafafa;
                        font-size: 12px;
                    }}
                    .axis line, .axis path {{
                        stroke: #666;
                    }}
                    .baseline {{
                        stroke: #666;
                        stroke-width: 2;
                        stroke-dasharray: 5,5;
                    }}
                </style>
            </head>
            <body>
                <div id="individual-waterfall"></div>
                <script>
                    const data = {waterfall_json_individual};
                    const baseValue = {base_value};
                    const finalValue = {final_prediction};

                    const margin = {{top: 40, right: 30, bottom: 60, left: 120}};
                    const width = 700 - margin.left - margin.right;
                    const height = 350 - margin.top - margin.bottom;

                    const svg = d3.select("#individual-waterfall")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

                    // Title
                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", -20)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#fafafa")
                        .attr("font-size", "14px")
                        .attr("font-weight", "bold")
                        .text(`Base Value: ${{baseValue.toFixed(3)}} → Final Prediction: ${{finalValue.toFixed(3)}}`);

                    // Create scales
                    const y = d3.scaleBand()
                        .domain(data.map(d => d.feature))
                        .range([0, height])
                        .padding(0.2);

                    const allValues = data.flatMap(d => [d.start, d.end]);
                    const xExtent = d3.extent(allValues);
                    const x = d3.scaleLinear()
                        .domain(xExtent)
                        .range([0, width]);

                    // Add baseline at x=0
                    svg.append("line")
                        .attr("class", "baseline")
                        .attr("x1", x(0))
                        .attr("x2", x(0))
                        .attr("y1", 0)
                        .attr("y2", height);

                    // Add bars
                    svg.selectAll(".bar")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("class", d => d.value >= 0 ? "bar-positive" : "bar-negative")
                        .attr("y", d => y(d.feature))
                        .attr("x", d => x(Math.min(d.start, d.end)))
                        .attr("height", y.bandwidth())
                        .attr("width", d => Math.abs(x(d.end) - x(d.start)));

                    // Add value labels
                    svg.selectAll(".label")
                        .data(data)
                        .enter()
                        .append("text")
                        .attr("y", d => y(d.feature) + y.bandwidth() / 2)
                        .attr("x", d => x(d.end) + (d.value >= 0 ? 5 : -5))
                        .attr("dy", "0.35em")
                        .attr("fill", "#fafafa")
                        .attr("font-size", "11px")
                        .attr("text-anchor", d => d.value >= 0 ? "start" : "end")
                        .text(d => d.value.toFixed(3));

                    // Add Y axis with feature labels
                    svg.append("g")
                        .attr("class", "axis")
                        .call(d3.axisLeft(y).tickFormat(d => {{
                            const item = data.find(x => x.feature === d);
                            return `${{d}} = ${{item.feature_value}}`;
                        }}));

                    // Add X axis
                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", `translate(0,${{height}})`)
                        .call(d3.axisBottom(x).ticks(5));

                    // Add X axis label
                    svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", height + 45)
                        .attr("fill", "#fafafa")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "12px")
                        .text("SHAP Value (Impact on Prediction)");
                </script>
            </body>
            </html>
        """

        components.html(individual_waterfall_html, height=500, scrolling=False)

        # Explanation
        st.markdown("""
        **How to read this chart:**
        - 🟢 **Green bars** push prediction toward survival (positive SHAP values)
        - 🔴 **Red bars** push prediction toward death (negative SHAP values)
        - **Longer bars** = stronger impact on the prediction
        - **Base value** = model's average prediction across all passengers
        - **Final prediction** = base value + sum of all SHAP values
        """)

# =============================================================================
# RIGHT COLUMN: Chat Interface (Streamlit)
# =============================================================================

with col2:
    # Description paragraph at top of chat area - changes based on selected tab
    if "DECISION TREE" in st.session_state.selected_tab:
        description = """<p style="font-size: 14px; color: #d0d0d0; line-height: 1.6; margin-bottom: 20px;">
        Explore how the <strong>Decision Tree</strong> makes transparent, rule-based predictions.<br>
        Use the chat to highlight decision paths and explore how different passenger characteristics lead to survival or death predictions.
        </p>"""
    else:  # XGBoost tab
        description = """<p style="font-size: 14px; color: #d0d0d0; line-height: 1.6; margin-bottom: 20px;">
        Explore how <strong>XGBoost</strong> makes predictions and what drives them using SHAP explanations.<br>
        Use the chat to see which features push typical passengers toward survival or death, and understand the model's reasoning through interactive visualizations.
        </p>"""

    st.markdown(description, unsafe_allow_html=True)

    st.markdown("### 💬 Chat")

    # Scrollable chat history container
    chat_container = st.container(height=300)
    with chat_container:
        for message in st.session_state.chat_history:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

    st.markdown("**Or try one of these to get started**")

    # Suggestion buttons
    for preset_key, preset_info in presets.items():
        if st.button(preset_info["label"], key=f"btn_{preset_key}", use_container_width=True):
            # Add user message to chat
            st.session_state.chat_history.append({
                "role": "user",
                "content": preset_info["label"]
            })

            # Add bot response based on which tab is active
            if "XGBOOST" in st.session_state.selected_tab and "xgb_response" in preset_info:
                # Show XGBoost-specific explanation with typical passenger
                response_text = preset_info["xgb_response"]
            else:
                # Show Decision Tree explanation
                response_text = preset_info["response"]

            st.session_state.chat_history.append({
                "role": "assistant",
                "content": response_text
            })
            # Update current preset (highlights tree and updates XGBoost explanations)
            st.session_state.current_preset = preset_key
            st.rerun()

    # Chat input at the bottom
    user_input = st.chat_input("What would you like to know?", key="chat_input")

    # Handle text input
    if user_input:
        # Add user message to chat
        st.session_state.chat_history.append({
            "role": "user",
            "content": user_input
        })

        # Match query and get response
        matched_preset, response = match_query(user_input)

        # Add bot response to chat
        st.session_state.chat_history.append({
            "role": "assistant",
            "content": response
        })

        # Update current preset if matched (highlights tree and updates XGBoost explanations)
        if matched_preset:
            st.session_state.current_preset = matched_preset

        st.rerun()
