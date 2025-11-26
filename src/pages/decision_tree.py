"""
Decision Tree Visualization Page
Interactive tree visualization for Titanic survival predictions.
"""

import streamlit as st
import streamlit.components.v1 as components
import json
from tree_data import get_tree_for_visualization

st.set_page_config(page_title="Decision Tree Visualization", layout="wide")

st.title("🌳 Decision Tree: Titanic Survival Prediction")
st.markdown("""
This interactive visualization shows how a Decision Tree classifier makes predictions
about Titanic passenger survival. Hover over nodes to see split rules and sample distributions.
""")

# Sidebar controls
with st.sidebar:
    st.header("Tree Settings")
    max_depth = st.slider(
        "Maximum Tree Depth",
        min_value=2,
        max_value=6,
        value=4,
        help="Deeper trees are more complex but may overfit"
    )

    st.markdown("---")
    st.header("🔮 What-If Scenario")
    st.markdown("Set passenger characteristics to see their path through the tree:")

    # What-if inputs
    input_sex = st.radio(
        "Sex",
        options=["Female", "Male"],
        index=0,
        help="Passenger's sex"
    )

    input_pclass = st.selectbox(
        "Passenger Class",
        options=[1, 2, 3],
        index=2,
        help="1st, 2nd, or 3rd class ticket"
    )

    input_age = st.slider(
        "Age",
        min_value=0,
        max_value=80,
        value=30,
        help="Passenger's age in years"
    )

    input_fare = st.slider(
        "Fare",
        min_value=0.0,
        max_value=500.0,
        value=15.0,
        step=1.0,
        help="Ticket fare in dollars"
    )

    st.markdown("---")
    st.markdown("""
    **How to read the tree:**
    - 🔵 Blue: More likely to die
    - 🟢 Green: More likely to survive
    - Node size: Number of samples
    - **Highlighted path**: Your scenario
    """)


# Load tree data (cached)
@st.cache_resource
def load_tree_data(depth):
    return get_tree_for_visualization(max_depth=depth)


data = load_tree_data(max_depth)


# Trace path through tree for what-if scenario
def trace_path(tree_dict, input_values):
    """
    Trace the path through the tree based on input values.
    Returns list of node IDs representing the path.
    """
    path = []
    current_node = tree_dict

    while current_node:
        path.append(current_node['id'])

        # If leaf node, stop
        if current_node['is_leaf']:
            break

        # Get feature and threshold
        feature = current_node['feature']
        threshold = current_node['threshold']

        # Decide which child to follow
        if input_values[feature] <= threshold:
            # Go left
            current_node = current_node['children'][0] if 'children' in current_node else None
        else:
            # Go right
            current_node = current_node['children'][1] if 'children' in current_node else None

    return path


# Convert user inputs to model format
input_values = {
    'sex': 0 if input_sex == "Female" else 1,
    'pclass': input_pclass,
    'age': input_age,
    'fare': input_fare
}

# Get prediction path
prediction_path = trace_path(data['tree'], input_values)
prediction = data['model'].predict([list(input_values.values())])[0]
prediction_proba = data['model'].predict_proba([list(input_values.values())])[0]

# Prepare data for D3
tree_json = json.dumps(data['tree'])
path_json = json.dumps(prediction_path)

# Display model stats and prediction
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Training Samples", data['X'].shape[0])
with col2:
    st.metric("Features Used", len(data['feature_names']))
with col3:
    accuracy = data['model'].score(data['X'], data['y'])
    st.metric("Training Accuracy", f"{accuracy:.1%}")
with col4:
    prediction_label = "Survived ✓" if prediction == 1 else "Died ✗"
    prediction_color = "normal" if prediction == 1 else "inverse"
    st.metric(
        "What-If Prediction",
        prediction_label,
        f"{prediction_proba[prediction]:.1%} confidence",
        delta_color=prediction_color
    )

st.markdown("---")


# ============================================================================
# VISUALIZATION METHOD 1: D3.js (Interactive, custom)
# To switch to Plotly, comment out this section and uncomment the next one
# ============================================================================

