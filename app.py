"""
Explainable AI Explorer - Two-Column Layout with Chat Interface
Left: Visualization | Right: Chat Interface
"""

import streamlit as st
import streamlit.components.v1 as components
import json
from src.tree_data import get_tree_for_visualization

# Page configuration
st.set_page_config(
    page_title="Explainable AI Explorer - Titanic Demo",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# =============================================================================
# Initialize Session State
# =============================================================================

if 'chat_history' not in st.session_state:
    st.session_state.chat_history = [
        {
            "role": "assistant",
            "content": "Hi! I can help you explore survival patterns in the Titanic dataset. Try one of the suggestions below or ask your own question."
        }
    ]

if 'highlighted_path' not in st.session_state:
    st.session_state.highlighted_path = None

if 'current_preset' not in st.session_state:
    st.session_state.current_preset = None  # No default highlighting

# =============================================================================
# Load Data and Models
# =============================================================================

@st.cache_resource
def load_tree_data():
    """Load decision tree data with train/test split."""
    return get_tree_for_visualization(max_depth=4)

tree_data = load_tree_data()

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
        "response": "Women had a 74% survival rate. The 'women and children first' protocol was largely followed. Here's the typical path women took through the decision tree."
    },
    "man_path": {
        "label": "Shows men's path (low survival)",
        "values": {'sex': 1, 'pclass': 3, 'age': 30, 'fare': 10.0},
        "response": "Men had only a 19% survival rate (109 survived out of 577). Here's their typical path through the tree."
    },
    "first_class_child": {
        "label": "Shows 1st class child (best odds)",
        "values": {'sex': 0, 'pclass': 1, 'age': 5, 'fare': 50.0},
        "response": "First class children had the best odds. Children, especially in 1st and 2nd class, had high survival rates. Here's their path through the tree."
    },
    "third_class_male": {
        "label": "Shows 3rd class male (worst odds)",
        "values": {'sex': 1, 'pclass': 3, 'age': 40, 'fare': 8.0},
        "response": "Third class males had the worst odds (24% survival rate). They were located furthest from lifeboats and had limited access to the deck."
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

col1, col2 = st.columns([7, 3])

# =============================================================================
# LEFT COLUMN: Visualization (HTML Component)
# =============================================================================

with col1:
    # Get current preset for highlighting
    current_preset_key = st.session_state.current_preset
    current_preset_values = presets[current_preset_key]["values"] if current_preset_key else None

    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
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
                background: white;
            }}

            h1 {{
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
            }}

            .subtitle {{
                font-size: 18px;
                color: #666;
                margin-bottom: 20px;
            }}

            .description {{
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 30px;
                color: #333;
            }}

            .cards-container {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 30px;
            }}

            .card {{
                border-bottom: 4px solid #000;
                padding-bottom: 20px;
            }}

            .card h2 {{
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }}

            .card .type {{
                font-size: 14px;
                margin-bottom: 8px;
            }}

            .card .type strong {{
                font-weight: 700;
            }}

            .card .metrics {{
                font-size: 14px;
            }}

            .tree-section {{
                margin-top: 30px;
            }}

            .tree-section h3 {{
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
            }}

            #tree-viz {{
                width: 100%;
                height: 700px;
                background: #fafafa;
                border-radius: 8px;
                overflow: visible;
            }}

            .node circle {{
                stroke: #333;
                stroke-width: 2px;
                opacity: 0.4;
                transition: all 0.3s ease;
            }}

            .node circle.active {{
                opacity: 1;
                stroke-width: 3px;
                filter: drop-shadow(0 0 6px rgba(0,0,0,0.3));
            }}

            .node circle.final {{
                stroke-width: 5px;
                animation: pulse 1.5s ease-in-out infinite;
            }}

            @keyframes pulse {{
                0%, 100% {{ transform: scale(1); }}
                50% {{ transform: scale(1.1); }}
            }}

            .node text {{
                font-size: 12px;
                font-weight: 500;
                opacity: 0.4;
                transition: opacity 0.3s ease;
            }}

            .node text.active {{
                opacity: 1;
                font-weight: 700;
            }}

            .link {{
                fill: none;
                stroke: #999;
                stroke-width: 2px;
                opacity: 0.3;
                transition: all 0.3s ease;
            }}

            .link.active {{
                stroke-width: 4px;
                opacity: 1;
            }}

            .link.active.survived {{
                stroke: #2d6a4f;
            }}

            .link.active.died {{
                stroke: #c1121f;
            }}

            .edge-label {{
                font-size: 11px;
                fill: #666;
                font-weight: 600;
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
        <h1>Explainable AI Explorer</h1>
        <div class="subtitle">A Demo Using the Titanic Survival Dataset</div>
        <div class="description">
            If this were a real rescue scenario, XGBoost is better at the most important task - finding survivors -
            even though its overall accuracy is slightly lower. This is the accuracy-interpretability tradeoff:
            you gain prediction quality but lose the ability to easily explain why.
        </div>

        <div class="cards-container">
            <div class="card">
                <h2>DECISION TREE</h2>
                <div class="type"><strong>INTERPRETABLE</strong> Built to be understood</div>
                <div class="metrics">Accuracy: <strong>{dt_accuracy:.0%}</strong> | Finds survivors: <strong>{dt_recall:.0%}</strong></div>
            </div>
            <div class="card">
                <h2>XGBOOST</h2>
                <div class="type"><strong>EXPLAINABLE</strong> Needs explanation tools</div>
                <div class="metrics">Accuracy: <strong>{xgb_accuracy:.0%}</strong> | Finds survivors: <strong>{xgb_recall:.0%}</strong></div>
            </div>
        </div>

        <div class="tree-section">
            <h3>Decision Tree Classifier</h3>
            <div id="tree-viz"></div>
        </div>

        <script>
            const treeData = {tree_json};
            const presetValues = {'null' if current_preset_values is None else json.dumps(current_preset_values)};

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

            function updateTreeHighlight(path) {{
                const finalNodeId = path[path.length - 1];

                d3.selectAll('.node circle')
                    .classed('active', d => path.includes(d.data.id))
                    .classed('final', d => d.data.id === finalNodeId);

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
            }}

            function initTree() {{
                const container = document.getElementById('tree-viz');
                const width = container.offsetWidth;
                const height = 700;
                const margin = {{top: 20, right: 80, bottom: 20, left: 80}};

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
                    }})
                    .style("fill", d => {{
                        const isLeftChild = d.source.data.children && d.source.data.children[0] === d.target.data;
                        return isLeftChild ? "#0066cc" : "#cc6600";
                    }});

                const nodes = svg.selectAll(".node")
                    .data(treeLayout.descendants())
                    .enter()
                    .append("g")
                    .attr("class", "node")
                    .attr("transform", d => `translate(${{d.y}},${{d.x}})`);

                nodes.append("circle")
                    .attr("r", d => Math.sqrt(d.data.samples) * 2)
                    .style("fill", d => {{
                        const prob = d.data.probability;
                        if (prob > 0.5) {{
                            const intensity = (prob - 0.5) * 2;
                            return d3.interpolateGreens(0.3 + intensity * 0.5);
                        }} else {{
                            const intensity = (0.5 - prob) * 2;
                            return d3.interpolateBlues(0.3 + intensity * 0.5);
                        }}
                    }})
                    .on("mouseover", function(event, d) {{
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", Math.sqrt(d.data.samples) * 2.5);

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
                    .on("mouseout", function(event, d) {{
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", Math.sqrt(d.data.samples) * 2);

                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    }});

                nodes.append("text")
                    .attr("dy", d => d.data.is_leaf ? -15 : 5)
                    .attr("x", d => d.data.is_leaf ? 0 : 12)
                    .attr("text-anchor", d => d.data.is_leaf ? "middle" : "start")
                    .text(d => {{
                        if (d.data.is_leaf) {{
                            return d.data.predicted_class === 1 ? "✓ Survived" : "✗ Died";
                        }} else {{
                            return d.data.feature || "";
                        }}
                    }})
                    .style("fill", d => d.data.is_leaf ? (d.data.predicted_class === 1 ? "#2d6a4f" : "#1e3a8a") : "#333");

                // Initial highlight only if presetValues exists
                if (presetValues) {{
                    const initialPath = tracePath(treeData, presetValues);
                    updateTreeHighlight(initialPath);
                }}
            }}

            window.addEventListener('load', () => {{
                initTree();
            }});
        </script>
    </body>
    </html>
    """

    components.html(html_code, height=1100, scrolling=False)

# =============================================================================
# RIGHT COLUMN: Chat Interface (Streamlit)
# =============================================================================

with col2:
    # Add custom CSS for viewport-based chat layout
    st.markdown("""
    <style>
    /* Make chat history container use available viewport height */
    .chat-history-container {
        max-height: calc(100vh - 400px);
        min-height: 200px;
        overflow-y: auto;
        margin-bottom: 20px;
    }

    /* Ensure chat input stays visible at bottom */
    [data-testid="stChatInput"] {
        position: sticky;
        bottom: 0;
        background: var(--background-color);
        padding: 10px 0;
        z-index: 100;
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown("### 💬 Chat")

    # Display chat history in a container with viewport-based height
    num_messages = len(st.session_state.chat_history)

    # Use viewport-based height that adapts to browser window
    # calc(100vh - 400px) accounts for: header, title, suggestions, input, and padding
    if num_messages > 3:
        # For longer conversations, use scrollable container
        chat_container = st.container()
        with chat_container:
            for message in st.session_state.chat_history:
                with st.chat_message(message["role"]):
                    st.markdown(message["content"])
    else:
        # For initial messages, display naturally without scrolling
        for message in st.session_state.chat_history:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

    st.markdown("---")

    # Suggestions section (always visible)
    st.markdown("**Or try one of these to get started**")

    # Suggestion buttons
    for preset_key, preset_info in presets.items():
        if st.button(preset_info["label"], key=f"btn_{preset_key}", use_container_width=True):
            # Add user message to chat
            st.session_state.chat_history.append({
                "role": "user",
                "content": preset_info["label"]
            })
            # Add bot response to chat
            st.session_state.chat_history.append({
                "role": "assistant",
                "content": preset_info["response"]
            })
            # Update highlighted path
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

        # Update highlighted path if matched
        if matched_preset:
            st.session_state.current_preset = matched_preset

        st.rerun()
