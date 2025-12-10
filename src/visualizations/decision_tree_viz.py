"""
Decision Tree Visualization Module

Generates D3.js-based interactive decision tree visualizations with donut chart nodes.
"""

import hashlib
import os


def get_base_styles():
    """Load shared CSS styles for visualizations."""
    styles_path = os.path.join(os.path.dirname(__file__), 'styles.css')
    with open(styles_path, 'r') as f:
        return f.read()


def get_decision_tree_html(tree_json, preset_values_js, preset_hash=None, passenger_desc=None, tutorial_highlight_mode=None):
    """
    Generate HTML for interactive decision tree visualization with D3.js.

    This function creates a complete HTML page with embedded D3.js code that renders
    an interactive decision tree. The tree features:
    - Donut chart nodes showing class distribution (died vs survived)
    - Proportional edge widths representing passenger flow
    - Hover effects with gold highlighting showing paths from root to node
    - Dynamic path highlighting based on preset values
    - Tutorial mode with gold path highlighting

    Args:
        tree_json (str): JSON string representation of the tree structure
        preset_values_js (str): JavaScript representation of preset values (e.g., "{{sex: 0, pclass: 1}}")
                                or "null" if no preset is selected
        preset_hash (str, optional): Hash string for uniqueness. If None, generates from preset_values_js
        passenger_desc (str, optional): Human-readable passenger description (reserved for future use)
        tutorial_highlight_mode (str, optional): Tutorial highlighting mode ('first_split', 'full_path', or None)

    Returns:
        str: Complete HTML document as a string with embedded CSS and JavaScript

    Example:
        >>> tree_json = '{{"id": 0, "feature": "sex", ...}}'
        >>> preset_values = '{{"sex": 0, "pclass": 2, "age": 30, "fare": 20}}'
        >>> html = get_decision_tree_html(tree_json, preset_values)
        >>> # Use with streamlit: components.html(html, height=750)
    """
    # Generate preset hash if not provided
    if preset_hash is None:
        hash_input = preset_values_js if preset_values_js != "null" else ""
        preset_hash = hashlib.md5(hash_input.encode()).hexdigest()[:8]

    # Note: passenger_desc parameter reserved for future use (e.g., displaying in title)
    # Currently not used in the HTML template but included for forward compatibility

    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="preset-hash" content="{preset_hash}">
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
            {get_base_styles()}

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
                stroke-linecap: round;
                stroke-opacity: 0.6;
                transition: all 0.3s ease;
            }}

            .link.active {{
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

            /* Tutorial highlighting styles - gold/yellow color */
            .pie-chart.tutorial-highlight path {{
                opacity: 1;
                filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
            }}

            .link.tutorial-highlight {{
                stroke: #ffd700 !important;  /* Gold color */
                stroke-width: 8px !important;
                opacity: 1 !important;
            }}

            .node text.tutorial-highlight {{
                opacity: 1;
                font-weight: 700;
                fill: #ffd700;  /* Gold color */
            }}

            .edge-label.tutorial-highlight {{
                opacity: 1;
                font-weight: 700;
                fill: #ffd700;  /* Gold color */
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
        <div style="font-size: 12px; color: #aaa; margin-bottom: 10px;">
            <strong>Edge thickness</strong> represents the number of passengers following that path
        </div>
        <div id="tree-container-{preset_hash}">
            <div id="tree-viz"></div>
        </div>

        <script>
            const treeData = {tree_json};
            const presetValues = {preset_values_js};
            const tutorialMode = "{tutorial_highlight_mode if tutorial_highlight_mode else ""}";

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

            function applyTutorialHighlight() {{
                if (!tutorialMode || tutorialMode === "") {{
                    return;  // No tutorial mode active
                }}

                // Tutorial passenger is always: Female (sex=0), 1st class (pclass=1), age=30, fare=84
                const tutorialValues = {{sex: 0, pclass: 1, age: 30, fare: 84}};
                const fullPath = tracePath(treeData, tutorialValues);

                if (tutorialMode === "first_split") {{
                    // Highlight only root node and first edge (to female branch)
                    const highlightPath = [fullPath[0], fullPath[1]];  // Root + first child

                    // Highlight nodes
                    d3.selectAll('.pie-chart')
                        .classed('tutorial-highlight', function() {{
                            const nodeData = d3.select(this.parentNode).datum();
                            return highlightPath.includes(nodeData.data.id);
                        }});

                    d3.selectAll('.node text')
                        .classed('tutorial-highlight', d => highlightPath.includes(d.data.id));

                    // Highlight only the first edge
                    d3.selectAll('.link')
                        .classed('tutorial-highlight', d => {{
                            return highlightPath.includes(d.source.data.id) && highlightPath.includes(d.target.data.id);
                        }});

                    d3.selectAll('.edge-label')
                        .classed('tutorial-highlight', d => {{
                            return highlightPath.includes(d.source.data.id) && highlightPath.includes(d.target.data.id);
                        }});

                }} else if (tutorialMode === "full_path") {{
                    // Highlight complete path from root to final leaf
                    d3.selectAll('.pie-chart')
                        .classed('tutorial-highlight', function() {{
                            const nodeData = d3.select(this.parentNode).datum();
                            return fullPath.includes(nodeData.data.id);
                        }});

                    d3.selectAll('.node text')
                        .classed('tutorial-highlight', d => fullPath.includes(d.data.id));

                    d3.selectAll('.link')
                        .classed('tutorial-highlight', d => {{
                            return fullPath.includes(d.source.data.id) && fullPath.includes(d.target.data.id);
                        }});

                    d3.selectAll('.edge-label')
                        .classed('tutorial-highlight', d => {{
                            return fullPath.includes(d.source.data.id) && fullPath.includes(d.target.data.id);
                        }});
                }}
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

                // Add stroke width scale based on sample counts
                const maxSamples = d3.max(treeLayout.descendants(), d => d.data.samples);
                const strokeScale = d3.scaleSqrt()
                    .domain([0, maxSamples])
                    .range([1, 32]);

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
                        .y(d => d.x))
                    .attr("stroke-width", d => strokeScale(d.target.data.samples))
                    .attr("stroke-linecap", "round")
                    .attr("stroke-opacity", 0.6);

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

                    // Create arc generator for this node's radius (donut style)
                    const arc = d3.arc()
                        .innerRadius(radius * 0.5)
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

                // Tutorial highlighting takes priority over preset highlighting
                if (tutorialMode && tutorialMode !== "") {{
                    applyTutorialHighlight();
                }} else if (presetValues) {{
                    // Initial highlight only if presetValues exists and not in tutorial mode
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

    return html_code