def render_d3_tree(tree_json, path_json):
    """Render interactive D3 tree visualization with highlighted path."""

    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
            body {{
                margin: 0;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }}
            .node circle {{
                cursor: pointer;
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
                background: white;
                padding: 2px 4px;
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
            }}
        </style>
    </head>
    <body>
        <div id="tree"></div>
        <script>
            const treeData = {tree_json};
            const predictionPath = {path_json};

            const width = 1200;
            const height = 800;
            const margin = {{top: 20, right: 120, bottom: 20, left: 120}};

            // Helper function to check if node is on path
            function isOnPath(nodeId) {{
                return predictionPath.includes(nodeId);
            }}

            // Get final node (leaf) in path
            const finalNodeId = predictionPath[predictionPath.length - 1];

            const svg = d3.select("#tree")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${{margin.left}},${{margin.top}})`);

            const tree = d3.tree()
                .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

            const root = d3.hierarchy(treeData, d => d.children);
            const treeLayout = tree(root);

            // Tooltip
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            // Links
            svg.selectAll(".link")
                .data(treeLayout.links())
                .enter()
                .append("path")
                .attr("class", d => {{
                    const isActive = isOnPath(d.source.data.id) && isOnPath(d.target.data.id);
                    let classes = "link";
                    if (isActive) {{
                        classes += " active";
                        // Determine if path leads to survival or death
                        const finalNode = treeLayout.descendants().find(n => n.data.id === finalNodeId);
                        if (finalNode && finalNode.data.predicted_class === 1) {{
                            classes += " survived";
                        }} else {{
                            classes += " died";
                        }}
                    }}
                    return classes;
                }})
                .attr("d", d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x));

            // Edge labels
            svg.selectAll(".edge-label")
                .data(treeLayout.links())
                .enter()
                .append("text")
                .attr("class", "edge-label")
                .attr("x", d => (d.source.y + d.target.y) / 2 + 15)
                .attr("y", d => (d.source.x + d.target.x) / 2)
                .attr("text-anchor", "middle")
                .attr("dy", d => {{
                    // Position label above or below the link based on whether it's left or right child
                    const isLeftChild = d.target.x < d.source.x;
                    return isLeftChild ? -5 : 12;
                }})
                .text(d => {{
                    // Determine if this is left or right child
                    const isLeftChild = d.source.data.children && d.source.data.children[0] === d.target.data;
                    return isLeftChild ? (d.source.data.left_label || '') : (d.source.data.right_label || '');
                }})
                .style("fill", d => {{
                    const isLeftChild = d.source.data.children && d.source.data.children[0] === d.target.data;
                    return isLeftChild ? "#0066cc" : "#cc6600";
                }});

            // Nodes
            const nodes = svg.selectAll(".node")
                .data(treeLayout.descendants())
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${{d.y}},${{d.x}})`);

            // Node circles
            nodes.append("circle")
                .attr("r", d => Math.sqrt(d.data.samples) * 2)
                .attr("class", d => {{
                    let classes = "";
                    if (isOnPath(d.data.id)) {{
                        classes += "active ";
                    }}
                    if (d.data.id === finalNodeId) {{
                        classes += "final";
                    }}
                    return classes;
                }})
                .style("fill", d => {{
                    const prob = d.data.probability;
                    if (prob > 0.5) {{
                        // Green for survival
                        const intensity = (prob - 0.5) * 2;
                        return d3.interpolateGreens(0.3 + intensity * 0.5);
                    }} else {{
                        // Blue for death
                        const intensity = (0.5 - prob) * 2;
                        return d3.interpolateBlues(0.3 + intensity * 0.5);
                    }}
                }})
                .on("mouseover", function(event, d) {{
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", Math.sqrt(d.data.samples) * 2.5)
                        .style("stroke", "#ff6b6b")
                        .style("stroke-width", "3px");

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
                        .attr("r", Math.sqrt(d.data.samples) * 2)
                        .style("stroke", "#333")
                        .style("stroke-width", "2px");

                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                }});

            // Node labels (feature names or leaf predictions)
            nodes.append("text")
                .attr("class", d => isOnPath(d.data.id) ? "active" : "")
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
        </script>
    </body>
    </html>
    """

    components.html(html_code, height=850, scrolling=False)


render_d3_tree(tree_json, path_json)


# ============================================================================
# VISUALIZATION METHOD 2: Plotly (Fallback option)
# To switch to Plotly, uncomment this section and comment out the D3 section above
# ============================================================================

# import plotly.graph_objects as go
#
# def flatten_tree_for_plotly(node, x=0, y=0, level=0, positions=None, edges=None):
#     """Convert hierarchical tree to flat structure for Plotly."""
#     if positions is None:
#         positions = []
#         edges = []
#
#     positions.append({
#         'x': x,
#         'y': y,
#         'text': node['split_rule'],
#         'samples': node['samples'],
#         'probability': node['probability'],
#         'class_0': node['class_0'],
#         'class_1': node['class_1']
#     })
#
#     if 'children' in node:
#         child_spacing = 2 ** (4 - level)
#         for i, child in enumerate(node['children']):
#             child_x = x + (i - 0.5) * child_spacing
#             child_y = y - 1
#             edges.append({'x0': x, 'y0': y, 'x1': child_x, 'y1': child_y})
#             flatten_tree_for_plotly(child, child_x, child_y, level + 1, positions, edges)
#
#     return positions, edges
#
#
# def render_plotly_tree(tree_dict):
#     """Render interactive Plotly tree visualization."""
#     positions, edges = flatten_tree_for_plotly(tree_dict)
#
#     # Create edge traces
#     edge_trace = go.Scatter(
#         x=sum([[e['x0'], e['x1'], None] for e in edges], []),
#         y=sum([[e['y0'], e['y1'], None] for e in edges], []),
#         mode='lines',
#         line=dict(color='#999', width=2),
#         hoverinfo='none'
#     )
#
#     # Create node trace
#     node_trace = go.Scatter(
#         x=[p['x'] for p in positions],
#         y=[p['y'] for p in positions],
#         mode='markers+text',
#         marker=dict(
#             size=[p['samples'] / 3 for p in positions],
#             color=[p['probability'] for p in positions],
#             colorscale='RdYlGn',
#             showscale=True,
#             colorbar=dict(title="Survival Prob"),
#             line=dict(color='#333', width=2)
#         ),
#         text=[p['text'] for p in positions],
#         textposition="top center",
#         hovertemplate='<b>%{text}</b><br>' +
#                       'Samples: %{customdata[0]}<br>' +
#                       'Died: %{customdata[1]} | Survived: %{customdata[2]}<br>' +
#                       'Survival Rate: %{customdata[3]:.1%}<extra></extra>',
#         customdata=[[p['samples'], p['class_0'], p['class_1'], p['probability']] for p in positions]
#     )
#
#     fig = go.Figure(data=[edge_trace, node_trace])
#     fig.update_layout(
#         showlegend=False,
#         hovermode='closest',
#         margin=dict(b=0, l=0, r=0, t=0),
#         xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
#         yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
#         height=700
#     )
#
#     st.plotly_chart(fig, use_container_width=True)
#
#
# render_plotly_tree(data['tree'])


# ============================================================================
# Additional Information
# ============================================================================

st.markdown("---")

with st.expander("📊 View Feature Importance"):
    import pandas as pd

    feature_importance = pd.DataFrame({
        'Feature': data['feature_names'],
        'Importance': data['model'].feature_importances_
    }).sort_values('Importance', ascending=False)

    st.bar_chart(feature_importance.set_index('Feature'))

with st.expander("ℹ️ About Decision Trees"):
    st.markdown("""
    **How Decision Trees Work:**

    1. **Splitting**: At each node, the tree finds the feature and threshold that best separates survivors from non-survivors
    2. **Recursion**: This process repeats for each branch until a stopping criterion is met (max depth, min samples, etc.)
    3. **Prediction**: New passengers follow the tree's path based on their features until reaching a leaf node

    **Reading the Visualization:**
    - **Node color**: Blue = likely to die, Green = likely to survive
    - **Node size**: Proportional to number of training samples in that node
    - **Split rules**: Shown at internal nodes (e.g., "sex ≤ 0.5" means female)
    - **Leaf nodes**: Show final prediction (Survived or Died)
    """)
